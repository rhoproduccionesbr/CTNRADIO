import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import chatService from '../services/chatService';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connections, setConnections] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const isViewingChat = useRef(false);

  useEffect(() => {
    // Suscribirse a eventos del chat server
    const unsub = chatService.subscribe((event) => {
      switch (event.tipo) {
        case 'estado':
          setIsConnected(event.conectado);
          break;

        case 'historial':
          setMessages(event.mensajes || []);
          setConnections(event.conexiones || 0);
          break;

        case 'mensaje':
          setMessages(prev => [...prev, event.mensaje]);
          if (!isViewingChat.current) {
            setUnreadCount(prev => prev + 1);
          }
          break;

        case 'reaccion_update':
          setMessages(prev => prev.map(m => m.id === event.id ? { ...m, reacciones: event.count } : m));
          break;

        case 'borrado':
          setMessages(prev => prev.filter(m => m.id !== event.id));
          break;

        case 'vaciado':
          setMessages([]);
          break;

        case 'conexiones':
          setConnections(event.count || 0);
          break;

        case 'error':
          console.warn('[Chat] Error del servidor:', event.mensaje);
          break;
      }
    });

    // Conectar al montar
    chatService.connect();

    return () => {
      unsub();
      chatService.disconnect();
    };
  }, []);

  const sendMessage = useCallback((nombre, localidad, texto, adminSecret = null) => {
    return chatService.sendMessage(nombre, localidad, texto, adminSecret);
  }, []);

  const sendReaction = useCallback((messageId) => {
    return chatService.sendReaction(messageId);
  }, []);

  const markAsViewing = useCallback((viewing) => {
    isViewingChat.current = viewing;
    if (viewing) setUnreadCount(0);
  }, []);

  const getHistory = useCallback(async (date) => {
    return chatService.getHistory(date);
  }, []);

  return (
    <ChatContext.Provider value={{
      messages,
      isConnected,
      connections,
      unreadCount,
      sendMessage,
      sendReaction,
      markAsViewing,
      getHistory,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat debe usarse dentro de ChatProvider');
  return ctx;
}
