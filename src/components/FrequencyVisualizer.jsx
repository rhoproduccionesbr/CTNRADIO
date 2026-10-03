import { useEffect, useRef, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { Waves, BarChart3, Activity } from 'lucide-react';

const MODES = [
  { id: 'wave', label: 'Onda', icon: Waves },
  { id: 'bars', label: 'Barras', icon: BarChart3 },
  { id: 'stereo', label: 'Estéreo', icon: Activity }
];

const FrequencyVisualizer = ({ className = '' }) => {
  const { isPlaying, isBuffering, getAnalyser, frequencyBars } = useAudio();
  const canvasRef = useRef(null);
  const [visualMode, setVisualMode] = useState('wave');
  const [currentDb, setCurrentDb] = useState(-42);
  const animationFrameRef = useRef(null);
  const peaksRef = useRef(new Array(64).fill(0));
  const peakDecayRef = useRef(new Array(64).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const bufferLength = 128;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    let idleAngle = 0;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const analyser = getAnalyser?.();
      let hasRealAudio = false;

      if (analyser && isPlaying && !isBuffering) {
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);

        let sum = 0;
        for (let i = 0; i < 24; i++) sum += freqData[i];
        if (sum > 12) hasRealAudio = true;
      }

      // Si el navegador bloquea CORS del analyser, usar síntesis basada en frequencyBars
      if (!hasRealAudio && isPlaying && !isBuffering) {
        const bars = frequencyBars || [];
        for (let i = 0; i < bufferLength; i++) {
          const barIdx = Math.floor((i / bufferLength) * (bars.length || 16));
          const baseVal = (bars[barIdx] || 18) * 2.2;
          freqData[i] = Math.min(255, baseVal + Math.sin(idleAngle + i * 0.25) * 20);
          timeData[i] = 128 + Math.sin(idleAngle * 2 + i * 0.18) * (baseVal * 0.35);
        }
        hasRealAudio = true;
      }

      // Cálculo de dB en tiempo real
      if (hasRealAudio) {
        let rms = 0;
        for (let i = 0; i < 32; i++) rms += freqData[i] * freqData[i];
        rms = Math.sqrt(rms / 32) / 255;
        const db = Math.round(20 * Math.log10(Math.max(0.001, rms)));
        setCurrentDb(Math.max(-42, Math.min(0, db)));
      } else {
        setCurrentDb(-42);
      }

      idleAngle += 0.035;

      // -------------------------------------------------------------
      // MODO 1: ONDA NEÓN FLUIDA (HORIZONTE LÍQUIDO)
      // -------------------------------------------------------------
      if (visualMode === 'wave') {
        const centerY = height / 2;

        // Capa 1: Resplandor difuso de fondo
        ctx.beginPath();
        const strokeGrad = ctx.createLinearGradient(0, 0, width, 0);
        strokeGrad.addColorStop(0, 'rgba(230, 57, 70, 0.05)');
        strokeGrad.addColorStop(0.25, 'rgba(230, 57, 70, 0.85)');
        strokeGrad.addColorStop(0.5, 'rgba(255, 107, 107, 0.95)');
        strokeGrad.addColorStop(0.75, 'rgba(255, 180, 50, 0.85)');
        strokeGrad.addColorStop(1, 'rgba(230, 57, 70, 0.05)');

        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = isPlaying ? 2 : 1.5;
        ctx.shadowColor = '#e63946';
        ctx.shadowBlur = isPlaying ? 8 : 2;

        const sliceWidth = width / (bufferLength - 1);
        ctx.moveTo(0, centerY);

        for (let i = 0; i < bufferLength; i++) {
          const v = hasRealAudio
            ? (timeData[i] / 128.0)
            : (1 + Math.sin(idleAngle + i * 0.15) * 0.05);

          // Atenuar en los bordes para un desvanecimiento suave (taper)
          const taper = Math.sin((i / (bufferLength - 1)) * Math.PI);
          const y = centerY + (v - 1) * (height * 0.42) * taper;
          const x = i * sliceWidth;

          if (i === 0) ctx.moveTo(x, y);
          else {
            const prevX = (i - 1) * sliceWidth;
            const prevV = hasRealAudio ? (timeData[i - 1] / 128.0) : 1;
            const prevTaper = Math.sin(((i - 1) / (bufferLength - 1)) * Math.PI);
            const prevY = centerY + (prevV - 1) * (height * 0.42) * prevTaper;
            ctx.quadraticCurveTo(prevX, prevY, (prevX + x) / 2, (prevY + y) / 2);
          }
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Capa 2: Segunda onda armónica transparente para profundidad
        if (isPlaying) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1;

          for (let i = 0; i < bufferLength; i += 2) {
            const v = hasRealAudio ? (timeData[i] / 128.0) : 1;
            const taper = Math.sin((i / (bufferLength - 1)) * Math.PI);
            const y = centerY - (v - 1) * (height * 0.25) * taper;
            const x = i * sliceWidth;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      // -------------------------------------------------------------
      // MODO 2: BARRAS FINAS DE ESTUDIO (STUDIO LED STRIP)
      // -------------------------------------------------------------
      else if (visualMode === 'bars') {
        const numBars = Math.min(48, Math.floor(width / 7));
        const barWidth = 3;
        const totalBarWidth = numBars * barWidth;
        const barSpacing = (width - totalBarWidth) / (numBars - 1);

        for (let i = 0; i < numBars; i++) {
          const freqIndex = Math.floor(Math.pow(i / numBars, 1.3) * (bufferLength * 0.6));
          let val = hasRealAudio ? (freqData[freqIndex] / 255) : 0.05;

          if (!hasRealAudio) {
            val = 0.05 + Math.sin(idleAngle + i * 0.25) * 0.03;
          }

          const barHeight = Math.max(3, val * (height - 8));
          const x = i * (barWidth + barSpacing);
          const y = height - barHeight - 2;

          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, '#e63946');
          grad.addColorStop(0.7, '#ff6b35');
          grad.addColorStop(1, '#ffc43d');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [1.5, 1.5, 0, 0]);
          ctx.fill();

          // Picos en caída (Peak decay)
          if (barHeight > peaksRef.current[i]) {
            peaksRef.current[i] = barHeight;
            peakDecayRef.current[i] = 0;
          } else {
            peakDecayRef.current[i] += 0.25;
            peaksRef.current[i] = Math.max(0, peaksRef.current[i] - peakDecayRef.current[i]);
          }

          if (peaksRef.current[i] > 5) {
            const peakY = height - peaksRef.current[i] - 4;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, Math.max(1, peakY), barWidth, 1.5);
          }
        }
      }

      // -------------------------------------------------------------
      // MODO 3: ESPECTRO ESTÉREO ESPEJADO
      // -------------------------------------------------------------
      else if (visualMode === 'stereo') {
        const numBands = Math.min(32, Math.floor(width / 14));
        const bandWidth = 3;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let i = 0; i < numBands; i++) {
          const freqIndex = Math.floor(Math.pow(i / numBands, 1.25) * (bufferLength * 0.55));
          const val = hasRealAudio ? (freqData[freqIndex] / 255) : (0.06 + Math.sin(idleAngle + i * 0.3) * 0.03);
          const h = Math.max(3, val * (height * 0.8));

          const grad = ctx.createLinearGradient(0, centerY - h / 2, 0, centerY + h / 2);
          grad.addColorStop(0, '#ffc43d');
          grad.addColorStop(0.5, '#e63946');
          grad.addColorStop(1, '#ffc43d');

          ctx.fillStyle = grad;

          // Canal Izquierdo
          const leftX = centerX - (i + 1) * (bandWidth + 2);
          ctx.beginPath();
          ctx.roundRect(leftX, centerY - h / 2, bandWidth, h, [1.5, 1.5, 1.5, 1.5]);
          ctx.fill();

          // Canal Derecho
          const rightX = centerX + i * (bandWidth + 2);
          ctx.beginPath();
          ctx.roundRect(rightX, centerY - h / 2, bandWidth, h, [1.5, 1.5, 1.5, 1.5]);
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isBuffering, getAnalyser, frequencyBars, visualMode]);

  return (
    <div className={`relative w-full bg-[#0a0b0e] border-b border-white/[0.06] select-none ${className}`}>
      
      {/* Barra de cabecera del horizonte de estudio */}
      <div className="flex items-center justify-between px-5 sm:px-8 py-2 bg-gradient-to-r from-black/80 via-[#0d0e14] to-black/80">
        
        {/* Indicador de transmisión y frecuencia */}
        <div className="flex items-center gap-2.5">
          <span className={`w-1.5 h-1.5 rounded-full ${
            isPlaying ? 'bg-accent-red animate-pulse shadow-sm shadow-accent-red' : 'bg-zinc-600'
          }`} />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400">
            Espectro en Vivo
          </span>
          <span className="hidden sm:inline text-zinc-700">|</span>
          <span className="hidden sm:inline text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Web Audio API · 44.1 kHz
          </span>
        </div>

        {/* Medidor VU y selectores sutiles */}
        <div className="flex items-center gap-3">
          {/* Lectura digital de decibelios */}
          <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-400 tabular-nums">
            <span className="text-zinc-600">VU:</span>
            <span className={
              currentDb > -6 ? 'text-accent-red font-bold' : 
              currentDb > -18 ? 'text-amber-400 font-semibold' : 'text-emerald-400'
            }>
              {isPlaying ? `${currentDb} dB` : '-∞ dB'}
            </span>
          </div>

          <div className="h-3 w-px bg-white/10" />

          {/* Selector minimalista de modos visuales */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] p-0.5 rounded-lg border border-white/5">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = visualMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setVisualMode(mode.id)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-accent-red text-white shadow-sm shadow-accent-red/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                  title={`Modo ${mode.label}`}
                >
                  <Icon className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pantalla OLED de visualización de alta frecuencia */}
      <div className="relative w-full h-11 sm:h-12 overflow-hidden bg-gradient-to-b from-black/60 to-black/30">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block" 
        />
        {/* Desvanecimiento suave en los bordes laterales */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0a0b0e] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0a0b0e] to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default FrequencyVisualizer;
