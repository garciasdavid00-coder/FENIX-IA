# Reglas para agentes de IA trabajando en este proyecto

## Verificación obligatoria
- NUNCA digas "arreglado", "corregido" o "listo" sin haber ejecutado el código y mostrado 
  el output real que lo confirma.
- Si haces un cambio, después debes: (1) ejecutar el código o los tests relacionados, 
  (2) pegar el output completo, (3) solo entonces concluir si funcionó o no.
- Si no puedes verificar algo tú mismo (por ejemplo, requiere interacción manual del usuario 
  en la interfaz), dilo explícitamente: "No pude verificar esto automáticamente, necesito 
  que lo pruebes y me confirmes el resultado."
- Nunca asumas que un modelo de IA, API o librería existe o se comporta de cierta forma sin 
  comprobarlo en el código real del proyecto o su documentación oficial.

## Reportes
- Los resúmenes de cambios deben ser cortos y honestos, no listas largas con muchos bugs 
  "resueltos" a la vez.
- Si algo quedó a medias o no se pudo confirmar, decirlo explícitamente en vez de reportarlo 
  como completado.

## Contexto del proyecto
- Backend: Express/Node.js + PostgreSQL (Neon)
- Frontend: Next.js (JavaScript, no TypeScript)
- Modelos vía modelRouter.js: Groq, Gemini, DeepSeek
- Antes de usar un modelo específico (ej: "llama-3.1-8b-instant"), confirma que existe en 
  la cuenta/tier actual revisando la documentación del proveedor o probándolo directamente.