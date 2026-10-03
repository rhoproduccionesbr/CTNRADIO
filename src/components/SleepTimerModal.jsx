import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { Timer, Hourglass, Clock, X, Check } from 'lucide-react';

const PRESETS = [15, 30, 45, 60, 90];

const SleepTimerModal = ({ isOpen, onClose }) => {
  const { sleepTimerMinutes, sleepRemainingSeconds, startSleepTimer } = useAudio();

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelect = (mins) => {
    startSleepTimer(mins);
    onClose();
  };

  const handleCancel = () => {
    startSleepTimer(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="glass-card max-w-sm w-full rounded-3xl p-6 border border-[var(--card-border)] relative shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-[var(--card-border)]/60 hover:bg-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center gap-3 mb-5">
              <motion.div 
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center"
              >
                {sleepTimerMinutes !== null ? <Hourglass className="w-5 h-5 animate-pulse" /> : <Timer className="w-5 h-5" />}
              </motion.div>
              <div>
                <h3 className="font-title font-bold text-base text-[var(--text-main)]">
                  Temporizador de Apagado
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Apaga la radio automáticamente
                </p>
              </div>
            </div>

            {/* Estado actual si está activo */}
            {sleepTimerMinutes !== null ? (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-5 text-center"
              >
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                  Apagado programado en:
                </span>
                <div className="font-mono text-3xl font-bold text-indigo-400 tabular-nums">
                  {formatSeconds(sleepRemainingSeconds)}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                  El volumen bajará suavemente en los últimos 15 segundos.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancel}
                  className="mt-3 w-full py-2 rounded-xl bg-accent-red/10 hover:bg-accent-red/20 text-accent-red text-xs font-bold transition-colors"
                >
                  Cancelar temporizador
                </motion.button>
              </motion.div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Selecciona cuántos minutos deseas escuchar antes de que la emisión se detenga:
              </p>
            )}

            {/* Presets con microinteracciones Framer Motion */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {PRESETS.map((mins) => {
                const isSelected = sleepTimerMinutes === mins;
                return (
                  <motion.button
                    key={mins}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    onClick={() => handleSelect(mins)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-[var(--card-border)]/50 hover:bg-[var(--card-border)] text-[var(--text-main)] border border-[var(--card-border)]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{mins} minutos</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SleepTimerModal;
