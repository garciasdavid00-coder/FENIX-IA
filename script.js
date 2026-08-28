/* ======================
   TEMA (claro / oscuro)
====================== */
function aplicarTema(tema){
  document.documentElement.setAttribute('data-theme', tema);
  localStorage.setItem('fenixTema', tema);
  actualizarTextoTemaEnMenu(tema);
}

function alternarTema(){
  const actual = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  aplicarTema(actual === 'dark' ? 'light' : 'dark');
}

function inicializarTema(){
  const guardado = localStorage.getItem('fenixTema');
  if(guardado){
    aplicarTema(guardado);
    return;
  }
  const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  aplicarTema(prefiereOscuro ? 'dark' : 'light');
}

function actualizarTextoTemaEnMenu(tema){
  const el = document.getElementById('temaTextoActual');
  if(el) el.textContent = tema === 'dark' ? t('config.oscuro') : t('config.claro');
  const elConfig = document.getElementById('temaTextoConfig');
  if(elConfig) elConfig.textContent = tema === 'dark' ? t('config.oscuro') : t('config.claro');
  const track = document.querySelector('#toggleTema .toggle-track');
  if(track){
    if(tema === 'dark') track.classList.add('on');
    else track.classList.remove('on');
  }
}

// Se activa apenas carga el script, para evitar parpadeo del tema incorrecto.
// Se llama después de definir TRADUCCIONES y t() (más abajo), porque
// actualizarTextoTemaEnMenu usa t().
/* ======================
   ESTADO GENERAL
====================== */
let historial = []; // [{id, titulo, mensajes: [], pinned: false, proyectoId: null}]
let chatActualId = null;
let proyectos = []; // [{id, nombre}]
let proyectoActualId = null; // para saber en qué proyecto estamos parados
let archivosBiblioteca = []; // [{id, nombre, tipo, tamanoKB, url}]
let idiomaSeleccionado = localStorage.getItem('fenixIdioma') || 'es';
let idiomaPendiente = null;
// Última petición del usuario: se usa como "tema" cuando pedimos un
// documento real (para que la IA busque info de verdad sobre eso).
let ultimoMensajeUsuario = '';

