
const http = require('http');

function makeRequest(bodyData) {
  return new Promise((resolve) => {
    const data = JSON.stringify(bodyData);
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': 'Bearer invitado' // not needed but ok
      }
    }, (res) => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => {
        resolve(out);
      });
    });
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- TEST 1: Genérico ---');
  const start1 = Date.now();
  const out1 = await makeRequest({ mensaje: 'cuál es la capital de Francia', historial: [], idioma: 'es', chatId: 'memtest-1' });
  const time1 = Date.now() - start1;
  console.log('TIEMPO:', time1, 'ms');
  console.log('Leyendo memoria?', out1.includes('Leyendo memoria...'));

  console.log('\n--- TEST 2: Directo ---');
  const start2 = Date.now();
  const out2 = await makeRequest({ mensaje: 'cómo me llamo', historial: [], idioma: 'es', chatId: 'memtest-1' });
  const time2 = Date.now() - start2;
  console.log('TIEMPO:', time2, 'ms');
  console.log('Leyendo memoria?', out2.includes('Leyendo memoria...'));

  console.log('\n--- TEST 3: Implícito ---');
  const start3 = Date.now();
  const out3 = await makeRequest({ mensaje: 'recomiéndame qué comer', historial: [], idioma: 'es', chatId: 'memtest-1' });
  const time3 = Date.now() - start3;
  console.log('TIEMPO:', time3, 'ms');
  console.log('Leyendo memoria?', out3.includes('Leyendo memoria...'));
}

runTests();

