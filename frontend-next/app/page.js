'use client';

import { useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import GreetingView from '@/components/GreetingView';
import ChatView from '@/components/ChatView';
import ProjectsView from '@/components/ProjectsView';
import BibliotecaView from '@/components/BibliotecaView';
import SettingsView from '@/components/SettingsView';
import IdiomaView from '@/components/IdiomaView';
import MemoriasView from '@/components/MemoriasView';
import ModalMemoria from '@/components/ModalMemoria';
import ModalDocumento from '@/components/ModalDocumento';
import { useChat } from '@/context/ChatContext';
import { useChatStream } from '@/hooks/useChatStream';

export default function HomePage() {
  const {
    vistaActiva,
    chatActualId,
    setChatActualId,
    chats,
    guardarMensajesEnHistorial,
    modeloSeleccionado,
    busquedaWeb,
  } = useChat();

  const {
    mensajes,
    setMensajes,
    generando,
    enviarMensaje: enviarAlStream,
    detener,
    streamChatIdRef,
  } = useChatStream();

  // Si cambia el chat seleccionado en la barra lateral, cargamos sus mensajes
  useEffect(() => {
    // Si hay un stream en curso que pertenece a OTRO chat (el usuario cambió de
    // chat a mitad de generación), guardamos lo que ya llegó en el chat del
    // stream antes de cargar el nuevo, para no perder la respuesta en curso.
    const chatDelStream = streamChatIdRef.current;
    if (generando && chatDelStream && chatDelStream !== chatActualId) {
      if (mensajes.length > 0) {
        guardarMensajesEnHistorial(chatDelStream, mensajes);
      }
      streamChatIdRef.current = null;
      detener();
    }
    if (chatActualId) {
      const chatEncontrado = chats.find((c) => c.id === chatActualId);
      if (chatEncontrado && Array.isArray(chatEncontrado.mensajes)) {
        setMensajes(chatEncontrado.mensajes);
      }
    } else {
      setMensajes([]);
    }
  }, [chatActualId, chats, setMensajes]);

  // Al completar la generación o haber nuevos mensajes, los guardamos en el historial
  // El ref evita que al crear un chat nuevo (chatActualId en null) se guarden como
  // un chat nuevo los mensajes viejos del chat anterior en el mismo render.
  const prevChatActualIdRef = useRef(chatActualId);
  useEffect(() => {
    if (prevChatActualIdRef.current !== chatActualId) {
      prevChatActualIdRef.current = chatActualId;
      return;
    }
    if (mensajes.length > 0 && !generando) {
      // El resultado del stream se guarda en el chat al que pertenecía al
      // enviarse (streamChatIdRef), aunque el usuario haya cambiado de chat
      // mientras se generaba. Si no había chat stream, cae al chat actual.
      const id = streamChatIdRef.current || chatActualId || Date.now().toString();
      if (!chatActualId) {
        setChatActualId(id);
      }
      guardarMensajesEnHistorial(id, mensajes);
      streamChatIdRef.current = null;
    }
  }, [mensajes, generando, chatActualId, setChatActualId, guardarMensajesEnHistorial]);

  const manejarEnvio = (texto) => {
    enviarAlStream(texto, {
      modelo: modeloSeleccionado,
      webSearch: busquedaWeb,
      chatId: chatActualId,
    });
  };

  const mostrarChat = mensajes.length > 0;

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minHeight: '100dvh', maxHeight: '100dvh', overflow: 'hidden' }}>
      {/* Barra lateral */}
      <Sidebar />

      {/* Área principal */}
      <div className="main">
        <Topbar />

        {/* Vistas dinámicas */}
        {vistaActiva === 'proyectos' && <ProjectsView />}
        {vistaActiva === 'biblioteca' && <BibliotecaView />}
        {vistaActiva === 'configuracion' && <SettingsView />}
        {vistaActiva === 'idioma' && <IdiomaView />}
        {vistaActiva === 'memoria' && <MemoriasView />}

        {vistaActiva === 'chat' && (
          <>
            {!mostrarChat ? (
              <GreetingView
                onEnviarMensaje={manejarEnvio}
                generando={generando}
                detener={detener}
              />
            ) : (
              <ChatView
                mensajes={mensajes}
                generando={generando}
                onEnviarMensaje={manejarEnvio}
                detener={detener}
              />
            )}
          </>
        )}
      </div>

      {/* Modal global de memoria (botón "Recordar") */}
      <ModalMemoria />
      {/* Modal global de vista previa de documentos */}
      <ModalDocumento />
    </div>
  );
}
