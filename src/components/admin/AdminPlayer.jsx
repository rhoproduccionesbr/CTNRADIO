import { useAudio } from '../../context/AudioContext';
import { Play, Square } from 'lucide-react';

const BARS_CONFIG = [
    { height: '10px', animation: 'pulse 0.6s ease-in-out infinite alternate' },
    { height: '16px', animation: 'pulse 0.8s ease-in-out infinite alternate' },
    { height: '12px', animation: 'pulse 0.5s ease-in-out infinite alternate' },
];

const AdminPlayer = () => {
    const { isPlaying, togglePlay, currentProgram } = useAudio();

    return (
        <div className="bg-[var(--primary)] text-[var(--text-main)] border border-[var(--card-border)] p-3 rounded-xl flex items-center shadow-sm w-full gap-3 mt-4">
            <button 
                onClick={togglePlay}
                className="w-10 h-10 flex-shrink-0 bg-accent-red hover:bg-[#c92a35] text-white rounded-full flex items-center justify-center transition shadow-sm"
            >
                {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
            </button>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-xs truncate uppercase tracking-widest text-[var(--text-muted)] mb-1">Radio en Vivo</p>
                <p className="text-sm font-bold truncate leading-tight" title={currentProgram || 'Radio Online'}>{currentProgram || 'CTN Radio Online'}</p>
            </div>
            {isPlaying && (
                <div className="flex items-end space-x-1 justify-center w-6 h-6 shrink-0">
                    {BARS_CONFIG.map((bar, i) => (
                        <div 
                            key={i} 
                            className="w-1 bg-accent-red rounded-t-sm"
                            style={{
                                height: bar.height,
                                animation: bar.animation
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPlayer;
