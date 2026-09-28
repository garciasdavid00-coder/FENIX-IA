// Shared SSE reader. Network chunks may split a JSON line or a UTF-8 character.
export async function* readSSE(body) {
  if (!body) throw new Error('El servidor no devolvió una respuesta legible.');
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  function parse(line) {
    if (!line.startsWith('data:')) return null;
    const raw = line.slice(5).trim();
    if (!raw || raw === '[DONE]') return null;
    let data;
    try { data = JSON.parse(raw); } catch { throw new Error('La respuesta del servidor llegó incompleta.'); }
    if (data.error) throw Object.assign(new Error(data.mensaje || data.error), { bloqueado: data.error === 'CHAT_BLOQUEADO' });
    return data;
  }
  try {
    while (true) {
      const {value, done} = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, {stream: true});
      let index;
      while ((index = buffer.indexOf('\n')) !== -1) {
        const data = parse(buffer.slice(0,index).replace(/\r$/, ''));
        buffer = buffer.slice(index+1);
        if (data) yield data;
      }
      if (done) break;
    }
    if (buffer.trim()) { const data = parse(buffer); if (data) yield data; }
  } finally { await reader.cancel().catch(()=>{}); reader.releaseLock(); }
}
