'use client';

import { useState, useRef, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { generarImagen, esPeticionImagen } from '@/lib/imagenes';

/**
 * Hook reactivo para enviar mensajes al chat y consumir el streaming Server-Sent Events (SSE)
 * que emite el backend Express (POST /api/chat) vía fetch + ReadableStream.
 * Además gestiona la generación de imágenes (Pollinations) y documentos reales
 * cuando el usuario lo pide o el modelo devuelve los marcadores [GENERAR_*].
 */
export function useChatStream() {
  const [mensajes, setMensajes] = useState([]);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  // Chat al que pertenece el stream en curso (capturado al enviar). Sirve para
  // que, si el usuario cambia de chat a mitad de generación, el resultado se
  // guarde en el chat correcto y no se pierda ni corrompa.
  const streamChatIdRef = useRef(null);

  const detener = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setGenerando(false);
    }
  }, []);

  const enviarMensaje = useCallback(async (textoMensaje, opciones = {}) => {
    if (!textoMensaje || !textoMensaje.trim() || generando) return;

    // Guardamos a qué chat le pertenece ESTE stream antes de que chatActualId
    // pueda cambiar en el frontend mientras se genera la respuesta.
    streamChatIdRef.current = opciones.chatId || null;

    setError(null);
    const mensajeUsuario = {
      id: Date.now().toString(),
      rol: 'user',
      contenido: textoMensaje.trim(),
      archivo: opciones.archivo || null,
      fecha: new Date().toISOString(),
    };

    const idBot = (Date.now() + 1).toString();
    const mensajeBotInicial = {
      id: idBot,
      rol: 'bot',
      contenido: '',
      fecha: new Date().toISOString(),
      cargando: true,
    };

    setMensajes((prev) => [...prev, mensajeUsuario, mensajeBotInicial]);
    setGenerando(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const finalizarBurbuja = async (acumulado) => {
      const final = acumulado;
      const coincidenciaImg = final.match(/\[GENERAR_IMAGEN\]\s*:?\s*([\s\S]+)/i);

      if (coincidenciaImg && coincidenciaImg[1].trim()) {
        const descripcion = coincidenciaImg[1].trim();
        setMensajes((prev) =>
          prev.map((m) => (m.id === idBot ? { ...m, contenido: 'Generando imagen...', cargando: true } : m))
        );
        try {
          const urlImagen = await generarImagen(descripcion);
          setMensajes((prev) =>
            prev.map((m) =>
              m.id === idBot ? { ...m, contenido: '', cargando: false, imagen: urlImagen } : m
            )
          );
        } catch (e) {
          console.error('[useChatStream] imagen:', e);
          setMensajes((prev) =>
            prev.map((m) =>
              m.id === idBot
                ? { ...m, contenido: `⚠️ ${e.message || 'No se pudo generar la imagen'}`, error: true, cargando: false }
                : m
            )
          );
        }
      } else {
        const limpio = final
          .replace(/^\[BUSCAR_WEB\][^\n]*\n?/gim, '')
          .replace(/^\[GENERAR_IMAGEN\][^\n]*\n?/gim, '')
          .replace(/^\[GENERAR_DOC\][^\n]*\n?/gim, '')
          .replace(/^\[IMAGEN\]\s*:?.*$/gim, '')
          .trim();
        setMensajes((prev) =>
          prev.map((m) => (m.id === idBot ? { ...m, contenido: limpio, cargando: false } : m))
        );
      }
    };

    // El usuario pide explícitamente una imagen: va directo por /api/imagen
    if (esPeticionImagen(textoMensaje) && !opciones.archivo) {
      try {
        const urlImagen = await generarImagen(textoMensaje.trim());
        setMensajes((prev) =>
          prev.map((m) =>
            m.id === idBot ? { ...m, contenido: '', cargando: false, imagen: urlImagen } : m
          )
        );
      } catch (e) {
        console.error('[useChatStream] imagen directa:', e);
        setMensajes((prev) =>
          prev.map((m) =>
            m.id === idBot
              ? { ...m, contenido: `⚠️ ${e.message || 'No se pudo generar la imagen'}`, error: true, cargando: false }
              : m
          )
        );
      } finally {
        setGenerando(false);
        abortControllerRef.current = null;
      }
      return;
    }

    let acumulado = '';

    try {
      const historial = mensajes.map((m) => ({
        role: m.rol === 'user' ? 'user' : 'assistant',
        content: m.contenido,
      }));

      let instruccion = opciones.instruccion || '';
      try {
        instruccion = instruccion || localStorage.getItem('fenixSystemPrompt') || '';
      } catch (e) {}

      let idiomaLocal = 'es';
      try {
        idiomaLocal = localStorage.getItem('fenixIdioma') || 'es';
      } catch (e) {}

      // Si se adjuntó un archivo de texto/código, inyectar su contenido en el prompt
      let mensajeParaIA = textoMensaje.trim();
      if (opciones.archivo && opciones.archivo.contenidoTexto) {
        mensajeParaIA = `[DOCUMENTO/ARCHIVO ADJUNTO: "${opciones.archivo.nombre}" (${opciones.archivo.tamano})]\n\`\`\`\n${opciones.archivo.contenidoTexto}\n\`\`\`\n\n[INSTRUCCIÓN/PREGUNTA DEL USUARIO]:\n${textoMensaje.trim()}`;
      }

      const payload = {
        mensaje: mensajeParaIA,
        historial,
        modelo: opciones.modelo || 'auto',
        idioma: opciones.idioma || idiomaLocal,
        instruccion,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(opciones.webSearch !== undefined ? { webSearch: opciones.webSearch } : {}),
        ...(opciones.chatId !== undefined ? { chatId: opciones.chatId } : {}),
      };

      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const dataError = await res.json().catch(() => ({}));
        if (dataError.error === 'LIMITE') {
          const errLimite = new Error(`Has alcanzado el límite de ${dataError.limite} mensajes gratuitos. Inicia sesión para continuar.`);
          errLimite.limite = true;
          throw errLimite;
        }
        if (dataError.error === 'CHAT_BLOQUEADO') {
          const errBloqueado = new Error(dataError.mensaje || 'Esta conversación ha sido cerrada y finalizada por el uso de lenguaje ofensivo o insultos.');
          errBloqueado.bloqueado = true;
          throw errBloqueado;
        }
        throw new Error(dataError.error || `Error en el servidor (${res.status})`);
      }

      if (!res.body) {
        throw new Error('El servidor no devolvió un flujo de datos legible.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lineas = buffer.split('\n');
        buffer = lineas.pop() || '';

        for (const linea of lineas) {
          const lineaLimpia = linea.trim();
          if (!lineaLimpia || !lineaLimpia.startsWith('data:')) continue;

          const dataRaw = lineaLimpia.slice(5).trim();
          if (!dataRaw || dataRaw === '[DONE]') continue;

          try {
            const dataObj = JSON.parse(dataRaw);
            if (dataObj.error) {
              throw new Error(dataObj.error);
            }

            // Búsqueda web en vivo
            if (dataObj.tipo === 'buscando_web' && dataObj.query) {
              setMensajes((prev) =>
                prev.map((msg) =>
                  msg.id === idBot
                    ? { ...msg, searchInfo: { ...(msg.searchInfo || {}), query: String(dataObj.query), estado: 'buscando' } }
                    : msg
                )
              );
              continue;
            }

            // Fuentes citadas al terminar la búsqueda
            if (dataObj.tipo === 'fuentes' && Array.isArray(dataObj.fuentes)) {
              setMensajes((prev) =>
                prev.map((msg) =>
                  msg.id === idBot
                    ? { ...msg, searchInfo: { ...(msg.searchInfo || {}), fuentes: dataObj.fuentes, estado: 'completado' } }
                    : msg
                )
              );
              continue;
            }

            if (typeof dataObj.texto === 'string' && dataObj.texto) {
              acumulado += dataObj.texto;
              // Oculta los marcadores crudos mientras llega el resto de la respuesta
              const visible = acumulado
                .replace(/^\[BUSCAR_WEB\][^\n]*\n?/gim, '')
                .replace(/^\[GENERAR_IMAGEN\][^\n]*\n?/gim, '')
                .replace(/^\[GENERAR_DOC\][^\n]*\n?/gim, '')
                .replace(/\[FENIX_CHART:[\s\S]*$/i, '')
                .replace(/^\[IMAGEN\]\s*:?.*$/gim, '');
              let espera = '';
              if (/^\[BUSCAR_WEB\]/im.test(acumulado) && !visible.trim()) {
                espera = 'Buscando en la web...';
              } else if (/^\[GENERAR_IMAGEN\]/im.test(acumulado) && !visible.trim()) {
                espera = 'Generando imagen...';
              }

              setMensajes((prev) =>
                prev.map((msg) =>
                  msg.id === idBot
                    ? {
                        ...msg,
                        contenido: visible.trim() ? visible : espera,
                        cargando: !visible.trim() && !espera,
                        ...(msg.searchInfo?.estado === 'buscando'
                          ? { searchInfo: { ...msg.searchInfo, estado: 'completado' } }
                          : {})
                      }
                    : msg
                )
              );
            }
          } catch (jsonErr) {
            // Ignorar errores de fragmentos JSON parciales
          }
        }
      }

      // Procesar cualquier dato restante en el buffer
      if (buffer.trim().startsWith('data:')) {
        const dataRaw = buffer.trim().slice(5).trim();
        if (dataRaw && dataRaw !== '[DONE]') {
          try {
            const dataObj = JSON.parse(dataRaw);
            if (typeof dataObj.texto === 'string') {
              acumulado += dataObj.texto;
            }
          } catch (e) {}
        }
      }

      await finalizarBurbuja(acumulado);
    } catch (err) {
      if (err.name === 'AbortError') {
        // Cancelado por el usuario: conservar lo que ya llegó.
        // Si el stream pertenece a un chat que se abandonó (cambió de chat a
        // mitad de generación), page.js ya guardó lo parcial antes de detener:
        // no re-finalizar aquí para no disparar una generación descartada.
        if (streamChatIdRef.current !== null) {
          await finalizarBurbuja(acumulado);
        }
      } else {
        console.error('[useChatStream] Error:', err);
        const mensajeError = err.message || 'Error al conectar con Fenix IA';
        setError(mensajeError);
        setMensajes((prev) =>
          prev.map((msg) =>
            msg.id === idBot
              ? { ...msg, contenido: err.bloqueado ? mensajeError : `⚠️ ${mensajeError}`, error: true, bloqueado: !!err.bloqueado, limite: !!err.limite, cargando: false }
              : msg
          )
        );
      }
    } finally {
      setGenerando(false);
      abortControllerRef.current = null;
    }
  }, [generando, mensajes]);

  const limpiarChat = useCallback(() => {
    detener();
    setMensajes([]);
    setError(null);
  }, [detener]);

  return {
    mensajes,
    generando,
    error,
    enviarMensaje,
    detener,
    limpiarChat,
    setMensajes,
    streamChatIdRef,
  };
}