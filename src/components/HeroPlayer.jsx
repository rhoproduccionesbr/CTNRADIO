import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio, isLocalOrNative } from '../context/AudioContext';
import { useChat } from '../context/ChatContext';
import { 
    Play, Pause, Loader2, MessageCircle, RadioTower, 
    Signal, WifiOff, Volume2, VolumeX, Share2, Check, 
    Timer, Hourglass, Maximize2 
} from 'lucide-react';
import ChatModal from './ChatModal';
import StudioAmbientMode from './StudioAmbientMode';
import CoverViewerModal from './CoverViewerModal';
import SleepTimerModal from './SleepTimerModal';
import FrequencyVisualizer from './FrequencyVisualizer';

const HeroPlayer = ({ contacto, galeria = [] }) => {
    const { 
        isPlaying, isBuffering, togglePlay, isLoading, error, 
        programaEnVivo, streamQuality, volume, setVolume,
        sleepTimerMinutes, sleepRemainingSeconds 
    } = useAudio();
    const { unreadCount } = useChat();
    
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isAmbientOpen, setIsAmbientOpen] = useState(false);
    const [isCoverOpen, setIsCoverOpen] = useState(false);
    const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
    const [listenersCount, setListenersCount] = useState(null);
    const [photoOpacity, setPhotoOpacity] = useState(1);
    const [copiedShare, setCopiedShare] = useState(false);
    const [prevVolume, setPrevVolume] = useState(0.8);
    const [showVolumePopup, setShowVolumePopup] = useState(false);
    const volumeRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (volumeRef.current && !volumeRef.current.contains(e.target)) {
                setShowVolumePopup(false);
            }
        };
        if (showVolumePopup) {
            document.addEventListener('mousedown', handleOutsideClick);
            document.addEventListener('touchstart', handleOutsideClick);
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, [showVolumePopup]);

    // Obtener cantidad de oyentes
    useEffect(() => {
        const fetchListeners = async () => {
            try {
                const url = isLocalOrNative() ? 'https://ctnradio.vercel.app/api/oyentes' : '/api/oyentes';
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.listeners !== undefined) setListenersCount(data.listeners);
                }
            } catch { /* silent */ }
        };
        fetchListeners();
        const interval = setInterval(fetchListeners, 15000);
        return () => clearInterval(interval);
    }, []);

    // Crossfade suave de fotografías de cabina/portadas
    useEffect(() => {
        if (isPlaying && galeria.length > 1) {
            const interval = setInterval(() => {
                setPhotoOpacity(0);
                setTimeout(() => {
                    setCurrentPhotoIndex(prev => (prev + 1) % galeria.length);
                    setPhotoOpacity(1);
                }, 600);
            }, 9000);
            return () => clearInterval(interval);
        }
    }, [isPlaying, galeria]);

    const handleShare = async () => {
        const shareData = {
            title: 'CTN Radio — En Vivo',
            text: 'Escucha CTN Radio en vivo desde Guarambaré al mundo.',
            url: window.location.origin
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch { /* ignorar cancelación */ }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.origin);
                setCopiedShare(true);
                setTimeout(() => setCopiedShare(false), 2500);
            } catch { /* fallback */ }
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

    const currentPhoto = galeria.length > 0 ? galeria[currentPhotoIndex] : null;
    const isDisabled = isLoading;
    const showBuffering = isBuffering && !isLoading;
    const whatsappNum = contacto?.whatsapp?.replace(/[^0-9]/g, '') || '595981000000';

    return (
        <div className="w-full">
            <motion.div 
                animate={{ 
                    borderColor: isPlaying ? 'rgba(230, 57, 70, 0.45)' : 'var(--card-border)',
                    boxShadow: isPlaying 
                        ? '0 20px 45px -10px rgba(230, 57, 70, 0.18)' 
                        : '0 20px 40px -10px rgba(0, 0, 0, 0.4)'
                }}
                transition={{ duration: 0.6 }}
                className="relative rounded-[2rem] overflow-hidden border bg-[var(--surface)]"
            >
                {/* Deck Visual: Imagen de Cabina / Portada */}
                <div 
                    onClick={() => { if (currentPhoto) setIsCoverOpen(true); }}
                    className={`relative w-full h-[320px] sm:h-[400px] overflow-hidden bg-zinc-950 ${
                        currentPhoto ? 'cursor-pointer group/deck' : ''
                    }`}
                >
                    {currentPhoto ? (
                        <>
                            <img 
                                src={currentPhoto.imageUrl} 
                                alt={currentPhoto.caption || "Cabina CTN Radio"} 
                                className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover/deck:scale-105"
                                style={{ 
                                    opacity: photoOpacity, 
                                    transform: `scale(${isPlaying ? 1.04 : 1})`,
                                    transition: 'opacity 0.7s ease, transform 10s ease-out' 
                                }}
                            />
                            {/* Scrim medido */}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-black/40" />

                            {/* Botón flotante para ver afiche completo sin recortes */}
                            <motion.button
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsCoverOpen(true);
                                }}
                                className="absolute bottom-5 right-5 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black text-white text-xs font-bold border border-white/20 shadow-xl backdrop-blur-md transition-all active:scale-95 group/btn cursor-pointer"
                                title="Ver afiche completo en alta definición"
                            >
                                <Maximize2 className="w-3.5 h-3.5 text-accent-red group-hover/btn:scale-110 transition-transform" />
                                <span>Ver afiche completo</span>
                            </motion.button>
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                                <div className="w-[500px] h-[500px] rounded-full border border-white/20 animate-pulse" />
                                <div className="w-[340px] h-[340px] rounded-full border border-white/20" />
                                <div className="w-[180px] h-[180px] rounded-full border border-white/20" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
                        </div>
                    )}

                    {/* Barra Superior del Deck: Estado + Frecuencia + Oyentes */}
                    <div className="absolute top-0 left-0 right-0 p-5 sm:p-6 flex items-center justify-between z-10 pointer-events-none">
                        {/* Estado On-Air */}
                        <div className="flex items-center gap-2 pointer-events-auto">
                            <motion.div 
                                animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md border ${
                                    isPlaying 
                                        ? 'bg-accent-red/20 text-accent-red border-accent-red/40 shadow-lg shadow-accent-red/25' 
                                        : isBuffering 
                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                                            : 'bg-black/40 text-zinc-400 border-white/10'
                                }`}
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                    {isPlaying && (
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
                                    )}
                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                        isPlaying ? 'bg-accent-red' : 
                                        isBuffering ? 'bg-amber-400 animate-pulse' : 'bg-zinc-500'
                                    }`} />
                                </span>
                                
                                <span className="uppercase text-[11px] font-black tracking-wider">
                                    {isBuffering ? 'Conectando...' : isPlaying ? 'Al Aire' : 'Señal Pausada'}
                                </span>

                                {isPlaying && (
                                    <span className="flex items-end gap-[2px] h-3 ml-0.5" aria-hidden="true">
                                        <span className="w-[2.5px] bg-accent-red rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2.5" />
                                        <span className="w-[2.5px] bg-accent-red rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.15s] h-3.5" />
                                        <span className="w-[2.5px] bg-accent-red rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.3s] h-2" />
                                    </span>
                                )}
                            </motion.div>

                            <span className="hidden sm:inline-flex text-xs font-medium text-zinc-400 backdrop-blur-md bg-black/30 px-3 py-1.5 rounded-full border border-white/10">
                                128 kbps HQ · FM & Digital
                            </span>
                        </div>

                        {/* Oyentes y Señal */}
                        <div className="flex items-center gap-2 pointer-events-auto">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 backdrop-blur-md bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                                <RadioTower className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                <span className="tabular-nums">{listenersCount ?? 1}</span>
                                <span className="text-zinc-400 font-normal">oyentes</span>
                            </div>

                            {isPlaying && (
                                <div className="hidden sm:flex items-center gap-1 text-xs backdrop-blur-md bg-black/40 px-2.5 py-1.5 rounded-full border border-white/10 text-zinc-300">
                                    {streamQuality === 'reconnecting' ? (
                                        <WifiOff className="w-3.5 h-3.5 text-red-400" />
                                    ) : (
                                        <Signal className="w-3.5 h-3.5 text-emerald-400" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Horizonte Espectral de Estudio (Web Audio API) */}
                <FrequencyVisualizer />

                {/* Panel de Controles & Metadatos */}
                <div className="p-6 sm:p-8 bg-[var(--surface)] backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        
                        {/* Izquierda: Botón Play Maestro con Framer Motion Spring */}
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                            <div className="relative shrink-0">
                                {isPlaying && (
                                    <motion.div
                                        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.1, 0.6] }}
                                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -inset-1.5 rounded-2xl bg-accent-red/35 blur-md pointer-events-none"
                                    />
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.92 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    onClick={togglePlay}
                                    disabled={isDisabled}
                                    aria-label={isPlaying ? "Pausar transmisión" : "Reproducir transmisión"}
                                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-xl relative group ${
                                        isPlaying 
                                            ? 'bg-accent-red text-white shadow-accent-red/30' 
                                            : 'bg-[var(--text-main)] text-[var(--primary)] hover:opacity-90'
                                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading || showBuffering ? (
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    ) : isPlaying ? (
                                        <Pause className="w-8 h-8 fill-current" />
                                    ) : (
                                        <Play className="w-8 h-8 fill-current ml-1" />
                                    )}
                                </motion.button>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-xs font-semibold text-accent-red uppercase tracking-wider mb-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
                                    <span>CTN Radio 24 Horas</span>
                                </div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-title font-black text-[var(--text-main)] truncate tracking-tight">
                                    {programaEnVivo || 'Programación en Vivo'}
                                </h1>
                                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 truncate">
                                    Desde los estudios centrales en Guarambaré hacia todo el mundo
                                </p>
                            </div>
                        </div>

                        {/* Derecha: Acciones organizadas en una sola línea */}
                        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 justify-end">
                            
                            {/* Botón Volumen Desplegable */}
                            <div className="relative" ref={volumeRef}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => setShowVolumePopup(prev => !prev)}
                                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border text-xs font-bold transition-all ${
                                        showVolumePopup || volume === 0
                                            ? 'bg-accent-red/15 text-accent-red border-accent-red/30'
                                            : 'bg-[var(--card-border)]/60 hover:bg-[var(--card-border)] text-[var(--text-main)] border-[var(--card-border)]'
                                    }`}
                                    title="Ajustar volumen"
                                    aria-label="Ajustar volumen"
                                >
                                    {volume === 0 ? <VolumeX className="w-4 h-4 text-accent-red" /> : <Volume2 className="w-4 h-4" />}
                                </motion.button>

                                {/* Popover Desplegable de Volumen */}
                                <AnimatePresence>
                                    {showVolumePopup && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 p-3 rounded-2xl bg-[var(--surface)] backdrop-blur-2xl border border-[var(--card-border)] shadow-2xl flex flex-col items-center gap-2.5 w-44"
                                        >
                                            <div className="flex items-center justify-between w-full px-1">
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Volumen</span>
                                                <span className="text-xs font-mono font-bold text-accent-red tabular-nums">
                                                    {Math.round(volume * 100)}%
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 w-full">
                                                <button 
                                                    onClick={toggleMute}
                                                    className="text-[var(--text-muted)] hover:text-accent-red p-1 transition-colors"
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
                                                    className="w-full accent-accent-red cursor-pointer h-2 rounded-lg bg-[var(--card-border)]"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Botón Sleep Timer */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setIsSleepModalOpen(true)}
                                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border text-xs font-bold transition-all relative ${
                                    sleepTimerMinutes !== null
                                        ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30'
                                        : 'bg-[var(--card-border)]/60 hover:bg-[var(--card-border)] text-[var(--text-main)] border-[var(--card-border)]'
                                }`}
                                title={sleepTimerMinutes !== null ? `Apagado en ${Math.ceil(sleepRemainingSeconds / 60)} min` : "Temporizador de apagado"}
                                aria-label="Temporizador de apagado"
                            >
                                {sleepTimerMinutes !== null ? (
                                    <>
                                        <Hourglass className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                                        <span className="absolute -top-1 -right-1 px-1 py-0.2 text-[8px] font-bold bg-amber-500 text-black rounded-full font-mono">
                                            {Math.ceil(sleepRemainingSeconds / 60)}m
                                        </span>
                                    </>
                                ) : (
                                    <Timer className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                )}
                            </motion.button>

                            {/* Botón WhatsApp Cabina */}
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.94 }}
                                href={`https://wa.me/${whatsappNum}?text=Hola%20CTN%20Radio,%20los%20estoy%20escuchando%20en%20vivo!`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all"
                                title="Enviar mensaje al estudio por WhatsApp"
                                aria-label="WhatsApp cabina"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </motion.a>

                            {/* Botón Modo Pantalla Completa / Cabina */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setIsAmbientOpen(true)}
                                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-[var(--card-border)]/60 hover:bg-[var(--card-border)] text-[var(--text-main)] border border-[var(--card-border)] text-xs font-bold transition-all"
                                title="Pantalla Completa / Modo Estudio"
                                aria-label="Modo Pantalla Completa"
                            >
                                <Maximize2 className="w-4 h-4 text-accent-red" />
                            </motion.button>

                            {/* Botón Compartir */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={handleShare}
                                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-[var(--card-border)]/60 hover:bg-[var(--card-border)] text-[var(--text-main)] border border-[var(--card-border)] text-xs font-bold transition-all"
                                title="Compartir estación"
                                aria-label="Compartir estación"
                            >
                                {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                            </motion.button>

                            {/* Botón Chat Modal */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setIsChatOpen(true)}
                                className="h-9 sm:h-11 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 bg-accent-red hover:bg-[#c92a35] text-white text-xs font-bold transition-all shadow-md shadow-accent-red/20 relative shrink-0"
                                title="Abrir Chat de la Radio"
                                aria-label="Abrir Chat de la Radio"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Chat</span>
                                {unreadCount > 0 && (
                                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                )}
                            </motion.button>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium flex items-center gap-2">
                            <WifiOff className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Modal de Chat con Framer Motion */}
            <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            {/* Modo Cabina */}
            <StudioAmbientMode 
                isOpen={isAmbientOpen} 
                onClose={() => setIsAmbientOpen(false)} 
                contacto={contacto} 
            />

            {/* Visor de Afiche / Carátula a Pantalla Completa con Framer Motion */}
            <CoverViewerModal
                isOpen={isCoverOpen}
                onClose={() => setIsCoverOpen(false)}
                photo={currentPhoto}
                programaEnVivo={programaEnVivo}
                contacto={contacto}
            />

            {/* Temporizador de Apagado con Framer Motion */}
            <SleepTimerModal
                isOpen={isSleepModalOpen}
                onClose={() => setIsSleepModalOpen(false)}
            />
        </div>
    );
};

export default HeroPlayer;
