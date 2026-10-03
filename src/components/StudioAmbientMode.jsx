import { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  X, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX, 
  Radio, RadioTower, Sparkles 
} from 'lucide-react';

const AMBIENT_BARS = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  baseH: 15 + Math.sin(i * 0.4) * 10,
  maxH: 50 + Math.abs(Math.sin(i * 0.3)) * 45,
  dur: `${0.4 + (i % 5) * 0.1}s`,
  delay: `${(i % 7) * 0.05}s`
}));

const StudioAmbientMode = ({ isOpen, onClose, contacto: _contacto }) => {
  const { isPlaying, togglePlay, volume, setVolume, programaEnVivo } = useAudio();
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [listeners, setListeners] = useState(null);

  // Screen Wake Lock API — evitar que la pantalla se apague en TVs y tablets
  useEffect(() => {
    if (!isOpen) return;
    let wakeLockSentinel = null;
    const requestWake = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockSentinel = await navigator.wakeLock.request('screen');
        } catch { /* silent */ }
      }
    };
    requestWake();
    return () => {
      if (wakeLockSentinel) wakeLockSentinel.release().catch(() => {});
    };
  }, [isOpen]);

  // Reloj digital en vivo
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Tecla ESC para salir
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Consultar oyentes
  useEffect(() => {
    if (!isOpen) return;
    const fetchListeners = async () => {
      try {
        const res = await fetch('/api/oyentes');
        if (res.ok) {
          const d = await res.json();
          if (d.listeners !== undefined) setListeners(d.listeners);
        }
      } catch { /* silent */ }
    };
    fetchListeners();
    const interval = setInterval(fetchListeners, 25000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch { /* ignore */ }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch { /* ignore */ }
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume || 0.8);
    }
  };

  if (!isOpen) return null;

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const dateFormatted = time.toLocaleDateString('es-PY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-[120] bg-black text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none animate-fade-in">
      
      {/* Background Studio Glow sutil */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-accent-red/10 blur-[160px] rounded-full transition-opacity duration-1000"
          style={{ opacity: isPlaying ? 0.35 : 0.1 }}
        />
        <div className="absolute inset-0 bg-radial from-transparent via-black/60 to-black pointer-events-none" />
      </div>

      {/* TOP BAR: Logo + Estado + Botones de Control */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent-red flex items-center justify-center text-white shadow-lg shadow-accent-red/30">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="font-title font-black text-xl tracking-tight text-white block">
              CTN<span className="text-accent-red">.</span>RADIO
            </span>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-400">
              Modo Cabina · 128 kbps HQ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {listeners !== null && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-300">
              <RadioTower className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="tabular-nums">{listeners}</span>
              <span className="text-zinc-500 font-normal">oyentes en vivo</span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 transition-colors"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Cerrar Modo Cabina (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CENTER: Reloj Digital Gigante + Programa Actual */}
      <div className="relative z-10 my-auto text-center py-8">
        
        {/* Fecha en español */}
        <p className="text-xs sm:text-sm uppercase tracking-[0.3em] font-semibold text-accent-red mb-3">
          {dateFormatted}
        </p>

        {/* Reloj Digital Tabular */}
        <div className="font-mono font-bold tracking-tight text-6xl sm:text-8xl md:text-9xl text-white tabular-nums drop-shadow-2xl">
          <span>{hours}</span>
          <span className="text-accent-red animate-pulse mx-1">:</span>
          <span>{minutes}</span>
          <span className="text-accent-red animate-pulse mx-1 text-4xl sm:text-6xl md:text-7xl">:</span>
          <span className="text-zinc-400 text-4xl sm:text-6xl md:text-7xl">{seconds}</span>
        </div>

        {/* Nombre del Programa al Aire */}
        <div className="mt-8 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-bold uppercase tracking-wider mb-2">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-accent-red animate-pulse' : 'bg-zinc-600'}`} />
            {isPlaying ? 'Transmitiendo en Vivo' : 'Señal Pausada'}
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-title font-black text-white tracking-tight leading-tight">
            {programaEnVivo || 'CTN Radio — En Vivo'}
          </h2>
          <p className="text-xs sm:text-base text-zinc-400 mt-2 font-medium">
            Estudios Centrales · Guarambaré, Paraguay
          </p>
        </div>

        {/* Gran Ecualizador de Estudio de 42 Bandas */}
        <div className="mt-12 max-w-4xl mx-auto flex items-end justify-center gap-1.5 h-20 sm:h-28 px-4">
          {AMBIENT_BARS.map((bar) => {
            const h = isPlaying ? `${bar.maxH}%` : `${bar.baseH * 0.2}%`;
            return (
              <div
                key={bar.id}
                className="flex-1 max-w-[12px] bg-gradient-to-t from-accent-red via-[#ff6b6b] to-white rounded-t-sm transition-all"
                style={{
                  height: h,
                  animationName: isPlaying ? 'pulse' : 'none',
                  animationDuration: bar.dur,
                  animationTimingFunction: 'ease-in-out',
                  animationDelay: bar.delay,
                  animationIterationCount: 'infinite',
                  animationDirection: 'alternate',
                  transitionProperty: 'height',
                  transitionDuration: '250ms',
                  transitionTimingFunction: 'ease-out'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* BOTTOM BAR: Controles Rápidos de Sonido & Contacto */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        
        {/* Control Play/Pausa Maestro */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 shadow-xl ${
              isPlaying
                ? 'bg-accent-red text-white shadow-accent-red/30'
                : 'bg-white text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>

          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-zinc-400 block">
              Audio Stream
            </span>
            <span className="text-sm font-semibold text-white">
              {isPlaying ? 'Emisión en Curso' : 'En Pausa'}
            </span>
          </div>
        </div>

        {/* Control de Volumen Rápido */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
          <button 
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white transition-colors"
            title={volume === 0 ? "Activar sonido" : "Silenciar"}
          >
            {volume === 0 ? <VolumeX className="w-4 h-4 text-accent-red" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 sm:w-32 accent-accent-red cursor-pointer h-1.5 rounded-lg bg-white/20"
            aria-label="Control de volumen en modo cabina"
          />
          <span className="text-xs font-mono tabular-nums text-zinc-400 w-9 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Info Contacto & Dial */}
        <div className="hidden md:flex items-center gap-4 text-xs text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-red" />
            <span>Transmisión Digital de Alta Definición</span>
          </span>
        </div>

      </div>

    </div>
  );
};

export default StudioAmbientMode;
