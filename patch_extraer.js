const fs = require('fs');
let wsPath = 'backend/webSearch.js';
let content = fs.readFileSync(wsPath, 'utf8');

const targetExtraer = `function extraerQueryBusqueda(mensaje) {
  let q = String(mensaje || '').trim();
  q = q.replace(/^(por\\s+favor\\s+)?(busca(r)?|investiga(r)?|googlea(r)?|averigua(r)?|dime|cu[aá]l\\s+es|caul\\s+es|qu[eé]\\s+es)(\\s+en\\s+(internet|la\\s+web|google))?(\\s+sobre|\\s+acerca\\s+de)?\\s+/i, '');
  q = q.replace(/^[¿¡'"“”\\s]+|[?！!'"“”\\s]+$/g, '').trim();
  return q.slice(0, 150) || mensaje;
}`;

const replaceExtraer = `function extraerQueryBusqueda(mensaje) {
  let q = String(mensaje || '').trim();
  q = q.replace(/^(por\\s+favor\\s+)?(busca(r)?|investiga(r)?|googlea(r)?|averigua(r)?|dime|cu[aá]l\\s+es|caul\\s+es|qu[eé]\\s+pas[oó]|qu[eé]\\s+es)(\\s+en\\s+(internet|la\\s+web|google))?(\\s+sobre|\\s+acerca\\s+de)?\\s+/i, '');
  // Clean conversational fluff from news queries
  q = q.replace(/\\b(las\\s+)?noticias\\s+(de\\s+)?(hoy|ahora|ayer|el\\s+d[ií]a\\s+de\\s+hoy|últimas|recientes)\\s+(sobre|en|de)?\\s*/gi, '');
  q = q.replace(/\\b(eventos\\s+hot|eventos\\s+relevantes|cosas\\s+relevantes)\\b/gi, '');
  q = q.replace(/^[¿¡'"“”\\s]+|[?！!'"“”\\s]+$/g, '').trim();
  return q.slice(0, 150) || mensaje;
}`;

content = content.replace(targetExtraer, replaceExtraer);

// Also modify the fallback behavior! If query includes `when:1d`, DuckDuckGo shouldn't receive it!
// Oh wait, `buscarWebMultiFuente(query)` gets the ORIGINAL query, so it doesn't have `when:1d`.
// But DuckDuckGo still returns old crap. 
// If Searlo returns 0 on news, maybe DuckDuckGo isn't a good fallback for news. But whatever, if the query is cleaned, Searlo WILL return hits!

fs.writeFileSync(wsPath, content);
console.log('extraerQueryBusqueda patched for conversational fluff.');
