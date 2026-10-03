import { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { 
  Calendar as CalendarIcon, Clock, User, Loader2, Radio, 
  Play, Pause, X, MessageCircle, ExternalLink, ChevronRight, Check 
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const DIAS_ORDEN = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DIAS_CORTOS = { 'Lunes': 'LUN', 'Martes': 'MAR', 'Miércoles': 'MIÉ', 'Jueves': 'JUE', 'Viernes': 'VIE', 'Sábado': 'SÁB', 'Domingo': 'DOM' };
const DIAS_MAPPING = { 'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6 };

const ProgramacionGrid = () => {
    const { isPlaying, togglePlay } = useAudio();
    const [programas, setProgramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDia, setSelectedDia] = useState('Todos');
    const [selectedPrograma, setSelectedPrograma] = useState(null);

    const hoyIndex = new Date().getDay();
    const hoyNombre = DIAS_ORDEN.find(d => DIAS_MAPPING[d] === hoyIndex) || 'Lunes';

    useEffect(() => {
        const q = query(collection(db, 'programacion'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const sortedData = data.sort((a, b) => {
                const diaDiff = DIAS_ORDEN.indexOf(a.dia) - DIAS_ORDEN.indexOf(b.dia);
                if (diaDiff !== 0) return diaDiff;
                return (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
            });
            setProgramas(sortedData);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const programasPorDia = useMemo(() => {
        return DIAS_ORDEN.reduce((acc, dia) => {
            acc[dia] = programas.filter(p => p.dia === dia);
            return acc;
        }, {});
    }, [programas]);

    // Filtrar días según tab activo
    const diasAMostrar = useMemo(() => {
        if (selectedDia === 'Todos') return DIAS_ORDEN;
        if (selectedDia === 'Hoy') return [hoyNombre];
        return [selectedDia];
    }, [selectedDia, hoyNombre]);

    // Calcular duración estimada
    const getDuracion = (inicio, fin) => {
        if (!inicio || !fin) return null;
        try {
            const [h1, m1] = inicio.split(':').map(Number);
            const [h2, m2] = fin.split(':').map(Number);
            let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (mins < 0) mins += 24 * 60;
            const horas = Math.floor(mins / 60);
            const rMins = mins % 60;
            if (horas > 0 && rMins > 0) return `${horas} h ${rMins} min`;
            if (horas > 0) return `${horas} hora${horas > 1 ? 's' : ''}`;
            return `${mins} min`;
        } catch {
            return null;
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            
            {/* Header Editorial con la estética de estudio */}
            <div className="mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-red block mb-2">
                    Guía de Emisión Semanal
                </span>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--card-border)]">
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-title font-black text-[var(--text-main)] tracking-tight">
                            Grilla de Programación
                        </h1>
                        <p className="text-sm sm:text-base text-[var(--text-muted)] mt-2 max-w-2xl leading-relaxed">
                            Acompañamos tu jornada con análisis, información veraz y la mejor selección musical transmitida desde Guarambaré.
                        </p>
                    </div>

                    {/* Selector interactivo de Días (Segmented Controls) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-hide max-w-full">
                        {['Todos', 'Hoy', ...DIAS_ORDEN].map((dia) => {
                            const isHoyTab = dia === 'Hoy';
                            const isActive = selectedDia === dia;
                            return (
                                <button
                                    key={dia}
                                    onClick={() => setSelectedDia(dia)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                                        isActive
                                            ? 'bg-accent-red text-white shadow-sm shadow-accent-red/30'
                                            : 'bg-[var(--card-border)]/50 hover:bg-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    {isHoyTab ? `Hoy (${DIAS_CORTOS[hoyNombre]})` : dia}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-14 h-14 rounded-2xl bg-accent-red/10 flex items-center justify-center mb-4">
                        <Loader2 className="w-6 h-6 text-accent-red animate-spin" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-muted)]">Cargando grilla oficial...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {diasAMostrar.map((dia) => {
                        const lista = programasPorDia[dia] || [];
                        if (lista.length === 0 && selectedDia !== 'Todos') {
                            return (
                                <div key={dia} className="glass-card rounded-3xl p-12 text-center border border-[var(--card-border)]">
                                    <Clock className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3" />
                                    <h3 className="font-title font-bold text-lg text-[var(--text-main)]">Sin programación especial</h3>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">Transmisión de música y noticias continuadas.</p>
                                </div>
                            );
                        }
                        if (lista.length === 0) return null;

                        const esHoy = DIAS_MAPPING[dia] === hoyIndex;

                        return (
                            <div 
                                key={dia} 
                                className={`glass-card rounded-3xl overflow-hidden border border-[var(--card-border)] transition-all ${
                                    esHoy ? 'ring-1 ring-accent-red/30' : ''
                                }`}
                            >
                                {/* Header del Día */}
                                <div className={`px-6 py-4 flex items-center justify-between border-b border-[var(--card-border)] ${
                                    esHoy ? 'bg-accent-red/5' : 'bg-[var(--surface)]'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                                            esHoy ? 'bg-accent-red text-white' : 'bg-[var(--card-border)] text-[var(--text-muted)]'
                                        }`}>
                                            {DIAS_CORTOS[dia]}
                                        </div>
                                        <div>
                                            <h2 className="font-title font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                                                <span>{dia}</span>
                                                {esHoy && (
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-accent-red bg-accent-red/10 px-2 py-0.5 rounded-full">
                                                        Hoy
                                                    </span>
                                                )}
                                            </h2>
                                        </div>
                                    </div>

                                    <span className="text-xs text-[var(--text-muted)] font-medium">
                                        {lista.length} {lista.length === 1 ? 'programa' : 'programas'}
                                    </span>
                                </div>

                                {/* Lista de Programas del Día */}
                                <div className="divide-y divide-[var(--card-border)]">
                                    {lista.map((prog) => {
                                        const titulo = prog.nombre_programa || prog.titulo || 'Programa CTN';
                                        const duracion = getDuracion(prog.hora_inicio, prog.hora_fin);

                                        return (
                                            <div
                                                key={prog.id}
                                                onClick={() => setSelectedPrograma(prog)}
                                                className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--card-border)]/40 transition-colors cursor-pointer group"
                                            >
                                                {/* Horario con tipografía tabular */}
                                                <div className="flex items-center gap-4 sm:w-44 shrink-0">
                                                    <div className="w-10 h-10 rounded-xl bg-[var(--card-border)]/60 flex items-center justify-center text-accent-red group-hover:bg-accent-red group-hover:text-white transition-colors">
                                                        <Clock className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-mono font-bold tabular-nums text-[var(--text-main)] block">
                                                            {prog.hora_inicio} — {prog.hora_fin}
                                                        </span>
                                                        {duracion && (
                                                            <span className="text-[11px] text-[var(--text-muted)]">
                                                                {duracion}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Título y Conductor */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-title font-bold text-base text-[var(--text-main)] group-hover:text-accent-red transition-colors truncate">
                                                        {titulo}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                                                        {prog.locutor ? (
                                                            <span className="flex items-center gap-1.5 truncate">
                                                                <User className="w-3.5 h-3.5 text-accent-red" />
                                                                <span>Conducción: <strong>{prog.locutor}</strong></span>
                                                            </span>
                                                        ) : (
                                                            <span>CTN Radio</span>
                                                        )}
                                                        {prog.categoria && (
                                                            <>
                                                                <span>·</span>
                                                                <span>{prog.categoria}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Botón Ver Ficha */}
                                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                                    <span className="text-xs font-semibold text-accent-red group-hover:underline hidden sm:inline">
                                                        Ver ficha
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-accent-red group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* FICHA MODAL DEL PROGRAMA Y LOCUTOR */}
            {selectedPrograma && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedPrograma(null)}
                >
                    <div 
                        className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-[var(--card-border)] relative shadow-2xl animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Botón Cerrar */}
                        <button
                            onClick={() => setSelectedPrograma(null)}
                            className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-[var(--card-border)]/60 hover:bg-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Encabezado de la Ficha */}
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red shrink-0">
                                <Radio className="w-7 h-7" />
                            </div>
                            <div className="min-w-0 pr-8">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-accent-red block mb-1">
                                    {selectedPrograma.dia} · {selectedPrograma.hora_inicio} a {selectedPrograma.hora_fin} hs
                                </span>
                                <h3 className="font-title font-black text-xl sm:text-2xl text-[var(--text-main)] leading-tight">
                                    {selectedPrograma.nombre_programa || selectedPrograma.titulo}
                                </h3>
                            </div>
                        </div>

                        {/* Datos del Locutor */}
                        <div className="p-4 rounded-2xl bg-[var(--card-border)]/40 border border-[var(--card-border)] mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-accent-red text-white font-title font-bold text-base flex items-center justify-center shrink-0">
                                    {(selectedPrograma.locutor || 'CTN')[0].toUpperCase()}
                                </div>
                                <div>
                                    <span className="text-[11px] font-medium text-[var(--text-muted)] block">
                                        Locutor / Conducción
                                    </span>
                                    <h4 className="font-bold text-sm text-[var(--text-main)]">
                                        {selectedPrograma.locutor || 'Equipo de Transmisión CTN'}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        {/* Descripción del Formato */}
                        <div className="space-y-3 mb-8">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                Acerca de este programa
                            </h5>
                            <p className="text-sm text-[var(--text-main)] leading-relaxed">
                                {selectedPrograma.descripcion || 
                                 'Espacio radial transmitido en vivo con las mejores selecciones musicales, novedades de la comunidad, entrevistas y participación directa de los oyentes a través de WhatsApp y el chat digital.'}
                            </p>
                        </div>

                        {/* Acciones Rápidas */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (!isPlaying) togglePlay();
                                    setSelectedPrograma(null);
                                }}
                                className="flex-1 py-3 px-4 rounded-xl bg-accent-red hover:bg-[#c92a35] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-accent-red/20 active:scale-95"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                <span>{isPlaying ? 'Escuchando en Vivo' : 'Sintonizar Ahora'}</span>
                            </button>

                            <a
                                href="https://wa.me/595981000000?text=Hola,%20quisiera%20enviar%20un%20saludo%20para%20el%20programa."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-xl bg-[var(--card-border)] hover:bg-[var(--card-border)]/80 text-[var(--text-main)] border border-[var(--card-border)] flex items-center justify-center transition-colors"
                                title="Enviar mensaje al programa"
                            >
                                <MessageCircle className="w-4 h-4 text-emerald-500" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramacionGrid;
