'use client';

import { useChat } from '@/context/ChatContext';

export default function ProjectsView() {
  const { setVistaActiva } = useChat();

  return (
    <div className="panel-view" id="vistaProyectos">
      <div className="panel-header">
        <button type="button" className="btn-volver" onClick={() => setVistaActiva('chat')}>
          ← Volver al chat
        </button>
        <h2>Proyectos</h2>
        <button
          type="button"
          className="btn-primario"
          onClick={() => alert('Crear nuevo proyecto')}
        >
          + Nuevo proyecto
        </button>
      </div>

      <div className="panel-grid">
        <div className="empty-state">
          No tienes proyectos creados todavía. Haz clic en <strong>+ Nuevo proyecto</strong> para comenzar.
        </div>
      </div>
    </div>
  );
}
