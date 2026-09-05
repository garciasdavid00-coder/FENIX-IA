'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';

const IDIOMAS = [
  { codigo: 'es', nombre: 'Español' },
  { codigo: 'en', nombre: 'English' },
  { codigo: 'pt', nombre: 'Português' },
  { codigo: 'fr', nombre: 'Français' },
  { codigo: 'de', nombre: 'Deutsch' },
  { codigo: 'ja', nombre: '日本語' },
  { codigo: 'zh', nombre: '中文' },
  { codigo: 'ar', nombre: 'العربية' },
];

export default function SettingsView() {
  const {
    setVistaActiva,
    tema,
    toggleTema,
    modeloSeleccionado,
    cambiarModelo,
    chats,
    setChats,
    proyectos,
    setProyectos,
    setChatActualId,
    nuevoChat,
  } = useChat();

  const [guardarHistorial, setGuardarHistorial] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('fenixGuardarHistorial') !== 'no';
  });
  const [systemPrompt, setSystemPrompt] = useState('');
  const [idioma, setIdioma] = useState('es');

  useEffect(() => {
    const prompt = localStorage.getItem('fenixSystemPrompt') || '';
    setSystemPrompt(prompt);
    const idiomaGuardado = localStorage.getItem('fenixIdioma') || 'es';
    setIdioma(idiomaGuardado);
  }, []);

  const manejarCambiarHistorial = () => {
    const nuevo = !guardarHistorial;
    setGuardarHistorial(nuevo);
    localStorage.setItem('fenixGuardarHistorial', nuevo ? 'si' : 'no');
  };

  const manejarCambiarSystemPrompt = (e) => {
    setSystemPrompt(e.target.value);
    localStorage.setItem('fenixSystemPrompt', e.target.value);
  };

  const manejarCambiarIdioma = (e) => {
    setIdioma(e.target.value);
    localStorage.setItem('fenixIdioma', e.target.value);
  };

  const manejarBorrarTodo = () => {
    if (!window.confirm('¿Seguro que quieres borrar todos los chats, proyectos y archivos?')) return;
    chats.forEach((c) => c.id && localStorage.removeItem(`fenixChat_${c.id}`));
    localStorage.removeItem('fenixHistorial');
    localStorage.removeItem('fenixChats');
    localStorage.removeItem('fenixProyectos');
    setChats([]);
    setProyectos([]);
    setChatActualId(null);
    nuevoChat();
    window.alert('Historial eliminado');
  };

  return (
    <div className="panel-view" id="vistaConfiguracion">
      <div className="panel-header">
        <button type="button" className="btn-volver" onClick={() => setVistaActiva('chat')}>
          ← Volver al chat
        </button>
        <h2>Configuración</h2>
        <div />
      </div>

      <div className="config-container">
        {/* Sección Idioma */}
        <div className="config-section">
          <div className="config-section-header">
            <h3>Idioma</h3>
          </div>
          <div className="config-row">
            <div className="config-info">
              <div className="config-label">Idioma de la interfaz</div>
              <div className="config-desc">Idioma en el que Fenix IA responde.</div>
            </div>
            <div className="config-select-wrap">
              <select
                className="config-select"
                value={idioma}
                onChange={manejarCambiarIdioma}
              >
                {IDIOMAS.map((i) => (
                  <option key={i.codigo} value={i.codigo}>
                    {i.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sección Apariencia */}
        <div className="config-section">
          <div className="config-section-header">
            <h3>Apariencia</h3>
          </div>
          <div className="config-row">
            <div className="config-info">
              <div className="config-label">Tema de la interfaz</div>
              <div className="config-desc">Alterna entre modo claro y modo oscuro.</div>
            </div>
            <div className="toggle-switch" onClick={toggleTema}>
              <div className={`toggle-track ${tema === 'dark' ? 'on' : ''}`}>
                <div className="toggle-thumb" />
              </div>
              <span className="toggle-label">{tema === 'dark' ? 'Oscuro' : 'Claro'}</span>
            </div>
          </div>
        </div>

        {/* Sección Inteligencia Artificial */}
        <div className="config-section">
          <div className="config-section-header">
            <h3>Inteligencia Artificial</h3>
          </div>
          <div className="config-row">
            <div className="config-info">
              <div className="config-label">Modelo por defecto</div>
              <div className="config-desc">Motor que procesará tus consultas al iniciar un chat.</div>
            </div>
            <div className="config-select-wrap">
              <select
                className="config-select"
                value={modeloSeleccionado}
                onChange={(e) => cambiarModelo(e.target.value)}
              >
                <option value="auto">Fenix 2.0 (Automático)</option>
                <option value="groq">Groq (Llama 3.3 70B)</option>
                <option value="gemini">Gemini 2.5 Flash</option>
                <option value="deepseek">DeepSeek V3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección Personalidad */}
        <div className="config-section">
          <div className="config-section-header">
            <h3>Personalidad</h3>
          </div>
          <div className="config-row">
            <div className="config-info">
              <div className="config-label">Prompt del sistema</div>
              <div className="config-desc">
                Define cómo Fenix IA se comporta y responde. Se guarda automáticamente.
              </div>
            </div>
          </div>
          <div className="config-row">
            <textarea
              className="config-textarea"
              placeholder="Escribe aquí las instrucciones de personalidad para Fenix IA..."
              value={systemPrompt}
              onChange={manejarCambiarSystemPrompt}
              rows={5}
            />
          </div>
        </div>

        {/* Sección Privacidad */}
        <div className="config-section">
          <div className="config-section-header">
            <h3>Privacidad</h3>
          </div>
          <div className="config-row">
            <div className="config-info">
              <div className="config-label">Guardar historial</div>
              <div className="config-desc">
                Guarda tus conversaciones localmente en el navegador.
              </div>
            </div>
            <div className="toggle-switch" onClick={manejarCambiarHistorial}>
              <div className={`toggle-track ${guardarHistorial ? 'on' : ''}`}>
                <div className="toggle-thumb" />
              </div>
              <span className="toggle-label">{guardarHistorial ? 'Activado' : 'Desactivado'}</span>
            </div>
          </div>
          <div className="config-row">
            <div className="config-info">
              <div className="config-label">Borrar todo</div>
              <div className="config-desc">
                Elimina todos los chats, proyectos y archivos de este dispositivo.
              </div>
            </div>
            <button type="button" className="btn-peligro" onClick={manejarBorrarTodo}>
              Borrar todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}