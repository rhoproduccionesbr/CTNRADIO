import { ShieldCheck, Lock, Bell, Wifi, Radio, UserCheck, Mail, Database, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const PoliticasPrivacidad = () => {
    const lastUpdated = "29 de Octubre de 2026";

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
            
            {/* Header Editorial */}
            <div className="mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-red block mb-2">
                    Transparencia & Legalidad
                </span>
                <div className="pb-6 border-b border-[var(--card-border)]">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-title font-black text-[var(--text-main)] tracking-tight">
                        Políticas de Privacidad
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--text-muted)] mt-2 max-w-3xl leading-relaxed">
                        En CTN Radio valoramos y respetamos tu privacidad. Este documento detalla cómo tratamos los datos y los permisos que utiliza nuestra aplicación móvil y web.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                        Última actualización: {lastUpdated}
                    </div>
                </div>
            </div>

            {/* Tarjeta de Resumen Rápido */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 mb-10 border border-accent-red/20 bg-accent-red/5">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-red/20 border border-accent-red/30 flex items-center justify-center shrink-0 text-accent-red">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-title font-bold text-[var(--text-main)] mb-1">
                            Compromiso de Privacidad de CTN Radio
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                            CTN Radio es una aplicación de transmisión de audio en vivo y contenidos comunitarios con sede en Guarambaré, Paraguay. <strong>No recopilamos información personal sensible, no rastreamos tu ubicación geográfica ni comercializamos datos con terceros.</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Secciones detalladas */}
            <div className="space-y-8">
                
                {/* 1. Información de la Emisora y Responsable */}
                <section className="glass-card rounded-3xl p-6 sm:p-8 border border-[var(--card-border)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                            <Radio className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-title font-bold text-[var(--text-main)]">
                            1. Identidad del Responsable
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                        La aplicación <strong>CTN Radio</strong> es propiedad y está administrada bajo la dirección general del <strong>Prof. Clemente Torales Núñez</strong>, con estudios y sede operativa en la ciudad de Guarambaré, Departamento Central, República del Paraguay.
                    </p>
                </section>

                {/* 2. Permisos del Dispositivo */}
                <section className="glass-card rounded-3xl p-6 sm:p-8 border border-[var(--card-border)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-red/10 text-accent-red flex items-center justify-center">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-title font-bold text-[var(--text-main)]">
                            2. Permisos Solicitados en Android
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                        Para brindar una experiencia óptima y continua de reproducción radial, la aplicación solicita los siguientes permisos estrictamente necesarios:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-[var(--card-border)]/30 border border-[var(--card-border)]">
                            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[var(--text-main)] mb-1">
                                <Wifi className="w-4 h-4 text-accent-blue" />
                                <span>Acceso a Internet (INTERNET)</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Permite conectar al servidor de streaming de audio en directo y sincronizar noticias, horarios y mensajes del chat.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[var(--card-border)]/30 border border-[var(--card-border)]">
                            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[var(--text-main)] mb-1">
                                <Radio className="w-4 h-4 text-accent-red" />
                                <span>Servicio en Primer Plano (FOREGROUND_SERVICE)</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Permite que la radio siga sonando en segundo plano cuando navegas por otras apps o apagas la pantalla de tu dispositivo.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[var(--card-border)]/30 border border-[var(--card-border)]">
                            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[var(--text-main)] mb-1">
                                <Bell className="w-4 h-4 text-amber-500" />
                                <span>Notificaciones (POST_NOTIFICATIONS)</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Muestra los controles de reproducción (reproducir, pausar, silenciar y compartir) en la barra de estado y la pantalla de bloqueo.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[var(--card-border)]/30 border border-[var(--card-border)]">
                            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[var(--text-main)] mb-1">
                                <Lock className="w-4 h-4 text-emerald-500" />
                                <span>Bloqueo de Suspensión (WAKE_LOCK)</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Evita que el sistema operativo corte abruptamente la transmisión de audio continua en segundo plano.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. Datos recopilados y Chat en vivo */}
                <section className="glass-card rounded-3xl p-6 sm:p-8 border border-[var(--card-border)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-title font-bold text-[var(--text-main)]">
                            3. Datos Recopilados y Chat Comunitario
                        </h2>
                    </div>
                    <div className="space-y-3 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                        <p>
                            • <strong>Sin registro obligatorio:</strong> No solicitamos creación de cuentas con correos electrónicos ni contraseñas para escuchar la radio.
                        </p>
                        <p>
                            • <strong>Participación en el Chat:</strong> Al enviar un saludo o mensaje a la radio, tú eliges libremente el nombre o alias a mostrar y tu localidad opcional. Dicha información se publica en el muro interactivo visible para los demás oyentes.
                        </p>
                        <p>
                            • <strong>Sin acceso al micrófono ni cámara:</strong> La aplicación no graba audio del usuario ni accede a su galería personal. La transmisión es estrictamente unidireccional (de la emisora hacia tu dispositivo).
                        </p>
                    </div>
                </section>

                {/* 4. Servicios de Terceros */}
                <section className="glass-card rounded-3xl p-6 sm:p-8 border border-[var(--card-border)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <Database className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-title font-bold text-[var(--text-main)]">
                            4. Proveedores y Servicios de Terceros
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                        Para la operación técnica de la plataforma, utilizamos los siguientes proveedores de infraestructura tecnológica:
                    </p>
                    <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-muted)] list-disc list-inside">
                        <li><strong>Google Firebase (Firestore):</strong> Para el almacenamiento seguro y en tiempo real de los mensajes del chat y la sincronización de la grilla de programas.</li>
                        <li><strong>Servidor de Audio Streaming (Icecast/Shoutcast):</strong> Encargado de la retransmisión digital en vivo del audio oficial de CTN Radio.</li>
                    </ul>
                </section>

                {/* 5. Eliminación de Datos y Derechos del Usuario */}
                <section className="glass-card rounded-3xl p-6 sm:p-8 border border-[var(--card-border)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-title font-bold text-[var(--text-main)]">
                            5. Control y Eliminación de Datos
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-3">
                        Cualquier usuario tiene derecho a solicitar la eliminación de cualquier mensaje o interacción enviada a través del chat de la emisora. Para hacerlo, puede comunicarse con nosotros directamente a través de nuestra sección de contacto o por nuestras vías oficiales de mensajería.
                    </p>
                </section>

                {/* 6. Contacto */}
                <section className="glass-card rounded-3xl p-6 sm:p-8 border border-[var(--card-border)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-red/10 text-accent-red flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-title font-bold text-[var(--text-main)]">
                            6. Vías de Contacto
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                        Si tienes preguntas o inquietudes respecto a estas políticas de privacidad o el funcionamiento de la aplicación, puedes ponerte en contacto con la dirección de la emisora:
                    </p>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Link 
                            to="/contacto"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-red hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-accent-red/20"
                        >
                            <Mail className="w-4 h-4" />
                            <span>Ir a Página de Contacto</span>
                        </Link>
                        <span className="text-xs text-[var(--text-muted)]">
                            Guarambaré, Departamento Central, Paraguay
                        </span>
                    </div>
                </section>

            </div>

        </div>
    );
};

export default PoliticasPrivacidad;

