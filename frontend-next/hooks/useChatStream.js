'use client';

import { useState, useRef, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

/**
 * Hook reactivo para enviar mensajes al chat y consumir el streaming Server-Sent Events (SSE)
 * que emite el backend Express (POST /api/chat) vía fetch + ReadableStream.
 */
export function useChatStream() {
  const [mensajes, setMensajes] = useState([]);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Cancela la respuesta en curso si el usuario lo solicita.
   */
  const detener = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setGenerando(false);
    }
  }, []);

  /**
   * Envía un mensaje y procesa el flujo SSE token por token.
   * @param {string} textoMensaje - El texto que escribe el usuario
   * @param {Object} [opciones={}] - Opciones adicionales (modelo, idioma, instruccion)
   */
  const enviarMensaje = useCallback(async (textoMensaje, opciones = {}) => {
    if (!textoMensaje || !textoMensaje.trim() || generando) return;

    setError(null);
    const mensajeUsuario = {
      id: Date.now().toString(),
      rol: 'user',
      contenido: textoMensaje.trim(),
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

    // Añadimos el mensaje del usuario y la burbuja vacía del bot
    setMensajes((prev) => [...prev, mensajeUsuario, mensajeBotInicial]);
    setGenerando(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Historial para contexto del modelo
      const historial = mensajes.map((m) => ({
        role: m.rol === 'user' ? 'user' : 'assistant',
        content: m.contenido,
      }));

      const payload = {
        mensaje: textoMensaje.trim(),
        historial,
        modelo: opciones.modelo || 'auto',
        idioma: opciones.idioma || 'es',
        instruccion: opciones.instruccion || '',
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
        throw new Error(dataError.error || `Error en el servidor (${res.status})`);
      }

      if (!res.body) {
        throw new Error('El servidor no devolvió un flujo de datos legible.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let acumulado = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lineas = buffer.split('\n');
        // El último elemento puede ser una línea incompleta; lo conservamos en el buffer
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
            if (typeof dataObj.texto === 'string') {
              acumulado += dataObj.texto;
              // Actualizamos el mensaje del bot token por token
              setMensajes((prev) =>
                prev.map((msg) =>
                  msg.id === idBot
                    ? { ...msg, contenido: acumulado, cargando: false }
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

      setMensajes((prev) =>
        prev.map((msg) =>
          msg.id === idBot
            ? { ...msg, contenido: acumulado, cargando: false }
            : msg
        )
      );
    } catch (err) {
      if (err.name === 'AbortError') {
        // Cancelado por el usuario
      } else {
        console.error('[useChatStream] Error:', err);
        const mensajeError = err.message || 'Error al conectar con Fenix IA';
        setError(mensajeError);
        setMensajes((prev) =>
          prev.map((msg) =>
            msg.id === idBot
              ? { ...msg, contenido: `⚠️ ${mensajeError}`, error: true, limite: !!err.limite, cargando: false }
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
  };
}
