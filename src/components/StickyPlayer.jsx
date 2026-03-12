import { useAudio } from '../context/AudioContext';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

const StickyPlayer = () => {
    const { isPlaying, togglePlay, volume, setVolume, streamUrl, programaEnVivo, audioData } = useAudio();
    
    if (!streamUrl) return null;

    const scale = audioData || 1;

    return (
        <div 
            className="fixed bottom-6 left-6 right-6 z-50 transition-all duration-500"
            style={{
                transform: `translateY(${isPlaying ? '0' : '0'})`,
                filter: `drop-shadow(0 0 ${10 + (scale - 1) * 30}px rgba(230, 57, 70, ${0.1 + (scale - 1) * 0.4}))`
            }}
        >
            <div className="max-w-5xl mx-auto bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] px-6 py-4 shadow-2xl overflow-hidden relative group">
                {/* Reflejo de luz sutil en el borde */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                <div className="flex items-center justify-between gap-4 md:gap-8 relative z-10">
                    
                    {/* Botón Play & Info */}
                    <div className="flex items-center gap-4 group/info">
                        <button
                            onClick={togglePlay}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl relative overflow-hidden focus:outline-none ${isPlaying ? 'bg-accent-red scale-105' : 'bg-white/10 hover:bg-white/20'}`}
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6 text-white fill-current animate-in zoom-in" />
                            ) : (
                                <Play className="w-6 h-6 text-white fill-current ml-1 animate-in zoom-in" />
                            )}
                            {/* Efecto de brillo al reproducir */}
                            {isPlaying && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                        </button>

                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-accent-red animate-pulse' : 'bg-white/20'}`}></span>
                                <h3 className="font-title font-black text-[10px] tracking-[0.3em] text-white uppercase opacity-90">
                                    CTN RADIO
                                </h3>
                            </div>
                            <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest truncate max-w-[120px] md:max-w-[200px]">
                                {programaEnVivo || 'En Vivo'}
                            </p>
                        </div>
                    </div>

                    {/* Waveform Central - Simulación Realista con Gradientes */}
                    <div className="flex-1 flex items-center justify-center gap-[4px] h-10 px-4">
                        {[...Array(24)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-1 rounded-full bg-gradient-to-t from-accent-red to-accent-red/40 transition-all duration-150 ${isPlaying ? 'opacity-100' : 'opacity-10 h-1'}`}
                                style={{
                                    height: isPlaying 
                                        ? `${Math.max(15, (scale * (Math.abs(Math.sin((i * 0.5) + (Date.now() / 300)))) * 80))}%` 
                                        : '3px',
                                    transitionDelay: `${i * 10}ms`
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Controles de Audio (Volumen & Más) */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors px-4 py-3 rounded-2xl border border-white/5 group/vol">
                            <Volume2 className="w-4 h-4 text-white/40 group-hover/vol:text-accent-red transition-colors" />
                            <div className="relative w-24 h-5 flex items-center">
                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-full absolute z-10 opacity-0 cursor-pointer h-full"
                                />
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-accent-red transition-all duration-75"
                                        style={{ width: `${volume * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Botón de Volumen Mobile (Toggle simple) */}
                        <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60">
                             {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StickyPlayer;
