const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const query='noticias de Nicaragua hoy';
 const response=await fetch('http://localhost:3001/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mensaje:query,webSearch:'auto',modelo:'auto',chatId:String(Date.now()),timeZone:'America/Managua'}),signal:AbortSignal.timeout(120000)});
 const raw=await response.text();fs.writeFileSync('verification/dates/final/chat.sse',raw);
 const events=raw.split('\n').filter(s=>s.startsWith('data: ')&&!s.includes('[DONE]')).map(s=>JSON.parse(s.slice(6)));
 const result={query,status:response.status,errors:events.filter(e=>e.error),sources:events.find(e=>e.tipo==='fuentes')?.fuentes||[],answer:events.map(e=>e.texto||'').join('')};
 fs.writeFileSync('verification/dates/final/chat-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 assert.equal(response.status,200);assert.equal(result.errors.length,0);assert.ok(result.answer);
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Managua',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 for(const s of result.sources){assert.equal(s.fechaLocal,today);assert.equal(s.no_reciente,false);assert.equal(s.fecha_evento_verificada,false);}
 if(result.sources.length)assert.match(result.answer,/no confirma que los hechos ocurrieran ese día/);
 console.log('PASS real chat: publication dates match local today; event dates are explicitly unverified. Full raw API and model payloads saved by diagnostic preload.');
})().catch(e=>{console.error(e.message);process.exitCode=1});
