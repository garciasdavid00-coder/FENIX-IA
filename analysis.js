const fs = require('fs');
let wsPath = 'backend/webSearch.js';
let content = fs.readFileSync(wsPath, 'utf8');

const targetUrlLogic = `      const esNoticia = query.toLowerCase().includes('noticia') || query.toLowerCase().includes('news');
      const esHoy = query.toLowerCase().includes('hoy') || query.toLowerCase().includes('última') || query.toLowerCase().includes('ultima');`;

const replaceUrlLogic = `      // Verificamos si es noticia en la query OR en el historial (o podríamos pasarlo, pero como no lo tenemos directo, asumiremos que si viene por auto-search, extrajo noticias)
      // Mejor: si la query fue tan agresivamente limpiada que no tiene 'noticia', asumimos noticia si en el entorno se detectó. 
      // Por suerte, buscarEnWeb se llama después de evaluarBusquedaAutomatica. 
      // Si fue una búsqueda LLM generada, el modelo usará 'Nicaragua noticias'.
      // Cambiaremos esto para que siempre prefiera news si la query fue reducida a un país o si tiene sentido, pero es más seguro NO limpiar la palabra "noticias" en extraerQueryBusqueda.`;

// Wait, the easiest and safest fix is to change extraerQueryBusqueda so it leaves the words "noticias" and "hoy", but strips the garbage "las ", "del día de", "sobre eventos hot".
// Let's just fix extraerQueryBusqueda!
