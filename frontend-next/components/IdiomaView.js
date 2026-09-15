'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';

const IDIOMAS = [
  { codigo: 'es', nombre: 'Español', bandera: '🇪🇸' },
  { codigo: 'en', nombre: 'English', bandera: '🇬🇧' },
  { codigo: 'pt', nombre: 'Português', bandera: '🇵🇹' },
  { codigo: 'fr', nombre: 'Français', bandera: '🇫🇷' },
  { codigo: 'de', nombre: 'Deutsch', bandera: '🇩🇪' },
  { codigo: 'ja', nombre: '日本語', bandera: '🇯🇵' },
  { codigo: 'zh', nombre: '中文', bandera: '🇨🇳' },
  { codigo: 'ar', nombre: 'العربية', bandera: '🇸🇦' },
];

/**
 * Vista de selección de idioma, equivalente a la vista legacy #vistaIdioma
 * (legacy/index.html líneas 351-403). Marca una tarjeta temporalmente y
 * al pulsar Aceptar persiste 'fenixIdioma' y vuelve a Configuración,
 * igual que confirmarIdioma() (legacy/script.js línea 3688).
 */
export default function IdiomaView() {
  const { setVistaActiva } = useChat();
  const [temporal, setTemporal] = useState('es');

  useEffect(() => {
    const guardado = localStorage.getItem('fenixIdioma') || 'es';
    setTemporal(guardado);
  }, []);

  const confirmar = () => {
    localStorage.setItem('fenixIdioma', temporal);
    setVistaActiva('configuracion');
  };

  return (
    <div className="panel-view">
      <div className="lang-container">
        <button type="button" className="btn-volver" onClick={() => setVistaActiva('configuracion')}>
          ← Volver
        </button>
        <div className="lang-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 010 20 15.3 15.3 0 010-20z" />
          </svg>
          <h2>Idioma</h2>
          <p className="lang-subtitle">Selecciona el idioma en el que la IA responderá</p>
        </div>
        <div className="lang-grid">
          {IDIOMAS.map((i) => (
            <div
              key={i.codigo}
              className={`lang-card ${temporal === i.codigo ? 'active' : ''}`}
              onClick={() => setTemporal(i.codigo)}
            >
              <span className="lang-flag">{i.bandera}</span>
              <span className="lang-name">{i.nombre}</span>
              <svg
                className="lang-check"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ))}
        </div>
        <button type="button" className="btn-primario lang-aceptar" onClick={confirmar}>
          Aceptar
        </button>
      </div>
    </div>
  );
}