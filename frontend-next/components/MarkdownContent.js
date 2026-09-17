'use client';

import React, { useState } from 'react';

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanLang = (language || '').trim().toLowerCase() || 'código';

  return (
    <div style={{
      margin: '12px 0',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid var(--border, #374151)',
      backgroundColor: 'var(--code-bg, #1e1e2e)',
      color: '#e2e8f0',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: '13.5px',
      lineHeight: '1.5',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.5px',
        color: '#94a3b8'
      }}>
        <span>{cleanLang}</span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? '#4ade80' : '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: '4px'
          }}
          title="Copiar código"
        >
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>

      <pre style={{
        margin: 0,
        padding: '14px',
        overflowX: 'auto',
        whiteSpace: 'pre',
        fontFamily: 'inherit'
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInline(text, keyPrefix = '') {
  if (!text) return null;
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    const key = `${keyPrefix}-inline-${idx}`;
    if (!part) return null;

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={key}
          style={{
            backgroundColor: 'rgba(127, 127, 127, 0.15)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.9em',
            fontFamily: 'Consolas, Monaco, monospace',
            color: 'var(--accent, #e11d48)'
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={key} style={{ fontWeight: 650 }}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const href = linkMatch[2].startsWith('http') ? linkMatch[2] : `https://${linkMatch[2]}`;
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent, #3b82f6)', textDecoration: 'underline' }}
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

export default function MarkdownContent({ contenido, cargando = false }) {
  if (!contenido && !cargando) return null;

  const texto = String(contenido || '');
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  const procesarBloqueTexto = (bloque, bIdx) => {
    if (!bloque) return;
    const lineas = bloque.split('\n');
    let listaActual = null;

    const vaciarLista = (subIdx) => {
      if (!listaActual) return;
      const Tag = listaActual.tipo;
      elements.push(
        <Tag key={`list-${bIdx}-${subIdx}`} style={{ margin: '8px 0 8px 24px', padding: 0 }}>
          {listaActual.items.map((it, i) => (
            <li key={`item-${i}`} style={{ marginBottom: '4px' }}>
              {renderInline(it, `li-${bIdx}-${subIdx}-${i}`)}
            </li>
          ))}
        </Tag>
      );
      listaActual = null;
    };

    lineas.forEach((linea, lIdx) => {
      const trimmed = linea.trim();
      if (!trimmed) {
        vaciarLista(lIdx);
        return;
      }

      if (trimmed.startsWith('# ')) {
        vaciarLista(lIdx);
        elements.push(
          <h1 key={`h1-${bIdx}-${lIdx}`} style={{ fontSize: '22px', fontWeight: 700, margin: '16px 0 8px' }}>
            {renderInline(trimmed.slice(2), `h1-${bIdx}-${lIdx}`)}
          </h1>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        vaciarLista(lIdx);
        elements.push(
          <h2 key={`h2-${bIdx}-${lIdx}`} style={{ fontSize: '18px', fontWeight: 650, margin: '14px 0 6px' }}>
            {renderInline(trimmed.slice(3), `h2-${bIdx}-${lIdx}`)}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('### ')) {
        vaciarLista(lIdx);
        elements.push(
          <h3 key={`h3-${bIdx}-${lIdx}`} style={{ fontSize: '16px', fontWeight: 600, margin: '12px 0 4px' }}>
            {renderInline(trimmed.slice(4), `h3-${bIdx}-${lIdx}`)}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('> ')) {
        vaciarLista(lIdx);
        elements.push(
          <blockquote
            key={`quote-${bIdx}-${lIdx}`}
            style={{
              margin: '8px 0',
              padding: '6px 14px',
              borderLeft: '3px solid var(--accent, #6366f1)',
              backgroundColor: 'rgba(127, 127, 127, 0.08)',
              borderRadius: '0 4px 4px 0',
              fontStyle: 'italic'
            }}
          >
            {renderInline(trimmed.slice(2), `quote-${bIdx}-${lIdx}`)}
          </blockquote>
        );
        return;
      }

      const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        if (!listaActual || listaActual.tipo !== 'ul') {
          vaciarLista(lIdx);
          listaActual = { tipo: 'ul', items: [] };
        }
        listaActual.items.push(bulletMatch[1]);
        return;
      }

      const numMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
      if (numMatch) {
        if (!listaActual || listaActual.tipo !== 'ol') {
          vaciarLista(lIdx);
          listaActual = { tipo: 'ol', items: [] };
        }
        listaActual.items.push(numMatch[1]);
        return;
      }

      vaciarLista(lIdx);
      elements.push(
        <p key={`p-${bIdx}-${lIdx}`} style={{ margin: '6px 0', lineHeight: 1.65 }}>
          {renderInline(linea, `p-${bIdx}-${lIdx}`)}
        </p>
      );
    });

    vaciarLista('final');
  };

  let matchCount = 0;
  while ((match = codeBlockRegex.exec(texto)) !== null) {
    const textoAntes = texto.slice(lastIndex, match.index);
    if (textoAntes) {
      procesarBloqueTexto(textoAntes, `pre-${matchCount}`);
    }

    const lang = match[1] || '';
    const code = match[2] ? match[2].trimEnd() : '';
    elements.push(
      <CodeBlock key={`code-${matchCount}-${match.index}`} language={lang} code={code} />
    );

    lastIndex = match.index + match[0].length;
    matchCount++;
  }

  if (lastIndex < texto.length) {
    procesarBloqueTexto(texto.slice(lastIndex), `post-${matchCount}`);
  }

  return (
    <div className="markdown-body" style={{ wordBreak: 'break-word' }}>
      {elements}
      {cargando && <span className="cursor-escribiendo" style={{ display: 'inline-block', marginLeft: '4px' }} />}
    </div>
  );
}
