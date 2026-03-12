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

    const FALLBACK_STREAM_URL = "/api/stream";

    // Convertir URLs HTTP de AzuraCast al proxy para evitar errores de contenido mixto
    const toSecureUrl = (url) => {
        if (!url) return '';
        // Si la URL es HTTP (no segura) y estamos en una página HTTPS, usamos el proxy
        if (url.startsWith('http://') && window.location.protocol === 'https:') {
            return '/api/stream';
        }
        // Si contiene el IP y estamos en desarrollo, usamos el proxy local configurado en vite.config.js
        if (url.includes('136.248.117.199') && (process.env.NODE_ENV === 'development' || import.meta.env.DEV)) {
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

    // Manejar audio src y volumen dinámicamente
    useEffect(() => {
        if (streamUrl) {
            const wasPlaying = isPlaying;
            
            // Only update src if it's different to prevent resetting the stream unnecessarily
            if (audioRef.current.src !== streamUrl && audioRef.current.src !== window.location.origin + streamUrl) {
                audioRef.current.src = streamUrl;
                audioRef.current.load(); // Es importante llamar a load() al cambiar el src en Safari/Chrome
            }
            
            audioRef.current.volume = volume;

            if (wasPlaying) {
                audioRef.current.play().catch(e => {
                    console.log('Autoplay prevenido al cambiar de estación', e);
                    setIsPlaying(false);
                });
            }
        }
    }, [streamUrl]);

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

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
