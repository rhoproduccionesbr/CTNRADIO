import { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAudio } from '../context/AudioContext';
import { Send, Wifi, WifiOff, Users, MessageCircle, ChevronDown, ChevronLeft, MapPin, Heart, ShieldCheck, Smile } from 'lucide-react';
import logoUrl from '../assets/logo.svg';

const ChatModal = ({ isOpen, onClose }) => {
  const { messages, isConnected, connections, sendMessage, sendReaction, markAsViewing } = useChat();
  const { programaEnVivo } = useAudio();
  
  // Perfil
  const [nombre, setNombre] = useState(() => localStorage.getItem('ctn_chat_nombre') || '');
  const [localidad, setLocalidad] = useState(() => localStorage.getItem('ctn_chat_localidad') || '');
  const [isProfileReady, setIsProfileReady] = useState(() => !!localStorage.getItem('ctn_chat_nombre'));
  
  // Helper para detectar si un mensaje es SOLO emojis (max 5 emojis)
  const isOnlyEmojis = (str) => {
    const trimmed = str.replace(/\s+/g, '');
    if (trimmed.length === 0 || trimmed.length > 10) return false;
    // Regex moderno para todos los caracteres pictográficos/emojis
    const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
    return emojiRegex.test(trimmed);
  };
  
  const [texto, setTexto] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  
  const commonEmojis = ['😀', '😂', '😍', '🙏', '🔥', '👍', '❤️', '🎉', '🎶', '📻'];
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && isProfileReady) {
      markAsViewing(true);
    } else {
      markAsViewing(false);
    }
  }, [isOpen, isProfileReady, markAsViewing]);

  useEffect(() => {
    if (!isOpen || !isProfileReady) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isProfileReady]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    setShowScrollBtn(!isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    localStorage.setItem('ctn_chat_nombre', nombre.trim());
    localStorage.setItem('ctn_chat_localidad', localidad.trim());
    setIsProfileReady(true);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmedText = texto.trim();
    if (!trimmedText) return;
    
    // Oculto: Si el nombre empieza con /admin y pone la clave en la localidad o algo así... 
    // Para simplificar, el admin usará el panel. Aquí envía versión normal.
    const sent = sendMessage(nombre, localidad, trimmedText);
    if (sent) {
      setTexto('');
      setShowEmojis(false);
      inputRef.current?.focus();
    }
  };

  const addEmoji = (emoji) => {
    setTexto(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleReaction = (msgId) => {
    sendReaction(msgId);
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const today = new Date();
      const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      
      const timeStr = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
      const dateStr = date.toLocaleDateString('es', { day: '2-digit', month: '2-digit' });
      
      return isToday ? `Hoy ${timeStr}` : `${dateStr} ${timeStr}`;
    } catch {
      return '';
    }
  };

  const nameColors = [
    '#E63946', '#4361EE', '#2EC4B6', '#FF6B35', '#9B5DE5',
    '#F72585', '#4CC9F0', '#06D6A0', '#FFC43D', '#EF476F',
  ];

  const getNameColor = (name) => {
    if (!name) return '#6B7280';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return nameColors[Math.abs(hash) % nameColors.length];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 md:top-0 left-0 right-0 bottom-0 z-40 flex items-center justify-center p-0 sm:p-4 bg-black/40 sm:bg-black/80 backdrop-blur-sm transition-opacity pb-[140px] md:pb-0">
      <div className="w-full h-full sm:h-auto sm:max-h-[85vh] max-w-lg bg-[var(--color-primary)] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/5 relative">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-card-border)] sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="flex items-center gap-1 pl-1 pr-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-bold text-sm text-[var(--text-main)]"
            >
              <ChevronLeft className="w-5 h-5" />
              Atrás
            </button>
            <div className="h-6 w-px bg-[var(--color-card-border)] mx-1"></div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-bold truncate max-w-[140px] sm:max-w-[180px]">
                {programaEnVivo || 'CTN Radio Online'}
              </span>
              <div className="flex items-center gap-2 text-[9px] font-bold">
                <span className={`flex items-center gap-1 ${isConnected ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isConnected ? 'EN LÍNEA' : 'DESCONECTADO'}
                </span>
                <span className="text-[var(--text-muted)] flex items-center gap-1">
                  <Users className="w-3 h-3" /> {connections}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO CONTENIDO */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          
          {/* PANTALLA DE PERFIL */}
          {!isProfileReady ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-black/20 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
                <img src={logoUrl} alt="Logo" className="w-12 h-12 opacity-80" />
              </div>
              <h3 className="text-2xl font-title font-bold mb-2 text-white">¡Únete a la charla!</h3>
              <p className="text-sm text-white/70 mb-8 max-w-xs">
                Ingresa tu nombre para empezar a mensajear con la comunidad en vivo.
              </p>
              
              <form onSubmit={handleSaveProfile} className="w-full max-w-sm space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-text-muted uppercase ml-1">Tu Nombre o Apodo</label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-card-border)] focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-text-muted uppercase ml-1">¿Desde dónde nos escuchas? (Opcional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      maxLength={40}
                      value={localidad}
                      onChange={e => setLocalidad(e.target.value)}
                      placeholder="Ej. Asunción, Py"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-card-border)] focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-accent-red text-white font-bold tracking-wide hover:bg-red-600 active:scale-[0.98] transition-all shadow-lg shadow-red-500/20 mt-4"
                >
                  Entrar al Chat
                </button>
              </form>
            </div>
          ) : (
            
            /* PANTALLA DE CHAT */
            <>
              {/* Marca de agua de fondo */}
              <div 
                className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none bg-center bg-no-repeat bg-[length:200px]"
                style={{ backgroundImage: `url(${logoUrl})` }}
              ></div>

              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-2 py-4 space-y-3 scroll-smooth bg-transparent relative z-10"
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] text-center gap-3 opacity-80">
                    <MessageCircle className="w-12 h-12" />
                    <p className="text-sm">No hay mensajes aún.<br />¡Rompe el hielo!</p>
                  </div>
                )}

                {messages.map((msg) => {
                  const isMe = msg.nombre === nombre && msg.localidad === localidad;
                  const soloEmoji = isOnlyEmojis(msg.texto);
                  
                  return (
                  <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`group relative flex flex-col gap-1 px-4 py-3 transition-all duration-200 shadow-sm sm:max-w-[75%] max-w-[85%] w-fit
                        ${soloEmoji ? 'bg-transparent border-none shadow-none px-1 py-1' : ''}
                        ${!soloEmoji && msg.admin 
                          ? 'bg-[#1e293b] dark:bg-[#1e293b] bg-opacity-10 dark:bg-opacity-80 border border-accent-red/20 text-[var(--text-main)] rounded-xl rounded-tl-sm' 
                          : !soloEmoji && isMe 
                            ? 'bg-emerald-600 border border-emerald-500 text-white rounded-xl rounded-tr-sm' 
                            : !soloEmoji 
                              ? 'bg-[#1e293b] dark:bg-[#1e293b] bg-opacity-10 dark:bg-opacity-80 border border-[var(--color-card-border)] text-[var(--text-main)] rounded-xl rounded-tl-sm'
                              : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          {!isMe && (
                            <div className="flex items-center gap-2 mb-0.5">
                              {msg.admin && (
                                <img src={logoUrl} alt="CTN" className="w-6 h-6 drop-shadow-md" />
                              )}
                              <span 
                                className={`text-sm font-title font-bold truncate max-w-[150px] ${msg.admin ? 'text-accent-red' : ''}`}
                                style={{ color: msg.admin ? undefined : getNameColor(msg.nombre) }}
                              >
                                {msg.admin ? `EQUIPO CTN RADIO` : msg.nombre}
                              </span>
                              {msg.admin && (
                                <ShieldCheck className="w-4 h-4 text-accent-red" />
                              )}
                            </div>
                          )}
                          {!isMe && msg.localidad && (
                            <span className="text-[9px] text-text-muted flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" /> {msg.localidad}
                            </span>
                          )}
                        </div>
                        <span className={`text-[9px] font-mono shrink-0 pt-1 ${isMe && !soloEmoji ? 'opacity-50' : 'text-text-muted'}`}>
                          {formatTime(msg.hora)}
                        </span>
                      </div>
                      
                      <p className={`leading-relaxed break-words mt-1 ${soloEmoji ? 'text-5xl leading-tight' : 'text-sm'} ${msg.admin && !soloEmoji ? 'font-medium' : ''}`}>
                        {msg.texto}
                      </p>

                      {/* Fila inferior: Reacciones */}
                      <div className={`flex items-center justify-end gap-2 mt-1 ${soloEmoji ? '' : '-mr-1 -mb-1'}`}>
                        <button 
                          onClick={() => handleReaction(msg.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all
                            ${msg.reacciones > 0 
                              ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                              : `hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 sm:opacity-100 ${isMe && !soloEmoji ? 'opacity-50 text-white' : 'text-text-muted'}`}`}
                        >
                          <Heart className={`w-3 h-3 ${msg.reacciones > 0 ? 'fill-current' : ''} active:scale-150 transition-transform`} />
                          {msg.reacciones > 0 && <span>{msg.reacciones}</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
                <div ref={messagesEndRef} />
              </div>

              {showScrollBtn && (
                <button
                  onClick={scrollToBottom}
                  className="absolute bottom-20 right-4 z-10 p-2 rounded-full glass-card shadow-lg hover:scale-110 transition-transform text-accent-red"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              )}

              {/* INPUT ZONA */}
              <div className="bg-[var(--color-surface)] border-t border-[var(--color-card-border)] p-3 z-20 flex flex-col gap-2 relative shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                {showEmojis && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide animate-in slide-in-from-bottom-2 fade-in">
                    {commonEmojis.map(emoji => (
                      <button 
                        key={emoji} 
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="text-2xl hover:scale-125 transition-transform p-1.5 focus:outline-none"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2 relative items-end">
                  <button
                    type="button"
                    onClick={() => setShowEmojis(!showEmojis)}
                    className="h-[44px] w-[44px] flex-shrink-0 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder={isConnected ? "Escribe un mensaje..." : "Conectando..."}
                    disabled={!isConnected}
                    maxLength={280}
                    rows={1}
                    className="flex-1 min-h-[44px] max-h-[120px] px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-accent-red/30 text-sm focus:outline-none resize-none transition-all disabled:opacity-50 !scrollbar-hide"
                  />
                  <button
                    type="submit"
                    disabled={!isConnected || !texto.trim()}
                    className="h-[44px] w-[44px] flex-shrink-0 flex items-center justify-center rounded-2xl bg-accent-red text-white hover:bg-red-600 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 shadow-md"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
