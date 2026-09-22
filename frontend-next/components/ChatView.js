'use client';

import { useState, useRef, useEffect } from 'react';
import MessageBubble from '@/components/MessageBubble';
import VoiceModal from '@/components/VoiceModal';
import FileAttachmentChip from '@/components/FileAttachmentChip';
import { useChat } from '@/context/ChatContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { procesarArchivo } from '@/lib/fileParser';

export default function ChatView({ mensajes, generando, onEnviarMensaje, detener, statusIndicator }) {
  const { busquedaWeb, cambiarBusquedaWeb, nuevoChat, chatActualId, chats, setVoiceModalOpen } = useChat();
  const chatActual = chats.find((c) => c.id === chatActualId);
  const estaBloqueado = !!(chatActual?.bloqueado || mensajes.some((m) => m.bloqueado));
  const [textoInput, setTextoInput] = useState('');
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const textoBaseRef = useRef('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Dictado por voz en tiempo real
  const { escuchando, soportado, toggle: toggleDictado } = useSpeechRecognition({
    onResult: (texto) => {
      const base = textoBaseRef.current.trim();
      setTextoInput(base ? `${base} ${texto}` : texto);
    },
    onError: (err) => {
      if (err === 'not-allowed') {
        alert('Permiso de micrófono denegado. Por favor haz clic en el ícono de candado o controles del sitio junto a la barra de direcciones de tu navegador y permite el acceso al micrófono.');
      } else if (err === 'no-soportado') {
        alert('Tu navegador no soporta el reconocimiento de voz por Web Speech API. Te recomendamos usar Google Chrome o Microsoft Edge.');
      }
    }
  });

  const manejarClickMic = () => {
    if (!soportado && typeof window !== 'undefined' && !(window.SpeechRecognition || window.webkitSpeechRecognition)) {
      alert('Tu navegador no soporta el reconocimiento de voz nativo. Prueba en Google Chrome o Microsoft Edge.');
      return;
    }
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
  const [mostrarBotonBajar, setMostrarBotonBajar] = useState(false);

  const manejarScrollMensajes = () => {
    const el = containerRef.current;
    if (!el) return;
    const distAlFondo = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Si está a menos de 100px del fondo, mantener auto-scroll pegado
    autoScrollHabilitadoRef.current = distAlFondo < 100;
    setMostrarBotonBajar(distAlFondo > 150);
  };

  const bajarAlFondo = () => {
    const el = containerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      autoScrollHabilitadoRef.current = true;
      setMostrarBotonBajar(false);
    }
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
        {mensajes.map((msg, index) => (
          <MessageBubble key={msg.id} mensaje={msg} statusIndicator={index === mensajes.length - 1 ? statusIndicator : null} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Botón flotante Ir al fondo */}
      {mostrarBotonBajar && (
        <button
          onClick={bajarAlFondo}
          className="scroll-to-bottom-btn"
          aria-label="Ir al final"
          title="Ir al último mensaje"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

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

            <div className="right-actions">
              {/* Selector de búsqueda web activa/inactiva */}
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

              {/* Modo Conversación por Voz en Vivo */}
              <button
                type="button"
                className="voice-call-btn"
                onClick={() => setVoiceModalOpen(true)}
                title="Voz en vivo (Modo conversación)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M12 3v18" />
                  <path d="M8 7v10" />
                  <path d="M16 7v10" />
                  <path d="M4 11v2" />
                  <path d="M20 11v2" />
                </svg>
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


    </div>
  );
}
