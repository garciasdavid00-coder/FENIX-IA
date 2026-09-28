const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {createRequire}=require('node:module');
const {searchPlan,isFresh,articleText}=require('../backend/searchPolicy');
const {flattenResults,relevance}=require('../backend/webSearchProviders');
const {extraerQueryBusqueda}=require('../backend/webSearch');
const now=Date.parse('2026-09-27T02:00:00Z');
function providers(fetch,download=async()=>{throw Error('unavailable')}){
 const c={module:{exports:{}},require:p=>p.includes('fetchWithTimeout')?{fetchWithTimeout:fetch}:p.includes('publicFetch')?{publicFetch:download}:require('../backend/searchPolicy'),process:{env:{SERPAPI_API_KEY:'fake-key'}},URL,AbortSignal,Date,console};
 vm.runInNewContext(fs.readFileSync('backend/webSearchProviders.js','utf8'),c);return c.module.exports;
}
test('Today sends a real date constraint in Managua even after UTC midnight',()=>{
 const p=searchPlan('noticias Nicaragua hoy','America/Managua',now);
 assert.equal(p.start,'2026-09-26');assert.equal(p.terms,'Nicaragua');assert.equal(p.region,'ni');
 assert.equal(p.providerQuery,'Nicaragua after:2026-09-25 before:2026-09-27');assert.equal(p.tbs,'cdr:1,cd_min:9/26/2026,cd_max:9/26/2026');
});
test('Yesterday and week use calendar dates; price today is not a news query',()=>{
 assert.equal(searchPlan('noticias ayer','America/Managua',now).start,'2026-09-25');
 assert.equal(searchPlan('noticias esta semana','America/Managua',now).start,'2026-09-20');
 assert.equal(searchPlan('precio dólar hoy','America/Managua',now).news,false);
 assert.equal(isFresh({date:'2026-09-26'},'hoy','America/Managua',now),true);
 assert.equal(isFresh({date:'2026-09-25'},'hoy','America/Managua',now),false);
 assert.equal(isFresh({},'hoy','America/Managua',now),false);
});
test('Query cleanup preserves El Salvador and country overrides the local default',()=>{
 assert.equal(extraerQueryBusqueda('busca noticias de El Salvador hoy'),'noticias de El Salvador hoy');
 assert.equal(searchPlan('noticias de El Salvador hoy','America/Managua',now).region,'sv');
 assert.equal(searchPlan('noticias México tecnología hoy','America/Managua',now).region,'mx');
 assert.equal(extraerQueryBusqueda('Resume las noticias de Nicaragua hoy, con fecha y enlaces a las fuentes. Distingue artículos leídos de titulares.'),'noticias de Nicaragua hoy');
});
test('Nested news includes highlight and stories without losing direct results',()=>{
 const rows=flattenResults([{highlight:{link:'https://a.test'},stories:[{link:'https://b.test'}]},{link:'https://c.test'}]);
 assert.deepEqual(rows.map(x=>x.link),['https://a.test','https://b.test','https://c.test']);
});
test('Country and topic reject unrelated search results',()=>{
 assert.equal(relevance({title:'Argentina avances en tecnología',link:'https://example.com/ar'},'noticias México tecnología hoy'),-1);
 assert.equal(relevance({title:'México turismo en la Zona Rosa',link:'https://example.com/mexico'},'noticias México tecnología hoy'),-1);
 assert.ok(relevance({title:'Empresas mexicanas adoptan inteligencia artificial',link:'https://example.com/mexico'},'noticias México tecnología hoy')>=0);
});
test('Article extraction rejects video recommendations unrelated to the headline',()=>{
 const html='<article><p>'+('Noticias ajenas de inmigración y videos para ver a continuación 00:30 '.repeat(12))+'</p></article>';
 assert.equal(articleText(html,'https://example.com','Nicaragua presenta su posición ante la ONU'),'');
});
test('Provider retries dated news search and distinguishes downloaded article from title only',async()=>{
 const urls=[];const date=new Date().toISOString();
 const p=providers(async url=>{urls.push(new URL(url));return {ok:true,status:200,json:async()=>urls.length===1?{news_results:[]}:{news_results:[{title:'Nicaragua ciencia estudio',link:'https://example.com/article',iso_date:date},{title:'Nicaragua segunda noticia',link:'https://example.com/blocked',iso_date:date}]}}},async url=>{
  if(url.endsWith('blocked'))throw Error('403');return {contentType:'text/html',url,body:Buffer.from('<article><p>'+('Nicaragua ciencia estudio publicado con resultados comprobados. '.repeat(20))+'</p></article>')};
 });
 const r=await p.searchProviders({consulta:'noticias Nicaragua hoy',timeZone:'America/Managua'});
 assert.equal(urls.length,2);assert.equal(urls[0].searchParams.get('engine'),'google_news');assert.equal(urls[1].searchParams.get('tbm'),'nws');assert.ok(urls[1].searchParams.get('tbs'));
 assert.equal(r.fuentes[0].contenido,'articulo');assert.equal(r.fuentes.length,1);assert.ok(!r.texto.includes('segunda noticia'));assert.match(r.texto,/URL: https:\/\/example.com\/article/);
});
test('Old and undated sources are not passed as fresh facts',async()=>{
 const p=providers(async()=>({ok:true,status:200,json:async()=>({news_results:[{title:'Nicaragua antigua',link:'https://example.com/old',iso_date:'2020-01-01T12:00:00Z'},{title:'Nicaragua sin fecha',link:'https://example.com/unknown'}]})}));
 const r=await p.searchProviders({consulta:'noticias Nicaragua hoy'});assert.equal(r.fuentes.length,0);assert.match(r.texto,/No encontré fuentes con fecha verificable/);
});
test('Relative provider dates are labeled approximate rather than exact publication timestamps',async()=>{
 const p=providers(async()=>({ok:true,status:200,json:async()=>({news_results:[{title:'Nicaragua noticia',link:'https://example.com/news',date:'hace 1 horas',snippet:'Extracto verificable'}]})}));
 const r=await p.searchProviders({consulta:'noticias Nicaragua'});assert.equal(r.fuentes[0].fechaAproximada,true);assert.match(r.texto,/publicación aproximada/);
});

