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
        <div className="glass-card w-full max-w-lg mx-auto p-6 sm:p-8 rounded-[2rem] relative overflow-hidden group shadow-2xl border border-[var(--card-border)]">
            {/* Fondo dinámico reactivo */}
            <div 
                className="absolute inset-0 bg-gradient-to-br from-accent-red/20 to-accent-blue/20 transition-transform duration-75 blur-2xl"
                style={{
                    transform: isPlaying ? `scale(${1 + (scale - 1) * 3}) rotate(${scale * 2}deg)` : 'scale(1)',
                    opacity: isPlaying ? 0.6 : 0.3
                }}
            ></div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Contenedor de Carátula / Logo (Sin marco, sin sombras excesivas) */}
                <div 
                    className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden mb-8 transition-transform duration-75"
                    style={{
                        transform: isPlaying ? `scale(${1 + (scale - 1) * 0.4})` : 'scale(1)',
                    }}
                >
                    {/* Imagen de fondo (Galería) - Se mantiene pero con menos opacidad si no hay música */}
                    <div className="absolute inset-0">
                        {currentPhoto ? (
                            <>
                                <img 
                                    src={currentPhoto.imageUrl} 
                                    alt="Galería" 
                                    className="w-full h-full object-cover transition-opacity duration-1000"
                                />
                                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
                            </>
                        ) : null}
                    </div>

                    {/* Logo central flotante y reactivo (Sin fondo/marco) */}
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <img 
                            src={logoUrl} 
                            alt="CTN Radio Logo" 
                            className={`w-full h-full object-contain transition-transform duration-700 animate-float-constant ${isPlaying ? '' : 'opacity-80 grayscale-[20%]'}`}
                            style={{
                                transform: isPlaying ? `scale(${scale * 1.05}) rotate(${scale * 1.5}deg)` : 'scale(1)',
                                filter: isPlaying ? `drop-shadow(0 0 15px rgba(230, 57, 70, 0.4))` : 'none'
                            }}
                        />
                    </div>

                    {/* Botón Play/Pause Minimalista Superpuesto */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={togglePlay}
                            disabled={isLoading || error}
                            className="w-16 h-16 rounded-full bg-accent-red/90 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="w-8 h-8 fill-current" />
                            ) : (
                                <Play className="w-8 h-8 fill-current ml-1" />
                            )}
                        </button>
                    </div>

                    {/* Etiqueta de pie de foto (si hay) */}
                    {currentPhoto?.caption && isPlaying && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/40 backdrop-blur-md text-white text-[9px] uppercase tracking-widest text-center">
                            {currentPhoto.caption}
                        </div>
                    )}
                </div>

                {/* Info de programa (Texto refinado, sin repetir CTN - RADIO) */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${isPlaying ? 'bg-green-500/20 text-green-600 shadow-sm border border-green-500/20' : 'bg-[var(--card-border)] text-[var(--text-muted)]'}`}>
                            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                            {isPlaying ? 'Al Aire' : 'En Pausa'}
                        </span>
                    </div>
                    <p className="text-xl font-body font-black text-[var(--text-main)] flex items-center justify-center gap-3 italic tracking-tight uppercase">
                        <Mic className={`w-6 h-6 text-accent-red ${isPlaying ? 'animate-pulse' : ''}`} />
                        {programaEnVivo || 'Sintonía Digital'}
                    </p>
                </div>

                {/* Botones Sociales Minimalistas (Dentro de la tarjeta) */}
                <div className="flex items-center justify-center gap-4 w-full border-t border-[var(--card-border)] pt-8">
                    <a 
                        href={`https://facebook.com/${contacto?.facebook || 'ctnradio'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2]/10 text-[#1877F2] py-2.5 rounded-xl font-bold hover:bg-[#1877F2] hover:text-white transition-all text-xs"
                    >
                        <Facebook className="w-4 h-4" />
                        Facebook
                    </a>
                    <a 
                        href={`https://wa.me/${contacto?.whatsapp?.replace(/[^0-9]/g, '') || ''}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 text-green-500 py-2.5 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all text-xs"
                    >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                    </a>
                </div>
            </div>

            <button
                onClick={togglePlay}
                className="md:hidden absolute top-4 right-4 p-2 rounded-full bg-[var(--surface)] shadow-md text-[var(--text-main)]"
            >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
        </div>
    );
};

export default HeroPlayer;
