const test=require('node:test'),assert=require('node:assert/strict');
const {temporalMetadata,isFresh,searchPlan}=require('../backend/searchPolicy');
const {validateSelections,renderBulletin,answerDatedNews}=require('../backend/datedNews');
const now=Date.parse('2026-09-28T23:00:00Z'),zone='America/Managua';
test('48-hour flag uses server clock, not model interpretation',()=>{
 assert.equal(temporalMetadata({iso_date:'2026-09-26T22:59:59Z'},zone,now).no_reciente,true);
 assert.equal(temporalMetadata({iso_date:'2026-09-26T23:00:00Z'},zone,now).no_reciente,false);
 assert.equal(temporalMetadata({},zone,now).no_reciente,null);
 assert.equal(temporalMetadata({date:'invalid'},zone,now).fecha_desconocida,true);
});
test('Months-old OEA vote cannot enter a today query, even if headline says today',()=>{
 const row={title:'Hoy los cancilleres de la OEA votarán una resolución',iso_date:'2026-03-10T07:00:00Z'};
 assert.equal(temporalMetadata(row,zone,now).no_reciente,true);
 assert.equal(isFresh(row,'noticias Nicaragua hoy',zone,now),false);
});
test('Relative ages and missing dates do not prove an exact day',()=>{
 assert.equal(isFresh({date:'hace 1 hora'},'noticias hoy',zone,now),false);
 assert.equal(isFresh({},'noticias hoy',zone,now),false);
 assert.equal(isFresh({iso_date:'2026-09-29T01:00:00Z'},'noticias hoy',zone,Date.parse('2026-09-29T02:00:00Z')),true);
});
test('Invented date or event assertion from model is rejected before display',()=>{
 const docs=[{id:1,text:'En marzo, los cancilleres de la OEA votaron una resolución.'}];
 assert.deepEqual(validateSelections(JSON.stringify({items:[{id:1,quote:'Hoy, 28 de septiembre, los cancilleres de la OEA votarán una resolución.'}]}),docs),[]);
 const quote=docs[0].text;
 assert.deepEqual(validateSelections(JSON.stringify({items:[{id:1,quote}]}),docs),[{id:1,quote}]);
});
test('New publication about old event is labeled publication, never event today',()=>{
 const doc={id:1,title:'Análisis de resolución de marzo',text:'En marzo, los cancilleres votaron una resolución.',url:'https://example.com/march',fecha_local:'2026-09-28',content:'articulo',no_reciente:false};
 const text=renderBulletin([doc],[{id:1,quote:doc.text}],searchPlan('noticias hoy',zone,now),zone);
 assert.match(text,/no confirma que los hechos ocurrieran ese día/);assert.match(text,/En marzo/);assert.ok(!text.includes('Hoy votarán'));
});
test('Old background explicitly displays actual date and no-reciente label',()=>{
 const text=renderBulletin([{id:1,title:'Archivo',url:'https://example.com',fecha_local:'2026-03-10',no_reciente:true}],[],{start:'2026-03-10',end:'2026-03-10'},zone);
 assert.match(text,/2026-03-10/);assert.match(text,/NO RECIENTE/);
});
test('Cache revalidation rejects expired source before calling model',async()=>{
 let calls=0;
 const answer=await answerDatedNews({query:'noticias hoy',result:{documentos:[{id:1,fecha_publicacion:'2020-01-01T12:00:00Z',fecha_original:'2020-01-01T12:00:00Z',text:'old'}],fuentes:[]},generate:async()=>{calls++;return {texto:''}}});
 assert.equal(calls,0);assert.match(answer.texto,/No encontré publicaciones/);
});
test('System prompt no longer asserts retrieved events already happened',()=>{
 const {sistemaFinal}=require('../backend/chatEngine').armarSistema({timeZone:zone});
 assert.ok(!sistemaFinal.includes('ya ocurrieron o están ocurriendo'));assert.match(sistemaFinal,/REGLA DURA DE FECHAS/);assert.match(sistemaFinal,/no_reciente/);
});
