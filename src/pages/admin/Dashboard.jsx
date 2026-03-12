import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Radio, Save, Plus, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';

const Dashboard = () => {
    // Estructura de datos para Firestore
    const [config, setConfig] = useState({
        programaEnVivo: '',
        streams: [
            { nombre: 'Zeno FM (Principal)', url: '' }
        ],
        streamActivoIndex: 0
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Cargar configuración existente
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'configuracion', 'stream'));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Retrocompatibilidad con la version vieja que solo guardaba {url: string}
                    if (data.url && !data.streams) {
                        setConfig({
                            programaEnVivo: data.programaEnVivo || '',
                            streams: [{ nombre: 'Radio Principal', url: data.url }],
                            streamActivoIndex: 0
                        });
                    } else {
                        setConfig({
                            programaEnVivo: data.programaEnVivo || '',
                            streams: data.streams || [{ nombre: 'Radio Principal', url: '' }],
                            streamActivoIndex: data.streamActivoIndex || 0
                        });
                    }
                }
            } catch (error) {
                console.error("Error obteniendo configuracion:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            await setDoc(doc(db, 'configuracion', 'stream'), config, { merge: true });
            setMessage({ text: 'Configuración de transmisión actualizada. El reproductor público cambiará al instante.', type: 'success' });
        } catch (error) {
            console.error("Error guardando configuracion:", error);
            setMessage({ text: 'Error al asegurar cambios. Verifica tu conexión.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const addStream = () => {
        setConfig({
            ...config,
            streams: [...config.streams, { nombre: 'Nueva Señal', url: '' }]
        });
    };

    const removeStream = (index) => {
        if (config.streams.length === 1) {
            setMessage({ text: 'Debes mantener al menos una señal de transmisión.', type: 'error' });
            return;
        }

        const newStreams = config.streams.filter((_, i) => i !== index);
        let newActiveIndex = config.streamActivoIndex;

        // Ajustar índice activo si borramos la radio activa o una anterior a ella
        if (index === config.streamActivoIndex) {
            newActiveIndex = 0; // reset al primero
        } else if (index < config.streamActivoIndex) {
            newActiveIndex -= 1;
        }

        setConfig({
            ...config,
            streams: newStreams,
            streamActivoIndex: newActiveIndex
        });
    };

    const updateStream = (index, field, value) => {
        const newStreams = [...config.streams];
        newStreams[index][field] = value;
        setConfig({ ...config, streams: newStreams });
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-title font-bold mb-6 flex items-center">
                <Radio className="w-8 h-8 mr-3 text-accent-red animate-pulse" />
                Control de Transmisión En Vivo
            </h1>

            {message.text && (
                <div className={`p-4 rounded-xl mb-6 text-sm flex items-center ${message.type === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/50' : 'bg-red-500/20 text-red-200 border border-red-500/50'}`}>
                    {message.text}
                </div>
            )}

            <div className="glass-card bg-[var(--surface)] text-[var(--text-main)] rounded-2xl p-6 md:p-8 border border-[var(--card-border)] relative overflow-hidden mb-8 shadow-sm">
                {loading && (
                    <div className="absolute inset-0 bg-[var(--primary)]/80 flex items-center justify-center z-20 backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-accent-red" />
                    </div>
                )}

                <div className="space-y-8">
                    {/* Sección 1: Programa actual (Zocalo) */}
                    <div className="bg-[var(--primary)] p-6 rounded-xl border border-[var(--card-border)] shadow-sm">
                        <h2 className="text-xl font-bold mb-2">¿Qué está sonando ahora?</h2>
                        <p className="text-[var(--text-muted)] text-sm mb-4">Este texto aparecerá en los reproductores de la web (Hero y Sticky) aludiendo al programa actual.</p>

                        <div>
                            <input
                                type="text"
                                value={config.programaEnVivo}
                                onChange={(e) => setConfig({ ...config, programaEnVivo: e.target.value })}
                                className="w-full bg-[var(--surface)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors text-lg font-bold"
                                placeholder="Ej: Las Mañanas con Clemente"
                            />
                        </div>
                    </div>

                    {/* Sección 2: Lista de Streams */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-bold">Fuentes de Audio / Enlaces Múltiples</h2>
                                <p className="text-[var(--text-muted)] text-sm">Gestiona tus servidores de radio y elige cuál emitir pulsando el círculo izquierdo.</p>
                            </div>
                            <button
                                onClick={addStream}
                                className="text-accent-blue hover:text-[var(--primary)] bg-accent-blue/20 hover:bg-accent-blue/40 px-4 py-2 rounded-lg font-bold text-sm transition flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Añadir fuente
                            </button>
                        </div>

                        <div className="space-y-4">
                            {config.streams.map((stream, index) => {
                                const isActive = index === config.streamActivoIndex;
                                return (
                                    <div
                                        key={index}
                                        className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl border transition-all ${isActive
                                                ? 'bg-accent-red/10 border-accent-red/50 shadow-[0_0_15px_rgba(230,24,34,0.15)]'
                                                : 'bg-[var(--primary)] border-[var(--card-border)] hover:border-accent-red/30'
                                            }`}
                                    >
                                        <button
                                            onClick={() => setConfig({ ...config, streamActivoIndex: index })}
                                            title="Establecer como fuente PRINCIPAL EN VIVO"
                                            className="shrink-0 transition-transform hover:scale-110"
                                        >
                                            {isActive ? (
                                                <CheckCircle2 className="w-8 h-8 text-accent-red drop-shadow-md" />
                                            ) : (
                                                <Circle className="w-8 h-8 text-gray-600 hover:text-gray-400" />
                                            )}
                                        </button>

                                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input
                                                type="text"
                                                value={stream.nombre}
                                                onChange={(e) => updateStream(index, 'nombre', e.target.value)}
                                                className={`w-full bg-[var(--surface)] border rounded-lg px-3 py-2 text-[var(--text-main)] focus:outline-none focus:border-accent-red text-sm font-bold ${isActive ? 'border-accent-red/30' : 'border-[var(--card-border)]'}`}
                                                placeholder="Ej: Servidor Principal (Zeno)"
                                            />
                                            <input
                                                type="url"
                                                value={stream.url}
                                                onChange={(e) => updateStream(index, 'url', e.target.value)}
                                                className={`w-full md:col-span-2 bg-[var(--surface)] border rounded-lg px-3 py-2 text-[var(--text-main)] focus:outline-none focus:border-accent-red font-mono text-sm ${isActive ? 'border-accent-red/30' : 'border-[var(--card-border)]'}`}
                                                placeholder="https://stream.ejemplo.com/live"
                                            />
                                        </div>

                                        <button
                                            onClick={() => removeStream(index)}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition shrink-0"
                                            title="Eliminar esta fuente"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--card-border)] flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="bg-accent-red hover:bg-[#c92a35] text-[var(--primary)] px-8 py-4 rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-accent-red/20 flex items-center text-lg"
                    >
                        {saving ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Save className="w-6 h-6 mr-3" />}
                        {saving ? 'Aplicando cambios en la emisora...' : 'Guardar y Emitir al Público'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
