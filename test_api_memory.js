
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
  console.log('Enviando primer mensaje (fijando memoria)...');
  await makeRequest({ mensaje: 'Me llamo Roberto y trabajo como arquitecto de software.', historial: [], idioma: 'es', chatId: 'memoria-test-1' }, 'TEST 1: FIJAR MEMORIA');

  console.log('\nEsperando 12 segundos para que la extracción en background termine...');
  await new Promise(r => setTimeout(r, 12000));

  console.log('\nEnviando segundo mensaje (recuperando memoria en otro chat)...');
  await makeRequest({ mensaje: '¿Recuerdas cómo me llamo y a qué me dedico?', historial: [], idioma: 'es', chatId: 'memoria-test-2' }, 'TEST 2: RECUPERAR MEMORIA');
}
run();

