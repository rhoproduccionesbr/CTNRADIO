import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, Phone, Mail, Clock, Send, Radio, Info, Target, Loader2, Globe, MessageCircle, ExternalLink } from 'lucide-react';

const Contacto = () => {
    const [instData, setInstData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'configuracion', 'institucional'));
                if (docSnap.exists()) {
                    setInstData(docSnap.data());
                } else {
                    setInstData({
                        mision: "Informar, entretener y conectar a la comunidad de Guarambaré y al mundo entero a través de una propuesta radiofónica plural, objetiva y participativa. Buscamos promover los valores, la cultura local y mantener a nuestra audiencia al tanto del acontecer diario con responsabilidad.",
                        vision: "Ser la radio digital líder y de mayor alcance oriunda de Guarambaré, reconocida por su excelencia informativa, su compromiso con la verdad y la alta fidelidad técnica de sus transmisiones ininterrumpidas mediante el uso y adopción de tecnologías de última generación.",
                        perfil: "Dedicado a la comunicación y la docencia, el Prof. Clemente Torales ha sido una voz reconocida y respetada en Guarambaré.\n\nCTN Radio nace de su visión de llevar la esencia de la radio local más allá de las fronteras geográficas, aprovechando el potencial de internet para conectar a los compatriotas alrededor del mundo.",
                        fotoUrl: "https://ui-avatars.com/api/?name=Clemente+Torales&background=B71C1C&color=fff&size=512&font-size=0.3"
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

    if (loading || !instData) {
        return (
            <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-accent-red animate-spin mb-4" />
                <p className="text-gray-400 font-bold">Cargando información...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 pt-32 max-w-6xl space-y-24 pb-32">
            
            {/* SECCIÓN INSTITUCIONAL */}
            <section>
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-title font-bold text-white mb-4">La Emisora</h1>
                    <p className="text-gray-400 text-lg">Conoce más sobre CTN Radio y nuestra trayectoria.</p>
                    <div className="w-24 h-1 bg-accent-red mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    <div className="glass-card rounded-3xl p-8 transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-accent-red/20 rounded-2xl flex items-center justify-center mb-6 border border-accent-red/30">
                            <Target className="w-8 h-8 text-accent-red" />
                        </div>
                        <h2 className="text-2xl font-title font-bold mb-4 text-white">Nuestra Misión</h2>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {instData.mision}
                        </p>
                    </div>

                    <div className="glass-card rounded-3xl p-8 transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6 border border-accent-blue/30">
                            <Info className="w-8 h-8 text-accent-blue" />
                        </div>
                        <h2 className="text-2xl font-title font-bold mb-4 text-white">Nuestra Visión</h2>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {instData.vision}
                        </p>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-8 md:p-12 border-t-4 border-t-accent-red relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-x-1/2 -translate-y-1/2">
                        <Radio className="w-96 h-96" />
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/10 shrink-0 bg-gray-800 shadow-2xl">
                            <img src={instData.fotoUrl || "https://ui-avatars.com/api/?name=Clemente+Torales&background=B71C1C&color=fff&size=512&font-size=0.3"} alt="Prof. Clemente Torales" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="text-xl text-accent-red font-bold tracking-widest uppercase mb-2">Fundador y Director</h3>
                            <h2 className="text-3xl md:text-4xl font-title font-bold text-white mb-6">Prof. Clemente Torales Núñez</h2>
                            <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                                {instData.perfil}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN CONTACTO */}
            <section>
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-title font-bold text-white mb-4">Contáctanos</h1>
                    <p className="text-gray-400 text-lg">Tu opinión, saludos y mensajes son importantes para nosotros.</p>
                    <div className="w-24 h-1 bg-accent-blue mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Información de Contacto */}
                    <div className="space-y-8">
                        <div className="glass-card rounded-3xl p-8 border-l-4 border-l-accent-blue relative overflow-hidden h-full">
                            <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                                <Phone className="w-64 h-64" />
                            </div>

                            <h2 className="text-2xl font-title font-bold text-white mb-8">Información Directa</h2>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-start space-x-4 group">
                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent-red/20 transition-colors">
                                        <MapPin className="w-6 h-6 text-accent-red" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Estudios Transmisores</h3>
                                        <p className="text-gray-400">Guarambaré, Departamento Central<br />Paraguay</p>
                                    </div>
                                </div>

                                <a href="https://wa.me/595981687708" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-4 group cursor-pointer">
                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                                        <MessageCircle className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg group-hover:text-green-400 transition-colors">WhatsApp Directo</h3>
                                        <p className="text-gray-400">+595 981 687 708</p>
                                    </div>
                                </a>

                                <a href="mailto:ctnradio@gmail.com" className="flex items-start space-x-4 group cursor-pointer">
                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent-blue/20 transition-colors">
                                        <Mail className="w-6 h-6 text-accent-blue" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg group-hover:text-accent-blue transition-colors">Correo Electrónico</h3>
                                        <p className="text-gray-400">ctnradio@gmail.com</p>
                                    </div>
                                </a>

                                <a href="https://ctnradio.com.py" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-4 group cursor-pointer">
                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
                                        <Globe className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors">Página Web</h3>
                                        <p className="text-gray-400">ctnradio.com.py</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de Contacto */}
                    <div className="glass-card rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-title font-bold text-white mb-6">Envíanos un Mensaje</h2>

                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Función de envío en desarrollo."); }}>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Nombre y Apellido</label>
                                    <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors" placeholder="Tu nombre" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Desde dónde nos escuchas</label>
                                    <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors" placeholder="Ciudad, País" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Mensaje / Dedicatoria</label>
                                <textarea rows="3" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors resize-none" placeholder="Escribe tu mensaje aquí..." required></textarea>
                            </div>

                            <button type="submit" className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition duration-300 shadow-lg flex items-center justify-center space-x-2">
                                <span>Enviar Mensaje</span>
                                <Send className="w-5 h-5 ml-2" />
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* TARJETA DISEÑADOR WEB — RHO Producciones */}
            <footer className="pt-8 border-t border-white/5">
                <div className="max-w-md mx-auto">
                    <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] px-6 py-5 transition-all duration-500 hover:bg-white/[0.06] hover:border-white/[0.12] group">
                        <div className="flex items-center gap-4">
                            {/* Logo RHO */}
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-white/[0.06] p-1.5 flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                                <img src="/rho-logo.png" alt="RHO Producciones" className="w-full h-full object-contain opacity-60 group-hover:opacity-90 transition-opacity" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-semibold mb-0.5">Diseño y Desarrollo Web</p>
                                <p className="text-sm font-bold text-white/50 group-hover:text-white/70 transition-colors">RHO Producciones</p>
                            </div>

                            {/* Links */}
                            <div className="flex items-center gap-2 shrink-0">
                                <a 
                                    href="mailto:rhoproducciones@gmail.com" 
                                    title="rhoproducciones@gmail.com"
                                    className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.08] transition-all"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                </a>
                                <a 
                                    href="https://wa.me/595976778593" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    title="WhatsApp RHO Producciones"
                                    className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/25 hover:text-green-400/70 hover:bg-green-500/[0.08] transition-all"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Contacto;
