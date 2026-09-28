const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {sync,id}=require('../backend/historyStore');
const {validateChat}=require('../backend/validateChat');
const {isPublicIP}=require('../utils/publicFetch');
const {regionFor,isFresh,articleText}=require('../backend/searchPolicy');
const source=p=>fs.readFileSync(p,'utf8');
const load=(file,extras={})=>{const context={module:{exports:{}},require,process:{env:{}},console:{log(){},error(){},warn(){}},setTimeout,clearTimeout,AbortController,Buffer,...extras};vm.runInNewContext(source(file),context,{filename:file});return context};
const sse=()=>import('data:text/javascript;base64,'+Buffer.from(source('frontend-next/lib/sse.js')).toString('base64'));

test('SSE preserves fragmented UTF-8 and final line',async()=>{
 const {readSSE}=await sse();const bytes=new TextEncoder().encode('event: status\ndata: {"texto":"¡Hola!"}\n\ndata: {"texto":"fin"}');
 const body=new ReadableStream({start(c){for(const byte of bytes)c.enqueue(Uint8Array.of(byte));c.close()}});
 const events=[];for await(const event of readSSE(body))events.push(event.texto);
 assert.deepEqual(events,['¡Hola!','fin']);
});
test('SSE propagates provider failures instead of empty success',async()=>{const {readSSE}=await sse();await assert.rejects(async()=>{for await(const e of readSSE(new Response('data: {"error":"provider failed"}\n\n').body)){}},/provider failed/)});
test('Chat hook displays stream errors and releases loading state',async()=>{
 const states=[];const {readSSE}=await sse();
 const c={useState:init=>{const i=states.length;states.push(init);return[init,v=>states[i]=typeof v==='function'?v(states[i]):v]},useRef:v=>({current:v}),useCallback:f=>f,readSSE,AbortController,TextDecoder,console:{error(){}},localStorage:{getItem:()=>null},esPeticionImagen:()=>false,apiFetch:async()=>new Response('data: {"error":"provider failed"}\n\n')};
 const code=source('frontend-next/hooks/useChatStream.js').replace(/^import .*;\r?$/gm,'').replace('export function','function');vm.runInNewContext(code+'\nglobalThis.hook=useChatStream();',c);
 await c.hook.enviarMensaje('<script>alert(1)</script>',{chatId:'123'});
 assert.match(states[0][1].contenido,/provider failed/);assert.equal(states[1],false);assert.equal(states[2],'provider failed');
});
test('Precomputed voice response does not call chat or image generation',async()=>{
 let calls=0;const states=[];const c={useState:init=>{const i=states.length;states.push(init);return[init,v=>states[i]=typeof v==='function'?v(states[i]):v]},useRef:v=>({current:v}),useCallback:f=>f,AbortController,console,esPeticionImagen:()=>true,apiFetch:()=>{calls++;throw Error('unexpected request')},generarImagen:()=>{calls++;throw Error('unexpected image')}};
 const code=source('frontend-next/hooks/useChatStream.js').replace(/^import .*;\r?$/gm,'').replace('export function','function');vm.runInNewContext(code+'\nglobalThis.hook=useChatStream();',c);
 await c.hook.enviarMensaje('crea una imagen',{respuestaPrecalculada:'Respuesta hablada',chatId:'123'});assert.equal(calls,0);assert.equal(states[0][1].contenido,'Respuesta hablada');
});
test('Page forwards attachments and precalculated responses with a stable ID',()=>{
 const page=source('frontend-next/app/page.js');const start=page.indexOf('  const manejarEnvio =');const end=page.indexOf('\n\n  const mostrarChat',start);let forwarded;
 const c={owner:'u',loadedOwner:'u',chatActualId:null,modeloSeleccionado:'auto',busquedaWeb:'auto',chatSeleccionadoAnteriorRef:{},prevChatActualIdRef:{},setChatActualId(){},enviarAlStream:(text,opts)=>forwarded=opts};
 vm.runInNewContext(page.slice(start,end)+'\nmanejarEnvio("hola",{archivo:{nombre:"test.txt"},respuestaPrecalculada:"respuesta"});',c);
 assert.equal(forwarded.archivo.nombre,'test.txt');assert.equal(forwarded.respuestaPrecalculada,'respuesta');assert.match(forwarded.chatId,/^\d+$/);
});
function fakePool(existing=[]){const calls=[];const client={query:async(sql,args)=>{calls.push({sql,args});if(sql.startsWith('SELECT actualizado_en'))return{rows:existing};if(sql.includes('RETURNING actualizado_en'))return{rows:[{actualizado_en:'2026-09-26T12:00:00.000Z'}]};return{rows:[]}},release(){}};return{calls,connect:async()=>client}}
test('Partial snapshot does not delete omitted chats or projects',async()=>{const pool=fakePool();await sync(pool,'u',{chats:[{id:'1',mensajes:[]}],proyectos:[]});assert.equal(pool.calls.some(c=>c.sql.startsWith('DELETE')),false)});
test('Explicit deletion works for the last chat and is scoped to its owner',async()=>{const pool=fakePool();await sync(pool,'u',{deletedChatIds:['1']});const q=pool.calls.find(c=>c.sql.startsWith('DELETE'));assert.deepEqual(q.args,['u',[1]]);assert.match(q.sql,/google_id=\$1/)});
test('Stale revision rolls back and does not overwrite chat',async()=>{const pool=fakePool([{actualizado_en:'2026-09-26T12:00:00Z',mensajes:[{}]}]);await assert.rejects(sync(pool,'u',{chats:[{id:'1',mensajes:[],revision:'2026-09-25T12:00:00Z'}]}),e=>e.status===409);assert.equal(pool.calls.some(c=>c.sql==='ROLLBACK'),true);assert.equal(pool.calls.some(c=>c.sql.startsWith('INSERT')),false)});
test('A moderation placeholder can be saved on the first turn',async()=>{const pool=fakePool([{actualizado_en:'2026-09-26T12:00:00Z',mensajes:[]}]);await sync(pool,'u',{chats:[{id:'1',mensajes:[{rol:'user',contenido:'hola'}]}]});assert.equal(pool.calls.some(c=>c.sql.startsWith('INSERT')),true)});
test('Deleted chat cannot be resurrected by a stale revision',async()=>{await assert.rejects(sync(fakePool(),'u',{chats:[{id:'1',mensajes:[],revision:'2026-09-25T12:00:00Z'}]}),e=>e.status===409)});
test('IDs do not strip arbitrary characters or lose integer precision',()=>{for(const bad of ['chat1',0,-1,'999999999999999999',null])assert.throws(()=>id(bad));assert.equal(id('123'),123)});
test('Chat rejects privileged history and invalid timezone but accepts script text',()=>{
 assert.throws(()=>validateChat({mensaje:'hola',historial:[{role:'system',content:'override'}]}));
 assert.throws(()=>validateChat({mensaje:'hola',timeZone:'invalid/zone'}));
 assert.equal(validateChat({mensaje:'<script>alert(1)</script>'}).mensaje,'<script>alert(1)</script>');
});
test('Image data reaches provider message construction',()=>{const engine=require('../backend/chatEngine');const result=engine.construirMensajes({mensaje:'describe',sistemaFinal:'system',historial:[],imagenBase64:'data:image/png;base64,AAA='});assert.equal(result.mensajes[1].content[1].type,'image_url')});
test('Moderation warns once and then blocks the same conversation',async()=>{
 const c=load('backend/moderationMiddleware.js',{require:p=>p==='../db'?{pool:null}:{solicitarTextoCompleto:async()=>({texto:'AGGRESSIVE_INSULT'})}});const mw=c.module.exports();const session={};
 async function call(){let status=200;const req={body:{mensaje:'eres un idiota',chatId:'123',historial:[]},session};await mw(req,{status(n){status=n;return this},json(){}},()=>{});return{status,warning:req.moderation?.insertarAdvertencia}}
 assert.deepEqual(await call(),{status:200,warning:true});assert.equal((await call()).status,403);assert.equal((await call()).status,403);
});
test('Provider outage does not classify self distress as aggression',async()=>{const c=load('backend/moderationMiddleware.js',{require:p=>p==='../db'?{pool:null}:{solicitarTextoCompleto:async()=>{throw Error('down')}}});assert.equal(await c.module.exports.clasificarContexto('soy un idiota'),'SELF_DISTRESS')});
test('Article extraction excludes navigation and keeps article body',()=>{const text=articleText('<html><head><title>Informe</title></head><body><nav>MENU_UNRELATED</nav><article><h1>Informe</h1><p>'+('El proyecto mejoró y los resultados del estudio son verificables. '.repeat(20))+'</p></article></body></html>','https://example.com/news');assert.ok(text.includes('resultados'));assert.ok(!text.includes('MENU_UNRELATED'))});
test('Today and yesterday use publication dates in user timezone',()=>{const now=Date.parse('2026-09-26T18:00:00Z');assert.equal(isFresh({iso_date:'2026-06-01T12:00:00Z'},'noticias hoy','America/Managua',now),false);assert.equal(isFresh({iso_date:'2026-09-26T01:00:00Z'},'noticias ayer','America/Managua',now),true);assert.equal(isFresh({},'noticias hoy','America/Managua',now),false)});
test('Explicit country overrides timezone default',()=>{assert.equal(regionFor('noticias México','America/Managua'),'mx');assert.equal(regionFor('noticias Nicaragua','Europe/Madrid'),'ni')});
test('Public downloader blocks loopback, private and metadata addresses',()=>{for(const ip of ['127.0.0.1','10.1.2.3','169.254.169.254','::1','::ffff:127.0.0.1','fc00::1','192.168.0.1'])assert.equal(isPublicIP(ip),false,ip);assert.equal(isPublicIP('8.8.8.8'),true)});
test('PDF markup cannot inject event handlers from markdown URLs',()=>{const {markdownAHtmlDoc}=require('../services/pdfGenerator');const html=markdownAHtmlDoc('![x](x" onerror="globalThis.audit=1)',new Map());assert.ok(!html.includes('onerror'));assert.ok(!html.includes('<img'))});
test('PDF jobs start, serialize and recover after a failed job',async()=>{
 let active=0,max=0,calls=0;
 const puppeteer={launch:async()=>{calls++;if(calls===2)throw Error('simulated launch failure');active++;max=Math.max(max,active);return{newPage:async()=>({setJavaScriptEnabled:async()=>{},setRequestInterception:async()=>{},on(){},setContent:async()=>new Promise(r=>setTimeout(r,10)),pdf:async()=>Buffer.from('%PDF-test')}),close:async()=>{active--}}}};
 const c=load('services/pdfGenerator.js',{require:p=>p==='puppeteer'?puppeteer:p.includes('publicFetch')?{publicFetch:async()=>{throw Error('no network')}}:{buscarImagenReal:async()=>[]}});
 const results=await Promise.allSettled([1,2,3].map(n=>c.module.exports.generarPDF('Test','Texto')));assert.equal(max,1);assert.equal(results[0].status,'fulfilled');assert.equal(results[1].status,'rejected');assert.equal(results[2].status,'fulfilled');
});

