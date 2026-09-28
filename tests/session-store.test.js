const test=require('node:test'),assert=require('node:assert/strict');
const Store=require('connect-pg-simple')(require('express-session'));
const {initializeSessionSchema}=require('../services/sessionSchema');
const get=store=>new Promise((resolve,reject)=>store.get('test-session',(error,value)=>error?reject(error):resolve(value)));
test('Reproduces cached lazy initialization failure after one PostgreSQL timeout',async()=>{
 let calls=0;const pool={query:async()=>{calls++;if(calls===1)throw Error('Connection terminated due to connection timeout');return{rows:[]}}};
 const store=new Store({pool,createTableIfMissing:true,pruneSessionInterval:false});
 try{await assert.rejects(get(store),/timeout/);await assert.rejects(get(store),/timeout/);assert.equal(calls,1)}finally{await store.close()}
});
test('Prepared session store recovers on the next request after a connection timeout',async()=>{
 let calls=0;const pool={query:async()=>{calls++;if(calls===1)throw Error('Connection terminated due to connection timeout');return{rows:[{sess:{cookie:{},marker:'same-session'}}]}}};
 const store=new Store({pool,createTableIfMissing:false,pruneSessionInterval:false});
 try{await assert.rejects(get(store),/timeout/);assert.equal((await get(store)).marker,'same-session');assert.equal(calls,2)}finally{await store.close()}
});
test('Session schema initialization retries temporary failure and creates expiration index',async()=>{
 const calls=[];await initializeSessionSchema({query:async sql=>{calls.push(sql);if(calls.length===1)throw Error('Connection terminated due to connection timeout')}});
 assert.equal(calls.length,3);assert.match(calls[2],/CREATE INDEX IF NOT EXISTS/);
});
test('Session initialization does not hide permanent permission failures',async()=>{
 let calls=0;await assert.rejects(initializeSessionSchema({query:async()=>{calls++;throw Object.assign(Error('permission denied'),{code:'42501'})}}),/permission denied/);assert.equal(calls,1);
});
