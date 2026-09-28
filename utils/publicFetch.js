const https=require('node:https');
const dns=require('node:dns').promises;
const net=require('node:net');
const blocked=new net.BlockList();
for(const [ip,prefix] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',3]])blocked.addSubnet(ip,prefix);
function isPublicIP(ip){
 const family=net.isIP(ip);
 if(family===4)return !blocked.check(ip,'ipv4');
 return family===6 && /^[23][0-9a-f]{3}:/i.test(ip) && !/^2001:(db8|0):/i.test(ip);
}
async function publicFetch(input,{maxBytes=2000000,timeoutMs=8000,redirects=3,signal}={}){
 const url=new URL(input);
 if(url.protocol!=='https:' || url.username || url.password || (url.port && url.port!=='443'))throw Error('URL no permitida');
 let dnsTimer;
 const addresses=await Promise.race([dns.lookup(url.hostname,{all:true}),new Promise((_,reject)=>{dnsTimer=setTimeout(()=>reject(Error('Timeout resolviendo DNS')),timeoutMs)})]).finally(()=>clearTimeout(dnsTimer));
 if(!addresses.length || addresses.some(a=>!isPublicIP(a.address)))throw Error('Destino de red no permitido');
 const address=addresses[0];
 return new Promise((resolve,reject)=>{
  const req=https.get(url,{signal,headers:{'User-Agent':'FenixIA/1.0','Accept':'text/html,image/*;q=0.8'},lookup:(_host,opts,cb)=>opts.all?cb(null,[address]):cb(null,address.address,address.family)},res=>{
   if(res.statusCode>=300 && res.statusCode<400 && res.headers.location){res.resume();clearTimeout(timer);if(!redirects)return reject(Error('Demasiadas redirecciones'));return publicFetch(new URL(res.headers.location,url),{maxBytes,timeoutMs,redirects:redirects-1,signal}).then(resolve,reject)}
   if(res.statusCode!==200){res.resume();clearTimeout(timer);return reject(Error('HTTP '+res.statusCode))}
   let size=0;const chunks=[];
   res.on('data',chunk=>{size+=chunk.length;if(size>maxBytes)req.destroy(Error('Respuesta demasiado grande'));else chunks.push(chunk)});
   res.on('error',reject);res.on('end',()=>{clearTimeout(timer);resolve({body:Buffer.concat(chunks),contentType:String(res.headers['content-type']||''),url:url.href})});
  });
  const timer=setTimeout(()=>req.destroy(Error('Timeout descargando contenido')),timeoutMs);
  req.on('error',e=>{clearTimeout(timer);reject(e)});
 });
}
module.exports={publicFetch,isPublicIP};
