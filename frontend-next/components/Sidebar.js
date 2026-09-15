'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/UserMenu';

export default function Sidebar() {
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    toggleSidebar,
    nuevoChat,
    seleccionarChat,
    eliminarChat,
    togglePinChat,
    chats,
    chatActualId,
    filtroBuscar,
    setFiltroBuscar,
    busquedaVisible,
    setBusquedaVisible,
    setVistaActiva,
  } = useChat();

  const { usuario, autenticado } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuChatAbierto, setMenuChatAbierto] = useState(null);
  const userMenuRef = useRef(null);

  // Cerrar menús flotantes al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (!event.target.closest('.recent-item')) {
        setMenuChatAbierto(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const chatsFiltrados = chats
    .filter((c) => !filtroBuscar || c.titulo.toLowerCase().includes(filtroBuscar.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <>
      {/* Backdrop para cerrar en móvil */}
      <div
        className={`sidebar-backdrop ${sidebarMobileOpen ? 'show' : ''}`}
        onClick={() => setSidebarMobileOpen(false)}
      />

      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarMobileOpen ? 'mobile-open' : ''}`}
        id="sidebar"
      >
        {/* Marca / Logo */}
        <div className="brand">
          <div className="brand-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 20c4-1 6-5 6-9s2-8 6-9M4 20c2-4 2-9 6-13" />
            </svg>
            <span>Fenix IA</span>
          </div>
          <button type="button" className="toggle-btn" onClick={toggleSidebar} title="Ocultar barra lateral">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="9" y1="4" x2="9" y2="20" />
            </svg>
          </button>
        </div>

        {/* Acciones principales de navegación */}
        <div className="nav-item" onClick={nuevoChat}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Nuevo chat</span>
        </div>

        <div className="nav-item" onClick={() => setBusquedaVisible((prev) => !prev)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Buscar</span>
        </div>

        <div className="nav-item" onClick={() => setVistaActiva('proyectos')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
          <span>Proyectos</span>
        </div>

        <div className="nav-item" onClick={() => setVistaActiva('biblioteca')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          <span>Biblioteca</span>
        </div>

        <div className="nav-item" onClick={() => setVistaActiva('memoria')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 4h6a2 2 0 012 2v14l-5-3-5 3V6a2 2 0 012-2z" />
          </svg>
          <span>Memoria</span>
        </div>

        <div className="divider" />

        {/* Buscador de historial */}
        {busquedaVisible && (
          <input
            type="text"
            className="buscar-input"
            placeholder="Buscar en el historial..."
            value={filtroBuscar}
            onChange={(e) => setFiltroBuscar(e.target.value)}
            autoFocus
          />
        )}

        <div className="recent-label">Recientes</div>

        {/* Lista de chats recientes */}
        <div className="sidebar-scroll-area">
          {chatsFiltrados.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '10px' }}>
              {filtroBuscar ? 'Sin resultados' : 'Sin conversaciones'}
            </div>
          ) : (
            chatsFiltrados.map((c) => (
              <div
                key={c.id}
                className={`recent-item ${chatActualId === c.id ? 'active' : ''}`}
                style={{
                  backgroundColor: chatActualId === c.id ? 'var(--hover-overlay-soft)' : undefined,
                  fontWeight: chatActualId === c.id ? 600 : 400,
                }}
              >
                <span
                  className="recent-item-nombre"
                  onClick={() => seleccionarChat(c.id)}
                  title={c.titulo}
                >
                  {c.pinned ? '📌 ' : ''}
                  {c.titulo}
                </span>

                <button
                  type="button"
                  className="menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuChatAbierto(menuChatAbierto === c.id ? null : c.id);
                  }}
                  title="Más opciones"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                  </svg>
                </button>

                {menuChatAbierto === c.id && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        togglePinChat(c.id);
                        setMenuChatAbierto(null);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7z" />
                      </svg>
                      <span>{c.pinned ? 'Desanclar' : 'Anclar chat'}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <div
                      className="dropdown-item peligro"
                      onClick={() => {
                        eliminarChat(c.id);
                        setMenuChatAbierto(null);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      <span>Eliminar chat</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sección de usuario fija abajo */}
        <div className="sidebar-user" ref={userMenuRef}>
          <div
            className="sidebar-user-trigger"
            onClick={() => setUserMenuOpen((prev) => !prev)}
          >
            <div className="sidebar-user-avatar">
              {autenticado && usuario?.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={usuario.foto} alt={usuario.nombre || 'Avatar'} />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {autenticado && usuario?.nombre ? usuario.nombre : 'Invitado'}
              </div>
              <div className="sidebar-user-email">
                {autenticado && usuario?.correo ? usuario.correo : ''}
              </div>
            </div>
            <svg
              className={`sidebar-user-arrow ${userMenuOpen ? 'open' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {/* Menú emergente hacia arriba (fiel al menú legacy completo) */}
          <UserMenu abierto={userMenuOpen} onCerrar={() => setUserMenuOpen(false)} />
        </div>
      </aside>
    </>
  );
}
