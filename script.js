/* ======================
   ESTADO GENERAL
====================== */
let historial = []; // [{id, titulo, mensajes: [], pinned: false, proyectoId: null}]
let chatActualId = null;
let proyectos = []; // [{id, nombre}]
let proyectoActualId = null; // para saber en qué proyecto estamos parados
let archivosBiblioteca = []; // [{id, nombre, tipo, tamanoKB, url}]

/* ======================
   SIDEBAR
====================== */
function toggleSidebar(){
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
  const colapsado = sidebar.classList.contains('collapsed');
  document.getElementById('toggleTopbar').style.display = colapsado ? 'inline-flex' : 'none';
}

/* ======================
   AUTO-CRECER TEXTAREAS
====================== */
function autoGrow(el){
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

const chatInput = document.getElementById('chatInput');
const chatInput2 = document.getElementById('chatInput2');

chatInput.addEventListener('input', function(){ autoGrow(this); });
chatInput2.addEventListener('input', function(){ autoGrow(this); });

chatInput.addEventListener('keydown', function(e){
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    sendMessage(false);
  }
});
chatInput2.addEventListener('keydown', function(e){
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    sendMessage(true);
  }
});

/* ======================
   PILLS -> insertan texto en el input
====================== */
function usarPill(texto){
  chatInput.value = texto;
  chatInput.focus();
  autoGrow(chatInput);
  chatInput.setSelectionRange(texto.length, texto.length);
}

/* ======================
   MICRÓFONO (reconocimiento de voz del navegador)
====================== */
function usarMicrofono(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    alert('Tu navegador no soporta reconocimiento de voz. Prueba en Chrome.');
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.start();

  recognition.onresult = function(event){
    const texto = event.results[0][0].transcript;
    const vistaChatVisible = document.getElementById('vistaChat').style.display !== 'none';
    if(vistaChatVisible){
      chatInput2.value += texto;
      autoGrow(chatInput2);
    } else {
      chatInput.value += texto;
      autoGrow(chatInput);
    }
  };
  recognition.onerror = function(){
    alert('No se pudo captar el audio. Intenta de nuevo.');
  };
}

/* ======================
   ENVIAR MENSAJE
====================== */
function sendMessage(desdeVistaChat){
  const inputActivo = desdeVistaChat ? chatInput2 : chatInput;
  const texto = inputActivo.value.trim();
  if(!texto) return;

  if(chatActualId === null){
    crearNuevoChatEnHistorial(texto);
  }

  mostrarVistaChat();
  agregarMensaje('user', texto);
  guardarMensajeEnHistorial('user', texto);

  inputActivo.value = '';
  autoGrow(inputActivo);

  const typingEl = agregarMensaje('bot', 'Escribiendo...', true);

  // URL de tu backend local. Si lo subes a un servidor real, cambia esto por esa URL.
  const BACKEND_URL = '/api/chat';

  // Armamos el historial en formato que espera la API (role/content)
  const chat = historial.find(c => c.id === chatActualId);
  const historialParaAPI = chat
    ? chat.mensajes
        .filter(m => m.texto !== texto) // evita duplicar el mensaje que acabamos de mandar
        .map(m => ({ role: m.tipo === 'user' ? 'user' : 'assistant', content: m.texto }))
    : [];

  fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensaje: texto, historial: historialParaAPI })
  })
    .then(res => {
      if (!res.ok) throw new Error('Error del servidor');
      return res.json();
    })
    .then(data => {
      typingEl.remove();
      agregarMensaje('bot', data.respuesta);
      guardarMensajeEnHistorial('bot', data.respuesta);
    })
    .catch(err => {
      typingEl.remove();
      const mensajeError = '⚠️ No se pudo conectar con el backend. Revisa que esté corriendo en ' + BACKEND_URL;
      agregarMensaje('bot', mensajeError);
      console.error(err);
    });
}

/* ======================
   MOSTRAR MENSAJE EN PANTALLA
====================== */
function agregarMensaje(tipo, texto, esTyping){
  const contenedor = document.getElementById('messages');
  const burbuja = document.createElement('div');
  burbuja.className = 'msg ' + (tipo === 'user' ? 'msg-user' : 'msg-bot') + (esTyping ? ' typing' : '');
  burbuja.textContent = texto;
  contenedor.appendChild(burbuja);
  contenedor.scrollTop = contenedor.scrollHeight;
  return burbuja;
}