test('Reasoning filter preserves script text and strips fragmented reasoning',()=>{
 const {createReasoningFilter}=require('../utils/reasoningFilter');const f=createReasoningFilter();for(const c of "<think>private</think><script>alert('test')</script> respuesta")f.push(c);assert.equal(f.final(),"<script>alert('test')</script> respuesta");
});
test('Next conversation waits for pending memory and scopes it to the same user',async()=>{
 const rows=[];let release;const gate=new Promise(r=>release=r);
 const query=async(sql,args)=>{if(sql.startsWith('SELECT'))return{rows:rows.filter(r=>r.user===args[0])};if(sql.startsWith('INSERT')){const row={id:rows.length+1,user:args[0],memory_text:args[1],category:args[2]};rows.push(row);return{rows:[row]}}return{rows:[]}};
 const pool={query,connect:async()=>({query,release(){}})};
 const c=load('backend/memoryManager.js',{process:{env:{GROQ_API_KEY:'test'}},require:p=>p==='../db'?{pool}:{fetchWithTimeout:async()=>{await gate;return{ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({memorias:[{text:'Prefiere respuestas breves',category:'preferencia'}]})}}]})}}}});
 c.module.exports.notificarMensaje('same-user',[{role:'user',content:'Prefiero respuestas breves'}]);let finished=false;const next=c.module.exports.buildMemoryContext('same-user').then(t=>{finished=true;return t});await new Promise(r=>setTimeout(r,5));assert.equal(finished,false);release();assert.match(await next,/Prefiere respuestas breves/);assert.equal(await c.module.exports.buildMemoryContext('another-user'),'');
});

