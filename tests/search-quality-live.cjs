require('dotenv').config({quiet:true});
const assert=require('node:assert/strict');
const {buscarEnWeb,respuestaSoloTitulares}=require('../backend/webSearch');
const {searchPlan}=require('../backend/searchPolicy');
(async()=>{
 const consulta='DIME LAS NOTICIAS QUE PASARON EL DIA DE AYER EN NICARAGUA';
 const plan=searchPlan(consulta,'America/Managua');
 const r=await buscarEnWeb({consulta,timeZone:'America/Managua'});
 console.log(JSON.stringify({period:plan.start,provider:r.proveedor,diagnostics:r.diagnostico,sources:r.fuentes,titleOnly:r.soloTitulares},null,2));
 assert.ok(r.fuentes.length,'No live sources available');
 for(const f of r.fuentes)assert.equal(f.fechaLocal,plan.start);
 if(r.soloTitulares)console.log(respuestaSoloTitulares(r));
 console.log('PASS live search: every accepted source has the requested local publication date. Article/event truth is not asserted.');
})().catch(e=>{console.error(e.message);process.exitCode=1});
