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

    const audioRef = useRef(new Audio());

    const FALLBACK_STREAM_URL = "https://stream.zeno.fm/8wdn606kvy8uv";

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

                        if (activeUrl && activeUrl !== streamUrl) {
                            setStreamUrl(activeUrl);
                        } else if (!activeUrl) {
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

    // Manejar audio src y volumen dinámicamente
    useEffect(() => {
        if (streamUrl) {
            const wasPlaying = isPlaying;
            audioRef.current.src = streamUrl;
            audioRef.current.volume = volume;

            if (wasPlaying) {
                audioRef.current.play().catch(e => console.log('Autoplay prevenido al cambiar de estación', e));
            }
        }
    }, [streamUrl]);

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // Control de reproducción
    const togglePlay = () => {
        if (!streamUrl) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => {
                    console.error("Error al reproducir:", err);
                    setError("Error reproduciendo el stream. Confirme la URL en el panel Admin.");
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
            error
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => useContext(AudioContext);
