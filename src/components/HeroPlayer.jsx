import { useAudio } from '../context/AudioContext';
import { Play, Pause, Loader2, Mic } from 'lucide-react';

const HeroPlayer = () => {
    const { isPlaying, togglePlay, isLoading, error, programaEnVivo, audioData } = useAudio();

    // Default to scale 1 if audioData isn't available
    const scale = audioData || 1;

    return (
        <div className="glass-card max-w-lg mx-auto p-8 rounded-3xl relative overflow-hidden group">
            {/* Decorative gradient que reacciona a la música */}
            <div 
                className="absolute inset-0 bg-gradient-to-br from-accent-red/10 to-accent-blue/10 transition-transform duration-75"
                style={{
                    transform: isPlaying ? `scale(${1 + (scale - 1) * 2})` : 'scale(1)',
                    opacity: isPlaying ? 0.8 : 0.5
                }}
            ></div>

            <div className="relative z-10 flex flex-col items-center">
                <div 
                    className="w-48 h-48 rounded-full bg-gradient-to-tr from-accent-red to-accent-blue p-1 shadow-[0_10px_30px_rgba(183,28,28,0.2)] mb-8 transition-transform mt-4"
                    style={{
                        transform: isPlaying ? `scale(${scale})` : 'scale(1)',
                    }}
                >
                    <div className="w-full h-full rounded-full bg-[var(--surface)] flex items-center justify-center relative overflow-hidden">
                        {/* Animación del pulso - solo visible al reproducir */}
                        {isPlaying && (
                            <div 
                                className="absolute inset-0 bg-accent-red/20 rounded-full transition-transform duration-75"
                                style={{ transform: `scale(${scale * 1.1})` }}
                            ></div>
                        )}

                        <button
                            onClick={togglePlay}
                            disabled={isLoading || error}
                            className="w-20 h-20 rounded-full bg-[var(--primary)] text-[var(--text-main)] shadow-md flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 z-20 hover:shadow-lg"
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

                <h2 className="text-2xl font-title font-extrabold mb-2">Señal en Vivo</h2>

                {error ? (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                ) : (
                    <div className="text-center">
                        <p className="text-[var(--text-muted)] text-sm flex items-center justify-center mb-1">
                            {isPlaying ? (
                                <>
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    Emitiendo ahora
                                </>
                            ) : (
                                "Presiona play para escuchar"
                            )}
                        </p>
                        <p className={`text-lg font-bold tracking-wide mt-2 flex items-center justify-center gap-2 ${isPlaying ? 'text-[var(--text-main)] transition-colors duration-75' : ''}`}
                            style={{
                                color: isPlaying && scale > 1.05 ? 'var(--accent-red)' : 'var(--text-main)',
                                textShadow: isPlaying && scale > 1.05 ? '0 0 10px rgba(230, 57, 70, 0.5)' : 'none'
                             }}
                        >
                            <Mic className={`w-5 h-5 ${isPlaying && scale > 1.05 ? 'animate-bounce' : ''} text-accent-red`} />
                            {programaEnVivo || 'CTN Radio en Vivo'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroPlayer;
