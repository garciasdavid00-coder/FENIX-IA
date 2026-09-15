'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { apiGet, apiDelete } from '@/lib/api';
import { getGoogleAuthUrl } from '@/lib/api';

const NOMBRES_CATEGORIAS = {
  personal: 'Personal',
  preferencia: 'Preferencias',
  proyecto: 'Proyectos',
  tecnico: 'Técnico',
  temas: 'Temas',
};

export default function MemoriasView() {
  const { setVistaActiva, abrirModalMemoria } = useChat();
  const { autenticado, cargando } = useAuth();
  const [memorias, setMemorias] = useState([]);
  const [cargandoMemorias, setCargandoMemorias] = useState(true);
  const [error, setError] = useState(null);

  const cargarMemorias = useCallback(async () => {
    try {
      const data = await apiGet('/api/memories');
      setMemorias(Array.isArray(data.memorias) ? data.memorias : []);
      setError(null);
    } catch (err) {
      console.error('[MemoriasView] Error:', err);
      setError(err.message || 'No se pudieron cargar las memorias');
    } finally {
      setCargandoMemorias(false);
    }
  }, []);

  useEffect(() => {
    if (autenticado) cargarMemorias();
    else setCargandoMemorias(false);
  }, [autenticado, cargarMemorias]);

  const eliminarMemoria = async (id) => {
    try {
      await apiDelete(`/api/memories/${id}`);
      setMemorias((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('[MemoriasView] Error al borrar:', err);
      setError(err.message || 'No se pudo borrar la memoria');
    }
  };

  return (
    <div className="panel-view" id="vistaMemoria">
      <div className="panel-header">
        <button type="button" className="btn-volver" onClick={() => setVistaActiva('chat')}>
          ← Volver al chat
        </button>
        <h2>Memoria</h2>
        <button type="button" className="btn-primario" onClick={() => abrirModalMemoria('')}>
          + Recordar algo
        </button>
      </div>

      <p className="memoria-desc">
        Las memorias se guardan y se inyectan automáticamente en el contexto de tus chats.
        Puedes agregarlas a mano o usar el botón "Recordar" de cualquier mensaje.
      </p>

      {cargando ? null : !autenticado ? (
        <div className="card-item" style={{ cursor: 'default' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
            Inicia sesión para usar la memoria
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            La memoria persistente se guarda en tu cuenta. Conéctate con Google para
            sincronizarla entre dispositivos.
          </p>
          <a href={getGoogleAuthUrl()} className="btn-primario" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Continuar con Google
          </a>
        </div>
      ) : (
        <>
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: '13.5px',
              marginBottom: '16px',
              border: '1px solid #fecaca'
            }}>
              ⚠️ {error}
            </div>
          )}

          {cargandoMemorias ? (
            <p className="empty-state">Cargando memorias...</p>
          ) : memorias.length === 0 ? (
            <div className="empty-state">
              Aún no tienes memorias guardadas.
            </div>
          ) : (
            <div className="memoria-list">
              {memorias.map((m) => (
                <div key={m.id} className="memoria-item">
                  <div className="memoria-texto">{m.memory_text}</div>
                  <div className="memoria-pie">
                    <span className="memoria-cat">
                      {NOMBRES_CATEGORIAS[m.category] || m.category || 'Personal'}
                    </span>
                    <button
                      type="button"
                      className="memoria-del"
                      onClick={() => eliminarMemoria(m.id)}
                      title="Borrar memoria"
                    >
                      🗑 Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}