/* ======================
   CAMBIAR DE VISTA
====================== */
function ocultarTodasLasVistas(){
  document.getElementById('vistaInicial').style.display = 'none';
  document.getElementById('vistaChat').style.display = 'none';
  document.getElementById('vistaProyectos').style.display = 'none';
  document.getElementById('vistaProyectoDetalle').style.display = 'none';
  document.getElementById('vistaBiblioteca').style.display = 'none';
}

function mostrarVistaChat(){
  ocultarTodasLasVistas();
  document.getElementById('vistaChat').style.display = 'flex';
}

function mostrarVistaInicial(){
  ocultarTodasLasVistas();
  document.getElementById('vistaInicial').style.display = 'flex';
  document.getElementById('messages').innerHTML = '';
}

/* ======================
   NUEVO CHAT
====================== */
function nuevoChat(){
  chatActualId = null;
  proyectoActualId = null;
  chatInput.value = '';
  chatInput2.value = '';
  mostrarVistaInicial();
}

/* ======================
   HISTORIAL DE CHATS (Recientes)
====================== */
function crearNuevoChatEnHistorial(primerMensaje){
  const id = Date.now();
  const titulo = primerMensaje.length > 30 ? primerMensaje.slice(0, 30) + '...' : primerMensaje;
  historial.unshift({ id, titulo, mensajes: [], pinned: false, proyectoId: proyectoActualId });
  chatActualId = id;
  renderizarRecientes();
}

function guardarMensajeEnHistorial(tipo, texto){
  const chat = historial.find(c => c.id === chatActualId);
  if(chat) chat.mensajes.push({ tipo, texto });
}

function ordenarConAnclados(lista){
  return [...lista].sort((a, b) => (b.pinned === true) - (a.pinned === true));
}

function renderizarRecientes(filtro){
  const cont = document.getElementById('recentesList');
  cont.innerHTML = '';
  let lista = historial.filter(c => !c.proyectoId); // solo chats sueltos, no los de proyectos
  if(filtro){
    lista = lista.filter(c => c.titulo.toLowerCase().includes(filtro.toLowerCase()));
  }
  lista = ordenarConAnclados(lista);

  lista.forEach(chat => {
    const el = document.createElement('div');
    el.className = 'recent-item';
    el.setAttribute('data-chat-id', chat.id);

    const nombre = document.createElement('span');
    nombre.className = 'recent-item-nombre';
    nombre.textContent = (chat.pinned ? '📌 ' : '') + chat.titulo;
    nombre.setAttribute('data-accion-abrir', chat.id);

    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-btn';
    menuBtn.title = 'Más opciones';
    menuBtn.type = 'button';
    menuBtn.setAttribute('data-accion-menu', chat.id);
    menuBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="pointer-events:none;"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';

    el.appendChild(nombre);
    el.appendChild(menuBtn);
    cont.appendChild(el);
  });
}

/* Un solo listener para todos los clics dentro de la lista de Recientes
   (más confiable que asignar onclick individual a cada botón) */
document.getElementById('recentesList').addEventListener('click', function(e){
  const btnMenu = e.target.closest('[data-accion-menu]');
  const btnAbrir = e.target.closest('[data-accion-abrir]');

  if(btnMenu){
    e.stopPropagation();
    const chatId = Number(btnMenu.getAttribute('data-accion-menu'));
    const contenedor = btnMenu.closest('.recent-item');
    abrirMenuChat(chatId, contenedor);
    return;
  }

  if(btnAbrir){
    const chatId = Number(btnAbrir.getAttribute('data-accion-abrir'));
    abrirChat(chatId);
  }
});

/* ======================
   MENÚ DE TRES PUNTOS (Destacar / Renombrar / Añadir a proyecto / Eliminar)
====================== */
function cerrarMenusAbiertos(){
  document.querySelectorAll('.dropdown-menu').forEach(m => m.remove());
}

document.addEventListener('click', cerrarMenusAbiertos);

