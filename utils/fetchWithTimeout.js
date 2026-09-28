// Timeout covers headers AND body; callers receive a buffered, size-limited Response.
async function fetchWithTimeout(url, options={}, timeoutMs=10000) {
 const signal=options.signal?AbortSignal.any([options.signal,AbortSignal.timeout(timeoutMs)]):AbortSignal.timeout(timeoutMs);
 const response=await fetch(url,{...options,signal});
 if(!response.body)return response;
 const reader=response.body.getReader();const chunks=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>5000000)throw Error('Respuesta externa demasiado grande');chunks.push(Buffer.from(value))}}
 finally{await reader.cancel().catch(()=>{});reader.releaseLock()}
 return new Response(Buffer.concat(chunks),{status:response.status,statusText:response.statusText,headers:response.headers});
}
module.exports={fetchWithTimeout};
