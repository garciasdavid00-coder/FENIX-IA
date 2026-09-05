'use client';

import { useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { convertirMarkdownAHtml, descargarDocumento } from '@/lib/documentos';

export default function ModalDocumento() {
  const { docModal, cerrarDocModal } = useChat();

  useEffect(() => {
    if (!docModal) return;
    const manejarTecla = (e) => {
      if (e.key === 'Escape') cerrarDocModal();
    };
    document.addEventListener('keydown', manejarTecla);
    return () => document.removeEventListener('keydown', manejarTecla);
  }, [docModal, cerrarDocModal]);

  if (!docModal) return null;

  return (
    <div
      className="modal-doc-fondo"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrarDocModal();
      }}
    >
      <div className="modal-doc">
        <div className="modal-doc-cabecera">
          <div className="modal-doc-titulo">{docModal.titulo}</div>
          <button className="modal-doc-cerrar" type="button" onClick={cerrarDocModal}>
            ✕
          </button>
        </div>
        <div
          className="modal-doc-contenido"
          dangerouslySetInnerHTML={{ __html: convertirMarkdownAHtml(docModal.contenido) }}
        />
        <div className="modal-doc-pie">
          <button
            className="tarjeta-doc-btn"
            type="button"
            onClick={() => descargarDocumento(docModal.titulo, docModal.contenido)}
          >
            ⬇️ Descargar
          </button>
        </div>
      </div>
    </div>
  );
}