function validateChat(body) {
 const bad=message=>{throw Object.assign(new Error(message),{status:400})};
 if(!body || typeof body.mensaje!=='string' || !body.mensaje.trim())bad('Falta el mensaje');
 if(body.mensaje.length>65000)bad('El mensaje es demasiado largo');
 const history=body.historial??[];
 if(!Array.isArray(history)||history.length>100)bad('Historial inválido o demasiado largo');
 let chars=0;
 for(const m of history){if(!m || !['user','assistant'].includes(m.role) || typeof m.content!=='string')bad('Mensaje de historial inválido');chars+=m.content.length}
 if(chars>150000)bad('El historial excede el límite. Inicia un chat nuevo.');
 if(body.instruccion!=null && (typeof body.instruccion!=='string'||body.instruccion.length>5000))bad('Instrucciones inválidas');
 if(body.chatId!=null && (!/^\d+$/.test(String(body.chatId))||!Number.isSafeInteger(Number(body.chatId))||Number(body.chatId)<=0))bad('ID de chat inválido');
 if(body.timeZone!=null){try{new Intl.DateTimeFormat('es',{timeZone:body.timeZone})}catch{bad('Zona horaria inválida')}}
 if(body.imagenBase64 && (typeof body.imagenBase64!=='string'||body.imagenBase64.length>4000000||!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(body.imagenBase64)))bad('Imagen inválida');
 return {...body,historial:history};
}
module.exports={validateChat};