function abrirMenuChat(chatId, contenedorEl){
  const yaAbierto = contenedorEl.querySelector('.dropdown-menu');
  cerrarMenusAbiertos();
  if(yaAbierto) return; // si ya estaba abierto este mismo, solo lo cerramos

  const chat = historial.find(c => c.id === chatId);
  if(!chat) return;

  const menu = document.createElement('div');
  menu.className = 'dropdown-menu';

  const iconoDestacar = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3l5 5-5.5 1.5L12 17l-1-1 7-7-6-6L4 9l7 7-6 6-1-1 6-6-5-5 6-6z"/></svg>';
  const iconoRenombrar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  const iconoProyecto = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>';
  const iconoEliminar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>';

  menu.innerHTML = `
    <div class="dropdown-item" data-accion="destacar">${iconoDestacar}${chat.pinned ? 'Quitar destacado' : 'Destacar'}</div>
    <div class="dropdown-item" data-accion="renombrar">${iconoRenombrar}Renombrar</div>
    <div class="dropdown-item" data-accion="proyecto">${iconoProyecto}Añadir al proyecto</div>
    <div class="dropdown-divider"></div>
    <div class="dropdown-item peligro" data-accion="eliminar">${iconoEliminar}Eliminar</div>
  `;

  menu.querySelector('[data-accion="destacar"]').onclick = (e) => {
    e.stopPropagation();
    toggleAnclar(chatId);
    cerrarMenusAbiertos();
  };
  menu.querySelector('[data-accion="renombrar"]').onclick = (e) => {
    e.stopPropagation();
    renombrarChat(chatId);
    cerrarMenusAbiertos();
  };
  menu.querySelector('[data-accion="proyecto"]').onclick = (e) => {
    e.stopPropagation();
    abrirSubmenuProyectos(chatId, menu);
  };
  menu.querySelector('[data-accion="eliminar"]').onclick = (e) => {
    e.stopPropagation();
    eliminarChatDeHistorial(chatId, e);
    cerrarMenusAbiertos();
  };

  contenedorEl.appendChild(menu);
}

function renombrarChat(chatId){
  const chat = historial.find(c => c.id === chatId);
  if(!chat) return;
  const nuevoNombre = prompt('Nuevo nombre para el chat:', chat.titulo);
  if(nuevoNombre && nuevoNombre.trim()){
    chat.titulo = nuevoNombre.trim();
    renderizarRecientes(document.getElementById('buscarInput').value);
    if(proyectoActualId) renderizarChatsDeProyecto(proyectoActualId);
  }
}

function abrirSubmenuProyectos(chatId, menuPadre){
  // Limpia contenido del menú y muestra la lista de proyectos para elegir
  menuPadre.innerHTML = '<div class="dropdown-submenu-label">Elige un proyecto</div>';

  if(proyectos.length === 0){
    const vacio = document.createElement('div');
    vacio.className = 'dropdown-item';
    vacio.style.color = 'var(--text-muted)';
    vacio.textContent = 'No tienes proyectos aún';
    menuPadre.appendChild(vacio);
  } else {
    proyectos.forEach(p => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.textContent = p.nombre;
      item.onclick = (e) => {
        e.stopPropagation();
        moverChatAProyecto(chatId, p.id);
        cerrarMenusAbiertos();
      };
      menuPadre.appendChild(item);
    });
  }

  const divider = document.createElement('div');
  divider.className = 'dropdown-divider';
  menuPadre.appendChild(divider);

  const crearNuevo = document.createElement('div');
  crearNuevo.className = 'dropdown-item';
  crearNuevo.textContent = '+ Crear nuevo proyecto';
  crearNuevo.onclick = (e) => {
    e.stopPropagation();
    const nombre = prompt('Nombre del nuevo proyecto:');
    if(nombre && nombre.trim()){
      const nuevoProyecto = { id: Date.now(), nombre: nombre.trim() };
      proyectos.unshift(nuevoProyecto);
      moverChatAProyecto(chatId, nuevoProyecto.id);
    }
    cerrarMenusAbiertos();
  };
  menuPadre.appendChild(crearNuevo);
}

function moverChatAProyecto(chatId, proyectoId){
  const chat = historial.find(c => c.id === chatId);
  if(chat){
    chat.proyectoId = proyectoId;
    renderizarRecientes(document.getElementById('buscarInput').value);
  }
}

