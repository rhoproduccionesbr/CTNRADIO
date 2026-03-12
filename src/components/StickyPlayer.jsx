import { useAudio } from '../context/AudioContext';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

const StickyPlayer = () => {
    const { isPlaying, togglePlay, volume, setVolume, streamUrl, programaEnVivo, audioData } = useAudio();
    
    if (!streamUrl) return null;

    const scale = audioData || 1;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 py-3 sm:px-8 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8 overflow-hidden">
                
                {/* Lado Izquierdo: Control & Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={togglePlay}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isPlaying ? 'bg-accent-red text-white shadow-[0_0_15px_rgba(230,57,70,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-accent-red animate-pulse' : 'bg-white/20'}`}></span>
                            <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase truncate">
                                CTN RADIO - {isPlaying ? 'Sintonizado' : 'En Pausa'}
                            </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white uppercase truncate">
                            {programaEnVivo || 'Programación en Vivo'}
                        </h3>
                    </div>
                </div>

                {/* Centro: Animación Bar Waveform Moderna (Visible en MD+) */}
                <div className="hidden md:flex flex-1 items-center justify-center gap-[3px] h-8">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1 rounded-full bg-accent-red transition-all duration-150 ${isPlaying ? 'opacity-100' : 'opacity-10 h-1'}`}
                            style={{
                                height: isPlaying 
                                    ? `${Math.max(15, (scale * (Math.abs(Math.sin((i * 0.7) + (Date.now() / 250)))) * 100))}%` 
                                    : '3px',
                                transitionDelay: `${i * 10}ms`
                            }}
                        ></div>
                    ))}
                </div>

                {/* Lado Derecho: Volumen & Logo Sutil */}
                <div className="flex items-center gap-6 justify-end flex-1 md:flex-none">
                    <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 group">
                        <Volume2 className="w-4 h-4 text-white/30 group-hover:text-accent-red transition-colors" />
                        <div className="relative w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                            <input
                                type="range"
                                min="0" max="1" step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div 
                                className="h-full bg-accent-red transition-all duration-75"
                                style={{ width: `${volume * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    {/* Indicador Logo en Mobile/Desktop */}
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/5">
                        <span className="text-[8px] font-black text-white/30 tracking-tight">CTN</span>
                    </div>
                </div>

            </div>
        </div>
    );
};



export default StickyPlayer;
