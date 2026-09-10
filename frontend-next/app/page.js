'use client';

import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import GreetingView from '@/components/GreetingView';
import ChatView from '@/components/ChatView';
import ProjectsView from '@/components/ProjectsView';
import BibliotecaView from '@/components/BibliotecaView';
import SettingsView from '@/components/SettingsView';
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
  } = useChatStream();

  // Si cambia el chat seleccionado en la barra lateral, cargamos sus mensajes
  useEffect(() => {
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
  useEffect(() => {
    if (mensajes.length > 0 && !generando) {
      const id = chatActualId || Date.now().toString();
      if (!chatActualId) {
        setChatActualId(id);
      }
      guardarMensajesEnHistorial(id, mensajes);
    }
  }, [mensajes, generando, chatActualId, setChatActualId, guardarMensajesEnHistorial]);

  const manejarEnvio = (texto) => {
    enviarAlStream(texto, {
      modelo: modeloSeleccionado,
      webSearch: busquedaWeb,
    });
  };

  const mostrarChat = mensajes.length > 0;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Barra lateral */}
      <Sidebar />

      {/* Área principal */}
      <div className="main">
        <Topbar />

        {/* Vistas dinámicas */}
        {vistaActiva === 'proyectos' && <ProjectsView />}
        {vistaActiva === 'biblioteca' && <BibliotecaView />}
        {vistaActiva === 'configuracion' && <SettingsView />}
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