/* ======================
   INTERNACIONALIZACIÓN (i18n)
====================== */
const TRADUCCIONES = {
  es: {
    'nav.nuevoChat': 'Nuevo chat',
    'nav.buscar': 'Buscar',
    'nav.proyectos': 'Proyectos',
    'nav.biblioteca': 'Biblioteca',
    'nav.instalar': 'Instalar app',
    'nav.recientes': 'Recientes',
    'buscar.placeholder': 'Buscar en el historial...',
    'usuario.invitado': 'Invitado',
    'usuario.cuenta': 'Cuenta',
    'usuario.configuracion': 'Configuración',
    'usuario.idioma': 'Idioma',
    'usuario.ayuda': 'Obtener ayuda',
    'usuario.mejorarPlan': 'Mejorar plan',
    'usuario.aplicaciones': 'Obtener aplicaciones y extensiones',
    'usuario.info': 'Más información',
    'usuario.cerrarSesion': 'Cerrar sesión',
    'usuario.iniciarGoogle': 'Iniciar sesión con Google',
    'input.placeholder': 'Cuando quieras...',
    'pill.documentos': 'Documentos',
    'pill.hojas': 'Hojas',
    'pill.presentaciones': 'Presentaciones',
    'pill.imagenes': 'Imágenes',
    'pill.escritura': 'Escritura',
    'pill.resumen': 'Resumen',
    'pill.sitios': 'Sitios',
    'pill.docsPrompt': 'Ayúdame a crear un documento sobre: ',
    'pill.hojasPrompt': 'Ayúdame a crear una hoja de cálculo para: ',
    'pill.presentacionesPrompt': 'Ayúdame a crear una presentación sobre: ',
    'pill.imagenesPrompt': 'Genera una imagen de: ',
    'imagen.generando': 'Generando imagen…',
    'imagen.error': '⚠️ No se pudo generar la imagen. Inténtalo de nuevo.',
    'chat.imagenLista': 'Aquí tienes tu imagen:',
    'doc.generando': 'Creando documento…',
    'doc.descargar': 'Descargar documento',
    'doc.ver': 'Ver documento',
    'doc.imagenes': 'Generando imagen {n} de {total}…',
    'pill.escrituraPrompt': 'Ayúdame a escribir: ',
    'pill.resumenPrompt': 'Hazme un resumen de: ',
    'pill.sitiosPrompt': 'Búscame información sobre: ',
    'proyectos.titulo': 'Proyectos',
    'proyectos.nuevo': '+ Nuevo proyecto',
    'proyectos.crearNuevo': '+ Crear nuevo proyecto',
    'proyectos.nombrePrompt': 'Nombre del nuevo proyecto:',
    'proyectos.vacio': 'Aún no tienes proyectos. Crea uno para agrupar tus chats.',
    'proyectos.vacioChats': 'Este proyecto todavía no tiene chats. Crea uno nuevo aquí.',
    'proyectos.nuevoChatAqui': '+ Nuevo chat aquí',
    'proyectos.volver': '← Proyectos',
    'proyectos.eliminarConfirm': '¿Eliminar este proyecto? Los chats que tenía quedarán sueltos en Recientes.',
    'biblioteca.titulo': 'Biblioteca',
    'biblioteca.subir': '+ Subir archivo',
    'biblioteca.vacio': 'Aún no has subido archivos. Usa el botón "+ Subir archivo".',
    'nav.memoria': 'Memoria',
    'memoria.titulo': 'Memoria',
    'memoria.agregar': '+ Agregar memoria',
    'memoria.desc': 'Fenix recuerda información sobre ti y los temas que te importan para personalizar tus respuestas. Puedes revisarla, borrarla o agregarla a mano.',
    'memoria.vacia': 'Todavía no hay memorias guardadas. Chatea un rato y Fenix irá recordando tus datos y temas importantes.',
    'memoria.queRecordar': '¿Qué quieres que recuerde?',
    'memoria.placeholder': 'Ej.: "Me llamo Sara y trabajo de arquitecta"',
    'memoria.categoria': 'Categoría',
    'memoria.catPersonal': 'Personal',
    'memoria.catPreferencia': 'Preferencias',
    'memoria.catProyecto': 'Proyectos',
    'memoria.catTecnico': 'Técnico',
    'memoria.catTemas': 'Temas importantes',
    'memoria.guardar': 'Guardar',
    'memoria.cancelar': 'Cancelar',
    'memoria.eliminar': 'Eliminar',
    'memoria.eliminarConfirm': '¿Eliminar esta memoria?',
    'memoria.guardada': 'Memoria guardada',
    'memoria.requiereSesion': 'Inicia sesión para guardar y ver tus memorias.',
    'chat.recordar': 'Recuérdalo',
    'chat.escribiendo': 'Escribiendo...',
    'chat.sinTitulo': 'Sin título',
    'chat.eliminarConfirm': '¿Eliminar este chat?',
    'chat.renombrarPrompt': 'Nuevo nombre para el chat:',
    'chat.destacar': 'Destacar',
    'chat.quitarDestacado': 'Quitar destacado',
    'chat.renombrar': 'Renombrar',
    'chat.anadirProyecto': 'Añadir al proyecto',
    'chat.eliminar': 'Eliminar',
    'config.apariencia': 'Apariencia',
    'config.tema': 'Tema',
    'config.temaDesc': 'Cambia entre el tema claro y oscuro',
    'config.claro': 'Claro',
    'config.oscuro': 'Oscuro',
    'config.modeloIA': 'Modelo de IA',
    'config.modeloPredeterminado': 'Modelo predeterminado',
    'config.modeloDesc': 'Selecciona qué modelo de IA usar para las conversaciones',
    'config.asistente': 'Asistente',
    'config.instruccion': 'Instrucción del sistema',
    'config.instruccionDesc': 'Define el comportamiento base de la IA en todas las conversaciones',
    'config.instruccionPlaceholder': 'Eres un asistente útil y amigable...',
    'config.idioma': 'Idioma',
    'config.idiomaDesc': 'Idioma en el que la IA responderá',
    'config.datos': 'Datos y Privacidad',
    'config.guardarHistorial': 'Guardar historial',
    'config.guardarHistorialDesc': 'Guarda tus conversaciones localmente en el navegador',
    'config.borrarChats': 'Borrar todos los chats',
    'config.borrarChatsDesc': 'Elimina todo el historial de conversaciones guardado',
    'config.borrarDatos': 'Borrar datos',
    'config.confirmarBorrado': '¿Estás seguro? Se eliminarán todos los chats, proyectos y archivos guardados.',
    'config.volver': '← Volver',
    'config.aceptar': 'Aceptar',
    'config.idiomaSubtitle': 'Selecciona el idioma en el que la IA responderá',
    'modal.limiteTitulo': 'Límite de mensajes alcanzado',
    'modal.limiteTexto': 'Has usado tus <strong>3 mensajes gratuitos</strong> sin iniciar sesión. Inicia sesión con Google para seguir chateando sin límites.',
    'modal.ahoraNo': 'Ahora no',
    'modal.limiteAlcanzado': 'Has alcanzado el límite de {n} mensajes sin iniciar sesión. Inicia sesión con Google para seguir chateando.',
    'error.noConexion': '⚠️ No se pudo conectar con el backend. Revisa que esté corriendo en {url}',
    'error.servidor': 'Ocurrió un error del servidor.',
    'error.sinMicrofono': 'Tu navegador no soporta reconocimiento de voz. Prueba en Chrome.',
    'error.audio': 'No se pudo captar el audio. Intenta de nuevo.',
    'voz.titulo': 'Voz en vivo',
    'voz.conectando': 'Conectando...',
    'voz.escuchando': 'Te escucho, habla...',
    'voz.procesando': 'Procesando...',
    'voz.iaHablando': 'La IA está hablando',
    'voz.desconectado': 'Desconectado',
    'voz.error': 'Error de voz',
    'voz.terminar': 'Terminar',
    'voz.sugerencia': 'Toca el botón rojo para terminar.',
    'error.historialEliminado': 'Historial eliminado.',
    'instalar.ios': 'Para instalar Fenix en iPhone:\n\n1. Toca el botón Compartir (cuadro con flecha arriba)\n2. Pulsa "Añadir a pantalla de inicio"\n3. Pulsa "Añadir"',
    'instalar.otro': 'Para instalar Fenix:\n\nAbre el menú ⋮ del navegador y toca "Instalar app" o "Agregar a pantalla de inicio".',
    'cuenta.titulo': 'Mi cuenta',
    'cuenta.conSesion': 'Con la sesión iniciada tienes conversaciones ilimitadas.',
    'cuenta.sinSesion': 'Aún no has iniciado sesión.<br><br>Inicia sesión con Google para guardar tu cuenta y chatear sin límites.',
    'cuenta.cerrarSesion': 'Cerrar sesión',
    'cuenta.listo': 'Listo',
    'plan.titulo': 'Mejorar plan',
    'plan.texto': 'Fenix IA funciona con modelos de IA potentes.<br><br>Actualmente puedes chatear gratis con un límite de <strong>3 mensajes</strong> sin iniciar sesión. Al iniciar sesión con Google desbloqueas conversaciones <strong>ilimitadas</strong>.',
    'plan.subtitulo': 'Elige el plan que mejor se adapte a ti',
    'plan.gratisNombre': 'Gratis',
    'plan.proNombre': 'Pro',
    'plan.ultraNombre': 'Ultra',
    'plan.mensual': '/mes',
    'plan.masPopular': 'Más popular',
    'plan.actual': 'Plan actual',
    'plan.elegir': 'Elegir plan',
    'plan.elegirAviso': 'Has elegido el plan <strong>{plan}</strong>.<br><br>El pago online estará disponible próximamente. Mientras tanto puedes seguir usando Fenix IA gratis.',
    'plan.gratisF1': '3 mensajes gratis sin iniciar sesión',
    'plan.gratisF2': 'Todos los modelos de IA',
    'plan.gratisF3': 'Historial local en el navegador',
    'plan.proF1': 'Mensajes ilimitados',
    'plan.proF2': 'Todos los modelos de IA',
    'plan.proF3': 'Historial ilimitado guardado',
    'plan.proF4': 'Soporte prioritario',
    'plan.ultraF1': 'Todo lo de Pro',
    'plan.ultraF2': 'Respuestas más rápidas',
    'plan.ultraF3': 'Proyectos y biblioteca ilimitados',
    'plan.ultraF4': 'Nuevas funciones antes que nadie',
    'modelo.auto': 'Auto',
    'apps.tituloInstalar': 'Instala la app',
    'apps.textoInstalar': 'Fenix IA funciona como una app instalable. Ábrela desde la pantalla de inicio como una app normal, sin perder tu historial.',
    'apps.instalarAhora': 'Instalar ahora',
    'apps.tituloObtener': 'Obtener la app',
    'apps.textoObtener': 'Fenix IA está disponible como app instalable (PWA) en móvil y escritorio.<br><br>En <strong>Android</strong>: menú ⋮ → "Agregar a pantalla de inicio".<br>En <strong>iPhone</strong>: botón Compartir → "Agregar a pantalla de inicio".',
    'apps.entendido': 'Entendido',
    'info.titulo': 'Acerca de Fenix IA',
    'info.texto': 'Fenix IA es tu asistente personal con los mejores modelos de IA: <strong>Fenix 2.0</strong>, <strong>Gemini</strong> y <strong>DeepSeek</strong>.<br><br>Creado por Joshua Blandon Gonzales. Versión 1.0.',
    'ayuda.pregunta': '¿Cómo funciona Fenix IA? Dame una guía rápida de lo que puedo hacer.'
  },
  en: {
    'nav.nuevoChat': 'New chat',
    'nav.buscar': 'Search',
    'nav.proyectos': 'Projects',
    'nav.biblioteca': 'Library',
    'nav.instalar': 'Install app',
    'nav.recientes': 'Recent',
    'buscar.placeholder': 'Search history...',
    'usuario.invitado': 'Guest',
    'usuario.cuenta': 'Account',
    'usuario.configuracion': 'Settings',
    'usuario.idioma': 'Language',
    'usuario.ayuda': 'Get help',
    'usuario.mejorarPlan': 'Upgrade plan',
    'usuario.aplicaciones': 'Get apps and extensions',
    'usuario.info': 'More information',
    'usuario.cerrarSesion': 'Log out',
    'usuario.iniciarGoogle': 'Sign in with Google',
    'input.placeholder': "Whenever you're ready...",
    'pill.documentos': 'Documents',
    'pill.hojas': 'Sheets',
    'pill.presentaciones': 'Presentations',
    'pill.imagenes': 'Images',
    'pill.escritura': 'Writing',
    'pill.resumen': 'Summary',
    'pill.sitios': 'Sites',
    'pill.docsPrompt': 'Help me create a document about: ',
    'pill.hojasPrompt': 'Help me create a spreadsheet for: ',
    'pill.presentacionesPrompt': 'Help me create a presentation about: ',
    'pill.imagenesPrompt': 'Generate an image of: ',
    'imagen.generando': 'Generating image…',
    'imagen.error': '⚠️ Could not generate the image. Please try again.',
    'chat.imagenLista': 'Here is your image:',
    'doc.generando': 'Creating document…',
    'doc.descargar': 'Download document',
    'doc.ver': 'View document',
    'doc.imagenes': 'Generating image {n} of {total}…',
    'pill.escrituraPrompt': 'Help me write: ',
    'pill.resumenPrompt': 'Give me a summary of: ',
    'pill.sitiosPrompt': 'Search for information about: ',
    'proyectos.titulo': 'Projects',
    'proyectos.nuevo': '+ New project',
    'proyectos.crearNuevo': '+ Create new project',
    'proyectos.nombrePrompt': 'Name of the new project:',
    'proyectos.vacio': "You don't have any projects yet. Create one to group your chats.",
    'proyectos.vacioChats': "This project has no chats yet. Create a new one here.",
    'proyectos.nuevoChatAqui': '+ New chat here',
    'proyectos.volver': '← Projects',
    'proyectos.eliminarConfirm': 'Delete this project? Its chats will stay in Recent.',
    'biblioteca.titulo': 'Library',
    'biblioteca.subir': '+ Upload file',
    'biblioteca.vacio': "You haven't uploaded any files yet. Use the \"+ Upload file\" button.",
    'nav.memoria': 'Memory',
    'memoria.titulo': 'Memory',
    'memoria.agregar': '+ Add memory',
    'memoria.desc': 'Fenix remembers information about you and the topics that matter to you to personalize your answers. You can review, delete or add memories by hand.',
    'memoria.vacia': 'No memories saved yet. Chat for a while and Fenix will start remembering your data and important topics.',
    'memoria.queRecordar': 'What should I remember?',
    'memoria.placeholder': 'E.g.: "My name is Sara and I work as an architect"',
    'memoria.categoria': 'Category',
    'memoria.catPersonal': 'Personal',
    'memoria.catPreferencia': 'Preferences',
    'memoria.catProyecto': 'Projects',
    'memoria.catTecnico': 'Technical',
    'memoria.catTemas': 'Important topics',
    'memoria.guardar': 'Save',
    'memoria.cancelar': 'Cancel',
    'memoria.eliminar': 'Delete',
    'memoria.eliminarConfirm': 'Delete this memory?',
    'memoria.guardada': 'Memory saved',
    'memoria.requiereSesion': 'Sign in to save and view your memories.',
    'chat.recordar': 'Remember this',
    'chat.escribiendo': 'Typing...',
    'chat.sinTitulo': 'Untitled',
    'chat.eliminarConfirm': 'Delete this chat?',
    'chat.renombrarPrompt': 'New name for the chat:',
    'chat.destacar': 'Pin',
    'chat.quitarDestacado': 'Unpin',
    'chat.renombrar': 'Rename',
    'chat.anadirProyecto': 'Add to project',
    'chat.eliminar': 'Delete',
    'config.apariencia': 'Appearance',
    'config.tema': 'Theme',
    'config.temaDesc': 'Switch between light and dark theme',
    'config.claro': 'Light',
    'config.oscuro': 'Dark',
    'config.modeloIA': 'AI model',
    'config.modeloPredeterminado': 'Default model',
    'config.modeloDesc': 'Choose which AI model to use for conversations',
    'config.asistente': 'Assistant',
    'config.instruccion': 'System instruction',
    'config.instruccionDesc': 'Set the base behavior of the AI in all conversations',
    'config.instruccionPlaceholder': 'You are a helpful and friendly assistant...',
    'config.idioma': 'Language',
    'config.idiomaDesc': 'Language in which the AI will respond',
    'config.datos': 'Data and Privacy',
    'config.guardarHistorial': 'Save history',
    'config.guardarHistorialDesc': 'Save your conversations locally in the browser',
    'config.borrarChats': 'Clear all chats',
    'config.borrarChatsDesc': 'Delete all saved conversation history',
    'config.borrarDatos': 'Clear data',
    'config.confirmarBorrado': 'Are you sure? All chats, projects and saved files will be deleted.',
    'config.volver': '← Back',
    'config.aceptar': 'Accept',
    'config.idiomaSubtitle': 'Select the language in which the AI will respond',
    'modal.limiteTitulo': 'Message limit reached',
    'modal.limiteTexto': "You've used your <strong>3 free messages</strong> without signing in. Sign in with Google to keep chatting without limits.",
    'modal.ahoraNo': 'Not now',
    'modal.limiteAlcanzado': 'You have reached the limit of {n} messages without signing in. Sign in with Google to keep chatting.',
    'error.noConexion': '⚠️ Could not connect to the backend. Make sure it is running at {url}',
    'error.servidor': 'A server error occurred.',
    'error.sinMicrofono': 'Your browser does not support voice recognition. Try Chrome.',
    'error.audio': 'Could not capture audio. Try again.',
    'voz.titulo': 'Live voice',
    'voz.conectando': 'Connecting...',
    'voz.escuchando': "I'm listening, speak...",
    'voz.procesando': 'Processing...',
    'voz.iaHablando': 'AI is speaking',
    'voz.desconectado': 'Disconnected',
    'voz.error': 'Voice error',
    'voz.terminar': 'End',
    'voz.sugerencia': 'Tap the red button to end.',
    'error.historialEliminado': 'History deleted.',
    'instalar.ios': 'To install Fenix on iPhone:\n\n1. Tap the Share button (square with up arrow)\n2. Tap "Add to Home Screen"\n3. Tap "Add"',
    'instalar.otro': 'To install Fenix:\n\nOpen the ⋮ menu in your browser and tap "Install app" or "Add to Home Screen".',
    'cuenta.titulo': 'My account',
    'cuenta.conSesion': 'With an active session you have unlimited conversations.',
    'cuenta.sinSesion': "You're not signed in yet.<br><br>Sign in with Google to save your account and chat without limits.",
    'cuenta.cerrarSesion': 'Log out',
    'cuenta.listо': 'Done',
    'plan.titulo': 'Upgrade plan',
    'plan.texto': 'Fenix IA runs on powerful AI models.<br><br>You can currently chat for free with a limit of <strong>3 messages</strong> without signing in. Signing in with Google unlocks <strong>unlimited</strong> conversations.',
    'plan.subtitulo': 'Choose the plan that fits you best',
    'plan.gratisNombre': 'Free',
    'plan.proNombre': 'Pro',
    'plan.ultraNombre': 'Ultra',
    'plan.mensual': '/month',
    'plan.masPopular': 'Most popular',
    'plan.actual': 'Current plan',
    'plan.elegir': 'Choose plan',
    'plan.elegirAviso': 'You chose the <strong>{plan}</strong> plan.<br><br>Online payment will be available soon. In the meantime you can keep using Fenix IA for free.',
    'plan.gratisF1': '3 free messages without signing in',
    'plan.gratisF2': 'All AI models',
    'plan.gratisF3': 'Local history in your browser',
    'plan.proF1': 'Unlimited messages',
    'plan.proF2': 'All AI models',
    'plan.proF3': 'Unlimited saved history',
    'plan.proF4': 'Priority support',
    'plan.ultraF1': 'Everything in Pro',
    'plan.ultraF2': 'Faster responses',
    'plan.ultraF3': 'Unlimited projects and library',
    'plan.ultraF4': 'New features before everyone',
    'modelo.auto': 'Auto',
    'apps.tituloInstalar': 'Install the app',
    'apps.textoInstalar': 'Fenix IA works as an installable app. Open it from your home screen like a normal app, without losing your history.',
    'apps.instalarAhora': 'Install now',
    'apps.tituloObtener': 'Get the app',
    'apps.textoObtener': 'Fenix IA is available as an installable app (PWA) on mobile and desktop.<br><br>On <strong>Android</strong>: ⋮ menu → "Add to Home Screen".<br>On <strong>iPhone</strong>: Share button → "Add to Home Screen".',
    'apps.entendido': 'Got it',
    'info.titulo': 'About Fenix IA',
    'info.texto': 'Fenix IA is your personal assistant with the best AI models: <strong>Fenix 2.0</strong>, <strong>Gemini</strong> and <strong>DeepSeek</strong>.<br><br>Created by Joshua Blandon Gonzales. Version 1.0.',
    'ayuda.pregunta': 'How does Fenix IA work? Give me a quick guide of what I can do.'
  },
  pt: {
    'nav.nuevoChat': 'Novo chat',
    'nav.buscar': 'Buscar',
    'nav.proyectos': 'Projetos',
    'nav.biblioteca': 'Biblioteca',
    'nav.instalar': 'Instalar app',
    'nav.recientes': 'Recentes',
    'buscar.placeholder': 'Buscar no histórico...',
    'usuario.invitado': 'Convidado',
    'usuario.cuenta': 'Conta',
    'usuario.configuracion': 'Configurações',
    'usuario.idioma': 'Idioma',
    'usuario.ayuda': 'Obter ajuda',
    'usuario.mejorarPlan': 'Melhorar plano',
    'usuario.aplicaciones': 'Obter apps e extensões',
    'usuario.info': 'Mais informações',
    'usuario.cerrarSesion': 'Sair',
    'usuario.iniciarGoogle': 'Entrar com o Google',
    'input.placeholder': 'Quando quiser...',
    'pill.documentos': 'Documentos',
    'pill.hojas': 'Planilhas',
    'pill.presentaciones': 'Apresentações',
    'pill.imagenes': 'Imagens',
    'pill.escritura': 'Escrita',
    'pill.resumen': 'Resumo',
    'pill.sitios': 'Sites',
    'pill.docsPrompt': 'Ajude-me a criar um documento sobre: ',
    'pill.hojasPrompt': 'Ajude-me a criar uma planilha para: ',
    'pill.presentacionesPrompt': 'Ajude-me a criar uma apresentação sobre: ',
    'pill.imagenesPrompt': 'Gere uma imagem de: ',
    'imagen.generando': 'Gerando imagem…',
    'imagen.error': '⚠️ Não foi possível gerar a imagem. Tente novamente.',
    'chat.imagenLista': 'Aqui está a sua imagem:',
    'doc.generando': 'Criando documento…',
    'doc.descargar': 'Baixar documento',
    'doc.ver': 'Ver documento',
    'doc.imagenes': 'Gerando imagem {n} de {total}…',
    'pill.escrituraPrompt': 'Ajude-me a escrever: ',
    'pill.resumenPrompt': 'Faça um resumo de: ',
    'pill.sitiosPrompt': 'Pesquise informações sobre: ',
    'proyectos.titulo': 'Projetos',
    'proyectos.nuevo': '+ Novo projeto',
    'proyectos.crearNuevo': '+ Criar novo projeto',
    'proyectos.nombrePrompt': 'Nome do novo projeto:',
    'proyectos.vacio': 'Você ainda não tem projetos. Crie um para agrupar seus chats.',
    'proyectos.vacioChats': 'Este projeto ainda não tem chats. Crie um novo aqui.',
    'proyectos.nuevoChatAqui': '+ Novo chat aqui',
    'proyectos.volver': '← Projetos',
    'proyectos.eliminarConfirm': 'Excluir este projeto? Os chats que ele tinha ficarão soltos em Recentes.',
    'biblioteca.titulo': 'Biblioteca',
    'biblioteca.subir': '+ Enviar arquivo',
    'biblioteca.vacio': 'Você ainda não enviou arquivos. Use o botão "+ Enviar arquivo".',
    'nav.memoria': 'Memória',
    'memoria.titulo': 'Memória',
    'memoria.agregar': '+ Adicionar memória',
    'memoria.desc': 'A Fenix lembra informações sobre você e os temas que lhe importam para personalizar as respostas. Você pode revisar, apagar ou adicionar memórias manualmente.',
    'memoria.vacia': 'Ainda não há memórias salvas. Converse um pouco e a Fenix começará a lembrar seus dados e temas importantes.',
    'memoria.queRecordar': 'O que devo lembrar?',
    'memoria.placeholder': 'Ex.: "Meu nome é Sara e trabalho como arquiteta"',
    'memoria.categoria': 'Categoria',
    'memoria.catPersonal': 'Pessoal',
    'memoria.catPreferencia': 'Preferências',
    'memoria.catProyecto': 'Projetos',
    'memoria.catTecnico': 'Técnico',
    'memoria.catTemas': 'Temas importantes',
    'memoria.guardar': 'Salvar',
    'memoria.cancelar': 'Cancelar',
    'memoria.eliminar': 'Excluir',
    'memoria.eliminarConfirm': 'Excluir esta memória?',
    'memoria.guardada': 'Memória salva',
    'memoria.requiereSesion': 'Entre na sua conta para salvar e ver suas memórias.',
    'chat.recordar': 'Lembrar disso',
    'chat.escribiendo': 'Escrevendo...',
    'chat.sinTitulo': 'Sem título',
    'chat.eliminarConfirm': 'Excluir este chat?',
    'chat.renombrarPrompt': 'Novo nome para o chat:',
    'chat.destacar': 'Fixar',
    'chat.quitarDestacado': 'Desafixar',
    'chat.renombrar': 'Renomear',
    'chat.anadirProyecto': 'Adicionar ao projeto',
    'chat.eliminar': 'Excluir',
    'config.apariencia': 'Aparência',
    'config.tema': 'Tema',
    'config.temaDesc': 'Alterne entre o tema claro e escuro',
    'config.claro': 'Claro',
    'config.oscuro': 'Escuro',
    'config.modeloIA': 'Modelo de IA',
    'config.modeloPredeterminado': 'Modelo padrão',
    'config.modeloDesc': 'Selecione qual modelo de IA usar nas conversas',
    'config.asistente': 'Assistente',
    'config.instruccion': 'Instrução do sistema',
    'config.instruccionDesc': 'Define o comportamento base da IA em todas as conversas',
    'config.instruccionPlaceholder': 'Você é um assistente útil e amigável...',
    'config.idioma': 'Idioma',
    'config.idiomaDesc': 'Idioma em que a IA responderá',
    'config.datos': 'Dados e Privacidade',
    'config.guardarHistorial': 'Salvar histórico',
    'config.guardarHistorialDesc': 'Salva suas conversas localmente no navegador',
    'config.borrarChats': 'Apagar todos os chats',
    'config.borrarChatsDesc': 'Exclui todo o histórico de conversas salvo',
    'config.borrarDatos': 'Apagar dados',
    'config.confirmarBorrado': 'Tem certeza? Todos os chats, projetos e arquivos salvos serão excluídos.',
    'config.volver': '← Voltar',
    'config.aceptar': 'Aceitar',
    'config.idiomaSubtitle': 'Selecione o idioma em que a IA responderá',
    'modal.limiteTitulo': 'Limite de mensagens atingido',
    'modal.limiteTexto': 'Você usou suas <strong>3 mensagens gratuitas</strong> sem entrar. Entre com o Google para continuar sem limites.',
    'modal.ahoraNo': 'Agora não',
    'modal.limiteAlcanzado': 'Você atingiu o limite de {n} mensagens sem entrar. Entre com o Google para continuar.',
    'error.noConexion': '⚠️ Não foi possível conectar ao backend. Verifique se ele está em {url}',
    'error.servidor': 'Ocorreu um erro no servidor.',
    'error.sinMicrofono': 'Seu navegador não suporta reconhecimento de voz. Tente no Chrome.',
    'error.audio': 'Não foi possível captar o áudio. Tente novamente.',
    'voz.titulo': 'Voz ao vivo',
    'voz.conectando': 'Conectando...',
    'voz.escuchando': 'Estou ouvindo, fale...',
    'voz.procesando': 'Processando...',
    'voz.iaHablando': 'A IA está falando',
    'voz.desconectado': 'Desconectado',
    'voz.error': 'Erro de voz',
    'voz.terminar': 'Encerrar',
    'voz.sugerencia': 'Toque no botão vermelho para encerrar.',
    'error.historialEliminado': 'Histórico excluído.',
    'instalar.ios': 'Para instalar o Fenix no iPhone:\n\n1. Toque no botão Compartilhar (quadrado com seta para cima)\n2. Toque em "Adicionar à Tela de Início"\n3. Toque em "Adicionar"',
    'instalar.otro': 'Para instalar o Fenix:\n\nAbra o menu ⋮ do navegador e toque em "Instalar app" ou "Adicionar à Tela de Início".',
    'cuenta.titulo': 'Minha conta',
    'cuenta.conSesion': 'Com a sessão iniciada você tem conversas ilimitadas.',
    'cuenta.sinSesion': 'Você ainda não entrou.<br><br>Entre com o Google para salvar sua conta e conversar sem limites.',
    'cuenta.cerrarSesion': 'Sair',
    'cuenta.listo': 'Pronto',
    'plan.titulo': 'Melhorar plano',
    'plan.texto': 'O Fenix IA usa modelos de IA potentes.<br><br>Atualmente você pode conversar de graça com limite de <strong>3 mensagens</strong> sem entrar. Ao entrar com o Google você desbloqueia conversas <strong>ilimitadas</strong>.',
    'plan.subtitulo': 'Escolha o plano que melhor se adapta a você',
    'plan.gratisNombre': 'Grátis',
    'plan.proNombre': 'Pro',
    'plan.ultraNombre': 'Ultra',
    'plan.mensual': '/mês',
    'plan.masPopular': 'Mais popular',
    'plan.actual': 'Plano atual',
    'plan.elegir': 'Escolher plano',
    'plan.elegirAviso': 'Você escolheu o plano <strong>{plan}</strong>.<br><br>O pagamento online estará disponível em breve. Enquanto isso, você pode continuar usando o Fenix IA de graça.',
    'plan.gratisF1': '3 mensagens grátis sem entrar',
    'plan.gratisF2': 'Todos os modelos de IA',
    'plan.gratisF3': 'Histórico local no navegador',
    'plan.proF1': 'Mensagens ilimitadas',
    'plan.proF2': 'Todos os modelos de IA',
    'plan.proF3': 'Histórico ilimitado salvo',
    'plan.proF4': 'Suporte prioritário',
    'plan.ultraF1': 'Tudo do Pro',
    'plan.ultraF2': 'Respostas mais rápidas',
    'plan.ultraF3': 'Projetos e biblioteca ilimitados',
    'plan.ultraF4': 'Novas funções antes de todos',
    'modelo.auto': 'Auto',
    'apps.tituloInstalar': 'Instalar o app',
    'apps.textoInstalar': 'O Fenix IA funciona como um app instalável. Abra pela tela inicial como um app normal, sem perder seu histórico.',
    'apps.instalarAhora': 'Instalar agora',
    'apps.tituloObtener': 'Obter o app',
    'apps.textoObtener': 'O Fenix IA está disponível como app instalável (PWA) em celular e computador.<br><br>No <strong>Android</strong>: menu ⋮ → "Adicionar à Tela de Início".<br>No <strong>iPhone</strong>: botão Compartilhar → "Adicionar à Tela de Início".',
    'apps.entendido': 'Entendi',
    'info.titulo': 'Sobre o Fenix IA',
    'info.texto': 'O Fenix IA é seu assistente pessoal com os melhores modelos de IA: <strong>Fenix 2.0</strong>, <strong>Gemini</strong> e <strong>DeepSeek</strong>.<br><br>Criado por Joshua Blandon Gonzales. Versão 1.0.',
    'ayuda.pregunta': 'Como funciona o Fenix IA? Me dê um guia rápido do que posso fazer.'
  },
  fr: {
    'nav.nuevoChat': 'Nouveau chat',
    'nav.buscar': 'Rechercher',
    'nav.proyectos': 'Projets',
    'nav.biblioteca': 'Bibliothèque',
    'nav.instalar': "Installer l'app",
    'nav.recientes': 'Récents',
    'buscar.placeholder': "Rechercher dans l'historique...",
    'usuario.invitado': 'Invité',
    'usuario.cuenta': 'Compte',
    'usuario.configuracion': 'Paramètres',
    'usuario.idioma': 'Langue',
    'usuario.ayuda': "Obtenir de l'aide",
    'usuario.mejorarPlan': "Améliorer le plan",
    'usuario.aplicaciones': 'Obtenir des apps et extensions',
    'usuario.info': "Plus d'informations",
    'usuario.cerrarSesion': 'Se déconnecter',
    'usuario.iniciarGoogle': 'Se connecter avec Google',
    'input.placeholder': 'Quand tu veux...',
    'pill.documentos': 'Documents',
    'pill.hojas': 'Feuilles',
    'pill.presentaciones': 'Présentations',
    'pill.imagenes': 'Images',
    'pill.escritura': 'Écriture',
    'pill.resumen': 'Résumé',
    'pill.sitios': 'Sites',
    'pill.docsPrompt': "Aide-moi à créer un document sur : ",
    'pill.hojasPrompt': "Aide-moi à créer une feuille de calcul pour : ",
    'pill.presentacionesPrompt': "Aide-moi à créer une présentation sur : ",
    'pill.imagenesPrompt': 'Génère une image de : ',
    'imagen.generando': 'Génération de l\'image…',
    'imagen.error': '⚠️ Impossible de générer l\'image. Veuillez réessayer.',
    'chat.imagenLista': 'Voici votre image :',
    'doc.generando': 'Création du document…',
    'doc.descargar': 'Télécharger le document',
    'doc.ver': 'Voir le document',
    'doc.imagenes': 'Génération de l\'image {n} sur {total}…',
    'pill.escrituraPrompt': "Aide-moi à écrire : ",
    'pill.resumenPrompt': 'Fais-moi un résumé de : ',
    'pill.sitiosPrompt': "Cherche-moi des informations sur : ",
    'proyectos.titulo': 'Projets',
    'proyectos.nuevo': '+ Nouveau projet',
    'proyectos.crearNuevo': '+ Créer un nouveau projet',
    'proyectos.nombrePrompt': 'Nom du nouveau projet :',
    'proyectos.vacio': "Vous n'avez pas encore de projets. Créez-en un pour regrouper vos chats.",
    'proyectos.vacioChats': "Ce projet n'a pas encore de chats. Créez-en un ici.",
    'proyectos.nuevoChatAqui': '+ Nouveau chat ici',
    'proyectos.volver': '← Projets',
    'proyectos.eliminarConfirm': "Supprimer ce projet ? Les chats qu'il contenait resteront dans Récents.",
    'biblioteca.titulo': 'Bibliothèque',
    'biblioteca.subir': '+ Envoyer un fichier',
    'biblioteca.vacio': "Vous n'avez pas encore envoyé de fichiers. Utilisez le bouton \"+ Envoyer un fichier\".",
    'nav.memoria': 'Mémoire',
    'memoria.titulo': 'Mémoire',
    'memoria.agregar': '+ Ajouter un souvenir',
    'memoria.desc': 'Fenix se souvient d\'informations sur vous et des sujets qui vous tiennent à cœur pour personnaliser ses réponses. Vous pouvez les consulter, les supprimer ou les ajouter à la main.',
    'memoria.vacia': 'Aucun souvenir enregistré pour l\'instant. Discutez un moment et Fenix commencera à se souvenir de vos données et sujets importants.',
    'memoria.queRecordar': 'Que dois-je retenir ?',
    'memoria.placeholder': 'Ex. : "Je m\'appelle Sara et je suis architecte"',
    'memoria.categoria': 'Catégorie',
    'memoria.catPersonal': 'Personnel',
    'memoria.catPreferencia': 'Préférences',
    'memoria.catProyecto': 'Projets',
    'memoria.catTecnico': 'Technique',
    'memoria.catTemas': 'Sujets importants',
    'memoria.guardar': 'Enregistrer',
    'memoria.cancelar': 'Annuler',
    'memoria.eliminar': 'Supprimer',
    'memoria.eliminarConfirm': 'Supprimer ce souvenir ?',
    'memoria.guardada': 'Souvenir enregistré',
    'memoria.requiereSesion': 'Connectez-vous pour enregistrer et voir vos souvenirs.',
    'chat.recordar': 'Retenir ceci',
    'chat.escribiendo': 'Écrit...',
    'chat.sinTitulo': 'Sans titre',
    'chat.eliminarConfirm': 'Supprimer ce chat ?',
    'chat.renombrarPrompt': 'Nouveau nom pour le chat :',
    'chat.destacar': 'Épingler',
    'chat.quitarDestacado': "Désépingler",
    'chat.renombrar': 'Renommer',
    'chat.anadirProyecto': 'Ajouter au projet',
    'chat.eliminar': 'Supprimer',
    'config.apariencia': 'Apparence',
    'config.tema': 'Thème',
    'config.temaDesc': 'Basculez entre le thème clair et sombre',
    'config.claro': 'Clair',
    'config.oscuro': 'Sombre',
    'config.modeloIA': 'Modèle IA',
    'config.modeloPredeterminado': 'Modèle par défaut',
    'config.modeloDesc': 'Choisissez le modèle IA à utiliser pour les conversations',
    'config.asistente': 'Assistant',
    'config.instruccion': 'Instruction système',
    'config.instruccionDesc': "Définit le comportement de base de l'IA dans toutes les conversations",
    'config.instruccionPlaceholder': 'Vous êtes un assistant utile et amical...',
    'config.idioma': 'Langue',
    'config.idiomaDesc': "Langue dans laquelle l'IA répondra",
    'config.datos': 'Données et confidentialité',
    'config.guardarHistorial': "Sauvegarder l'historique",
    'config.guardarHistorialDesc': 'Enregistre vos conversations localement dans le navigateur',
    'config.borrarChats': 'Effacer tous les chats',
    'config.borrarChatsDesc': "Supprime tout l'historique de conversations enregistré",
    'config.borrarDatos': 'Effacer les données',
    'config.confirmarBorrado': 'Êtes-vous sûr ? Tous les chats, projets et fichiers enregistrés seront supprimés.',
    'config.volver': '← Retour',
    'config.aceptar': 'Accepter',
    'config.idiomaSubtitle': "Choisissez la langue dans laquelle l'IA répondra",
    'modal.limiteTitulo': 'Limite de messages atteinte',
    'modal.limiteTexto': "Vous avez utilisé vos <strong>3 messages gratuits</strong> sans vous connecter. Connectez-vous avec Google pour continuer sans limites.",
    'modal.ahoraNo': 'Pas maintenant',
    'modal.limiteAlcanzado': 'Vous avez atteint la limite de {n} messages sans vous connecter. Connectez-vous avec Google pour continuer.',
    'error.noConexion': '⚠️ Impossible de se connecter au backend. Vérifiez qu\'il tourne sur {url}',
    'error.servidor': 'Une erreur serveur est survenue.',
    'error.sinMicrofono': 'Votre navigateur ne prend pas en charge la reconnaissance vocale. Essayez Chrome.',
    'error.audio': "Impossible de capturer l'audio. Réessayez.",
    'voz.titulo': 'Voix en direct',
    'voz.conectando': 'Connexion...',
    'voz.escuchando': "Je t'écoute, parle...",
    'voz.procesando': 'Traitement...',
    'voz.iaHablando': "L'IA parle",
    'voz.desconectado': 'Déconnecté',
    'voz.error': 'Erreur vocale',
    'voz.terminar': 'Terminer',
    'voz.sugerencia': 'Touchez le bouton rouge pour terminer.',
    'error.historialEliminado': 'Historique supprimé.',
    'instalar.ios': "Pour installer Fenix sur iPhone :\n\n1. Touchez le bouton Partager (carré avec flèche vers le haut)\n2. Touchez \"Ajouter à l'écran d'accueil\"\n3. Touchez \"Ajouter\"",
    'instalar.otro': 'Pour installer Fenix :\n\nOuvrez le menu ⋮ du navigateur et touchez "Installer l\'app" ou "Ajouter à l\'écran d\'accueil".',
    'cuenta.titulo': 'Mon compte',
    'cuenta.conSesion': 'Avec une session active, vous avez des conversations illimitées.',
    'cuenta.sinSesion': "Vous n'êtes pas encore connecté.<br><br>Connectez-vous avec Google pour enregistrer votre compte et discuter sans limites.",
    'cuenta.cerrarSesion': 'Se déconnecter',
    'cuenta.listo': 'Terminé',
    'plan.titulo': 'Améliorer le plan',
    'plan.texto': 'Fenix IA fonctionne avec des modèles d\'IA puissants.<br><br>Vous pouvez actuellement discuter gratuitement avec une limite de <strong>3 messages</strong> sans vous connecter. En vous connectant avec Google, vous débloquez des conversations <strong>illimitées</strong>.',
    'plan.subtitulo': 'Choisissez le plan qui vous convient le mieux',
    'plan.gratisNombre': 'Gratuit',
    'plan.proNombre': 'Pro',
    'plan.ultraNombre': 'Ultra',
    'plan.mensual': '/mois',
    'plan.masPopular': 'Le plus populaire',
    'plan.actual': 'Plan actuel',
    'plan.elegir': 'Choisir le plan',
    'plan.elegirAviso': 'Vous avez choisi le plan <strong>{plan}</strong>.<br><br>Le paiement en ligne sera bientôt disponible. En attendant, vous pouvez continuer à utiliser Fenix IA gratuitement.',
    'plan.gratisF1': '3 messages gratuits sans connexion',
    'plan.gratisF2': 'Tous les modèles d\'IA',
    'plan.gratisF3': 'Historique local dans le navigateur',
    'plan.proF1': 'Messages illimités',
    'plan.proF2': 'Tous les modèles d\'IA',
    'plan.proF3': 'Historique illimité enregistré',
    'plan.proF4': 'Support prioritaire',
    'plan.ultraF1': 'Tout ce qui est dans Pro',
    'plan.ultraF2': 'Réponses plus rapides',
    'plan.ultraF3': 'Projets et bibliothèque illimités',
    'plan.ultraF4': 'Nouvelles fonctionnalités en avant-première',
    'modelo.auto': 'Auto',
    'apps.tituloInstalar': "Installer l'app",
    'apps.textoInstalar': 'Fenix IA fonctionne comme une app installable. Ouvrez-la depuis votre écran d\'accueil comme une app normale, sans perdre votre historique.',
    'apps.instalarAhora': 'Installer maintenant',
    'apps.tituloObtener': "Obtenir l'app",
    'apps.textoObtener': 'Fenix IA est disponible en tant qu\'app installable (PWA) sur mobile et ordinateur.<br><br>Sur <strong>Android</strong> : menu ⋮ → "Ajouter à l\'écran d\'accueil".<br>Sur <strong>iPhone</strong> : bouton Partager → "Ajouter à l\'écran d\'accueil".',
    'apps.entendido': 'Compris',
    'info.titulo': 'À propos de Fenix IA',
    'info.texto': 'Fenix IA est votre assistant personnel avec les meilleurs modèles d\'IA : <strong>Fenix 2.0</strong>, <strong>Gemini</strong> et <strong>DeepSeek</strong>.<br><br>Créé par Joshua Blandon Gonzales. Version 1.0.',
    'ayuda.pregunta': 'Comment fonctionne Fenix IA ? Donnez-moi un guide rapide de ce que je peux faire.'
  },
  de: {
    'nav.nuevoChat': 'Neuer Chat',
    'nav.buscar': 'Suchen',
    'nav.proyectos': 'Projekte',
    'nav.biblioteca': 'Bibliothek',
    'nav.instalar': 'App installieren',
    'nav.recientes': 'Zuletzt',
    'buscar.placeholder': 'Verlauf durchsuchen...',
    'usuario.invitado': 'Gast',
    'usuario.cuenta': 'Konto',
    'usuario.configuracion': 'Einstellungen',
    'usuario.idioma': 'Sprache',
    'usuario.ayuda': 'Hilfe erhalten',
    'usuario.mejorarPlan': 'Plan verbessern',
    'usuario.aplicaciones': 'Apps und Erweiterungen',
    'usuario.info': 'Mehr Informationen',
    'usuario.cerrarSesion': 'Abmelden',
    'usuario.iniciarGoogle': 'Mit Google anmelden',
    'input.placeholder': 'Wann immer du bereit bist...',
    'pill.documentos': 'Dokumente',
    'pill.hojas': 'Tabellen',
    'pill.presentaciones': 'Präsentationen',
    'pill.imagenes': 'Bilder',
    'pill.escritura': 'Schreiben',
    'pill.resumen': 'Zusammenfassung',
    'pill.sitios': 'Websites',
    'pill.docsPrompt': 'Hilf mir, ein Dokument zu erstellen über: ',
    'pill.hojasPrompt': 'Hilf mir, eine Tabelle zu erstellen für: ',
    'pill.presentacionesPrompt': 'Hilf mir, eine Präsentation zu erstellen über: ',
    'pill.imagenesPrompt': 'Erzeuge ein Bild von: ',
    'imagen.generando': 'Bild wird erstellt…',
    'imagen.error': '⚠️ Das Bild konnte nicht erstellt werden. Bitte versuche es erneut.',
    'chat.imagenLista': 'Hier ist dein Bild:',
    'doc.generando': 'Dokument wird erstellt…',
    'doc.descargar': 'Dokument herunterladen',
    'doc.ver': 'Dokument ansehen',
    'doc.imagenes': 'Bild {n} von {total} wird erstellt…',
    'pill.escrituraPrompt': 'Hilf mir zu schreiben: ',
    'pill.resumenPrompt': 'Fass mir zusammen: ',
    'pill.sitiosPrompt': 'Suche nach Informationen über: ',
    'proyectos.titulo': 'Projekte',
    'proyectos.nuevo': '+ Neues Projekt',
    'proyectos.crearNuevo': '+ Neues Projekt erstellen',
    'proyectos.nombrePrompt': 'Name des neuen Projekts:',
    'proyectos.vacio': 'Du hast noch keine Projekte. Erstelle eines, um deine Chats zu gruppieren.',
    'proyectos.vacioChats': 'Dieses Projekt hat noch keine Chats. Erstelle hier einen neuen.',
    'proyectos.nuevoChatAqui': '+ Neuer Chat hier',
    'proyectos.volver': '← Projekte',
    'proyectos.eliminarConfirm': 'Dieses Projekt löschen? Die enthaltenen Chats bleiben in Zuletzt.',
    'biblioteca.titulo': 'Bibliothek',
    'biblioteca.subir': '+ Datei hochladen',
    'biblioteca.vacio': 'Du hast noch keine Dateien hochgeladen. Verwende die Schaltfläche "+ Datei hochladen".',
    'nav.memoria': 'Erinnerung',
    'memoria.titulo': 'Erinnerung',
    'memoria.agregar': '+ Erinnerung hinzufügen',
    'memoria.desc': 'Fenix merkt sich Informationen über dich und die Themen, die dir wichtig sind, um Antworten zu personalisieren. Du kannst sie ansehen, löschen oder von Hand hinzufügen.',
    'memoria.vacia': 'Noch keine Erinnerungen gespeichert. Unterhalte dich eine Weile und Fenix merkt sich deine Daten und wichtigen Themen.',
    'memoria.queRecordar': 'Woran soll ich mich erinnern?',
    'memoria.placeholder': 'Z. B.: "Ich heiße Sara und arbeite als Architektin"',
    'memoria.categoria': 'Kategorie',
    'memoria.catPersonal': 'Persönlich',
    'memoria.catPreferencia': 'Vorlieben',
    'memoria.catProyecto': 'Projekte',
    'memoria.catTecnico': 'Technisch',
    'memoria.catTemas': 'Wichtige Themen',
    'memoria.guardar': 'Speichern',
    'memoria.cancelar': 'Abbrechen',
    'memoria.eliminar': 'Löschen',
    'memoria.eliminarConfirm': 'Diese Erinnerung löschen?',
    'memoria.guardada': 'Erinnerung gespeichert',
    'memoria.requiereSesion': 'Melde dich an, um Erinnerungen zu speichern und anzusehen.',
    'chat.recordar': 'Merken',
    'chat.escribiendo': 'Schreibt...',
    'chat.sinTitulo': 'Ohne Titel',
    'chat.eliminarConfirm': 'Diesen Chat löschen?',
    'chat.renombrarPrompt': 'Neuer Name für den Chat:',
    'chat.destacar': 'Anheften',
    'chat.quitarDestacado': 'Lösen',
    'chat.renombrar': 'Umbenennen',
    'chat.anadirProyecto': 'Zum Projekt hinzufügen',
    'chat.eliminar': 'Löschen',
    'config.apariencia': 'Darstellung',
    'config.tema': 'Design',
    'config.temaDesc': 'Zwischen hellem und dunklem Design wechseln',
    'config.claro': 'Hell',
    'config.oscuro': 'Dunkel',
    'config.modeloIA': 'KI-Modell',
    'config.modeloPredeterminado': 'Standardmodell',
    'config.modeloDesc': 'Wähle, welches KI-Modell für Gespräche verwendet wird',
    'config.asistente': 'Assistent',
    'config.instruccion': 'Systemanweisung',
    'config.instruccionDesc': 'Legt das Basisverhalten der KI in allen Gesprächen fest',
    'config.instruccionPlaceholder': 'Du bist ein hilfreicher und freundlicher Assistent...',
    'config.idioma': 'Sprache',
    'config.idiomaDesc': 'Sprache, in der die KI antworten wird',
    'config.datos': 'Daten und Datenschutz',
    'config.guardarHistorial': 'Verlauf speichern',
    'config.guardarHistorialDesc': 'Speichert deine Gespräche lokal im Browser',
    'config.borrarChats': 'Alle Chats löschen',
    'config.borrarChatsDesc': 'Löscht den gesamten gespeicherten Gesprächsverlauf',
    'config.borrarDatos': 'Daten löschen',
    'config.confirmarBorrado': 'Bist du sicher? Alle Chats, Projekte und gespeicherten Dateien werden gelöscht.',
    'config.volver': '← Zurück',
    'config.aceptar': 'Übernehmen',
    'config.idiomaSubtitle': 'Wähle die Sprache, in der die KI antworten wird',
    'modal.limiteTitulo': 'Nachrichtenlimit erreicht',
    'modal.limiteTexto': 'Du hast deine <strong>3 kostenlosen Nachrichten</strong> ohne Anmeldung aufgebraucht. Melde dich mit Google an, um ohne Limits weiterzuschreiben.',
    'modal.ahoraNo': 'Jetzt nicht',
    'modal.limiteAlcanzado': 'Du hast das Limit von {n} Nachrichten ohne Anmeldung erreicht. Melde dich mit Google an, um weiterzuschreiben.',
    'error.noConexion': '⚠️ Keine Verbindung zum Backend möglich. Stelle sicher, dass es unter {url} läuft',
    'error.servidor': 'Ein Serverfehler ist aufgetreten.',
    'error.sinMicrofono': 'Dein Browser unterstützt keine Spracherkennung. Versuch Chrome.',
    'error.audio': 'Audio konnte nicht erfasst werden. Versuch es erneut.',
    'voz.titulo': 'Live-Sprache',
    'voz.conectando': 'Verbinde...',
    'voz.escuchando': 'Ich höre zu, sprich...',
    'voz.procesando': 'Verarbeite...',
    'voz.iaHablando': 'KI spricht',
    'voz.desconectado': 'Getrennt',
    'voz.error': 'Sprachfehler',
    'voz.terminar': 'Beenden',
    'voz.sugerencia': 'Tippe auf den roten Button zum Beenden.',
    'error.historialEliminado': 'Verlauf gelöscht.',
    'instalar.ios': 'So installierst du Fenix auf dem iPhone:\n\n1. Tippe auf die Teilen-Schaltfläche (Quadrat mit Pfeil nach oben)\n2. Tippe auf "Zum Home-Bildschirm"\n3. Tippe auf "Hinzufügen"',
    'instalar.otro': 'So installierst du Fenix:\n\nÖffne das ⋮-Menü des Browsers und tippe auf "App installieren" oder "Zum Home-Bildschirm".',
    'cuenta.titulo': 'Mein Konto',
    'cuenta.conSesion': 'Mit aktiver Sitzung hast du unbegrenzte Unterhaltungen.',
    'cuenta.sinSesion': 'Du bist noch nicht angemeldet.<br><br>Melde dich mit Google an, um dein Konto zu speichern und ohne Limits zu chatten.',
    'cuenta.cerrarSesion': 'Abmelden',
    'cuenta.listo': 'Fertig',
    'plan.titulo': 'Plan verbessern',
    'plan.texto': 'Fenix IA läuft mit leistungsstarken KI-Modellen.<br><br>Du kannst derzeit mit einem Limit von <strong>3 Nachrichten</strong> ohne Anmeldung kostenlos chatten. Mit einer Google-Anmeldung schaltest du <strong>unbegrenzte</strong> Gespräche frei.',
    'plan.subtitulo': 'Wähle den Plan, der am besten zu dir passt',
    'plan.gratisNombre': 'Kostenlos',
    'plan.proNombre': 'Pro',
    'plan.ultraNombre': 'Ultra',
    'plan.mensual': '/Monat',
    'plan.masPopular': 'Am beliebtesten',
    'plan.actual': 'Aktueller Plan',
    'plan.elegir': 'Plan wählen',
    'plan.elegirAviso': 'Du hast den <strong>{plan}</strong>-Plan gewählt.<br><br>Die Online-Zahlung ist bald verfügbar. In der Zwischenzeit kannst du Fenix IA weiterhin kostenlos nutzen.',
    'plan.gratisF1': '3 kostenlose Nachrichten ohne Anmeldung',
    'plan.gratisF2': 'Alle KI-Modelle',
    'plan.gratisF3': 'Lokaler Verlauf im Browser',
    'plan.proF1': 'Unbegrenzte Nachrichten',
    'plan.proF2': 'Alle KI-Modelle',
    'plan.proF3': 'Unbegrenzter gespeicherter Verlauf',
    'plan.proF4': 'Priorisierter Support',
    'plan.ultraF1': 'Alles aus Pro',
    'plan.ultraF2': 'Schnellere Antworten',
    'plan.ultraF3': 'Unbegrenzte Projekte und Bibliothek',
    'plan.ultraF4': 'Neue Funktionen zuerst',
    'modelo.auto': 'Auto',
    'apps.tituloInstalar': 'App installieren',
    'apps.textoInstalar': 'Fenix IA funktioniert als installierbare App. Öffne sie vom Startbildschirm wie eine normale App, ohne deinen Verlauf zu verlieren.',
    'apps.instalarAhora': 'Jetzt installieren',
    'apps.tituloObtener': 'App erhalten',
    'apps.textoObtener': 'Fenix IA ist als installierbare App (PWA) auf Mobilgeräten und Desktop verfügbar.<br><br>Auf <strong>Android</strong>: ⋮-Menü → "Zum Home-Bildschirm".<br>Auf <strong>iPhone</strong>: Teilen-Schaltfläche → "Zum Home-Bildschirm".',
    'apps.entendido': 'Verstanden',
    'info.titulo': 'Über Fenix IA',
    'info.texto': 'Fenix IA ist dein persönlicher Assistent mit den besten KI-Modellen: <strong>Fenix 2.0</strong>, <strong>Gemini</strong> und <strong>DeepSeek</strong>.<br><br>Erstellt von Joshua Blandon Gonzales. Version 1.0.',
    'ayuda.pregunta': 'Wie funktioniert Fenix IA? Gib mir eine kurze Anleitung, was ich tun kann.'
  },
  ja: {
    'nav.nuevoChat': '新しいチャット',
    'nav.buscar': '検索',
    'nav.proyectos': 'プロジェクト',
    'nav.biblioteca': 'ライブラリ',
    'nav.instalar': 'アプリをインストール',
    'nav.recientes': '最近',
    'buscar.placeholder': '履歴を検索...',
    'usuario.invitado': 'ゲスト',
    'usuario.cuenta': 'アカウント',
    'usuario.configuracion': '設定',
    'usuario.idioma': '言語',
    'usuario.ayuda': 'ヘルプ',
    'usuario.mejorarPlan': 'プランをアップグレード',
    'usuario.aplicaciones': 'アプリと拡張機能',
    'usuario.info': '詳細情報',
    'usuario.cerrarSesion': 'ログアウト',
    'usuario.iniciarGoogle': 'Googleでログイン',
    'input.placeholder': 'いつでもどうぞ...',
    'pill.documentos': 'ドキュメント',
    'pill.hojas': 'スプレッドシート',
    'pill.presentaciones': 'プレゼンテーション',
    'pill.imagenes': '画像',
    'pill.escritura': '文章作成',
    'pill.resumen': '要約',
    'pill.sitios': 'サイト',
    'pill.docsPrompt': 'についてのドキュメントの作成を手伝ってください: ',
    'pill.hojasPrompt': 'のためのスプレッドシートの作成を手伝ってください: ',
    'pill.presentacionesPrompt': 'についてのプレゼンテーションの作成を手伝ってください: ',
    'pill.imagenesPrompt': 'の画像を生成してください: ',
    'imagen.generando': '画像を生成中…',
    'imagen.error': '⚠️ 画像を生成できませんでした。もう一度お試しください。',
    'chat.imagenLista': '画像ができあがりました：',
    'doc.generando': 'ドキュメントを作成中…',
    'doc.descargar': 'ドキュメントをダウンロード',
    'doc.ver': 'ドキュメントを見る',
    'doc.imagenes': '画像 {n} / {total} を生成中…',
    'pill.escrituraPrompt': 'の執筆を手伝ってください: ',
    'pill.resumenPrompt': 'の要約を作ってください: ',
    'pill.sitiosPrompt': 'についての情報を検索してください: ',
    'proyectos.titulo': 'プロジェクト',
    'proyectos.nuevo': '+ 新しいプロジェクト',
    'proyectos.crearNuevo': '+ 新しいプロジェクトを作成',
    'proyectos.nombrePrompt': '新しいプロジェクトの名前:',
    'proyectos.vacio': 'まだプロジェクトがありません。チャットをまとめるために作成してください。',
    'proyectos.vacioChats': 'このプロジェクトにはまだチャットがありません。ここで新規作成してください。',
    'proyectos.nuevoChatAqui': '+ ここで新しいチャット',
    'proyectos.volver': '← プロジェクト',
    'proyectos.eliminarConfirm': 'このプロジェクトを削除しますか？含まれていたチャットは「最近」に残ります。',
    'biblioteca.titulo': 'ライブラリ',
    'biblioteca.subir': '+ ファイルをアップロード',
    'biblioteca.vacio': 'まだファイルをアップロードしていません。「+ ファイルをアップロード」ボタンを使用してください。',
    'nav.memoria': 'メモリー',
    'memoria.titulo': 'メモリー',
    'memoria.agregar': '+ メモリー追加',
    'memoria.desc': 'Fenix は、回答をパーソナライズするためにあなたに関する情報や関心のある重要なトピックを覚えています。確認、削除、手動追加ができます。',
    'memoria.vacia': '保存されたメモリーはまだありません。少しチャットすると、Fenix があなたのデータや重要なトピックを覚えていきます。',
    'memoria.queRecordar': '何を覚えておきましょうか？',
    'memoria.placeholder': '例：「サラと申します。建築家として働いています」',
    'memoria.categoria': 'カテゴリ',
    'memoria.catPersonal': '個人',
    'memoria.catPreferencia': '好み',
    'memoria.catProyecto': 'プロジェクト',
    'memoria.catTecnico': '技術',
    'memoria.catTemas': '重要なトピック',
    'memoria.guardar': '保存',
    'memoria.cancelar': 'キャンセル',
    'memoria.eliminar': '削除',
    'memoria.eliminarConfirm': 'このメモリーを削除しますか？',
    'memoria.guardada': 'メモリーを保存しました',
    'memoria.requiereSesion': 'メモリーを保存・表示するにはログインしてください。',
    'chat.recordar': 'これを覚える',
    'chat.escribiendo': '入力中...',
    'chat.sinTitulo': '無題',
    'chat.eliminarConfirm': 'このチャットを削除しますか？',
    'chat.renombrarPrompt': 'チャットの新しい名前:',
    'chat.destacar': 'ピン留め',
    'chat.quitarDestacado': 'ピン留めを外す',
    'chat.renombrar': '名前を変更',
    'chat.anadirProyecto': 'プロジェクトに追加',
    'chat.eliminar': '削除',
    'config.apariencia': '外観',
    'config.tema': 'テーマ',
    'config.temaDesc': 'ライトテーマとダークテーマを切り替え',
    'config.claro': 'ライト',
    'config.oscuro': 'ダーク',
    'config.modeloIA': 'AIモデル',
    'config.modeloPredeterminado': 'デフォルトのモデル',
    'config.modeloDesc': '会話に使用するAIモデルを選択',
    'config.asistente': 'アシスタント',
    'config.instruccion': 'システム指示',
    'config.instruccionDesc': 'すべての会話でのAIの基本動作を定義',
    'config.instruccionPlaceholder': 'あなたは役に立ち親切なアシスタントです...',
    'config.idioma': '言語',
    'config.idiomaDesc': 'AIが応答する言語',
    'config.datos': 'データとプライバシー',
    'config.guardarHistorial': '履歴を保存',
    'config.guardarHistorialDesc': '会話をブラウザにローカル保存',
    'config.borrarChats': 'すべてのチャットを削除',
    'config.borrarChatsDesc': '保存されたすべての会話履歴を削除',
    'config.borrarDatos': 'データを削除',
    'config.confirmarBorrado': 'よろしいですか？すべてのチャット、プロジェクト、保存されたファイルが削除されます。',
    'config.volver': '← 戻る',
    'config.aceptar': '決定',
    'config.idiomaSubtitle': 'AIが応答する言語を選択',
    'modal.limiteTitulo': 'メッセージ数の上限に達しました',
    'modal.limiteTexto': 'ログインせずに<strong>3件の無料メッセージ</strong>を使用しました。Googleでログインすると制限なく続けられます。',
    'modal.ahoraNo': '今はしない',
    'modal.limiteAlcanzado': 'ログインせずに{n}件のメッセージ制限に達しました。Googleでログインして続けてください。',
    'error.noConexion': '⚠️ バックエンドに接続できませんでした。{url}で実行されていることを確認してください',
    'error.servidor': 'サーバーエラーが発生しました。',
    'error.sinMicrofono': 'お使いのブラウザは音声認識に対応していません。Chromeをお試しください。',
    'error.audio': '音声を取得できませんでした。もう一度お試しください。',
    'voz.titulo': 'ライブ音声',
    'voz.conectando': '接続中...',
    'voz.escuchando': '聞いています、話してください...',
    'voz.procesando': '処理中...',
    'voz.iaHablando': 'AIが話しています',
    'voz.desconectado': '切断されました',
    'voz.error': '音声エラー',
    'voz.terminar': '終了',
    'voz.sugerencia': '赤いボタンで終了します。',
    'error.historialEliminado': '履歴を削除しました。',
    'instalar.ios': 'iPhoneでFenixをインストールするには:\n\n1. 共有ボタン（上向き矢印の四角）をタップ\n2. 「ホーム画面に追加」をタップ\n3. 「追加」をタップ',
    'instalar.otro': 'Fenixをインストールするには:\n\nブラウザの⋮メニューを開き、「アプリをインストール」または「ホーム画面に追加」をタップ。',
    'cuenta.titulo': 'マイアカウント',
    'cuenta.conSesion': 'ログイン中は制限なく会話できます。',
    'cuenta.sinSesion': 'まだログインしていません。<br><br>Googleでログインするとアカウントが保存され、制限なくチャットできます。',
    'cuenta.cerrarSesion': 'ログアウト',
    'cuenta.listo': '完了',
    'plan.titulo': 'プランをアップグレード',
    'plan.texto': 'Fenix IAは強力なAIモデルで動作します。<br><br>現在はログインせずに<strong>3件のメッセージ</strong>まで無料でチャットできます。Googleでログインすると<strong>無制限</strong>の会話が解除されます。',
    'plan.subtitulo': 'あなたに最適なプランを選んでください',
    'plan.gratisNombre': '無料',
    'plan.proNombre': 'Pro',
    'plan.ultraNombre': 'Ultra',
    'plan.mensual': '/月',
    'plan.masPopular': '一番人気',
    'plan.actual': '現在のプラン',
    'plan.elegir': 'プランを選ぶ',
    'plan.elegirAviso': '<strong>{plan}</strong>プランを選択しました。<br><br>オンライン決済は近日中に利用可能になります。それまではFenix IAを無料で使い続けられます。',
    'plan.gratisF1': 'ログイン不要の無料メッセージ3件',
    'plan.gratisF2': 'すべてのAIモデル',
    'plan.gratisF3': 'ブラウザに保存される履歴',
    'plan.proF1': '無制限のメッセージ',
    'plan.proF2': 'すべてのAIモデル',
    'plan.proF3': '無制限の保存履歴',
    'plan.proF4': '優先サポート',
    'plan.ultraF1': 'Proのすべて',
    'plan.ultraF2': 'より速い応答',
    'plan.ultraF3': '無制限のプロジェクトとライブラリ',
    'plan.ultraF4': '誰よりも早く新機能を利用',
    'modelo.auto': '自動',
    'apps.tituloInstalar': 'アプリをインストール',
    'apps.textoInstalar': 'Fenix IAはインストール可能なアプリとして動作します。履歴を失わずに通常のアプリとしてホーム画面から開けます。',
    'apps.instalarAhora': '今すぐインストール',
    'apps.tituloObtener': 'アプリを入手',
    'apps.textoObtener': 'Fenix IAはモバイルとデスクトップでインストール可能なアプリ（PWA）として利用できます。<br><br><strong>Android</strong>：⋮メニュー → 「ホーム画面に追加」。<br><strong>iPhone</strong>：共有ボタン → 「ホーム画面に追加」。',
    'apps.entendido': '了解',
    'info.titulo': 'Fenix IAについて',
    'info.texto': 'Fenix IAは最高のAIモデルを備えたパーソナルアシスタントです：<strong>Fenix 2.0</strong>、<strong>Gemini</strong>、<strong>DeepSeek</strong>。<br><br>作成者：Joshua Blandon Gonzales。バージョン1.0。',
    'ayuda.pregunta': 'Fenix IAの使い方を教えてください。できることの簡単なガイドをお願いします。'
  },
  zh: {
    'nav.nuevoChat': '新对话',
    'nav.buscar': '搜索',
    'nav.proyectos': '项目',
    'nav.biblioteca': '资料库',
    'nav.instalar': '安装应用',
    'nav.recientes': '最近',
    'buscar.placeholder': '搜索历史...',
    'usuario.invitado': '访客',
    'usuario.cuenta': '账户',
    'usuario.configuracion': '设置',
    'usuario.idioma': '语言',
    'usuario.ayuda': '获取帮助',
    'usuario.mejorarPlan': '升级套餐',
    'usuario.aplicaciones': '获取应用和扩展',
    'usuario.info': '更多信息',
    'usuario.cerrarSesion': '退出登录',
    'usuario.iniciarGoogle': '使用 Google 登录',
    'input.placeholder': '随时都可以...',
    'pill.documentos': '文档',
    'pill.hojas': '表格',
    'pill.presentaciones': '演示文稿',
    'pill.imagenes': '图片',
    'pill.escritura': '写作',
    'pill.resumen': '摘要',
    'pill.sitios': '网站',
    'pill.docsPrompt': '帮我创建一个关于以下内容的文档：',
    'pill.hojasPrompt': '帮我为以下内容创建一个电子表格：',
    'pill.presentacionesPrompt': '帮我创建一个关于以下内容的演示文稿：',
    'pill.imagenesPrompt': '生成一张图片：',
    'imagen.generando': '正在生成图片…',
    'imagen.error': '⚠️ 无法生成图片，请重试。',
    'chat.imagenLista': '这是你的图片：',
    'doc.generando': '正在创建文档…',
    'doc.descargar': '下载文档',
    'doc.ver': '查看文档',
    'doc.imagenes': '正在生成第 {n} 张图片，共 {total} 张…',
    'pill.escrituraPrompt': '帮我写：',
    'pill.resumenPrompt': '为我总结一下：',
    'pill.sitiosPrompt': '搜索关于以下内容的信息：',
    'proyectos.titulo': '项目',
    'proyectos.nuevo': '+ 新建项目',
    'proyectos.crearNuevo': '+ 创建新项目',
    'proyectos.nombrePrompt': '新项目的名称：',
    'proyectos.vacio': '您还没有项目。创建一个来整理您的对话。',
    'proyectos.vacioChats': '此项目还没有对话。在这里新建一个。',
    'proyectos.nuevoChatAqui': '+ 在这里新建对话',
    'proyectos.volver': '← 项目',
    'proyectos.eliminarConfirm': '删除此项目？其中包含的对话将保留在“最近”中。',
    'biblioteca.titulo': '资料库',
    'biblioteca.subir': '+ 上传文件',
    'biblioteca.vacio': '您还没有上传文件。使用“+ 上传文件”按钮。',
    'nav.memoria': '记忆',
    'memoria.titulo': '记忆',
    'memoria.agregar': '+ 添加记忆',
    'memoria.desc': 'Fenix 会记住关于你的信息和你在意的主题，以便个性化回答。你可以查看、删除或手动添加。',
    'memoria.vacia': '还没有保存的记忆。聊一会儿，Fenix 就会开始记住你的数据和重要主题。',
    'memoria.queRecordar': '你想让我记住什么？',
    'memoria.placeholder': '例如："我叫萨拉，是名建筑师"',
    'memoria.categoria': '分类',
    'memoria.catPersonal': '个人',
    'memoria.catPreferencia': '偏好',
    'memoria.catProyecto': '项目',
    'memoria.catTecnico': '技术',
    'memoria.catTemas': '重要主题',
    'memoria.guardar': '保存',
    'memoria.cancelar': '取消',
    'memoria.eliminar': '删除',
    'memoria.eliminarConfirm': '删除这条记忆？',
    'memoria.guardada': '记忆已保存',
    'memoria.requiereSesion': '请登录以保存和查看记忆。',
    'chat.recordar': '记住这个',
    'chat.escribiendo': '正在输入...',
    'chat.sinTitulo': '无标题',
    'chat.eliminarConfirm': '删除此对话？',
    'chat.renombrarPrompt': '对话的新名称：',
    'chat.destacar': '置顶',
    'chat.quitarDestacado': '取消置顶',
    'chat.renombrar': '重命名',
    'chat.anadirProyecto': '添加到项目',
    'chat.eliminar': '删除',
    'config.apariencia': '外观',
    'config.tema': '主题',
    'config.temaDesc': '在浅色和深色主题之间切换',
    'config.claro': '浅色',
    'config.oscuro': '深色',
    'config.modeloIA': 'AI 模型',
    'config.modeloPredeterminado': '默认模型',
    'config.modeloDesc': '选择对话中使用的 AI 模型',
    'config.asistente': '助手',
    'config.instruccion': '系统指令',
    'config.instruccionDesc': '定义 AI 在所有对话中的基本行为',
    'config.instruccionPlaceholder': '你是一个有用且友好的助手...',
    'config.idioma': '语言',
    'config.idiomaDesc': 'AI 回答使用的语言',
    'config.datos': '数据与隐私',
    'config.guardarHistorial': '保存历史记录',
    'config.guardarHistorialDesc': '在浏览器中本地保存您的对话',
    'config.borrarChats': '清除所有对话',
    'config.borrarChatsDesc': '删除所有已保存的对话历史',
    'config.borrarDatos': '清除数据',
    'config.confirmarBorrado': '确定吗？所有对话、项目和已保存的文件都将被删除。',
    'config.volver': '← 返回',
    'config.aceptar': '确定',
    'config.idiomaSubtitle': '选择 AI 回答使用的语言',
    'modal.limiteTitulo': '已达到消息数量上限',
    'modal.limiteTexto': '您已使用<strong>3条免费消息</strong>而无需登录。使用 Google 登录即可无限制继续聊天。',
    'modal.ahoraNo': '稍后再说',
    'modal.limiteAlcanzado': '您已达到无需登录的 {n} 条消息限制。请使用 Google 登录以继续聊天。',
    'error.noConexion': '⚠️ 无法连接到后端。请确认它运行在 {url}',
    'error.servidor': '发生服务器错误。',
    'error.sinMicrofono': '您的浏览器不支持语音识别。请尝试使用 Chrome。',
    'error.audio': '无法捕获音频。请重试。',
    'voz.titulo': '实时语音',
    'voz.conectando': '连接中...',
    'voz.escuchando': '我在听，请说...',
    'voz.procesando': '处理中...',
    'voz.iaHablando': 'AI正在说话',
    'voz.desconectado': '已断开',
    'voz.error': '语音错误',
    'voz.terminar': '结束',
    'voz.sugerencia': '点击红色按钮结束。',
    'error.historialEliminado': '历史记录已删除。',
    'instalar.ios': '在 iPhone 上安装 Fenix：\n\n1. 点击分享按钮（带向上箭头的方框）\n2. 点击“添加到主屏幕”\n3. 点击“添加”',
    'instalar.otro': '安装 Fenix：\n\n打开浏览器的 ⋮ 菜单，点击“安装应用”或“添加到主屏幕”。',
    'cuenta.titulo': '我的账户',
    'cuenta.conSesion': '登录后可无限制使用对话。',
    'cuenta.sinSesion': '您尚未登录。<br><br>使用 Google 登录以保存您的账户并无限制地聊天。',
    'cuenta.cerrarSesion': '退出登录',
    'cuenta.listo': '完成',
    'plan.titulo': '升级套餐',
    'plan.texto': 'Fenix IA 使用强大的 AI 模型。<br><br>目前您无需登录即可免费使用<strong>3条消息</strong>。使用 Google 登录可解锁<strong>无限制</strong>对话。',
    'plan.subtitulo': '选择最适合你的套餐',
    'plan.gratisNombre': '免费',
    'plan.proNombre': 'Pro',
    'plan.ultraNombre': 'Ultra',
    'plan.mensual': '/月',
    'plan.masPopular': '最受欢迎',
    'plan.actual': '当前套餐',
    'plan.elegir': '选择套餐',
    'plan.elegirAviso': '你已选择<strong>{plan}</strong>套餐。<br><br>在线支付即将上线。在此期间你可以免费继续使用 Fenix IA。',
    'plan.gratisF1': '免登录免费 3 条消息',
    'plan.gratisF2': '所有 AI 模型',
    'plan.gratisF3': '浏览器本地历史记录',
    'plan.proF1': '无限消息',
    'plan.proF2': '所有 AI 模型',
    'plan.proF3': '无限保存历史记录',
    'plan.proF4': '优先支持',
    'plan.ultraF1': '包含 Pro 全部功能',
    'plan.ultraF2': '更快的响应',
    'plan.ultraF3': '无限项目和文库',
    'plan.ultraF4': '抢先使用新功能',
    'modelo.auto': '自动',
    'apps.tituloInstalar': '安装应用',
    'apps.textoInstalar': 'Fenix IA 可作为可安装的应用运行。像普通应用一样从主屏幕打开，不丢失历史记录。',
    'apps.instalarAhora': '立即安装',
    'apps.tituloObtener': '获取应用',
    'apps.textoObtener': 'Fenix IA 可在手机和桌面端作为可安装应用（PWA）使用。<br><br><strong>Android</strong>：⋮ 菜单 → “添加到主屏幕”。<br><strong>iPhone</strong>：分享按钮 → “添加到主屏幕”。',
    'apps.entendido': '明白了',
    'info.titulo': '关于 Fenix IA',
    'info.texto': 'Fenix IA 是您的个人助手，配备最好的 AI 模型：<strong>Fenix 2.0</strong>、<strong>Gemini</strong> 和 <strong>DeepSeek</strong>。<br><br>作者：Joshua Blandon Gonzales。版本 1.0。',
    'ayuda.pregunta': 'Fenix IA 如何使用？给我一个我能做什么的快速指南。'
  },
  ar: {
    'nav.nuevoChat': 'محادثة جديدة',
    'nav.buscar': 'بحث',
    'nav.proyectos': 'المشاريع',
    'nav.biblioteca': 'المكتبة',
    'nav.instalar': 'تثبيت التطبيق',
    'nav.recientes': 'الأخيرة',
    'buscar.placeholder': 'البحث في السجل...',
    'usuario.invitado': 'ضيف',
    'usuario.cuenta': 'الحساب',
    'usuario.configuracion': 'الإعدادات',
    'usuario.idioma': 'اللغة',
    'usuario.ayuda': 'الحصول على المساعدة',
    'usuario.mejorarPlan': 'ترقية الخطة',
    'usuario.aplicaciones': 'الحصول على التطبيقات والإضافات',
    'usuario.info': 'مزيد من المعلومات',
    'usuario.cerrarSesion': 'تسجيل الخروج',
    'usuario.iniciarGoogle': 'تسجيل الدخول باستخدام Google',
    'input.placeholder': 'متى تشاء...',
    'pill.documentos': 'المستندات',
    'pill.hojas': 'الجداول',
    'pill.presentaciones': 'العروض',
    'pill.imagenes': 'الصور',
    'pill.escritura': 'الكتابة',
    'pill.resumen': 'الملخص',
    'pill.sitios': 'المواقع',
    'pill.docsPrompt': 'ساعدني في إنشاء مستند حول: ',
    'pill.hojasPrompt': 'ساعدني في إنشاء جدول بيانات لـ: ',
    'pill.presentacionesPrompt': 'ساعدني في إنشاء عرض تقديمي حول: ',
    'pill.imagenesPrompt': 'أنشئ صورة لـ: ',
    'imagen.generando': 'جارٍ إنشاء الصورة…',
    'imagen.error': '⚠️ تعذر إنشاء الصورة. حاول مرة أخرى.',
    'chat.imagenLista': 'إليك صورتك:',
    'doc.generando': 'جارٍ إنشاء المستند…',
    'doc.descargar': 'تنزيل المستند',
    'doc.ver': 'عرض المستند',
    'doc.imagenes': 'جارٍ إنشاء الصورة {n} من {total}…',
    'pill.escrituraPrompt': 'ساعدني في كتابة: ',
    'pill.resumenPrompt': 'أعطني ملخصًا عن: ',
    'pill.sitiosPrompt': 'ابحث لي عن معلومات حول: ',
    'proyectos.titulo': 'المشاريع',
    'proyectos.nuevo': '+ مشروع جديد',
    'proyectos.crearNuevo': '+ إنشاء مشروع جديد',
    'proyectos.nombrePrompt': 'اسم المشروع الجديد:',
    'proyectos.vacio': 'لا تملك مشاريع بعد. أنشئ واحدًا لتجميع محادثاتك.',
    'proyectos.vacioChats': 'هذا المشروع لا يحتوي على محادثات بعد. أنشئ واحدة هنا.',
    'proyectos.nuevoChatAqui': '+ محادثة جديدة هنا',
    'proyectos.volver': '← المشاريع',
    'proyectos.eliminarConfirm': 'حذف هذا المشروع؟ ستبقى المحادثات التي كان يحتويها في "الأخيرة".',
    'biblioteca.titulo': 'المكتبة',
    'biblioteca.subir': '+ رفع ملف',
    'biblioteca.vacio': 'لم ترفع أي ملفات بعد. استخدم زر "+ رفع ملف".',
    'nav.memoria': 'الذاكرة',
    'memoria.titulo': 'الذاكرة',
    'memoria.agregar': '+ إضافة ذاكرة',
    'memoria.desc': 'تتذكر فينكس معلومات عنك وعن المواضيع المهمة لك لتخصيص إجاباتها. يمكنك مراجعتها أو حذفها أو إضافتها يدويًا.',
    'memoria.vacia': 'لا توجد ذكريات محفوظة بعد. تحدث قليلاً وستبدأ فينكس بتذكر بياناتك ومواضيعك المهمة.',
    'memoria.queRecordar': 'ماذا تريدني أن أتذكر؟',
    'memoria.placeholder': 'مثال: "اسمي سارة وأعمل مهندسة معمارية"',
    'memoria.categoria': 'الفئة',
    'memoria.catPersonal': 'شخصي',
    'memoria.catPreferencia': 'التفضيلات',
    'memoria.catProyecto': 'المشاريع',
    'memoria.catTecnico': 'تقني',
    'memoria.catTemas': 'مواضيع مهمة',
    'memoria.guardar': 'حفظ',
    'memoria.cancelar': 'إلغاء',
    'memoria.eliminar': 'حذف',
    'memoria.eliminarConfirm': 'حذف هذه الذاكرة؟',
    'memoria.guardada': 'تم حفظ الذاكرة',
    'memoria.requiereSesion': 'سجّل الدخول لحفظ ذكرياتك وعرضها.',
    'chat.recordar': 'تذكر هذا',
    'chat.escribiendo': 'يكتب...',
    'chat.sinTitulo': 'بدون عنوان',
    'chat.eliminarConfirm': 'حذف هذه المحادثة؟',
    'chat.renombrarPrompt': 'الاسم الجديد للمحادثة:',
    'chat.destacar': 'تثبيت',
    'chat.quitarDestacado': 'إلغاء التثبيت',
    'chat.renombrar': 'إعادة تسمية',
    'chat.anadirProyecto': 'إضافة إلى مشروع',
    'chat.eliminar': 'حذف',
    'config.apariencia': 'المظهر',
    'config.tema': 'السمة',
    'config.temaDesc': 'التبديل بين السمة الفاتحة والداكنة',
    'config.claro': 'فاتح',
    'config.oscuro': 'داكن',
    'config.modeloIA': 'نموذج الذكاء الاصطناعي',
    'config.modeloPredeterminado': 'النموذج الافتراضي',
    'config.modeloDesc': 'اختر نموذج الذكاء الاصطناعي المستخدم في المحادثات',
    'config.asistente': 'المساعد',
    'config.instruccion': 'تعليمات النظام',
    'config.instruccionDesc': 'تحديد السلوك الأساسي للذكاء الاصطناعي في جميع المحادثات',
    'config.instruccionPlaceholder': 'أنت مساعد مفيد وودود...',
    'config.idioma': 'اللغة',
    'config.idiomaDesc': 'اللغة التي سيرد بها الذكاء الاصطناعي',
    'config.datos': 'البيانات والخصوصية',
    'config.guardarHistorial': 'حفظ السجل',
    'config.guardarHistorialDesc': 'حفظ محادثاتك محليًا في المتصفح',
    'config.borrarChats': 'مسح جميع المحادثات',
    'config.borrarChatsDesc': 'حذف كل سجل المحادثات المحفوظ',
    'config.borrarDatos': 'مسح البيانات',
    'config.confirmarBorrado': 'هل أنت متأكد؟ سيتم حذف جميع المحادثات والمشاريع والملفات المحفوظة.',
    'config.volver': '← رجوع',
    'config.aceptar': 'موافق',
    'config.idiomaSubtitle': 'اختر اللغة التي سيرد بها الذكاء الاصطناعي',
    'modal.limiteTitulo': 'تم بلوغ حد الرسائل',
    'modal.limiteTexto': 'استخدمت <strong>3 رسائل مجانية</strong> دون تسجيل الدخول. سجّل الدخول باستخدام Google للمتابعة دون حدود.',
    'modal.ahoraNo': 'ليس الآن',
    'modal.limiteAlcanzado': 'بلغت حد {n} رسائل دون تسجيل الدخول. سجّل الدخول باستخدام Google للمتابعة.',
    'error.noConexion': '⚠️ تعذر الاتصال بالخادم. تأكد من أنه يعمل على {url}',
    'error.servidor': 'حدث خطأ في الخادم.',
    'error.sinMicrofono': 'متصفحك لا يدعم التعرف على الصوت. جرّب Chrome.',
    'error.audio': 'تعذر التقاط الصوت. حاول مرة أخرى.',
    'voz.titulo': 'صوت مباشر',
    'voz.conectando': 'جارٍ الاتصال...',
    'voz.escuchando': 'أنا أستمع، تكلّم...',
    'voz.procesando': 'جارٍ المعالجة...',
    'voz.iaHablando': 'الذكاء الاصطناعي يتحدث',
    'voz.desconectado': 'تم قطع الاتصال',
    'voz.error': 'خطأ صوتي',
    'voz.terminar': 'إنهاء',
    'voz.sugerencia': 'اضغط على الزر الأحمر للإنهاء.',
    'error.historialEliminado': 'تم حذف السجل.',
    'instalar.ios': 'لتثبيت Fenix على iPhone:\n\n1. اضغط زر المشاركة (مربع به سهم لأعلى)\n2. اضغط "إضافة إلى الشاشة الرئيسية"\n3. اضغط "إضافة"',
    'instalar.otro': 'لتثبيت Fenix:\n\nافتح قائمة ⋮ في المتصفح واضغط "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".',
    'cuenta.titulo': 'حسابي',
    'cuenta.conSesion': 'مع جلسة نشطة لديك محادثات غير محدودة.',
    'cuenta.sinSesion': 'لم تسجل الدخول بعد.<br><br>سجّل الدخول باستخدام Google لحفظ حسابك والدردشة دون حدود.',
    'cuenta.cerrarSesion': 'تسجيل الخروج',
    'cuenta.listo': 'تم',
    'plan.titulo': 'ترقية الخطة',
    'plan.texto': 'يعمل Fenix IA بنماذج ذكاء اصطناعي قوية.<br><br>يمكنك حاليًا الدردشة مجانًا بحد <strong>3 رسائل</strong> دون تسجيل الدخول. عند تسجيل الدخول باستخدام Google تفتح محادثات <strong>غير محدودة</strong>.',
    'plan.subtitulo': 'اختر الخطة الأنسب لك',
    'plan.gratisNombre': 'مجاني',
    'plan.proNombre': 'Pro',
    'plan.ultraNombre': 'Ultra',
    'plan.mensual': '/شهر',
    'plan.masPopular': 'الأكثر شعبية',
    'plan.actual': 'الخطة الحالية',
    'plan.elegir': 'اختر الخطة',
    'plan.elegirAviso': 'لقد اخترت خطة <strong>{plan}</strong>.<br><br>سيتوفر الدفع عبر الإنترنت قريبًا. في هذه الأثناء يمكنك الاستمرار في استخدام Fenix IA مجانًا.',
    'plan.gratisF1': '3 رسائل مجانية دون تسجيل الدخول',
    'plan.gratisF2': 'جميع نماذج الذكاء الاصطناعي',
    'plan.gratisF3': 'سجل محلي في المتصفح',
    'plan.proF1': 'رسائل غير محدودة',
    'plan.proF2': 'جميع نماذج الذكاء الاصطناعي',
    'plan.proF3': 'سجل محفوظ غير محدود',
    'plan.proF4': 'دعم ذو أولوية',
    'plan.ultraF1': 'كل مزايا Pro',
    'plan.ultraF2': 'استجابات أسرع',
    'plan.ultraF3': 'مشاريع ومكتبة غير محدودة',
    'plan.ultraF4': 'ميزات جديدة قبل الجميع',
    'modelo.auto': 'تلقائي',
    'apps.tituloInstalar': 'تثبيت التطبيق',
    'apps.textoInstalar': 'يعمل Fenix IA كتطبيق قابل للتثبيت. افتحه من الشاشة الرئيسية كتطبيق عادي دون فقدان سجلك.',
    'apps.instalarAhora': 'ثبّت الآن',
    'apps.tituloObtener': 'الحصول على التطبيق',
    'apps.textoObtener': 'يتوفر Fenix IA كتطبيق قابل للتثبيت (PWA) على الجوال وسطح المكتب.<br><br>على <strong>Android</strong>: قائمة ⋮ → "إضافة إلى الشاشة الرئيسية".<br>على <strong>iPhone</strong>: زر المشاركة → "إضافة إلى الشاشة الرئيسية".',
    'apps.entendido': 'فهمت',
    'info.titulo': 'حول Fenix IA',
    'info.texto': 'Fenix IA هو مساعدك الشخصي بأفضل نماذج الذكاء الاصطناعي: <strong>Fenix 2.0</strong> و<strong>Gemini</strong> و<strong>DeepSeek</strong>.<br><br>أنشأه Joshua Blandon Gonzales. الإصدار 1.0.',
    'ayuda.pregunta': 'كيف يعمل Fenix IA؟ أعطني دليلًا سريعًا لما يمكنني فعله.'
  }
};

