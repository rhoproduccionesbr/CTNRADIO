// =============================================================================
// CTN Radio — Chat WebSocket Service
// Maneja la conexión WebSocket con reconexión automática
// =============================================================================

const CHAT_SERVER_URL = 'ws://136.248.117.199:3001';
const CHAT_API_URL = 'http://136.248.117.199:3001/api';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_DELAY = 30000;

class ChatService {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectDelay = RECONNECT_DELAY;
    this.reconnectTimer = null;
    this.intentionalClose = false;
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

  // Conectar al servidor WebSocket
  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.intentionalClose = false;
    
    try {
      this.ws = new WebSocket(CHAT_SERVER_URL);
    } catch (err) {
      console.error('[ChatService] Error al crear WebSocket:', err);
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[ChatService] Conectado');
      this.isConnected = true;
      this.reconnectDelay = RECONNECT_DELAY;
      this._notify({ tipo: 'estado', conectado: true });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this._notify(data);
      } catch (e) {
        console.error('[ChatService] Error parseando mensaje:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('[ChatService] Desconectado');
      this.isConnected = false;
      this._notify({ tipo: 'estado', conectado: false });
      if (!this.intentionalClose) {
        this._scheduleReconnect();
      }
    };

    this.ws.onerror = (err) => {
      console.error('[ChatService] Error WS:', err);
    };
  }

  // Reconexión automática con backoff exponencial
  _scheduleReconnect() {
    if (this.reconnectTimer) return;
    console.log(`[ChatService] Reconectando en ${this.reconnectDelay / 1000}s...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, MAX_RECONNECT_DELAY);
  }

  // Enviar un mensaje de chat
  sendMessage(nombre, localidad, texto, adminSecret = null) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
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
    this.ws.send(JSON.stringify(payload));
    return true;
  }

  // Enviar reacción a un mensaje
  sendReaction(messageId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify({ tipo: 'reaccion', id: messageId }));
    return true;
  }

  // --- COMANDOS ADMIN ---
  adminDelete(messageId, secret) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify({ tipo: 'borrar_admin', id: messageId, secret }));
    return true;
  }

  adminEmpty(secret) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify({ tipo: 'vaciar_admin', secret }));
    return true;
  }

  adminBanIp(messageId, secret) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify({ tipo: 'ban_ip', id: messageId, secret }));
    return true;
  }

  // Desconectar
  disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
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
