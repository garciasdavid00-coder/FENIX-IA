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
   PERSISTENCIA LOCAL (chats, proyectos)
   Se guarda en localStorage; respeta el toggle "Guardar historial".
====================== */
const CLAVE_HISTORIAL = 'fenixChats';
const CLAVE_PROYECTOS = 'fenixProyectos';

function persistirDatos(){
  if(localStorage.getItem('fenixGuardarHistorial') === 'no') return;
  try {
    localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
    localStorage.setItem(CLAVE_PROYECTOS, JSON.stringify(proyectos));
  } catch(e){
    console.error('Error al guardar datos locales:', e);
  }
}

function cargarDatosGuardados(){
  if(localStorage.getItem('fenixGuardarHistorial') === 'no') return;
  try {
    const h = localStorage.getItem(CLAVE_HISTORIAL);
    if(h){
      const arr = JSON.parse(h);
      if(Array.isArray(arr)) historial = arr;
    }
    const p = localStorage.getItem(CLAVE_PROYECTOS);
    if(p){
      const arr = JSON.parse(p);
      if(Array.isArray(arr)) proyectos = arr;
    }
  } catch(e){
    console.error('Error al cargar datos locales:', e);
  }
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

  const typingEl = agregarMensaje('bot', t('chat.escribiendo'), true);

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

  fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if(!ok){
        if(data.error === 'LIMITE'){
          typingEl.remove();
          agregarMensaje('bot', t('modal.limiteAlcanzado', { n: data.limite }));
          mostrarModalLimite();
          return;
        }
        throw { servidor: true, mensaje: data.error || t('error.servidor') };
      }
      typingEl.remove();
      const burbujaBot = agregarMensaje('bot', '');
      escribirTexto(burbujaBot, data.respuesta);
      guardarMensajeEnHistorial('bot', data.respuesta);
    })
    .catch(err => {
      typingEl.remove();
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

/* Solo hace auto-scroll si el usuario ya estaba cerca del final,
   para no interrumpirlo si subió a leer algo anterior */
function estaCercaDelFinalDelChat(contenedor){
  return contenedor.scrollHeight - contenedor.scrollTop - contenedor.clientHeight < 80;
}

/* Escribe el texto de la respuesta letra por letra dentro de una burbuja
   ya existente (creada con agregarMensaje), con scroll que acompaña
   sin saltar de golpe al final */
function escribirTexto(burbuja, textoCompleto, callback){
  const contenedor = document.getElementById('messages');
  const cursor = document.createElement('span');
  cursor.className = 'cursor-escribiendo';

  let i = 0;
  function paso(){
    const debeSeguir = estaCercaDelFinalDelChat(contenedor);
    if(i <= textoCompleto.length){
      burbuja.textContent = textoCompleto.slice(0, i);
      burbuja.appendChild(cursor);
      i++;
      if(debeSeguir) contenedor.scrollTop = contenedor.scrollHeight;
      setTimeout(paso, 15);
    } else {
      cursor.remove();
      if(callback) callback();
    }
  }
  paso();
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

function guardarMensajeEnHistorial(tipo, texto){
  const chat = historial.find(c => c.id === chatActualId);
  if(chat) chat.mensajes.push({ tipo, texto });
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
  localStorage.removeItem(CLAVE_HISTORIAL);
  localStorage.removeItem(CLAVE_PROYECTOS);
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