// Devuelve el texto traducido según el idioma seleccionado.
// Soporta sustitución de {claves} con los argumentos extras que se pasen.
function t(clave, args){
  const idioma = TRADUCCIONES[idiomaSeleccionado] ? idiomaSeleccionado : 'es';
  let texto = (TRADUCCIONES[idioma][clave] !== undefined)
    ? TRADUCCIONES[idioma][clave]
    : (TRADUCCIONES.es[clave] !== undefined ? TRADUCCIONES.es[clave] : clave);
  if(args){
    Object.keys(args).forEach(k => {
      texto = texto.replace(new RegExp('\\{' + k + '\\}', 'g'), args[k]);
    });
  }
  return texto;
}

// Aplica el idioma a todos los elementos estáticos con data-i18n.
// También traduce placeholders (data-i18n-placeholder) y el texto del tema.
function aplicarIdioma(){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const texto = t(el.getAttribute('data-i18n'));
    if(el.hasAttribute('data-i18n-html')){
      el.innerHTML = texto;
    } else {
      el.textContent = texto;
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  // Tema: actualiza las etiquetas Claro/Oscuro
  const tema = document.documentElement.getAttribute('data-theme');
  actualizarTextoTemaEnMenu(tema === 'dark' ? 'dark' : 'light');
  // Atributo lang y dirección RTL (para árabe)
  document.documentElement.setAttribute('lang', idiomaSeleccionado);
  document.documentElement.setAttribute('dir', idiomaSeleccionado === 'ar' ? 'rtl' : 'ltr');
}

// Se activa apenas carga el script, para evitar parpadeo del tema incorrecto
inicializarTema();

/* ======================
   PERSISTENCIA (chats, proyectos)
   - Sin sesión: se guarda en localStorage con claves genéricas.
   - Con sesión: se guarda por cuenta en localStorage Y en el servidor,
     de modo que cada cuenta Google tiene su propio historial.
   Respeta el toggle "Guardar historial".
====================== */
const CLAVE_HISTORIAL = 'fenixChats';
const CLAVE_PROYECTOS = 'fenixProyectos';

let usuarioGoogleId = null;   // id de Google del usuario logueado (null si invitado)
let sincronizando = false;
let sincronizacionPendiente = null;
let hayCambiosPendientes = false;

function claveHistorial(){
  return usuarioGoogleId ? `fenixChats_${usuarioGoogleId}` : CLAVE_HISTORIAL;
}

function claveProyectos(){
  return usuarioGoogleId ? `fenixProyectos_${usuarioGoogleId}` : CLAVE_PROYECTOS;
}

function persistirDatos(){
  if(localStorage.getItem('fenixGuardarHistorial') === 'no') return;
  try {
    localStorage.setItem(claveHistorial(), JSON.stringify(historial));
    localStorage.setItem(claveProyectos(), JSON.stringify(proyectos));
  } catch(e){
    console.error('Error al guardar datos locales:', e);
  }
  programarSincronizacion();
}

function cargarDatosGuardados(){
  if(localStorage.getItem('fenixGuardarHistorial') === 'no') return;
  try {
    const h = localStorage.getItem(claveHistorial());
    if(h){
      const arr = JSON.parse(h);
      if(Array.isArray(arr)) historial = arr;
    }
    const p = localStorage.getItem(claveProyectos());
    if(p){
      const arr = JSON.parse(p);
      if(Array.isArray(arr)) proyectos = arr;
    }
  } catch(e){
    console.error('Error al cargar datos locales:', e);
  }
}

/* ======================
   SINCRONIZACIÓN CON EL SERVIDOR
====================== */
function programarSincronizacion(){
  if(!usuarioGoogleId) return;
  if(localStorage.getItem('fenixGuardarHistorial') === 'no') return;
  hayCambiosPendientes = true;
  clearTimeout(sincronizacionPendiente);
  sincronizacionPendiente = setTimeout(enviarDatosAlServidor, 800);
}

function enviarDatosAlServidor(){
  if(!usuarioGoogleId || sincronizando) return;
  sincronizando = true;
  hayCambiosPendientes = false;
  const chats = historial;
  const proys = proyectos;
  fetch(`${BACKEND_URL_AUTH}/api/sincronizar`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chats, proyectos: proys })
  })
    .then(res => res.json())
    .then(data => {
      if(data && data.error) console.error('Error de sincronización:', data.error);
    })
    .catch(err => console.error('Error de sincronización:', err))
    .finally(() => {
      sincronizando = false;
      if(hayCambiosPendientes) programarSincronizacion();
    });
}

