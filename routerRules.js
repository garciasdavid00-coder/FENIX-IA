// Reglas del router inteligente de modelos de Fenix IA.
// Ajusta aquí umbrales y patrones sin tocar modelRouter.js.

module.exports = {
  // Regla 4: modelo por defecto si ninguna regla aplica
  defaultModel: 'groq',

  // Regla 2: palabras máximas para considerar "mensaje corto/casual" → groq
  shortMaxWords: 30,

  // Regla 3: palabras mínimas para considerar "texto extenso" → gemini
  longMinWords: 80,

  // Regla 1: si el mensaje parece código o pide programar → deepseek
  codigo: {
    model: 'deepseek',
    codeFence: /```|~~~|`[^`\n]{20,}`/,
    // Palabras fuertes de programación (solas ya indican código)
    palabras: /\b(función|funcion|function|clase|class|método|metodo|bug|debug|excepción|excepcion|exception|stack.?trace|compil|ejecut|script|refactor)\b/i,
    // Nombres de lenguajes/tecnologías
    lenguajes: /\b(javascript|typescript|python|java|c\+\+|c#|golang|\bgo\b|rust|php|ruby|swift|kotlin|sql|html|css|bash|shell|powershell|react|node\.?js|\bnode\b|express|django|flask|backend|frontend|\bapi\b|postgres|mongo)\b/i,
    // Pide generar/revisar/corregir código
    pideCodigo: /\b(genera|generar|crea|crear|escribe|escribir|hazme|haz|revisa|revisar|corrige|corregir|arregla|fix|refactoriza)\b.*\b(código|codigo|code|función|funcion|function|clase|class|script)\b/i
  },

  // Regla 3: pide análisis/razonamiento → gemini
  razonamiento: {
    model: 'gemini',
    // Verbos fuertes: indican análisis aunque el mensaje sea corto
    fuerte: /\b(analiza|analizar|análisis|analisis|resume|resumir|resumen|sintetiza|sintetizar)\b/i,
    // Verbos suaves: solo cuentan si el mensaje es algo largo
    suave: /\b(explica|explicar|detalladamente|en detalle|compara|comparar|argumenta|argumentar)\b/i
  }
};