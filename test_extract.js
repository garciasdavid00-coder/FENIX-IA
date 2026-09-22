require('dotenv').config();
const { extractMemoriesFromConversation } = require('./backend/memoryManager');
const db = require('./db');

async function test() {
  await new Promise(r => setTimeout(r, 1000));
  const userId = "109867010468962575239"; 
  const history = [
    { role: 'user', content: 'hola, mi nombre es david y trabajo como programador.' }
  ];
  try {
    const mems = await extractMemoriesFromConversation(userId, history);
    console.log("Extracted memories:", mems);
  } catch(e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
test();
