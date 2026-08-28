/* ============================================================
   Generador de documentos con HECHOS REALES (grounding de Google)
   ------------------------------------------------------------
   Este módulo reemplaza al generador "alucinador" de documentos:
   el modelo usa la herramienta google_search de Gemini (grounding)
   para buscar información real en internet ANTES de redactar, de
   forma que no inventa fechas, nombres ni cifras.

   En vez de pedirle imágenes generadas por IA, el modelo emite
   marcadores [IMG_QUERY: consulta corta] que luego el servidor
   resuelve contra imágenes REALES de Wikimedia Commons (ver
   routes/imagenesReales.js).
   ============================================================ */

// Instrucciones de sistema que fijan la personalidad del redactor.
const SYSTEM_PROMPT_DOCUMENTOS = `Eres Fenix IA, un redactor de documentos profesional, honesto y preciso. Redactas informes, biografías, ensayos y reportes basándote SIEMPRE en información REAL verificada que obtienes del buscador.

REGLAS ESTRICTAS (no las rompas en ningún caso):
1) NO inventes NINGÚN dato concreto: fechas, nombres propios, cifras, estadísticas, citas, eventos o lugares. Basa TODO exclusivamente en los resultados de búsqueda reales que recibiste (grounding).
2) Si el buscador no te da información sobre un dato, NO lo adivines: omítelo o indica claramente que no hay información verificada.
3) Si no hay suficientes resultados, dilo con honestidad al inicio del documento y redacta solo lo que realmente puedas verificar.
4) No presentes una suposición como un hecho. Diferencia siempre entre hechos corroborados y opiniones o estimaciones.
5) Escribe en el idioma en que se te pide el tema (si no se indica, en español). Usa un tono claro, directo y útil.

FORMATO DE SALIDA (usa SOLO este formato, sin excepciones):
- Usa "# " para el título principal, "## " para secciones y "### " para subsecciones.
- Usa "- " para listas con viñetas y "**texto**" para negritas. Los párrafos van separados por una línea en blanco.
- NO uses tablas, enlaces, bloques de código ni etiquetas HTML.
- Cuando el documento quedaría mejor con apoyo visual, inserta en UNA LÍNEA APARTE el marcador exacto: [IMG_QUERY: consulta corta de 3 a 6 palabras]
  Ejemplos válidos: [IMG_QUERY: Torre Eiffel París 1889] o [IMG_QUERY: retrato Simón Bolívar].
  Esa consulta describe la FOTO REAL que se buscará en internet para ilustrar el punto. Úsala solo cuando aporte valor real y no abuses (máximo 3-4 por documento).
- NUNCA generes URLs de imágenes, ni escribas texto como "imagen aquí" o "foto:": solo el marcador [IMG_QUERY: ...].`;

/**
 * Llama a la API de Gemini con grounding de Google Search para
 * generar el documento. Devuelve el texto redactado y las fuentes
 * reales (URLs) que el modelo usó como respaldo.
 *
 * @param {{ tema: string, apiKey: string, modelo: string }} opts
 *        tema: asunto/consulta del documento
 *        apiKey: GEMINI_API_KEY
 *        modelo: id del modelo (por defecto gemini-3.6-flash)
 * @returns {Promise<{ contenido: string, fuentes: {titulo: string, url: string}[] }>}
 */
async function generarDocumentoConHechosReales({ tema, apiKey, modelo }) {
  const asunto = String(tema || '').trim();
  if (!asunto) {
    throw new Error('generarDocumentoConHechosReales: falta el "tema".');
  }
  if (!apiKey) {
    throw new Error('generarDocumentoConHechosReales: falta la GEMINI_API_KEY.');
  }

  const modeloIA = modelo || 'gemini-3.6-flash';
  const urlApi = 'https://generativelanguage.googleapis.com/v1beta/models/'
    + encodeURIComponent(modeloIA)
    + ':generateContent?key=' + encodeURIComponent(apiKey);

  const cuerpo = {
    // Instrucciones de sistema: personalidad + formato del documento.
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT_DOCUMENTOS }] },
    // El tema es lo único que llega como mensaje del usuario.
    contents: [{ role: 'user', parts: [{ text: asunto.slice(0, 2000) }] }],
    // GROUNDING: obliga a buscar en internet de verdad antes de responder.
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.3,     // baja para favorecer precisión sobre creatividad
      maxOutputTokens: 4096
    }
  };

  console.log('[documento-real] Consultando Gemini (' + modeloIA + ') con grounding...');

  const respuesta = await fetch(urlApi, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo)
  });

  // Leemos el cuerpo (aunque falle) para poder loguear el detalle en Render.
  const data = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const detalle = (data && data.error && data.error.message) ||
      JSON.stringify(data).slice(0, 400) || respuesta.statusText;
    console.error('[documento-real] Gemini respondió', respuesta.status + ':', detalle);
    throw new Error('Gemini respondió ' + respuesta.status + ': ' + detalle);
  }

  const candidato = data && data.candidates && data.candidates[0];
  const partes = (candidato && candidato.content && candidato.content.parts) || [];

  const contenido = partes
    .filter(p => typeof p.text === 'string')
    .map(p => p.text)
    .join('')
    .trim();

  if (!contenido) {
    const motivoBloqueo = (candidato && candidato.finishReason) || 'desconocido';
    console.error('[documento-real] Gemini devolvió el documento vacío. finishReason =', motivoBloqueo);
    throw new Error('El documento salió vacío de la API de Gemini (finishReason: ' + motivoBloqueo + ').');
  }

  // Fuentes REALES usadas por el grounding (las que el modelo citó).
  const chunks = (candidato && candidato.groundingMetadata && candidato.groundingMetadata.groundingChunks) || [];
  const fuentes = chunks
    .map(c => ({ titulo: (c.web && c.web.title) || '', url: (c.web && c.web.uri) || '' }))
    .filter(f => f.url);

  console.log('[documento-real] Documento listo (' + contenido.length + ' caracteres, ' + fuentes.length + ' fuentes).');

  return { contenido, fuentes };
}

module.exports = {
  SYSTEM_PROMPT_DOCUMENTOS,
  generarDocumentoConHechosReales
};