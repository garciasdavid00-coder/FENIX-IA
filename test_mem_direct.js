
require('dotenv').config();
const memory = require('./backend/memoryManager');

async function test() {
  console.log('--- TEST 1: Genérico ---');
  let m1 = 'cuál es la capital de Francia';
  let t1 = Date.now();
  let r1 = await memory.evaluarNecesidadMemoria(m1, []);
  console.log('Mensaje:', m1);
  console.log('Necesita memoria?', r1);
  console.log('Tiempo:', Date.now() - t1, 'ms');

  console.log('\n--- TEST 2: Directo ---');
  let m2 = 'cómo me llamo';
  let t2 = Date.now();
  let r2 = await memory.evaluarNecesidadMemoria(m2, []);
  console.log('Mensaje:', m2);
  console.log('Necesita memoria?', r2);
  console.log('Tiempo:', Date.now() - t2, 'ms');

  console.log('\n--- TEST 3: Implícito ---');
  let m3 = 'recomiéndame qué comer';
  let t3 = Date.now();
  let r3 = await memory.evaluarNecesidadMemoria(m3, []);
  console.log('Mensaje:', m3);
  console.log('Necesita memoria?', r3);
  console.log('Tiempo:', Date.now() - t3, 'ms');
}

test();

