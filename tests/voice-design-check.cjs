const express=require('express'),puppeteer=require('puppeteer'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const app=express();app.use(express.json());
 app.get('/api/usuario-actual',(_,r)=>r.json({autenticado:false}));
 app.post('/api/chat',(_,r)=>{r.setHeader('Content-Type','text/event-stream');setTimeout(()=>r.end('data: '+JSON.stringify({texto:'Soy Fenix. Podemos darle forma a esa idea, paso a paso.'})+'\n\ndata: [DONE]\n\n'),500)});
 app.use(express.static('frontend-next/out'));const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));let browser;
 try{
  browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.evaluateOnNewDocument(()=>{
   navigator.mediaDevices.getUserMedia=async()=>({getTracks:()=>[{stop(){}}]});
   window.SpeechRecognition=class{start(){window.__voiceRecognition=this;this.onstart?.()}abort(){this.onend?.()}};
   window.speechSynthesis.speak=utter=>{window.__voiceUtterance=utter};window.speechSynthesis.cancel=()=>{};
  });
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle0'});
  await page.click('.voice-call-btn');await page.waitForFunction(()=>document.querySelector('.voice-state')?.textContent.includes('Te estoy escuchando'));
  fs.mkdirSync('verification',{recursive:true});await (await page.$('[role=dialog]')).screenshot({path:'verification/voice-desktop.png'});
  assert.equal(await page.$eval('[role=dialog]',e=>e.contains(document.activeElement)),true);
  await page.click('[aria-label="Ocultar transcripción"]');assert.ok(await page.$('.voice-captions-off'));
  await page.click('[aria-label="Mostrar transcripción"]');
  await page.click('[aria-label="Pausar micrófono"]');await page.waitForSelector('[data-state="pausado"]');
  await page.click('[aria-label="Activar micrófono"]');await page.waitForFunction(()=>document.querySelector('.voice-state')?.textContent.includes('Te estoy escuchando'));
  await page.evaluate(()=>{const result=[{transcript:'Ayúdame a darle forma a una idea'}];result.isFinal=true;window.__voiceRecognition.onresult({results:[result]})});
  await page.waitForSelector('[data-state="hablando"]');await page.screenshot({path:'verification/voice-speaking.png'});
  await page.click('[aria-label="Interrumpir respuesta"]');await page.waitForSelector('[data-state="escuchando"]');
  await page.setViewport({width:390,height:844,deviceScaleFactor:1});await page.screenshot({path:'verification/voice-mobile.png'});
  const geometry=await page.$eval('[role=dialog]',e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,viewportWidth:innerWidth,viewportHeight:innerHeight}});
  assert.ok(geometry.left>=0&&geometry.right<=geometry.viewportWidth&&geometry.top>=0&&geometry.bottom<=geometry.viewportHeight);
  await page.keyboard.press('Escape');assert.equal(await page.$('[role=dialog]'),null);
  assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('voice-call-btn')),true);
  assert.deepEqual(errors,[]);
  console.log('PASS Voice UI: desktop/mobile fit, transcript toggle, microphone pause/resume, speaking/interruption, Escape, restored focus; no browser errors. Speech and API simulated.');
 }finally{await browser?.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
