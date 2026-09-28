// Explicit deletions and optimistic revisions prevent stale browser snapshots losing data.
function id(value) {
  const text = String(value ?? '');
  const n = Number(text);
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(n) || n <= 0) throw Object.assign(new Error('ID inválido'), {status:400});
  return n;
}
function conflict() { return Object.assign(new Error('El historial cambió en otra sesión. Recarga antes de continuar.'), {status:409}); }
async function sync(pool, user, data) {
  if (!pool) throw Object.assign(new Error('Base de datos no disponible'), {status:503});
  const {chats=[],proyectos=[],deletedChatIds=[],deletedProjectIds=[]} = data;
  if (![chats,proyectos,deletedChatIds,deletedProjectIds].every(Array.isArray) || chats.length>500 || proyectos.length>500) throw Object.assign(new Error('Formato de historial inválido'), {status:400});
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [String(user)]);
    const revisions = {};
    for (const chat of chats) {
      const cid=id(chat.id);
      if (!Array.isArray(chat.mensajes) || chat.mensajes.length>1000) throw Object.assign(new Error('Mensajes inválidos'), {status:400});
      const old = await c.query('SELECT actualizado_en, mensajes FROM chats WHERE google_id=$1 AND cliente_id=$2', [user,cid]);
      const previous=old.rows[0];
      if (previous && !( !chat.revision && previous.mensajes?.length === 0 ) && (!chat.revision || new Date(chat.revision).getTime()!==new Date(previous.actualizado_en).getTime())) throw conflict();
      if (!previous && chat.revision) throw conflict();
      const result=await c.query(`INSERT INTO chats (google_id,cliente_id,titulo,mensajes,pinned,proyecto_id)
        VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (google_id,cliente_id) DO UPDATE SET
        titulo=EXCLUDED.titulo,mensajes=EXCLUDED.mensajes,pinned=EXCLUDED.pinned,proyecto_id=EXCLUDED.proyecto_id,actualizado_en=clock_timestamp()
        RETURNING actualizado_en`,[user,cid,String(chat.titulo||'').slice(0,300),JSON.stringify(chat.mensajes),!!chat.pinned,chat.proyectoId == null ? null:id(chat.proyectoId)]);
      revisions[String(cid)]=result.rows[0].actualizado_en;
    }
    for (const p of proyectos) await c.query('INSERT INTO proyectos (google_id,cliente_id,nombre) VALUES ($1,$2,$3) ON CONFLICT (google_id,cliente_id) DO UPDATE SET nombre=EXCLUDED.nombre',[user,id(p.id),String(p.nombre||'').slice(0,300)]);
    if (deletedChatIds.length) await c.query('DELETE FROM chats WHERE google_id=$1 AND cliente_id=ANY($2::bigint[])',[user,deletedChatIds.map(id)]);
    if (deletedProjectIds.length) {
      await c.query('UPDATE chats SET proyecto_id=NULL WHERE google_id=$1 AND proyecto_id=ANY($2::bigint[])',[user,deletedProjectIds.map(id)]);
      await c.query('DELETE FROM proyectos WHERE google_id=$1 AND cliente_id=ANY($2::bigint[])',[user,deletedProjectIds.map(id)]);
    }
    await c.query('COMMIT'); return {ok:true,revisions};
  } catch(e) { await c.query('ROLLBACK'); throw e; } finally {c.release();}
}
module.exports={sync,id};
