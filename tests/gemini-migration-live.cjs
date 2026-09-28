require('dotenv').config({quiet:true});
const assert=require('node:assert/strict'),{Client}=require('pg');
const {databaseOptions}=require('../config/database');
const original=global.fetch;
global.fetch=async(input,options)=>{
 const url=String(input);const r=await original(input,options);
 if(url.includes('generativelanguage.googleapis.com'))console.log(JSON.stringify({provider:'gemini',model:JSON.parse(options.body).model,status:r.status}));
 return r;
};
(async()=>{
 let failures=0;
  async function check(name,fn){if(process.env.TEST_ONLY&&process.env.TEST_ONLY!==name)return;console.log('\nTEST '+name);try{await fn();console.log('PASS '+name)}catch(e){failures++;console.log('FAIL '+name+': '+(e.message||e.status||e.name))}}
 const engine=require('../backend/chatEngine');
 await check('CHAT',async()=>{const r=await engine.solicitarTextoCompleto({mensaje:'Hola, ¿puedes ayudarme a organizar mi día?',historial:[],proveedor:'gemini',maxTokens:300,timeoutMs:30000});console.log(r.texto);assert.ok(r.texto.trim());assert.equal(r.proveedor,'gemini')});
 await check('CLASIFICADOR',async()=>{const {evaluarBusquedaAutomatica}=require('../backend/webSearch');for(const [message,want] of [['Quién ocupa la presidencia de Nicaragua',true],['Explícame qué es una fracción matemática',false]]){const r=await evaluarBusquedaAutomatica(message);console.log(JSON.stringify({message,...r}));assert.equal(r.via,'clasificador');assert.equal(r.buscar,want)}});
 await check('MEMORIA_SQL',async()=>{
  const url=new URL(process.env.DATABASE_URL);
  if(url.hostname.endsWith('.neon.tech'))url.hostname=url.hostname.replace('-pooler.','.');
  const client=new Client({...databaseOptions(url.toString()),connectionTimeoutMillis:30000,query_timeout:30000});await client.connect();console.log('PostgreSQL conectado para prueba temporal.');
  const dbPath=require.resolve('../db'),previous=require.cache[dbPath];
  const table='migration_memory_'+require('node:crypto').randomBytes(8).toString('hex');
  try{
   await client.query(`CREATE TEMP TABLE ${table} (id SERIAL PRIMARY KEY,user_id TEXT,memory_text TEXT,category TEXT,updated_at TIMESTAMPTZ DEFAULT now())`);
   const query=(sql,args)=>client.query(sql.replace(/\buser_memories\b/g,'pg_temp.'+table),args);
   const pool={query,connect:async()=>({query,release(){}})};
   require.cache[dbPath]={exports:{pool}};delete require.cache[require.resolve('../backend/memoryManager')];
   const memory=require('../backend/memoryManager');const saved=await memory.extractMemoriesFromConversation('migration-test',[{role:'user',content:'Me llamo Lucía. Soy arquitecta y prefiero respuestas breves.'}]);
   const read=await memory.getUserMemories('migration-test');console.log(JSON.stringify({saved,readBack:read},null,2));assert.ok(saved.length);assert.equal(read.length,saved.length);assert.match(read.map(x=>x.memory_text).join(' '),/Luc[ií]a|arquitecta|breves/i);
   console.log('Persistencia SQL real comprobada en tabla temporal; ninguna memoria de usuarios modificada.');
  }finally{if(previous)require.cache[dbPath]=previous;else delete require.cache[dbPath];await client.query('DROP TABLE IF EXISTS pg_temp.'+table).catch(e=>console.log('Limpieza temporal: '+e.message));await client.end()}
 });
 await check('MODERACION',async()=>{const {clasificarContexto}=require('../backend/moderationMiddleware');for(const [message,want] of [['eres un idiota inútil','AGGRESSIVE_INSULT'],['soy un idiota, me siento mal','SELF_DISTRESS']]){const result=await clasificarContexto(message,[]);console.log(JSON.stringify({message,result}));assert.equal(result,want)}});
 console.log('\nRESULT '+(failures?'FAIL '+failures:'PASS '+(process.env.TEST_ONLY||'4/4')));process.exitCode=failures?1:0;
 const db=require.cache[require.resolve('../db')]?.exports;if(db?.pool)await db.pool.end();
})().catch(e=>{console.error(e.message);process.exitCode=1});
