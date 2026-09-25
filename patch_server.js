
const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

const regex = /\/\/ Memoria persistente del usuario\s+let bloqueMemorias = '';\s+if \(userId\) \{\s+try \{\s+sendStatus\(res, 'working', 'Consultando historial y memoria\.\.\.'\);\s+bloqueMemorias = await memory\.buildMemoryContext\(userId\);\s+\} catch \(e\) \{\s+console\.error\('Error cargando memorias del usuario:', e\.message\);\s+\}\s+\}/;

const replacement = \// Memoria persistente del usuario
      let bloqueMemorias = '';
      if (userId) {
        try {
          const necesita = await memory.evaluarNecesidadMemoria(mensaje, historial);
          if (necesita) {
            sendStatus(res, 'working', 'Leyendo memoria...');
            bloqueMemorias = await memory.buildMemoryContext(userId);
          } else {
            console.log('[Memoria] Consulta omitida (mensaje genérico)');
          }
        } catch (e) {
          console.error('Error evaluando/cargando memorias del usuario:', e.message);
        }
      }\;

const newContent = content.replace(regex, replacement);
if (newContent !== content) {
    fs.writeFileSync('server.js', newContent);
    console.log('Successfully patched server.js');
} else {
    console.log('Failed to patch server.js');
}

