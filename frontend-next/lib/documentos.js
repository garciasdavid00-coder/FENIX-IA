/**
 * Utilidades para vista previa, exportación a PDF, Word e impresión
 * de documentos generados por Fenix IA.
 */

/**
 * Genera un PDF de alta calidad en el servidor (Puppeteer) y devuelve
 * una Blob URL apta para mostrar en <iframe> y para descarga directa.
 *
 * @param {string} titulo             - Título del documento
 * @param {string} contenidoMarkdown  - Contenido en markdown (con [FOTO_REAL:] etc.)
 * @param {Array}  imagenes           - Imágenes adicionales [{ url, caption }]
 * @returns {Promise<string>}         - Blob URL (revócala con URL.revokeObjectURL cuando ya no la necesites)
 * @throws {Error}                    - Si el servidor responde con error o la red falla
 */
export async function generarPDFServidor(titulo, contenidoMarkdown, imagenes = []) {
  const res = await fetch('/api/documentos/generar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, contenido: contenidoMarkdown, imagenes }),
  });

  if (!res.ok) {
    let msg = `Error del servidor (${res.status})`;
    try {
      const json = await res.json();
      msg = json.error || msg;
    } catch { /* res no era JSON */ }
    throw new Error(msg);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}


const escapar = (s) => String(s || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const enLinea = (s) => escapar(s)
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
  .replace(/`([^`]+)`/g, '<code>$1</code>');

/**
 * Convierte el formato simple que usa el modelo (# títulos, - viñetas, **negritas**)
 * a HTML estructurado y elegante para la vista previa y el archivo PDF/Word.
 */
export function convertirMarkdownAHtml(contenido) {
  const lineas = String(contenido || '').replace(/```[\s\S]*?```/g, (m) => m).split('\n');
  let html = '';
  let listaAbierta = null;
  const cerrarLista = () => {
    if (listaAbierta) {
      html += `</${listaAbierta}>`;
      listaAbierta = null;
    }
  };

  for (const linea of lineas) {
    const l = linea.trim();
    if (!l) { cerrarLista(); continue; }
    let m;
    if ((m = l.match(/^\[FOTO_REAL:\s*([^\]]+)\]$/i))) {
      cerrarLista();
      const q = m[1].trim();
      html += `<div class="doc-img-container"><img class="doc-imagen" src="/api/foto-directa?q=${encodeURIComponent(q)}" alt="${escapar(q)}" loading="lazy" /><div class="doc-img-caption">📷 ${escapar(q)}</div></div>`;
    } else if ((m = l.match(/^\[FENIX_IMG:([^\]]+)\]$/i))) {
      cerrarLista();
      html += `<div class="doc-img-container"><img class="doc-imagen" src="${escapar(m[1])}" alt="Imagen del documento" loading="lazy" /></div>`;
    } else if ((m = l.match(/^!\[([^\]]*)\]\(([^)]+)\)$/))) {
      cerrarLista();
      html += `<div class="doc-img-container"><img class="doc-imagen" src="${escapar(m[2])}" alt="${escapar(m[1])}" loading="lazy" />${m[1] ? `<div class="doc-img-caption">📷 ${escapar(m[1])}</div>` : ''}</div>`;
    } else if ((m = l.match(/^###\s+(.+)/))) {
      cerrarLista();
      html += `<h3 class="doc-h3">${enLinea(m[1])}</h3>`;
    } else if ((m = l.match(/^##\s+(.+)/))) {
      cerrarLista();
      html += `<h2 class="doc-h2">${enLinea(m[1])}</h2>`;
    } else if ((m = l.match(/^#\s+(.+)/))) {
      cerrarLista();
      html += `<h1 class="doc-h1">${enLinea(m[1])}</h1>`;
    } else if ((m = l.match(/^[-*]\s+(.+)/))) {
      if (listaAbierta !== 'ul') { cerrarLista(); html += '<ul class="doc-ul">'; listaAbierta = 'ul'; }
      html += `<li class="doc-li">${enLinea(m[1])}</li>`;
    } else if ((m = l.match(/^\d+[.)]\s+(.+)/))) {
      if (listaAbierta !== 'ol') { cerrarLista(); html += '<ol class="doc-ol">'; listaAbierta = 'ol'; }
      html += `<li class="doc-li">${enLinea(m[1])}</li>`;
    } else {
      cerrarLista();
      html += `<p class="doc-p">${enLinea(l)}</p>`;
    }
  }
  cerrarLista();
  return html;
}

/**
 * Genera y descarga un archivo PDF profesional y limpio con jsPDF y html2canvas.
 * @param {string} titulo - Título del documento
 * @param {string} contenidoMarkdown - Contenido en formato Markdown
 * @param {HTMLElement} [elementoExistente=null] - Elemento DOM de la vista previa si está disponible
 */
export async function descargarPDF(titulo, contenidoMarkdown, elementoExistente = null) {
  const nombreSeguro = String(titulo || 'documento')
    .replace(/[^\w\s\u00C0-\uFFFF-]/g, '')
    .trim()
    .slice(0, 80) || 'documento';

  // Importación dinámica de librerías para compatibilidad con SSR / Next.js
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  // Creamos un contenedor temporal optimizado para formato A4 si no se pasa elemento
  let contenedor = elementoExistente;
  let esTemporal = false;

  if (!contenedor) {
    esTemporal = true;
    contenedor = document.createElement('div');
    contenedor.className = 'pdf-render-sheet';
    contenedor.innerHTML = `
      <div class="pdf-document-paper">
        <div class="pdf-header">
          <div class="pdf-brand">FENIX IA · DOCUMENTO VERIFICADO</div>
          <div class="pdf-date">${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <h1 class="pdf-title">${escapar(titulo || 'Documento')}</h1>
        <div class="pdf-body">
          ${convertirMarkdownAHtml(contenidoMarkdown)}
        </div>
        <div class="pdf-footer">
          <span>Generado por Fenix IA</span>
          <span>Página 1</span>
        </div>
      </div>
    `;
    document.body.appendChild(contenedor);
  }

  try {
    const canvas = await html2canvas(contenedor, {
      scale: 2, // Calidad HD (alta resolución)
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // A4 mm
    const pageHeight = 297; // A4 mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Primera página
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Páginas subsiguientes si el documento es largo
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(`${nombreSeguro}.pdf`);
  } catch (err) {
    console.error('[descargarPDF] Error al generar PDF con html2canvas, usando fallback de impresión:', err);
    imprimirDocumento(titulo, contenidoMarkdown);
  } finally {
    if (esTemporal && contenedor?.parentNode) {
      contenedor.parentNode.removeChild(contenedor);
    }
  }
}

/**
 * Imprime o guarda como PDF nativo mediante el diálogo de impresión del navegador.
 */
export function imprimirDocumento(titulo, contenidoMarkdown) {
  const html = convertirMarkdownAHtml(contenidoMarkdown);
  const ventana = window.open('', '_blank');
  if (!ventana) return;

  ventana.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapar(titulo)}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { font-size: 20pt; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 20px; color: #0f172a; }
          h2 { font-size: 14pt; margin-top: 24px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          h3 { font-size: 12pt; margin-top: 18px; color: #334155; }
          p { margin: 12px 0; }
          ul, ol { padding-left: 24px; margin: 12px 0; }
          li { margin: 6px 0; }
          img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
          .header { font-size: 9pt; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="header">Fenix IA · Documento Verificado</div>
        <h1>${escapar(titulo)}</h1>
        ${html}
      </body>
    </html>
  `);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => {
    ventana.print();
    ventana.close();
  }, 350);
}

