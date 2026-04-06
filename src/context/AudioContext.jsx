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

// ===================================================================
// Umbral: cuántos intentos SILENCIOSOS antes de molestar al usuario
// ===================================================================
const SILENT_RETRIES = 4;        // 4 intentos sin mostrar nada
const MAX_RECONNECT_WAIT = 15000; // 15s máximo entre intentos
const STALLED_GRACE = 6000;       // 6s de gracia antes de reconectar por stalled

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
    const hasEverPlayed = useRef(false);
    const bufferHealthRef = useRef(null);
    const waitingTimerRef = useRef(null);

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
    // 1. Config de stream desde Firestore
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
    }, []);

    // ===================================================================
    // 2. Cargar programación
    // ===================================================================
    useEffect(() => {
        const cargar = async () => {
            try {
                const snapshot = await getDocs(query(collection(db, 'programacion')));
                setProgramas(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch {}
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
                setProgramaEnVivo(prog ? prog.nombre_programa : 'CTN Radio en Vivo');
            } else {
                setProgramaEnVivo('CTN Radio en Vivo');
            }
        };
        actualizar();
        const interval = setInterval(actualizar, 60000);
        return () => clearInterval(interval);
    }, [programas, programaManual]);

    // ===================================================================
    // Web Audio API — Visualizador
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
            } catch {}
        }
        if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
    }, [getAudio]);

    const lastFrameRef = useRef(0);
    const analyzeAudio = useCallback((timestamp) => {
        if (!analyserRef.current) return;
        
        // Throttle to ~24fps (cada 42ms) — imperceptible pero ahorra 60% CPU
        if (timestamp - lastFrameRef.current < 42) {
            animationRef.current = requestAnimationFrame(analyzeAudio);
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
        animationRef.current = requestAnimationFrame(analyzeAudio);
    }, []);

    useEffect(() => {
        if (isPlaying && !isBuffering) {
            animationRef.current = requestAnimationFrame(analyzeAudio);
        } else {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (!isPlaying) { setAudioData(1); setFrequencyBars(new Array(16).fill(0)); }
        }
        return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
    }, [isPlaying, isBuffering, analyzeAudio]);

    // ===================================================================
    // Fade-in logarítmico
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
    // RECONEXIÓN SILENCIOSA
    // Los primeros N intentos son 100% invisibles para el usuario.
    // Solo tras SILENT_RETRIES fallos se muestra feedback.
    // ===================================================================
    const attemptReconnect = useCallback((reason, waitMs) => {
        const audio = getAudio();
        if (!audio || !streamUrl || intentionalPause.current) return;

        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

        reconnectAttemptsRef.current += 1;
        const attempt = reconnectAttemptsRef.current;
        const isSilent = attempt <= SILENT_RETRIES;

        console.log(`[CTN Audio] Reconectando (${reason}) — intento ${attempt}${isSilent ? ' [silencioso]' : ''}, espera ${waitMs}ms`);

        // Solo mostrar UI de reconexión DESPUÉS de agotar intentos silenciosos
        if (!isSilent) {
            setStreamQuality('reconnecting');
            setIsBuffering(true);
            setError(`Reconectando señal (intento ${attempt - SILENT_RETRIES})...`);
        }
        // Intentos silenciosos: no cambiar nada en la UI

        reconnectTimeoutRef.current = setTimeout(() => {
            if (intentionalPause.current || !isPlaying) return;

            const timestamp = Date.now();
            const separator = streamUrl.includes('?') ? '&' : '?';
            audio.src = `${streamUrl}${separator}_t=${timestamp}`;

            audio.play()
                .then(() => {
                    console.log(`[CTN Audio] ✅ Reconexión exitosa (intento ${attempt})`);
                    setError(null);
                    setStreamQuality('good');
                    setIsBuffering(false);
                    reconnectAttemptsRef.current = 0;
                    performFadeIn();
                })
                .catch(() => {
                    const nextWait = Math.min(waitMs * 1.4, MAX_RECONNECT_WAIT);

                    // Si ya superó los silenciosos, mostrar cuenta regresiva
                    if (!isSilent) {
                        setError(`Reintentando en ${Math.round(nextWait / 1000)}s...`);
                        setStreamQuality('weak');
                    }

                    // Seguir reintentando automáticamente
                    attemptReconnect(reason, nextWait);
                });
        }, waitMs);
    }, [streamUrl, isPlaying, getAudio, performFadeIn]);

    // ===================================================================
    // Event listeners del audio element
    // ===================================================================
    useEffect(() => {
        const audio = getAudio();

        // --- Buffering: solo mostrar si dura > 2 segundos ---
        // Micro-buffers normales no molestan al usuario
        const onWaiting = () => {
            if (!isPlaying || intentionalPause.current) return;
            // Esperar 2s antes de mostrar indicador de buffering
            if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
            waitingTimerRef.current = setTimeout(() => {
                if (isPlaying && !intentionalPause.current) {
                    setIsBuffering(true);
                }
            }, 2000);
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

        // --- Error de red/stream ---
        const onError = () => {
            if (!isPlaying || intentionalPause.current) return;
            attemptReconnect('error', 2000);
        };

        // --- AutoDJ → Live switch ---
        const onEnded = () => {
            if (!isPlaying || intentionalPause.current) return;
            attemptReconnect('autodj-switch', 1200);
        };

        // --- Stalled: datos dejaron de llegar ---
        const onStalled = () => {
            if (!isPlaying || intentionalPause.current) return;
            if (stalledTimeoutRef.current) clearTimeout(stalledTimeoutRef.current);
            stalledTimeoutRef.current = setTimeout(() => {
                if (audio.readyState < 3 && isPlaying && !intentionalPause.current) {
                    attemptReconnect('stalled', 1500);
                }
            }, STALLED_GRACE);
        };

        // --- Monitoreo de buffer health (silencioso) ---
        const onTimeUpdate = () => {
            if (!audio.buffered.length) return;
            const bufferEnd = audio.buffered.end(audio.buffered.length - 1);
            const bufferHealth = bufferEnd - audio.currentTime;
            bufferHealthRef.current = bufferHealth;

            // Solo cambiar calidad visual, sin interrumpir ni reconectar
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
    // Manejar cambio de URL del stream
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
                // Reconexión silenciosa al cambiar de stream
                audio.play().then(() => {
                    performFadeIn();
                    setIsBuffering(false);
                }).catch(() => {
                    setIsPlaying(false);
                    setIsBuffering(false);
                });
            }
        }
    }, [streamUrl, getAudio, performFadeIn]);

    // Volumen sync
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
    // Media Session API
    // ===================================================================
    useEffect(() => {
        if ('mediaSession' in navigator && isPlaying) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: programaEnVivo || 'CTN Radio en Vivo',
                artist: 'CTN Radio',
                album: 'Transmisión Online',
                artwork: [
                    { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml' },
                    { src: '/pwa-icon.png', sizes: '192x192', type: 'image/png' },
                ]
            });
            navigator.mediaSession.setActionHandler('play', () => togglePlay());
            navigator.mediaSession.setActionHandler('pause', () => togglePlay());
            navigator.mediaSession.setActionHandler('stop', () => { if (isPlaying) togglePlay(); });
        }
    }, [isPlaying, programaEnVivo]);

    // ===================================================================
    // Control principal — INICIO LIMPIO sin mensajes
    // ===================================================================
    const togglePlay = useCallback(() => {
        if (!streamUrl) return;
        const audio = getAudio();
        setupAudioContext();

        if (isPlaying) {
            // PAUSA
            intentionalPause.current = true;
            audio.pause();
            setIsPlaying(false);
            setIsBuffering(false);
            setStreamQuality('good');
            setError(null);
            if (reconnectTimeoutRef.current) { clearTimeout(reconnectTimeoutRef.current); reconnectTimeoutRef.current = null; }
            if (stalledTimeoutRef.current) { clearTimeout(stalledTimeoutRef.current); stalledTimeoutRef.current = null; }
            reconnectAttemptsRef.current = 0;
        } else {
            // PLAY — inicio limpio, sin "conectando"
            intentionalPause.current = false;
            // NO setIsBuffering(true) aquí — dejamos la UI limpia hasta que sea necesario

            if (audio.readyState === 0 || audio.error || !hasEverPlayed.current) {
                const timestamp = Date.now();
                const separator = streamUrl.includes('?') ? '&' : '?';
                audio.src = `${streamUrl}${separator}_t=${timestamp}`;
            }

            audio.play()
                .then(() => {
                    setIsPlaying(true);
                    setIsBuffering(false);
                    setError(null);
                    setStreamQuality('good');
                    reconnectAttemptsRef.current = 0;
                    hasEverPlayed.current = true;
                    performFadeIn();
                })
                .catch(err => {
                    if (err.name === 'NotAllowedError') {
                        // Requiere gesto del usuario — no mostrar error, reintentar automático
                        setIsPlaying(false);
                        setIsBuffering(false);
                    } else {
                        // Error real — intentar reconexión silenciosa
                        setIsPlaying(true); // Mantener estado de "playing" para que el motor reconecte
                        attemptReconnect('play-failed', 2000);
                    }
                });
        }
    }, [streamUrl, isPlaying, getAudio, setupAudioContext, performFadeIn, attemptReconnect]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (stalledTimeoutRef.current) clearTimeout(stalledTimeoutRef.current);
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (waitingTimerRef.current) clearTimeout(waitingTimerRef.current);
        };
    }, []);

    return (
        <AudioContext.Provider value={{
            isPlaying, isBuffering, togglePlay, volume, setVolume,
            streamUrl, programaEnVivo, isLoading, error,
            audioData, frequencyBars, streamQuality,
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => useContext(AudioContext);
