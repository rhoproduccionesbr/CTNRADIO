import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  MapPin, Phone, Mail, Clock, Send, Radio, Target, 
  Loader2, MessageCircle, ExternalLink, Check, Heart 
} from 'lucide-react';

const Contacto = () => {
    const [instData, setInstData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
    const [sentStatus, setSentStatus] = useState(false);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'configuracion', 'institucional'));
                if (docSnap.exists()) {
                    setInstData(docSnap.data());
                } else {
                    setInstData({
                        mision: "Informar, entretener y conectar a la comunidad de Guarambaré y al mundo entero a través de una propuesta radiofónica plural, participativa y de excelencia.",
                        vision: "Ser la emisora digital y comunitaria de referencia en el departamento Central, consolidando una voz confiable con estándares de calidad técnica de vanguardia.",
                        perfil: "El Prof. Clemente Torales ha dedicado décadas a la comunicación social y la docencia comunitaria. CTN Radio nació de su compromiso inquebrantable de dar voz a nuestra gente y tender un puente fraternal hacia todos los compatriotas que se encuentran en el exterior.",
                        fotoUrl: "https://ui-avatars.com/api/?name=Clemente+Torales&background=E63946&color=fff&size=512&font-size=0.35"
                    });
                }
            } catch (error) {
                console.error("Error obteniendo datos institucionales:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Generar enlace directo a WhatsApp con el mensaje pre-cargado
        const texto = `Hola CTN Radio, mi nombre es ${formData.nombre} (${formData.email}): ${formData.mensaje}`;
        const url = `https://wa.me/595981000000?text=${encodeURIComponent(texto)}`;
        window.open(url, '_blank');
        setSentStatus(true);
        setTimeout(() => setSentStatus(false), 5000);
        setFormData({ nombre: '', email: '', mensaje: '' });
    };

    if (loading || !instData) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center pt-20">
                <Loader2 className="w-10 h-10 text-accent-red animate-spin mb-3" />
                <p className="text-xs font-semibold text-[var(--text-muted)]">Cargando perfil institucional...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            
            {/* Header Editorial */}
            <div className="mb-14">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-red block mb-2">
                    Identidad & Compromiso
                </span>
                <div className="pb-6 border-b border-[var(--card-border)]">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-title font-black text-[var(--text-main)] tracking-tight">
                        La Emisora & Contacto
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--text-muted)] mt-2 max-w-2xl leading-relaxed">
                        Conoce la trayectoria de CTN Radio, su fundador el Prof. Clemente Torales y comunícate con nuestros estudios en Guarambaré.
                    </p>
                </div>
            </div>

            {/* SECCIÓN 1: Perfil de Clemente Torales & Misión / Visión */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
                
                {/* Tarjeta de Dirección General (5 cols) */}
                <div className="lg:col-span-5 glass-card rounded-3xl p-8 border border-[var(--card-border)] flex flex-col items-center text-center">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-accent-red/30 shadow-xl mb-5 bg-zinc-950">
                        <img 
                            src={instData.fotoUrl || "https://ui-avatars.com/api/?name=Clemente+Torales&background=E63946&color=fff&size=512"} 
                            alt="Prof. Clemente Torales" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent-red mb-1">
                        Dirección General & Locución
                    </span>
                    <h2 className="text-2xl font-title font-black text-[var(--text-main)] mb-3">
                        Prof. Clemente Torales
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed text-left whitespace-pre-wrap">
                        {instData.perfil}
                    </p>

                    <div className="mt-6 pt-6 border-t border-[var(--card-border)] w-full flex items-center justify-center gap-4">
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[var(--text-muted)] hover:text-accent-red transition-colors flex items-center gap-1.5"
                        >
                            <span>Página Oficial</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>

                {/* Misión & Visión (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="glass-card rounded-3xl p-8 border border-[var(--card-border)]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red">
                                <Target className="w-5 h-5" />
                            </div>
                            <h3 className="font-title font-bold text-xl text-[var(--text-main)]">
                                Nuestra Misión
                            </h3>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                            {instData.mision}
                        </p>
                    </div>

                    <div className="glass-card rounded-3xl p-8 border border-[var(--card-border)]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red">
                                <Radio className="w-5 h-5" />
                            </div>
                            <h3 className="font-title font-bold text-xl text-[var(--text-main)]">
                                Nuestra Visión
                            </h3>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                            {instData.vision}
                        </p>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: Canales de Contacto Directo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                
                {/* WhatsApp */}
                <a
                    href="https://wa.me/595981000000?text=Hola%20CTN%20Radio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card rounded-3xl p-6 border border-[var(--card-border)] hover:border-emerald-500/40 transition-all group flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block mb-1">
                            Línea Directa Cabina
                        </span>
                        <h4 className="font-title font-bold text-base text-[var(--text-main)]">
                            WhatsApp Estudio
                        </h4>
                        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                            +595 981 000 000
                        </p>
                    </div>
                </a>

                {/* Email */}
                <a
                    href="mailto:rhoproducciones@gmail.com"
                    className="glass-card rounded-3xl p-6 border border-[var(--card-border)] hover:border-accent-red/40 transition-all group flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-red/10 flex items-center justify-center text-accent-red">
                            <Mail className="w-5 h-5" />
                        </div>
                        <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-accent-red transition-colors" />
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-accent-red block mb-1">
                            Correspondencia & Prensa
                        </span>
                        <h4 className="font-title font-bold text-base text-[var(--text-main)]">
                            Correo Electrónico
                        </h4>
                        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                            rhoproducciones@gmail.com
                        </p>
                    </div>
                </a>

                {/* Ubicación */}
                <div className="glass-card rounded-3xl p-6 border border-[var(--card-border)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--card-border)] flex items-center justify-center text-accent-red">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                            Paraguay
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-accent-red block mb-1">
                            Estudios Centrales
                        </span>
                        <h4 className="font-title font-bold text-base text-[var(--text-main)]">
                            Guarambaré
                        </h4>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            Departamento Central, Paraguay
                        </p>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: Formulario Rápido de Contacto */}
            <div className="glass-card rounded-3xl p-8 sm:p-10 border border-[var(--card-border)] max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent-red block mb-1">
                        Escríbenos
                    </span>
                    <h3 className="font-title font-bold text-2xl text-[var(--text-main)]">
                        Envía un Mensaje a la Emisora
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                        Sugerencias, solicitudes de auspicio o saludos para la programación en vivo.
                    </p>
                </div>

                {sentStatus ? (
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-emerald-500">
                        <Check className="w-8 h-8 mx-auto mb-2" />
                        <h4 className="font-bold text-sm">¡Mensaje preparado con éxito!</h4>
                        <p className="text-xs text-emerald-500/80 mt-1">Se abrirá tu aplicación de WhatsApp para confirmar el envío a la cabina.</p>
                    </div>
                ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                                    Tu Nombre completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej: Marcos Benítez"
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--card-border)]/50 border border-[var(--card-border)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-accent-red"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                                    Teléfono / Correo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Ej: 0981... o correo@ejemplo.com"
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--card-border)]/50 border border-[var(--card-border)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-accent-red"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                                Mensaje o Saludo
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={formData.mensaje}
                                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                                placeholder="Escribe aquí tu consulta o saludo para el aire..."
                                className="w-full px-4 py-3 rounded-xl bg-[var(--card-border)]/50 border border-[var(--card-border)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-accent-red resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl bg-accent-red hover:bg-[#c92a35] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-accent-red/20 active:scale-95"
                        >
                            <Send className="w-4 h-4" />
                            <span>Enviar Mensaje al Estudio</span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Contacto;
