> Actualización: la búsqueda web recibió una reparación posterior y pruebas reales satisfactorias. Consulta [Búsqueda web: evidencia actual](BUSQUEDA_WEB_VERIFICACION.md). El estado de búsqueda descrito abajo corresponde a la revisión anterior.

# Fenix IA: estado de la reparación local — 26/09/2026

DeepSeek no se cambió. No se desplegó esta versión. Este documento no certifica que toda la aplicación esté libre de fallos.

## Cambios y evidencia

| Archivo/línea | Problema y gravedad | Verificación |
|---|---|---|
| frontend-next/lib/sse.js:2; hooks/useChatStream.js | Moderado: errores del proveedor y fragmentos SSE podían dejar respuestas vacías. Se unificó el lector y se muestra el error. | Pruebas de fragmentación UTF-8, error y hook; Chromium con script literal, API simulada. No equivale a probar cada proveedor real. |
| frontend-next/app/page.js:100 | Moderado: se perdían opciones de adjuntos/voz y faltaba ID estable al primer mensaje. | Prueba de propagación; navegador verifica una solicitud y persistencia. |
| backend/memoryManager.js:112 | Moderado: siguiente conversación podía leer antes de terminar la extracción; lectura condicionada por otro clasificador. Ahora espera la extracción pendiente por usuario. | Prueba ejecutada con proveedor y base simulados, incluido aislamiento. Falta comprobar recuerdo completo con dos chats autenticados reales. La cola pendiente no sobrevive un reinicio del proceso. |
| backend/moderationMiddleware.js:84; db.js:188 | Moderado: aviso no determinista, contadores y versión de historial interferían. Se separó el aviso de la generación y la moderación del cambio de versión del contenido. | Middleware simulado verifica aviso/segundo cierre; Groq real devolvió AGGRESSIVE_INSULT para «eres un idiota» y SELF_DISTRESS para «soy un idiota». No se verificó el recorrido OAuth+navegador+BD de moderación. |
| frontend-next/components/VoiceModal.js:7 | Moderado: peticiones duplicadas, respuesta sin puntuación final, interrupciones y cierre. | Tres pruebas con voz simulada: identidad mantiene estado abierto, cierre hablado, interrupción aborta y descarta respuesta vieja. Micrófono y eco real pendientes. |
| backend/searchPolicy.js:17; backend/webSearch.js | Moderado: extractos de navegación, región fija y resultados sin fecha para hoy. Se incorporó extracción de artículo, país y fecha. | Pruebas ejecutadas sobre HTML y fechas controlados. Consulta real «noticias Nicaragua hoy» devolvió cero fuentes; NO confirma contenido real actualizado ni calidad general de búsqueda. |
| backend/historyStore.js:9; frontend-next/context/ChatContext.js:54 | Crítico por posible pérdida de datos: snapshots parciales borraban conversaciones; almacenamiento compartido entre cuentas. Ahora borrado explícito, versiones de chats y almacenamiento por propietario. | PostgreSQL real con tablas temporales: inserción, conflicto 409, preservación de omitidos y borrado final. Navegador invitado. No se probaron dos cuentas reales simultáneas. |
| services/pdfGenerator.js:136; utils/publicFetch.js | Moderado: bloqueo de cola y acceso a URLs arbitrarias; Chromium cerraba al imprimir con single-process. | Cola simulada y PDF real generado/extraído: %PDF-, 34181 bytes y texto esperado. Restricciones IP y markup tienen pruebas. |
| services/fileExtractor.js:2 | Moderado: archivos binarios se trataban como texto. PDF/DOCX usan extracción limitada en worker. | PDF real probado. DOCX y documentos escaneados no verificados; OCR no implementado; otros binarios se rechazan con mensaje. |
| config/database.js:1; server.js:43 | Crítico/moderado: secreto de sesión débil, TLS sin verificar, subida de plan sin pago verificado. Se exige secreto de 32 caracteres, TLS verificado, OAuth state y se impide activar planes pagados sin integración de pago. | Conexión TLS real verificada. Revisión de código para OAuth, origen y planes; flujo de pago/OAuth no ejecutado. Se renovó solo SESSION_SECRET local: requiere volver a iniciar sesión local. |
| package.json; frontend-next/package.json; render.yaml | Crítico: dependencias vulnerables y versiones incompatibles. Frontend Next 16/React 19, Node >=22.13; Render configurado Node 24.19. | Compilación exitosa y npm audit informó cero vulnerabilidades en ambos paquetes tras instalar. ESLint: 0 errores, 20 advertencias. |

