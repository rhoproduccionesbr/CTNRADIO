import { useAudio } from '../context/AudioContext';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

const StickyPlayer = () => {
    const { isPlaying, togglePlay, volume, setVolume, streamUrl, programaEnVivo } = useAudio();
    const [showVolume, setShowVolume] = useState(false);

    // No renderizar si no hay un streamUrl configurado
    if (!streamUrl) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-primary/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 z-50 transform transition-transform duration-300 translate-y-0">
            <div className="container mx-auto flex items-center justify-between gap-4">

                {/* Info y Control principal */}
                <div className="flex items-center space-x-4 flex-1 md:flex-none">
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-accent-red text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(183,28,28,0.5)] shrink-0"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                        ) : (
                            <Play className="w-5 h-5 fill-current ml-1" />
                        )}
                    </button>

                    <div className="overflow-hidden whitespace-nowrap">
                        <h3 className="font-title font-bold text-sm truncate">
                            CTN Radio {programaEnVivo && <span className="text-accent-red font-normal">• {programaEnVivo}</span>}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                            {isPlaying ? 'Emisión en curso...' : 'Pausado'}
                        </p>
                    </div>
                </div>

                {/* Visualizador (Simulado) */}
                {isPlaying && (
                    <div className="hidden md:flex flex-1 items-center justify-center space-x-1 h-8">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-accent-red rounded-full animate-pulse"
                                style={{
                                    height: `${Math.max(20, Math.random() * 100)}%`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            ></div>
                        ))}
                    </div>
                )}

                {/* Control de Volumen */}
                <div className="flex items-center justify-end flex-1 md:flex-none space-x-4 relative">
                    {showVolume && (
                        <input
                            type="range"
                            min="0" max="1" step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-24 accent-accent-red absolute -top-10 right-0 md:relative md:top-0"
                        />
                    )}
                    <button
                        onClick={() => setShowVolume(!showVolume)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                        {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default StickyPlayer;
