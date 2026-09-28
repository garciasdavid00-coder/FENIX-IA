// Run against the local server. Uses its own cookie; never reads a user's session.
const assert=require('node:assert/strict');
(async()=>{
 const base='http://localhost:3001';
 const auth=await fetch(base+'/auth/google',{redirect:'manual',signal:AbortSignal.timeout(20000)});
 const target=new URL(auth.headers.get('location')||base);
 const cookies=auth.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 console.log(JSON.stringify({oauthStatus:auth.status,destination:target.hostname,hasState:target.searchParams.has('state'),hasSessionCookie:!!cookies}));
 assert.equal(auth.status,302);assert.equal(target.hostname,'accounts.google.com');assert.ok(cookies);assert.ok(target.searchParams.has('state'));
 try{
  const user=await fetch(base+'/api/usuario-actual',{headers:{Cookie:cookies},signal:AbortSignal.timeout(20000)});
  console.log('Session read HTTP',user.status);assert.equal(user.status,200);
  for(const mensaje of ['Hola, ¿me escuchas?','DIME LAS NOTICIAS QUE PASARON EL DIA DE AYER EN NICARAGUA']){
   const response=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookies},body:JSON.stringify({mensaje,modelo:'auto',webSearch:'auto',chatId:String(Date.now()),timeZone:'America/Managua'}),signal:AbortSignal.timeout(90000)});
   const stream=await response.text();const events=stream.split('\n').filter(l=>l.startsWith('data: ')&&!l.includes('[DONE]')).map(l=>JSON.parse(l.slice(6)));
   const errors=events.filter(e=>e.error);const text=events.map(e=>e.texto||'').join('');
   console.log(JSON.stringify({message:mensaje,status:response.status,errors,text,sources:events.find(e=>e.tipo==='fuentes')?.fuentes?.length||0},null,2));
   assert.equal(response.status,200);assert.equal(errors.length,0);assert.ok(text.trim());assert.ok(!/Connection terminated/i.test(text));
  }
  console.log('PASS real local session: OAuth redirect with state, persisted cookie, session read and two consecutive chat responses. Google sign-in completion remains manual.');
 }finally{await fetch(base+'/api/logout',{method:'POST',headers:{Cookie:cookies},signal:AbortSignal.timeout(15000)}).catch(()=>{})}
})().catch(e=>{console.error(e.message);process.exitCode=1});
