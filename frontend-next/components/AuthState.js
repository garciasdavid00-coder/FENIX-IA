'use client';

import { useAuth } from '@/hooks/useAuth';
import { getGoogleAuthUrl, API_BASE_URL } from '@/lib/api';

export default function AuthState() {
  const { usuario, autenticado, cargando, error, refrescar, logout } = useAuth();

  if (cargando) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verificando sesión en el backend...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          fontSize: '14px',
          border: '1px solid #fecaca'
        }}>
          ⚠️ {error}
        </div>
      )}

      {autenticado && usuario ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {usuario.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={usuario.foto}
                alt={usuario.nombre || 'Avatar'}
                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                color: 'var(--text-invert)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 600
              }}>
                {(usuario.nombre || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>{usuario.nombre}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{usuario.correo || 'Sin correo asociado'}</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'var(--surface-alt)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Plan Actual</span>
              <span className={`badge ${usuario.plan === 'pro' ? 'badge-pro' : ''}`} style={{ marginTop: '4px' }}>
                {usuario.plan || 'gratis'}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              ID: <code>{usuario.id}</code>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={logout} className="btn btn-danger">
              Cerrar sesión
            </button>
            <button type="button" onClick={refrescar} className="btn">
              ↻ Actualizar estado
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>No has iniciado sesión</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '420px', margin: '0 auto 24px' }}>
            Conéctate con tu cuenta de Google para sincronizar tus chats, desbloquear memoria persistente y acceder a tus proyectos.
          </p>
          <a
            href={getGoogleAuthUrl()}
            className="btn btn-primary"
            style={{ fontSize: '15px', padding: '12px 28px' }}
          >
            <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continuar con Google
          </a>
        </div>
      )}

      {/* Sección de Diagnóstico de API / CORS */}
      <div className="card" style={{ fontSize: '13px', backgroundColor: 'var(--surface-alt)' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>🛠️ Diagnóstico de Conexión</h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>
            <strong>API Endpoint:</strong> <code>{API_BASE_URL}</code>
          </li>
          <li>
            <strong>Endpoint comprobado:</strong> <code>GET /api/usuario-actual</code>
          </li>
          <li>
            <strong>Modo de credenciales:</strong> <code>credentials: 'include'</code>
          </li>
          <li>
            <strong>Estado detectado:</strong>{' '}
            <span style={{ color: autenticado ? '#16a34a' : '#ea580c', fontWeight: 600 }}>
              {autenticado ? '✓ Sesión iniciada' : '○ Sin sesión (anónimo)'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
