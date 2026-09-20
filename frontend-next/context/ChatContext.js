'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const ChatContext = createContext(null);

// Convierte mensajes del frontend clásico ({tipo, texto, imagen, documento})
// al esquema de React ({rol, contenido, imagen, documento}) al cargar historial.
function normalizarMensaje(m) {
  if (!m || typeof m !== 'object') return m;
  if (m.rol === 'user' || m.rol === 'bot') return m;
  return {
    id: m.id != null ? m.id : `${Date.now()}-${Math.random()}`,
    rol: m.tipo === 'user' ? 'user' : 'bot',
    contenido: m.texto || '',
    ...(m.fecha ? { fecha: m.fecha } : {}),
    ...(m.imagen ? { imagen: m.imagen } : {}),
    ...(m.documento ? { documento: m.documento } : {}),
    ...(m.edicion ? { edicion: m.edicion } : {}),
  };
}

function normalizarChat(c) {
  if (!c || typeof c !== 'object') return c;
  return {
    ...c,
    mensajes: Array.isArray(c.mensajes) ? c.mensajes.map(normalizarMensaje) : [],
  };
}

// Guarda en las dos claves (vista React 'fenixHistorial' y clásica 'fenixChats')
// para facilitar la migración sin perder datos al cambiar de frontend.
function persistirChats(chats) {
  localStorage.setItem('fenixHistorial', JSON.stringify(chats));
  localStorage.setItem('fenixChats', JSON.stringify(chats));
}

