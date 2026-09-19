'use client';

import { useRef, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import {
  convertirMarkdownAHtml,
  descargarPDF,
  descargarDocumento,
  imprimirDocumento,
} from '@/lib/documentos';

export default function PanelDocumento() {
  const { panelDoc, cerrarPanelDoc } = useChat();
  const [descargando, setDescargando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const hojaRef = useRef(null);

  if (!panelDoc?.abierto) return null;

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const manejarDescargaPDF = async () => {
    if (descargando) return;
    setDescargando(true);
    try {
      await descargarPDF(panelDoc.titulo, panelDoc.contenido, hojaRef.current);
    } catch (e) {
      console.error('Error al descargar PDF:', e);
    } finally {
      setDescargando(false);
    }
  };

  const copiarTextoPlano = () => {
    if (!panelDoc?.contenido) return;
    const textoLimpio = panelDoc.contenido
      .replace(/\[FENIX_IMG:[^\]]+\]/g, '')
      .replace(/#+\s+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .trim();
    navigator.clipboard.writeText(textoLimpio);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <aside className="panel-doc-sidebar" aria-label="Panel de Vista Previa de Documento">
      {/* Barra de herramientas superior del panel */}
      <div className="panel-doc-header">
        <div className="panel-doc-header-info">
          <div className="panel-doc-badge">
            <span className="panel-doc-badge-dot" />
            <span>DOCUMENTO A4</span>
          </div>
          <h3 className="panel-doc-heading" title={panelDoc.titulo}>
            {panelDoc.titulo}
          </h3>
        </div>

        <div className="panel-doc-actions">
          <button
            type="button"
            className="panel-doc-btn btn-pdf-accent"
            onClick={manejarDescargaPDF}
            disabled={descargando}
            title="Descargar en formato PDF"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            <span>{descargando ? 'Generando...' : 'PDF'}</span>
          </button>

          <button
            type="button"
            className="panel-doc-btn"
            onClick={() => imprimirDocumento(panelDoc.titulo, panelDoc.contenido)}
            title="Imprimir documento (A4)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Imprimir</span>
          </button>

          <button
            type="button"
            className="panel-doc-btn"
            onClick={() => descargarDocumento(panelDoc.titulo, panelDoc.contenido)}
            title="Descargar como archivo Word (.doc)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Word</span>
          </button>

          <button
            type="button"
            className="panel-doc-btn"
            onClick={copiarTextoPlano}
            title="Copiar texto del documento"
          >
            <span>{copiado ? '? Copiado' : 'Copiar'}</span>
          </button>

          <button
            type="button"
            className="panel-doc-close-btn"
            onClick={cerrarPanelDoc}
            title="Cerrar panel de vista previa"
          >
            ?
          </button>
        </div>
      </div>

      {/* Visor con Hoja de Papel A4 realista */}
      <div className="panel-doc-viewport">
        <div className="panel-doc-paper" ref={hojaRef}>
          {/* Membrete oficial */}
          <div className="paper-header">
            <div className="paper-brand">
              <span className="paper-logo">FENIX IA</span>
              <span className="paper-badge-type">DOCUMENTO VERIFICADO</span>
            </div>
            <div className="paper-meta-date">{fechaHoy}</div>
          </div>

          {/* Título principal */}
          <h1 className="paper-title">{panelDoc.titulo}</h1>

          {/* Línea divisoria */}
          <div className="paper-divider" />

          {/* Cuerpo estructurado en HTML */}
          <div
            className="paper-content-body"
            dangerouslySetInnerHTML={{ __html: convertirMarkdownAHtml(panelDoc.contenido) }}
          />

          {/* Pie de página membretado */}
          <div className="paper-footer">
            <span className="paper-footer-left">Generado por Fenix IA · Documento digital</span>
            <span className="paper-footer-right">Página 1</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
