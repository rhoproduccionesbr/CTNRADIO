import { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useChat } from '../context/ChatContext';
import { Play, Pause, Loader2, Mic, MessageCircle, Facebook, RadioTower } from 'lucide-react';
import logoUrl from '../assets/logo.svg';
import ChatModal from './ChatModal';

const HeroPlayer = ({ contacto, galeria }) => {
    const { isPlaying, togglePlay, isLoading, error, programaEnVivo, audioData } = useAudio();
    const { unreadCount, connections } = useChat();
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [listenersCount, setListenersCount] = useState(null);

    // Obtener cantidad de oyentes de Icecast (AzuraCast API)
    useEffect(() => {
        const fetchListeners = async () => {
            try {
                // Usamos el proxy configurado en vite.config.js y vercel.json
                const res = await fetch('/api/oyentes');
                if (res.ok) {
                    const data = await res.json();
                    if (data?.listeners !== undefined) {
                        setListenersCount(data.listeners);
                    }
                }
            } catch (e) {
                // Falla silenciosa
            }
        };

        fetchListeners();
        const interval = setInterval(fetchListeners, 30000); // 30 segundos
        return () => clearInterval(interval);
    }, []);

    // Rotar fotos aleatorias de la galería cada 10 segundos si está reproduciendo
    useEffect(() => {
        if (isPlaying && galeria.length > 0) {
            const interval = setInterval(() => {
                setCurrentPhotoIndex(prev => (prev + 1) % galeria.length);
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [isPlaying, galeria]);

    const scale = audioData || 1;
    const currentPhoto = galeria.length > 0 ? galeria[currentPhotoIndex] : null;

    return (
        <div 
            className="w-full max-w-[380px] h-[550px] mx-auto rounded-[3rem] relative overflow-hidden group shadow-2xl transition-all duration-500 flex flex-col"
            style={{
                boxShadow: isPlaying 
                    ? `0 0 50px -10px rgba(230, 57, 70, ${0.2 + (scale-1)*2}), 0 25px 50px -12px rgba(0, 0, 0, 0.5)` 
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
            }}
        >
            {/* Contenedor de Imagen de Fondo Full-Card */}
            <div className="absolute inset-0 z-0">
                {currentPhoto ? (
                    <>
                        <img 
                            src={currentPhoto.imageUrl} 
                            alt="Galería" 
                            className="w-full h-full object-cover transition-all duration-1000 brightness-[0.7] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                        <img src={logoUrl} alt="Logo" className="w-40 h-40 opacity-10 grayscale" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                )}
            </div>

            {/* BARRA SUPERIOR: Logo y Oyentes (Izquierda) y Botón Minimalista (Derecha) */}
            <div className="relative z-30 flex items-center justify-between p-6 w-full">
                <div className="flex items-center gap-3">
                    <img 
                        src={logoUrl} 
                        alt="CTN Logo" 
                        className={`w-14 h-14 object-contain drop-shadow-lg transition-transform duration-700 animate-float-constant ${isPlaying ? 'brightness-110' : 'opacity-80'}`}
                    />
                    {listenersCount !== null && (
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm transition-opacity text-white font-bold text-xs" title="Oyentes Conectados">
                            <RadioTower className="w-4 h-4 text-emerald-400 animate-pulse" />
                            {listenersCount}
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Indicador Visualizador Superior */}
                    {isPlaying && (
                        <div className="flex items-center gap-1 h-4">
                            {[...Array(3)].map((_, i) => {
                                const factor = Math.abs(Math.sin((i * 1.5) + (Date.now() / 150)));
                                const heightValue = Math.max(30, (scale * 70 * factor) + (Math.random() * 30 * scale));
                                return (
                                    <div 
                                        key={i} 
                                        className="w-1 bg-accent-red rounded-full transition-all duration-75"
                                        style={{ height: `${heightValue}%` }}
                                    ></div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Botón Play Minimalista */}
                    <button
                        onClick={togglePlay}
                        disabled={isLoading || error}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isPlaying ? 'border-accent-red bg-accent-red/20 text-accent-red' : 'border-white/30 bg-white/5 text-white'}`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : isPlaying ? (
                            <Pause className="w-6 h-6 fill-current" />
                        ) : (
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* ESPACIO CENTRAL VACÍO (Para que la imagen sea visible) */}
            <div className="flex-1"></div>

            {/* ÁREA INFERIOR: Información y Redes Sociales */}
            <div className="relative z-10 flex flex-col items-center p-8 w-full bg-gradient-to-t from-black/90 to-transparent mt-auto">
                <div className="text-center w-full max-w-sm mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                         <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-white/30'}`}></div>
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                            {isPlaying ? 'Transmitiendo en Vivo' : 'Señal en Espera'}
                         </span>
                    </div>

                    <p className="text-2xl font-title font-black text-white flex items-center justify-center gap-3 tracking-tight uppercase drop-shadow-xl mb-4"
                       style={{ transform: isPlaying ? `scale(${1 + (scale - 1) * 0.05})` : 'scale(1)' }}>
                        <Mic className={`w-6 h-6 text-accent-red ${isPlaying ? 'animate-pulse' : ''}`} />
                        <span className="truncate">{programaEnVivo || 'CTN Radio Online'}</span>
                    </p>

                    {/* NUEVO BOTON DE CHAT INLINE (Glassmorphism) */}
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="w-full flex items-center justify-center gap-2 mb-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl font-bold py-3.5 rounded-2xl shadow-lg active:scale-[0.98] transition-all border border-white/20 relative group"
                    >
                        <MessageCircle className="w-5 h-5 text-accent-red group-hover:animate-pulse" />
                        ENTRAR AL CHAT EN VIVO
                        {unreadCount > 0 && (
                            <span className="ml-1 bg-accent-red text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Botones Sociales Estilo Cápsula */}
                    <div className="flex items-center justify-center gap-3 w-full bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
                        <a 
                            href={`https://facebook.com/${contacto?.facebook || 'ctnradio'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 text-white/70 py-2.5 rounded-xl text-[10px] font-extrabold hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest"
                        >
                            <Facebook className="w-4 h-4 text-[#1877F2]" />
                            Facebook
                        </a>
                        <div className="w-px h-5 bg-white/10"></div>
                        <a 
                            href={`https://wa.me/${contacto?.whatsapp?.replace(/[^0-9]/g, '') || ''}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 text-white/70 py-2.5 rounded-xl text-[10px] font-extrabold hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest"
                        >
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            WhatsApp
                        </a>
                    </div>
                </div>

                {/* Pie de foto minimalista */}
                {currentPhoto?.caption && isPlaying && (
                    <div className="w-full text-center mt-2">
                        <span className="text-[8px] text-white/30 uppercase tracking-[0.4em] font-medium">
                            {currentPhoto.caption}
                        </span>
                    </div>
                )}
            </div>

            {/* MODAL DEL CHAT */}
            <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
};

export default HeroPlayer;
