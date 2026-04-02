import { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useChat } from '../context/ChatContext';
import { Play, Pause, Loader2, Mic, MessageCircle, Facebook, RadioTower, Signal, WifiOff, Volume2 } from 'lucide-react';
import logoUrl from '../assets/logo.svg';
import ChatModal from './ChatModal';

const HeroPlayer = ({ contacto, galeria }) => {
    const { 
        isPlaying, isBuffering, togglePlay, isLoading, error, 
        programaEnVivo, audioData, streamQuality, volume, setVolume 
    } = useAudio();
    const { unreadCount } = useChat();
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [listenersCount, setListenersCount] = useState(null);
    const [photoOpacity, setPhotoOpacity] = useState(1);
    const [showVolume, setShowVolume] = useState(false);

    // Obtener cantidad de oyentes
    useEffect(() => {
        const fetchListeners = async () => {
            try {
                const res = await fetch('/api/oyentes');
                if (res.ok) {
                    const data = await res.json();
                    if (data?.listeners !== undefined) setListenersCount(data.listeners);
                }
            } catch (e) { /* silent */ }
        };
        fetchListeners();
        const interval = setInterval(fetchListeners, 30000);
        return () => clearInterval(interval);
    }, []);

    // Crossfade entre fotos
    useEffect(() => {
        if (isPlaying && galeria.length > 1) {
            const interval = setInterval(() => {
                setPhotoOpacity(0);
                setTimeout(() => {
                    setCurrentPhotoIndex(prev => (prev + 1) % galeria.length);
                    setPhotoOpacity(1);
                }, 600);
            }, 8000);
            return () => clearInterval(interval);
        }
    }, [isPlaying, galeria]);

    const scale = audioData || 1;
    const currentPhoto = galeria.length > 0 ? galeria[currentPhotoIndex] : null;
    const isDisabled = isLoading;
    const showBuffering = isBuffering && !isLoading;

    return (
        <>
        <div className="w-full max-w-[400px] mx-auto relative animate-scale-in">
            {/* Glow RGB sutil detrás de la tarjeta */}
            {isPlaying && (
                <div className="absolute inset-4 pointer-events-none z-0">
                    <div className="absolute inset-0 rounded-[3rem] blur-[80px] opacity-20 animate-rgb-glow"
                        style={{ background: 'conic-gradient(from 0deg, #E63946, #9B5DE5, #4361EE, #00BBF9, #E63946)' }}
                    ></div>
                </div>
            )}

            <div 
                className="relative w-full aspect-[7/10] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                style={{
                    boxShadow: isPlaying 
                        ? `0 20px 60px -15px rgba(230, 57, 70, ${0.15 + (scale-1)*1.5}), 0 40px 80px -20px rgba(0,0,0,0.5)` 
                        : '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
                }}
            >
                {/* Imagen de fondo con crossfade */}
                <div className="absolute inset-0 z-0">
                    {currentPhoto ? (
                        <>
                            <img 
                                src={currentPhoto.imageUrl} 
                                alt="Galería" 
                                className="w-full h-full object-cover transition-all duration-[800ms] ease-in-out"
                                style={{ opacity: photoOpacity, transform: `scale(${isPlaying ? 1.05 : 1})`, transition: 'opacity 0.6s ease, transform 8s ease' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20"></div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] flex items-center justify-center">
                            <img src={logoUrl} alt="Logo" className="w-32 h-32 opacity-[0.04]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        </div>
                    )}
                </div>

                {/* Overlay de buffering */}
                {showBuffering && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-md animate-fade-in">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-2 border-accent-red/30 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-accent-red animate-spin" />
                                </div>
                                <span className="absolute inset-0 rounded-full border-2 border-accent-red/20 animate-ping"></span>
                            </div>
                            <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">
                                {streamQuality === 'reconnecting' ? 'Reconectando señal...' : 'Conectando...'}
                            </span>
                        </div>
                    </div>
                )}

                {/* ===== HEADER: Logo + Oyentes + Vol | Señal + Play ===== */}
                <div className="relative z-30 flex items-center justify-between p-5 pt-6 w-full">
                    <div className="flex items-center gap-1.5">
                        {/* Logo libre */}
                        <img 
                            src={logoUrl} alt="CTN" 
                            className={`w-8 h-8 object-contain drop-shadow-lg transition-all duration-700 ${isPlaying ? 'animate-float-constant' : 'opacity-60'}`}
                        />
                        {/* Oyentes */}
                        {listenersCount !== null && (
                            <div className="flex items-center gap-1.5 bg-white/8 backdrop-blur-xl px-2.5 py-1.5 rounded-xl border border-white/10 text-white font-bold text-[11px]" title="Oyentes">
                                <RadioTower className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                {listenersCount}
                            </div>
                        )}
                        {/* Volumen toggle */}
                        <div className="relative">
                            <button
                                onClick={() => setShowVolume(!showVolume)}
                                className={`flex items-center gap-1.5 bg-white/8 backdrop-blur-xl px-2.5 py-1.5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-all active:scale-95 text-[11px] font-bold ${showVolume ? 'bg-white/15' : ''}`}
                            >
                                <Volume2 className="w-3.5 h-3.5" />
                                {Math.round(volume * 100)}%
                            </button>
                            {/* Slider dropdown */}
                            <div className={`absolute top-full left-0 mt-1.5 z-50 transition-all duration-200 ${showVolume ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}>
                                <div className="flex items-center gap-2 bg-black/80 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/10 w-36 shadow-xl">
                                    <div className="relative flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <input
                                            type="range" min="0" max="1" step="0.01"
                                            value={volume}
                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="h-full bg-gradient-to-r from-accent-red to-[#FF6B6B] rounded-full transition-all duration-75" style={{ width: `${volume * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Calidad de señal */}
                        {isPlaying && (
                            <div className={`flex items-center justify-center bg-white/5 px-2 py-1.5 rounded-xl border border-white/5 transition-colors duration-500 ${
                                streamQuality === 'good' ? 'text-emerald-400' : 
                                streamQuality === 'weak' ? 'text-amber-400' : 'text-red-400'
                            }`} title={`Señal: ${streamQuality}`}>
                                {streamQuality === 'reconnecting' ? <WifiOff className="w-3.5 h-3.5" /> : <Signal className="w-3.5 h-3.5" />}
                            </div>
                        )}
                        
                        {/* Botón Play */}
                        <button
                            onClick={togglePlay}
                            disabled={isDisabled}
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 relative ${
                                isPlaying 
                                    ? 'bg-accent-red text-white shadow-lg shadow-accent-red/30' 
                                    : 'bg-white/10 backdrop-blur-xl text-white border border-white/15 hover:bg-white/20'
                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : showBuffering ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="w-5 h-5 fill-current" />
                            ) : (
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* ===== CENTRO — Vacío para mostrar la imagen ===== */}
                <div className="flex-1"></div>

                {/* ===== FOOTER: Info, Chat, Redes ===== */}
                <div className="relative z-10 flex flex-col p-6 pt-16 w-full bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                    {/* Estado + Nombre del programa */}
                    <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                                isBuffering ? 'bg-amber-400 animate-pulse' :
                                isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'
                            }`}></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                                {isBuffering ? 'Cargando señal' : isPlaying ? 'Transmitiendo en vivo' : 'Señal en espera'}
                            </span>
                        </div>

                        <h2 className="text-[1.4rem] font-title font-black text-white tracking-tight flex items-center gap-2.5 leading-tight"
                            style={{ transform: isPlaying ? `scale(${1 + (scale - 1) * 0.03})` : 'scale(1)', transition: 'transform 0.15s ease-out' }}>
                            <Mic className={`w-5 h-5 text-accent-red shrink-0 ${isPlaying && !isBuffering ? 'animate-pulse' : ''}`} />
                            <span className="truncate">{programaEnVivo || 'CTN Radio Online'}</span>
                        </h2>

                        {error && (
                            <p className="text-[11px] text-amber-400/80 font-semibold mt-1.5 animate-pulse">{error}</p>
                        )}
                    </div>



                    {/* Botón Chat */}
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="w-full flex items-center justify-center gap-2 mb-3 bg-white/8 hover:bg-white/14 text-white backdrop-blur-xl font-bold py-3 rounded-2xl active:scale-[0.98] transition-all border border-white/8 relative group text-sm"
                    >
                        <MessageCircle className="w-4.5 h-4.5 text-accent-red group-hover:animate-pulse" />
                        Chat en Vivo
                        {unreadCount > 0 && (
                            <span className="ml-1 bg-accent-red text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Redes sociales */}
                    <div className="flex items-center gap-2 w-full">
                        <a 
                            href={`https://facebook.com/${contacto?.facebook || 'ctnradio'}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 text-white/50 py-2 rounded-xl text-[10px] font-bold hover:bg-white/5 hover:text-white transition-all uppercase tracking-wider"
                        >
                            <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                            Facebook
                        </a>
                        <div className="w-px h-4 bg-white/10"></div>
                        <a 
                            href={`https://wa.me/${contacto?.whatsapp?.replace(/[^0-9]/g, '') || ''}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 text-white/50 py-2 rounded-xl text-[10px] font-bold hover:bg-white/5 hover:text-white transition-all uppercase tracking-wider"
                        >
                            <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>

        {/* Chat Modal */}
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
    );
};

export default HeroPlayer;
