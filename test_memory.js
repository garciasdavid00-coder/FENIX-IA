require('dotenv').config();
const { addMemory, getUserMemories } = require('./backend/memoryManager');
const db = require('./db');
console.log("DB pool is:", !!db.pool);
async function test() {
  await new Promise(r => setTimeout(r, 1000));
  try {
    const userId = "109867010468962575239"; // An example google_id
    const res = await addMemory(userId, "Me gusta el color azul", "personal");
    console.log("Add Result:", res);
    const mems = await getUserMemories(userId);
    console.log("Memories:", mems);
  } catch(e) { console.error("Caught error:", e); }
  process.exit(0);
}
test();
