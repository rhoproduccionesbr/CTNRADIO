import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Loader2, Info } from 'lucide-react';

const AdminInstitucional = () => {
    const [data, setData] = useState({
        mision: '',
        vision: '',
        perfil: '',
        fotoUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchInstitucional = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'configuracion', 'institucional'));
                if (docSnap.exists()) {
                    setData(docSnap.data());
                }
            } catch (error) {
                console.error("Error obteniendo datos institucionales:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstitucional();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            await setDoc(doc(db, 'configuracion', 'institucional'), data, { merge: true });
            setMessage({ text: 'Información institucional actualizada exitosamente.', type: 'success' });
        } catch (error) {
            console.error("Error guardando:", error);
            setMessage({ text: 'Error al guardar los datos.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <h1 className="text-3xl font-title font-bold mb-6 flex items-center">
                <Info className="w-8 h-8 mr-3 text-accent-red" />
                Textos Institucionales
            </h1>

            <div className="glass-card bg-[var(--surface)] text-[var(--text-main)] rounded-2xl p-6 border border-[var(--card-border)] relative overflow-hidden max-w-4xl shadow-sm">
                {loading && (
                    <div className="absolute inset-0 bg-[var(--primary)]/80 flex items-center justify-center z-10 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-accent-red" />
                    </div>
                )}

                <p className="text-[var(--text-muted)] mb-8 text-sm">
                    Modifica los parámetros de Misión, Visión y el Perfil del director que se muestran en la pestaña pública "La Emisora".
                </p>

                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm flex items-center ${message.type === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/50' : 'bg-red-500/20 text-red-200 border border-red-500/50'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Misión</label>
                            <textarea
                                name="mision"
                                value={data.mision}
                                onChange={handleChange}
                                rows="5"
                                className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors resize-none"
                                placeholder="Escribe la misión de la radio..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Visión</label>
                            <textarea
                                name="vision"
                                value={data.vision}
                                onChange={handleChange}
                                rows="5"
                                className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors resize-none"
                                placeholder="Escribe la visión de la radio..."
                            />
                        </div>
                    </div>

                    <div className="border-t border-[var(--card-border)] pt-6 mt-6">
                        <h3 className="text-xl font-bold mb-4">Perfil del Director</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                    Biografía / Mensaje
                                </label>
                                <textarea
                                    name="perfil"
                                    value={data.perfil}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors resize-none"
                                    placeholder="Mensaje o biografía de Clemente Torales..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                    URL de Fotografía
                                </label>
                                <input
                                    type="url"
                                    name="fotoUrl"
                                    value={data.fotoUrl}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors font-mono text-sm"
                                    placeholder="https://ejemplo.com/foto.jpg"
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-2">Pega aquí el enlace público de la imagen del director.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving || loading}
                        className="w-full md:w-auto bg-accent-red hover:bg-[#c92a35] text-[var(--primary)] px-8 py-3 rounded-xl font-bold transition disabled:opacity-50 shadow-md flex items-center justify-center"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        {saving ? 'Guardando...' : 'Guardar Textos'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminInstitucional;
