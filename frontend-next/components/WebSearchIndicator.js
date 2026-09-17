'use client';

import { useState } from 'react';

/**
 * Indicador de búsqueda web de Fenix IA.
 * 
 * Props:
 * - status: 'searching' | 'done' | 'buscando' | 'completado'
 * - query: string (término buscado)
 * - sourceCount: number (opcional)
 * - fuentes: Array<{ titulo: string, url: string }> (opcional)
 */
export default function WebSearchIndicator({ status = 'searching', query = '', sourceCount, fuentes = [] }) {
  const [expandido, setExpandido] = useState(false);
  const esBuscando = status === 'searching' || status === 'buscando';
  const totalFuentes = typeof sourceCount === 'number' ? sourceCount : (fuentes?.length || 0);

  return (
    <div className="web-search-wrapper">
      <div className={`web-search-bar ${esBuscando ? 'is-searching' : 'is-done'}`}>
        {/* Ícono */}
        <div className="web-search-icon-wrap">
          {esBuscando ? (
            /* Ícono World-Search (ti-world-search) con pulso */
            <svg
              className="web-search-icon icon-globe-search"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3.055 11a9 9 0 1 0 18.003 -1" />
              <path d="M3.6 9h16.8" />
              <path d="M3.6 15h7.9" />
              <path d="M11.5 3a17 17 0 0 0 0 18" />
              <path d="M12.5 3a16.984 16.984 0 0 1 2.574 8.62" />
              <circle cx="18" cy="18" r="3" />
              <path d="M20.2 20.2l1.8 1.8" />
            </svg>
          ) : (
            /* Ícono Circle-Check verde sin animación */
            <svg
              className="web-search-icon icon-check-circle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          )}
        </div>

        {/* Texto principal */}
        <span className={`web-search-label ${esBuscando ? 'label-searching' : 'label-done'}`}>
          {esBuscando ? 'Buscando en la web' : 'Búsqueda completada'}
        </span>

        {/* Separador y término entre comillas */}
        {query && (
          <>
            <span className="web-search-sep">·</span>
            <span className="web-search-query" title={query}>
              &ldquo;{query}&rdquo;
            </span>
          </>
        )}

        {/* Punto parpadeante azul (solo en estado buscando) */}
        {esBuscando && <span className="web-search-blink-dot" />}

        {/* Botón de fuentes en el extremo derecho (solo cuando está completado) */}
        {!esBuscando && totalFuentes > 0 && (
          <button
            type="button"
            className={`web-search-sources-btn ${expandido ? 'is-active' : ''}`}
            onClick={() => setExpandido((prev) => !prev)}
            title="Ver fuentes consultadas"
          >
            <span>{totalFuentes} {totalFuentes === 1 ? 'fuente' : 'fuentes'}</span>
            <svg
              className={`web-search-chevron ${expandido ? 'is-open' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="12"
              height="12"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Desplegable sutil de fuentes consultadas */}
      {!esBuscando && expandido && fuentes?.length > 0 && (
        <div className="web-search-sources-dropdown">
          {fuentes.map((f, i) => {
            let host = '';
            try {
              host = new URL(f.url).hostname.replace(/^www\./, '');
            } catch (e) {}
            return (
              <a
                key={i}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="web-search-source-item"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="web-search-source-favicon"
                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="web-search-source-title">{f.titulo || host}</span>
                <span className="web-search-source-host">{host}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
