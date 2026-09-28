
const assert=require('node:assert/strict');
const express=require('express');
const puppeteer=require('puppeteer');
(async()=>{
 const app=express();app.use(express.json());const calls=[];
 app.get('/api/usuario-actual',(_,res)=>res.json({autenticado:false}));
 app.post('/api/chat',(req,res)=>{calls.push(req.body);res.setHeader('Content-Type','text/event-stream');res.end('data: '+JSON.stringify({texto:'Respuesta verificada en navegador.'})+'\n\ndata: [DONE]\n\n')});
 app.use(express.static('frontend-next/out'));const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));let browser;
 try{
  browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle0'});
  await page.waitForSelector('textarea');await page.type('textarea',"<script>alert('test')</script>");await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.body.innerText.includes('Respuesta verificada en navegador.'));
  assert.equal(calls.length,1);assert.match(calls[0].chatId,/^\d+$/);assert.equal(calls[0].mensaje,"<script>alert('test')</script>");
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('fenix:chats:guest')||'[]').some(c=>c.mensajes.length===2));
  assert.deepEqual(errors,[]);console.log('PASS Browser: script input renders response, one request, stable chat ID, guest history persisted, no React runtime errors.');
 }finally{await browser?.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
