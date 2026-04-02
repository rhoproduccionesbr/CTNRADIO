import { useAudio } from '../context/AudioContext';
import { Play, Pause, Volume2, Loader2, Signal, WifiOff } from 'lucide-react';

const StickyPlayer = () => {
    const { 
        isPlaying, isBuffering, togglePlay, volume, setVolume, 
        streamUrl, programaEnVivo, audioData, frequencyBars, streamQuality, error 
    } = useAudio();
    
    if (!streamUrl) return null;

    const scale = audioData || 1;
    const qualityConfig = {
        good: { color: 'text-emerald-400', icon: Signal },
        weak: { color: 'text-amber-400', icon: Signal },
        reconnecting: { color: 'text-red-400', icon: WifiOff },
        offline: { color: 'text-red-500', icon: WifiOff },
    };
    const quality = qualityConfig[streamQuality] || qualityConfig.good;
    const QualityIcon = quality.icon;

    return (
        <div className="fixed bottom-[4.2rem] md:bottom-0 left-0 right-0 z-40">
            {/* Gradient shadow arriba */}
            <div className="h-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none -mb-px"></div>
            
            <div className="bg-black/90 backdrop-blur-2xl border-t border-white/[0.04] px-4 py-2.5 sm:px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-6">
                    
                    {/* Left: Play + Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Play Button */}
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
                            {isBuffering && <span className="absolute inset-0 rounded-xl border border-accent-red/30 animate-ping"></span>}
                        </button>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`w-1 h-1 rounded-full transition-colors ${
                                    isBuffering ? 'bg-amber-400 animate-pulse' :
                                    isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-white/15'
                                }`}></span>
                                <span className="text-[9px] font-semibold tracking-[0.15em] text-white/30 uppercase truncate">
                                    CTN Radio · {isBuffering ? 'Cargando' : isPlaying ? 'En vivo' : 'Pausa'}
                                </span>
                                {isPlaying && (
                                    <span className={`${quality.color} transition-colors`}>
                                        <QualityIcon className="w-2.5 h-2.5" />
                                    </span>
                                )}
                            </div>
                            <h3 className="text-[13px] font-bold text-white truncate leading-snug">
                                {error || programaEnVivo || 'Programación en Vivo'}
                            </h3>
                        </div>
                    </div>

                    {/* Center: EQ Bars (desktop) */}
                    <div className="hidden md:flex flex-1 items-center justify-center gap-[2px] h-7 max-w-xs">
                        {frequencyBars.map((barHeight, i) => (
                            <div
                                key={i}
                                className={`w-[3px] rounded-full transition-all duration-100 ease-out ${
                                    isPlaying && !isBuffering ? 'bg-gradient-to-t from-accent-red/60 to-accent-red' : 'bg-white/[0.06]'
                                }`}
                                style={{
                                    height: isPlaying && !isBuffering ? `${Math.max(8, barHeight)}%` : '8%',
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Right: Volume + Logo */}
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
