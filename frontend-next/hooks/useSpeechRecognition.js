'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook de reconocimiento de voz nativo (Web Speech API).
 * Funciona en Chrome, Edge, Safari, Opera y navegadores móviles.
 */
export function useSpeechRecognition({ onResult, onEnd, onError, lang = 'es-MX' } = {}) {
  const [escuchando, setEscuchando] = useState(false);
  const [soportado, setSoportado] = useState(false);
  const recognitionRef = useRef(null);
  const callbackRef = useRef(onResult);
  callbackRef.current = onResult;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSoportado(true);
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = lang;

        recog.onstart = () => {
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
            callbackRef.current(full, event.results[event.results.length - 1].isFinal);
          }
        };

        recog.onerror = (e) => {
          if (e.error !== 'no-speech') {
            console.warn('[useSpeechRecognition] Error:', e.error);
          }
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            setEscuchando(false);
            if (onError) onError(e.error);
          }
        };

        recog.onend = () => {
          setEscuchando(false);
          if (onEnd) onEnd();
        };

        recognitionRef.current = recog;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [lang, onEnd, onError]);

  const iniciar = useCallback(() => {
    if (!recognitionRef.current) return false;
    try {
      recognitionRef.current.start();
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const detener = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {}
    setEscuchando(false);
  }, []);

  const toggle = useCallback(() => {
    if (escuchando) {
      detener();
    } else {
      iniciar();
    }
  }, [escuchando, detener, iniciar]);

  return {
    escuchando,
    soportado,
    iniciar,
    detener,
    toggle
  };
}