function toggleAnclar(id){
  const chat = historial.find(c => c.id === id);
  if(chat){
    chat.pinned = !chat.pinned;
    renderizarRecientes(document.getElementById('buscarInput').value);
  }
}

function abrirChat(id){
  const chat = historial.find(c => c.id === id);
  if(!chat) return;
  chatActualId = id;
  mostrarVistaChat();
  document.getElementById('messages').innerHTML = '';
  chat.mensajes.forEach(m => agregarMensaje(m.tipo, m.texto));
}

/* ======================
   BUSCAR EN EL HISTORIAL
====================== */
function toggleBuscar(){
  const input = document.getElementById('buscarInput');
  const visible = input.style.display !== 'none';
  input.style.display = visible ? 'none' : 'block';
  if(!visible) input.focus();
}

function filtrarRecientes(){
  const valor = document.getElementById('buscarInput').value;
  renderizarRecientes(valor);
}

/* ======================
   AUTENTICACIÓN CON GOOGLE
====================== */
const BACKEND_URL_AUTH = '';

function iniciarSesionConGoogle(){
  window.location.href = `${BACKEND_URL_AUTH}/auth/google`;
}

function cerrarSesion(){
  fetch(`${BACKEND_URL_AUTH}/api/logout`, { method: 'POST', credentials: 'include' })
    .then(() => {
      window.location.reload();
    })
    .catch(err => console.error('Error al cerrar sesión:', err));
}

function revisarSesionActual(){
  fetch(`${BACKEND_URL_AUTH}/api/usuario-actual`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      const authArea = document.getElementById('authArea');
      if(data.autenticado && data.usuario){
        const u = data.usuario;
        authArea.innerHTML = `
          <div class="user-conectado">
            ${u.foto ? `<img class="user-avatar" src="${u.foto}" alt="${escaparHTML(u.nombre || '')}">` : ''}
            <span class="user-nombre">${escaparHTML(u.nombre || 'Usuario')}</span>
            <button class="btn-logout" onclick="cerrarSesion()">Cerrar sesión</button>
          </div>
        `;
      }
      // Si no está autenticado, dejamos el botón "Continuar con Google" que ya está en el HTML
    })
    .catch(() => {
      // Si el backend no está corriendo, simplemente no hacemos nada (se queda el botón de Google)
    });
}

// Revisamos la sesión apenas carga la página
revisarSesionActual();

/* ======================
   PROYECTOS
====================== */
function mostrarVistaProyectos(){
  ocultarTodasLasVistas();
  document.getElementById('vistaProyectos').style.display = 'block';
  renderizarProyectos();
}

function crearProyecto(){
  const nombre = prompt('Nombre del proyecto:');
  if(!nombre || !nombre.trim()) return;
  proyectos.unshift({ id: Date.now(), nombre: nombre.trim() });
  renderizarProyectos();
}

function eliminarProyecto(id, event){
  event.stopPropagation();
  if(!confirm('¿Eliminar este proyecto? Los chats que tenía quedarán sueltos en Recientes.')) return;
  proyectos = proyectos.filter(p => p.id !== id);
  historial.forEach(c => { if(c.proyectoId === id) c.proyectoId = null; });
  renderizarProyectos();
  renderizarRecientes();
}

function renderizarProyectos(){
  const cont = document.getElementById('proyectosList');
  cont.innerHTML = '';

  if(proyectos.length === 0){
    cont.innerHTML = '<div class="empty-state">Aún no tienes proyectos. Crea uno para agrupar tus chats.</div>';
    return;
  }

  proyectos.forEach(p => {
    const cantidadChats = historial.filter(c => c.proyectoId === p.id).length;
    const card = document.createElement('div');
    card.className = 'card-item';
    card.onclick = () => abrirProyecto(p.id);
    card.innerHTML = `
      <button class="card-item-del" onclick="eliminarProyecto(${p.id}, event)">×</button>
      <div class="card-item-title">${escaparHTML(p.nombre)}</div>
      <div class="card-item-sub">${cantidadChats} chat${cantidadChats === 1 ? '' : 's'}</div>
    `;
    cont.appendChild(card);
  });
}

