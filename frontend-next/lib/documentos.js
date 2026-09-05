import { apiFetch } from './api';

/**
 * Pide al servidor /api/documento-real (Gemini con grounding) un contenido real
 * sobre un tema, con fotos de Wikimedia, y devuelve el markdown simple de la app.
 * @param {string} tema - Consulta completa del usuario
 * @returns {Promise<string>} Contenido en formato simple ([FENIX_IMG:url], #,##, -)
 */
export async function generarDocumentoReal(tema) {
  const res = await apiFetch('/api/documento-real', {
    method: 'POST',
    body: JSON.stringify({ tema }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.contenido) {
    throw new Error(data.error || 'No se pudo generar el documento');
  }
  return String(data.contenido).replace(/\n{3,}/g, '\n\n').trim();
}

const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const enLinea = (s) => escapar(s)
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

/**
 * Convierte el formato simple que usa el modelo (# títulos, - viñetas, **negritas**)
 * a HTML para la vista previa y el archivo Word.
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
    if ((m = l.match(/^\[FENIX_IMG:([^\]]+)\]$/))) {
      cerrarLista();
      html += `<img class="doc-imagen" src="${escapar(m[1])}" alt="">`;
    } else if ((m = l.match(/^###\s+(.+)/))) { cerrarLista(); html += `<h3>${enLinea(m[1])}</h3>`; }
    else if ((m = l.match(/^##\s+(.+)/))) { cerrarLista(); html += `<h2>${enLinea(m[1])}</h2>`; }
    else if ((m = l.match(/^#\s+(.+)/))) { cerrarLista(); html += `<h1>${enLinea(m[1])}</h1>`; }
    else if ((m = l.match(/^[-*]\s+(.+)/))) {
      if (listaAbierta !== 'ul') { cerrarLista(); html += '<ul>'; listaAbierta = 'ul'; }
      html += `<li>${enLinea(m[1])}</li>`;
    } else if ((m = l.match(/^\d+[.)]\s+(.+)/))) {
      if (listaAbierta !== 'ol') { cerrarLista(); html += '<ol>'; listaAbierta = 'ol'; }
      html += `<li>${enLinea(m[1])}</li>`;
    } else { cerrarLista(); html += `<p>${enLinea(l)}</p>`; }
  }
  cerrarLista();
  return html;
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
 * Si el contenido trae fotos ([FENIX_IMG:url]) se incrustan en formato MHTML.
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