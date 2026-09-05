'use client';

import { useChat } from '@/context/ChatContext';

export default function ProjectsView() {
  const {
    proyectos,
    crearProyecto,
    eliminarProyecto,
    abrirProyecto,
    cerrarProyecto,
    proyectoActualId,
    nuevoChatEnProyecto,
    chats,
    seleccionarChat,
    eliminarChat,
    setVistaActiva,
  } = useChat();

  const proyecto = proyectoActualId
    ? proyectos.find((p) => p.id === proyectoActualId)
    : null;

  const manejarCrear = () => {
    const nombre = window.prompt('Nombre del proyecto:');
    if (nombre && nombre.trim()) crearProyecto(nombre);
  };

  // --- VISTA DETALLE: chats del proyecto ---
  if (proyecto) {
    const chatsProyecto = chats.filter((c) => c.proyectoId === proyecto.id);

    return (
      <div className="panel-view" id="vistaProyectoDetalle">
        <div className="panel-header">
          <button type="button" className="btn-volver" onClick={cerrarProyecto}>
            ← Volver a proyectos
          </button>
          <h2>{proyecto.nombre}</h2>
          <button type="button" className="btn-primario" onClick={nuevoChatEnProyecto}>
            + Nuevo chat
          </button>
        </div>

        <div className="panel-grid">
          {chatsProyecto.length === 0 ? (
            <div className="empty-state">
              Aún no hay chats en este proyecto. El primer mensaje que envíes se guardará aquí.
            </div>
          ) : (
            chatsProyecto.map((chat) => (
              <div
                key={chat.id}
                className="card-item"
                role="button"
                tabIndex={0}
                onClick={() => seleccionarChat(chat.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') seleccionarChat(chat.id);
                }}
              >
                <button
                  type="button"
                  className="card-item-del"
                  aria-label="Eliminar chat"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`¿Eliminar el chat "${chat.titulo}"?`)) eliminarChat(chat.id);
                  }}
                >
                  ×
                </button>
                <div className="card-item-title">
                  {chat.pinned ? '📌 ' : ''}
                  {chat.titulo}
                </div>
                <div className="card-item-sub">
                  {chat.mensajes.length} mensaje{chat.mensajes.length === 1 ? '' : 's'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // --- VISTA LISTA DE PROYECTOS ---
  return (
    <div className="panel-view" id="vistaProyectos">
      <div className="panel-header">
        <button type="button" className="btn-volver" onClick={() => setVistaActiva('chat')}>
          ← Volver al chat
        </button>
        <h2>Proyectos</h2>
        <button type="button" className="btn-primario" onClick={manejarCrear}>
          + Nuevo proyecto
        </button>
      </div>

      <div className="panel-grid">
        {proyectos.length === 0 ? (
          <div className="empty-state">
            No tienes proyectos creados todavía. Haz clic en{' '}
            <strong>+ Nuevo proyecto</strong> para comenzar.
          </div>
        ) : (
          proyectos.map((p) => {
            const cantidadChats = chats.filter((c) => c.proyectoId === p.id).length;
            return (
              <div
                key={p.id}
                className="card-item"
                role="button"
                tabIndex={0}
                onClick={() => abrirProyecto(p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') abrirProyecto(p.id);
                }}
              >
                <button
                  type="button"
                  className="card-item-del"
                  aria-label="Eliminar proyecto"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`¿Eliminar el proyecto "${p.nombre}"?`)) {
                      eliminarProyecto(p.id);
                    }
                  }}
                >
                  ×
                </button>
                <div className="card-item-title">{p.nombre}</div>
                <div className="card-item-sub">
                  {cantidadChats} chat{cantidadChats === 1 ? '' : 's'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}