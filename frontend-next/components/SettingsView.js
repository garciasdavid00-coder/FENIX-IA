'use client';

import { useChat } from '@/context/ChatContext';

export default function SettingsView() {
  const { setVistaActiva, tema, toggleTema, modeloSeleccionado, cambiarModelo } = useChat();

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
      </div>
    </div>
  );
}
