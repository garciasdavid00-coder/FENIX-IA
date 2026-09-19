/**
 * routes/documentos.js
 * POST /api/documentos/generar
 * Recibe { contenido, imagenes } y devuelve un PDF binario (inline).
 */
'use strict';

const express = require('express');
const router  = express.Router();
const { generarPDF } = require('../services/pdfGenerator');

router.post('/api/documentos/generar', express.json({ limit: '5mb' }), async (req, res) => {
  const { contenido, imagenes = [], titulo } = req.body || {};

  if (!contenido || typeof contenido !== 'string' || !contenido.trim()) {
    return res.status(400).json({ error: 'El campo "contenido" es obligatorio y no puede estar vacio.' });
  }

  // Extraer titulo del markdown si no viene en el body
  const tituloFinal = (titulo && String(titulo).trim())
    || (contenido.match(/^#\s+(.+)$/m)?.[1]?.replace(/[*_`]/g, '').trim())
    || 'Documento Fenix IA';

  try {
    console.log('[documentos] Generando PDF:', tituloFinal);
    const pdfBuffer = await generarPDF(tituloFinal, contenido, imagenes);

    const nombreSeguro = tituloFinal.replace(/[^\w\s\u00C0-\uFFFF-]/g, '').trim().slice(0, 80) || 'documento';

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `inline; filename="${nombreSeguro}.pdf"`,
      'Content-Length':      pdfBuffer.length,
      'Cache-Control':       'no-store',
    });
    return res.send(pdfBuffer);

  } catch (err) {
    console.error('[documentos] Error generando PDF:', err.message);
    return res.status(500).json({
      error: 'No se pudo generar el PDF. ' + (err.message || 'Error interno de Puppeteer.'),
    });
  }
});

module.exports = router;
