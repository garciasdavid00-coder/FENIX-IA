'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/context/ChatContext';

export default function GreetingView({ onEnviarMensaje, generando, detener }) {
  const { usuario } = useAuth();
  const { busquedaWeb, cambiarBusquedaWeb } = useChat();
  const [textoInput, setTextoInput] = useState('');
  const [saludo, setSaludo] = useState('Vamos con todo');

  useEffect(() => {
    const hora = new Date().getHours();
    let frase = 'Buen día';
    if (hora >= 12 && hora < 19) frase = 'Buenas tardes';
    else if (hora >= 19 || hora < 6) frase = 'Buenas noches';

    const nombre = usuario?.nombre ? usuario.nombre.split(' ')[0] : '';
    setSaludo(nombre ? `${frase}, ${nombre}` : 'Vamos con todo');
  }, [usuario]);

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

  const usarPill = (promptSugerido) => {
    setTextoInput(promptSugerido);
  };

  return (
    <div className="center-content" id="vistaInicial">
      <h1 className="greeting" id="greetingText">
        {saludo}
      </h1>

      <div className="chat-box">
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
            onClick={() => alert('Selecciona un archivo para adjuntar a la conversación.')}
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
              onClick={() => alert('Funcionalidad de dictado')}
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

      {/* Pills de sugerencias */}
      <div className="pills">
        <div className="pill" onClick={() => usarPill('Crea un documento detallado sobre: ')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span>Documentos</span>
        </div>

        <div className="pill" onClick={() => usarPill('Genera una tabla u hoja de cálculo de: ')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          <span>Hojas</span>
        </div>

        <div className="pill" onClick={() => usarPill('Crea una estructura de presentación para: ')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <line x1="3" y1="20" x2="21" y2="20" />
          </svg>
          <span>Presentaciones</span>
        </div>

        <div className="pill" onClick={() => usarPill('Genera una imagen de: ')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>Imágenes</span>
        </div>

        <div className="pill" onClick={() => usarPill('Redacta un texto profesional sobre: ')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z" />
          </svg>
          <span>Escritura</span>
        </div>

        <div className="pill" onClick={() => usarPill('Resume el siguiente texto en puntos clave: ')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="16" y2="17" />
          </svg>
          <span>Resumen</span>
        </div>
      </div>
    </div>
  );
}
