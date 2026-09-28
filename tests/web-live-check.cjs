// Opt-in integration: real search and Groq, isolated authentication/database.
require('dotenv').config({quiet:true});
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'..'),req=createRequire(path.join(root,'server.js')),express=req('express');
(async()=>{
 const pass=()=>((_,__,next)=>next());
 const mocks={dotenv:{config(){}},pg:{Pool:class{on(){}}},'express-session':()=>((r,_,next)=>{r.session={};r.isAuthenticated=()=>false;next()}),'connect-pg-simple':()=>class{},passport:{initialize:pass,session:pass,serializeUser(){},deserializeUser(){}},'./db':{},'./backend/memoryManager':{},'./backend/moderationMiddleware':()=>async(_,__,next)=>next(),'./routes/whatsapp':express.Router(),'./routes/documentos':express.Router(),'./routes/imagenesReales':{router:express.Router()}};
 const c={module:{exports:{}},require:p=>Object.hasOwn(mocks,p)?mocks[p]:req(p),process:{env:{...process.env,GOOGLE_CLIENT_ID:'',GOOGLE_CLIENT_SECRET:'',DATABASE_URL:''},exit(){throw Error('unexpected exit')}},__dirname:root,console,setTimeout,clearTimeout,AbortController,AbortSignal,URL,Buffer,TextDecoder,fetch};
 vm.runInNewContext(fs.readFileSync(path.join(root,'server.js'),'utf8'),c);
 const server=c.module.exports.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{
  const r=await fetch('http://127.0.0.1:'+server.address().port+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(90000),body:JSON.stringify({mensaje:'Resume las noticias de Nicaragua hoy, con fecha y enlaces a las fuentes. Distingue artículos leídos de titulares.',webSearch:'on',modelo:'groq',chatId:'123',timeZone:'America/Managua'})});
  const raw=await r.text();const events=raw.split('\n').filter(l=>l.startsWith('data: ')&&!l.includes('[DONE]')).map(l=>JSON.parse(l.slice(6)));
  const sources=events.find(e=>e.tipo==='fuentes')?.fuentes||[];
  const text=events.map(e=>e.texto||'').join('');
  const evidence={status:r.status,errors:events.filter(e=>e.error),sources,text};
  fs.mkdirSync(path.join(root,'verification'),{recursive:true});fs.writeFileSync(path.join(root,'verification/web-live-chat.json'),JSON.stringify(evidence,null,2));
  console.log(JSON.stringify(evidence,null,2));
  assert.equal(r.status,200);assert.equal(evidence.errors.length,0);assert.ok(sources.length>0);assert.ok(sources.some(s=>s.contenido==='articulo'));assert.ok(text.length>100);assert.ok(sources.some(s=>text.includes(s.url)),'Response must cite a retrieved source');
  console.log('PASS real /api/chat search + Groq SSE: dated sources, downloaded article text and linked answer. Auth/DB isolated; no production writes.');
 }finally{await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e.message);process.exitCode=1});
