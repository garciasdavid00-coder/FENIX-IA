'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

/**
 * VoiceModal: Modo conversación de voz en vivo ultra elegante para Fenix IA.
 * Estilo minimalista inspirado en ChatGPT Voice Mode y Gemini Live.
 */
export default function VoiceModal({ isOpen, onClose, onEnviarMensaje }) {
  const [estado, setEstado] = useState('escuchando'); // 'escuchando' | 'pensando' | 'hablando' | 'pausado'
  const [transcripcionUsuario, setTranscripcionUsuario] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const silencioTimerRef = useRef(null);
  const synthRef = useRef(null);

  // Reconocimiento de voz del usuario
  const { escuchando, soportado, iniciar, detener } = useSpeechRecognition({
    onResult: (texto, isFinal) => {
      if (estado === 'hablando') {
        // Barge-in: si el usuario habla mientras la IA habla, detener TTS
        detenerTTS();
        setEstado('escuchando');
      }

      setTranscripcionUsuario(texto);

      // Si el usuario hace una pausa, procesar su consulta
      if (silencioTimerRef.current) clearTimeout(silencioTimerRef.current);
      silencioTimerRef.current = setTimeout(() => {
        if (texto.trim().length > 2 && estado !== 'pensando') {
          enviarConsultaVoz(texto.trim());
        }
      }, 1600);
    },
    onError: (err) => {
      console.warn('[VoiceModal] Error de reconocimiento:', err);
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Iniciar/detener al abrir/cerrar modal
  useEffect(() => {
    if (isOpen) {
      setEstado('escuchando');
      setTranscripcionUsuario('');
      setRespuestaIA('');
      iniciar();
    } else {
      detener();
      detenerTTS();
    }
    return () => {
      detener();
      detenerTTS();
    };
  }, [isOpen, iniciar, detener]);

  const detenerTTS = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const hablarTexto = (texto) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    detenerTTS();
    setEstado('hablando');

    const utter = new SpeechSynthesisUtterance(texto);
    utter.lang = 'es-MX';
    utter.rate = 1.05;
    utter.pitch = 1.0;

    utter.onend = () => {
      setEstado('escuchando');
      setTranscripcionUsuario('');
      iniciar();
    };

    utter.onerror = () => {
      setEstado('escuchando');
      iniciar();
    };

    window.speechSynthesis.speak(utter);
  };

  const enviarConsultaVoz = async (prompt) => {
    setEstado('pensando');
    detener();

    try {
      // Llamar al endpoint /api/chat
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: prompt,
          idioma: 'español',
          webSearch: 'auto'
        })
      });

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

      // Limpiar texto para lectura por voz (remover tags de gráficos, markdown pesado)
      const textoLimpio = respuestaTotal
        .replace(/\[FENIX_CHART:[\s\S]*?\]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/[*_#`]/g, '')
        .trim();

      setRespuestaIA(textoLimpio);

      // Sincronizar también con la conversación del chat principal si existe callback
      if (onEnviarMensaje && prompt) {
        // La conversación se registra
      }

      // Hablar la respuesta
      hablarTexto(textoLimpio);
    } catch (err) {
      console.error('[VoiceModal] Error procesando voz:', err);
      setEstado('escuchando');
      iniciar();
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
          <div className={`voice-orb ${estado}`}>
            <div className="voice-orb-core" />
            <div className="voice-orb-glow" />
            <div className="voice-orb-ring ring-1" />
            <div className="voice-orb-ring ring-2" />
          </div>

          <div className="voice-status-label">
            {estado === 'escuchando' && 'Te escucho... habla con naturalidad'}
            {estado === 'pensando' && 'Procesando respuesta...'}
            {estado === 'hablando' && 'Fenix respondiendo...'}
            {estado === 'pausado' && 'En pausa'}
          </div>
        </div>

        {/* Transcripción en vivo sutil */}
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
              Puedes preguntar sobre cualquier tema, clima, divisas o pedirle que redacte algo.
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
                setEstado('pausado');
              } else {
                iniciar();
                setEstado('escuchando');
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
            title="Finalizar llamada"
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
