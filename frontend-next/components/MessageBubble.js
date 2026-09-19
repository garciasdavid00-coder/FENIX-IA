'use client';

import { useState, useMemo } from 'react';
import { useChat } from '@/context/ChatContext';
import { getGoogleAuthUrl } from '@/lib/api';
import { descargarPDF } from '@/lib/documentos';
import MarkdownContent from '@/components/MarkdownContent';
import TrendChart from '@/components/TrendChart';
import WebSearchIndicator from '@/components/WebSearchIndicator';
import FileAttachmentChip from '@/components/FileAttachmentChip';

export default function MessageBubble({ mensaje }) {
  const { abrirModalMemoria, abrirDocModal } = useChat();
  const [copiado, setCopiado] = useState(false);

  // Extraer datos de gráfico de tendencias de divisas si existen en el texto
  const { textoLimpio, chartData } = useMemo(() => {
    let raw = mensaje?.contenido || '';
    let parsedChart = null;
    const match = raw.match(/\[FENIX_CHART:([\s\S]*?)\]/);
    if (match) {
      try {
        parsedChart = JSON.parse(match[1]);
      } catch (e) {
        // Fallback silencioso si no es JSON completo aún
      }
    }
    // Ocultar siempre el marcador FENIX_CHART del texto visible
    raw = raw.replace(/\[FENIX_CHART:[\s\S]*$/i, '').trimEnd();
    return { textoLimpio: raw, chartData: parsedChart };
  }, [mensaje?.contenido]);

  const copiarTexto = () => {
    if (!textoLimpio) return;
    navigator.clipboard.writeText(textoLimpio);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const hablarTexto = () => {
    if (!textoLimpio || typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(textoLimpio);
      utter.lang = 'es-ES';
      window.speechSynthesis.speak(utter);
    }
  };

  const esUsuario = mensaje.rol === 'user';

  return (
    <div className={`msg ${esUsuario ? 'msg-user' : 'msg-bot'}`}>
      {/* Indicador de Búsqueda Web (estados Buscando y Completado) */}
      {!esUsuario && mensaje.searchInfo && mensaje.searchInfo.estado && (
        <WebSearchIndicator
          status={mensaje.searchInfo.estado === 'buscando' ? 'searching' : 'done'}
          query={mensaje.searchInfo.query || ''}
          sourceCount={mensaje.searchInfo.fuentes?.length || 0}
          fuentes={mensaje.searchInfo.fuentes || []}
        />
      )}

      {/* Archivo adjunto del usuario si existe */}
      {esUsuario && mensaje.archivo && (
        <div style={{ marginBottom: textoLimpio ? '8px' : '0' }}>
          <FileAttachmentChip archivo={mensaje.archivo} compacto={true} />
        </div>
      )}

      {/* Contenido del mensaje */}
      <div>
        {mensaje.imagen ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="msg-imagen"
              src={mensaje.imagen}
              alt={mensaje.contenido || 'Imagen generada'}
              loading="lazy"
            />
            {mensaje.contenido && <div className="msg-pie">{mensaje.contenido}</div>}
          </>
        ) : mensaje.documento ? (
          <div className="tarjeta-doc">
            <div className="tarjeta-doc-icono">📕</div>
            <div className="tarjeta-doc-info">
              <div className="tarjeta-doc-nombre">{mensaje.documento.titulo}</div>
              <div className="tarjeta-doc-sub">Documento PDF generado</div>
              <div className="tarjeta-doc-botones">
                <button
                  type="button"
                  className="tarjeta-doc-btn tarjeta-doc-btn-sec"
                  onClick={() => abrirDocModal(mensaje.documento.titulo, mensaje.documento.contenido)}
                  title="Abrir vista previa del documento"
                >
                  👁️ Ver vista previa
                </button>
                <button
                  type="button"
                  className="tarjeta-doc-btn tarjeta-doc-btn-prim"
                  onClick={() => descargarPDF(mensaje.documento.titulo, mensaje.documento.contenido)}
                  title="Descargar documento en PDF"
                >
                  ⬇️ Descargar PDF
                </button>
              </div>
            </div>
          </div>
        ) : esUsuario ? (
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {textoLimpio}
          </div>
        ) : (
          <>
            {mensaje.cargando && !textoLimpio && (
              <div className="pensando-bubble" title="Fenix está pensando...">
                <span className="pensando-dot" />
                <span className="pensando-dot" />
                <span className="pensando-dot" />
              </div>
            )}
            <MarkdownContent contenido={textoLimpio} cargando={mensaje.cargando} />
            {chartData && <TrendChart datos={chartData} />}
          </>
        )}
      </div>



      {/* Límite de mensajes sin sesión: invita a iniciar sesión */}
      {mensaje.limite && (
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href={getGoogleAuthUrl()}
            className="btn-primario"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            Iniciar sesión para continuar
          </a>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Desbloquea mensajes ilimitados
          </span>
        </div>
      )}

      {/* Barra de acciones al pasar el ratón (Hover Action Bar) */}
      {!mensaje.cargando && mensaje.contenido && !mensaje.error && (
        <div className="msg-bar" role="toolbar">
          {/* Botón escuchar */}
          {!esUsuario && (
            <button
              type="button"
              className="msg-accion"
              title="Escuchar mensaje"
              onClick={hablarTexto}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M12 18h.01" />
              </svg>
            </button>
          )}

          {/* Botón recordar (guardar en memoria persistente) */}
          {!esUsuario && (
            <button
              type="button"
              className="msg-accion"
              title="Recordar esta información"
              onClick={() => abrirModalMemoria(mensaje.contenido)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 4h6a2 2 0 012 2v14l-5-3-5 3V6a2 2 0 012-2z" />
              </svg>
            </button>
          )}

          {/* Botón copiar */}
          <button
            type="button"
            className="msg-accion"
            title={copiado ? '¡Copiado!' : 'Copiar texto'}
            onClick={copiarTexto}
          >
            {copiado ? (
              <span style={{ fontSize: '12px', fontWeight: 600 }}>✓</span>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}