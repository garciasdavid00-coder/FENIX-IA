const fs = require('fs');
let wsPath = 'backend/webSearch.js';
let content = fs.readFileSync(wsPath, 'utf8');

const regexToReplace = /function extraerQueryBusqueda\(mensaje\) \{[\s\S]*?return q\.slice\(0, 150\) \|\| mensaje;\n\}/;

const newFunction = `function extraerQueryBusqueda(mensaje) {
  let q = String(mensaje || '').trim();
  // Quitar el prefijo de "dime", "busca", etc.
  q = q.replace(/^(por\\s+favor\\s+)?(busca(r)?|investiga(r)?|googlea(r)?|averigua(r)?|dime|cu[a-z]+l\\s+es|caul\\s+es|qu[e-z]+\\s+pas[o-z]+|qu[e-z]+\\s+es)(\\s+en\\s+(internet|la\\s+web|google))?(\\s+sobre|\\s+acerca\\s+de)?\\s+/i, '');
  
  // Limpiar frases conversacionales que matan el SEO de la busqueda
  q = q.replace(/\\b(las\\s+)?noticias\\s+(del\\s+)?(d[i-z]+a\\s+de\\s+)?(hoy|ahora|ayer|ma[n-z]+ana|esta\\s+semana|\\u00FAltimas|ultimas)\\s+(sobre|en|de|para)?\\s*/gi, '');
  q = q.replace(/\\b(eventos\\s+hot|eventos\\s+relevantes|cosas\\s+relevantes|eventos\\s+importantes)\\b/gi, '');
  
  q = q.replace(/^[¿¡'"“”\\s]+|[?！!'"“”\\s]+$/g, '').trim();
  return q.slice(0, 150) || mensaje;
}`;

content = content.replace(regexToReplace, newFunction);

fs.writeFileSync(wsPath, content);
console.log('extraerQueryBusqueda aggressively patched.');