export function ChatProvider({ children }) {
  const [tema, setTema] = useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('chat'); // 'chat' | 'proyectos' | 'biblioteca' | 'memoria' | 'configuracion' | 'idioma'
  const [modeloSeleccionado, setModeloSeleccionado] = useState('auto');
  const [busquedaWeb, setBusquedaWeb] = useState('auto'); // 'auto' | 'on' | 'off'
  const [chats, setChats] = useState([]);
  const [chatActualId, setChatActualId] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [proyectoActualId, setProyectoActualId] = useState(null);
  const [archivosBiblioteca, setArchivosBiblioteca] = useState([]);
  const [filtroBuscar, setFiltroBuscar] = useState('');
  const [busquedaVisible, setBusquedaVisible] = useState(false);
  const [memoriaModal, setMemoriaModal] = useState(null); // null | { texto }
  const [docModal, setDocModal] = useState(null); // null | { titulo, contenido }
  const [panelDoc, setPanelDoc] = useState({ abierto: false, titulo: '', contenido: '' });

  // Cargar tema guardado en localStorage + históricos locales
  useEffect(() => {
    const temaGuardado = localStorage.getItem('fenixTema') || 'light';
    setTema(temaGuardado);
    document.documentElement.setAttribute('data-theme', temaGuardado);

    const modeloGuardado = localStorage.getItem('fenixModelo') || 'auto';
    setModeloSeleccionado(modeloGuardado);

    const busquedaGuardada = localStorage.getItem('fenixBusquedaWeb') || 'auto';
    setBusquedaWeb(busquedaGuardada);

    // Cargar historial de chats locales (con respaldo a la clave del frontend clásico)
    try {
      const guardado = localStorage.getItem('fenixHistorial');
      const historialLocal = guardado ? guardado : (localStorage.getItem('fenixChats') || '[]');
      const arr = JSON.parse(historialLocal);
      setChats(Array.isArray(arr) ? arr.map(normalizarChat) : []);
    } catch (e) {
      setChats([]);
    }

    // Cargar proyectos locales
    try {
      const proyectosGuardados = JSON.parse(localStorage.getItem('fenixProyectos') || '[]');
      setProyectos(Array.isArray(proyectosGuardados) ? proyectosGuardados : []);
    } catch (e) {
      setProyectos([]);
    }
  }, []);

  // Persistir proyectos cuando cambian
  useEffect(() => {
    localStorage.setItem('fenixProyectos', JSON.stringify(proyectos));
  }, [proyectos]);

  // ========================================
  // SINCRONIZACIÓN CON EL SERVIDOR (/api/sincronizar)
  // - Sin sesión: se guarda solo en localStorage.
  // - Con sesión: además se sube a la base de datos con debounce, y al iniciar
  //   sesión se descarga el historial de ESA cuenta. Si la cuenta está vacía
  //   pero el dispositivo tiene chats de invitado, se suben automáticamente.
  // ========================================
  const { autenticado, usuario } = useAuth();
  const chatsRef = useRef(chats);
  const proyectosRef = useRef(proyectos);
  const timerSyncRef = useRef(null);
  const sincronizandoRef = useRef(false);
  const cuentaCargadaRef = useRef({});

  useEffect(() => { chatsRef.current = chats; }, [chats]);
  useEffect(() => { proyectosRef.current = proyectos; }, [proyectos]);

  const historialHabilitado = useCallback(() => {
    try {
      return localStorage.getItem('fenixGuardarHistorial') !== 'no';
    } catch (e) {
      return true;
    }
  }, []);

  const subirDatosAlServidor = useCallback(async () => {
    if (!autenticado || sincronizandoRef.current) return;
    if (!historialHabilitado()) return;
    sincronizandoRef.current = true;
    try {
      await apiPost('/api/sincronizar', {
        chats: chatsRef.current,
        proyectos: proyectosRef.current,
      });
    } catch (e) {
      console.error('[ChatContext] Error al guardar historial en el servidor:', e.message);
    } finally {
      sincronizandoRef.current = false;
    }
  }, [autenticado, historialHabilitado]);

  // Sube los cambios después de una pausa (debounce) para no saturar al servidor
  useEffect(() => {
    if (!autenticado || !historialHabilitado()) return;
    clearTimeout(timerSyncRef.current);
    timerSyncRef.current = setTimeout(subirDatosAlServidor, 1200);
    return () => clearTimeout(timerSyncRef.current);
  }, [chats, proyectos, autenticado, historialHabilitado, subirDatosAlServidor]);

  // Al iniciar sesión: descarga el historial de esa cuenta desde el servidor.
  // Si la cuenta no tiene nada pero hay chats locales de invitado, los sube.
  useEffect(() => {
    if (!autenticado || !usuario?.id) return;
    if (cuentaCargadaRef.current[usuario.id]) return;
    cuentaCargadaRef.current[usuario.id] = true;
    if (!historialHabilitado()) return;
    (async () => {
      try {
        const datos = await apiGet('/api/sincronizar');
        if (!datos || !Array.isArray(datos.chats)) return;
        const chatsServidor = datos.chats.map(normalizarChat);
        const proyectosServidor = Array.isArray(datos.proyectos) ? datos.proyectos : [];
        if (chatsServidor.length === 0 && proyectosServidor.length === 0 && chatsRef.current.length > 0) {
          subirDatosAlServidor();
        } else if (chatsServidor.length || proyectosServidor.length) {
          setChats(chatsServidor);
          setProyectos(proyectosServidor);
          persistirChats(chatsServidor);
          try { localStorage.setItem('fenixProyectos', JSON.stringify(proyectosServidor)); } catch (e) {}
        }
      } catch (e) {
        console.error('[ChatContext] Error al cargar historial del servidor:', e.message);
      }
    })();
  }, [autenticado, usuario?.id, historialHabilitado, subirDatosAlServidor]);

  const toggleTema = useCallback(() => {
    setTema((prev) => {
      const nuevo = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('fenixTema', nuevo);
      document.documentElement.setAttribute('data-theme', nuevo);
      return nuevo;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setSidebarMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  }, []);

  const cambiarModelo = useCallback((nuevoModelo) => {
    setModeloSeleccionado(nuevoModelo);
    localStorage.setItem('fenixModelo', nuevoModelo);
  }, []);

  const cambiarBusquedaWeb = useCallback(() => {
    setBusquedaWeb((prev) => {
      const siguiente = prev === 'auto' ? 'on' : prev === 'on' ? 'off' : 'auto';
      localStorage.setItem('fenixBusquedaWeb', siguiente);
      return siguiente;
    });
  }, []);

  const nuevoChat = useCallback(() => {
    setChatActualId(null);
    setVistaActiva('chat');
    if (sidebarMobileOpen) setSidebarMobileOpen(false);
  }, [sidebarMobileOpen]);

  const seleccionarChat = useCallback((id) => {
    setChatActualId(id);
    setVistaActiva('chat');
    if (sidebarMobileOpen) setSidebarMobileOpen(false);
  }, [sidebarMobileOpen]);

  const eliminarChat = useCallback((id) => {
    setChats((prev) => {
      const actualizados = prev.filter((c) => c.id !== id);
      persistirChats(actualizados);
      return actualizados;
    });
    if (chatActualId === id) {
      setChatActualId(null);
    }
  }, [chatActualId]);

  const vaciarHistorial = useCallback(() => {
    if (confirm('¿Estás seguro de que quieres eliminar TODOS los chats? Esta acción no se puede deshacer.')) {
      setChats([]);
      persistirChats([]);
      setChatActualId(null);
      setVistaActiva('chat');
    }
  }, []);

  const togglePinChat = useCallback((id) => {
    setChats((prev) => {
      const actualizados = prev.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned } : c
      );
      persistirChats(actualizados);
      return actualizados;
    });
  }, []);

  // ========================================
  // PROYECTOS (igual que el frontend clásico: localStorage 'fenixProyectos')
  // ========================================
  const crearProyecto = useCallback((nombre) => {
    const limpio = String(nombre || '').trim();
    if (!limpio) return null;
    let nuevoProyecto = null;
    setProyectos((prev) => {
      nuevoProyecto = { id: Date.now().toString(), nombre: limpio };
      return [nuevoProyecto, ...prev];
    });
    return nuevoProyecto;
  }, []);

  const eliminarProyecto = useCallback((id) => {
    setProyectos((prev) => prev.filter((p) => p.id !== id));
    // Los chats del proyecto quedan huérfanos pero no se borran
    setChats((prev) => {
      const actualizados = prev.map((c) =>
        c.proyectoId === id ? { ...c, proyectoId: null } : c
      );
      persistirChats(actualizados);
      return actualizados;
    });
    if (proyectoActualId === id) setProyectoActualId(null);
  }, [proyectoActualId]);

  const abrirProyecto = useCallback((id) => {
    setProyectoActualId(id);
    setVistaActiva('proyectos');
  }, []);

  const cerrarProyecto = useCallback(() => {
    setProyectoActualId(null);
    setVistaActiva('proyectos');
  }, []);

  const nuevoChatEnProyecto = useCallback(() => {
    setChatActualId(null);
    setVistaActiva('chat');
    if (sidebarMobileOpen) setSidebarMobileOpen(false);
  }, [sidebarMobileOpen]);

  // ========================================
  // BIBLIOTECA (archivos efímeros con object URL, como el clásico)
  // ========================================
  const subirArchivos = useCallback((archivos) => {
    const lista = Array.from(archivos || []);
    if (!lista.length) return;
    const items = lista.map((file) => ({
      id: Date.now() + Math.random().toString(36).slice(2, 8),
      nombre: file.name,
      tipo: file.type,
      tamanoKB: Math.round(file.size / 1024),
      url: URL.createObjectURL(file),
    }));
    setArchivosBiblioteca((prev) => [...items, ...prev]);
  }, []);

  const eliminarArchivoBiblioteca = useCallback((id) => {
    setArchivosBiblioteca((prev) => {
      const archivo = prev.find((a) => a.id === id);
      if (archivo) URL.revokeObjectURL(archivo.url);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const guardarMensajesEnHistorial = useCallback((idChat, nuevosMensajes, tituloSugerido) => {
    setChats((prev) => {
      const id = idChat || Date.now().toString();
      const existe = prev.find((c) => c.id === id);
      let actualizados;
      if (existe) {
        actualizados = prev.map((c) =>
          c.id === id ? { ...c, mensajes: nuevosMensajes, fecha: new Date().toISOString() } : c
        );
      } else {
        const primerMensaje = nuevosMensajes.find((m) => m.rol === 'user')?.contenido || 'Nuevo chat';
        const titulo = tituloSugerido || primerMensaje.slice(0, 36);
        const nuevo = {
          id,
          titulo,
          fecha: new Date().toISOString(),
          pinned: false,
          proyectoId: proyectoActualId, // si entramos al chat desde un proyecto, queda asociado
          mensajes: nuevosMensajes,
        };
        actualizados = [nuevo, ...prev];
      }
      persistirChats(actualizados);
      return actualizados;
    });
  }, [proyectoActualId]);

  const abrirModalMemoria = useCallback((texto) => {
    setMemoriaModal({ texto: String(texto || '') });
  }, []);

  const cerrarModalMemoria = useCallback(() => {
    setMemoriaModal(null);
  }, []);

  const abrirDocModal = useCallback((titulo, contenido) => {
    setDocModal({ titulo: String(titulo || 'Documento'), contenido: String(contenido || '') });
  }, []);

  const cerrarDocModal = useCallback(() => {
    setDocModal(null);
  }, []);

  const abrirPanelDoc = useCallback((titulo, contenido) => {
    setPanelDoc({
      abierto: true,
      titulo: String(titulo || 'Documento Fenix IA'),
      contenido: String(contenido || ''),
    });
  }, []);

  const cerrarPanelDoc = useCallback(() => {
    setPanelDoc((prev) => ({ ...prev, abierto: false }));
  }, []);

  const togglePanelDoc = useCallback(() => {
    setPanelDoc((prev) => ({ ...prev, abierto: !prev.abierto }));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        tema,
        toggleTema,
        sidebarCollapsed,
        sidebarMobileOpen,
        setSidebarMobileOpen,
        toggleSidebar,
        vistaActiva,
        setVistaActiva,
        modeloSeleccionado,
        cambiarModelo,
        busquedaWeb,
        cambiarBusquedaWeb,
        chats,
        chatActualId,
        setChatActualId,
        nuevoChat,
        seleccionarChat,
        eliminarChat,
        vaciarHistorial,
        togglePinChat,
        guardarMensajesEnHistorial,
        proyectos,
        crearProyecto,
        eliminarProyecto,
        abrirProyecto,
        cerrarProyecto,
        proyectoActualId,
        nuevoChatEnProyecto,
        archivosBiblioteca,
        subirArchivos,
        eliminarArchivoBiblioteca,
        filtroBuscar,
        setFiltroBuscar,
        busquedaVisible,
        setBusquedaVisible,
        memoriaModal,
        abrirModalMemoria,
        cerrarModalMemoria,
        docModal,
        abrirDocModal,
        cerrarDocModal,
        panelDoc,
        abrirPanelDoc,
        cerrarPanelDoc,
        togglePanelDoc,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de un ChatProvider');
  }
  return context;
}