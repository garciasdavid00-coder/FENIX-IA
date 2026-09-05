'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { apiPost } from '@/lib/api';
import { getGoogleAuthUrl } from '@/lib/api';

const CATEGORIAS = [
  { valor: 'personal', etiqueta: '💬 Personal' },
  { valor: 'preferencia', etiqueta: '⭐ Preferencias' },
  { valor: 'proyecto', etiqueta: '📁 Proyectos' },
  { valor: 'tecnico', etiqueta: '⚙️ Técnico' },
  { valor: 'temas', etiqueta: '🧠 Temas' },
];

export default function ModalMemoria() {
  const { memoriaModal, cerrarModalMemoria } = useChat();
  const { autenticado } = useAuth();
  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState('personal');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [guardado, setGuardado] = useState(false);

  // Al abrir el modal con un texto inicial (botón "Recordar" de un mensaje) lo precargamos
  useEffect(() => {
    if (memoriaModal?.texto) {
      setTexto(memoriaModal.texto);
    }
  }, [memoriaModal?.texto]);

  if (!memoriaModal) return null;

  const cerrar = () => {
    cerrarModalMemoria();
    setTimeout(() => {
      setTexto('');
      setCategoria('personal');
      setError(null);
      setGuardado(false);
    }, 200);
  };

  const guardar = async () => {
    if (!texto.trim() || guardando) return;
    setGuardando(true);
    setError(null);
    try {
      await apiPost('/api/memories', { texto: texto.trim(), categoria });
      setGuardado(true);
      setTimeout(cerrar, 900);
    } catch (err) {
      console.error('[ModalMemoria] Error:', err);
      setError(err.message || 'No se pudo guardar la memoria');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && cerrar()}>
      <div className="modal modal-memoria" role="dialog" aria-modal="true">
        <h3 className="modal-title">🧠 Recordar</h3>
        <p className="modal-text" style={{ marginBottom: '8px' }}>
          Guarda un dato para que Fenix IA lo recuerde siempre en tus conversaciones.
        </p>

        {!autenticado ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p className="modal-text">
              Necesitas iniciar sesión para guardar memorias persistentes.
            </p>
            <a href={getGoogleAuthUrl()} className="btn-primario" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Continuar con Google
            </a>
            <button type="button" className="modal-btn" onClick={cerrar}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <textarea
              className="memoria-textarea"
              placeholder="Ej: Prefiere respuestas cortas y concretas; está trabajando en un proyecto de..."
              value={texto}
              maxLength={1500}
              onChange={(e) => setTexto(e.target.value)}
              autoFocus
            />

            <label className="memoria-label" htmlFor="memoriaCategoria">
              Categoría
            </label>
            <select
              id="memoriaCategoria"
              className="config-select memoria-select"
              style={{ width: '100%' }}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.etiqueta}
                </option>
              ))}
            </select>

            {error && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                fontSize: '13px',
                marginBottom: '10px'
              }}>
                ⚠️ {error}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="modal-btn" onClick={cerrar} disabled={guardando}>
                Cancelar
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-primary"
                onClick={guardar}
                disabled={!texto.trim() || guardando}
              >
                {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : 'Guardar memoria'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}