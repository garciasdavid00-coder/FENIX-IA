
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
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => {
        console.log('\n=== RESPONSE ===\n', out.slice(0, 2000));
        resolve();
      });
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  await makeRequest({
    mensaje: 'hola dime que paso ayer Nicaragua',
    historial: [],
    idioma: 'es',
    chatId: 'test-serpapi-news'
  });
}
run();