// Al iniciar sesión: carga el historial de ESA cuenta desde el servidor.
// Si la cuenta no tiene nada guardado pero el dispositivo tiene chats de
// invitado, los importa automáticamente para no perderlos.
function cargarDatosDeServidor(){
  if(localStorage.getItem('fenixGuardarHistorial') === 'no') return;
  fetch(`${BACKEND_URL_AUTH}/api/sincronizar`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if(!data || !Array.isArray(data.chats) || !Array.isArray(data.proyectos)) return;

      const legado = localStorage.getItem(CLAVE_HISTORIAL);
      if(data.chats.length === 0 && data.proyectos.length === 0 && legado){
        let arr = [];
        try { arr = JSON.parse(legado); } catch(e){ arr = []; }
        if(Array.isArray(arr) && arr.length){
          historial = arr;
          try {
            proyectos = JSON.parse(localStorage.getItem(CLAVE_PROYECTOS) || '[]');
          } catch(e){ proyectos = []; }
          persistirDatos(); // guarda por cuenta y sube al servidor
        } else {
          historial = [];
          proyectos = [];
        }
      } else {
        historial = data.chats;
        proyectos = data.proyectos;
        try {
          localStorage.setItem(claveHistorial(), JSON.stringify(historial));
          localStorage.setItem(claveProyectos(), JSON.stringify(proyectos));
        } catch(e){}
      }
      renderizarRecientes();
      renderizarProyectos();
      actualizarSaludo();
    })
    .catch(err => console.error('Error al cargar historial del servidor:', err));
}

