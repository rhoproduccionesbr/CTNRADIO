import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../services/firebase';
import { doc, onSnapshot, collection, query, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const AudioContext = createContext(null);

const DIAS_MAP = {
    'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3,
    'Jueves': 4, 'Viernes': 5, 'Sábado': 6
};

function detectarProgramaActual(programas) {
    const ahora = new Date();
    const diaActual = ahora.getDay();
    const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0');
    return programas.find(prog => {
        const diaPrograma = DIAS_MAP[prog.dia];
        if (diaPrograma !== diaActual) return false;
        return horaActual >= prog.hora_inicio && horaActual < prog.hora_fin;
    }) || null;
}

// Umbrales de Reconexión
const SILENT_RETRIES = 4;        // 4 intentos sin alterar la UI
const MAX_RECONNECT_WAIT = 15000; // 15s máximo entre intentos
const STALLED_GRACE = 5000;       // 5s de gracia antes de reconectar por stalled

export const AudioProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [streamUrl, setStreamUrl] = useState('');
    const [programaEnVivo, setProgramaEnVivo] = useState('');
    const [programaManual, setProgramaManual] = useState('');
    const [programas, setProgramas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [streamQuality, setStreamQuality] = useState('good');
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

    // Sleep Timer (Temporizador de Apagado)
    const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null); // null, 15, 30, 45, 60
    const [sleepRemainingSeconds, setSleepRemainingSeconds] = useState(0);

    const [audioData, setAudioData] = useState(1);
    const [frequencyBars, setFrequencyBars] = useState(new Array(20).fill(0));

    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const fadeIntervalRef = useRef(null);
    const stalledTimeoutRef = useRef(null);
    const intentionalPause = useRef(false);
    const bufferHealthRef = useRef(null);
    const waitingTimerRef = useRef(null);
    const sleepTimerIntervalRef = useRef(null);
    const preFadeVolumeRef = useRef(0.8);

    const FALLBACK_STREAM_URL = "/api/stream";

    // ===================================================================
    // Audio element lazy init
    // ===================================================================
    const getAudio = useCallback(() => {
        if (!audioRef.current) {
            const audio = new Audio();
            audio.preload = 'none';
            audio.crossOrigin = 'anonymous';
            audioRef.current = audio;
        }
        return audioRef.current;
    }, []);

    const toSecureUrl = (url) => {
        if (!url) return '';
        if (url.includes('136.248.117.199') || url.startsWith('http://')) return '/api/stream';
        return url;
    };

    // ===================================================================
    // 1. Configuración de stream desde Firestore
    // ===================================================================
    useEffect(() => {
        let unsub = () => {};
        const loadConfig = async () => {
            try {
                await signInAnonymously(auth).catch(() => {});
                unsub = onSnapshot(doc(db, 'configuracion', 'stream'), (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setProgramaManual(data.programaEnVivo || '');
                        let activeUrl = '';
                        if (data.streams && Array.isArray(data.streams) && data.streams.length > 0) {
                            const index = data.streamActivoIndex || 0;
                            const targetStream = data.streams[index] || data.streams[0];
                            activeUrl = targetStream.url;
                        } else if (data.url) {
                            activeUrl = data.url;
                        }
                        const secureUrl = activeUrl ? toSecureUrl(activeUrl) : FALLBACK_STREAM_URL;
                        if (secureUrl !== streamUrl) setStreamUrl(secureUrl);
                    } else {
                        setStreamUrl(FALLBACK_STREAM_URL);
                    }
                    setIsLoading(false);
                }, () => {
                    setStreamUrl(FALLBACK_STREAM_URL);
                    setIsLoading(false);
                });
            } catch {
                setStreamUrl(FALLBACK_STREAM_URL);
                setIsLoading(false);
            }
        };
        loadConfig();
        return () => unsub();
    }, [streamUrl]);

    // ===================================================================
    // 2. Cargar programación
    // ===================================================================
    useEffect(() => {
        const cargar = async () => {
            try {
                const snapshot = await getDocs(query(collection(db, 'programacion')));
                setProgramas(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch { /* silent */ }
        };
        cargar();
    }, []);

    // ===================================================================
    // 3. Detectar programa actual cada 60s
    // ===================================================================
    useEffect(() => {
        const actualizar = () => {
            if (programaManual) { setProgramaEnVivo(programaManual); return; }
            if (programas.length > 0) {
                const prog = detectarProgramaActual(programas);
                setProgramaEnVivo(prog ? (prog.nombre_programa || prog.titulo) : 'CTN Radio en Vivo');
            } else {
                setProgramaEnVivo('CTN Radio en Vivo');
            }
        };
        actualizar();
        const interval = setInterval(actualizar, 60000);
        return () => clearInterval(interval);
    }, [programas, programaManual]);

    // ===================================================================
    // Web Audio API — Visualizador con blindaje iOS
    // ===================================================================
    const setupAudioContext = useCallback(() => {
        const audio = getAudio();
        if (!audioContextRef.current) {
            try {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                audioContextRef.current = new Ctx();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256;
                analyserRef.current.smoothingTimeConstant = 0.82;
                sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.connect(audioContextRef.current.destination);
            } catch {
                // Fallback silencioso si el navegador o iOS restringe AudioContext
            }
        }
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume().catch(() => {});
        }
    }, [getAudio]);

    const lastFrameRef = useRef(0);
    const analyzeAudioRef = useRef(null);

    const analyzeAudio = useCallback((timestamp) => {
        if (!analyserRef.current) return;
        
        // Throttle a ~24fps (cada 42ms)
        if (timestamp - lastFrameRef.current < 42) {
            animationRef.current = requestAnimationFrame((ts) => analyzeAudioRef.current?.(ts));
            return;
        }
        lastFrameRef.current = timestamp;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        let bassSum = 0;
        for (let i = 0; i < 10; i++) bassSum += dataArray[i];
        setAudioData(1 + (bassSum / 10 / 255) * 0.2);

        const barCount = 16;
        const barsPerGroup = Math.floor(bufferLength / barCount);
        const newBars = new Array(barCount);
        for (let i = 0; i < barCount; i++) {
            let sum = 0;
            for (let j = 0; j < barsPerGroup; j++) sum += dataArray[i * barsPerGroup + j];
            newBars[i] = Math.max(5, (sum / barsPerGroup / 255) * 100);
        }
        setFrequencyBars(newBars);
        animationRef.current = requestAnimationFrame((ts) => analyzeAudioRef.current?.(ts));
    }, []);

    useEffect(() => {
        analyzeAudioRef.current = analyzeAudio;
    }, [analyzeAudio]);

    useEffect(() => {
        if (isPlaying && !isBuffering) {
            animationRef.current = requestAnimationFrame((ts) => analyzeAudioRef.current?.(ts));
        } else {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        }
        return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
    }, [isPlaying, isBuffering]);

    // ===================================================================
    // Fade-in logarítmico suave
    // ===================================================================
    const performFadeIn = useCallback(() => {
        const audio = getAudio();
        if (!audio) return;
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

        audio.volume = 0;
        const targetVol = volume;
        if (targetVol < 0.05) { audio.volume = targetVol; return; }

        let progress = 0;
        const totalSteps = 20;
        fadeIntervalRef.current = setInterval(() => {
            progress++;
            const fraction = progress / totalSteps;
            if (progress >= totalSteps) {
                audio.volume = targetVol;
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
            } else {
                audio.volume = Math.min(targetVol * Math.pow(fraction, 2), targetVol);
            }
        }, 40);
    }, [volume, getAudio]);

    // ===================================================================
    // Reconexión silenciosa y adaptativa
    // ===================================================================
    const attemptReconnectRef = useRef(null);

    const attemptReconnect = useCallback((reason, waitMs) => {
        const audio = getAudio();
        if (!audio || !streamUrl || intentionalPause.current) return;

        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

        reconnectAttemptsRef.current += 1;
        const attempt = reconnectAttemptsRef.current;
        const isSilent = attempt <= SILENT_RETRIES;

        console.log(`[CTN Audio] Reconectando (${reason}) — intento ${attempt}${isSilent ? ' [silencioso]' : ''}, espera ${waitMs}ms`);

        if (!isSilent) {
            setStreamQuality('reconnecting');
            setIsBuffering(true);
            setError(`Reconectando señal en vivo...`);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
            if (intentionalPause.current || !isPlaying) return;

            const timestamp = Date.now();
            const separator = streamUrl.includes('?') ? '&' : '?';
            audio.src = `${streamUrl}${separator}_t=${timestamp}`;
            audio.load();

            audio.play()
                .then(() => {
                    setError(null);
                    setStreamQuality('good');
                    setIsBuffering(false);
                    reconnectAttemptsRef.current = 0;
                    performFadeIn();
                })
                .catch(() => {
                    const nextWait = Math.min(waitMs * 1.35, MAX_RECONNECT_WAIT);
                    if (!isSilent) {
                        setError(`Reintentando conexión...`);
                        setStreamQuality('weak');
                    }
                    attemptReconnectRef.current?.(reason, nextWait);
                });
        }, waitMs);
    }, [streamUrl, isPlaying, getAudio, performFadeIn]);

    useEffect(() => {
        attemptReconnectRef.current = attemptReconnect;
    }, [attemptReconnect]);

    // ===================================================================
    // Detección de Eventos de Red (Online / Offline)
    // ===================================================================
    useEffect(() => {
        const handleOnline = () => {
            console.log('[CTN Audio] Red restablecida — Reanudando señal...');
            setIsOnline(true);
            if (isPlaying && !intentionalPause.current) {
                attemptReconnect('network-online', 300);
            }
        };

        const handleOffline = () => {
            console.log('[CTN Audio] Sin conexión de red');
            setIsOnline(false);
            setStreamQuality('weak');
            setError('Sin conexión a Internet. Esperando señal...');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isPlaying, attemptReconnect]);

    // ===================================================================
    // Sleep Timer (Temporizador de Apagado con Fade-Out)
    // ===================================================================
    const startSleepTimer = useCallback((minutes) => {
        if (!minutes || minutes <= 0) {
            if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
            sleepTimerIntervalRef.current = null;
            setSleepTimerMinutes(null);
            setSleepRemainingSeconds(0);
            return;
        }

        if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
        const totalSeconds = minutes * 60;
        setSleepTimerMinutes(minutes);
        setSleepRemainingSeconds(totalSeconds);
        preFadeVolumeRef.current = volume;
    }, [volume]);

    useEffect(() => {
        if (sleepTimerMinutes === null) return;

        sleepTimerIntervalRef.current = setInterval(() => {
            setSleepRemainingSeconds(prev => {
                if (prev <= 1) {
                    // Tiempo cumplido: Pausar transmisión
                    clearInterval(sleepTimerIntervalRef.current);
                    sleepTimerIntervalRef.current = null;
                    setSleepTimerMinutes(null);
                    
                    const audio = getAudio();
                    if (audio) {
                        audio.pause();
                        audio.volume = preFadeVolumeRef.current;
                    }
                    setIsPlaying(false);
                    return 0;
                }

                // Desvanecimiento suave en los últimos 15 segundos
                if (prev <= 15) {
                    const audio = getAudio();
                    if (audio) {
                        const factor = prev / 15;
                        audio.volume = Math.max(0.02, preFadeVolumeRef.current * factor);
                    }
                }

                return prev - 1;
            });
        }, 1000);

        return () => {
            if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
        };
    }, [sleepTimerMinutes, getAudio]);

    // ===================================================================
    // Event listeners del elemento <audio>
    // ===================================================================
    useEffect(() => {
        const audio = getAudio();

        const onWaiting = () => {
            if (!isPlaying || intentionalPause.current) return;
            if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
            waitingTimerRef.current = setTimeout(() => {
                if (isPlaying && !intentionalPause.current) {
                    setIsBuffering(true);
                }
            }, 1800);
        };

        const onCanPlay = () => {
            if (waitingTimerRef.current) { clearTimeout(waitingTimerRef.current); waitingTimerRef.current = null; }
            setIsBuffering(false);
            if (isPlaying) setStreamQuality('good');
        };

        const onPlaying = () => {
            if (waitingTimerRef.current) { clearTimeout(waitingTimerRef.current); waitingTimerRef.current = null; }
            setIsBuffering(false);
            setStreamQuality('good');
            setError(null);
        };

        const onError = () => {
            if (!isPlaying || intentionalPause.current) return;
            attemptReconnect('error', 1500);
        };

        const onEnded = () => {
            if (!isPlaying || intentionalPause.current) return;
            attemptReconnect('stream-ended', 1000);
        };

        const onStalled = () => {
            if (!isPlaying || intentionalPause.current) return;
            if (stalledTimeoutRef.current) clearTimeout(stalledTimeoutRef.current);
            stalledTimeoutRef.current = setTimeout(() => {
                if (audio.readyState < 3 && isPlaying && !intentionalPause.current) {
                    attemptReconnect('stalled', 1200);
                }
            }, STALLED_GRACE);
        };

        const onTimeUpdate = () => {
            if (!audio.buffered.length) return;
            const bufferEnd = audio.buffered.end(audio.buffered.length - 1);
            const bufferHealth = bufferEnd - audio.currentTime;
            bufferHealthRef.current = bufferHealth;

            if (bufferHealth < 2 && isPlaying) setStreamQuality('weak');
            else if (bufferHealth > 4 && isPlaying) setStreamQuality('good');
        };

        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('playing', onPlaying);
        audio.addEventListener('error', onError);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('stalled', onStalled);
        audio.addEventListener('timeupdate', onTimeUpdate);

        return () => {
            audio.removeEventListener('waiting', onWaiting);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('playing', onPlaying);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('stalled', onStalled);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            if (stalledTimeoutRef.current) clearTimeout(stalledTimeoutRef.current);
            if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
        };
    }, [isPlaying, attemptReconnect, getAudio]);

    // ===================================================================
    // Manejar cambio dinámico de URL del stream
    // ===================================================================
    useEffect(() => {
        if (!streamUrl) return;
        const audio = getAudio();
        const wasPlaying = isPlaying;
        const currentSrc = audio.src || '';
        const fullStreamUrl = streamUrl.startsWith('/') ? window.location.origin + streamUrl : streamUrl;
        const baseCurrentSrc = currentSrc.split('?')[0].split('#')[0];
        const baseStreamUrl = fullStreamUrl.split('?')[0].split('#')[0];

        if (baseCurrentSrc !== baseStreamUrl) {
            audio.src = streamUrl;
            if (wasPlaying) {
                audio.play().then(() => {
                    performFadeIn();
                    setIsBuffering(false);
                }).catch(() => {
                    setIsPlaying(false);
                    setIsBuffering(false);
                });
            }
        }
    }, [streamUrl, isPlaying, getAudio, performFadeIn]);

    // Sincronización de Volumen
    useEffect(() => {
        const audio = getAudio();
        if (!fadeIntervalRef.current) audio.volume = volume;
    }, [volume, getAudio]);

    useEffect(() => {
        const audio = getAudio();
        const handleVolumeChange = () => {
            if (!fadeIntervalRef.current && Math.abs(audio.volume - volume) > 0.05) setVolume(audio.volume);
        };
        audio.addEventListener('volumechange', handleVolumeChange);
        return () => audio.removeEventListener('volumechange', handleVolumeChange);
    }, [volume, getAudio]);

    // ===================================================================
    // Control Principal — CON PURGA DE BUFFER EN VIVO
    // ===================================================================
    const togglePlay = useCallback(() => {
        if (!streamUrl) return;
        const audio = getAudio();
        setupAudioContext();

        if (isPlaying) {
            // Pausar
            intentionalPause.current = true;
            audio.pause();
            setIsPlaying(false);
            setIsBuffering(false);
            setStreamQuality('good');
            setError(null);
            setAudioData(1);
            setFrequencyBars(new Array(16).fill(0));
            if (reconnectTimeoutRef.current) { clearTimeout(reconnectTimeoutRef.current); reconnectTimeoutRef.current = null; }
            if (stalledTimeoutRef.current) { clearTimeout(stalledTimeoutRef.current); stalledTimeoutRef.current = null; }
            reconnectAttemptsRef.current = 0;
        } else {
            // Reproducir — PURGA TOTAL DE BUFFER VIEJO:
            // Siempre se inyecta un nuevo timestamp y audio.load() para garantizar señal 100% en vivo
            intentionalPause.current = false;
            const timestamp = Date.now();
            const separator = streamUrl.includes('?') ? '&' : '?';
            audio.src = `${streamUrl}${separator}_t=${timestamp}`;
            audio.load();

            audio.play()
                .then(() => {
                    setIsPlaying(true);
                    setIsBuffering(false);
                    setError(null);
                    setStreamQuality('good');
                    reconnectAttemptsRef.current = 0;
                    performFadeIn();
                })
                .catch(err => {
                    if (err.name === 'NotAllowedError') {
                        setIsPlaying(false);
                        setIsBuffering(false);
                    } else {
                        setIsPlaying(true);
                        attemptReconnect('play-retry', 1000);
                    }
                });
        }
    }, [streamUrl, isPlaying, getAudio, setupAudioContext, performFadeIn, attemptReconnect]);

    // ===================================================================
    // Media Session API (Bloqueo de pantalla y notificaciones OS)
    // ===================================================================
    useEffect(() => {
        if ('mediaSession' in navigator && isPlaying) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: programaEnVivo || 'CTN Radio en Vivo',
                artist: 'CTN Radio 24/7',
                album: 'Guarambaré, Paraguay',
                artwork: [
                    { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml' },
                    { src: '/pwa-icon.png', sizes: '192x192', type: 'image/png' },
                    { src: '/splash-icon.png', sizes: '512x512', type: 'image/png' }
                ]
            });
            navigator.mediaSession.setActionHandler('play', togglePlay);
            navigator.mediaSession.setActionHandler('pause', togglePlay);
            navigator.mediaSession.setActionHandler('stop', () => { if (isPlaying) togglePlay(); });
        }
    }, [isPlaying, programaEnVivo, togglePlay]);

    // Limpieza global al desmontar
    useEffect(() => {
        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (stalledTimeoutRef.current) clearTimeout(stalledTimeoutRef.current);
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
            if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
        };
    }, []);

    const getAnalyser = useCallback(() => analyserRef.current, []);

    return (
        <AudioContext.Provider value={{
            isPlaying, isBuffering, togglePlay, volume, setVolume,
            streamUrl, programaEnVivo, isLoading, error,
            audioData, frequencyBars, streamQuality, isOnline,
            sleepTimerMinutes, sleepRemainingSeconds, startSleepTimer,
            getAnalyser, analyserRef
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => useContext(AudioContext);
