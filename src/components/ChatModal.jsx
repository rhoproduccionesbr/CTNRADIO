import { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAudio } from '../context/AudioContext';
import { Send, Wifi, WifiOff, Users, MessageCircle, ChevronDown, X, MapPin, Heart, ShieldCheck, Smile, Radio } from 'lucide-react';
import logoUrl from '../assets/logo.svg';

const ChatModal = ({ isOpen, onClose }) => {
  const { messages, isConnected, connections, sendMessage, sendReaction, markAsViewing } = useChat();
  const { programaEnVivo } = useAudio();
  
  const [nombre, setNombre] = useState(() => localStorage.getItem('ctn_chat_nombre') || '');
  const [localidad, setLocalidad] = useState(() => localStorage.getItem('ctn_chat_localidad') || '');
  const [isProfileReady, setIsProfileReady] = useState(() => !!localStorage.getItem('ctn_chat_nombre'));
  
  const isOnlyEmojis = (str) => {
    const trimmed = str.replace(/\s+/g, '');
    if (trimmed.length === 0 || trimmed.length > 10) return false;
    const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
    return emojiRegex.test(trimmed);
  };
  
  const [texto, setTexto] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  
  const commonEmojis = ['😀', '😂', '😍', '🙏', '🔥', '👍', '❤️', '🎉', '🎶', '📻', '💯', '👏'];
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && isProfileReady) markAsViewing(true);
    else markAsViewing(false);
  }, [isOpen, isProfileReady, markAsViewing]);

  useEffect(() => {
    if (!isOpen || !isProfileReady) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (isNearBottom) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isProfileReady]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    setShowScrollBtn(container.scrollHeight - container.scrollTop - container.clientHeight >= 120);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

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
    const sent = sendMessage(nombre, localidad, trimmedText);
    if (sent) { setTexto(''); setShowEmojis(false); inputRef.current?.focus(); }
  };

  const addEmoji = (emoji) => { setTexto(prev => prev + emoji); inputRef.current?.focus(); };
  const handleReaction = (msgId) => sendReaction(msgId);

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const today = new Date();
      const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      const timeStr = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
      return isToday ? timeStr : `${date.toLocaleDateString('es', { day: '2-digit', month: '2-digit' })} ${timeStr}`;
    } catch { return ''; }
  };

  const nameColors = ['#E63946', '#4361EE', '#2EC4B6', '#FF6B35', '#9B5DE5', '#F72585', '#4CC9F0', '#06D6A0', '#FFC43D', '#EF476F'];
  const getNameColor = (name) => {
    if (!name) return '#6B7280';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return nameColors[Math.abs(hash) % nameColors.length];
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="w-full h-[85vh] sm:h-auto sm:max-h-[80vh] max-w-md bg-[#0d0d12] sm:rounded-3xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden relative border border-white/[0.06] animate-slide-in-bottom mb-[3.8rem] sm:mb-0"
        onClick={e => e.stopPropagation()}
      >
        
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-accent-red/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4.5 h-4.5 text-accent-red" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">Chat en Vivo</h3>
              <div className="flex items-center gap-2 text-[10px]">
                <span className={`flex items-center gap-1 font-semibold ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                  {isConnected ? 'Conectado' : 'Sin conexión'}
                </span>
                <span className="text-white/30">·</span>
                <span className="text-white/40 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {connections}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ===== PROGRAMA ACTUAL (banner sutil) ===== */}
        {programaEnVivo && (
          <div className="flex items-center gap-2 px-4 py-2 bg-accent-red/[0.05] border-b border-white/[0.04] text-[10px] text-white/50 font-semibold uppercase tracking-wider shrink-0">
            <Radio className="w-3 h-3 text-accent-red animate-pulse" />
            <span className="truncate">{programaEnVivo}</span>
          </div>
        )}

        {/* ===== CONTENIDO ===== */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          
          {/* PANTALLA DE PERFIL */}
          {!isProfileReady ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6">
                <img src={logoUrl} alt="Logo" className="w-12 h-12 opacity-60" />
              </div>
              <h3 className="text-xl font-title font-bold mb-2 text-white">¡Únete a la charla!</h3>
              <p className="text-sm text-white/40 mb-8 max-w-xs leading-relaxed">
                Ingresa tu nombre para participar en el chat con la comunidad.
              </p>
              
              <form onSubmit={handleSaveProfile} className="w-full max-w-sm space-y-3">
                <div>
                  <input
                    type="text" required maxLength={30}
                    value={nombre} onChange={e => setNombre(e.target.value)}
                    placeholder="Tu nombre o apodo"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red/30 transition-all"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text" maxLength={40}
                    value={localidad} onChange={e => setLocalidad(e.target.value)}
                    placeholder="¿Desde dónde nos escuchas? (opcional)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red/30 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-accent-red text-white font-bold text-sm hover:bg-red-600 active:scale-[0.98] transition-all shadow-lg shadow-accent-red/20 mt-2"
                >
                  Entrar al Chat
                </button>
              </form>
            </div>
          ) : (
            
            /* PANTALLA DE CHAT */
            <>
              {/* Marca de agua */}
              <div 
                className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-center bg-no-repeat bg-[length:160px]"
                style={{ backgroundImage: `url(${logoUrl})` }}
              ></div>

              {/* Mensajes */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scroll-smooth relative z-10 scrollbar-hide"
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-white/20 text-center gap-3">
                    <MessageCircle className="w-10 h-10" />
                    <p className="text-sm">No hay mensajes aún.<br/>¡Sé el primero!</p>
                  </div>
                )}

                {messages.map((msg) => {
                  const isMe = msg.nombre === nombre && msg.localidad === localidad;
                  const soloEmoji = isOnlyEmojis(msg.texto);
                  
                  return (
                    <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`group relative flex flex-col max-w-[80%] transition-all duration-200
                          ${soloEmoji 
                            ? 'px-1 py-0.5' 
                            : msg.admin
                              ? 'bg-accent-red/[0.08] border border-accent-red/15 rounded-2xl rounded-tl-md px-3.5 py-2.5'
                              : isMe 
                                ? 'bg-accent-red rounded-2xl rounded-tr-md px-3.5 py-2.5 shadow-sm shadow-accent-red/10'
                                : 'bg-white/[0.05] border border-white/[0.06] rounded-2xl rounded-tl-md px-3.5 py-2.5'
                          }`}
                      >
                        {/* Header: nombre + hora */}
                        <div className="flex items-center justify-between gap-3 mb-0.5">
                          {!isMe && (
                            <div className="flex items-center gap-1.5 min-w-0">
                              {msg.admin && <img src={logoUrl} alt="CTN" className="w-4 h-4 shrink-0" />}
                              <span 
                                className={`text-[12px] font-bold truncate ${msg.admin ? 'text-accent-red' : ''}`}
                                style={{ color: msg.admin ? undefined : getNameColor(msg.nombre) }}
                              >
                                {msg.admin ? 'CTN RADIO' : msg.nombre}
                              </span>
                              {msg.admin && <ShieldCheck className="w-3 h-3 text-accent-red shrink-0" />}
                              {!msg.admin && msg.localidad && (
                                <span className="text-[9px] text-white/25 flex items-center gap-0.5 shrink-0">
                                  <MapPin className="w-2 h-2" /> {msg.localidad}
                                </span>
                              )}
                            </div>
                          )}
                          <span className={`text-[9px] shrink-0 ${isMe && !soloEmoji ? 'text-white/50' : 'text-white/20'} ${isMe && !soloEmoji ? '' : 'ml-auto'}`}>
                            {formatTime(msg.hora)}
                          </span>
                        </div>
                        
                        {/* Texto */}
                        <p className={`leading-relaxed break-words ${soloEmoji ? 'text-4xl' : 'text-[13px]'} ${isMe && !soloEmoji ? 'text-white' : soloEmoji ? '' : 'text-white/80'} ${msg.admin ? 'font-medium' : ''}`}>
                          {msg.texto}
                        </p>

                        {/* Reacciones */}
                        {!soloEmoji && (
                          <div className="flex items-center justify-end mt-1 -mr-1 -mb-0.5">
                            <button 
                              onClick={() => handleReaction(msg.id)}
                              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-all
                                ${msg.reacciones > 0 
                                  ? 'bg-rose-500/15 text-rose-400' 
                                  : `opacity-0 group-hover:opacity-100 ${isMe ? 'text-white/40 hover:text-white/70' : 'text-white/20 hover:text-white/50'}`
                                }`}
                            >
                              <Heart className={`w-2.5 h-2.5 ${msg.reacciones > 0 ? 'fill-current' : ''}`} />
                              {msg.reacciones > 0 && <span>{msg.reacciones}</span>}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Botón scroll abajo */}
              {showScrollBtn && (
                <button
                  onClick={scrollToBottom}
                  className="absolute bottom-20 right-3 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg flex items-center justify-center hover:bg-white/20 transition-all text-white/60"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}

              {/* ===== INPUT ===== */}
              <div className="bg-[#0d0d12] border-t border-white/[0.06] p-3 z-20 shrink-0">
                {/* Emoji picker */}
                {showEmojis && (
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 px-1 scrollbar-hide animate-fade-in">
                    {commonEmojis.map(emoji => (
                      <button 
                        key={emoji} type="button"
                        onClick={() => addEmoji(emoji)}
                        className="text-xl hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-white/5"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2 items-end">
                  <button
                    type="button"
                    onClick={() => setShowEmojis(!showEmojis)}
                    className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl transition-all ${showEmojis ? 'bg-accent-red/10 text-accent-red' : 'bg-white/[0.04] text-white/30 hover:text-white/60 hover:bg-white/[0.08]'}`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }}}
                      placeholder={isConnected ? "Escribe un mensaje..." : "Conectando..."}
                      disabled={!isConnected}
                      maxLength={280}
                      rows={1}
                      className="w-full min-h-[40px] max-h-[100px] px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent-red/20 resize-none transition-all disabled:opacity-40 scrollbar-hide"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isConnected || !texto.trim()}
                    className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-accent-red text-white hover:bg-red-600 active:scale-90 transition-all disabled:opacity-20 disabled:scale-100 shadow-lg shadow-accent-red/15"
                  >
                    <Send className="w-4.5 h-4.5" />
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