/* ======================
   SIDEBAR
====================== */
function esMovil(){
  return window.innerWidth <= 768;
}

function toggleSidebar(){
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if(esMovil()){
    // Modo teléfono: cajón lateral deslizante + fondo oscuro
    const abrir = !sidebar.classList.contains('mobile-open');
    sidebar.classList.toggle('mobile-open', abrir);
    if(backdrop) backdrop.classList.toggle('show', abrir);
  } else {
    // Modo escritorio: colapsar el sidebar a ancho 0
    sidebar.classList.toggle('collapsed');
  }
}

function cerrarSidebarMovil(){
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if(esMovil()){
    sidebar.classList.remove('mobile-open');
    if(backdrop) backdrop.classList.remove('show');
  }
}

/* Al girar o cambiar de tamaño, si volvemos a escritorio limpiamos el drawer */
window.addEventListener('resize', function(){
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if(!esMovil()){
    sidebar.classList.remove('mobile-open');
    if(backdrop) backdrop.classList.remove('show');
  }
});

/* Al hacer clic en cualquier elemento de navegación del sidebar en móvil,
   cerramos el cajón automáticamente (excepto el bloque de usuario) */
document.addEventListener('click', function(e){
  if(!esMovil()) return;
  const sidebar = document.getElementById('sidebar');
  if(!sidebar.classList.contains('mobile-open')) return;
  if(e.target.closest('#sidebarUser')) return;
  if(e.target.closest('.sidebar')) cerrarSidebarMovil();
});

/* ======================
   PWA: INSTALAR APP
====================== */
let promptInstalacion = null;
const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

window.addEventListener('beforeinstallprompt', function(e){
  e.preventDefault();
  promptInstalacion = e;
  mostrarBotonInstalar();
});

window.addEventListener('appinstalled', function(){
  promptInstalacion = null;
  ocultarBotonInstalar();
});

function mostrarBotonInstalar(){
  const el = document.getElementById('navInstalar');
  if(el) el.style.display = 'flex';
}

