'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook de reconocimiento de voz nativo (Web Speech API).
 * - Solicita permisos de micrófono explícitos vía getUserMedia si hace falta.
 * - Crea una instancia fresca de SpeechRecognition en cada arranque para evitar bloqueos internos de Chrome.
 * - Reinicia automáticamente ante silencios mientras activoDeseado esté encendido.
 * - Informa errores claros al usuario si el micrófono está bloqueado o no soportado.
 */
export function useSpeechRecognition({ onResult, onEnd, onError, lang = 'es-MX', continuo = true } = {}) {
  const [escuchando, setEscuchando] = useState(false);
  const [soportado, setSoportado] = useState(false);

  const recognitionInstanceRef = useRef(null);
  const callbackRef = useRef(onResult);
  callbackRef.current = onResult;

  const errorCallbackRef = useRef(onError);
  errorCallbackRef.current = onError;

  const activoDeseadoRef = useRef(false);
  const isStartingOrRunningRef = useRef(false);
  const restartTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSoportado(!!SpeechRecognition);
    }
  }, []);

  const limpiarInstancia = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.onstart = null;
        recognitionInstanceRef.current.onresult = null;
        recognitionInstanceRef.current.onerror = null;
        recognitionInstanceRef.current.onend = null;
        recognitionInstanceRef.current.abort();
      } catch (e) {}
      recognitionInstanceRef.current = null;
    }
    isStartingOrRunningRef.current = false;
  }, []);

  const arrancarInstancia = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (errorCallbackRef.current) errorCallbackRef.current('no-soportado');
      return false;
    }

    limpiarInstancia();

    try {
      const recog = new SpeechRecognition();
      recog.continuous = continuo;
      recog.interimResults = true;
      recog.lang = lang;

      recog.onstart = () => {
        isStartingOrRunningRef.current = true;
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
        const err = e.error || 'desconocido';
        if (err !== 'no-speech' && err !== 'aborted') {
          console.warn('[useSpeechRecognition] Error del micrófono:', err);
        }

        if (err === 'not-allowed' || err === 'service-not-allowed') {
          activoDeseadoRef.current = false;
          isStartingOrRunningRef.current = false;
          setEscuchando(false);
          if (errorCallbackRef.current) errorCallbackRef.current('not-allowed');
        }
      };

      recog.onend = () => {
        isStartingOrRunningRef.current = false;
        setEscuchando(false);

        // Auto-reinicio ante el timeout de silencio de Chrome si el usuario aún desea escuchar
        if (activoDeseadoRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (activoDeseadoRef.current) {
              arrancarInstancia();
            }
          }, 150);
        } else if (onEnd) {
          onEnd();
        }
      };

      recognitionInstanceRef.current = recog;
      recog.start();
      isStartingOrRunningRef.current = true;
      return true;
    } catch (err) {
      console.warn('[useSpeechRecognition] Fallo al iniciar recog:', err);
      isStartingOrRunningRef.current = false;
      setEscuchando(false);
      return false;
    }
  }, [continuo, lang, limpiarInstancia, onEnd]);

  const iniciar = useCallback(async () => {
    activoDeseadoRef.current = true;

    // 1. Pedir permiso explícito de micrófono primero para disparar el diálogo del navegador si hace falta
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Liberamos el stream inmediatamente, solo necesitábamos confirmar el permiso del navegador
        stream.getTracks().forEach((t) => t.stop());
      } catch (ePermiso) {
        console.warn('[useSpeechRecognition] Permiso de micrófono no concedido:', ePermiso.name || ePermiso);
        activoDeseadoRef.current = false;
        setEscuchando(false);
        if (errorCallbackRef.current) {
          errorCallbackRef.current('not-allowed');
        }
        return false;
      }
    }

    return arrancarInstancia();
  }, [arrancarInstancia]);

  const detener = useCallback(() => {
    activoDeseadoRef.current = false;
    limpiarInstancia();
    setEscuchando(false);
  }, [limpiarInstancia]);

  const toggle = useCallback(() => {
    if (activoDeseadoRef.current || escuchando) {
      detener();
    } else {
      iniciar();
    }
  }, [escuchando, detener, iniciar]);

  useEffect(() => {
    return () => {
      activoDeseadoRef.current = false;
      limpiarInstancia();
    };
  }, [limpiarInstancia]);

  return {
    escuchando,
    soportado,
    iniciar,
    detener,
    toggle
  };
}
