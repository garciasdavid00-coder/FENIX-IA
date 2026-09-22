'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { apiFetch } from '@/lib/api';

/**
 * VoiceModal: Modo conversación de voz en vivo interactivo para Fenix IA.
 * Mejorado (10/10) con: Streaming TTS (habla en tiempo real sin esperar),
 * ignorado dinámico de <think>, y cola de oraciones fluida.
 */
export default function VoiceModal({ isOpen, onClose, onEnviarMensaje }) {
  const [estado, setEstado] = useState('escuchando'); // 'escuchando' | 'pensando' | 'hablando' | 'pausado'
  const [transcripcionUsuario, setTranscripcionUsuario] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [voces, setVoces] = useState([]);

  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  const silencioTimerRef = useRef(null);
  const activeUtteranceRef = useRef(null);
  const textoUsuarioPendienteRef = useRef('');

  // Cargar lista de voces disponibles en el navegador
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const actualizarVoces = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length) setVoces(v);
      } catch (e) {}
    };
    actualizarVoces();
    window.speechSynthesis.onvoiceschanged = actualizarVoces;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Detener TTS limpiamente
  const detenerTTS = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    activeUtteranceRef.current = null;
    if (typeof window !== 'undefined') window.__fenixUtterance = null;
  }, []);

  // Reconocimiento de voz del usuario con protección anti-eco
  const { escuchando, soportado, iniciar, detener } = useSpeechRecognition({
    onResult: (texto, isFinal) => {
      if (estadoRef.current !== 'escuchando') return;

      textoUsuarioPendienteRef.current = texto;
      setTranscripcionUsuario(texto);

      if (silencioTimerRef.current) clearTimeout(silencioTimerRef.current);
      silencioTimerRef.current = setTimeout(() => {
        if (estadoRef.current === 'escuchando' && texto.trim().length >= 2) {
          enviarConsultaVoz(texto.trim());
        }
      }, 2000); // 2 segundos de pausa para hablar
    },
    onError: (err) => {
      console.warn('[VoiceModal] Error de reconocimiento:', err);
      if (err === 'not-allowed') {
        alert('Permiso de micrófono denegado. Por favor permite el acceso al micrófono en el navegador.');
      } else if (err === 'no-soportado') {
        alert('Tu navegador no soporta el reconocimiento de voz. Usa Chrome o Edge.');
      }
    }
  });

  // Encola una oración para hablarla. "esUltima" reinicia el micrófono al terminar.
  const hablarOracion = useCallback((texto, esUltima = false) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const utter = new SpeechSynthesisUtterance(texto);
    activeUtteranceRef.current = utter;
    window.__fenixUtterance = utter; 

    utter.lang = 'es-MX';
    if (voces && voces.length > 0) {
      const vozEspanol =
        voces.find((v) => v.lang === 'es-MX' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Microsoft Sabina'))) ||
        voces.find((v) => v.lang.startsWith('es-MX')) ||
        voces.find((v) => v.lang.startsWith('es-US')) ||
        voces.find((v) => v.lang.startsWith('es'));
      if (vozEspanol) {
        utter.voice = vozEspanol;
        utter.lang = vozEspanol.lang;
      }
    }

    utter.rate = 1.05;
    utter.pitch = 1.0;

    const finalizar = () => {
      if (esUltima && estadoRef.current === 'hablando') {
        setTimeout(() => {
          if (estadoRef.current === 'hablando') {
            setEstado('escuchando');
            setTranscripcionUsuario('');
            textoUsuarioPendienteRef.current = '';
            iniciar();
          }
        }, 350);
      }
    };

    utter.onend = finalizar;
    utter.onerror = finalizar;

    try {
      window.speechSynthesis.speak(utter);
    } catch (e) {
      finalizar();
    }
  }, [voces, iniciar]);

  // Enviar la consulta de voz al backend (Streaming TTS)
  const enviarConsultaVoz = async (prompt) => {
    if (!prompt || !prompt.trim()) return;
    if (silencioTimerRef.current) clearTimeout(silencioTimerRef.current);
    
    setEstado('pensando');
    detener(); // Apagar micrófono

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          mensaje: prompt,
          idioma: 'español',
          webSearch: 'auto',
          canal: 'voz',
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      });

      if (!res.ok) throw new Error(`Servidor respondió ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let respuestaTotal = '';
      let bufferTexto = '';
      let enPensamiento = false;
      let oracionesEnviadas = 0;

      while (true) {
        const { value, done } = await reader.read();
        
        if (done) {
          // Hablar lo que sobró en el buffer
          let limpio = bufferTexto.replace(/\[.*?\]/g, '').replace(/[*_#`]/g, '').trim();
          if (limpio) {
             hablarOracion(limpio, true);
             oracionesEnviadas++;
          } else {
             // Si el buffer estaba vacío pero no mandamos NADA, decimos algo genérico
             if (oracionesEnviadas === 0) hablarOracion('Lo tengo.', true);
             else {
               // Ya mandamos oraciones, así que simplemente reactivamos el micro
               setTimeout(() => {
                 if (estadoRef.current === 'hablando' || estadoRef.current === 'pensando') {
                   setEstado('escuchando');
                   setTranscripcionUsuario('');
                   iniciar();
                 }
               }, 350);
             }
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.tipo === 'buscando_web') {
                 setRespuestaIA("Buscando información en la web...");
                 continue;
              }

              if (data.texto) {
                let txt = data.texto;
                
                // Ignorar bloques <think> de DeepSeek en tiempo real
                if (txt.includes('<think>')) { enPensamiento = true; txt = txt.split('<think>')[0]; }
                if (txt.includes('</think>')) { enPensamiento = false; txt = txt.split('</think>')[1] || ''; }
                if (enPensamiento) continue;

                respuestaTotal += txt;
                bufferTexto += txt;
                setRespuestaIA(respuestaTotal);

                // Dividir en oraciones y enviarlas al TTS
                let match = bufferTexto.match(/^(.*?)([.?!:])(\s+|$)(.*)$/s);
                while (match) {
                  let oracion = (match[1] + match[2]).trim();
                  let limpio = oracion.replace(/\[.*?\]/g, '').replace(/[*_#`]/g, '').trim();
                  
                  if (limpio) {
                    if (oracionesEnviadas === 0) setEstado('hablando');
                    hablarOracion(limpio, false);
                    oracionesEnviadas++;
                  }
                  
                  bufferTexto = (match[4] || '');
                  match = bufferTexto.match(/^(.*?)([.?!:])(\s+|$)(.*)$/s);
                }
              }
            } catch (e) {}
          }
        }
      }

      if (typeof onEnviarMensaje === 'function') {
        try { onEnviarMensaje(prompt, { canalVoz: true }); } catch (e) {}
      }

    } catch (err) {
      console.error('[VoiceModal] Error procesando voz:', err);
      setEstado('hablando');
      hablarOracion('Disculpa, tuve un problema de conexión. ¿Podrías repetir?', true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setEstado('escuchando');
      setTranscripcionUsuario('');
      setRespuestaIA('');
      textoUsuarioPendienteRef.current = '';
      const timer = setTimeout(() => iniciar(), 150);
      return () => clearTimeout(timer);
    } else {
      detener();
      detenerTTS();
      if (silencioTimerRef.current) clearTimeout(silencioTimerRef.current);
    }
    return () => { detener(); detenerTTS(); };
  }, [isOpen, iniciar, detener, detenerTTS]);

  const manejarClickOrbe = () => {
    if (estado === 'hablando' || estado === 'pensando') {
      detenerTTS();
      setEstado('escuchando');
      setTranscripcionUsuario('');
      iniciar();
    } else if (estado === 'escuchando' && transcripcionUsuario.trim()) {
      enviarConsultaVoz(transcripcionUsuario.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="voice-modal-overlay">
      <div className="voice-modal-container">
        <div className="voice-modal-header">
          <div className="voice-brand">
            <span className="voice-brand-dot" />
            <span>Fenix Voz</span>
          </div>
          <button type="button" className="voice-close-btn" onClick={onClose} title="Cerrar">✕</button>
        </div>

        <div className="voice-orb-stage">
          <div
            className={`voice-orb ${estado}`}
            onClick={manejarClickOrbe}
            style={{ cursor: 'pointer' }}
            title={(estado === 'hablando' || estado === 'pensando') ? 'Toca para interrumpir' : (estado === 'escuchando' && transcripcionUsuario ? 'Toca para enviar' : '')}
          >
            <div className="voice-orb-core" />
            <div className="voice-orb-glow" />
            <div className="voice-orb-ring ring-1" />
            <div className="voice-orb-ring ring-2" />
          </div>

          <div className="voice-status-label">
            {estado === 'escuchando' && (transcripcionUsuario ? 'Escuchando... (toca para enviar)' : 'Te escucho... habla con naturalidad')}
            {estado === 'pensando' && 'Procesando tu pregunta...'}
            {estado === 'hablando' && 'Fenix hablando (toca para interrumpir)'}
            {estado === 'pausado' && 'En pausa'}
          </div>
        </div>

        <div className="voice-transcript-box">
          {transcripcionUsuario && (
            <p className="voice-user-text"><strong>Tú:</strong> {transcripcionUsuario}</p>
          )}
          {respuestaIA && (estado === 'hablando' || estado === 'pensando') && (
            <p className="voice-ai-text"><strong>Fenix:</strong> {respuestaIA}</p>
          )}
          {!transcripcionUsuario && !respuestaIA && (
            <p className="voice-hint">Pregúntame lo que quieras: noticias, clima, cotizaciones o cualquier tema de tu interés.</p>
          )}
        </div>

        <div className="voice-controls">
          <button
            type="button"
            className={`voice-ctrl-btn ${escuchando ? 'activo' : ''}`}
            onClick={() => {
              if (escuchando) {
                detener();
                detenerTTS();
                setEstado('pausado');
              } else {
                setEstado('escuchando');
                iniciar();
              }
            }}
          >
            {escuchando ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" /><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
            )}
          </button>
          <button type="button" className="voice-ctrl-btn voice-end-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><rect x="6" y="6" width="12" height="12" rx="3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
