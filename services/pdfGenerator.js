/**
 * services/pdfGenerator.js
 * Servicio de generacion de PDFs con Puppeteer para Fenix IA.
 */

'use strict';

const EN_PRODUCCION = process.env.NODE_ENV === 'production';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function inline(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

async function urlABase64(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const mime = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
    if (!mime.startsWith('image/')) return null;
    const buf = await res.arrayBuffer();
    return `data:${mime};base64,${Buffer.from(buf).toString('base64')}`;
  } catch { return null; }
}

function markdownAHtmlDoc(markdown, imgMap) {
  const lineas = String(markdown || '').split('\n');
  let html = '';
  let listaAbierta = null;
  const cerrarLista = () => { if (listaAbierta) { html += `</${listaAbierta}>`; listaAbierta = null; } };

  for (const linea of lineas) {
    const l = linea.trim();
    if (!l) { cerrarLista(); continue; }
    let m;

    if ((m = l.match(/^\[FOTO_REAL:\s*([^\]]+)\]$/i))) {
      cerrarLista();
      const q = m[1].trim();
      const dataUrl = imgMap.get(q.toLowerCase());
      if (dataUrl) html += `<figure class="doc-figura"><img class="doc-imagen" src="${dataUrl}" alt="${esc(q)}" /><figcaption class="doc-caption">Fotografia: ${esc(q)}</figcaption></figure>`;
      continue;
    }
    if ((m = l.match(/^!\[([^\]]*)\]\(([^)]+)\)$/))) {
      cerrarLista();
      const dataUrl = imgMap.get(m[2]) || m[2];
      html += `<figure class="doc-figura"><img class="doc-imagen" src="${dataUrl}" alt="${esc(m[1])}" />${m[1] ? `<figcaption class="doc-caption">Fotografia: ${esc(m[1])}</figcaption>` : ''}</figure>`;
      continue;
    }
    if ((m = l.match(/^###\s+(.+)/))) { cerrarLista(); html += `<h3 class="doc-h3">${inline(m[1])}</h3>`; continue; }
    if ((m = l.match(/^##\s+(.+)/)))  { cerrarLista(); html += `<h2 class="doc-h2">${inline(m[1])}</h2>`; continue; }
    if ((m = l.match(/^#\s+(.+)/)))   { cerrarLista(); html += `<h1 class="doc-h1">${inline(m[1])}</h1>`; continue; }
    if (/^---+$/.test(l)) { cerrarLista(); html += '<hr class="doc-hr">'; continue; }
    if ((m = l.match(/^[-*]\s+(.+)/))) {
      if (listaAbierta !== 'ul') { cerrarLista(); html += '<ul class="doc-ul">'; listaAbierta = 'ul'; }
      html += `<li>${inline(m[1])}</li>`; continue;
    }
    if ((m = l.match(/^\d+[.)]\s+(.+)/))) {
      if (listaAbierta !== 'ol') { cerrarLista(); html += '<ol class="doc-ol">'; listaAbierta = 'ol'; }
      html += `<li>${inline(m[1])}</li>`; continue;
    }
    cerrarLista();
    html += `<p class="doc-p">${inline(l)}</p>`;
  }
  cerrarLista();
  return html;
}

function buildHtml(titulo, contenido, imgMap) {
  const fechaHoy = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const cuerpo = markdownAHtmlDoc(contenido, imgMap);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(titulo)}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:wght@400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Lora',Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.7;color:#0a0a0a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pagina{width:210mm;min-height:297mm;margin:0 auto;padding:20mm 22mm;background:#fff}
.membrete{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:28px}
.membrete-marca{font-family:'Playfair Display',Georgia,serif;font-size:14pt;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#000}
.membrete-subtitulo{font-size:7pt;letter-spacing:1.5px;text-transform:uppercase;color:#555;margin-top:3px}
.membrete-fecha{font-size:8.5pt;color:#444;text-align:right;padding-top:4px}
.titulo-doc{font-family:'Playfair Display',Georgia,serif;font-size:24pt;font-weight:700;line-height:1.2;color:#000;margin-bottom:6px}
.separador-titulo{width:60px;height:3px;background:#000;margin:12px 0 28px}
.doc-h1{font-family:'Playfair Display',Georgia,serif;font-size:18pt;font-weight:700;color:#000;margin:28px 0 10px;padding-bottom:6px;border-bottom:1.5px solid #000}
.doc-h2{font-family:'Playfair Display',Georgia,serif;font-size:14pt;font-weight:600;color:#111;margin:22px 0 8px}
.doc-h3{font-family:'Playfair Display',Georgia,serif;font-size:12pt;font-weight:600;color:#222;margin:16px 0 6px}
.doc-p{margin:0 0 12px;text-align:justify;hyphens:auto}
.doc-ul,.doc-ol{margin:8px 0 14px 24px}
.doc-ul li,.doc-ol li{margin-bottom:5px}
.doc-hr{border:none;border-top:1px solid #ccc;margin:20px 0}
strong{font-weight:700}em{font-style:italic}
code{font-family:'Courier New',monospace;font-size:9pt;background:#f0f0f0;padding:1px 4px;border-radius:3px}
.doc-figura{margin:20px auto;text-align:center;page-break-inside:avoid;max-width:85%}
.doc-imagen{max-width:100%;max-height:260px;height:auto;border:1px solid #000;border-radius:3px;display:block;margin:0 auto}
.doc-caption{font-size:8.5pt;color:#444;margin-top:6px;font-style:italic}
.pie{display:flex;justify-content:space-between;border-top:1px solid #000;padding-top:8px;margin-top:40px;font-size:8pt;color:#555}
</style>
</head>
<body>
<div class="pagina">
  <header class="membrete">
    <div><div class="membrete-marca">Fenix IA</div><div class="membrete-subtitulo">Documento generado por IA</div></div>
    <div class="membrete-fecha">${esc(fechaHoy)}</div>
  </header>
  <h1 class="titulo-doc">${esc(titulo)}</h1>
  <div class="separador-titulo"></div>
  <div class="cuerpo-doc">${cuerpo}</div>
  <footer class="pie">
    <span>Generado por Fenix IA &mdash; Documento digital</span>
    <span>Pagina 1</span>
  </footer>
</div>
</body>
</html>`;
}

async function generarPDF(titulo, contenidoMarkdown, imagenes = []) {
  const urlsPorDescargar = new Map();

  for (const img of (imagenes || [])) {
    if (img?.url) urlsPorDescargar.set(img.url, img.url);
  }

  const fotoRealMatches = [...String(contenidoMarkdown || '').matchAll(/\[FOTO_REAL:\s*([^\]]+)\]/gi)];
  const fotoRealQueries = [...new Set(fotoRealMatches.map(m => m[1].trim()))];

  let buscarImagenReal;
  try { ({ buscarImagenReal } = require('../routes/imagenesReales')); } catch { buscarImagenReal = null; }

  if (buscarImagenReal && fotoRealQueries.length) {
    await Promise.allSettled(
      fotoRealQueries.map(async (q) => {
        try {
          const res = await buscarImagenReal(q, 1);
          if (res?.[0]?.url) urlsPorDescargar.set(q.toLowerCase(), res[0].url);
        } catch { }
      })
    );
  }

  const imgMap = new Map();
  const entradas = [...urlsPorDescargar.entries()];
  for (let i = 0; i < entradas.length; i += 5) {
    await Promise.allSettled(
      entradas.slice(i, i + 5).map(async ([clave, url]) => {
        const dataUrl = await urlABase64(url);
        if (dataUrl) imgMap.set(clave.toLowerCase(), dataUrl);
      })
    );
  }

  const html = buildHtml(titulo, contenidoMarkdown, imgMap);

  let browser;
  try {
    const puppeteer = require('puppeteer');
    const opciones = {
      headless: 'new',
      args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-extensions'],
    };
    if (EN_PRODUCCION && process.env.PUPPETEER_EXECUTABLE_PATH) {
      opciones.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    browser = await puppeteer.launch(opciones);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '22mm', bottom: '20mm', left: '22mm' },
      displayHeaderFooter: false,
    });
    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) { try { await browser.close(); } catch { } }
  }
}

module.exports = { generarPDF };