const utf8ABase64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

const blobABase64 = (blob) =>
  new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result).split(',')[1] || '');
    lector.onerror = rechazar;
    lector.readAsDataURL(blob);
  });

const envolver76 = (s) => s.replace(/(.{76})/g, '$1\n');

/**
 * Descarga un documento como .doc legible por Word/LibreOffice/Google Docs.
 */
export async function descargarDocumento(titulo, contenidoMarkdown) {
  const cuerpoHtml = convertirMarkdownAHtml(contenidoMarkdown);
  let docHtml = '<html xmlns:w="urn:schemas-microsoft-com:office:word">' +
    `<head><meta charset="utf-8"><title>${String(titulo || '').replace(/[<>]/g, '')}</title>` +
    '<style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.4;}' +
    'h1{font-size:18pt;color:#1a3c6e;}h2{font-size:14pt;color:#2a528f;}h3{font-size:12pt;color:#2a528f;}' +
    '.doc-imagen{max-width:480px;border-radius:8px;margin:10px 0;}</style></head>' +
    `<body>${cuerpoHtml}</body></html>`;

  const partesImagen = [];
  const tokens = String(contenidoMarkdown || '').match(/\[FENIX_IMG:[^\]]+\]/g) || [];
  for (const token of tokens) {
    const url = token.slice(11, -1);
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('http ' + r.status);
      const blob = await r.blob();
      const tipo = (blob.type || 'image/jpeg').split(';')[0];
      if (!tipo.startsWith('image/')) throw new Error('no imagen');
      const nombre = 'foto' + (partesImagen.length + 1) + (tipo === 'image/png' ? '.png' : '.jpg');
      docHtml = docHtml.replace(token, `<img class="doc-imagen" src="${nombre}" alt="">`);
      partesImagen.push({ nombre, tipo, b64: await blobABase64(blob) });
    } catch (e) {
      docHtml = docHtml.replace(token, '');
    }
  }

  let contenido;
  if (partesImagen.length) {
    const LIM = '==FENIX==';
    let mht = 'MIME-Version: 1.0\r\n' +
      'Content-Type: multipart/related; type="text/html"; boundary="' + LIM + '"\r\n\r\n' +
      '--' + LIM + '\r\nContent-Location: file:///C:/FenixIA/doc.html\r\n' +
      'Content-Transfer-Encoding: base64\r\nContent-Type: text/html; charset="utf-8"\r\n\r\n' +
      envolver76(utf8ABase64(docHtml)) + '\r\n';
    for (const p of partesImagen) {
      mht += '--' + LIM + '\r\nContent-Location: file:///C:/FenixIA/' + p.nombre + '\r\n' +
        'Content-Transfer-Encoding: base64\r\nContent-Type: ' + p.tipo + '\r\n\r\n' +
        envolver76(p.b64) + '\r\n';
    }
    mht += '--' + LIM + '--\r\n';
    contenido = mht;
  } else {
    contenido = '\ufeff' + docHtml;
  }

  const blob = new Blob([contenido], { type: 'application/msword' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  const nombreSeguro = String(titulo || '')
    .replace(/[^\w\s\u00C0-\uFFFF-]/g, '').trim().slice(0, 80) || 'documento';
  enlace.download = nombreSeguro + '.doc';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 5000);
}