import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';

const Programacion = () => {
    const [programas, setProgramas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado para formulario
    const [formData, setFormData] = useState({ dia: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00', nombre_programa: '', locutor: '' });
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // Cargar programas
    useEffect(() => {
        const q = query(collection(db, 'programacion')); // Se podría ordernar por hora aquí
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Ordenar por día de la semana y luego por hora
            const sortedData = data.sort((a, b) => {
                if (a.dia !== b.dia) return diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia);
                return a.hora_inicio.localeCompare(b.hora_inicio);
            });

            setProgramas(sortedData);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await updateDoc(doc(db, 'programacion', editingId), formData);
            } else {
                await addDoc(collection(db, 'programacion'), formData);
            }
            setFormData({ dia: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00', nombre_programa: '', locutor: '' });
            setEditingId(null);
        } catch (error) {
            console.error("Error guardando programa", error);
            alert("Hubo un error al guardar. Revisa tus permisos.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este programa?")) {
            try {
                await deleteDoc(doc(db, 'programacion', id));
            } catch (error) {
                console.error("Error eliminando", error);
                alert("Error al eliminar.");
            }
        }
    };

    const handleEdit = (prog) => {
        setFormData({
            dia: prog.dia,
            hora_inicio: prog.hora_inicio,
            hora_fin: prog.hora_fin,
            nombre_programa: prog.nombre_programa,
            locutor: prog.locutor || ''
        });
        setEditingId(prog.id);
    };

    return (
        <div>
            <h1 className="text-3xl font-title font-bold mb-6">Gestión de Programación</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Columna Formulario */}
                <div className="lg:col-span-1">
                    <div className="glass-card rounded-2xl p-6 border border-white/10 sticky top-4">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            {editingId ? <><Edit2 className="w-5 h-5 mr-2" /> Editar Programa</> : <><Plus className="w-5 h-5 mr-2" /> Nuevo Programa</>}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Día</label>
                                <select
                                    value={formData.dia} onChange={e => setFormData({ ...formData, dia: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent-red"
                                >
                                    {diasOrden.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-400 mb-1">Inicio</label>
                                    <input type="time" required value={formData.hora_inicio} onChange={e => setFormData({ ...formData, hora_inicio: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent-red" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-400 mb-1">Fin</label>
                                    <input type="time" required value={formData.hora_fin} onChange={e => setFormData({ ...formData, hora_fin: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent-red" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nombre del Programa</label>
                                <input type="text" required placeholder="Ej: Mañanas Informativas" value={formData.nombre_programa} onChange={e => setFormData({ ...formData, nombre_programa: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent-red" />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Locutor(es)</label>
                                <input type="text" placeholder="Ej: Prof. Clemente Torales" value={formData.locutor} onChange={e => setFormData({ ...formData, locutor: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent-red" />
                            </div>

                            <div className="flex space-x-2 pt-2">
                                <button type="submit" disabled={saving} className="flex-1 bg-accent-red hover:bg-red-700 text-white py-2 rounded-xl font-bold transition flex justify-center items-center disabled:opacity-50">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? <><Save className="w-4 h-4 mr-2" /> Guardar</> : 'Añadir')}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={() => { setEditingId(null); setFormData({ dia: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00', nombre_programa: '', locutor: '' }) }} className="px-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Columna Lista */}
                <div className="lg:col-span-2">
                    <div className="glass-card rounded-2xl p-6 border border-white/10 min-h-[400px]">
                        <h2 className="text-xl font-bold mb-4">Grilla Actual</h2>

                        {loading ? (
                            <div className="flex justify-center items-center h-32 text-gray-400"><Loader2 className="w-8 h-8 animate-spin" /></div>
                        ) : programas.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">No hay programas en la grilla. ¡Añade uno!</div>
                        ) : (
                            <div className="space-y-4">
                                {programas.map((prog) => (
                                    <div key={prog.id} className="bg-black/30 border border-white/5 rounded-xl p-4 flex justify-between items-center hover:bg-black/50 transition">
                                        <div>
                                            <div className="flex items-center space-x-3 mb-1">
                                                <span className="bg-accent-blue text-xs font-bold px-2 py-1 rounded w-20 text-center">{prog.dia}</span>
                                                <span className="text-sm font-mono text-gray-300">{prog.hora_inicio} - {prog.hora_fin}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-white">{prog.nombre_programa}</h3>
                                            <p className="text-sm text-gray-400">{prog.locutor}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEdit(prog)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(prog.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/40 rounded-lg transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Programacion;