test('Actual chat endpoint returns an honest empty-search response without calling a model',async()=>{
 const root=path.resolve('.'),req=createRequire(path.join(root,'server.js')),express=req('express');let modelCalls=0;
 const pass=()=>((_,__,next)=>next());
 const passport={initialize:pass,session:pass,serializeUser(){},deserializeUser(){}};
 const mocks={dotenv:{config(){}},pg:{Pool:class{on(){}}},'express-session':()=>((r,_,next)=>{r.session={};r.isAuthenticated=()=>false;next()}),'connect-pg-simple':()=>class{},passport,'./db':{},'./backend/memoryManager':{},'./backend/moderationMiddleware':()=>async(_,__,next)=>next(),'./routes/whatsapp':express.Router(),'./routes/documentos':express.Router(),'./routes/imagenesReales':{router:express.Router()},'./backend/webSearch':{extraerQueryBusqueda:s=>s,obtenerDeCache:()=>null,buscarEnWeb:async()=>({fuentes:[],texto:'No encontré fuentes con fecha verificable para el período solicitado.'})}};
 const c={module:{exports:{}},require:p=>Object.hasOwn(mocks,p)?mocks[p]:req(p),process:{env:{SESSION_SECRET:'a'.repeat(48),GEMINI_API_KEY:'test'},exit(){throw Error('unexpected exit')}},__dirname:root,console:{log(){},warn(){},error(){}},setTimeout,clearTimeout,AbortController,URL,Buffer,fetch:()=>{modelCalls++;throw Error('model must not be called')}};
 vm.runInNewContext(fs.readFileSync('server.js','utf8'),c);
 const server=c.module.exports.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const r=await fetch('http://127.0.0.1:'+server.address().port+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mensaje:'noticias Nicaragua hoy',webSearch:'on',chatId:'123'})});const body=await r.text();assert.equal(r.status,200);assert.match(body,/No encontré fuentes con fecha verificable/);assert.match(body,/\[DONE\]/);assert.equal(modelCalls,0)}finally{await new Promise(r=>server.close(r))}
});

