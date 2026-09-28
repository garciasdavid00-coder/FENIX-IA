const {fetchWithTimeout:fetch}=require('../utils/fetchWithTimeout');
const {publicFetch}=require('../utils/publicFetch');
const {publicationDate,isFresh,articleText,searchPlan}=require('./searchPolicy');

function languageCode(lang){return ({'español':'es','inglés':'en','portugués':'pt','francés':'fr','alemán':'de','japonés':'ja','chino':'zh','árabe':'ar'})[lang] || (/^[a-z]{2}$/.test(lang)?lang:'es')}
function flattenResults(items){return (Array.isArray(items)?items:[]).flatMap(item=>[...(item.link?[item]:[]),...(item.highlight?[item.highlight]:[]),...flattenResults(item.stories||[])])}
function safeLink(link){try{const u=new URL(link);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null}catch{return null}}
function relevance(item,query){
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const text=normalize([item.title,item.snippet,item.content,item.link||item.url].join(' '));
 const ignore=new Set('noticia noticias news hoy ayer esta semana today yesterday que cual cuales como donde cuando sobre para por los las una uno del con busca buscar investiga ultimos ultima ultimas latest'.split(' '));
 const words=[...new Set(normalize(query).match(/[a-z]{3,}/g)||[])].filter(w=>!ignore.has(w));
 const countryWords=new Set('nicaragua mexico espana argentina colombia peru chile guatemala costa rica salvador estados unidos brasil'.split(' '));
 const topics=words.filter(w=>!countryWords.has(w));
 const matches=w=>text.includes(w)||(w==='tecnologia'&&/\bia\b|inteligencia artificial|robot|software|digital|informatica/.test(text));
 const countryAliases={nicaragua:/nicarag|\.ni\//,mexico:/mexic|\.mx\//,espana:/espan|\.es\//,argentina:/argentin|\.ar\//,colombia:/colombi|\.co\//,peru:/peru|\.pe\//,chile:/chilen|chile|\.cl\//,guatemala:/guatemal|\.gt\//,brasil:/brasil|brazil|\.br\//};
 const explicit=words.filter(w=>countryAliases[w]);
 if(explicit.length&&!explicit.some(w=>countryAliases[w].test(text)))return -1;
 if(topics.length && !topics.some(matches))return -1;
 let score=words.filter(matches).length;
 if(/youtube\.com|facebook\.com|instagram\.com|tiktok\.com/.test(item.link||item.url||'')&&!/youtube|facebook|instagram|tiktok/.test(normalize(query)))score-=2;
 return score;
}
function candidates(items,query,timeZone,now){
 const seen=new Set();
 return items.filter(item=>{
  const link=safeLink(item.link||item.url);if(!link||seen.has(link)||!isFresh(item,query,timeZone,now)||relevance(item,query)<0)return false;
  seen.add(link);return true;
 }).sort((a,b)=>relevance(b,query)-relevance(a,query)).slice(0,5);
}
async function fetchWebContent(url,title) {
 try {
  const result=await publicFetch(url,{timeoutMs:6000,maxBytes:2000000,signal:AbortSignal.timeout(8000)});
  if(!/text\/html|application\/xhtml\+xml/i.test(result.contentType))return '';
  return articleText(result.body.toString('utf8'),result.url,title);
 }catch{return ''}
}
async function buildSearchResult(items,{query,timeZone,now,provider,diagnostics}){
 const selected=candidates(items,query,timeZone,now);
 if(!selected.length)return null;
 const docs=await Promise.all(selected.map(async(item)=>{
  const url=safeLink(item.link||item.url);
  const article=(await fetchWebContent(url,item.title||'')).slice(0,3200);
  const snippet=String(item.snippet||item.content||'').slice(0,2000);
  const content=article.length>=120?'articulo':snippet?'extracto':'titular';
  const relative=!item.iso_date && /\d+\s*(minute|minuto|hour|hora|day|dia|día|week|semana)/i.test(String(item.date||''));
  return {title:String(item.title||url).slice(0,300),url,date:publicationDate(item,now)?.toISOString()||null,relative,originalDate:item.iso_date||item.published_date||item.publishedDate||item.date||null,content,text:content==='articulo'?article:snippet};
 }));
 const fuentes=docs.map(d=>({titulo:d.title,url:d.url,fecha:d.date,fechaAproximada:d.relative,fechaOriginal:d.originalDate,contenido:d.content}));
 const texto=docs.map((d,i)=>`${i+1}. ${d.title}\nURL: ${d.url}\nFecha de publicación ${d.relative?'aproximada':'reportada'}: ${d.date||'no disponible'} (dato del proveedor: ${d.originalDate||'no disponible'})\nEvidencia: ${d.content==='articulo'?'texto extraído del artículo':d.content==='extracto'?'solo extracto del buscador; artículo no leído':'solo titular; artículo no leído'}\n${d.text}`).join('\n\n');
 return {texto,fuentes,proveedor:provider,consultadoEn:new Date(now).toISOString(),diagnostico:diagnostics};
}
async function searchProviders({consulta,apiKey,lang='español',timeZone='America/Managua'}) {
 const query=String(consulta||'').trim();
 if(!query)return null;
 const now=Date.now(),plan=searchPlan(query,timeZone,now),language=languageCode(lang),diagnostics=[];
 const keySerpApi=apiKey||process.env.SERPAPI_API_KEY;
 const keyTavily=process.env.TAVILY_API_KEY,keySerper=process.env.SERPER_API_KEY;
 async function result(items,provider){return buildSearchResult(items,{query,timeZone,now,provider,diagnostics})}
 if(keySerpApi){
  const attempts=plan.news?[{engine:'google_news',q:plan.providerQuery},{engine:'google',tbm:'nws',q:plan.terms,...(plan.tbs?{tbs:plan.tbs}:{})}]:[{engine:'google',q:plan.terms,...(plan.tbs?{tbs:plan.tbs}:{})}];
  for(const params of attempts){
   const provider=params.engine+(params.tbm?':'+params.tbm:'');
   try{
    const url=new URL('https://serpapi.com/search.json');
    Object.entries({...params,hl:language,gl:plan.region,api_key:keySerpApi}).forEach(([key,value])=>url.searchParams.set(key,value));
    const response=await fetch(url),data=await response.json();
    if(!response.ok||data.error){diagnostics.push({provider,status:response.status,error:'provider_error'});if([401,403,429].includes(response.status))break;continue}
    const raw=plan.news?flattenResults(data.news_results):data.organic_results||[];
    diagnostics.push({provider,received:raw.length,accepted:candidates(raw,query,timeZone,now).length});
    const found=await result(raw,provider);if(found)return found;
   }catch(e){diagnostics.push({provider,error:e.name==='TimeoutError'?'timeout':'request_failed'})}
  }
 }
 if(keyTavily){
  try{
   const response=await fetch('https://api.tavily.com/search',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+keyTavily},body:JSON.stringify({query:plan.terms,topic:plan.news?'news':'general',search_depth:'basic',max_results:8,include_answer:false,include_published_date:true,...(plan.start?{start_date:plan.start,end_date:plan.end,filter_by_published_date:true}:{})})});
   const data=await response.json();
   if(response.ok){const found=await result(data.results||[],'tavily');if(found)return found}
   diagnostics.push({provider:'tavily',status:response.status});
  }catch{diagnostics.push({provider:'tavily',error:'request_failed'})}
 }
 if(keySerper){
  try{
   const response=await fetch('https://google.serper.dev/'+(plan.news?'news':'search'),{method:'POST',headers:{'X-API-KEY':keySerper,'Content-Type':'application/json'},body:JSON.stringify({q:plan.providerQuery,gl:plan.region,hl:language,num:8})});
   const data=await response.json();
   if(response.ok){const found=await result(data.news||data.organic||[],'serper');if(found)return found}
   diagnostics.push({provider:'serper',status:response.status});
  }catch{diagnostics.push({provider:'serper',error:'request_failed'})}
 }
 return {texto:plan.start?'No encontré fuentes con fecha verificable para el período solicitado. No puedo confirmar esas noticias o datos.':'No pude recuperar fuentes verificables para esta consulta. Intenta una pregunta más específica o vuelve a intentarlo.',fuentes:[],diagnostico:diagnostics};
}
module.exports={searchProviders,flattenResults,buildSearchResult,languageCode,relevance};
