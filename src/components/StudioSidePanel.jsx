import { useState, useMemo } from 'react';
import { useChat } from '../context/ChatContext';
import { Radio, Clock, MessageSquare, Send, Users, Sparkles, ChevronRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const StudioSidePanel = ({ programas = [], _contacto, onOpenFullChat }) => {
  const { messages, isConnected, connections, sendMessage, sendReaction } = useChat();
  const [quickText, setQuickText] = useState('');
  const [nombre, setNombre] = useState(() => localStorage.getItem('ctn_chat_nombre') || '');
  const [localidad, setLocalidad] = useState(() => localStorage.getItem('ctn_chat_localidad') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  // Calcular programa actual y próximo
  const { programaActual, programaSiguiente } = useMemo(() => {
    if (!programas || programas.length === 0) {
      return { programaActual: null, programaSiguiente: null };
    }

    const ahora = new Date();
    const diaActual = DIAS_SEMANA[ahora.getDay()];
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

    const delDia = programas.filter(p => p.dia === diaActual)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

    if (delDia.length === 0) {
      return { programaActual: null, programaSiguiente: null };
    }

    let actual = delDia.find(p => p.hora_inicio <= horaActual && p.hora_fin > horaActual);
    let siguiente = null;

    if (actual) {
      siguiente = delDia.find(p => p.hora_inicio >= actual.hora_fin) || delDia[0];
    } else {
      siguiente = delDia.find(p => p.hora_inicio > horaActual) || delDia[0];
    }

    return { programaActual: actual, programaSiguiente: siguiente };
  }, [programas]);

  // Manejo de envío rápido de chat
  const handleQuickSend = (e) => {
    e.preventDefault();
    const texto = quickText.trim();
    if (!texto) return;

    if (!nombre.trim()) {
      setShowNamePrompt(true);
      return;
    }

    const ok = sendMessage(nombre, localidad || 'Guarambaré', texto);
    if (ok) setQuickText('');
  };

  const handleSaveNameAndSend = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    localStorage.setItem('ctn_chat_nombre', nombre.trim());
    localStorage.setItem('ctn_chat_localidad', (localidad || 'Oyente').trim());
    setShowNamePrompt(false);
    if (quickText.trim()) {
      sendMessage(nombre.trim(), localidad || 'Oyente', quickText.trim());
      setQuickText('');
    }
  };

  // Últimos 4 mensajes
  const recentMessages = messages.slice(-4);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Widget 1: En Vivo & Programación */}
      <div className="glass-card rounded-3xl p-5 border border-[var(--card-border)] relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              En el Aire Ahora
            </span>
          </div>
          <Link 
            to="/programacion" 
            className="text-[11px] font-semibold text-accent-red hover:underline inline-flex items-center gap-1"
          >
            Ver grilla completa <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {programaActual ? (
          <div className="p-3.5 rounded-2xl bg-[var(--card-border)]/50 border border-[var(--card-border)] mb-3">
            <h4 className="font-title font-bold text-base text-[var(--text-main)] line-clamp-1 mb-1">
              {programaActual.titulo}
            </h4>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Clock className="w-3.5 h-3.5 text-accent-red" />
              <span>{programaActual.hora_inicio} — {programaActual.hora_fin} hs</span>
              {programaActual.locutor && (
                <>
                  <span>·</span>
                  <span className="truncate">{programaActual.locutor}</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[var(--card-border)]/40 border border-[var(--card-border)] mb-3">
            <h4 className="font-title font-bold text-sm text-[var(--text-main)]">
              Música y Programación Continuada
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Éxitos y noticias en vivo desde los estudios de CTN Radio.
            </p>
          </div>
        )}

        {/* Próximo programa */}
        {programaSiguiente && (
          <div className="flex items-center justify-between pt-2 px-1 text-xs text-[var(--text-muted)]">
            <span className="font-medium">A continuación:</span>
            <span className="font-semibold text-[var(--text-main)] truncate max-w-[60%] text-right">
              {programaSiguiente.titulo} ({programaSiguiente.hora_inicio} hs)
            </span>
          </div>
        )}
      </div>

      {/* Widget 2: Chat Comunitario en Vivo */}
      <div className="glass-card rounded-3xl p-5 border border-[var(--card-border)] flex flex-col h-[340px]">
        {/* Cabecera del Chat */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent-red" />
            <h3 className="font-title font-bold text-sm text-[var(--text-main)]">
              Chat en Vivo
            </h3>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-medium">
              <Users className="w-3 h-3" />
              <span>{connections || 1} online</span>
            </div>
            <button
              onClick={onOpenFullChat}
              className="text-[11px] font-semibold text-accent-red hover:underline ml-1"
            >
              Expandir
            </button>
          </div>
        </div>

        {/* Mensajes Recientes */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 scrollbar-hide">
          {recentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-muted)] p-4">
              <Sparkles className="w-6 h-6 text-accent-red/60 mb-2 animate-pulse" />
              <p className="text-xs font-medium">Sé el primero en enviar un saludo al aire</p>
            </div>
          ) : (
            recentMessages.map((msg) => (
              <div 
                key={msg.id || `${msg.nombre}-${msg.timestamp}`}
                className="p-2.5 rounded-xl bg-[var(--card-border)]/40 border border-[var(--card-border)] transition-all hover:bg-[var(--card-border)]/70 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[var(--text-main)] truncate max-w-[130px]">
                    {msg.nombre}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                    {msg.localidad && <span>{msg.localidad} · </span>}
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <p className="text-[var(--text-main)] break-words leading-relaxed">
                  {msg.texto}
                </p>
                {msg.reacciones > 0 && (
                  <button 
                    onClick={() => sendReaction(msg.id)} 
                    className="mt-1 inline-flex items-center gap-1 text-[10px] text-accent-red font-semibold hover:opacity-80 transition-opacity"
                  >
                    <Heart className="w-2.5 h-2.5 fill-current" />
                    <span>{msg.reacciones}</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Formulario de Mensaje Rápido */}
        {showNamePrompt ? (
          <form onSubmit={handleSaveNameAndSend} className="pt-2 border-t border-[var(--card-border)] space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre o apodo"
                required
                className="w-1/2 px-2.5 py-1.5 rounded-xl bg-[var(--card-border)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-accent-red"
              />
              <input
                type="text"
                value={localidad}
                onChange={(e) => setLocalidad(e.target.value)}
                placeholder="Ciudad / Barrio"
                className="w-1/2 px-2.5 py-1.5 rounded-xl bg-[var(--card-border)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-accent-red"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-accent-red hover:bg-[#c92a35] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Guardar y enviar
            </button>
          </form>
        ) : (
          <form onSubmit={handleQuickSend} className="pt-2 border-t border-[var(--card-border)] flex items-center gap-2">
            <input
              type="text"
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder="Mensaje para el estudio..."
              maxLength={180}
              className="flex-1 px-3 py-2 rounded-xl bg-[var(--card-border)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-accent-red transition-all"
            />
            <button
              type="submit"
              disabled={!quickText.trim()}
              className="w-8 h-8 rounded-xl bg-accent-red hover:bg-[#c92a35] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm"
              title="Enviar mensaje"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudioSidePanel;
