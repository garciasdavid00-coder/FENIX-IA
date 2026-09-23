
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
  await makeRequest({ mensaje: 'dame las noticias de hoy en nicaragua', historial: [], idioma: 'es', chatId: 'test-news' }, 'TEST 2: NOTICIAS FECHAS');
  await makeRequest({ mensaje: '<script>alert(\'test\')</script>', historial: [], idioma: 'es', chatId: 'test-html' }, 'TEST 3: HTML SCRIPT');
  await makeRequest({ mensaje: 'eres un idiota y no sirves para nada', historial: [], idioma: 'es', chatId: 'test-voz', canal: 'voz' }, 'TEST 5: MODERACION VOZ');
}
run();