function ocultarBotonInstalar(){
  const el = document.getElementById('navInstalar');
  if(el) el.style.display = 'none';
}

function instalarApp(){
  if(promptInstalacion){
    promptInstalacion.prompt();
    promptInstalacion.userChoice.then(function(res){
      // si el usuario cancela, dejamos el botón disponible para reintentar
      if(res.outcome === 'accepted') ocultarBotonInstalar();
    });
  } else if(esIOS){
    alert(t('instalar.ios'));
  } else {
    alert(t('instalar.otro'));
  }
}

// En iOS no existe beforeinstallprompt, así que mostramos el botón con instrucciones
if(esIOS) mostrarBotonInstalar();

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
    alert(t('error.sinMicrofono'));
    return;
  }
  const recognition = new SpeechRecognition();
  // El micrófono escucha en el mismo idioma que el usuario tiene seleccionado
  const locales = {
    es: 'es-ES', en: 'en-US', pt: 'pt-BR', fr: 'fr-FR',
    de: 'de-DE', ja: 'ja-JP', zh: 'zh-CN', ar: 'ar-SA'
  };
  recognition.lang = locales[idiomaSeleccionado] || 'es-ES';
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
    alert(t('error.audio'));
  };
}

/* ======================
   VOZ EN VIVO (Gemini Live API)
   Conversación hablada con la IA en una ventana flotante.
   No sustituye al reconocimiento del navegador (usarMicrofono).
====================== */
let vozEnVivo = null;
let textoVozBuffer = '';
let vozDebugTimer = null;

function toggleVozEnVivo(){
  if(vozEnVivo && vozEnVivo.estaActivo()){
    cerrarModalVoz();
    return;
  }
  abrirModalVoz();
  if(!vozEnVivo){
    vozEnVivo = new VoiceClient({
      callbacks: {
        onEstado: (estado) => actualizarEstadoVoz(estado),
        // La transcripción de la IA llega por fragmentos; se acumula hasta el turno completo.
        onTexto: (t) => { textoVozBuffer += t; },
        onTurnoFin: () => {
          const texto = textoVozBuffer.trim();
          textoVozBuffer = '';
          if(texto){
            agregarTranscripcionVoz('IA', texto);
            mostrarVistaChat();
            agregarMensaje('bot', texto);
            guardarMensajeEnHistorial('bot', texto);
          }
        },
        onError: (mensaje) => {
          const txt = document.getElementById('vozEstadoTexto');
          const dot = document.getElementById('vozDot');
          if(txt) txt.textContent = mensaje;
          if(dot){ dot.className = 'modal-voz-dot error'; }
          actualizarEstadoVoz('error');
        }
      }
    });
  }
  vozEnVivo.conectar().catch(() => {});
}

function abrirModalVoz(){
  const modal = document.getElementById('modalVoz');
  if(!modal) return;
  document.getElementById('vozTranscript').innerHTML = '';
  document.getElementById('vozEstadoTexto').textContent = t('voz.conectando');
  document.getElementById('vozDot').className = 'modal-voz-dot conectando';
  document.getElementById('vozDebug').textContent = 'mic: 0 | ia: 0';
  modal.style.display = 'flex';
  // Actualiza el contador de diagnóstico cada 500 ms mientras la ventana esté abierta.
  clearInterval(vozDebugTimer);
  vozDebugTimer = setInterval(function(){
    const modalAbierto = document.getElementById('modalVoz').style.display === 'flex';
    if(!modalAbierto){ clearInterval(vozDebugTimer); return; }
    if(vozEnVivo && vozEnVivo.infoDebug){
      document.getElementById('vozDebug').textContent = vozEnVivo.infoDebug();
    }
  }, 500);
}

function cerrarModalVoz(){
  const modal = document.getElementById('modalVoz');
  if(modal) modal.style.display = 'none';
  if(vozEnVivo) vozEnVivo.desconectar();
  actualizarEstadoVoz('desconectado');
}

function agregarTranscripcionVoz(quien, texto){
  const contenedor = document.getElementById('vozTranscript');
  if(!contenedor) return;
  const div = document.createElement('div');
  div.style.marginBottom = '8px';
  const etiqueta = document.createElement('strong');
  etiqueta.textContent = (quien === 'IA' ? 'Fenix' : 'Tú') + ': ';
  etiqueta.style.color = 'var(--text-main)';
  const cuerpo = document.createElement('span');
  cuerpo.textContent = texto;
  div.appendChild(etiqueta);
  div.appendChild(cuerpo);
  contenedor.appendChild(div);
  contenedor.scrollTop = contenedor.scrollHeight;
}

function actualizarEstadoVoz(estado){
  const txt = document.getElementById('vozEstadoTexto');
  const dot = document.getElementById('vozDot');
  const clave = { conectando: 'voz.conectando', escuchando: 'voz.escuchando', procesando: 'voz.procesando', iaHablando: 'voz.iaHablando', desconectado: 'voz.desconectado', error: 'voz.error' }[estado];
  if(txt && clave) txt.textContent = t(clave);
  if(dot) dot.className = 'modal-voz-dot ' + (estado || 'desconectado');

  const activo = estado === 'conectando' || estado === 'escuchando' || estado === 'procesando' || estado === 'iaHablando';
  ['vozBtnInicial', 'vozBtnChat'].forEach(function(id){
    const b = document.getElementById(id);
    if(b) b.classList.toggle('activo', activo);
  });
}

// Limpia la sesión de voz al salir o recargar la página (libera micrófono y sonido).
window.addEventListener('pagehide', function(){
  if(vozEnVivo) vozEnVivo.desconectar();
});

/* ======================
   ENVIAR MENSAJE
====================== */
// Controla la petición en curso para poder cancelarla con el botón "Detener".
let controladorAbort = null;

function detenerGeneracion(){
  if(controladorAbort) controladorAbort.abort();
}

// Muestra el botón de detener y oculta el de enviar mientras se genera (y viceversa).
function mostrarBotonDetener(visible){
  const pares = [['sendBtnInicial','stopBtnInicial'], ['sendBtnChat','stopBtnChat']];
  pares.forEach(function(ids){
    const enviar = document.getElementById(ids[0]);
    const detener = document.getElementById(ids[1]);
    if(enviar) enviar.style.display = visible ? 'none' : 'flex';
    if(detener) detener.style.display = visible ? 'flex' : 'none';
  });
}

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

  ultimoMensajeUsuario = texto;
  inputActivo.value = '';
  autoGrow(inputActivo);

  const typingEl = agregarMensaje('bot', t('chat.escribiendo'), true);

  // Pide una imagen: se va por /api/imagen (Pollinations) en vez del chat normal.
  if(esPeticionImagen(texto)){
    enviarPeticionImagen(texto, typingEl);
    return;
  }

  // URL de tu backend local. Si lo subes a un servidor real, cambia esto por esa URL.
  const BACKEND_URL = '/api/chat';

  let historialParaAPI = [];
  try {
    // Armamos el historial en formato que espera la API (role/content)
    // Solo se envían los últimos 30 mensajes para no pasarse del contexto del modelo.
    const chat = historial.find(c => c.id === chatActualId);
    historialParaAPI = chat
      ? chat.mensajes
          .filter(m => m.texto !== texto) // evita duplicar el mensaje que acabamos de mandar
          .map(m => ({ role: m.tipo === 'user' ? 'user' : 'assistant', content: m.texto }))
          .slice(-30)
      : [];
  } catch (err) {
    console.error('Error al armar historial:', err);
  }

  const payload = {
    mensaje: texto,
    historial: historialParaAPI,
    modelo: modeloSeleccionado,
    idioma: idiomaSeleccionado,
    instruccion: localStorage.getItem('fenixSystemPrompt') || ''
  };

  const controlador = new AbortController();
  controladorAbort = controlador;
  mostrarBotonDetener(true);

  fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controlador.signal
  })
    .then(async res => {
      if(!res.ok){
        const data = await res.json().catch(() => ({}));
        if(data.error === 'LIMITE'){
          typingEl.remove();
          if(controladorAbort === controlador){
            controladorAbort = null;
            mostrarBotonDetener(false);
          }
          agregarMensaje('bot', t('modal.limiteAlcanzado', { n: data.limite }));
          mostrarModalLimite();
          return;
        }
        throw { servidor: true, mensaje: data.error || t('error.servidor') };
      }

      // Stream real: la respuesta llega por partes y se muestra apenas se recibe.
      typingEl.remove();
      const burbujaBot = agregarMensaje('bot', '');
      const contenedor = document.getElementById('messages');
      const cursor = document.createElement('span');
      cursor.className = 'cursor-escribiendo';
      burbujaBot.appendChild(cursor);

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buffer = '';
      let textoAcumulado = '';
      let errorStream = null;

      function procesarLinea(linea){
        const l = linea.trim();
        if(!l.startsWith('data:')) return;
        const data = l.slice(5).trim();
        if(!data || data === '[DONE]') return;
        try {
          const obj = JSON.parse(data);
          if(obj.error){
            errorStream = obj.error;
            return;
          }
          if(typeof obj.texto === 'string' && obj.texto){
            textoAcumulado += obj.texto;
            // Si el modelo pidió una imagen o un documento, no mostramos
            // los marcadores crudos mientras llega el resto.
            const visible = textoAcumulado
              .replace(/\[GENERAR_(IMAGEN|DOC)\][\s\S]*$/i, '')
              .replace(/^\[IMAGEN\]\s*:?.*$/gim, '');
            const espera = /\[GENERAR_DOC\]/i.test(textoAcumulado) ? t('doc.generando') : t('imagen.generando');
            burbujaBot.textContent = visible.trim() ? visible : espera;
            burbujaBot.appendChild(cursor);
            if(estaCercaDelFinalDelChat(contenedor)) contenedor.scrollTop = contenedor.scrollHeight;
          }
        } catch(e){ /* línea inválida, ignorar */ }
      }

      function finalizarBurbuja(){
        cursor.remove();
        if(controladorAbort === controlador){
          controladorAbort = null;
          mostrarBotonDetener(false);
        }
        if(errorStream){
          burbujaBot.textContent = '⚠️ ' + errorStream;
        } else if(textoAcumulado){
          // El modelo puede responder con [GENERAR_IMAGEN]: descripcion o
          // con [GENERAR_DOC]: Título. En el caso del documento, el modelo
          // solo aporta el título: el cuerpo lo redacta el servidor con
          // hechos reales y fotos reales (ver /api/documento-real).
          const coincidenciaDoc = textoAcumulado.match(/\[GENERAR_DOC\]\s*:?\s*([^\n]*)\n?([\s\S]*)/i);
          const coincidenciaImg = textoAcumulado.match(/\[GENERAR_IMAGEN\]\s*:?\s*([\s\S]+)/i);
          if(coincidenciaDoc && coincidenciaDoc[1].trim()){
            crearDocumentoEnBurbuja(burbujaBot, coincidenciaDoc[1].trim(), (coincidenciaDoc[2] || '').trim());
          } else if(coincidenciaImg && coincidenciaImg[1].trim()){
            generarImagenEnBurbuja(burbujaBot, coincidenciaImg[1].trim(), t('chat.imagenLista'));
          } else {
            // Marcador a medias (usuario detuvo la generación): limpiamos.
            const limpio = textoAcumulado.replace(/\[GENERAR_\w*[\s\S]*$/i, '').trim();
            if(limpio){
              burbujaBot.textContent = limpio;
              guardarMensajeEnHistorial('bot', limpio);
              agregarBotonRecordar(burbujaBot, limpio);
              agregarMenuMensaje(burbujaBot, limpio, null);
            } else {
              burbujaBot.remove();
            }
          }
        } else {
          burbujaBot.textContent = '⚠️ ' + t('error.servidor');
        }
      }

      try {
        while(true){
          const { done, value } = await reader.read();
          if(done) break;
          buffer += dec.decode(value, { stream: true });
          let idx;
          while((idx = buffer.indexOf('\n')) !== -1){
            procesarLinea(buffer.slice(0, idx));
            buffer = buffer.slice(idx + 1);
          }
        }
        if(buffer.trim()) procesarLinea(buffer);
        finalizarBurbuja();
      } catch(err){
        if(err && (err.name === 'AbortError' || (controlador && controlador.signal.aborted))){
          // El usuario detuvo la generación: se conserva lo que llevaba.
          finalizarBurbuja();
        } else {
          throw err;
        }
      }
    })
    .catch(err => {
      typingEl.remove();
      if(controladorAbort === controlador){
        controladorAbort = null;
        mostrarBotonDetener(false);
      }
      if(err && (err.name === 'AbortError' || (controlador && controlador.signal.aborted))){
        return; // detenido antes de recibir respuesta: no mostrar error
      }
      let mensajeError;
      if(err && err.servidor){
        mensajeError = '⚠️ ' + (err.mensaje || t('error.servidor'));
      } else {
        mensajeError = t('error.noConexion', { url: BACKEND_URL });
      }
      agregarMensaje('bot', mensajeError);
      console.error(err);
    });
}

/* ======================
   GENERACIÓN DE IMÁGENES
====================== */
// Detecta si el mensaje pide crear una imagen (necesita verbo + objeto de imagen,
// para no confundirse con preguntas que solo mencionan "imagen").
function esPeticionImagen(texto){
  if(!texto || texto.length > 300) return false;
  // Quita acentos para cubrir francés/portugués/español con la misma regla.
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
  // Pedir un dibujo/pintura ya es crear una imagen por sí solo.
  const DIBUJO = /(dibuj|pint|desenh|draw|paint|zeichn)/;
  if(DIBUJO.test(t)) return true;
  const OBJETO = /(imagen|imagem|image|picture|photo|fotografia|foto|dibujo|ilustracion|illustration|drawing|retrato|portrait|logo|icono|icon|avatar|poster|sticker|wallpaper|bild)|画像|图片|照片|صورة/;
  const ACCION = /(gener|crea|cria|gere|erzeug|hazme|muestr|mostra|show|quiero|dame)|生成|作成|أنشئ|صمم/;
  return OBJETO.test(t) && ACCION.test(t);
}

let imagenEnCurso = false;

async function enviarPeticionImagen(texto, typingEl){
  if(imagenEnCurso) return;
  imagenEnCurso = true;
  try {
    await generarImagenEnBurbuja(typingEl, texto, t('chat.imagenLista'));
  } finally {
    imagenEnCurso = false;
  }
}

/* Pide la imagen al servidor y la pinta dentro de una burbuja ya creada
   (la usan tanto los mensajes detectados en el cliente como el marcador
   [GENERAR_IMAGEN] que puede devolver el propio modelo). */
async function generarImagenEnBurbuja(burbuja, descripcion, pieTexto){
  burbuja.className = 'msg msg-bot typing';
  burbuja.textContent = t('imagen.generando');
  try {
    const res = await fetch('/api/imagen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: descripcion })
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok || !data.url){
      console.error('Error generando imagen:', data);
      throw new Error(data.error || 'sin url');
    }
    burbuja.className = 'msg msg-bot';
    agregarImagenABurbuja(burbuja, data.url, pieTexto || '');
    guardarMensajeEnHistorial('bot', pieTexto || '', data.url);
  } catch(err){
    burbuja.className = 'msg msg-bot';
    burbuja.textContent = t('imagen.error');
    console.error(err);
  }
}

/* Mete la imagen (y su pie de foto) dentro de una burbuja vacía.
   Si `edicion` trae configuración guardada, se vuelve a aplicar. */
function agregarImagenABurbuja(burbuja, imagenUrl, pieTexto, edicion){
  burbuja.textContent = '';
  const img = document.createElement('img');
  img.src = imagenUrl;
  img.alt = pieTexto || 'Imagen generada';
  img.className = 'msg-imagen';
  img.loading = 'lazy';
  img.addEventListener('load', () => {
    const c = document.getElementById('messages');
    if(estaCercaDelFinalDelChat(c)) c.scrollTop = c.scrollHeight;
  });
  burbuja.appendChild(img);
  if(pieTexto){
    const pie = document.createElement('div');
    pie.className = 'msg-pie';
    pie.textContent = pieTexto;
    burbuja.appendChild(pie);
  }
  if(window.FenixImgEditor && window.FenixImgEditor.adjuntar){
    window.FenixImgEditor.adjuntar(img, imagenUrl, edicion || null, function(config){
      actualizarEdicionEnHistorial(imagenUrl, config);
    });
  }
}

/* ======================
   GENERACIÓN DE DOCUMENTOS
====================== */

/* Convierte el formato simple que usa el modelo (# títulos, - viñetas,
   **negritas**) a HTML para la vista previa y el archivo Word. */
