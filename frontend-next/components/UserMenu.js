'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { getGoogleAuthUrl } from '@/lib/api';

/**
 * Menú de usuario del sidebar, fiel al menú legacy en vanilla JS
 * (legacy/index.html líneas 66-116 y legacy/script.js líneas 2858-3054).
 *
 * Orden de opciones: Cuenta, Configuración, Idioma, Obtener ayuda,
 * Mejorar plan, Obtener aplicaciones y extensiones, Más información,
 * y según el estado de sesión: Iniciar sesión con Google (invitado)
 * o Cerrar sesión (logueado).
 *
 * Los modales se renderizan con createPortal a document.body para que
 * el position:fixed no quede atrapado por el transform del sidebar móvil.
 *
 * SEGURIDAD: "Mejorar plan" es solo informativo, NO toca ningún endpoint
 * ni cambia el plan real (bug #2 sigue sin reactivar). Elegir plan solo
 * muestra el aviso de "pago próximamente", igual que elegirPlan() legacy.
 */
export default function UserMenu({ abierto = false, onCerrar = () => {} }) {
  const { setVistaActiva, nuevoChat } = useChat();
  const { usuario, autenticado, logout } = useAuth();

  // null | 'cuenta' | 'ayuda' | 'plan' | 'apps' | 'info'
  const [modal, setModal] = useState(null);
  // nombre del plan elegido para mostrar el aviso (nunca se aplica)
  const [planElegido, setPlanElegido] = useState(null);

  const cerrarMenu = () => onCerrar();

  const abrirModal = (nombre) => {
    cerrarMenu();
    setModal(nombre);
  };

  const cerrarModal = () => {
    setModal(null);
    setPlanElegido(null);
  };

  const manejarCuenta = () => abrirModal('cuenta');
  const manejarConfiguracion = () => {
    cerrarMenu();
    setVistaActiva('configuracion');
  };
  const manejarIdioma = () => {
    cerrarMenu();
    setVistaActiva('idioma');
  };
  const manejarAyuda = () => abrirModal('ayuda');
  const manejarMejorarPlan = () => abrirModal('plan');
  const manejarAplicaciones = () => abrirModal('apps');
  const manejarInfo = () => abrirModal('info');

  const manejarCerrarSesion = () => {
    cerrarMenu();
    logout();
  };

  // Solo informa del plan elegido; el cambio real queda bloqueado
  const elegirPlan = (nombre) => {
    setModal(null); // cierra el modal de planes y muestra el aviso (como elegirPlan() legacy)
    setPlanElegido(nombre);
  };

  const irNuevoChatAyuda = () => {
    cerrarModal();
    nuevoChat();
  };

  const modales = [];

  if (modal === 'cuenta') {
    modales.push(
      <div
        key="cuenta"
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) cerrarModal();
        }}
      >
        <div className="modal">
          <h3 className="modal-title">Mi cuenta</h3>
          {autenticado && usuario ? (
            <>
              <p className="modal-text">
                <strong>{usuario.nombre || 'Invitado'}</strong>
                {usuario.correo ? (
                  <>
                    <br />
                    {usuario.correo}
                  </>
                ) : null}
                <br />
                <br />
                Con la sesión iniciada tienes conversaciones ilimitadas.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn modal-btn-peligro"
                  onClick={() => {
                    cerrarModal();
                    logout();
                  }}
                >
                  Cerrar sesión
                </button>
                <button type="button" className="modal-btn modal-btn-primary" onClick={cerrarModal}>
                  Listo
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="modal-text">
                Aún no has iniciado sesión.
                <br />
                <br />
                Inicia sesión con Google para guardar tu cuenta y chatear sin límites.
              </p>
              <div className="modal-actions">
                <a href={getGoogleAuthUrl()} className="modal-btn modal-btn-primary" style={{ textDecoration: 'none' }}>
                  Iniciar sesión con Google
                </a>
                <button type="button" className="modal-btn" onClick={cerrarModal}>
                  Ahora no
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (modal === 'ayuda') {
    modales.push(
      <div
        key="ayuda"
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) cerrarModal();
        }}
      >
        <div className="modal">
          <h3 className="modal-title">Obtener ayuda</h3>
          <p className="modal-text">
            Inicia una conversación nueva y pregúntale a Fenix IA lo que necesites. Te guiará paso a paso.
          </p>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-primary" onClick={irNuevoChatAyuda}>
              Nuevo chat
            </button>
            <button type="button" className="modal-btn" onClick={cerrarModal}>
              Ahora no
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal === 'plan') {
    modales.push(
      <div
        key="plan"
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) cerrarModal();
        }}
      >
        <div className="modal modal-plan">
          <h3 className="modal-title">Mejorar plan</h3>
          <p className="modal-text">Elige el plan que mejor se adapte a ti</p>
          <div className="plan-grid">
            <div className="plan-card">
              <div className="plan-name">Gratis</div>
              <div className="plan-precio">
                $0<span className="plan-periodo">/mes</span>
              </div>
              <ul className="plan-features">
                <li>3 mensajes gratis sin iniciar sesión</li>
                <li>Todos los modelos de IA</li>
                <li>Historial local en el navegador</li>
              </ul>
              <button type="button" className="plan-btn" disabled>
                Plan actual
              </button>
            </div>
            <div className="plan-card plan-card-destacado">
              <div className="plan-badge">Más popular</div>
              <div className="plan-name">Pro</div>
              <div className="plan-precio">
                $6<span className="plan-periodo">/mes</span>
              </div>
              <ul className="plan-features">
                <li>Mensajes ilimitados</li>
                <li>Todos los modelos de IA</li>
                <li>Historial ilimitado guardado</li>
                <li>Soporte prioritario</li>
              </ul>
              <button type="button" className="plan-btn plan-btn-primario" onClick={() => elegirPlan('Pro')}>
                Elegir plan
              </button>
            </div>
            <div className="plan-card">
              <div className="plan-name">Ultra</div>
              <div className="plan-precio">
                $15<span className="plan-periodo">/mes</span>
              </div>
              <ul className="plan-features">
                <li>Todo lo de Pro</li>
                <li>Respuestas más rápidas</li>
                <li>Proyectos y biblioteca ilimitados</li>
                <li>Nuevas funciones antes que nadie</li>
              </ul>
              <button type="button" className="plan-btn" onClick={() => elegirPlan('Ultra')}>
                Elegir plan
              </button>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn" onClick={cerrarModal}>
              Ahora no
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal === 'apps') {
    modales.push(
      <div
        key="apps"
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) cerrarModal();
        }}
      >
        <div className="modal">
          <h3 className="modal-title">Obtener la app</h3>
          <p className="modal-text">
            Fenix IA está disponible como app instalable (PWA) en móvil y escritorio.
            <br />
            <br />
            En <strong>Android</strong>: menú ⋮ → "Agregar a pantalla de inicio".
            <br />
            En <strong>iPhone</strong>: botón Compartir → "Agregar a pantalla de inicio".
          </p>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-primary" onClick={cerrarModal}>
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal === 'info') {
    modales.push(
      <div
        key="info"
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) cerrarModal();
        }}
      >
        <div className="modal">
          <h3 className="modal-title">Acerca de Fenix IA</h3>
          <p className="modal-text">
            Fenix IA es tu asistente personal con los mejores modelos de IA:{' '}
            <strong>Fenix 2.0</strong>, <strong>Gemini</strong> y <strong>DeepSeek</strong>.
            <br />
            <br />
            Creado por Joshua Blandon Gonzales. Versión 1.0.
          </p>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-primary" onClick={cerrarModal}>
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (planElegido) {
    modales.push(
      <div
        key="planAviso"
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) cerrarModal();
        }}
      >
        <div className="modal">
          <h3 className="modal-title">Mejorar plan</h3>
          <p className="modal-text">
            Has elegido el plan <strong>{planElegido}</strong>.
            <br />
            <br />
            El pago online estará disponible próximamente. Mientras tanto puedes seguir usando Fenix IA gratis.
          </p>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-primary" onClick={cerrarModal}>
              Ahora no
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`sidebar-user-menu ${abierto ? 'open' : ''}`}>
        <div className="sidebar-user-menu-item" onClick={manejarCuenta}>
          <span className="sidebar-menu-emoji">👤</span>
          <span>Cuenta</span>
        </div>
        <div className="sidebar-user-menu-item" onClick={manejarConfiguracion}>
          <span className="sidebar-menu-emoji">⚙️</span>
          <span>Configuración</span>
        </div>

        <div className="sidebar-user-menu-divider" />

        <div className="sidebar-user-menu-item" onClick={manejarIdioma}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 010 20 15.3 15.3 0 010-20z" />
          </svg>
          <span>Idioma</span>
        </div>

        <div className="sidebar-user-menu-divider" />

        <div className="sidebar-user-menu-item" onClick={manejarAyuda}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Obtener ayuda</span>
        </div>
        <div className="sidebar-user-menu-item" onClick={manejarMejorarPlan}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          <span>Mejorar plan</span>
        </div>
        <div className="sidebar-user-menu-item" onClick={manejarAplicaciones}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span>Obtener aplicaciones y extensiones</span>
        </div>
        <div className="sidebar-user-menu-item" onClick={manejarInfo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Más información</span>
        </div>

        <div className="sidebar-user-menu-divider" />

        {autenticado ? (
          <div className="sidebar-user-menu-item sidebar-user-menu-danger" onClick={manejarCerrarSesion}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Cerrar sesión</span>
          </div>
        ) : (
          <a href={getGoogleAuthUrl()} className="sidebar-user-menu-item" style={{ textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Iniciar sesión con Google</span>
          </a>
        )}
      </div>

      {modales.length > 0 && typeof document !== 'undefined'
        ? createPortal(modales, document.body)
        : null}
    </>
  );
}