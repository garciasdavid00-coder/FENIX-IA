# Búsqueda web: reparación y verificación

Verificado el 26 de septiembre de 2026, zona America/Managua. Cambios locales, sin despliegue y sin modificar DeepSeek.

## Hallazgos y cambios

| Archivo/línea | Problema | Gravedad | Evidencia |
|---|---|---|---|
| backend/searchPolicy.js:5 | «Hoy» se enviaba como palabra; el proveedor devolvía noticias antiguas que después eran descartadas. Ahora se envía un rango y se valida la fecha en la zona del usuario. | Moderado | SerpApi real: antes cero fuentes aceptadas; después cinco de Nicaragua del día solicitado. |
| backend/webSearch.js:109 | Las instrucciones «con fecha y enlaces» contaminaban la consulta; se borraban artículos de nombres como El Salvador. Se separaron instrucciones de formato y se conservaron nombres. | Moderado | La primera prueba real del endpoint falló sin fuentes; después del ajuste pasó. Prueba de regresión agregada. |
| backend/webSearchProviders.js:8 | Resultados del país o tema equivocado y redes sociales desplazaban fuentes más pertinentes. Se añadió filtro y ordenación por coincidencia de país/tema. | Moderado | Pruebas controladas y consulta real sobre tecnología en México. Es una heurística, no una garantía semántica universal. |
| backend/searchPolicy.js:46 | Una lista de recomendaciones de video se interpretaba como texto del artículo. Se descarta contenido sin corCOM |
| backend/webSearchProviders.js:38 | No quedaba claro qué fuentes se habían leído. Se descarga texto de hasta cinco páginas y se etiqueta artículo/extracto/titular, fecha reportada o aproximada. Se incluyen las URLs junto al contenido. | Moderado | Evidencia real: Nicaragua 3 artículos leídos; México 4; consulta general 1. Las páginas inaccesibles permanecen identificadas como extracto/titular. |
| server.js:742 | Una búsqueda vacía podía continuar al modelo sin contexto fresco. Ahora se termina el stream con la limitación explícita; también se aplica al segundo intento disparado por el modelo. | Moderado | Endpoint HTTP probado con cero fuentes: HTTP 200, mensaje de limitación, DONE y cero llamadas al modelo. La rama del segundo intento se verificó por código, no con proveedor real. |

## Pruebas ejecutadas

- 36 pruebas: 36 pass, 0 fail. Output completo: [web-regression.txt](verification/web-regression.txt).
- Noticias de Nicaragua hoy: 5 fuentes, 3 artículos leídos; fechas del 26/09/2026 en Managua. [Resultado completo](verification/web-live-nicaragua.json).
- Noticias de México sobre tecnología hoy: 5 fuentes, 4 artículos leídos. [Resultado completo](verification/web-live-mexico.json).
- Qué es la fotosíntesis: 5 fuentes, 1 artículo leído y 4 extractos. No se exige fecha reciente a una pregunta general. [Resultado completo](verification/web-live-general.json).
- Prueba real de /api/chat con SerpApi y Groq: HTTP 200, sin errores SSE, 5 fuentes, respuesta con fechas y enlaces. Autenticación y base de datos aisladas, sin escrituras en producción. [Respuesta completa](verification/web-live-chat.json).
- node --check de los cuatro archivos de ejecución modificados y git diff --check: exit 0.

## Límites

- No desplegado ni probado en la instancia de producción. Google OAuth y base de datos no forman parte de esta prueba de búsqueda.
- Los fallbacks Tavily y Serper no se probaron con cuentas reales en esta sesión; SerpApi sí. RSS/Wikipedia conservan el aviso de titular/extracto.
- La fecha se verifica contra los metadatos reportados por el proveedor: no prueba por sí sola la fecha del acontecimiento ni la veracidad de cada artículo.
- Se implementaron y probaron hoy, ayer y esta semana. No se garantiza interpretar todas las expresiones históricas o intervalos en lenguaje natural.
- La calidad y disponibilidad futuras dependen del proveedor y del acceso permitido por cada sitio. Las fuentes no leídas no se presentan como artículos extraídos.

## Referencias de API consultadas

- [SerpApi Google News](https://serpapi.com/google-news-api): consulta y estructura highlight/stories.
- [SerpApi Search API](https://serpapi.com/search-api): filtros avanzados tbs.
- [Tavily Search](https://docs.tavily.com/documentation/api-reference/endpoint/search): fechas, autenticación y metadatos.

## Calidad de búsqueda — 28 septiembre 2026

Se separaron frases conversacionales del tema, se conserva la consulta explícita de noticias sin reescritura del modelo y se presenta la fecha local de publicación junto al período solicitado. Se excluyen contradicciones de fecha en URL/titular, patrones de spam, títulos repetidos y exceso de deportes en noticias generales. La detección de spam y similitud es heurística, no una garantía universal.

Se prueban fuentes alternativas cuando solo hay titulares. El chat devuelve una lista limitada sin generación adicional cuando no pudo leer más que titulares. El fallback RSS pasa por los mismos filtros y extracción.

Verificación: 47 tests aprobados, 0 fallidos, ejecutando node --test --test-isolation=none tests/web-search.test.js tests/regression.test.js tests/session-store.test.js. La prueba real tests/search-quality-live.cjs recuperó, en su última ejecución, un artículo y un extracto con fecha local 2026-09-27. También se observó un timeout intermitente del proveedor alternativo en una ejecución anterior. Las fechas relativas del proveedor siguen siendo aproximadas y las fechas de publicación no prueban las fechas de los hechos. DeepSeek no se modificó.

Comprobación final: el endpoint local devolvió HTTP 200 con fuentes y enlaces, pero el modelo mezclaba titulares no leídos con el artículo disponible. Se restringió por código el contexto a artículos/extractos cuando existen; los titulares quedan únicamente para la respuesta limitada sin generación. Las 17 pruebas de búsqueda pasaron de nuevo tras ese ajuste. Queda registrado un fallo intermitente HTTP 500 por timeout de PostgreSQL en la comprobación con cookie: no se considera resuelto por los cambios de búsqueda. La generación no ofrece garantía absoluta sobre cada afirmación o enlace; los enlaces originales se conservan en la lista de fuentes.
