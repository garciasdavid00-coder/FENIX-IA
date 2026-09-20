'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { apiFetch } from '@/lib/api';

/**
 * VoiceModal: Modo conversación de voz en vivo interactivo para Fenix IA.
 * Soluciona cortes de audio en Chrome, auto-reinicio del micrófono ante silencios,
 * prevención de eco/auto-interrupción y selección de voces naturales en español.
 */
export default function VoiceModal({ isOpen, onClose, onEnviarMensaje }) {
  const [estado, setEstado] = useState('escuchando'); // 'escuchando' | 'pensando' | 'hablando' | 'pausado'
  const [transcripcionUsuario, setTranscripcionUsuario] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [voces, setVoces] = useState([]);

  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  const silencioTimerRef = useRef(null);
  const keepAliveTimerRef = useRef(null);
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
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Detener TTS limpiamente
  const detenerTTS = useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    activeUtteranceRef.current = null;
    if (typeof window !== 'undefined') {
      window.__fenixUtterance = null;
    }
  }, []);

  // Reconocimiento de voz del usuario con protección anti-eco
  const { escuchando, soportado, iniciar, detener } = useSpeechRecognition({
    onResult: (texto, isFinal) => {
      // Si la IA está pensando o hablando, ignorar para evitar que la IA se escuche a sí misma
      if (estadoRef.current !== 'escuchando') return;

      textoUsuarioPendienteRef.current = texto;
      setTranscripcionUsuario(texto);

      // Si el usuario hace una pausa, procesar su consulta
      if (silencioTimerRef.current) clearTimeout(silencioTimerRef.current);
      silencioTimerRef.current = setTimeout(() => {
        if (estadoRef.current === 'escuchando' && texto.trim().length >= 2) {
          enviarConsultaVoz(texto.trim());
        }
      }, 1700);
    },
    onError: (err) => {
      console.warn('[VoiceModal] Error de reconocimiento:', err);
    }
  });

  // Hablar texto con protección contra el bug de 14s y garbage collection de Chrome
  const hablarTexto = useCallback((texto) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setEstado('escuchando');
      iniciar();
      return;
    }

    detenerTTS();
    detener(); // Detener micrófono para que la IA no se escuche a sí misma por los altavoces
    setEstado('hablando');

    const utter = new SpeechSynthesisUtterance(texto);
    activeUtteranceRef.current = utter;
    window.__fenixUtterance = utter; // Previene que el recolector de basura de Chrome destruya el objeto mid-speech

    // Seleccionar mejor voz en español disponible
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

    // Solución al bug de congelamiento de SpeechSynthesis en Chrome tras 14 segundos
    if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current);
    keepAliveTimerRef.current = setInterval(() => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(keepAliveTimerRef.current);
        keepAliveTimerRef.current = null;
      }
    }, 9000);

    const finalizarHabla = () => {
      if (keepAliveTimerRef.current) {
        clearInterval(keepAliveTimerRef.current);
        keepAliveTimerRef.current = null;
      }
      activeUtteranceRef.current = null;
      window.__fenixUtterance = null;

      // Breve gracia de 350ms para disipar cualquier eco residual en la habitación
      setTimeout(() => {
        setEstado('escuchando');
        setTranscripcionUsuario('');
        textoUsuarioPendienteRef.current = '';
        iniciar();
      }, 350);
    };

    utter.onend = finalizarHabla;
    utter.onerror = (e) => {
      console.warn('[VoiceModal] Error en TTS:', e);
      finalizarHabla();
    };

    try {
      window.speechSynthesis.speak(utter);
    } catch (e) {
      finalizarHabla();
    }
  }, [voces, detener, detenerTTS, iniciar]);

  // Enviar la consulta de voz al backend
  const enviarConsultaVoz = async (prompt) => {
    if (!prompt || !prompt.trim()) return;

    if (silencioTimerRef.current) clearTimeout(silencioTimerRef.current);
    setEstado('pensando');
    detener();

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          mensaje: prompt,
          idioma: 'español',
          webSearch: 'auto',
          canal: 'voz'
        })
      });

      if (!res.ok) {
        throw new Error(`Servidor respondió ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let respuestaTotal = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.texto) {
                respuestaTotal += data.texto;
              }
            } catch (e) {}
          }
        }
      }

      // Limpiar texto para síntesis de voz (eliminar marcadores, markdown denso, código)
      let textoLimpio = respuestaTotal
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/\[FENIX_CHART:[\s\S]*?\]/g, '')
        .replace(/\[ES_DOCUMENTO\]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/[*_#`]/g, '')
        .replace(/\n+/g, ' ')
        .trim();

      if (!textoLimpio) {
        textoLimpio = 'Lo tengo. ¿Qué más te gustaría saber?';
      }

      setRespuestaIA(textoLimpio);

      // Registrar en la conversación del chat si hay callback disponible
      if (typeof onEnviarMensaje === 'function') {
        try {
          onEnviarMensaje(prompt, { canalVoz: true });
        } catch (e) {}
      }

      hablarTexto(textoLimpio);
    } catch (err) {
      console.error('[VoiceModal] Error procesando voz:', err);
      hablarTexto('Disculpa, tuve un problema de conexión. ¿Podrías repetir tu pregunta?');
    }
  };

  // Manejar apertura y cierre del modal
  useEffect(() => {
    if (isOpen) {
      setEstado('escuchando');
      setTranscripcionUsuario('');
      setRespuestaIA('');
      textoUsuarioPendienteRef.current = '';
      const timer = setTimeout(() => {
        iniciar();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      detener();
      detenerTTS();
      if (silencioTimerRef.current) clearTimeout(silencioTimerRef.current);
    }
    return () => {
      detener();
      detenerTTS();
    };
  }, [isOpen, iniciar, detener, detenerTTS]);

  // Interacción al tocar el orbe central
  const manejarClickOrbe = () => {
    if (estado === 'hablando') {
      // Si la IA está hablando, tocar el orbe la interrumpe inmediatamente
      detenerTTS();
      setEstado('escuchando');
      setTranscripcionUsuario('');
      iniciar();
    } else if (estado === 'escuchando' && transcripcionUsuario.trim()) {
      // Si el usuario ya habló, tocar el orbe envía de inmediato sin esperar el temporizador
      enviarConsultaVoz(transcripcionUsuario.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="voice-modal-overlay">
      <div className="voice-modal-container">
        {/* Cabecera */}
        <div className="voice-modal-header">
          <div className="voice-brand">
            <span className="voice-brand-dot" />
            <span>Fenix Voz</span>
          </div>
          <button
            type="button"
            className="voice-close-btn"
            onClick={onClose}
            title="Cerrar modo voz"
          >
            ✕
          </button>
        </div>

        {/* Centro: Orbe Cósmico Reactivo */}
        <div className="voice-orb-stage">
          <div
            className={`voice-orb ${estado}`}
            onClick={manejarClickOrbe}
            style={{ cursor: 'pointer' }}
            title={estado === 'hablando' ? 'Toca para interrumpir' : (estado === 'escuchando' && transcripcionUsuario ? 'Toca para enviar' : '')}
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

        {/* Transcripción en vivo */}
        <div className="voice-transcript-box">
          {transcripcionUsuario && (
            <p className="voice-user-text">
              <strong>Tú:</strong> {transcripcionUsuario}
            </p>
          )}
          {respuestaIA && estado === 'hablando' && (
            <p className="voice-ai-text">
              <strong>Fenix:</strong> {respuestaIA}
            </p>
          )}
          {!transcripcionUsuario && !respuestaIA && (
            <p className="voice-hint">
              Pregúntame lo que quieras: noticias, clima, cotizaciones o cualquier tema de tu interés.
            </p>
          )}
        </div>

        {/* Barra de controles inferiores */}
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
            title={escuchando ? 'Silenciar micrófono' : 'Activar micrófono'}
          >
            {escuchando ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="voice-ctrl-btn voice-end-btn"
            onClick={onClose}
            title="Finalizar llamada de voz"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <rect x="6" y="6" width="12" height="12" rx="3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
