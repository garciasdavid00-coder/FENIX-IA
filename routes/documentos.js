/**
 * routes/documentos.js
 * POST /api/documentos/generar
 * Recibe { contenido, imagenes } y devuelve un PDF binario (inline).
 */
'use strict';

const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');
const limiter=rateLimit({windowMs:60000,limit:4,standardHeaders:true,legacyHeaders:false});
const { generarPDF } = require('../services/pdfGenerator');

router.post('/api/documentos/generar', limiter, express.json({ limit: '5mb' }), async (req, res) => {
  const { contenido, imagenes = [], titulo } = req.body || {};

  if (!contenido || typeof contenido !== 'string' || !contenido.trim()) {
    return res.status(400).json({ error: 'El campo "contenido" es obligatorio y no puede estar vacio.' });
  }

  if (contenido.length > 100000 || !Array.isArray(imagenes) || imagenes.length > 12) return res.status(400).json({error:'Documento demasiado grande o imágenes inválidas.'});

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
    return res.status(err.status || 500).json({
      error: err.status === 429 ? err.message : 'No se pudo generar el PDF. Intenta de nuevo.',
    });
  }
});

module.exports = router;