function convertirMarkdownAHtml(contenido){
  const escapar = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const enLinea = s => escapar(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  const lineas = contenido.replace(/```[\s\S]*?```/g, m => m).split('\n');
  let html = '';
  let listaAbierta = null; // 'ul' | 'ol' | null
  const cerrarLista = () => { if(listaAbierta){ html += '</' + listaAbierta + '>'; listaAbierta = null; } };
  for(const linea of lineas){
    const l = linea.trim();
    if(!l){ cerrarLista(); continue; }
    let m;
    if((m = l.match(/^\[FENIX_IMG:([^\]]+)\]$/))){ cerrarLista(); html += '<img class="doc-imagen" src="' + escapar(m[1]) + '" alt="">'; }
    else if((m = l.match(/^###\s+(.+)/))){ cerrarLista(); html += '<h3>' + enLinea(m[1]) + '</h3>'; }
    else if((m = l.match(/^##\s+(.+)/))){ cerrarLista(); html += '<h2>' + enLinea(m[1]) + '</h2>'; }
    else if((m = l.match(/^#\s+(.+)/))){ cerrarLista(); html += '<h1>' + enLinea(m[1]) + '</h1>'; }
    else if((m = l.match(/^[-*]\s+(.+)/))){ if(listaAbierta !== 'ul'){ cerrarLista(); html += '<ul>'; listaAbierta = 'ul'; } html += '<li>' + enLinea(m[1]) + '</li>'; }
    else if((m = l.match(/^\d+[.)]\s+(.+)/))){ if(listaAbierta !== 'ol'){ cerrarLista(); html += '<ol>'; listaAbierta = 'ol'; } html += '<li>' + enLinea(m[1]) + '</li>'; }
    else { cerrarLista(); html += '<p>' + enLinea(l) + '</p>'; }
  }
  cerrarLista();
  return html;
}

/* Descarga el documento como .doc (HTML con formato Word: lo abren
   Word, LibreOffice y Google Docs sin librerías extra). */
/* ---- helpers de codificación para el archivo Word con fotos ---- */
function utf8ABase64(str){
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for(let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function blobABase64(blob){
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result).split(',')[1] || '');
    lector.onerror = rechazar;
    lector.readAsDataURL(blob);
  });
}
function envolver76(s){ return s.replace(/(.{76})/g, '$1\n'); }

/* Descarga el documento como .doc. Si el contenido trae fotos
   ([FENIX_IMG:url]), se incrustan en formato MHTML, que Word abre
   con las imágenes incluidas. */
async function descargarDocumento(titulo, contenidoMarkdown){
  const cuerpoHtml = convertirMarkdownAHtml(contenidoMarkdown);
  let docHtml = '<html xmlns:w="urn:schemas-microsoft-com:office:word">' +
    '<head><meta charset="utf-8"><title>' + titulo.replace(/[<>]/g,'') + '</title>' +
    '<style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.4;}' +
    'h1{font-size:18pt;color:#1a3c6e;}h2{font-size:14pt;color:#2a528f;}h3{font-size:12pt;color:#2a528f;}' +
    '.doc-imagen{max-width:480px;border-radius:8px;margin:10px 0;}</style></head>' +
    '<body>' + cuerpoHtml + '</body></html>';

  // Intentamos bajar cada foto del documento para incrustarla.
  const partesImagen = [];
  const tokens = contenidoMarkdown.match(/\[FENIX_IMG:[^\]]+\]/g) || [];
  for(const token of tokens){
    const url = token.slice(11, -1);
    try {
      const r = await fetch(url);
      if(!r.ok) throw new Error('http ' + r.status);
      const blob = await r.blob();
      const tipo = (blob.type || 'image/jpeg').split(';')[0];
      if(!tipo.startsWith('image/')) throw new Error('no imagen');
      const nombre = 'foto' + (partesImagen.length + 1) + (tipo === 'image/png' ? '.png' : '.jpg');
      docHtml = docHtml.replace(token, '<img class="doc-imagen" src="' + nombre + '" alt="">');
      partesImagen.push({ nombre, tipo, b64: await blobABase64(blob) });
    } catch(e) {
      docHtml = docHtml.replace(token, '');
    }
  }

  let contenido;
  if(partesImagen.length){
    // MHTML: un solo archivo con el HTML y las fotos dentro.
    const LIM = '==FENIX==';
    let mht = 'MIME-Version: 1.0\r\n' +
      'Content-Type: multipart/related; type="text/html"; boundary="' + LIM + '"\r\n\r\n' +
      '--' + LIM + '\r\nContent-Location: file:///C:/FenixIA/doc.html\r\n' +
      'Content-Transfer-Encoding: base64\r\nContent-Type: text/html; charset="utf-8"\r\n\r\n' +
      envolver76(utf8ABase64(docHtml)) + '\r\n';
    for(const p of partesImagen){
      mht += '--' + LIM + '\r\nContent-Location: file:///C:/FenixIA/' + p.nombre + '\r\n' +
        'Content-Transfer-Encoding: base64\r\nContent-Type: ' + p.tipo + '\r\n\r\n' +
        envolver76(p.b64) + '\r\n';
    }
    mht += '--' + LIM + '--\r\n';
    contenido = mht;
  } else {
    // Sin fotos (o fallaron todas): HTML simple como siempre.
    contenido = '\ufeff' + docHtml;
  }

  const blob = new Blob([contenido], { type: 'application/msword' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  const nombreSeguro = titulo.replace(/[^\w\s\u00C0-\uFFFF-]/g, '').trim().slice(0, 80) || 'documento';
  enlace.download = nombreSeguro + '.doc';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 5000);
}

/* Vista previa del documento en una ventana flotante. */
let _modalDoc = null;
function verDocumento(titulo, contenido){
  const modal = asegurarModalDoc();
  modal.querySelector('.modal-doc-titulo').textContent = titulo;
  modal.querySelector('.modal-doc-contenido').innerHTML = convertirMarkdownAHtml(contenido);
  const btnDescargar = modal.querySelector('.modal-doc-pie button');
  btnDescargar.textContent = '⬇️ ' + t('doc.descargar');
  btnDescargar.onclick = () => descargarDocumento(titulo, contenido);
  modal.style.display = 'flex';
}

function cerrarModalDoc(){
  if(_modalDoc) _modalDoc.style.display = 'none';
}

function asegurarModalDoc(){
  if(_modalDoc) return _modalDoc;
  const modal = document.createElement('div');
  modal.id = 'modalDoc';
  modal.className = 'modal-doc-fondo';
  modal.innerHTML =
    '<div class="modal-doc">' +
      '<div class="modal-doc-cabecera">' +
        '<div class="modal-doc-titulo"></div>' +
        '<button class="modal-doc-cerrar" type="button">✕</button>' +
      '</div>' +
      '<div class="modal-doc-contenido"></div>' +
      '<div class="modal-doc-pie">' +
        '<button class="tarjeta-doc-btn" type="button"></button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
  _modalDoc = modal;
  modal.addEventListener('click', e => { if(e.target === modal) cerrarModalDoc(); });
  modal.querySelector('.modal-doc-cerrar').addEventListener('click', cerrarModalDoc);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') cerrarModalDoc(); });
  return modal;
}

/* Muestra la tarjeta del documento dentro de una burbuja. */
function agregarDocumentoABurbuja(burbuja, titulo, contenido){
  burbuja.textContent = '';
  const tarjeta = document.createElement('div');
  tarjeta.className = 'tarjeta-doc';

  const icono = document.createElement('div');
  icono.className = 'tarjeta-doc-icono';
  icono.textContent = '📄';

  const info = document.createElement('div');
  info.className = 'tarjeta-doc-info';
  const nombre = document.createElement('div');
  nombre.className = 'tarjeta-doc-nombre';
  nombre.textContent = titulo;
  info.appendChild(nombre);

  const botones = document.createElement('div');
  botones.className = 'tarjeta-doc-botones';

  const botonVer = document.createElement('button');
  botonVer.className = 'tarjeta-doc-btn tarjeta-doc-btn-sec';
  botonVer.type = 'button';
  botonVer.textContent = '👁️ ' + t('doc.ver');
  botonVer.addEventListener('click', () => verDocumento(titulo, contenido));
  botones.appendChild(botonVer);

  const botonDescargar = document.createElement('button');
  botonDescargar.className = 'tarjeta-doc-btn';
  botonDescargar.type = 'button';
  botonDescargar.textContent = '⬇️ ' + t('doc.descargar');
  botonDescargar.addEventListener('click', () => descargarDocumento(titulo, contenido));
  botones.appendChild(botonDescargar);

  info.appendChild(botones);

  tarjeta.appendChild(icono);
  tarjeta.appendChild(info);
  burbuja.appendChild(tarjeta);
}

/* Punto de llegada cuando el modelo responde con [GENERAR_DOC]:.
   El cuerpo NO lo redacta el modelo del chat (alucinaba datos): se pide al
   servidor /api/documento-real, que usa el grounding de Gemini para buscar
   hechos reales en internet y fotos REALES de Wikimedia Commons.
   El contenido devuelto usa el formato simple que ya renderiza la app
   (con [FENIX_IMG:url] para las fotos), así que la vista previa, el .doc
   y la descarga siguen funcionando igual (clases .doc-imagen). */
async function crearDocumentoEnBurbuja(burbuja, titulo, contenido){
  burbuja.className = 'msg msg-bot typing';
  burbuja.textContent = t('doc.generando');

  // El "tema" se manda tal cual lo pidió el usuario (mejor que el título,
  // porque trae el contexto completo de la petición).
  let tema = String(ultimoMensajeUsuario || '').trim();
  if(!tema) tema = String(titulo || '').trim();
  if(!tema) tema = String(contenido || '').trim();

  try {
    const res = await fetch('/api/documento-real', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tema })
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok || !data.contenido) throw new Error(data.error || t('error.servidor'));

    const contenidoLimpio = String(data.contenido).replace(/\n{3,}/g, '\n\n').trim();
    const tituloFinal = String(titulo || '').trim() || 'Documento';
    burbuja.className = 'msg msg-bot';
    agregarDocumentoABurbuja(burbuja, tituloFinal, contenidoLimpio);
    guardarMensajeEnHistorial('bot', '📄 ' + tituloFinal, null, { titulo: tituloFinal, contenido: contenidoLimpio });
  } catch(e) {
    console.error('Error generando documento real:', e);
    burbuja.className = 'msg msg-bot';
    burbuja.textContent = '⚠️ ' + String((e && e.message) || t('error.servidor'));
  }
}

/* ======================
   MOSTRAR MENSAJE EN PANTALLA
====================== */
function agregarMensaje(tipo, texto, esTyping, imagenUrl, documento, edicion){
  const contenedor = document.getElementById('messages');
  const burbuja = document.createElement('div');
  burbuja.className = 'msg ' + (tipo === 'user' ? 'msg-user' : 'msg-bot') + (esTyping ? ' typing' : '');
  let imgEl = null;
  if(documento){
    agregarDocumentoABurbuja(burbuja, documento.titulo || texto || 'Documento', documento.contenido || '');
  } else if(imagenUrl){
    agregarImagenABurbuja(burbuja, imagenUrl, texto || '', edicion);
    imgEl = burbuja.querySelector('img');
  } else {
    burbuja.textContent = texto;
  }
  contenedor.appendChild(burbuja);
  contenedor.scrollTop = contenedor.scrollHeight;
  if(!esTyping) agregarMenuMensaje(burbuja, texto || '', imgEl);
  if(tipo === 'bot' && !documento && !imagenUrl && texto){
    agregarBotonRecordar(burbuja, texto);
  }
  return burbuja;
}

/* Solo hace auto-scroll si el usuario ya estaba cerca del final,
   para no interrumpirlo si subió a leer algo anterior */
function estaCercaDelFinalDelChat(contenedor){
  return contenedor.scrollHeight - contenedor.scrollTop - contenedor.clientHeight < 80;
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
  document.getElementById('vistaMemoria').style.display = 'none';
  document.getElementById('vistaConfiguracion').style.display = 'none';
  document.getElementById('vistaIdioma').style.display = 'none';
}

function mostrarVistaChat(){
  ocultarTodasLasVistas();
  document.getElementById('vistaChat').style.display = 'flex';
}

function mostrarVistaInicial(){
  ocultarTodasLasVistas();
  document.getElementById('vistaInicial').style.display = 'flex';
  document.getElementById('messages').innerHTML = '';
  actualizarSaludo();
}

// Guarda el nombre real del usuario al iniciar sesión
let nombreUsuarioLogueado = null;

// Frases de saludo por idioma (usan {nombre})
const SALUDOS = {
  es: ['Vamos con todo, {nombre}', '¡Hola {nombre}! ¿En qué te ayudo hoy?', 'Bienvenido de nuevo, {nombre}', '¿Qué necesitas, {nombre}?', 'Cuéntame, {nombre}, ¿qué hacemos hoy?', '¡Qué gusto verte, {nombre}!', 'Estoy listo para ayudarte, {nombre}', '¿En qué te echo una mano, {nombre}?'],
  en: ["Let's go, {nombre}!", 'Hi {nombre}! How can I help you today?', 'Welcome back, {nombre}', 'What do you need, {nombre}?', 'Tell me, {nombre}, what are we doing today?', 'Great to see you, {nombre}!', "I'm ready to help you, {nombre}", 'How can I lend you a hand, {nombre}?'],
  pt: ['Vamos com tudo, {nombre}!', 'Olá {nombre}! Como posso ajudar hoje?', 'Bem-vindo de volta, {nombre}', 'O que você precisa, {nombre}?', 'Me conte, {nombre}, o que fazemos hoje?', 'Que bom te ver, {nombre}!', 'Estou pronto para ajudar você, {nombre}', 'Em que posso te dar uma mão, {nombre}?'],
  fr: ['C\'est parti, {nombre} !', 'Salut {nombre} ! Comment puis-je t\'aider aujourd\'hui ?', 'Ravi de te revoir, {nombre}', 'De quoi as-tu besoin, {nombre} ?', 'Dis-moi, {nombre}, que fait-on aujourd\'hui ?', 'Content de te voir, {nombre} !', 'Je suis prêt à t\'aider, {nombre}', 'En quoi puis-je t\'aider, {nombre} ?'],
  de: ['Los geht\'s, {nombre}!', 'Hallo {nombre}! Wie kann ich dir heute helfen?', 'Willkommen zurück, {nombre}', 'Was brauchst du, {nombre}?', 'Erzähl mir, {nombre}, was machen wir heute?', 'Schön, dich zu sehen, {nombre}!', 'Ich bin bereit, dir zu helfen, {nombre}', 'Wie kann ich dir helfen, {nombre}?'],
  ja: ['がんばろう、{nombre}！', 'こんにちは、{nombre}！今日は何をお手伝いしましょうか？', 'おかえりなさい、{nombre}', '{nombre}、何が必要ですか？', '{nombre}、今日は何をしましょうか？', 'お会いできて嬉しいです、{nombre}！', '{nombre}、いつでもお手伝いします', '{nombre}、何かお手伝いしましょうか？'],
  zh: ['加油，{nombre}！', '你好，{nombre}！今天有什么可以帮你？', '欢迎回来，{nombre}', '你需要什么，{nombre}？', '{nombre}，告诉我我们今天做什么？', '很高兴见到你，{nombre}！', '我已准备好帮助你，{nombre}', '有什么能帮到你，{nombre}？'],
  ar: ['هيا بنا، {nombre}!', 'مرحبًا {nombre}! كيف يمكنني مساعدتك اليوم؟', 'مرحبًا بعودتك، {nombre}', 'ماذا تحتاج، {nombre}؟', 'أخبرني، {nombre}، ماذا نفعل اليوم؟', 'سعيد برؤيتك، {nombre}!', 'أنا جاهز لمساعدتك، {nombre}', 'بماذا يمكنني أن أساعدك، {nombre}؟']
};

// Muestra un saludo distinto en cada ocasión con la información real del usuario
function actualizarSaludo(){
  const saludo = document.getElementById('greetingText');
  if(!saludo) return;
  const nombre = (nombreUsuarioLogueado || t('usuario.invitado')).split(' ')[0];
  const frases = SALUDOS[idiomaSeleccionado] || SALUDOS.es;
  const frase = frases[Math.floor(Math.random() * frases.length)];
  saludo.textContent = frase.replace('{nombre}', nombre);
}

/* ======================
   NUEVO CHAT
====================== */
function nuevoChat(){
  if(controladorAbort) controladorAbort.abort();
  mostrarBotonDetener(false);
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
  persistirDatos();
}

function guardarMensajeEnHistorial(tipo, texto, imagen, documento, edicion){
  const chat = historial.find(c => c.id === chatActualId);
  if(chat){
    let extra = {};
    if(documento){
      extra = { documento };
    } else if(imagen){
      extra = { imagen };
      if(edicion) extra.edicion = edicion;
    }
    chat.mensajes.push(Object.assign({ tipo, texto }, extra));
  }
  persistirDatos();
}

// Cuando el usuario edita una imagen ya mostrada, guardamos la nueva
// configuración (filtro/tamaño) en el chat correspondiente del historial.
function actualizarEdicionEnHistorial(imagenUrl, edicion){
  const chat = historial.find(c => c.id === chatActualId);
  if(!chat) return;
  const msj = chat.mensajes.find(m => m.imagen === imagenUrl);
  if(msj) msj.edicion = edicion;
  persistirDatos();
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
    <div class="dropdown-item" data-accion="destacar">${iconoDestacar}${chat.pinned ? t('chat.quitarDestacado') : t('chat.destacar')}</div>
    <div class="dropdown-item" data-accion="renombrar">${iconoRenombrar}${t('chat.renombrar')}</div>
    <div class="dropdown-item" data-accion="proyecto">${iconoProyecto}${t('chat.anadirProyecto')}</div>
    <div class="dropdown-divider"></div>
    <div class="dropdown-item peligro" data-accion="eliminar">${iconoEliminar}${t('chat.eliminar')}</div>
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
  const nuevoNombre = prompt(t('chat.renombrarPrompt'), chat.titulo);
  if(nuevoNombre && nuevoNombre.trim()){
    chat.titulo = nuevoNombre.trim();
    renderizarRecientes(document.getElementById('buscarInput').value);
    if(proyectoActualId) renderizarChatsDeProyecto(proyectoActualId);
    persistirDatos();
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
  crearNuevo.textContent = t('proyectos.crearNuevo');
  crearNuevo.onclick = (e) => {
    e.stopPropagation();
    const nombre = prompt(t('proyectos.nombrePrompt'));
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
    persistirDatos();
  }
}

function toggleAnclar(id){
  const chat = historial.find(c => c.id === id);
  if(chat){
    chat.pinned = !chat.pinned;
    renderizarRecientes(document.getElementById('buscarInput').value);
    persistirDatos();
  }
}

function abrirChat(id){
  const chat = historial.find(c => c.id === id);
  if(!chat) return;
  chatActualId = id;
  mostrarVistaChat();
  document.getElementById('messages').innerHTML = '';
  chat.mensajes.forEach(m => agregarMensaje(m.tipo, m.texto, false, m.imagen, m.documento, m.edicion));
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
   SELECTOR DE MODELO DE IA
====================== */
let modeloSeleccionado = 'groq';

function nombreModelo(m){
  const map = { groq: 'Fenix 2.0', deepseek: 'DeepSeek', gemini: 'Gemini', auto: t('modelo.auto') };
  return map[m] || m;
}

function toggleMenuModelo(e){
  e.stopPropagation();
  const yaAbierto = document.getElementById('menuModeloDropdown');
  cerrarMenusAbiertos();
  if(yaAbierto) return;

  const btn = document.getElementById('modeloSelectBtn');
  const menu = document.createElement('div');
  menu.className = 'dropdown-menu';
  menu.id = 'menuModeloDropdown';
  menu.style.left = '0';
  menu.style.right = 'auto';
  menu.style.minWidth = '220px';

  menu.innerHTML = `
    <div class="dropdown-item" data-modelo="auto">${t('modelo.auto')}</div>
    <div class="dropdown-item" data-modelo="groq">Fenix 2.0</div>
    <div class="dropdown-item" data-modelo="gemini">Gemini</div>
    <div class="dropdown-item" data-modelo="deepseek">DeepSeek</div>
  `;

  menu.querySelectorAll('[data-modelo]').forEach(item => {
    item.onclick = (ev) => {
      ev.stopPropagation();
      seleccionarModelo(item.getAttribute('data-modelo'));
      cerrarMenusAbiertos();
    };
  });

  btn.parentElement.appendChild(menu);
}

function seleccionarModelo(modelo){
  modeloSeleccionado = modelo;
  localStorage.setItem('fenixModelo', modelo);
  document.getElementById('modeloTextoActual').textContent = nombreModelo(modelo);
}

document.addEventListener('click', function(e){
  if(!e.target.closest('#modeloSelectBtn') && !e.target.closest('#menuModeloDropdown')){
    const menu = document.getElementById('menuModeloDropdown');
    if(menu) menu.remove();
  }
});

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

/* ======================
   MODAL DE LÍMITE DE MENSAJES
====================== */
function mostrarModalLimite(){
  const modal = document.getElementById('modalLimite');
  if(modal) modal.style.display = 'flex';
}

function cerrarModalLimite(){
  const modal = document.getElementById('modalLimite');
  if(modal) modal.style.display = 'none';
}

/* ======================
   MODAL GENÉRICO REUTILIZABLE
====================== */
function mostrarModalGenerico(titulo, texto, acciones){
  const mTitulo = document.getElementById('modalGenericoTitulo');
  const mTexto = document.getElementById('modalGenericoTexto');
  const mAcciones = document.getElementById('modalGenericoAcciones');
  if(mTitulo) mTitulo.textContent = titulo;
  if(mTexto) mTexto.innerHTML = texto;
  if(mAcciones){
    mAcciones.innerHTML = '';
    (acciones || []).forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'modal-btn' + (a.primario ? ' modal-btn-primary' : '');
      btn.textContent = a.texto;
      btn.onclick = a.onClick;
      mAcciones.appendChild(btn);
    });
  }
  const modal = document.getElementById('modalGenerico');
  if(modal) modal.style.display = 'flex';
}

function cerrarModalGenerico(){
  const modal = document.getElementById('modalGenerico');
  if(modal) modal.style.display = 'none';
}

/* ======================
   OPCIONES DEL MENÚ DE USUARIO
====================== */
// Cuenta: muestra la sesión actual o invita a iniciar sesión
function irACuenta(){
  cerrarMenuUsuario();
  fetch(`${BACKEND_URL_AUTH}/api/usuario-actual`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if(data.autenticado && data.usuario){
        const u = data.usuario;
        mostrarModalGenerico(
          t('cuenta.titulo'),
          `<strong>${escaparHTML(u.nombre || t('usuario.invitado'))}</strong><br>${escaparHTML(u.correo || '')}<br><br>${t('cuenta.conSesion')}`,
          [
            { texto: t('cuenta.cerrarSesion'), onClick: function(){ cerrarModalGenerico(); cerrarSesion(); } },
            { texto: t('cuenta.listo'), primario: true, onClick: cerrarModalGenerico }
          ]
        );
      } else {
        mostrarModalGenerico(
          t('cuenta.titulo'),
          t('cuenta.sinSesion'),
          [
            { texto: t('usuario.iniciarGoogle'), primario: true, onClick: iniciarSesionConGoogle },
            { texto: t('modal.ahoraNo'), onClick: cerrarModalGenerico }
          ]
        );
      }
    })
    .catch(() => {});
}

// Obtener ayuda: abre un chat nuevo preguntándole a la IA
function abrirAyuda(){
  cerrarMenuUsuario();
  nuevoChat();
  const el = document.getElementById('chatInput');
  if(el){
    el.value = t('ayuda.pregunta');
    autoGrow(el);
  }
  setTimeout(() => sendMessage(), 100);
}

// Mejorar plan: muestra los planes con sus precios
function mostrarMejorarPlan(){
  cerrarMenuUsuario();
  const modal = document.getElementById('modalPlan');
  if(modal) modal.style.display = 'flex';
}

function cerrarModalPlan(){
  const modal = document.getElementById('modalPlan');
  if(modal) modal.style.display = 'none';
}

// Elegir plan: por ahora avisa que el pago llegará pronto
function elegirPlan(nombre){
  cerrarModalPlan();
  const nombres = { gratis: t('plan.gratisNombre'), pro: t('plan.proNombre'), ultra: t('plan.ultraNombre') };
  mostrarModalGenerico(
    t('plan.titulo'),
    t('plan.elegirAviso', { plan: nombres[nombre] || nombre }),
    [{ texto: t('modal.ahoraNo'), primario: true, onClick: cerrarModalGenerico }]
  );
}

// Obtener aplicaciones y extensiones: instalación de la app
function mostrarApps(){
  cerrarMenuUsuario();
  if(window.deferredPrompt){
    mostrarModalGenerico(
      t('apps.tituloInstalar'),
      t('apps.textoInstalar'),
      [
        { texto: t('apps.instalarAhora'), primario: true, onClick: function(){ cerrarModalGenerico(); instalarApp(); } },
        { texto: t('modal.ahoraNo'), onClick: cerrarModalGenerico }
      ]
    );
  } else {
    mostrarModalGenerico(
      t('apps.tituloObtener'),
      t('apps.textoObtener'),
      [{ texto: t('apps.entendido'), primario: true, onClick: cerrarModalGenerico }]
    );
  }
}

// Más información: datos de la app
function mostrarInfo(){
  cerrarMenuUsuario();
  mostrarModalGenerico(
    t('info.titulo'),
    t('info.texto'),
    [{ texto: t('apps.entendido'), primario: true, onClick: cerrarModalGenerico }]
  );
}

/* ======================
   MENÚ DE USUARIO EN SIDEBAR
====================== */
function toggleMenuUsuario(e){
  e.stopPropagation();
  const menu = document.getElementById('sidebarUserMenu');
  const arrow = document.querySelector('.sidebar-user-arrow');
  const abierto = menu.classList.contains('open');

  if(abierto){
    menu.classList.remove('open');
    arrow.classList.remove('open');
  } else {
    menu.classList.add('open');
    arrow.classList.add('open');
  }
}

function cerrarMenuUsuario(){
  const menu = document.getElementById('sidebarUserMenu');
  const arrow = document.querySelector('.sidebar-user-arrow');
  if(menu) menu.classList.remove('open');
  if(arrow) arrow.classList.remove('open');
}

document.addEventListener('click', function(e){
  if(!e.target.closest('#sidebarUser')){
    cerrarMenuUsuario();
  }
});

function irAConfiguracion(){
  cerrarMenuUsuario();
  mostrarVistaConfiguracion();
}

function irAVistaIdioma(){
  cerrarMenuUsuario();
  mostrarVistaIdioma();
}

function revisarSesionActual(){
  fetch(`${BACKEND_URL_AUTH}/api/usuario-actual`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if(data.autenticado && data.usuario){
        const u = data.usuario;
        const avatar = document.getElementById('sidebarUserAvatar');
        const nombre = document.getElementById('sidebarUserName');
        const email = document.getElementById('sidebarUserEmail');
        const logoutBtn = document.getElementById('sidebarUserLogout');
        const loginBtn = document.getElementById('sidebarUserLogin');

        if(u.foto){
          avatar.innerHTML = `<img src="${u.foto}" alt="${escaparHTML(u.nombre || '')}">`;
        }
        nombre.textContent = u.nombre || t('usuario.invitado');
        email.textContent = u.correo || '';
        if(logoutBtn) logoutBtn.style.display = 'flex';
        if(loginBtn) loginBtn.style.display = 'none';

        // Saludo personalizado con el nombre real del usuario
        nombreUsuarioLogueado = u.nombre || t('usuario.invitado');
        actualizarSaludo();

        // Cargar el historial de ESTA cuenta desde el servidor
        usuarioGoogleId = u.id;
        cargarDatosDeServidor();
      } else {
        usuarioGoogleId = null;
      }
    })
    .catch(() => {});
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
  const nombre = prompt(t('proyectos.nombrePrompt'));
  if(!nombre || !nombre.trim()) return;
  proyectos.unshift({ id: Date.now(), nombre: nombre.trim() });
  renderizarProyectos();
  persistirDatos();
}

function eliminarProyecto(id, event){
  event.stopPropagation();
  if(!confirm(t('proyectos.eliminarConfirm'))) return;
  proyectos = proyectos.filter(p => p.id !== id);
  historial.forEach(c => { if(c.proyectoId === id) c.proyectoId = null; });
  renderizarProyectos();
  renderizarRecientes();
  persistirDatos();
}

function renderizarProyectos(){
  const cont = document.getElementById('proyectosList');
  cont.innerHTML = '';

  if(proyectos.length === 0){
    cont.innerHTML = '<div class="empty-state">' + t('proyectos.vacio') + '</div>';
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
    cont.innerHTML = '<div class="empty-state">' + t('proyectos.vacioChats') + '</div>';
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
  if(!confirm(t('chat.eliminarConfirm'))) return;
  historial = historial.filter(c => c.id !== id);
  renderizarRecientes();
  if(proyectoActualId) renderizarChatsDeProyecto(proyectoActualId);
  persistirDatos();
}

function nuevoChatEnProyecto(){
  // Al mandar el próximo mensaje, el chat se crea ya asociado a este proyecto
  if(controladorAbort) controladorAbort.abort();
  mostrarBotonDetener(false);
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
    cont.innerHTML = '<div class="empty-state">' + t('biblioteca.vacio') + '</div>';
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
   MEMORIA
====================== */
function mostrarVistaMemoria(){
  ocultarTodasLasVistas();
  document.getElementById('vistaMemoria').style.display = 'block';
  cargarMemorias();
}

async function cargarMemorias(){
  const cont = document.getElementById('memoriasList');
  if(!cont) return;
  cont.innerHTML = '';
  try{
    const respuesta = await fetch('/api/memories', { credentials: 'include' });
    if(respuesta.status === 401){
      cont.innerHTML = '<div class="empty-state">' + t('memoria.requiereSesion') + '</div>';
      return;
    }
    if(!respuesta.ok) throw new Error('error');
    const datos = await respuesta.json();
    renderizarMemorias(datos.memorias || []);
  }catch(e){
    cont.innerHTML = '<div class="empty-state">❌</div>';
  }
}

function renderizarMemorias(memorias){
  const cont = document.getElementById('memoriasList');
  if(!cont) return;
  cont.innerHTML = '';

  if(!memorias.length){
    cont.innerHTML = '<div class="empty-state">' + t('memoria.vacia') + '</div>';
    return;
  }

  memorias.forEach(m => {
    const item = document.createElement('div');
    item.className = 'memoria-item';
    item.innerHTML = `
      <div class="memoria-texto">${escaparHTML(m.memory_text)}</div>
      <div class="memoria-pie">
        <span class="memoria-cat">${etiquetaCategoria(m.category)}</span>
        <button class="memoria-del" onclick="eliminarMemoria(${m.id})" title="${t('memoria.eliminar')}">✕</button>
      </div>
    `;
    cont.appendChild(item);
  });
}

function etiquetaCategoria(cat){
  const mapa = {
    personal: 'memoria.catPersonal',
    preferencia: 'memoria.catPreferencia',
    proyecto: 'memoria.catProyecto',
    tecnico: 'memoria.catTecnico',
    temas: 'memoria.catTemas'
  };
  return t(mapa[cat] || 'memoria.catPersonal');
}

async function eliminarMemoria(id){
  if(!confirm(t('memoria.eliminarConfirm'))) return;
  try{
    const respuesta = await fetch('/api/memories/' + id, { method: 'DELETE', credentials: 'include' });
    if(!respuesta.ok) throw new Error('error');
    cargarMemorias();
  }catch(e){
    mostrarToastMemoria('❌');
  }
}

function abrirModalMemoria(prefill){
  const texto = document.getElementById('memoriaModalTexto');
  texto.value = prefill || '';
  document.getElementById('memoriaModalCat').value = reglaCategoriaPreferida(prefill);
  document.getElementById('memoriaModal').style.display = 'flex';
  texto.focus();
}

function cerrarModalMemoria(){
  document.getElementById('memoriaModal').style.display = 'none';
}

// Cuando el botón "Recuérdalo" prellenó texto largo (una respuesta), conviene
// la categoría "temas"; si no, dejamos la que el usuario eligió antes.
function reglaCategoriaPreferida(prefill){
  if(prefill && prefill.length > 80) return 'temas';
  return document.getElementById('memoriaModalCat').value || 'personal';
}

async function guardarMemoriaDesdeModal(){
  const inputTexto = document.getElementById('memoriaModalTexto');
  const texto = inputTexto.value.trim();
  if(!texto){
    inputTexto.focus();
    return;
  }
  const categoria = document.getElementById('memoriaModalCat').value || 'personal';
  const btn = document.getElementById('memoriaModalGuardar');
  btn.disabled = true;
  try{
    const respuesta = await fetch('/api/memories', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, categoria })
    });
    if(respuesta.status === 401){
      cerrarModalMemoria();
      mostrarToastMemoria(t('memoria.requiereSesion'));
      return;
    }
    if(!respuesta.ok) throw new Error('error');
    cerrarModalMemoria();
    mostrarToastMemoria('✓ ' + t('memoria.guardada'));
    const viendoMemoria = document.getElementById('vistaMemoria').style.display === 'block';
    if(viendoMemoria) cargarMemorias();
  }catch(e){
    mostrarToastMemoria('❌');
  }finally{
    btn.disabled = false;
  }
}

function mostrarToastMemoria(texto){
  const previo = document.querySelector('.memoria-toast');
  if(previo) previo.remove();
  const toast = document.createElement('div');
  toast.className = 'memoria-toast';
  toast.textContent = texto;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

// Botón elegante "Recuérdalo" en las respuestas del asistente.
function agregarBotonRecordar(burbuja, texto){
  if(!burbuja || !texto || burbuja.querySelector('.msg-recordar')) return;
  const limpiar = String(texto)
    .replace(/\[GENERAR_(IMAGEN|DOC)\][\s\S]*$/i, '')
    .replace(/^\[IMAGEN\]\s*:?.*$/gim, '')
    .trim();
  if(!limpiar) return;
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'msg-recordar';
  boton.title = t('chat.recordar');
  boton.setAttribute('aria-label', t('chat.recordar'));
  boton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>' +
    '<line x1="9" y1="9" x2="15" y2="9"/></svg>' +
    '<span></span>';
  boton.querySelector('span').textContent = t('chat.recordar');
  boton.onclick = () => abrirModalMemoria(limpiar.slice(0, 300));
  burbuja.appendChild(boton);
}

/* Menú de acciones (⋮) en cada mensaje: Editar (imágenes), Recordar y Copiar. */
let menuGlobalEscuchando = false;

function limpiarTextoParaAcciones(texto){
  return String(texto || '')
    .replace(/\[GENERAR_(IMAGEN|DOC)\][\s\S]*$/i, '')
    .replace(/^\[IMAGEN\]\s*:?.*$/gim, '')
    .trim();
}

function cerrarMenusMensaje(){
  document.querySelectorAll('.msg-menu-abierto').forEach(m => m.classList.remove('msg-menu-abierto'));
}

function copiarAlPortapapeles(texto){
  const limpio = limpiarTextoParaAcciones(texto);
  if(!limpio) return;
  const aviso = () => mostrarToastMemoria('✓ ' + (window.FenixImgEditor ? window.FenixImgEditor.t('copiado') : 'Copiado'));
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(limpio).then(aviso, () => copiarConFallback(limpio, aviso));
  } else {
    copiarConFallback(limpio, aviso);
  }
}

function copiarConFallback(texto, onListo){
  const ta = document.createElement('textarea');
  ta.value = texto;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); if(onListo) onListo(); } catch(e){}
  ta.remove();
}

