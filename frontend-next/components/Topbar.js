'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { getGoogleAuthUrl } from '@/lib/api';

const NOMBRES_MODELOS = {
  auto: 'Fenix 2.0 (Auto)',
  groq: 'Groq (Llama 3.3)',
  gemini: 'Gemini 1.5 Flash',
  deepseek: 'DeepSeek V3',
};

export default function Topbar() {
  const { toggleSidebar, modeloSeleccionado, cambiarModelo, tema, toggleTema } = useChat();
  const { usuario, autenticado } = useAuth();
  const [menuModeloAbierto, setMenuModeloAbierto] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuModeloAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="toggle-btn-topbar"
          id="toggleTopbar"
          onClick={toggleSidebar}
          title="Alternar barra lateral"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 20c4-1 6-5 6-9s2-8 6-9M4 20c2-4 2-9 6-13" />
          </svg>
        </button>
      </div>

      <div className="topbar-center" style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          type="button"
          className="model-select"
          id="modeloSelectBtn"
          onClick={() => setMenuModeloAbierto((prev) => !prev)}
        >
          <span id="modeloTextoActual">
            {NOMBRES_MODELOS[modeloSeleccionado] || 'Fenix 2.0'}
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {menuModeloAbierto && (
          <div
            className="dropdown-menu"
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              minWidth: '220px',
            }}
          >
            <div className="dropdown-submenu-label">Selecciona el motor de IA</div>
            {Object.entries(NOMBRES_MODELOS).map(([clave, nombre]) => (
              <div
                key={clave}
                className="dropdown-item"
                style={{
                  fontWeight: modeloSeleccionado === clave ? 700 : 400,
                  backgroundColor: modeloSeleccionado === clave ? 'var(--surface-hover)' : undefined,
                }}
                onClick={() => {
                  cambiarModelo(clave);
                  setMenuModeloAbierto(false);
                }}
              >
                <span>{modeloSeleccionado === clave ? '✓ ' : '  '}</span>
                <span>{nombre}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-right">
        {/* Toggle de tema claro / oscuro */}
        <button
          type="button"
          className="toggle-btn"
          onClick={toggleTema}
          title={tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {tema === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Estado de autenticación */}
        {autenticado && usuario ? (
          <div className="user-conectado">
            {usuario.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={usuario.foto} alt={usuario.nombre} className="user-avatar" />
            ) : (
              <span className="user-nombre">{usuario.nombre}</span>
            )}
          </div>
        ) : (
          <a href={getGoogleAuthUrl()} className="signup-btn" style={{ textDecoration: 'none' }}>
            Acceder
          </a>
        )}
      </div>
    </header>
  );
}
