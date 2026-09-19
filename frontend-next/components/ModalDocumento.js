'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import {
  convertirMarkdownAHtml,
  descargarPDF,
  descargarDocumento,
  imprimirDocumento,
} from '@/lib/documentos';

export default function ModalDocumento() {
  const { docModal, cerrarDocModal } = useChat();
  const [descargando, setDescargando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const hojaRef = useRef(null);

  useEffect(() => {
    if (!docModal) return;
    const manejarTecla = (e) => {
      if (e.key === 'Escape') cerrarDocModal();
    };
    document.addEventListener('keydown', manejarTecla);
    return () => document.removeEventListener('keydown', manejarTecla);
  }, [docModal, cerrarDocModal]);

  if (!docModal) return null;

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const manejarDescargaPDF = async () => {
    if (descargando) return;
    setDescargando(true);
    try {
      await descargarPDF(docModal.titulo, docModal.contenido, hojaRef.current);
    } catch (e) {
      console.error('Error al descargar PDF:', e);
    } finally {
      setDescargando(false);
    }
  };

  const copiarTextoPlano = () => {
    if (!docModal?.contenido) return;
    const textoLimpio = docModal.contenido
      .replace(/\[FENIX_IMG:[^\]]+\]/g, '')
      .replace(/#+\s+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .trim();
    navigator.clipboard.writeText(textoLimpio);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div
      className="modal-doc-fondo"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrarDocModal();
      }}
    >
      <div className="modal-doc-container">
        {/* Barra de herramientas superior */}
        <div className="modal-doc-toolbar">
          <div className="modal-doc-title-group">
            <span className="modal-doc-badge">📕 PDF / Documento</span>
            <h2 className="modal-doc-title" title={docModal.titulo}>
              {docModal.titulo}
            </h2>
          </div>

          <div className="modal-doc-actions">
            <button
              type="button"
              className="doc-action-btn btn-pdf-primary"
              onClick={manejarDescargaPDF}
              disabled={descargando}
              title="Descargar en formato PDF"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 18 15 15" />
              </svg>
              <span>{descargando ? 'Generando...' : 'Descargar PDF'}</span>
            </button>

            <button
              type="button"
              className="doc-action-btn"
              onClick={() => imprimirDocumento(docModal.titulo, docModal.contenido)}
              title="Imprimir documento"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              className="doc-action-btn"
              onClick={() => descargarDocumento(docModal.titulo, docModal.contenido)}
              title="Descargar en formato Word (.doc)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Word</span>
            </button>

            <button
              type="button"
              className="doc-action-btn"
              onClick={copiarTextoPlano}
              title="Copiar texto"
            >
              <span>{copiado ? '✓ Copiado' : 'Copiar'}</span>
            </button>

            <button
              type="button"
              className="modal-doc-close-btn"
              onClick={cerrarDocModal}
              title="Cerrar vista previa"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Visor de Hoja de Papel A4 */}
        <div className="modal-doc-scroll-viewport">
          <div className="modal-doc-paper-sheet" ref={hojaRef}>
            {/* Cabecera membretada */}
            <div className="paper-header">
              <div className="paper-brand">
                <span className="paper-logo">FENIX IA</span>
                <span className="paper-badge-type">INFORME VERIFICADO</span>
              </div>
              <div className="paper-meta-date">{fechaHoy}</div>
            </div>

            {/* Título principal */}
            <h1 className="paper-title">{docModal.titulo}</h1>

            {/* Línea divisoria de estilo */}
            <div className="paper-divider" />

            {/* Cuerpo del documento con formato tipográfico profesional */}
            <div
              className="paper-content-body"
              dangerouslySetInnerHTML={{ __html: convertirMarkdownAHtml(docModal.contenido) }}
            />

            {/* Pie de página membretado */}
            <div className="paper-footer">
              <span className="paper-footer-left">Generado por Fenix IA · Datos verificados en tiempo real</span>
              <span className="paper-footer-right">Página 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}