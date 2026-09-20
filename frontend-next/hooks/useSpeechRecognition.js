'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook de reconocimiento de voz nativo (Web Speech API).
 * Optimizado para conversaciones fluidas: auto-reinicio ante silencios
 * y recuperación ante interrupciones de Chrome/Edge/móviles.
 */
export function useSpeechRecognition({ onResult, onEnd, onError, lang = 'es-MX' } = {}) {
  const [escuchando, setEscuchando] = useState(false);
  const [soportado, setSoportado] = useState(false);

  const recognitionRef = useRef(null);
  const callbackRef = useRef(onResult);
  callbackRef.current = onResult;

  const activoDeseadoRef = useRef(false);
  const isRunningRef = useRef(false);
  const restartTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setSoportado(true);
    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = lang;

    recog.onstart = () => {
      isRunningRef.current = true;
      setEscuchando(true);
    };

    recog.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript + ' ';
        } else {
          interimTranscript += res[0].transcript;
        }
      }
      const full = (finalTranscript + interimTranscript).trim();
      if (callbackRef.current && full) {
        callbackRef.current(full, event.results[event.results.length - 1]?.isFinal || false);
      }
    };

    recog.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('[useSpeechRecognition] Error:', e.error);
      }
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        activoDeseadoRef.current = false;
        isRunningRef.current = false;
        setEscuchando(false);
        if (onError) onError(e.error);
      }
    };

    recog.onend = () => {
      isRunningRef.current = false;
      setEscuchando(false);

      // Auto-reinicio si el usuario no ha pedido detenerlo (Chrome timeout de silencio)
      if (activoDeseadoRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (activoDeseadoRef.current && !isRunningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              // Si ya estaba activo o iniciando, ignorar
            }
          }
        }, 120);
      } else if (onEnd) {
        onEnd();
      }
    };

    recognitionRef.current = recog;

    return () => {
      activoDeseadoRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [lang, onEnd, onError]);

  const iniciar = useCallback(() => {
    activoDeseadoRef.current = true;
    if (!recognitionRef.current) return false;
    if (isRunningRef.current) return true;

    try {
      recognitionRef.current.start();
      return true;
    } catch (e) {
      // Si ya estaba en proceso de arranque
      return false;
    }
  }, []);

  const detener = useCallback(() => {
    activoDeseadoRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (e) {}
    isRunningRef.current = false;
    setEscuchando(false);
  }, []);

  const toggle = useCallback(() => {
    if (activoDeseadoRef.current) {
      detener();
    } else {
      iniciar();
    }
  }, [detener, iniciar]);

  return {
    escuchando,
    soportado,
    iniciar,
    detener,
    toggle
  };
}
