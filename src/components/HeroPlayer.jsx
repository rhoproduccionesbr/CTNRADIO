import { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, Loader2, Mic, MessageCircle, Facebook } from 'lucide-react';
import logoUrl from '../assets/logo.svg';

const HeroPlayer = ({ contacto, galeria }) => {
    const { isPlaying, togglePlay, isLoading, error, programaEnVivo, audioData } = useAudio();
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
            className="w-full max-w-lg mx-auto rounded-[2.5rem] relative overflow-hidden group shadow-2xl transition-all duration-500"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                        <img src={logoUrl} alt="Logo" className="w-40 h-40 opacity-10 grayscale" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                )}
            </div>

            {/* Logo en Esquina Superior Izquierda */}
            <div className="absolute top-6 left-6 z-30">
                <img 
                    src={logoUrl} 
                    alt="CTN Logo" 
                    className={`w-12 h-12 object-contain drop-shadow-lg transition-transform duration-700 animate-float-constant ${isPlaying ? 'brightness-110' : 'opacity-80'}`}
                />
            </div>

            <div className="relative z-10 flex flex-col items-center pt-20 pb-8 px-8 min-h-[450px] justify-between">
                
                {/* Visualizador Central o Espacio Vacío */}
                <div className="flex-1 flex items-center justify-center w-full">
                    {/* Botón Play/Pause con Efecto de Pulso Dinámico */}
                    <div className="relative">
                        {isPlaying && (
                            <>
                                <div 
                                    className="absolute inset-0 bg-accent-red/40 rounded-full animate-ping opacity-50"
                                    style={{ transform: `scale(${1 + (scale - 1) * 3})` }}
                                ></div>
                                <div 
                                    className="absolute inset-0 bg-accent-red/20 rounded-full animate-pulse opacity-30"
                                    style={{ transform: `scale(${1 + (scale - 1) * 5})` }}
                                ></div>
                            </>
                        )}
                        <button
                            onClick={togglePlay}
                            disabled={isLoading || error}
                            className={`relative w-24 h-24 rounded-full bg-accent-red text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none z-20 ${isPlaying ? 'shadow-accent-red/50 shadow-[0_0_30px_rgba(230,57,70,0.5)]' : ''}`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-10 h-10 animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="w-12 h-12 fill-current" />
                            ) : (
                                <Play className="w-12 h-12 fill-current ml-2" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Información en la Base */}
                <div className="w-full flex flex-col items-center space-y-4 pt-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                             <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-white/30'}`}></div>
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                                {isPlaying ? 'Sintonía en Vivo' : 'Radio en Espera'}
                             </span>
                        </div>
                        <p className="text-2xl font-title font-black text-white flex items-center justify-center gap-3 tracking-tight uppercase drop-shadow-lg transition-transform duration-75"
                           style={{ transform: isPlaying ? `scale(${1 + (scale - 1) * 0.1})` : 'scale(1)' }}>
                            <Mic className={`w-6 h-6 text-accent-red ${isPlaying ? 'animate-pulse' : ''}`} />
                            {programaEnVivo || 'CTN Radio Online'}
                        </p>
                    </div>

                    {/* Botones Sociales Sutiles */}
                    <div className="flex items-center justify-center gap-3 w-full bg-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/10">
                        <a 
                            href={`https://facebook.com/${contacto?.facebook || 'ctnradio'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 text-white/80 py-2 rounded-xl text-[11px] font-bold hover:bg-white/10 hover:text-white transition-all uppercase tracking-wider"
                        >
                            <Facebook className="w-4 h-4 text-[#1877F2]" />
                            FB
                        </a>
                        <div className="w-px h-4 bg-white/10"></div>
                        <a 
                            href={`https://wa.me/${contacto?.whatsapp?.replace(/[^0-9]/g, '') || ''}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 text-white/80 py-2 rounded-xl text-[11px] font-bold hover:bg-white/10 hover:text-white transition-all uppercase tracking-wider"
                        >
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            WA
                        </a>
                    </div>
                </div>

                {/* Pie de foto flotante */}
                {currentPhoto?.caption && isPlaying && (
                    <div className="absolute bottom-24 left-0 right-0 px-8 text-center pointer-events-none">
                        <span className="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-[9px] text-white/50 uppercase tracking-[0.3em] border border-white/5">
                            {currentPhoto.caption}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroPlayer;
