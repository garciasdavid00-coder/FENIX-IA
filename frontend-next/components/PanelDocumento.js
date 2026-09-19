'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useChat } from '@/context/ChatContext';
import {
  generarPDFServidor,
  convertirMarkdownAHtml,
  descargarDocumento,
  imprimirDocumento,
} from '@/lib/documentos';

export default function PanelDocumento() {
  const { panelDoc, cerrarPanelDoc } = useChat();
  const [copiado, setCopiado]           = useState(false);

  // Estado del PDF del servidor (Puppeteer)
  const [pdfUrl, setPdfUrl]             = useState(null);   // Blob URL del PDF
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [errorPDF, setErrorPDF]         = useState(null);

  const blobUrlRef = useRef(null); // guardamos la URL para revocarla al limpiar

  // ── Limpieza de Blob URL al cerrar o cambiar de documento ─────────────────
  const limpiarPdfUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPdfUrl(null);
    setErrorPDF(null);
  }, []);

  // Resetear preview cuando cambia el contenido del documento
  useEffect(() => {
    limpiarPdfUrl();
  }, [panelDoc?.contenido, limpiarPdfUrl]);

  // Revocar Blob URL cuando el componente se desmonte
  useEffect(() => {
    return () => limpiarPdfUrl();
  }, [limpiarPdfUrl]);

  if (!panelDoc?.abierto) return null;

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── Generar PDF con Puppeteer ──────────────────────────────────────────────
  const manejarVistaPreviaPDF = async () => {
    if (generandoPDF) return;
    limpiarPdfUrl();
    setGenerandoPDF(true);
    setErrorPDF(null);
    try {
      const url = await generarPDFServidor(panelDoc.titulo, panelDoc.contenido, []);
      blobUrlRef.current = url;
      setPdfUrl(url);
    } catch (e) {
      console.error('[PanelDocumento] Error PDF:', e);
      setErrorPDF(e.message || 'No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      setGenerandoPDF(false);
    }
  };

  // ── Descargar PDF (usa la Blob URL ya generada o la genera primero) ────────
  const manejarDescargaPDF = async () => {
    let url = pdfUrl;
    if (!url) {
      await manejarVistaPreviaPDF();
      url = blobUrlRef.current;
    }
    if (!url) return;
    const nombreSeguro = (panelDoc.titulo || 'documento').replace(/[^\w\s\u00C0-\uFFFF-]/g, '').trim().slice(0, 80) || 'documento';
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreSeguro + '.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ── Copiar texto ───────────────────────────────────────────────────────────
  const copiarTextoPlano = () => {
    if (!panelDoc?.contenido) return;
    const textoLimpio = panelDoc.contenido
      .replace(/\[FENIX_IMG:[^\]]+\]/g, '')
      .replace(/\[FOTO_REAL:[^\]]+\]/g, '')
      .replace(/#+\s+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .trim();
    navigator.clipboard.writeText(textoLimpio);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <aside className="panel-doc-sidebar" aria-label="Panel de Vista Previa de Documento">

      {/* ── Barra de herramientas ── */}
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
          {/* Vista Previa PDF (Puppeteer) */}
          <button
            type="button"
            className="panel-doc-btn btn-pdf-accent"
            onClick={manejarVistaPreviaPDF}
            disabled={generandoPDF}
            title="Generar vista previa PDF de alta calidad"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>{generandoPDF ? 'Generando…' : 'Vista Previa'}</span>
          </button>

          {/* Descargar PDF */}
          <button
            type="button"
            className="panel-doc-btn btn-pdf-accent"
            onClick={manejarDescargaPDF}
            disabled={generandoPDF}
            title="Descargar en formato PDF"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <polyline points="9 15 12 18 15 15"/>
            </svg>
            <span>PDF</span>
          </button>

          {/* Imprimir */}
          <button
            type="button"
            className="panel-doc-btn"
            onClick={() => imprimirDocumento(panelDoc.titulo, panelDoc.contenido)}
            title="Imprimir documento (A4)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            <span>Imprimir</span>
          </button>

          {/* Word */}
          <button
            type="button"
            className="panel-doc-btn"
            onClick={() => descargarDocumento(panelDoc.titulo, panelDoc.contenido)}
            title="Descargar como archivo Word (.doc)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>Word</span>
          </button>

          {/* Copiar */}
          <button type="button" className="panel-doc-btn" onClick={copiarTextoPlano} title="Copiar texto">
            <span>{copiado ? '✓ Copiado' : 'Copiar'}</span>
          </button>

          {/* Cerrar */}
          <button type="button" className="panel-doc-close-btn" onClick={cerrarPanelDoc} title="Cerrar panel">
            ✕
          </button>
        </div>
      </div>

      {/* ── Área de contenido ── */}
      <div className="panel-doc-viewport">

        {/* ── Vista Previa PDF con iframe ── */}
        {(pdfUrl || generandoPDF || errorPDF) && (
          <div className="panel-pdf-section">
            {generandoPDF && (
              <div className="panel-pdf-loading">
                <div className="panel-pdf-spinner" />
                <span>Generando PDF con alta calidad…</span>
                <small>Esto tarda unos segundos</small>
              </div>
            )}

            {errorPDF && !generandoPDF && (
              <div className="panel-pdf-error">
                <span>⚠️ {errorPDF}</span>
                <button type="button" className="panel-doc-btn" onClick={manejarVistaPreviaPDF}>
                  Reintentar
                </button>
              </div>
            )}

            {pdfUrl && !generandoPDF && (
              <iframe
                className="panel-pdf-iframe"
                src={pdfUrl}
                title="Vista previa del documento PDF"
                allowFullScreen
              />
            )}
          </div>
        )}

        {/* ── Hoja A4 previa en HTML (antes de generar el PDF) ── */}
        {!pdfUrl && !generandoPDF && !errorPDF && (
          <div className="panel-doc-paper">
            {/* Membrete */}
            <div className="paper-header">
              <div className="paper-brand">
                <span className="paper-logo">FENIX IA</span>
                <span className="paper-badge-type">DOCUMENTO VERIFICADO</span>
              </div>
              <div className="paper-meta-date">{fechaHoy}</div>
            </div>

            <h1 className="paper-title">{panelDoc.titulo}</h1>
            <div className="paper-divider" />

            <div
              className="paper-content-body"
              dangerouslySetInnerHTML={{ __html: convertirMarkdownAHtml(panelDoc.contenido) }}
            />

            {/* CTA para generar PDF */}
            <div className="panel-pdf-cta">
              <button
                type="button"
                className="panel-pdf-cta-btn"
                onClick={manejarVistaPreviaPDF}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Generar vista previa PDF real
              </button>
              <span className="panel-pdf-cta-hint">Con fotos reales · Alta calidad · Listo para imprimir</span>
            </div>

            {/* Pie */}
            <div className="paper-footer">
              <span className="paper-footer-left">Generado por Fenix IA · Documento digital</span>
              <span className="paper-footer-right">Página 1</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
