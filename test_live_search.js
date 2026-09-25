
const http = require('http');
const data = JSON.stringify({
  mensaje: 'dime las noticias de hoy en Nicaragua',
  historial: [],
  idioma: 'es',
  chatId: 'test-live-2'
});

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
    require('fs').writeFileSync('full_out.txt', out);
    console.log('Done writing full_out.txt');
  });
});
req.write(data);
req.end();

