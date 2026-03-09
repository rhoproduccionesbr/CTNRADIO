import { MapPin, Phone, Mail, Clock, Send, Radio } from 'lucide-react';

const Contacto = () => {
    return (
        <div className="container mx-auto px-4 py-12 pt-32 max-w-6xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-title font-bold text-white mb-4">Contáctanos</h1>
                <p className="text-gray-400 text-lg">Tu opinión, saludos y mensajes son importantes para nosotros.</p>
                <div className="w-24 h-1 bg-accent-red mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Información de Contacto */}
                <div className="space-y-8">
                    <div className="glass-card rounded-3xl p-8 border-l-4 border-l-accent-red relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                            <Radio className="w-64 h-64" />
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

                            <div className="flex items-start space-x-4 group">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent-blue/20 transition-colors">
                                    <Phone className="w-6 h-6 text-accent-blue" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">WhatsApp en Estudio</h3>
                                    <p className="text-gray-400">+595 (Completar número)</p>
                                    <a href="#" className="text-sm font-bold text-accent-blue hover:text-blue-400 transition-colors mt-1 inline-block">Enviar un mensaje directo →</a>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 group">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                                    <Mail className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">Correo Electrónico</h3>
                                    <p className="text-gray-400">contacto@ctnradio.com</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 group">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-yellow-500/20 transition-colors">
                                    <Clock className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">Transmisión</h3>
                                    <p className="text-gray-400">24 horas al día, los 7 días de la semana.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulario de Contacto */}
                <div className="glass-card rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-title font-bold text-white mb-6">Envíanos un Mensaje</h2>

                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Función de envío en desarrollo."); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Nombre y Apellido</label>
                                <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors" placeholder="Tu nombre" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Desde dónde nos escuchas</label>
                                <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors" placeholder="Ciudad, País" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Correo Electrónico (Opcional)</label>
                            <input type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors" placeholder="tu@email.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Mensaje / Dedicatoria</label>
                            <textarea rows="4" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors resize-none" placeholder="Escribe tu mensaje aquí..." required></textarea>
                        </div>

                        <button type="submit" className="w-full bg-accent-red hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition duration-300 shadow-lg flex items-center justify-center space-x-2">
                            <span>Enviar Mensaje</span>
                            <Send className="w-5 h-5 ml-2" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Contacto;
