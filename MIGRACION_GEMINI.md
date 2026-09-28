# Migración de proveedor — 28 septiembre 2026

Groq se retiró del código activo, selectores, router, llamadas de clasificación/reescritura, memoria, moderación y configuración de arranque/Render. El proveedor sustituto es Gemini, modelo gemini-3.5-flash-lite. Se retiraron las variables antiguas de .env y se configuró GEMINI_MODEL. No se registraron claves en la evidencia. Las menciones históricas en informes/logs no representan llamadas activas.

Código anterior conservado fuera del proyecto en C:/Users/garci/AppData/Local/Temp/fenix-provider-backup-1790639028088. No contiene una copia de .env.

Verificación real:
- Chat, clasificador y moderación: verification/gemini-migration-live.txt. Ese registro también conserva el fallo inicial de memoria por timeout.
- Memoria, repetición exitosa: verification/gemini-memory-live.txt. Gemini extrajo tres hechos y el código de persistencia los insertó y leyó en PostgreSQL real, usando tabla temporal única y conexión directa a Neon. La prueba no demuestra que hayan desaparecido los timeouts intermitentes del pooler usado por la app.
- Endpoint local /api/chat después del reinicio: verification/gemini-chat-http.json, HTTP 200 y sin errores.
- 55 tests de regresión aprobados. Compilación frontend completada.
- Escaneo de 76 archivos activos/configuración: cero referencias a Groq, Qwen o modelos GPT-OSS.

Cambios locales: no se ejecutó commit, push ni despliegue en esta migración.
