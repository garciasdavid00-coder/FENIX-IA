
require('dotenv').config({quiet:true});
const {Client}=require('pg');const {databaseOptions}=require('../config/database');const {sync}=require('../backend/historyStore');const assert=require('node:assert/strict');
(async()=>{const client=new Client(databaseOptions());await client.connect();try{
 await client.query('CREATE TEMP TABLE chats (google_id TEXT,cliente_id BIGINT,titulo TEXT,mensajes JSONB DEFAULT \'[]\',pinned BOOLEAN DEFAULT false,proyecto_id BIGINT,actualizado_en TIMESTAMPTZ DEFAULT now(),UNIQUE(google_id,cliente_id))');
 await client.query('CREATE TEMP TABLE proyectos (google_id TEXT,cliente_id BIGINT,nombre TEXT,UNIQUE(google_id,cliente_id))');
 const pool={connect:async()=>({query:(...args)=>client.query(...args),release(){}})};
 let r=await sync(pool,'test-user',{chats:[{id:'1',mensajes:[{rol:'user',contenido:'uno'}]},{id:'2',mensajes:[]}],proyectos:[{id:'5',nombre:'Proyecto'}]});
 await sync(pool,'test-user',{chats:[{id:'1',mensajes:[{rol:'user',contenido:'dos'}],revision:r.revisions['1']}]});
 await assert.rejects(sync(pool,'test-user',{chats:[{id:'1',mensajes:[{rol:'user',contenido:'viejo'}],revision:r.revisions['1']}]}),e=>e.status===409);
 assert.equal((await client.query('SELECT count(*)::int AS n FROM pg_temp.chats')).rows[0].n,2);
 await sync(pool,'test-user',{deletedChatIds:['1','2'],deletedProjectIds:['5']});assert.equal((await client.query('SELECT count(*)::int AS n FROM pg_temp.chats')).rows[0].n,0);
 console.log('PASS PostgreSQL over verified TLS: upsert, conflict rollback, omitted-row preservation and explicit last deletion. Only connection-local temporary tables used.');
 }finally{await client.end()}})().catch(e=>{console.error(e.message);process.exitCode=1});
