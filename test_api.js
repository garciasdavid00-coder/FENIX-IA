
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
        'Content-Length': data.length
      }
    }, (res) => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => {
        console.log('\n=== ' + testName + ' ===');
        console.log('STATUS:', res.statusCode);
        console.log('RESPONSE:', out.slice(0, 2000));
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
  await makeRequest({ mensaje: 'eres una mierda y un idiota, no sirves', historial: [], idioma: 'es', chatId: 'test-123' }, 'TEST 1: INSULT');
  await makeRequest({ mensaje: 'cuales son las noticias de hoy en nicaragua', historial: [], idioma: 'es', chatId: 'test-124' }, 'TEST 2: SEARCH');
}
run();

