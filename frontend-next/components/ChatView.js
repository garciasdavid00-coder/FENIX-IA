'use client';

import { useState, useRef, useEffect } from 'react';
import MessageBubble from '@/components/MessageBubble';
import VoiceModal from '@/components/VoiceModal';
import FileAttachmentChip from '@/components/FileAttachmentChip';
import { useChat } from '@/context/ChatContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { procesarArchivo } from '@/lib/fileParser';

export default function ChatView({ mensajes, generando, onEnviarMensaje, detener }) {
  const { busquedaWeb, cambiarBusquedaWeb, nuevoChat, chatActualId, chats } = useChat();
  const chatActual = chats.find((c) => c.id === chatActualId);
  const estaBloqueado = !!(chatActual?.bloqueado || mensajes.some((m) => m.bloqueado));
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

  // Control inteligente de scroll sin vibraciones en móvil
  const autoScrollHabilitadoRef = useRef(true);
  const ultimosMensajesLongitudRef = useRef(mensajes.length);
  const textareaRef = useRef(null);

  const manejarScrollMensajes = () => {
    const el = containerRef.current;
    if (!el) return;
    const distAlFondo = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Si está a menos de 100px del fondo, mantener auto-scroll pegado
    autoScrollHabilitadoRef.current = distAlFondo < 100;
  };

  // Scroll directo en el contenedor sin mover la ventana ni el viewport móvil
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const esNuevoMensaje = mensajes.length !== ultimosMensajesLongitudRef.current;
    ultimosMensajesLongitudRef.current = mensajes.length;

    if (esNuevoMensaje) {
      autoScrollHabilitadoRef.current = true;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      return;
    }

    if (autoScrollHabilitadoRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [mensajes]);

  // Auto-ajustar altura del textarea al escribir
  const manejarCambioInput = (e) => {
    setTextoInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const manejarEnvio = () => {
    const texto = textoInput.trim();
    if ((!texto && !archivoAdjunto) || generando) return;

    const textoFinal = texto || (archivoAdjunto ? `Analiza este archivo adjunto: ${archivoAdjunto.nombre}` : '');
    onEnviarMensaje(textoFinal, { archivo: archivoAdjunto });
    setTextoInput('');
    setArchivoAdjunto(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
      <div className="messages" id="messages" ref={containerRef} onScroll={manejarScrollMensajes}>
        {mensajes.map((msg) => (
          <MessageBubble key={msg.id} mensaje={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de entrada inferior */}
      {estaBloqueado ? (
        <div className="chat-box chat-box-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', gap: '14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <span style={{ fontSize: '24px', lineHeight: 1 }}>🚫</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px' }}>Conversación finalizada</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Este chat fue cerrado debido al uso de lenguaje inapropiado o insultos.</div>
            </div>
          </div>
          <button
            type="button"
            className="btn-primario"
            style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px', whiteSpace: 'nowrap', cursor: 'pointer' }}
            onClick={nuevoChat}
          >
            + Iniciar nuevo chat
          </button>
        </div>
      ) : (
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
            ref={textareaRef}
            className="chat-input"
            placeholder={escuchando ? 'Escuchando tu voz...' : (archivoAdjunto ? `Escribe una pregunta sobre "${archivoAdjunto.nombre}" o presiona Enviar...` : 'Cuando quieras...')}
            rows={1}
            value={textoInput}
            onChange={manejarCambioInput}
            onKeyDown={manejarKeyDown}
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

            {/* Selector de búsqueda web activa/inactiva */}
            <button
              type="button"
              className={`websearch-toggle-btn ${busquedaWeb === 'on' ? 'active' : ''}`}
              onClick={cambiarBusquedaWeb}
              title={busquedaWeb === 'on' ? 'Búsqueda web activada (forzada)' : (busquedaWeb === 'off' ? 'Búsqueda web desactivada' : 'Búsqueda web automática')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{busquedaWeb === 'on' ? 'Web activa' : 'Buscar web'}</span>
            </button>

            <div className="chat-actions-right">
              {/* Botón dictado por voz (en el input) */}
              <button
                type="button"
                className={`mic-btn ${escuchando ? 'escuchando' : ''}`}
                onClick={manejarClickMic}
                title={escuchando ? 'Detener dictado' : 'Dictar mensaje'}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>

              {/* Botón modo conversación por voz (abre modal de voz interactivo) */}
              <button
                type="button"
                className="voice-mode-btn"
                onClick={() => setVoiceModalOpen(true)}
                title="Modo conversación de voz"
              >
                <div className="voice-mode-bars">
                  <span className="voice-mode-bar" />
                  <span className="voice-mode-bar" />
                  <span className="voice-mode-bar" />
                  <span className="voice-mode-bar" />
                </div>
              </button>

              {/* Botón enviar / detener */}
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
      )}

      {/* Modal de Conversación por Voz en Vivo */}
      <VoiceModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onEnviarMensaje={onEnviarMensaje}
      />
    </div>
  );
}