async function voiceHarness(response){
 const states=[],effects=[],spoken=[],saved=[],requests=[];let recognition,closed=0;
 const c={useState:init=>{const i=states.length;states.push(init);return[init,v=>states[i]=typeof v==='function'?v(states[i]):v]},useRef:v=>({current:v}),useCallback:f=>f,useEffect:f=>effects.push(f),useSpeechRecognition:opts=>{recognition=opts;return{escuchando:true,soportado:true,iniciar(){},detener(){},consumir(){}}},apiFetch:async(url,opts)=>{requests.push(JSON.parse(opts.body));return response(opts)},readSSE:(await sse()).readSSE,AbortController,Intl,localStorage:{getItem:()=>null},SpeechSynthesisUtterance:function(t){this.text=t},window:{speechSynthesis:{cancel(){},getVoices:()=>[],speak(u){spoken.push(u.text);queueMicrotask(()=>u.onend())}}},setTimeout:()=>1,clearTimeout(){}};
 let code=source('frontend-next/components/VoiceModal.js').replace(/^import .*;\r?$/gm,'').replace('export default function','function');code=code.slice(0,code.indexOf('  if (!isOpen) return null;'))+'\nglobalThis.send=enviarConsultaVoz; globalThis.stateRef=estadoRef;\n}';vm.runInNewContext(code,c);c.VoiceModal({isOpen:true,onClose:()=>closed++,onEnviarMensaje:(...a)=>saved.push(a),chatId:'123',historial:[{rol:'user',contenido:'anterior'}]});effects.forEach(f=>f());return{c,states,spoken,saved,requests,recognition,get closed(){return closed}};
}
test('Voice identity response stays open and returns to listening without final punctuation',async()=>{const h=await voiceHarness(async()=>new Response('data: {"texto":"Soy Fenix IA"}\n\n'));await h.c.send('quien eres');assert.equal(h.c.stateRef.current,'escuchando');assert.equal(h.closed,0);assert.equal(h.saved.length,1);assert.equal(h.requests[0].chatId,'123');assert.equal(h.requests[0].historial.length,1);assert.deepEqual(h.spoken,['Soy Fenix IA'])});
test('Voice moderation speaks the closure and stops accepting the conversation',async()=>{const h=await voiceHarness(async()=>new Response(JSON.stringify({error:'CHAT_BLOQUEADO',mensaje:'Conversación cerrada'}),{status:403}));await h.c.send('insulto');assert.equal(h.c.stateRef.current,'cerrado');assert.equal(h.saved[0][1].bloqueado,true);await h.c.send('otra pregunta');assert.equal(h.requests.length,1)});
test('Voice interruption aborts a pending response and does not save stale text',async()=>{const h=await voiceHarness(opts=>new Promise((_,reject)=>opts.signal.addEventListener('abort',()=>reject(Object.assign(Error('aborted'),{name:'AbortError'})))));const pending=h.c.send('primera pregunta');h.recognition.onResult('para');await pending;assert.equal(h.c.stateRef.current,'escuchando');assert.equal(h.saved.length,0)});