## Pendiente y limitaciones honestas

- No pude verificar esto automáticamente, necesito que lo pruebes y me confirmes el resultado: micrófono real, preguntar identidad, interrumpir mientras habla y recibir aviso/cierre en voz.
- Sin despliegue ni comprobación de Google OAuth, pagos, WhatsApp real o comportamiento completo en producción.
- Búsqueda real reciente sin resultados: no declarar resuelta la relevancia/calidad o disponibilidad de fuentes. Los fallbacks RSS pueden aportar titulares/extractos sin el artículo completo.
- Memoria: verificación de concurrencia simulada; recuperación tras caída y extracción/recuerdo entre dos sesiones reales pendientes.
- Los proyectos aún no tienen la protección de versiones de los chats: cambios simultáneos de nombres pueden sobrescribirse. Moderado, revisión de código.
- Historial local antiguo sin propietario se conserva en sus claves originales, pero no se importa automáticamente a una cuenta. Puede requerir recuperación explícita para un invitado previo. No se borraron esas claves.
- Al fallar sincronización se muestra error y se detienen envíos para proteger la nube. Requiere recargar; no hay interfaz de conciliación de conflictos.
- Persisten 20 advertencias ESLint. La regla de inicialización de estado en effects se configuró como advertencia visible; eso no significa que se hayan eliminado todas las causas.
- Código heredado sin referencias detectadas: db.js parsearClienteId; backend/webSearch.js detectarConsultaTipoCambio y obtenerHistoricoDivisas. Menor, búsqueda estática; no se eliminaron artefactos del usuario como patch.js y serpapi_balon.json.
- No se declara completada una auditoría exhaustiva de todos los endpoints/dependencias ni resueltos todos los riesgos de rendimiento. El sync todavía hace consultas por chat cambiado; se redujo el envío a los chats cambiados, no se eliminó todo N+1.

## Evidencia reproducible

- node --test tests/regression.test.js — 26 pruebas, 26 pass, 0 fail. Output completo: verification/regression.txt.
- node tests/browser-check.cjs — Chromium con servidor/API aislados. Output completo: verification/browser.txt.
- node tests/database-check.cjs — requiere DATABASE_URL; usa tablas temporales que desaparecen al cerrar conexión.
- npm --prefix frontend-next run build — exportación estática exitosa.
- npm --prefix frontend-next run lint — 0 errores, 20 advertencias.

Antes de desplegar: el entorno remoto necesita SESSION_SECRET de al menos 32 caracteres y las variables de proveedor existentes. DeepSeek permanece tal como estaba por instrucción del usuario.

## Incidente de sesiones — 28 septiembre 2026

Las capturas de chat y /auth/google mostraban el mismo timeout. Se verificó en registros y en connect-pg-simple 10 que una promesa rechazada de creación automática de tabla queda cacheada. PostgreSQL volvió a responder, pero el almacén seguía reutilizando ese fallo.

Se prepara la tabla e índice de sesiones antes de escuchar conexiones (services/sessionSchema.js, server.js), con reintentos limitados para errores transitorios, y se desactiva la creación diferida del almacén.

Verificación ejecutada: 40 tests pasaron (regresión, búsqueda y sesiones). La prueba real tests/session-live-check.cjs obtuvo OAuth HTTP 302 a accounts.google.com con state y cookie, lectura de sesión HTTP 200 y dos respuestas consecutivas HTTP 200 sin errores usando esa cookie. No se completó el inicio de sesión personal de Google automáticamente.

Limitación encontrada en esa misma ejecución: la respuesta a noticias de ayer en Nicaragua mezcló noticias del 27 y del 28 de septiembre. La precisión temporal de búsqueda sigue pendiente; el éxito de transporte no demuestra la exactitud de las noticias.
