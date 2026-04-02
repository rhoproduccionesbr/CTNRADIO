import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Calendar as CalendarIcon, Clock, User, Loader2, Radio } from 'lucide-react';

const ProgramacionGrid = () => {
    const [programas, setProgramas] = useState([]);
    const [loading, setLoading] = useState(true);

    const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const diasCortos = { 'Lunes': 'LUN', 'Martes': 'MAR', 'Miércoles': 'MIÉ', 'Jueves': 'JUE', 'Viernes': 'VIE', 'Sábado': 'SÁB', 'Domingo': 'DOM' };

    useEffect(() => {
        const q = query(collection(db, 'programacion'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const sortedData = data.sort((a, b) => {
                const diaDiff = diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia);
                if (diaDiff !== 0) return diaDiff;
                return a.hora_inicio.localeCompare(b.hora_inicio);
            });
            setProgramas(sortedData);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const programasPorDia = diasOrden.reduce((acc, dia) => {
        acc[dia] = programas.filter(p => p.dia === dia);
        return acc;
    }, {});

    // Detectar si hoy es el día del programa
    const hoyIndex = new Date().getDay();
    const diasMapping = { 'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6 };

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6">
            {/* Header con glow de fondo */}
            <div className="page-header text-center mb-14 relative">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-accent-red/8 text-accent-red text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 border border-accent-red/10">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Programación Semanal
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-title font-black text-[var(--text-main)] mb-4 tracking-tight">
                        Nuestra <span className="gradient-text">Programación</span>
                    </h1>
                    <p className="text-[var(--text-muted)] max-w-xl mx-auto text-base leading-relaxed">
                        Acompañamos tu día con información, entretenimiento y la mejor selección musical desde Guarambaré.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-16 h-16 rounded-2xl bg-accent-red/10 flex items-center justify-center mb-4">
                        <Loader2 className="w-7 h-7 text-accent-red animate-spin" />
                    </div>
                    <p className="text-[var(--text-muted)] font-semibold text-sm">Cargando programación...</p>
                </div>
            ) : (
                <div className="space-y-8 max-w-5xl mx-auto">
                    {diasOrden.map((dia, diaIdx) => (
                        programasPorDia[dia].length > 0 && (
                            <div 
                                key={dia} 
                                className={`glass-card rounded-2xl overflow-hidden animate-fade-in-up ${diasMapping[dia] === hoyIndex ? 'ring-1 ring-accent-red/20' : ''}`}
                                style={{ animationDelay: `${diaIdx * 80}ms` }}
                            >
                                {/* Header del día */}
                                <div className={`px-6 py-4 flex items-center justify-between border-b border-[var(--card-border)] ${diasMapping[dia] === hoyIndex ? 'bg-accent-red/5' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                                            diasMapping[dia] === hoyIndex 
                                                ? 'bg-accent-red text-white' 
                                                : 'bg-[var(--card-border)] text-[var(--text-muted)]'
                                        }`}>
                                            {diasCortos[dia]}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold font-title text-[var(--text-main)]">{dia}</h2>
                                            {diasMapping[dia] === hoyIndex && (
                                                <span className="text-[10px] font-bold text-accent-red uppercase tracking-wider">Hoy</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs text-[var(--text-muted)] font-semibold bg-[var(--card-border)] px-2.5 py-1 rounded-lg">
                                        {programasPorDia[dia].length} {programasPorDia[dia].length === 1 ? 'programa' : 'programas'}
                                    </span>
                                </div>

                                {/* Programas del día */}
                                <div className="divide-y divide-[var(--card-border)]">
                                    {programasPorDia[dia].map((prog, idx) => (
                                        <div key={prog.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[var(--card-border)]/50 transition-colors group">
                                            {/* Hora */}
                                            <div className="shrink-0 text-center w-20">
                                                <div className="text-sm font-mono font-bold text-accent-blue">
                                                    {prog.hora_inicio}
                                                </div>
                                                <div className="text-[10px] text-[var(--text-muted)]">
                                                    a {prog.hora_fin}
                                                </div>
                                            </div>
                                            
                                            {/* Línea vertical decorativa */}
                                            <div className="w-px h-10 bg-[var(--card-border)] shrink-0"></div>
                                            
                                            {/* Info del programa */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-[var(--text-main)] group-hover:text-accent-red transition-colors truncate">
                                                    {prog.nombre_programa}
                                                </h3>
                                                {prog.locutor && (
                                                    <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs mt-0.5">
                                                        <User className="w-3 h-3" />
                                                        {prog.locutor}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Icono decorativo */}
                                            <Radio className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}

                    {programas.length === 0 && (
                        <div className="text-center py-24 glass-card rounded-2xl">
                            <div className="w-20 h-20 rounded-2xl bg-[var(--card-border)] mx-auto mb-6 flex items-center justify-center">
                                <CalendarIcon className="w-8 h-8 text-[var(--text-muted)]" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Grilla en actualización</h3>
                            <p className="text-[var(--text-muted)] text-sm">Próximamente publicaremos nuestra programación oficial.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProgramacionGrid;
