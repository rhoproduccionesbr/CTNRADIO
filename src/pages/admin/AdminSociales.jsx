import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Loader2, Link as LinkIcon, Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';

const AdminSociales = () => {
    const [data, setData] = useState({
        facebook: 'https://facebook.com/ctnradio',
        instagram: 'https://instagram.com/ctnradio',
        whatsapp: '+595000000000',
        email: 'contacto@ctnradio.com',
        direccion: 'Guarambaré, Paraguay'
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'configuracion', 'contacto'));
                if (docSnap.exists()) {
                    setData(docSnap.data());
                }
            } catch (error) {
                console.error("Error obteniendo datos de contacto:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            await setDoc(doc(db, 'configuracion', 'contacto'), data, { merge: true });
            setMessage({ text: 'Datos de contacto y redes sociales actualizados.', type: 'success' });
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
                <LinkIcon className="w-8 h-8 mr-3 text-accent-red" />
                Redes Sociales y Contacto
            </h1>

            <div className="glass-card bg-[var(--surface)] text-[var(--text-main)] rounded-2xl p-6 border border-[var(--card-border)] relative overflow-hidden max-w-4xl shadow-sm">
                {loading && (
                    <div className="absolute inset-0 bg-[var(--primary)]/80 flex items-center justify-center z-10 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-accent-red" />
                    </div>
                )}

                <p className="text-[var(--text-muted)] mb-8 text-sm">
                    Modifica los enlaces a tus redes sociales y números de contacto. Estos se reflejarán en los botones de "Síguenos" y "WhatsApp" de la página pública.
                </p>

                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm flex items-center ${message.type === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/50' : 'bg-red-500/20 text-red-200 border border-red-500/50'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold border-b border-[var(--card-border)] pb-2">Redes Sociales</h3>
                            
                            <div>
                                <label className="flex items-center text-sm font-bold text-[var(--text-muted)] mb-2">
                                    <Facebook className="w-4 h-4 mr-2" /> URL de Facebook
                                </label>
                                <input
                                    type="url"
                                    name="facebook"
                                    value={data.facebook}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-accent-red transition-colors"
                                    placeholder="https://facebook.com/paginaradio"
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-bold text-[var(--text-muted)] mb-2">
                                    <Instagram className="w-4 h-4 mr-2" /> URL de Instagram
                                </label>
                                <input
                                    type="url"
                                    name="instagram"
                                    value={data.instagram}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-accent-red transition-colors"
                                    placeholder="https://instagram.com/paginaradio"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-bold border-b border-[var(--card-border)] pb-2">Contacto Directo</h3>
                            
                            <div>
                                <label className="flex items-center text-sm font-bold text-[var(--text-muted)] mb-2">
                                    <Phone className="w-4 h-4 mr-2" /> Número de WhatsApp
                                </label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    value={data.whatsapp}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-accent-red transition-colors"
                                    placeholder="+595999000000"
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-1">Incluye el código del país sin el símbolo +. Ej: 595981123456</p>
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-bold text-[var(--text-muted)] mb-2">
                                    <Mail className="w-4 h-4 mr-2" /> Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-accent-red transition-colors"
                                    placeholder="radio@ejemplo.com"
                                />
                            </div>
                            
                            <div>
                                <label className="flex items-center text-sm font-bold text-[var(--text-muted)] mb-2">
                                    <MapPin className="w-4 h-4 mr-2" /> Dirección Física
                                </label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={data.direccion}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-accent-red transition-colors"
                                    placeholder="Ciudad, País"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--card-border)] flex justify-end">
                        <button
                            type="submit"
                            disabled={saving || loading}
                            className="bg-accent-red hover:bg-[#c92a35] text-[var(--primary)] px-8 py-3 rounded-xl font-bold transition disabled:opacity-50 shadow-md flex items-center"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                            {saving ? 'Guardando...' : 'Guardar Información'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSociales;
