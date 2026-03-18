import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { doc, onSnapshot, collection, query, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const AudioContext = createContext(null);

// Mapa de nombres de día en español (como los guarda Firestore) al índice de getDay()
const DIAS_MAP = {
    'Domingo': 0,
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6
};

/**
 * Dada la lista de programas y la fecha actual, determina cuál está al aire.
 */
function detectarProgramaActual(programas) {
    const ahora = new Date();
    const diaActual = ahora.getDay(); // 0=Domingo ... 6=Sábado
    const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0');

    const encontrado = programas.find(prog => {
        const diaPrograma = DIAS_MAP[prog.dia];
        if (diaPrograma !== diaActual) return false;

        // Comparar hora: hora_inicio <= horaActual < hora_fin
        return horaActual >= prog.hora_inicio && horaActual < prog.hora_fin;
    });

    return encontrado || null;
}

export const AudioProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [streamUrl, setStreamUrl] = useState('');
    const [programaEnVivo, setProgramaEnVivo] = useState('');
    const [programaManual, setProgramaManual] = useState('');
    const [programas, setProgramas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Audio Visualizer states
    const [audioData, setAudioData] = useState(0);

    const audioRef = useRef(new Audio());
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const fadeIntervalRef = useRef(null);

    const FALLBACK_STREAM_URL = "/api/stream";

    // Convertir URLs de AzuraCast al proxy para evitar errores de SSL/CORS/Mixed Content
    const toSecureUrl = (url) => {
        if (!url) return '';
        
        // Si la URL contiene la IP o es HTTP, forzamos el uso del proxy /api/stream
        // Esto es necesario tanto en Vercel (para evitar Mixed Content/SSL) como localmente
        if (url.includes('136.248.117.199') || url.startsWith('http://')) {
            return '/api/stream';
        }
        
        return url;
    };

    // 1. Cargar config de stream desde Firestore en tiempo real
    useEffect(() => {
        let unsub = () => { };

        const loadConfig = async () => {
            try {
                await signInAnonymously(auth).catch(e => console.warn("Aviso de Auth:", e.message));

                unsub = onSnapshot(doc(db, 'configuracion', 'stream'), (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();

                        // Guardar el nombre manual (override del admin)
                        setProgramaManual(data.programaEnVivo || '');

                        // Extraer URL Activa
                        let activeUrl = '';
                        if (data.streams && Array.isArray(data.streams) && data.streams.length > 0) {
                            const index = data.streamActivoIndex || 0;
                            const targetStream = data.streams[index] || data.streams[0];
                            activeUrl = targetStream.url;
                        } else if (data.url) {
                            activeUrl = data.url;
                        }

                        if (activeUrl) {
                            const secureUrl = toSecureUrl(activeUrl);
                            if (secureUrl !== streamUrl) {
                                setStreamUrl(secureUrl);
                            }
                        } else {
                            setStreamUrl(FALLBACK_STREAM_URL);
                        }
                    } else {
                        setStreamUrl(FALLBACK_STREAM_URL);
                    }
                    setIsLoading(false);
                    setError(null);
                }, (err) => {
                    console.error("Error de permisos en Firestore.", err.message);
                    setStreamUrl(FALLBACK_STREAM_URL);
                    setError("Aviso: Reglas bloquean lectura. Usando fallback.");
                });
            } catch (err) {
                console.error("Error general:", err);
                setStreamUrl(FALLBACK_STREAM_URL);
                setIsLoading(false);
            }
        };

        loadConfig();
        return () => unsub();
    }, []);

    // 2. Cargar la grilla de programación UNA VEZ
    useEffect(() => {
        const cargarProgramacion = async () => {
            try {
                const snapshot = await getDocs(query(collection(db, 'programacion')));
                const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setProgramas(data);
            } catch (err) {
                console.warn("No se pudo cargar la programación para detección automática:", err.message);
            }
        };
        cargarProgramacion();
    }, []);

    // 3. Cada 60 segundos, detectar qué programa está al aire
    useEffect(() => {
        const actualizar = () => {
            // Si el admin escribió un nombre manual, ése tiene prioridad absoluta
            if (programaManual) {
                setProgramaEnVivo(programaManual);
                return;
            }

            // Si no, buscar en la grilla automática
            if (programas.length > 0) {
                const prog = detectarProgramaActual(programas);
                if (prog) {
                    setProgramaEnVivo(prog.nombre_programa);
                } else {
                    setProgramaEnVivo('CTN Radio en Vivo');
                }
            } else {
                setProgramaEnVivo('CTN Radio en Vivo');
            }
        };

        actualizar(); // ejecutar inmediatamente
        const interval = setInterval(actualizar, 60000); // y luego cada minuto

        return () => clearInterval(interval);
    }, [programas, programaManual]);

    // Setup Audio Context for Visualizer
    const setupAudioContext = () => {
        if (!audioContextRef.current) {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                audioContextRef.current = new AudioContextClass();
                analyserRef.current = audioContextRef.current.createAnalyser();
                
                // Allow cross-origin for external streams
                audioRef.current.crossOrigin = "anonymous";
                
                sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.connect(audioContextRef.current.destination);

                analyserRef.current.fftSize = 256;
            } catch (e) {
                console.warn("AudioContext setup failed or already created:", e);
            }
        }
        
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const analyzeAudio = () => {
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calcular el promedio de las frecuencias bajas (bajos) para causar el "pulso"
        let sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += dataArray[i];
        }
        const average = sum / 10;
        const scale = 1 + (average / 255) * 0.2; // Escalar máximo al 120% del tamaño original
        setAudioData(scale);

        if (isPlaying) {
            animationRef.current = requestAnimationFrame(analyzeAudio);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            analyzeAudio();
        } else {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            setAudioData(1); // Reset scale
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying]);

    // Helper para Fade-In suave
    const performFadeIn = () => {
        const audio = audioRef.current;
        if (!audio) return;
        
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
        }
        
        audio.volume = 0; // Comienza silenciado
        let currentVol = 0;
        const targetVol = volume;
        
        if (targetVol < 0.1) {
            audio.volume = targetVol;
            return;
        }
        
        const step = targetVol / 20; 
        fadeIntervalRef.current = setInterval(() => {
            currentVol += step;
            if (currentVol >= targetVol) {
                audio.volume = targetVol;
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
            } else {
                audio.volume = currentVol;
            }
        }, 50); // ~1 segundo de transición suave
    };

    // Manejar audio src y volumen dinámicamente
    useEffect(() => {
        if (streamUrl) {
            const wasPlaying = isPlaying;
            
            if (audioRef.current.src !== streamUrl && audioRef.current.src !== window.location.origin + streamUrl) {
                audioRef.current.src = streamUrl;
                audioRef.current.load();
            }
            
            if (!fadeIntervalRef.current) {
                audioRef.current.volume = volume;
            }

            if (wasPlaying) {
                audioRef.current.play().then(() => {
                    performFadeIn();
                }).catch(e => {
                    console.log('Autoplay prevenido al cambiar de estación', e);
                    setIsPlaying(false);
                });
            }
        }
    }, [streamUrl]);

    // Update <audio> volume when React state changes (unless a fade in is happening)
    useEffect(() => {
        if (!fadeIntervalRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Sync React volume with native hardware volume changes (e.g. mobile volume buttons that impact web-audio natively)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const handleVolumeChange = () => {
            // Evitamos un loop si el fade-in nuestro está alterando el volumen activamente
            if (!fadeIntervalRef.current && Math.abs(audio.volume - volume) > 0.05) {
                setVolume(audio.volume);
            }
        };
        audio.addEventListener('volumechange', handleVolumeChange);
        return () => audio.removeEventListener('volumechange', handleVolumeChange);
    }, [volume]);

    // Media Session API para pantalla de bloqueo / auto
    useEffect(() => {
        if ('mediaSession' in navigator && isPlaying) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: programaEnVivo || 'CTN Radio en Vivo',
                artist: 'CTN Radio',
                album: 'Transmisión Online',
                artwork: [
                    { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            // Handlers para que los botones nativos del SO sincronicen con React
            navigator.mediaSession.setActionHandler('play', () => togglePlay());
            navigator.mediaSession.setActionHandler('pause', () => togglePlay());
            navigator.mediaSession.setActionHandler('stop', () => {
                if (isPlaying) togglePlay();
            });
        }
    }, [isPlaying, programaEnVivo]);

    // Control de reproducción
    const togglePlay = () => {
        if (!streamUrl) return;

        setupAudioContext();

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Asegurarse de que el source esté cargado si fallaba
            if (audioRef.current.readyState === 0 || audioRef.current.error) {
               audioRef.current.load();
            }

            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    setError(null);
                    reconnectAttemptsRef.current = 0;
                    performFadeIn();
                })
                .catch(err => {
                    console.error("Error al reproducir:", err);
                    // Intentar re-cargar el stream si falló por completo
                    if (err.name === 'NotSupportedError' || err.name === 'NotAllowedError') {
                        setError("Error de reproducción. Reintentando...");
                        audioRef.current.load();
                    } else {
                        setError("Error al conectar con la radio. Revisa la señal.");
                    }
                    setIsPlaying(false);
                });
        }
    };

    // Lógica de Auto-Reconexión para resolver cortes temporales de Icecast
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleStreamDropout = (e) => {
            // Solo intentar reconectar si se espera que esté reproduciendo
            if (!isPlaying || !streamUrl) return;

            console.log(`Stream interrumpido (evento: ${e.type}). Intentando reconectar en 5 segundos...`);
            setError("Reconectando señal...");

            // Limpiar timeouts previos
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            // Retry Backoff Exponencial
            reconnectAttemptsRef.current += 1;
            let waitTime = 5000 * Math.pow(2, reconnectAttemptsRef.current - 1);
            if (waitTime > 30000) waitTime = 30000; // Máximo 30 segundos de espera por intento

            console.log(`Stream interrumpido (evento: ${e.type}). Intentando reconectar en ${waitTime/1000} segundos...`);
            setError(`Reconectando señal en ${waitTime/1000}s...`);

            // Esperar 'waitTime' antes de forzar reconexión para dar tiempo al switch de Icecast o recuperación paulatina
            reconnectTimeoutRef.current = setTimeout(() => {
                if (!isPlaying || !streamUrl) return; // Verificar nuevamente después del timeout

                console.log(`Forzando reconexión del stream (intento ${reconnectAttemptsRef.current})...`);
                const timestamp = new Date().getTime();
                const separator = streamUrl.includes('?') ? '&' : '?';
                const noCacheUrl = `${streamUrl}${separator}t=${timestamp}`;

                // Recargar src para evadir caché, sin modificar streamUrl global para evitar parpadeos
                audio.src = noCacheUrl;
                audio.load();
                
                audio.play()
                    .then(() => {
                        console.log("Reconexión exitosa.");
                        setError(null);
                        reconnectAttemptsRef.current = 0; // Resetear intentos de error exitosos
                        performFadeIn();
                    })
                    .catch(err => {
                        console.error("Fallo al reconectar:", err);
                        setError("Error de señal. Reintentando de nuevo...");
                    });
            }, waitTime);
        };

        // Escuchar eventos propensos a cortes
        audio.addEventListener('error', handleStreamDropout);
        audio.addEventListener('ended', handleStreamDropout);
        audio.addEventListener('stalled', handleStreamDropout);
        audio.addEventListener('suspend', handleStreamDropout);

        return () => {
            audio.removeEventListener('error', handleStreamDropout);
            audio.removeEventListener('ended', handleStreamDropout);
            audio.removeEventListener('stalled', handleStreamDropout);
            audio.removeEventListener('suspend', handleStreamDropout);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [isPlaying, streamUrl]);

    return (
        <AudioContext.Provider value={{
            isPlaying,
            togglePlay,
            volume,
            setVolume,
            streamUrl,
            programaEnVivo,
            isLoading,
            error,
            audioData
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => useContext(AudioContext);
