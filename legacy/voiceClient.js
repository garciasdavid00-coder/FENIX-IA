/* ============================================================
   Fenix IA - Cliente de voz en tiempo real (Gemini Live API)
   ------------------------------------------------------------
   Conexión por WebSocket DIRECTA del navegador a Google usando
   un token efímero (generado en el backend en POST /api/voice-token).
   La API key nunca sale del servidor.

   Uso:
     const voz = new VoiceClient({
       callbacks: {
         onEstado: (estado) => {...},   // 'conectando' | 'escuchando' | 'procesando' | 'iaHablando' | 'desconectado' | 'error'
         onError:  (mensaje) => {...},
         onTexto:  (texto) => {...}     // transcripción de lo que dice la IA (opcional)
       }
     });
     document.getElementById('btnMic').onclick = () => voz.toggle();
     // al salir de la página: voz.desconectar();
   ============================================================ */

// URL del WebSocket de Gemini Live API usando token efímero (v1alpha, constrained).
const WS_BASE = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained';

// Modelo de Live (debe coincidir con el del token).
const MODELO_LIVE = 'gemini-3.1-flash-live-preview';

// El procesador de audio corre en un hilo aparte (AudioWorklet).
// Convierte el micrófono (48k/44.1k) a PCM 16 kHz y lo manda por lotes.
const CODIGO_WORKLET = `
class FenixAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._sr = sampleRate;            // frecuencia real del micrófono (48000, 44100...)
    this._ratio = this._sr / 16000;   // cuántos samples del mic equivalen a 1 sample a 16 kHz
    this._acum = new Float32Array(2048); // acumulador temporal del downsampling
    this._n = 0;
    this._salida = new Float32Array(1600); // lote de salida (~100 ms a 16 kHz)
    this._outN = 0;
  }
  process(inputs) {
    const entrada = inputs[0];
    if (!entrada || !entrada[0]) return true;
    const canal = entrada[0];
    for (let i = 0; i < canal.length; i++) {
      this._acum[this._n++] = canal[i];
      // Cuando juntamos "ratio" samples, emitimos 1 muestra a 16 kHz (el promedio).
      if (this._n >= this._ratio) {
        let s = 0;
        for (let j = 0; j < this._n; j++) s += this._acum[j];
        this._salida[this._outN++] = s / this._n;
        this._n = 0;
        // Mandamos el lote completo al hilo principal (reduce mensajes: ~10/s).
        if (this._outN >= this._salida.length) {
          this.port.postMessage(this._salida.slice(0, this._outN));
          this._outN = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('fenix-audio-processor', FenixAudioProcessor);
`;

let workletUrlCache = null;

// Registra el AudioWorklet desde una cadena (Blob URL) sin archivo extra.
async function obtenerWorkletUrl() {
  if (!workletUrlCache) {
    const blob = new Blob([CODIGO_WORKLET], { type: 'application/javascript' });
    workletUrlCache = URL.createObjectURL(blob);
  }
  return workletUrlCache;
}

