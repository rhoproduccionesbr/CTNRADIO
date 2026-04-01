// =============================================================================
// CTN Radio — Chat WebSocket Service (Socket.IO version)
// Maneja la conexión con reconexión nativa de socket.io y evasión de proxies SSL
// =============================================================================

import { io } from 'socket.io-client';

const CHAT_API_URL = 'http://136.248.117.199:3001/api';

class ChatService {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.isConnected = false;
  }

  // Suscribirse a eventos del chat
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notificar a todos los suscriptores
  _notify(event) {
    for (const listener of this.listeners) {
      try { listener(event); } catch (e) { console.error('[ChatService] Listener error:', e); }
    }
  }

  // Conectar al servidor WebSocket vía Proxy (Vite o Vercel)
  connect() {
    if (this.socket?.connected) return;

    this.intentionalClose = false;
    console.log('[ChatService] Conectando vía Vercel Proxy...');

    // Usar la ruta proxy configurada en vercel.json y vite.config.js
    this.socket = io({
      path: '/socket.io/',
      // Forzar polling para evadir bloqueos de WebSocket puro sobre Edge
      transports: ['polling', 'websocket'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });
    this.socket.on('connect', () => {
      console.log('[ChatService] Conectado exitosamente');
      this.isConnected = true;
      this._notify({ tipo: 'estado', conectado: true });
    });

    this.socket.on('mensaje_servidor', (data) => {
      this._notify(data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[ChatService] Desconectado (${reason})`);
      this.isConnected = false;
      this._notify({ tipo: 'estado', conectado: false });
    });

    this.socket.on('connect_error', (err) => {
      console.error('[ChatService] Error WS:', err.message);
    });
  }

  // Enviar un mensaje de chat
  sendMessage(nombre, localidad, texto, adminSecret = null) {
    if (!this.socket?.connected) {
      console.warn('[ChatService] No conectado, no se puede enviar');
      return false;
    }
    const payload = {
      tipo: 'mensaje',
      nombre: nombre || 'Anónimo',
      localidad: localidad || '',
      texto,
    };
    if (adminSecret) payload.secret = adminSecret;
    this.socket.emit('mensaje_cliente', payload);
    return true;
  }

  // Enviar reacción a un mensaje
  sendReaction(messageId) {
    if (!this.socket?.connected) return false;
    this.socket.emit('mensaje_cliente', { tipo: 'reaccion', id: messageId });
    return true;
  }

  // --- COMANDOS ADMIN ---
  adminDelete(messageId, secret) {
    if (!this.socket?.connected) return false;
    this.socket.emit('mensaje_cliente', { tipo: 'borrar_admin', id: messageId, secret });
    return true;
  }

  adminEmpty(secret) {
    if (!this.socket?.connected) return false;
    this.socket.emit('mensaje_cliente', { tipo: 'vaciar_admin', secret });
    return true;
  }

  adminBanIp(messageId, secret) {
    if (!this.socket?.connected) return false;
    this.socket.emit('mensaje_cliente', { tipo: 'ban_ip', id: messageId, secret });
    return true;
  }

  // Desconectar
  disconnect() {
    this.intentionalClose = true;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  // REST API: obtener historial de un día
  async getHistory(date) {
    try {
      const res = await fetch(`${CHAT_API_URL}/history?date=${date}`);
      return await res.json();
    } catch (err) {
      console.error('[ChatService] Error obteniendo historial:', err);
      return { date, count: 0, messages: [] };
    }
  }

  // REST API: obtener fechas disponibles
  async getAvailableDates() {
    try {
      const res = await fetch(`${CHAT_API_URL}/history/dates`);
      const data = await res.json();
      return data.dates || [];
    } catch (err) {
      console.error('[ChatService] Error obteniendo fechas:', err);
      return [];
    }
  }

  // REST API: status del servidor
  async getStatus() {
    try {
      const res = await fetch(`${CHAT_API_URL}/status`);
      return await res.json();
    } catch (err) {
      return { status: 'offline', connections: 0 };
    }
  }
}

// Singleton — una sola instancia compartida en toda la app
const chatService = new ChatService();
export default chatService;
