import { useAudio } from '../context/AudioContext';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';

const StickyPlayer = () => {
    const { 
        isPlaying, isBuffering, togglePlay, volume, setVolume, 
        streamUrl, programaEnVivo, error 
    } = useAudio();
    
    if (!streamUrl) return null;

    // Texto de estado inteligente
    const getStatusText = () => {
        if (isBuffering) return 'Sintonizando...';
        if (isPlaying) return 'En vivo';
        return 'Toca ▶ para escuchar';
    };

    return (
        <div className="fixed bottom-[4.2rem] md:bottom-0 left-0 right-0 z-40">
            <div className="bg-black/90 backdrop-blur-xl border-t border-white/[0.04] px-4 py-2.5 sm:px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                    
                    {/* Left: Play + Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                            onClick={togglePlay}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 relative ${
                                isPlaying 
                                    ? 'bg-accent-red text-white shadow-lg shadow-accent-red/25' 
                                    : 'bg-white/8 text-white hover:bg-white/15'
                            }`}
                        >
                            {isBuffering ? (
                                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="w-4.5 h-4.5 fill-current" />
                            ) : (
                                <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                            )}
                        </button>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`w-1 h-1 rounded-full ${
                                    isBuffering ? 'bg-amber-400 animate-pulse' :
                                    isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-white/15'
                                }`}></span>
                                <span className="text-[9px] font-semibold tracking-[0.15em] text-white/30 uppercase truncate">
                                    CTN Radio · {getStatusText()}
                                </span>
                            </div>
                            <h3 className="text-[13px] font-bold text-white truncate leading-snug">
                                {error || programaEnVivo || 'Programación en Vivo'}
                            </h3>
                        </div>
                    </div>

                    {/* Right: Volume */}
                    <div className="flex items-center gap-3 justify-end shrink-0">
                        <div className="hidden sm:flex items-center gap-2.5 bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/[0.04] group">
                            <Volume2 className="w-3.5 h-3.5 text-white/25 group-hover:text-accent-red transition-colors" />
                            <div className="relative w-20 h-[3px] bg-white/8 rounded-full overflow-hidden">
                                <input
                                    type="range" min="0" max="1" step="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="h-full bg-accent-red rounded-full transition-all duration-75" style={{ width: `${volume * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StickyPlayer;
