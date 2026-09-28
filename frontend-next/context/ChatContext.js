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
    id: String(c.id),
    proyectoId: c.proyectoId == null ? null : String(c.proyectoId),
    mensajes: Array.isArray(c.mensajes) ? c.mensajes.map(normalizarMensaje) : [],
  };
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
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const { autenticado, usuario, cargando: authCargando } = useAuth();
  const owner = authCargando ? null : (autenticado ? String(usuario.id) : 'guest');
  const [loadedOwner, setLoadedOwner] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const chatsRef = useRef([]);
  const proyectosRef = useRef([]);
  const ownerRef = useRef(owner);
  useEffect(() => { ownerRef.current = owner; }, [owner]);
  const syncedRef = useRef(new Map());
  const projectSnapshotRef = useRef('[]');
  const syncQueueRef = useRef(Promise.resolve());
  const historialHabilitado = useCallback(() => localStorage.getItem('fenixGuardarHistorial') !== 'no', []);
  const persistirChats = useCallback((value) => {
    if (owner && historialHabilitado()) {
      try { localStorage.setItem('fenix:chats:' + owner, JSON.stringify(value)); }
      catch { setSyncError('No hay espacio para guardar el historial local.'); }
    }
  }, [owner, historialHabilitado]);
  const enqueueSync = useCallback((task) => {
    const run = syncQueueRef.current.catch(() => {}).then(task);
    syncQueueRef.current = run;
    return run;
  }, []); // Estado global para VoiceModal

  // Cargar tema guardado en localStorage + históricos locales
  useEffect(() => {
    const temaGuardado = localStorage.getItem('fenixTema') || 'light';
    setTema(temaGuardado);
    document.documentElement.setAttribute('data-theme', temaGuardado);

    const modeloGuardado = localStorage.getItem('fenixModelo') || 'auto';
    setModeloSeleccionado(modeloGuardado);

    const busquedaGuardada = localStorage.getItem('fenixBusquedaWeb') || 'auto';
    setBusquedaWeb(busquedaGuardada);

  }, []);

  useEffect(() => { chatsRef.current = chats; }, [chats]);
  useEffect(() => { proyectosRef.current = proyectos; }, [proyectos]);
  useEffect(() => {
    if (!owner) return;
    let cancelled = false;
    setLoadedOwner(null); setSyncError(null);
    setChats([]); setProyectos([]); setChatActualId(null); setProyectoActualId(null); setVoiceModalOpen(false);
    syncedRef.current = new Map();
    (async () => {
      try {
        let data = {chats:[], proyectos:[]};
        if (historialHabilitado()) {
          if (autenticado) data = await apiGet('/api/sincronizar');
          else data = {chats:JSON.parse(localStorage.getItem('fenix:chats:guest') || '[]'), proyectos:JSON.parse(localStorage.getItem('fenix:projects:guest') || '[]')};
        }
        if (cancelled) return;
        const loaded = (data.chats || []).map(normalizarChat);
        const projects = (data.proyectos || []).map(p=>({...p,id:String(p.id)}));
        syncedRef.current = new Map(loaded.map(c=>[c.id,JSON.stringify(c)]));
        projectSnapshotRef.current = JSON.stringify(projects);
        chatsRef.current=loaded; proyectosRef.current=projects;
        setChats(loaded); setProyectos(projects); setLoadedOwner(owner);
      } catch(e) { if (!cancelled) setSyncError('No se pudo cargar el historial. Recarga para reintentar; no se sobrescribirá la nube.'); }
    })();
    return () => { cancelled = true; };
  }, [owner, autenticado, historialHabilitado]);

  useEffect(() => {
    if (!owner || loadedOwner !== owner || !historialHabilitado()) return;
    persistirChats(chats);
    try { localStorage.setItem('fenix:projects:' + owner, JSON.stringify(proyectos)); } catch {}
    if (!autenticado || syncError) return;
    const timer=setTimeout(()=>enqueueSync(async()=>{
      if (ownerRef.current !== owner) return;
      const snapshot=chatsRef.current;
      const changed=snapshot.filter(c=>syncedRef.current.get(c.id)!==JSON.stringify(c));
      const projects=proyectosRef.current;
      const changedProjects=JSON.stringify(projects)!==projectSnapshotRef.current;
      if (!changed.length && !changedProjects) return;
      try {
        const result=await apiPost('/api/sincronizar',{chats:changed,proyectos:changedProjects?projects:[],expectedUserId:owner});
        if (ownerRef.current !== owner) return;
        changed.forEach(c=>syncedRef.current.set(c.id,JSON.stringify({...c,revision:result.revisions[c.id]})));
        projectSnapshotRef.current=JSON.stringify(projects);
        setChats(prev=>prev.map(c=>result.revisions[c.id] ? {...c,revision:result.revisions[c.id]}:c));
      } catch(e) { if(ownerRef.current===owner) setSyncError(e.message); }
    }),1200);
    return ()=>clearTimeout(timer);
  },[chats,proyectos,owner,loadedOwner,autenticado,historialHabilitado,persistirChats,enqueueSync,syncError]);

  const deleteRemote = useCallback(async (chatIds, projectIds = []) => {
    if (!autenticado) return;
    await enqueueSync(async()=>{
      if(ownerRef.current!==owner) throw new Error('La sesión cambió.');
      await apiPost('/api/sincronizar',{chats:[],proyectos:[],deletedChatIds:chatIds,deletedProjectIds:projectIds,expectedUserId:owner});
    });
  },[autenticado,owner,enqueueSync]);

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

  const eliminarChat = useCallback(async (id) => {
    try {
      await deleteRemote([id]);
      setChats(prev=>prev.filter(c=>c.id!==id));
      syncedRef.current.delete(id);
      if (chatActualId === id) setChatActualId(null);
    } catch(e) { setSyncError(e.message); }
  },[chatActualId,deleteRemote]);

  const vaciarHistorial = useCallback(async () => {
    if (!window.confirm('¿Eliminar todos los chats de esta cuenta?')) return;
    try { await deleteRemote(chatsRef.current.map(c=>c.id)); setChats([]); syncedRef.current.clear(); setChatActualId(null); }
    catch(e) { setSyncError(e.message); }
  },[deleteRemote]);

  const borrarTodo = useCallback(async () => {
    if (!window.confirm('¿Eliminar chats, proyectos y archivos de esta cuenta?')) return;
    try {
      await deleteRemote(chatsRef.current.map(c=>c.id),proyectosRef.current.map(p=>p.id));
      setChats([]); setProyectos([]); syncedRef.current.clear(); setChatActualId(null); setProyectoActualId(null);
      setArchivosBiblioteca(prev=>{prev.forEach(f=>URL.revokeObjectURL(f.url)); return [];});
    } catch(e) { setSyncError(e.message); }
  },[deleteRemote]);

  const togglePinChat = useCallback((id) => {
    setChats((prev) => {
      const actualizados = prev.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned } : c
      );
      return actualizados;
    });
  }, []);

  // ========================================
  // PROYECTOS (igual que el frontend clásico: localStorage 'fenixProyectos')
  // ========================================
  const crearProyecto = useCallback((nombre) => {
    const limpio = String(nombre || '').trim();
    if (!limpio) return null;
    const nuevoProyecto = {id:Date.now().toString(),nombre:limpio};
    setProyectos(prev=>[nuevoProyecto,...prev]);
    return nuevoProyecto;
  }, []);

  const eliminarProyecto = useCallback(async (id) => {
    try { await deleteRemote([], [id]); } catch(e) { setSyncError(e.message); return; }
    setProyectos((prev) => prev.filter((p) => p.id !== id));
    // Los chats del proyecto quedan huérfanos pero no se borran
    setChats((prev) => {
      const actualizados = prev.map((c) =>
        c.proyectoId === id ? { ...c, proyectoId: null } : c
      );
      return actualizados;
    });
    if (proyectoActualId === id) setProyectoActualId(null);
  }, [proyectoActualId, deleteRemote]);

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
      const estaBloqueado = nuevosMensajes.some((m) => m.bloqueado);
      if (existe) {
        actualizados = prev.map((c) =>
          c.id === id ? { ...c, mensajes: nuevosMensajes, bloqueado: !!(c.bloqueado || estaBloqueado), fecha: new Date().toISOString() } : c
        );
      } else {
        const primerMensaje = nuevosMensajes.find((m) => m.rol === 'user')?.contenido || 'Nuevo chat';
        const titulo = tituloSugerido || primerMensaje.slice(0, 36);
        const nuevo = {
          id,
          titulo,
          fecha: new Date().toISOString(),
          pinned: false,
          bloqueado: estaBloqueado,
          proyectoId: proyectoActualId, // si entramos al chat desde un proyecto, queda asociado
          mensajes: nuevosMensajes,
        };
        actualizados = [nuevo, ...prev];
      }
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
        owner,
        loadedOwner,
        syncError,
        borrarTodo,
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
        setDocModal,
        panelDoc,
        abrirPanelDoc,
        cerrarPanelDoc,
        togglePanelDoc,
        setPanelDoc,
        voiceModalOpen,
        setVoiceModalOpen,
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