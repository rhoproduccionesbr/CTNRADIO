import { useAudio } from '../context/AudioContext';
import { Play, Pause, Loader2, Mic } from 'lucide-react';

const HeroPlayer = () => {
    const { isPlaying, togglePlay, isLoading, error, programaEnVivo } = useAudio();

    return (
        <div className="glass-card max-w-lg mx-auto p-8 rounded-3xl relative overflow-hidden group">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-red/20 to-accent-blue/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-accent-red to-accent-blue p-1 shadow-[0_0_30px_rgba(183,28,28,0.3)] mb-8 transition-transform duration-500 hover:scale-105">
                    <div className="w-full h-full rounded-full bg-primary flex items-center justify-center relative overflow-hidden">
                        {/* Animación del pulso - solo visible al reproducir */}
                        {isPlaying && (
                            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full"></div>
                        )}

                        <button
                            onClick={togglePlay}
                            disabled={isLoading || error}
                            className="w-20 h-20 rounded-full bg-white text-primary flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 z-20"
                        >
                            {isLoading ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="w-10 h-10 fill-current" />
                            ) : (
                                <Play className="w-10 h-10 fill-current ml-2" />
                            )}
                        </button>
                    </div>
                </div>

                <h2 className="text-2xl font-title font-bold mb-2">Señal en Vivo</h2>

                {error ? (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-400 text-sm flex items-center justify-center mb-1">
                            {isPlaying ? (
                                <>
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    Emitiendo ahora
                                </>
                            ) : (
                                "Presiona play para escuchar"
                            )}
                        </p>
                        <p className="text-lg font-bold text-white tracking-wide mt-2 flex items-center justify-center gap-2 animate-pulse">
                            <Mic className="w-5 h-5 text-accent-red" />
                            {programaEnVivo || 'CTN Radio en Vivo'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroPlayer;
