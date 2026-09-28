// Opt-in local diagnostic preload. Never records request headers/API keys.
require('dotenv').config({quiet:true});
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {flattenResults}=require('../backend/webSearchProviders');
const {temporalMetadata}=require('../backend/searchPolicy');
const dir=path.resolve('verification/dates/final');fs.mkdirSync(dir,{recursive:true});
const original=global.fetch;let sequence=0;
global.fetch=async function(input,options){
 const url=new URL(typeof input==='string'?input:input.url||String(input));
 const search=url.hostname==='serpapi.com';
 const model=/api\.deepseek\.com|generativelanguage\.googleapis\.com/.test(url.hostname);
 if(!search&&!model)return original(input,options);
 if(search)url.searchParams.set('no_cache','true');
 const n=++sequence,prefix=String(n).padStart(2,'0')+'-'+(search?'search':'model');
 const started=Date.now();
 if(model&&options?.body)fs.writeFileSync(path.join(dir,prefix+'-request.json'),options.body);
 const response=await original(search?url:input,options);
 const raw=Buffer.from(await response.clone().arrayBuffer());
 const secrets=Object.entries(process.env).filter(([k,v])=>/API_KEY|SECRET|TOKEN/.test(k)&&v.length>15).map(([,v])=>v);
 if(secrets.some(s=>raw.includes(Buffer.from(s))))throw Error('Response includes a secret: evidence not written');
 fs.writeFileSync(path.join(dir,prefix+'-raw.json'),raw);
 const meta={started:new Date(started).toISOString(),status:response.status,sha256:crypto.createHash('sha256').update(raw).digest('hex'),bytes:raw.length};
 if(search){
  url.searchParams.delete('api_key');meta.request=url.href;
  const data=JSON.parse(raw);meta.results=flattenResults(data.news_results||data.organic_results||[]).map(item=>({title:item.title,link:item.link,date:item.date,iso_date:item.iso_date,...temporalMetadata(item,'America/Managua',started)}));
 }
 fs.writeFileSync(path.join(dir,prefix+'-audit.json'),JSON.stringify(meta,null,2));
 return response;
};