function abrirProyecto(id){
  const p = proyectos.find(pr => pr.id === id);
  if(!p) return;
  proyectoActualId = id;
  ocultarTodasLasVistas();
  document.getElementById('vistaProyectoDetalle').style.display = 'block';
  document.getElementById('proyectoDetalleNombre').textContent = p.nombre;
  renderizarChatsDeProyecto(id);
}

function renderizarChatsDeProyecto(proyectoId){
  const cont = document.getElementById('proyectoDetalleChats');
  cont.innerHTML = '';
  const chats = ordenarConAnclados(historial.filter(c => c.proyectoId === proyectoId));

  if(chats.length === 0){
    cont.innerHTML = '<div class="empty-state">Este proyecto todavía no tiene chats. Crea uno nuevo aquí.</div>';
    return;
  }

  chats.forEach(chat => {
    const card = document.createElement('div');
    card.className = 'card-item';
    card.onclick = () => abrirChat(chat.id);
    card.innerHTML = `
      <button class="card-item-del" onclick="eliminarChatDeHistorial(${chat.id}, event)">×</button>
      <div class="card-item-title">${chat.pinned ? '📌 ' : ''}${escaparHTML(chat.titulo)}</div>
      <div class="card-item-sub">${chat.mensajes.length} mensaje${chat.mensajes.length === 1 ? '' : 's'}</div>
    `;
    cont.appendChild(card);
  });
}

function eliminarChatDeHistorial(id, event){
  event.stopPropagation();
  if(!confirm('¿Eliminar este chat?')) return;
  historial = historial.filter(c => c.id !== id);
  renderizarRecientes();
  if(proyectoActualId) renderizarChatsDeProyecto(proyectoActualId);
}

function nuevoChatEnProyecto(){
  // Al mandar el próximo mensaje, el chat se crea ya asociado a este proyecto
  chatActualId = null;
  chatInput.value = '';
  chatInput2.value = '';
  mostrarVistaChat();
}

/* ======================
   BIBLIOTECA
====================== */
function mostrarVistaBiblioteca(){
  ocultarTodasLasVistas();
  document.getElementById('vistaBiblioteca').style.display = 'block';
  renderizarBiblioteca();
}

function subirArchivo(event){
  const archivos = Array.from(event.target.files);
  archivos.forEach(file => {
    const item = {
      id: Date.now() + Math.random(),
      nombre: file.name,
      tipo: file.type,
      tamanoKB: Math.round(file.size / 1024),
      url: URL.createObjectURL(file)
    };
    archivosBiblioteca.unshift(item);
  });
  event.target.value = ''; // permite volver a subir el mismo archivo si se borra
  renderizarBiblioteca();
}

function eliminarArchivo(id, event){
  event.stopPropagation();
  const archivo = archivosBiblioteca.find(a => a.id === id);
  if(archivo) URL.revokeObjectURL(archivo.url);
  archivosBiblioteca = archivosBiblioteca.filter(a => a.id !== id);
  renderizarBiblioteca();
}

function renderizarBiblioteca(){
  const cont = document.getElementById('bibliotecaList');
  cont.innerHTML = '';

  if(archivosBiblioteca.length === 0){
    cont.innerHTML = '<div class="empty-state">Aún no has subido archivos. Usa el botón "+ Subir archivo".</div>';
    return;
  }

  archivosBiblioteca.forEach(archivo => {
    const esImagen = archivo.tipo.startsWith('image/');
    const card = document.createElement('div');
    card.className = 'card-item';

    const preview = esImagen
      ? `<img class="card-img-preview" src="${archivo.url}" alt="${escaparHTML(archivo.nombre)}">`
      : `<div class="card-file-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>`;

    card.innerHTML = `
      <button class="card-item-del" onclick="eliminarArchivo(${archivo.id}, event)">×</button>
      ${preview}
      <div class="card-item-title">${escaparHTML(archivo.nombre)}</div>
      <div class="card-item-sub">${archivo.tamanoKB} KB</div>
    `;
    card.onclick = () => window.open(archivo.url, '_blank');
    cont.appendChild(card);
  });
}

/* ======================
   UTILIDAD
====================== */
function escaparHTML(texto){
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
