'use client';

import { useState, useRef, useEffect } from 'react';
import MessageBubble from '@/components/MessageBubble';
import { useChat } from '@/context/ChatContext';

export default function ChatView({ mensajes, generando, onEnviarMensaje, detener }) {
  const { busquedaWeb, cambiarBusquedaWeb } = useChat();
  const [textoInput, setTextoInput] = useState('');
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll al final del chat al recibir nuevos tokens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes]);

  const manejarEnvio = () => {
    if (!textoInput.trim() || generando) return;
    onEnviarMensaje(textoInput);
    setTextoInput('');
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
      <div className="chat-box chat-box-bottom">
        <textarea
          className="chat-input"
          placeholder="Cuando quieras..."
          rows={1}
          value={textoInput}
          onChange={(e) => setTextoInput(e.target.value)}
          onKeyDown={manejarKeyDown}
          autoFocus
        />
        <div className="chat-actions">
          <button
            type="button"
            className="plus-btn"
            onClick={() => alert('Selecciona un archivo para adjuntar.')}
            title="Adjuntar archivo"
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

            <button
              type="button"
              className="mic-btn"
              onClick={() => alert('Dictado por voz')}
              title="Dictado por voz"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
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
                disabled={!textoInput.trim()}
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
    </div>
  );
}
