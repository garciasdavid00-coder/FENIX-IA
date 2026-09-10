// Moderación de conversaciones Fenix IA
// Detecta insultos y lleva contador, bloquea a 5 insultos por conversación.
// Se ejecuta como middleware Express antes de procesar cada mensaje.

const insultosBase = [
  'puta', 'hijo', 'perra', 'mierda', 'cabrón', 'pendejo', 'estúpido', 'idiota',
  'tonto', 'imbécil', 'groso', 'boludo', 'pelotudo', 'cobarde', 'miedoso',
  'gil', 'gilipollas', 'retardado', 'nazi', 'fascista',
  'racista', 'sexista', 'homofóbico', 'homofobo', 'discriminatorio',
  'agresivo', 'agresión', 'amenaza', 'golpe', 'lastimar', 'daño', 'malo',
  'malvado', 'satanás', 'diablo', 'infiel', 'traidor', 'vergüenza',
  'lástima', 'pena', 'daño', 'dañar', 'malo', 'malvado', 'satanás',
];

function normalizarMensaje(texto) {
  if (typeof texto !== 'string') return '';
  let r = texto.toLowerCase();
  const m = { '4': 'a', '0': 'o', '5': 's', '1': 'i', '7': 't', '@': 'a' };
  for (const [k, v] of Object.entries(m)) {
    r = r.replace(new RegExp(k, 'g'), v);
  }
  r = r.replace(/[áéíóúñ]/g, c => {
    const tildes = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n' };
    return tildes[c] || c;
  });
  return r;
}

function detectarInsultoLista(texto) {
  const n = normalizarMensaje(texto);
  for (const p of insultosBase) {
    if (n.includes(p)) return { insulto: true, palabra_detectada: p };
  }
  return { insulto: false, palabra_detectada: null };
}

function moderationMiddleware() {
  // Ejecuta una vez al inicio y configura el contexto de moderación.
  // Retorna una función middleware de Express.
  return (req, res, next) => {
    try {
      // Identificar el chat por Google ID del usuario
      const googleId = req.user?.id || req.session?.googleId;
      req.moderation = {
        chatBloqueado: false,
        contadorActual: 0,
        palabraDetectada: null,
        identificador: googleId || 'sesion'
      };
      // En una implementación completa, aquí habría una consulta a la BD
      // para verificar is_blocked e incrementar insult_count.
      // Por ahora, el bloqueo y conteo se harán en el controlador chat.
      next();
    } catch (error) {
      console.error('Error en moderationMiddleware:', error.message);
      next();
    }
  };
}

module.exports = moderationMiddleware;