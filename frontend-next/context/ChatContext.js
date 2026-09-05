'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [tema, setTema] = useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('chat'); // 'chat' | 'proyectos' | 'biblioteca' | 'memoria' | 'configuracion'
  const [modeloSeleccionado, setModeloSeleccionado] = useState('auto');
  const [chats, setChats] = useState([]);
  const [chatActualId, setChatActualId] = useState(null);
  const [filtroBuscar, setFiltroBuscar] = useState('');
  const [busquedaVisible, setBusquedaVisible] = useState(false);
  const [memoriaModal, setMemoriaModal] = useState(null); // null | { texto }

  // Cargar tema guardado en localStorage
  useEffect(() => {
    const temaGuardado = localStorage.getItem('fenixTema') || 'light';
    setTema(temaGuardado);
    document.documentElement.setAttribute('data-theme', temaGuardado);

    const modeloGuardado = localStorage.getItem('fenixModelo') || 'auto';
    setModeloSeleccionado(modeloGuardado);

    // Cargar historial de chats locales
    try {
      const historialLocal = JSON.parse(localStorage.getItem('fenixHistorial') || '[]');
      setChats(Array.isArray(historialLocal) ? historialLocal : []);
    } catch (e) {
      setChats([]);
    }
  }, []);

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
      localStorage.setItem('fenixHistorial', JSON.stringify(actualizados));
      return actualizados;
    });
    if (chatActualId === id) {
      setChatActualId(null);
    }
  }, [chatActualId]);

  const togglePinChat = useCallback((id) => {
    setChats((prev) => {
      const actualizados = prev.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned } : c
      );
      localStorage.setItem('fenixHistorial', JSON.stringify(actualizados));
      return actualizados;
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
          mensajes: nuevosMensajes,
        };
        actualizados = [nuevo, ...prev];
      }
      localStorage.setItem('fenixHistorial', JSON.stringify(actualizados));
      return actualizados;
    });
  }, []);

  const abrirModalMemoria = useCallback((texto) => {
    setMemoriaModal({ texto: String(texto || '') });
  }, []);

  const cerrarModalMemoria = useCallback(() => {
    setMemoriaModal(null);
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
        chats,
        chatActualId,
        setChatActualId,
        nuevoChat,
        seleccionarChat,
        eliminarChat,
        togglePinChat,
        guardarMensajesEnHistorial,
        filtroBuscar,
        setFiltroBuscar,
        busquedaVisible,
        setBusquedaVisible,
        memoriaModal,
        abrirModalMemoria,
        cerrarModalMemoria,
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
