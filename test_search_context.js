
const http = require('http');

function makeRequest(bodyData, testName) {
  return new Promise((resolve) => {
    const data = JSON.stringify(bodyData);
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => {
        console.log('\n=== ' + testName + ' ===');
        console.log('STATUS:', res.statusCode);
        console.log('RESPONSE:', out.slice(0, 1500));
        resolve();
      });
    });
    req.on('error', e => {
      console.error('Error in ' + testName + ':', e);
      resolve();
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  const historialContexto = [
    { role: 'user', content: 'Hola, estaba pensando en viajar a Nicaragua pronto.' },
    { role: 'assistant', content: '¡Qué bueno! Nicaragua es un país hermoso. ¿En qué te puedo ayudar?' }
  ];
  
  await makeRequest({
    mensaje: 'me puedes decir las noticias del dia de ayer',
    historial: historialContexto,
    idioma: 'es',
    chatId: 'test-contexto'
  }, 'TEST BÚSQUEDA WEB CONTEXTUAL');
}
run();