function agregarMenuMensaje(burbuja, texto, imgEl){
  if(!burbuja || burbuja.querySelector('.msg-menu-btn')) return;
  const limpio = limpiarTextoParaAcciones(texto);
  if(!limpio && !imgEl) return;

  const caja = document.createElement('div');
  caja.className = 'msg-menu-caja';
  if(imgEl) caja.dataset.conImagen = '1';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'msg-menu-btn';
  btn.setAttribute('aria-label', '⋮');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';
  caja.appendChild(btn);

  const menu = document.createElement('div');
  menu.className = 'msg-menu';
  const labEditar = window.FenixImgEditor ? window.FenixImgEditor.t('editar') : 'Editar';
  const labCopiar = window.FenixImgEditor ? window.FenixImgEditor.t('copiar') : 'Copiar';
  const labRecordar = t('chat.recordar');

  if(imgEl){
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg><span>' + labEditar + '</span>';
    b.onclick = () => { cerrarMenusMensaje(); if(window.FenixImgEditor) window.FenixImgEditor.editar(imgEl); };
    menu.appendChild(b);
  }
  if(limpio){
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/><line x1="9" y1="9" x2="15" y2="9"/></svg><span>' + labRecordar + '</span>';
    b.onclick = () => { cerrarMenusMensaje(); abrirModalMemoria(limpio.slice(0, 300)); };
    menu.appendChild(b);
  }
  if(limpio){
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>' + labCopiar + '</span>';
    b.onclick = () => { cerrarMenusMensaje(); copiarAlPortapapeles(limpio); };
    menu.appendChild(b);
  }
  if(!menu.children.length) return;
  caja.appendChild(menu);
  burbuja.appendChild(caja);

  btn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    cerrarMenusMensaje();
    menu.classList.add('msg-menu-abierto');
  });

  if(!menuGlobalEscuchando){
    menuGlobalEscuchando = true;
    document.addEventListener('click', (ev) => {
      if(!ev.target.closest('.msg-menu-btn')) cerrarMenusMensaje();
    });
  }
}

/* ======================
   UTILIDAD
====================== */
function escaparHTML(texto){
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/* ======================
   CONFIGURACIÓN
====================== */
function mostrarVistaConfiguracion(){
  ocultarTodasLasVistas();
  document.getElementById('vistaConfiguracion').style.display = 'block';
  sincronizarConfigUI();
}

function sincronizarConfigUI(){
  const tema = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const track = document.querySelector('#toggleTema .toggle-track');
  const label = document.getElementById('temaTextoConfig');
  if(track){
    if(tema === 'dark') track.classList.add('on');
    else track.classList.remove('on');
  }
  if(label) label.textContent = tema === 'dark' ? t('config.oscuro') : t('config.claro');

  document.getElementById('configModelo').value = modeloSeleccionado;

  const guardarH = localStorage.getItem('fenixGuardarHistorial');
  const histTrack = document.querySelector('#toggleHistorial .toggle-track');
  if(guardarH !== 'no' && histTrack){
    histTrack.classList.add('on');
  } else if(histTrack){
    histTrack.classList.remove('on');
  }

  const promptGuardado = localStorage.getItem('fenixSystemPrompt');
  if(promptGuardado){
    document.getElementById('configSystemPrompt').value = promptGuardado;
  }

  const idiomaGuardado = localStorage.getItem('fenixIdioma') || 'es';
  document.getElementById('configIdioma').value = idiomaGuardado;
  idiomaSeleccionado = idiomaGuardado;
}

function seleccionarModeloConfig(modelo){
  modeloSeleccionado = modelo;
  document.getElementById('modeloTextoActual').textContent = nombreModelo(modelo);
  localStorage.setItem('fenixModelo', modelo);
}

function toggleGuardarHistorial(){
  const actual = localStorage.getItem('fenixGuardarHistorial');
  const nuevo = actual === 'no' ? 'si' : 'no';
  localStorage.setItem('fenixGuardarHistorial', nuevo);
  const track = document.querySelector('#toggleHistorial .toggle-track');
  if(nuevo === 'no') track.classList.remove('on');
  else track.classList.add('on');
}

function borrarTodoElHistorial(){
  if(!confirm(t('config.confirmarBorrado'))) return;
  historial = [];
  chatActualId = null;
  proyectos = [];
  proyectoActualId = null;
  archivosBiblioteca = [];
  renderizarRecientes();
  nuevoChat();
  localStorage.removeItem(claveHistorial());
  localStorage.removeItem(claveProyectos());
  if(usuarioGoogleId){
    // Borra también el historial del servidor, sin importar el toggle
    hayCambiosPendientes = true;
    enviarDatosAlServidor();
  }
  alert(t('error.historialEliminado'));
}

// Guardar prompt del sistema cuando cambia el textarea
document.addEventListener('DOMContentLoaded', function(){
  const ta = document.getElementById('configSystemPrompt');
  if(ta){
    ta.addEventListener('input', function(){
      localStorage.setItem('fenixSystemPrompt', this.value);
    });
  }
  const selIdioma = document.getElementById('configIdioma');
  if(selIdioma){
    selIdioma.addEventListener('change', function(){
      localStorage.setItem('fenixIdioma', this.value);
      seleccionarIdioma(this.value);
    });
  }
});

// Cargar modelo guardado al iniciar
(function cargarConfigInicial(){
  cargarDatosGuardados();
  renderizarRecientes();
  const modeloGuardado = localStorage.getItem('fenixModelo');
  if(modeloGuardado){
    modeloSeleccionado = modeloGuardado;
    const el = document.getElementById('modeloTextoActual');
    if(el) el.textContent = nombreModelo(modeloGuardado);
  }
  // Cargar idioma guardado
  const langGuardado = localStorage.getItem('fenixIdioma');
  if(langGuardado){
    actualizarIdiomaActivo(langGuardado);
  }
  aplicarIdioma();
  actualizarSaludo();
})();

/* ======================
   SELECCIÓN DE IDIOMA
====================== */
const nombresIdiomas = {
  es: 'Español', en: 'English', pt: 'Português', fr: 'Français',
  de: 'Deutsch', ja: '日本語', zh: '中文', ar: 'العربية'
};

function mostrarVistaIdioma(){
  ocultarTodasLasVistas();
  document.getElementById('vistaIdioma').style.display = 'block';
  actualizarIdiomaActivo(idiomaSeleccionado);
}

function seleccionarIdioma(lang){
  idiomaSeleccionado = lang;
  localStorage.setItem('fenixIdioma', lang);
  actualizarIdiomaActivo(lang);
}

// Marca una tarjeta de idioma como seleccionada, sin aplicarla todavía
function seleccionarIdiomaVista(lang){
  document.querySelectorAll('.lang-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-lang') === lang);
  });
  idiomaPendiente = lang;
}

// Confirma el idioma elegido en la vista de idiomas y vuelve a Configuración
function confirmarIdioma(){
  if(idiomaPendiente){
    seleccionarIdioma(idiomaPendiente);
  }
  mostrarVistaConfiguracion();
}

function actualizarIdiomaActivo(lang){
  idiomaSeleccionado = lang;
  document.querySelectorAll('.lang-card').forEach(card => {
    if(card.getAttribute('data-lang') === lang){
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
  aplicarIdioma();
}