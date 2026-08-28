/* ============================================================
   Imágenes REALES desde Wikimedia Commons
   ------------------------------------------------------------
   Reemplaza al generador de imágenes por IA dentro de los
   documentos: aquí NO se inventa nada. Se busca la foto real en
   la API pública de Wikimedia Commons (sin API key, pero con
   header User-Agent obligatorio) y se devuelve su URL, licencia
   y autor.

   Se exportan dos cosas:
     - buscarImagenReal(consulta): función interna reutilizable
       (la usará también el flujo de documentos de server.js sin
       pasar por HTTP).
     - router: el endpoint GET /api/imagen-real para usos puntuales.
   ============================================================ */

const express = require('express');

// User-Agent obligatorio: Wikimedia lo exige para no bloquearte.
// Cámbialo por un correo de contacto real en producción.
const USER_AGENT = 'FenixIA-documentos/1.0 (contacto: joshua@fenixia.app; busca fotos reales de Wikimedia Commons)';

// Solo fotos raster: nada de svg/pdf/gif animados.
const EXTENSIONES_VALIDAS = /\.(jpe?g|png)$/i;
// Límite de resultados por búsqueda
const LIMITE_RESULTADOS = 6;

/* Quita etiquetas HTML, plantillas y ruido del campo "Artist"
   que a veces viene como "<a href=...>Nombre</a>". */
function limpiarAutor(crudo) {
  if (!crudo) return '';
  return String(crudo)
    .replace(/<[^>]*>/g, '')       // etiquetas HTML
    .replace(/\{\{.*?\}\}/g, '')   // plantillas tipo {{Creator:...}}
    .replace(/\{\s*\|[^}]*\}/g, '')// parámetros sueltos
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

/**
 * Busca una imagen real en Wikimedia Commons (namespace 6 = archivos).
 *
 * @param {string} consulta  descripción corta de la foto buscada
 * @param {number} limite    máx. resultados (por defecto LIMITE_RESULTADOS)
 * @returns {Promise<Array<{url: string, licencia: string, autor: string, fuentePagina: string}>>}
 */
async function buscarImagenReal(consulta, limite = LIMITE_RESULTADOS) {
  const q = String(consulta || '').trim();
  if (!q) throw new Error('buscarImagenReal: consulta de imagen vacía.');

  // filetype:bitmap sesga la búsqueda hacia fotografías (jpeg/png/gif).
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: q + ' filetype:bitmap',
    gsrnamespace: '6',                 // 6 = espacio de nombres Archivo
    gsrlimit: String(limite),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',        // URL + licencia y autor en metadatos
    iiurlwidth: '900'                 // pedimos una miniatura de ~900px
  });

  const urlApi = 'https://commons.wikimedia.org/w/api.php?' + params.toString();
  console.log('[imagen-real] Buscando en Commons:', q);

  const respuesta = await fetch(urlApi, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' }
  });

  if (!respuesta.ok) {
    console.error('[imagen-real] Wikimedia respondió', respuesta.status, 'para:', q);
    throw new Error('Wikimedia respondió ' + respuesta.status + ' al buscar "' + q + '".');
  }

  const data = await respuesta.json().catch(() => ({}));
  const paginas = (data && data.query && data.query.pages) || {};
  const resultados = [];

  for (const id in paginas) {
    const pagina = paginas[id];
    const titulo = pagina.title || '';
    // Filtramos solo .jpg/.jpeg/.png (nada de svg, pdf, etc.)
    if (!EXTENSIONES_VALIDAS.test(titulo)) continue;

    const info = Array.isArray(pagina.imageinfo) ? pagina.imageinfo[0] : null;
    if (!info) continue;
    if (!info.url && !info.thumburl) continue;

    const ext = info.extmetadata || {};
    const licencia = (ext.LicenseShortName && ext.LicenseShortName.value) || '';
    const autor = limpiarAutor((ext.Artist && ext.Artist.value) || '');
    // Wikimedia a veces añade parámetros UTM de seguimiento a la miniatura;
    // los quitamos para dejar una URL de imagen limpia en el documento.
    const quitaUtm = (u) => (/^[^?]*\?utm_/i).test(u) ? u.replace(/\?utm_.*$/i, '') : u;
    const urlImagen = quitaUtm(info.thumburl || info.url);
    const nombreArchivo = titulo.startsWith('File:') ? titulo.slice(5) : titulo;
    const fuentePagina = 'https://commons.wikimedia.org/wiki/File:' +
      encodeURIComponent(nombreArchivo).replace(/%20/g, '_');

    resultados.push({
      url: urlImagen,
      licencia: licencia,
      autor: autor,
      fuentePagina: fuentePagina
    });
  }

  return resultados;
}

// Router Express con el endpoint GET /api/imagen-real?q=...
const router = express.Router();

router.get('/api/imagen-real', async (req, res) => {
  const q = ((req.query.q != null) ? String(req.query.q) : '').trim().slice(0, 150);
  if (!q) {
    return res.status(400).json({ error: 'Falta el parámetro "q" con la descripción de la foto.' });
  }
  try {
    const encontradas = await buscarImagenReal(q);
    if (!encontradas.length) {
      console.warn('[imagen-real] Sin resultados para:', q);
      // 404 claro: nunca inventamos una URL de imagen.
      return res.status(404).json({
        error: 'No se encontró ninguna foto real de Wikimedia Commons para "' + q + '". No se va a inventar una URL de imagen.'
      });
    }
    res.json({ consulta: q, ...encontradas[0] });
  } catch (e) {
    console.error('[imagen-real] Error consultando Wikimedia:', e.message);
    res.status(502).json({ error: 'No se pudo consultar Wikimedia Commons. Intenta de nuevo.' });
  }
});

module.exports = { router, buscarImagenReal };