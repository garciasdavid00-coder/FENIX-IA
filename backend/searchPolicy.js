const {JSDOM}=require('jsdom');
const {Readability}=require('@mozilla/readability');
function dayInZone(now,timeZone){return new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now))}
function shiftDay(day,days){return new Date(Date.parse(day+'T12:00:00Z')+days*86400000).toISOString().slice(0,10)}
function searchPlan(query,timeZone='America/Managua',now=Date.now()){
 const q=String(query).trim();
 const today=dayInZone(now,timeZone);
 let start=null,end=null;
 if(/\b(ayer|yesterday)\b/i.test(q))start=end=shiftDay(today,-1);
 else if(/\b(hoy|today)\b/i.test(q))start=end=today;
 else if(/\b(esta semana|this week|[uú]ltimos 7 d[ií]as)\b/i.test(q)){start=shiftDay(today,-6);end=today}
 const news=/\b(noticias?|news|actualidad|titulares)\b/i.test(q);
 // Relative words are date constraints, not keywords. Preserve names such as El Salvador.
 let terms=q.replace(/\b(hoy|today|ayer|yesterday|esta semana|this week|[uú]ltimos 7 d[ií]as)\b/gi,'').trim();
 if(news)terms=terms.replace(/\b(noticias?|news|titulares)\b/gi,'').replace(/^\s*(de|sobre|en|from|about)\s+/i,'').trim();
 if(!terms)terms=regionFor(q,timeZone)==='ni'?'Nicaragua':q;
 const dated=start?`${terms} after:${shiftDay(start,-1)} before:${shiftDay(end,1)}`:terms;
 const american=d=>{const [y,m,day]=d.split('-');return `${Number(m)}/${Number(day)}/${y}`};
 return {query:q,terms,providerQuery:dated,news,start,end,region:regionFor(q,timeZone),tbs:start?`cdr:1,cd_min:${american(start)},cd_max:${american(end)}`:null};
}
function regionFor(query,timeZone='America/Managua'){
 const q=query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const countries={nicaragua:'ni',mexico:'mx',espana:'es',argentina:'ar',colombia:'co',peru:'pe',chile:'cl',guatemala:'gt','costa rica':'cr','el salvador':'sv','estados unidos':'us',brasil:'br'};
 for(const [name,code] of Object.entries(countries))if(q.includes(name))return code;
 const zones={'America/Managua':'ni','America/Mexico_City':'mx','Europe/Madrid':'es','America/Bogota':'co','America/Lima':'pe','America/Argentina/Buenos_Aires':'ar'};
 return zones[timeZone] || process.env.SEARCH_COUNTRY || 'ni';
}
function publicationDate(item,now=Date.now()){
 const value=item.iso_date || item.published_date || item.publishedDate || item.date;
 if(!value)return null;
 const relative=String(value).match(/(\d+)\s*(minute|minuto|hour|hora|day|dia|día|week|semana)/i);
 if(relative && !/\b(in|within|dentro|pr[oó]xim)/i.test(String(value))){const unit=relative[2].toLowerCase();const ms=/^(minute|minuto)/.test(unit)?60000:/^(hour|hora)/.test(unit)?3600000:/^(week|semana)/.test(unit)?604800000:86400000;return new Date(now-Number(relative[1])*ms)}
 const date=new Date(value);return Number.isNaN(date.getTime())?null:date;
}
function isFresh(item,query,timeZone='America/Managua',now=Date.now()){
 const date=publicationDate(item,now);
 if(date && date.getTime()>now+300000)return false;
 const plan=searchPlan(query,timeZone,now);
 if(!plan.start)return true;
 if(!date)return false;
 // A date without a clock is a calendar date, not midnight UTC in the user's zone.
 const raw=item.iso_date || item.published_date || item.publishedDate || item.date;
 const day=/^\d{4}-\d{2}-\d{2}$/.test(String(raw))?String(raw):dayInZone(date,timeZone);
 return day>=plan.start && day<=plan.end;
}
function articleText(html,url,expectedTitle=''){
 const dom=new JSDOM(html,{url});
 try{
  dom.window.document.querySelectorAll('nav,header,footer,aside,script,style,[role="navigation"]').forEach(n=>n.remove());
  const article=new Readability(dom.window.document,{charThreshold:100}).parse();
  const text=(article?.textContent||'').replace(/\s+/g,' ').trim();
  // Video recommendation lists and unrelated landing pages are not the article.
  if((text.match(/\b\d{2}:\d{2}\b/g)||[]).length>6)return '';
  const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const words=[...new Set(normalize(expectedTitle).match(/[a-z]{5,}/g)||[])].filter(w=>!['sobre','entre','desde','donde','cuando','noticias','nuevo','nueva'].includes(w));
  const beginning=normalize(text.slice(0,1800));
  if(words.length>=2 && words.filter(w=>beginning.includes(w)).length<Math.min(2,words.length))return '';
  return text.slice(0,6000);
 }finally{dom.window.close()}
}
module.exports={regionFor,publicationDate,isFresh,articleText,searchPlan};
