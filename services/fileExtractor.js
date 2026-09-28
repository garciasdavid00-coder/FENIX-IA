const {Worker,isMainThread,parentPort,workerData}=require('node:worker_threads');
async function extract(buffer,extension){
 if(extension==='docx'){const result=await require('mammoth').extractRawText({buffer});return result.value.slice(0,60000)}
 if(extension==='pdf'){
  const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
  const task=getDocument({data:new Uint8Array(buffer),isEvalSupported:false,useSystemFonts:true});
  const doc=await task.promise;let text='';
  try {for(let n=1;n<=Math.min(doc.numPages,50)&&text.length<60000;n++){const page=await doc.getPage(n);const content=await page.getTextContent();text+=content.items.map(i=>i.str||'').join(' ')+'\n';page.cleanup()}return text.slice(0,60000)}finally{await task.destroy()}
 }
 throw Error('Formato no compatible. Usa PDF, DOCX o texto.');
}
function extractFile(buffer,extension){
 return new Promise((resolve,reject)=>{
  const worker=new Worker(__filename,{workerData:{buffer,extension},resourceLimits:{maxOldGenerationSizeMb:128}});
  const timer=setTimeout(()=>{worker.terminate();reject(Error('El documento tardó demasiado en procesarse.'))},15000);
  worker.once('message',msg=>{clearTimeout(timer);worker.terminate();msg.error?reject(Error(msg.error)):resolve(msg.text)});
  worker.once('error',e=>{clearTimeout(timer);reject(e)});
  worker.once('exit',code=>{clearTimeout(timer);if(code!==0)reject(Error('No se pudo procesar el documento.'))});
 });
}
if(!isMainThread)extract(Buffer.from(workerData.buffer),workerData.extension).then(text=>parentPort.postMessage({text}),()=>parentPort.postMessage({error:'No se pudo leer el documento. Verifica que no esté dañado o protegido.'}));
module.exports={extractFile};
