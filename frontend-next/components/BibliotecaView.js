'use client';

import { useRef } from 'react';
import { useChat } from '@/context/ChatContext';

export default function BibliotecaView() {
  const {
    archivosBiblioteca,
    subirArchivos,
    eliminarArchivoBiblioteca,
    setVistaActiva,
  } = useChat();

  const inputRef = useRef(null);

  const manejarSeleccion = (e) => {
    subirArchivos(e.target.files);
    e.target.value = ''; // permite volver a subir el mismo archivo si se borra
  };

  return (
    <div className="panel-view" id="vistaBiblioteca">
      <div className="panel-header">
        <button type="button" className="btn-volver" onClick={() => setVistaActiva('chat')}>
          ← Volver al chat
        </button>
        <h2>Biblioteca</h2>
        <button type="button" className="btn-primario" onClick={() => inputRef.current?.click()}>
          + Subir archivo
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={manejarSeleccion}
      />

      <div className="panel-grid">
        {archivosBiblioteca.length === 0 ? (
          <div className="empty-state">
            Tu biblioteca está vacía. Sube archivos para tenerlos a mano aquí.
          </div>
        ) : (
          archivosBiblioteca.map((archivo) => {
            const esImagen = archivo.tipo.startsWith('image/');
            return (
              <a
                key={archivo.id}
                className="card-item"
                href={archivo.url}
                target="_blank"
                rel="noreferrer"
              >
                <button
                  type="button"
                  className="card-item-del"
                  aria-label="Eliminar archivo"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    eliminarArchivoBiblioteca(archivo.id);
                  }}
                >
                  ×
                </button>
                {esImagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="card-img-preview"
                    src={archivo.url}
                    alt={archivo.nombre}
                  />
                ) : (
                  <div className="card-file-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                )}
                <div className="card-item-title">{archivo.nombre}</div>
                <div className="card-item-sub">{archivo.tamanoKB} KB</div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}