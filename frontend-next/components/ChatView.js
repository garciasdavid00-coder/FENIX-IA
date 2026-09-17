'use client';

import { useState, useRef, useEffect } from 'react';
import MessageBubble from '@/components/MessageBubble';
import VoiceModal from '@/components/VoiceModal';
import FileAttachmentChip from '@/components/FileAttachmentChip';
import { useChat } from '@/context/ChatContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { procesarArchivo } from '@/lib/fileParser';

export default function ChatView({ mensajes, generando, onEnviarMensaje, detener }) {
  const { busquedaWeb, cambiarBusquedaWeb } = useChat();
  const [textoInput, setTextoInput] = useState('');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const textoBaseRef = useRef('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Dictado por voz en tiempo real
  const { escuchando, toggle: toggleDictado } = useSpeechRecognition({
    onResult: (texto) => {
      const base = textoBaseRef.current.trim();
      setTextoInput(base ? `${base} ${texto}` : texto);
    }
  });

  const manejarClickMic = () => {
    textoBaseRef.current = textoInput;
    toggleDictado();
  };

  const manejarSeleccionArchivo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const proc = await procesarArchivo(file);
      setArchivoAdjunto(proc);
    } catch (err) {
      alert(err.message || 'No se pudo procesar el archivo');
    }
    e.target.value = '';
  };

  const manejarDrop = async (e) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      const proc = await procesarArchivo(file);
      setArchivoAdjunto(proc);
    } catch (err) {
      alert(err.message || 'No se pudo procesar el archivo');
    }
  };

  // Auto-scroll al final del chat al recibir nuevos tokens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes]);

  const manejarEnvio = () => {
    const texto = textoInput.trim();
    if ((!texto && !archivoAdjunto) || generando) return;

    const textoFinal = texto || (archivoAdjunto ? `Analiza este archivo adjunto: ${archivoAdjunto.nombre}` : '');
    onEnviarMensaje(textoFinal, { archivo: archivoAdjunto });
    setTextoInput('');
    setArchivoAdjunto(null);
  };

  const manejarKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      manejarEnvio();
    }
  };

  return (
    <div className="chat-view" id="vistaChat">
      {/* Contenedor de burbujas de mensajes */}
      <div className="messages" id="messages" ref={containerRef}>
        {mensajes.map((msg) => (
          <MessageBubble key={msg.id} mensaje={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de entrada inferior */}
      <div
        className={`chat-box chat-box-bottom ${arrastrando ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={manejarDrop}
      >
        {/* Chip de archivo adjunto si el usuario cargó uno */}
        {archivoAdjunto && (
          <div className="attached-file-preview-area">
            <FileAttachmentChip
              archivo={archivoAdjunto}
              onRemover={() => setArchivoAdjunto(null)}
            />
          </div>
        )}

        <textarea
          className="chat-input"
          placeholder={escuchando ? 'Escuchando tu voz...' : (archivoAdjunto ? `Escribe una pregunta sobre "${archivoAdjunto.nombre}" o presiona Enviar...` : 'Cuando quieras...')}
          rows={1}
          value={textoInput}
          onChange={(e) => setTextoInput(e.target.value)}
          onKeyDown={manejarKeyDown}
          autoFocus
        />

        {/* Input de archivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={manejarSeleccionArchivo}
          style={{ display: 'none' }}
          accept=".txt,.md,.pdf,.doc,.docx,.csv,.json,.js,.jsx,.ts,.tsx,.py,.html,.css,.sql,image/*"
        />

        <div className="chat-actions">
          <button
            type="button"
            className="plus-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Adjuntar archivo, documento o imagen"
          >
            +
          </button>
          <div className="right-actions">
            <button
              type="button"
              className={`web-btn ${busquedaWeb === 'on' ? 'forzado' : busquedaWeb === 'auto' ? 'activo' : 'apagado'}`}
              onClick={cambiarBusquedaWeb}
              title={
                busquedaWeb === 'auto'
                  ? 'Búsqueda Web: Automática (se activa si la pregunta lo requiere)'
                  : busquedaWeb === 'on'
                    ? 'Búsqueda Web: Activada para todos los mensajes'
                    : 'Búsqueda Web: Desactivada'
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 010 20 15.3 15.3 0 010-20z" />
              </svg>
            </button>

            {/* Dictado por voz directo en caja de texto */}
            <button
              type="button"
              className={`mic-btn ${escuchando ? 'grabando activo' : ''}`}
              onClick={manejarClickMic}
              title={escuchando ? 'Detener dictado (escuchando...)' : 'Dictar por voz'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
            </button>

            {/* Modo Conversación por Voz en Vivo (Llamada) */}
            <button
              type="button"
              className="voice-call-btn"
              onClick={() => setVoiceModalOpen(true)}
              title="Modo Conversación de Voz en Vivo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
                <path d="M12 3v18" />
                <path d="M8 7v10" />
                <path d="M16 7v10" />
                <path d="M4 11v2" />
                <path d="M20 11v2" />
              </svg>
            </button>

            {generando ? (
              <button
                type="button"
                className="send-btn stop-btn"
                onClick={detener}
                title="Detener respuesta"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className="send-btn"
                onClick={manejarEnvio}
                disabled={!textoInput.trim() && !archivoAdjunto}
                title="Enviar mensaje"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Conversación por Voz en Vivo */}
      <VoiceModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onEnviarMensaje={onEnviarMensaje}
      />
    </div>
  );
}
