'use client';

import React, { useState, useMemo } from 'react';

/**
 * Componente TrendChart: Mini gráfico de línea SVG interactivo para tipo de cambio (30 días).
 * No requiere librerías pesadas externas (cero impacto en bundle).
 */
export default function TrendChart({ datos }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!datos || !Array.isArray(datos.puntos) || datos.puntos.length < 2) {
    return null;
  }

  const { puntos, titulo, from = 'USD', to = 'MXN', minimo, maximo, porcentaje, subio } = datos;

  // Dimensiones del canvas SVG
  const width = 520;
  const height = 150;
  const padTop = 16;
  const padBottom = 26;
  const padLeft = 14;
  const padRight = 14;

  const valores = useMemo(() => puntos.map(p => p.valor), [puntos]);
  const minVal = useMemo(() => (minimo ? Number(minimo) : Math.min(...valores)), [minimo, valores]);
  const maxVal = useMemo(() => (maximo ? Number(maximo) : Math.max(...valores)), [maximo, valores]);
  const valSpan = (maxVal - minVal) || 0.001;

  // Mapeo a coordenadas SVG
  const coords = useMemo(() => {
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const step = chartW / (puntos.length - 1);

    return puntos.map((p, i) => {
      const x = padLeft + i * step;
      const ratio = (p.valor - minVal) / valSpan;
      const y = padTop + chartH - ratio * chartH;
      return { x, y, fecha: p.fecha, valor: p.valor };
    });
  }, [puntos, minVal, valSpan, width, height, padLeft, padRight, padTop, padBottom]);

  // Generar path de línea suave y área cerrada para gradiente
  const { linePath, areaPath } = useMemo(() => {
    if (!coords.length) return { linePath: '', areaPath: '' };

    const first = coords[0];
    let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const cur = coords[i];
      const cx1 = prev.x + (cur.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (cur.x - prev.x) / 2;
      const cy2 = cur.y;
      d += ` C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
    }

    const last = coords[coords.length - 1];
    const bottomY = height - padBottom;
    const area = `${d} L ${last.x.toFixed(1)} ${bottomY} L ${first.x.toFixed(1)} ${bottomY} Z`;

    return { linePath: d, areaPath: area };
  }, [coords, height, padBottom]);

  const formatearFecha = (strFecha) => {
    if (!strFecha) return '';
    const partes = strFecha.split('-');
    if (partes.length !== 3) return strFecha;
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const mes = meses[parseInt(partes[1], 10) - 1] || partes[1];
    return `${parseInt(partes[2], 10)} ${mes}`;
  };

  const strokeColor = subio ? '#f59e0b' : '#10b981';
  const gradientId = `fx-grad-${from}-${to}`;
  const hoveredPoint = hoverIdx !== null ? coords[hoverIdx] : null;

  return (
    <div className="trend-chart-card">
      <div className="trend-chart-header">
        <div className="trend-chart-titles">
          <div className="trend-chart-badge-group">
            <span className="trend-chart-title">
              {titulo || `Evolución ${from}/${to} (30 días)`}
            </span>
            {porcentaje && (
              <span className={`trend-chart-pill ${subio ? 'pill-up' : 'pill-down'}`}>
                {subio ? '↑ +' : '↓ -'}{Math.abs(Number(porcentaje))}%
              </span>
            )}
          </div>
          <span className="trend-chart-sub">
            Mín: <strong>${minVal.toFixed(2)}</strong> · Máx: <strong>${maxVal.toFixed(2)}</strong> {to}
          </span>
        </div>

        {hoveredPoint && (
          <div className="trend-chart-tooltip-live">
            <span className="tooltip-fecha">{formatearFecha(hoveredPoint.fecha)}</span>
            <span className="tooltip-valor">${hoveredPoint.valor.toFixed(4)} {to}</span>
          </div>
        )}
      </div>

      <div className="trend-chart-svg-wrap">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="trend-chart-svg"
          onMouseLeave={() => setHoverIdx(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            let closest = 0;
            let minDist = Infinity;
            coords.forEach((c, idx) => {
              const dist = Math.abs(c.x - relX);
              if (dist < minDist) {
                minDist = dist;
                closest = idx;
              }
            });
            setHoverIdx(closest);
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
              <stop offset="85%" stopColor={strokeColor} stopOpacity="0.03" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Líneas guía horizontales */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={width - padRight}
            y2={padTop}
            stroke="var(--border)"
            strokeDasharray="3 4"
            strokeWidth="1"
            opacity="0.6"
          />
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            stroke="var(--border)"
            strokeDasharray="3 4"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* Área con gradiente */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Línea principal */}
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Punto inicial y final */}
          {!hoveredPoint && coords.length > 0 && (
            <>
              <circle
                cx={coords[0].x}
                cy={coords[0].y}
                r="3.5"
                fill="var(--surface)"
                stroke={strokeColor}
                strokeWidth="2"
              />
              <circle
                cx={coords[coords.length - 1].x}
                cy={coords[coords.length - 1].y}
                r="4.5"
                fill={strokeColor}
                stroke="var(--surface)"
                strokeWidth="2"
              />
            </>
          )}

          {/* Hover interactivo */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={padTop}
                x2={hoveredPoint.x}
                y2={height - padBottom}
                stroke="var(--text-muted)"
                strokeDasharray="2 2"
                strokeWidth="1.2"
                opacity="0.75"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="5.5"
                fill={strokeColor}
                stroke="var(--surface)"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Etiquetas eje X */}
          {coords.length >= 2 && (
            <>
              <text
                x={coords[0].x}
                y={height - 8}
                fontSize="10"
                fill="var(--text-muted)"
                textAnchor="start"
              >
                {formatearFecha(coords[0].fecha)}
              </text>
              {coords[Math.floor(coords.length / 2)] && (
                <text
                  x={coords[Math.floor(coords.length / 2)].x}
                  y={height - 8}
                  fontSize="10"
                  fill="var(--text-muted)"
                  textAnchor="middle"
                >
                  {formatearFecha(coords[Math.floor(coords.length / 2)].fecha)}
                </text>
              )}
              <text
                x={coords[coords.length - 1].x}
                y={height - 8}
                fontSize="10"
                fill="var(--text-muted)"
                textAnchor="end"
              >
                {formatearFecha(coords[coords.length - 1].fecha)}
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