// Convierte muestras float (-1..1) a PCM 16-bit little-endian en base64.
function floatToPcm16Base64(muestras) {
  const pcm = new Int16Array(muestras.length);
  for (let i = 0; i < muestras.length; i++) {
    const s = Math.max(-1, Math.min(1, muestras[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  // El buffer es little-endian nativo → lo convertimos a base64 binario.
  const bytes = new Uint8Array(pcm.buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// Decodifica base64 a ArrayBuffer (para el audio que llega de Gemini).
function base64ToArrayBuffer(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// Convierte PCM 24 kHz (Int16 little-endian) a un AudioBuffer listo para sonar.
function pcm16ToAudioBuffer(ctx, buffer) {
  const int16 = new Int16Array(buffer);
  const flotante = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) flotante[i] = int16[i] / 32768;
  const ab = new AudioBuffer({ numberOfChannels: 1, length: flotante.length, sampleRate: 24000 });
  ab.copyToChannel(flotante, 0);
  return ab;
}

class VoiceClient {
  constructor(opciones) {
    opciones = opciones || {};
    this.urlToken = opciones.endpointToken || '/api/voice-token';
    this.callbacks = opciones.callbacks || {};

    this.ws = null;
    this.token = null;
    this.estado = 'desconectado';
    this.cierreIntencional = false;
    this.reintentos = 0;
    this.maxReintentos = 3;

    // Contadores de diagnóstico (se ven en la ventana de voz)
    this.contadorEnvios = 0;
    this.contadorRecibidos = 0;

    // Captura de micrófono
    this.micStream = null;
    this.audioCtx = null;     // contexto de captura
    this.workletNode = null;
    this.muestrasPCM = [];    // acumula flotantes antes de enviar

    // Reproducción
    this.playbackCtx = null;  // contexto de reproducción (24 kHz)
    this.cola = [];           // AudioBuffers pendientes
    this.fuentes = [];        // BufferSource activas (para poder cortarlas)
    this.sigInicio = 0;       // reloj de programación → sin gaps
    this.hablandoIA = false;  // la IA está generando/sonando

    // VAD simple para estados de UI y barge-in
    this.ultimaVoz = 0;       // último momento con voz detectada
    this.timerVad = null;
  }

  cambiarEstado(e) {
    this.estado = e;
    if (this.callbacks.onEstado) this.callbacks.onEstado(e);
  }

  notificarError(msg) {
    if (this.callbacks.onError) this.callbacks.onError(msg);
  }

  estaActivo() {
    return !!(this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING));
  }

  // Resumen en vivo para mostrar en la ventana de voz (diagnóstico).
  infoDebug() {
    return 'mic: ' + this.contadorEnvios + ' | ia: ' + this.contadorRecibidos +
      ' | ctx: ' + (this.audioCtx ? this.audioCtx.state : '—') +
      '/' + (this.playbackCtx ? this.playbackCtx.state : '—');
  }

  /* ---------- Ciclo de vida ---------- */

  async conectar() {
    if (this.estaActivo()) return;
    this.cierreIntencional = false;
    this.cambiarEstado('conectando');
    console.log('[Voz] conectar() iniciado');

    // IMPORTANTE: creamos los AudioContext en el MISMO gesto del clic.
    // Si se crean después de un await (fetch del token), el navegador los
    // deja en "suspended" y resume() puede quedarse esperando para siempre.
    this.asegurarAudio();

    // Guardia: si en 10s seguimos "conectando", avisamos en vez de quedarnos colgados.
    clearTimeout(this._timeoutConectar);
    this._timeoutConectar = setTimeout(() => {
      if (this.estado === 'conectando') {
        console.error('[Voz] TIMEOUT de conexión. Estado interno:', {
          micStream: !!this.micStream,
          audioCtx: this.audioCtx ? this.audioCtx.state : null,
          token: this.token ? 'tengo' : 'ninguno',
          ws: this.ws ? this.ws.readyState : null
        });
        this.cambiarEstado('error');
        this.notificarError('No se pudo conectar la voz. Revisa la consola (F12) y que el servidor local esté corriendo.');
      }
    }, 10000);

    try {
      await this.iniciarMicrofono();       // primero el micrófono (pide permiso ya)
      console.log('[Voz] micrófono listo');
      this.token = await this.obtenerToken(); // luego el token (red)
      console.log('[Voz] token obtenido');
    } catch (e) {
      this.cambiarEstado('error');
      console.error('[Voz] error al iniciar:', e);
      if (e && e.name === 'NotAllowedError') {
        this.notificarError('Permiso de micrófono denegado. Actívalo en la barra del navegador.');
      } else if (e && e.name === 'NotFoundError') {
        this.notificarError('No se encontró ningún micrófono en este dispositivo.');
      } else {
        this.notificarError(e.message || 'No se pudo iniciar el modo voz.');
      }
      throw e;
    }
    this.abrirSocket();
  }

  // Crea (si hace falta) los dos AudioContext y los reanuda con límite de tiempo.
  asegurarAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    if (!this.playbackCtx) {
      this.playbackCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.playbackCtx.state === 'suspended') {
      this.playbackCtx.resume().catch(() => {});
    }
  }

  async obtenerToken() {
    const r = await fetch(this.urlToken, { method: 'POST' });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.token) {
      throw new Error(data.error || 'No se pudo obtener el token de voz.');
    }
    return data.token;
  }

  async iniciarMicrofono() {
    if (this.micStream) return; // ya está capturando (reconexión)

    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });

    await this.audioCtx.audioWorklet.addModule(await obtenerWorkletUrl());
    const fuente = this.audioCtx.createMediaStreamSource(this.micStream);
    this.workletNode = new AudioWorkletNode(this.audioCtx, 'fenix-audio-processor');
    this.workletNode.port.onmessage = (e) => this.recibirAudio(e.data);

    fuente.connect(this.workletNode);
    // El worklet solo procesa si está conectado a la salida; lo pasamos por
    // un gain en 0 para que el usuario NO se escuche a sí mismo (sin eco).
    const silencio = this.audioCtx.createGain();
    silencio.gain.value = 0;
    this.workletNode.connect(silencio);
    silencio.connect(this.audioCtx.destination);

    this.muestrasPCM = [];
    this.ultimaVoz = 0;
    this.timerVad = setInterval(() => this.chequearVAD(), 300);
  }

  abrirSocket() {
    // Token de USO ÚNICO: cada conexión necesita uno nuevo (se pide arriba).
    const url = WS_BASE + '?access_token=' + encodeURIComponent(this.token);
    console.log('[Voz] Abriendo WebSocket...');
    this.ws = new WebSocket(url);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      console.log('[Voz] WebSocket ABIERTO');
      this.reintentos = 0;
      this.enviarSetup();
    };

    this.ws.onmessage = (ev) => this.procesarMensaje(ev.data);
    this.ws.onerror = () => {}; // los detalles llegan en onclose
    this.ws.onclose = (ev) => this.manejarCierre(ev);
  }

  enviarSetup() {
    this.ws.send(JSON.stringify({
      setup: {
        model: 'models/' + MODELO_LIVE,
        // responseModalities va DENTRO de generationConfig (verificado en pruebas).
        generationConfig: { responseModalities: ['AUDIO'] },
        // Detector de voz ajustado para tolerar las pausas naturales:
        // - Detecta el inicio de voz rápido (HIGH).
        // - Exige MÁS silencio para dar la palabra por terminada (LOW + 1.8s),
        //   así la IA no interrumpe cuando el usuario hace una pausa corta.
        // - Y a la inversa: si el USUARIO habla mientras la IA responde,
        //   su voz corta la respuesta al instante (barge-in).
        realtimeInputConfig: {
          activityHandling: 'START_OF_ACTIVITY_INTERRUPTS',
          automaticActivityDetection: {
            disabled: false,
            startOfSpeechSensitivity: 'START_SENSITIVITY_HIGH',
            endOfSpeechSensitivity: 'END_SENSITIVITY_LOW',
            prefixPaddingMs: 300,
            silenceDurationMs: 1800
          }
        }
      }
    }));
  }

  /* ---------- Audio del micrófono (entrada) ---------- */

  recibirAudio(muestrasFloat) {
    // VAD: si el lote tiene voz, lo usamos para estados y barge-in.
    let rms = 0;
    for (let i = 0; i < muestrasFloat.length; i++) rms += muestrasFloat[i] * muestrasFloat[i];
    rms = Math.sqrt(rms / muestrasFloat.length);

    if (rms > 0.015) {
      this.ultimaVoz = performance.now();
      this._lotesConVoz = (this._lotesConVoz || 0) + 1;
      // Barge-in local: si la IA está sonando y detectamos voz del usuario
      // durante ~200 ms seguidos (2 lotes), cortamos la reproducción YA.
      // (El servidor además manda su propio evento "interrupted".)
      if (this.hablandoIA && this.estado === 'iaHablando' && this._lotesConVoz >= 2) {
        console.log('[Voz] barge-in local: usuario hablando sobre la IA');
        this.detenerReproduccion();
        this.cambiarEstado('escuchando');
        this._lotesConVoz = 0;
      }
    } else {
      this._lotesConVoz = 0;
    }

    // Encolamos y enviamos en lotes de 1600 muestras (100 ms a 16 kHz).
    for (let i = 0; i < muestrasFloat.length; i++) this.muestrasPCM.push(muestrasFloat[i]);
    while (this.muestrasPCM.length >= 1600) {
      const lote = this.muestrasPCM.splice(0, 1600);
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          realtimeInput: {
            audio: { mimeType: 'audio/pcm;rate=16000', data: floatToPcm16Base64(lote) }
          }
        }));
        this.contadorEnvios++;
        if (this.contadorEnvios % 20 === 0) {
          console.log('[Voz] enviados ' + this.contadorEnvios + ' lotes de audio, último RMS=' + rms.toFixed(3));
        }
      }
    }
  }

  chequearVAD() {
    if (this.estado === 'iaHablando' || this.estado === 'conectando') return;
    // Alineado con el umbral del servidor (~1.8s): no mostrar "Procesando"
    // hasta que la pausa sea realmente larga.
    if (this.ultimaVoz && performance.now() - this.ultimaVoz > 1500 && performance.now() - this.ultimaVoz < 6000) {
      this.ultimaVoz = 0;
      this.cambiarEstado('procesando');
    }
  }

  /* ---------- Mensajes que llegan de Gemini ---------- */

  async procesarMensaje(data) {
    // El servidor envía JSON dentro de frames BINARIOS (Blob en el navegador).
    let txt = null;
    if (typeof data === 'string') {
      txt = data;
    } else if (data instanceof Blob) {
      const buf = await data.arrayBuffer();
      txt = new TextDecoder().decode(buf);
    } else if (data instanceof ArrayBuffer) {
      txt = new TextDecoder().decode(data);
    } else if (data instanceof Uint8Array) {
      txt = new TextDecoder().decode(data);
    }
    if (!txt) return;

    let msg;
    try { msg = JSON.parse(txt); } catch (e) { console.warn('[Voz] JSON inválido:', txt.slice(0, 80)); return; }
    const resumen = msg.serverContent && msg.serverContent.modelTurn
      ? ' [AUDIO:' + (msg.serverContent.modelTurn.parts || []).filter(p => p.inlineData).length + ']'
      : '';
    const resumen2 = msg.serverContent && msg.serverContent.outputTranscription ? ' [texto:' + msg.serverContent.outputTranscription.text.slice(0, 30) + ']' : '';
    console.log('[Voz] mensaje recibido:' + resumen + resumen2);

    if (msg.setupComplete) {
      console.log('[Voz] setupComplete recibido');
      clearTimeout(this._timeoutConectar);
      this.cambiarEstado('escuchando');
      return;
    }

    // Contenido generado (audio + texto).
    if (msg.serverContent) {
      // Interrupción detectada por el servidor → cortar ya.
      if (msg.serverContent.interrupted) {
        this.detenerReproduccion();
        this.cambiarEstado('escuchando');
        return;
      }
      const partes = (msg.serverContent.modelTurn && msg.serverContent.modelTurn.parts) || [];
      let huboAudio = false;
      for (const p of partes) {
        if (p.inlineData && p.inlineData.data) {
          this.encolarAudio(p.inlineData.data);
          this.contadorRecibidos++;
          huboAudio = true;
        }
        if (p.text && this.callbacks.onTexto) this.callbacks.onTexto(p.text);
      }
      if (huboAudio && !this.hablandoIA) {
        this.hablandoIA = true;
        this.crearPlayback();
        this.cambiarEstado('iaHablando');
      }
      if (msg.serverContent.turnComplete) {
        // La IA terminó de generar; la reproducción en cola sigue sonando.
        if (this.callbacks.onTurnoFin) this.callbacks.onTurnoFin();
      }
      // Transcripción de lo que dice la IA (para mostrarlo si se quiere).
      if (msg.serverContent.outputTranscription && msg.serverContent.outputTranscription.text) {
        if (this.callbacks.onTexto) this.callbacks.onTexto(msg.serverContent.outputTranscription.text);
      }
      return;
    }

    // Eventos agregados de la API (incluye interrupción por barge-in).
    if (msg.googAggregatedServerEvent && msg.googAggregatedServerEvent.interrupted) {
      this.detenerReproduccion();
      this.cambiarEstado('escuchando');
      return;
    }

    // Errores del protocolo.
    if (msg.error) {
      const info = msg.error;
      const esToken = /token|auth|key/i.test(String(info.message || '') + String(info.status || ''));
      if (esToken || info.status === 'INVALID_ARGUMENT') {
        this.reconectar(); // token expirado/inválido → pedir uno nuevo
      } else {
        this.cambiarEstado('error');
        this.notificarError(info.message || 'Error en la sesión de voz.');
      }
    }
  }

  /* ---------- Reproducción (salida, 24 kHz, sin cortes) ---------- */

  crearPlayback() {
    // El contexto ya se crea en asegurarAudio() (dentro del clic).
    if (this.playbackCtx && this.playbackCtx.state === 'suspended') {
      this.playbackCtx.resume().catch(() => {});
    }
  }

  encolarAudio(b64) {
    if (!this.playbackCtx) this.crearPlayback();
    const ab = pcm16ToAudioBuffer(this.playbackCtx, base64ToArrayBuffer(b64));
    console.log('[Voz] reproduciendo chunk de audio (' + Math.round(ab.duration * 1000) + ' ms), contexto=' + this.playbackCtx.state);

    // Programamos la reproducción con un reloj continuo (sigInicio) para
    // que los chunks se encadenen SIN gaps entre ellos.
    const fuente = this.playbackCtx.createBufferSource();
    fuente.buffer = ab;
    fuente.connect(this.playbackCtx.destination);
    if (this.sigInicio < this.playbackCtx.currentTime) this.sigInicio = this.playbackCtx.currentTime;
    fuente.start(this.sigInicio);
    this.sigInicio += ab.duration;
    this.fuentes.push(fuente);

    fuente.onended = () => {
      this.fuentes = this.fuentes.filter((f) => f !== fuente);
      // Si la cola terminó y la IA ya no genera → vuelve a escuchar.
      if (!this.fuentes.length && !this.hablandoIA) {
        this.cambiarEstado('escuchando');
      }
    };
    this.hablandoIA = true;
  }

  detenerReproduccion() {
    this.fuentes.forEach((f) => { try { f.stop(); f.disconnect(); } catch (e) {} });
    this.fuentes = [];
    this.sigInicio = 0;
    this.hablandoIA = false;
  }

  /* ---------- Envío de texto (opcional, dentro de la sesión) ---------- */

  enviarTexto(texto) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      clientContent: { turns: [{ role: 'user', parts: [{ text: texto }] }], turnComplete: true }
    }));
    this.cambiarEstado('procesando');
  }

  /* ---------- Reconexión y limpieza ---------- */

  manejarCierre(ev) {
    console.log('[Voz] WebSocket cerrado code=' + ev.code + ' reason=' + ev.reason);
    this.ws = null;
    this.detenerReproduccion();
    if (this.cierreIntencional) {
      this.cambiarEstado('desconectado');
      return;
    }
    // Token inválido/expirado o caída → reconectar con token NUEVO.
    const problemaToken = ev.code === 1008 || ev.code === 4401 || /token|auth|invalid/i.test(ev.reason || '');
    this.reconectar(problemaToken);
  }

  reconectar(problemaToken) {
    if (this.reintentos >= this.maxReintentos) {
      this.cambiarEstado('error');
      this.notificarError('No se pudo restablecer la conexión de voz. Intenta de nuevo.');
      return;
    }
    this.reintentos++;
    const espera = 1000 * Math.pow(2, this.reintentos - 1); // 1s, 2s, 4s
    this.cambiarEstado('conectando');
    setTimeout(() => {
      if (this.cierreIntencional) return;
      if (this.ws) { try { this.ws.close(); } catch (e) {} this.ws = null; }
      this.token = null; // forzar token nuevo (uso único)
      this.abrirSocket();
    }, espera);
  }

  async toggle() {
    if (this.estaActivo()) {
      this.desconectar();
      return false;
    }
    await this.conectar();
    return true;
  }

  desconectar() {
    this.cierreIntencional = true;
    if (this.timerVad) { clearInterval(this.timerVad); this.timerVad = null; }

    // WebSocket
    if (this.ws) { try { this.ws.close(); } catch (e) {} this.ws = null; }

    // Reproducción
    this.detenerReproduccion();

    // AudioWorklet + contexto de captura
    if (this.workletNode) {
      try { this.workletNode.port.close(); } catch (e) {}
      try { this.workletNode.disconnect(); } catch (e) {}
      this.workletNode = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try { this.audioCtx.close(); } catch (e) {}
    }
    this.audioCtx = null;

    // Tracks del micrófono
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }

    // Contexto de reproducción
    if (this.playbackCtx && this.playbackCtx.state !== 'closed') {
      try { this.playbackCtx.close(); } catch (e) {}
    }
    this.playbackCtx = null;

    this.token = null;
    this.reintentos = 0;
    this.ultimaVoz = 0;
    this.cambiarEstado('desconectado');
  }
}

// Disponible globalmente para el resto de la app.
window.VoiceClient = VoiceClient;