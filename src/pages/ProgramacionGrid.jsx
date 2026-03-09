import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Calendar as CalendarIcon, Clock, User, Loader2 } from 'lucide-react';

const ProgramacionGrid = () => {
    const [programas, setProgramas] = useState([]);
    const [loading, setLoading] = useState(true);

    const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    useEffect(() => {
        const q = query(collection(db, 'programacion'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Ordenar por día de la semana y luego por hora de inicio
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

    // Agrupar programas por día para visualizarlos mejor
    const programasPorDia = diasOrden.reduce((acc, dia) => {
        acc[dia] = programas.filter(p => p.dia === dia);
        return acc;
    }, {});


    return (
        <div className="container mx-auto px-4 py-12 pt-32">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-title font-bold text-white mb-4">Nuestra Programación</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Acompañamos tu día con la mejor información, entretenimiento y la
                    selección musical que nos caracteriza, desde Guarambaré para todo el mundo.
                </p>
                <div className="w-24 h-1 bg-accent-red mx-auto mt-6 rounded-full"></div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-accent-red animate-spin mb-4" />
                    <p className="text-gray-400 font-bold">Cargando Grilla...</p>
                </div>
            ) : (
                <div className="space-y-12 max-w-6xl mx-auto">
                    {diasOrden.map((dia) => (
                        programasPorDia[dia].length > 0 && (
                            <div key={dia} className="glass-card rounded-3xl p-6 md:p-8">
                                <h2 className="text-2xl font-bold font-title text-accent-red border-b border-white/10 pb-4 mb-6 flex items-center">
                                    <CalendarIcon className="w-6 h-6 mr-3" /> {dia}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {programasPorDia[dia].map(prog => (
                                        <div key={prog.id} className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:bg-black/60 hover:border-accent-red/50 transition-all group">
                                            <div className="flex items-center text-accent-blue font-mono text-sm font-bold mb-3 bg-accent-blue/10 w-fit px-3 py-1 rounded-full">
                                                <Clock className="w-4 h-4 mr-2" />
                                                {prog.hora_inicio} - {prog.hora_fin}
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-red transition-colors">{prog.nombre_programa}</h3>
                                            {prog.locutor && (
                                                <div className="flex items-center text-gray-400 text-sm">
                                                    <User className="w-4 h-4 mr-2 opacity-70" />
                                                    {prog.locutor}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}

                    {programas.length === 0 && (
                        <div className="text-center py-20 glass-card rounded-3xl">
                            <CalendarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">Grilla en actualización</h3>
                            <p className="text-gray-400">Próximamente publicaremos nuestra programación oficial.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProgramacionGrid;