test('Conversational news request preserves only subject and exact yesterday range',()=>{
 const q='DIME LAS NOTICIAS QUE PASARON EL DIA DE AYER EN NICARAGUA';
 const p=searchPlan(q,'America/Managua',Date.parse('2026-09-28T18:00:00Z'));
 assert.equal(p.terms,'NICARAGUA');assert.equal(p.start,'2026-09-27');assert.equal(p.end,p.start);
 assert.ok(relevance({title:'Nicaragua: novedades políticas',link:'https://example.com/nicaragua'},q)>=0);
});
test('Spam and duplicate titles are excluded before downloading',()=>{
 const {candidates}=require('../backend/webSearchProviders');
 const rows=[{title:'Nicaragua: novedades políticas',link:'https://a.test/a'},{title:'Nicaragua: novedades políticas',link:'https://b.test/b'},{title:'HERE\'S Live TV Coverage Nicaragua',link:'https://c.test/a'},{title:'Nicaragua directo',link:'https://d.test/?xml=data:video/mp4;base64,AA'}];
 assert.equal(candidates(rows,'noticias Nicaragua','America/Managua',Date.now()).length,1);
});
test('UTC next-day timestamp is presented with correct local publication day',async()=>{
 const p=providers(async()=>{});
 const r=await p.buildSearchResult([{title:'Nicaragua política',link:'https://example.com/a',iso_date:'2026-09-28T02:47:00Z'}],{query:'noticias ayer Nicaragua',timeZone:'America/Managua',now:Date.parse('2026-09-28T18:00:00Z'),provider:'test',diagnostics:[]});
 assert.equal(r.fuentes[0].fechaLocal,'2026-09-27');assert.equal(r.soloTitulares,true);
 assert.match(r.texto,/LOCAL \(America\/Managua\): 2026-09-27/);assert.equal(r.documentos[0].fecha_local,'2026-09-27');assert.equal(r.documentos[0].fecha_evento_verificada,false);
});
test('Title-only first search triggers alternative search before giving up',async()=>{
 let calls=0;
 const p=providers(async()=>{calls++;return {ok:true,status:200,json:async()=>({news_results:[{title:'Nicaragua política nacional',link:'https://example.com/'+calls,snippet:calls===2?'Texto del buscador sobre política nacional.':undefined}]})}});
 const r=await p.searchProviders({consulta:'noticias Nicaragua'});
 assert.equal(calls,2);assert.equal(r.fuentes[0].contenido,'extracto');assert.equal(r.soloTitulares,false);
});
test('Only headlines produce a limited source list without inferred details',()=>{
 const {respuestaSoloTitulares}=require('../backend/webSearch');
 const text=respuestaSoloTitulares({fuentes:[{titulo:'Nicaragua celebra reunión',url:'https://example.com/a',fechaLocal:'2026-09-27'}]});
 assert.match(text,/no pude leer los artículos completos/);assert.match(text,/2026-09-27/);assert.match(text,/https:\/\/example.com\/a/);
});
test('Relative provider times cannot override conflicting URL or headline dates',()=>{
 const clock=Date.parse('2026-09-28T22:00:00Z');
 assert.equal(isFresh({date:'hace 18 horas',link:'https://example.com/2026/09/28/news'},'noticias ayer','America/Managua',clock),false);
 assert.equal(isFresh({date:'hace 18 horas',title:'Clima para este lunes 28 septiembre de 2026'},'noticias ayer','America/Managua',clock),false);
});
test('Broad news selection does not fill every slot with sports',()=>{
 const {candidates}=require('../backend/webSearchProviders');
 const rows=Array.from({length:6},(_,i)=>({title:'Nicaragua vs rival '+i,link:'https://sports'+i+'.test/a'}));
 rows.push({title:'Nicaragua: reunión diplomática',link:'https://politics.test/a'});
 const found=candidates(rows,'noticias Nicaragua','America/Managua',Date.now());
 assert.equal(found.length,3);assert.ok(found.some(r=>r.link.includes('politics')));
 assert.equal(candidates(rows,'noticias fútbol Nicaragua','America/Managua',Date.now()).length,0); // no supplied title matches the explicitly requested football topic
});
