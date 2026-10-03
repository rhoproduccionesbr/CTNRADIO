import { useState, useEffect } from 'react';
import HeroPlayer from '../components/HeroPlayer';
import StudioSidePanel from '../components/StudioSidePanel';
import { db } from '../services/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Newspaper, Calendar, ChevronRight, MapPin, Radio, Clock } from 'lucide-react';
import ChatModal from '../components/ChatModal';

const Home = () => {
    const [contacto, setContacto] = useState(null);
    const [galeria, setGaleria] = useState([]);
    const [noticias, setNoticias] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [isFullChatOpen, setIsFullChatOpen] = useState(false);

    useEffect(() => {
        // Datos de contacto
        const unsubContacto = onSnapshot(doc(db, 'configuracion', 'contacto'), (docSnap) => {
            if (docSnap.exists()) setContacto(docSnap.data());
        });

        // Galería (portadas de cabina)
        const qGaleria = query(collection(db, 'galeria'), orderBy('createdAt', 'desc'), limit(20));
        const unsubGaleria = onSnapshot(qGaleria, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const caratulas = items.filter(img => img.isCover === true);
            setGaleria(caratulas.length > 0 ? caratulas : items);
        });

        // 3 Últimas Noticias destacadas
        const qNoticias = query(collection(db, 'noticias'), orderBy('fecha', 'desc'), limit(3));
        const unsubNoticias = onSnapshot(qNoticias, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setNoticias(data);
        });

        // Programación completa para el widget de programación
        const qProgramas = query(collection(db, 'programacion'));
        const unsubProgramas = onSnapshot(qProgramas, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setProgramas(data);
        });

        return () => {
            unsubContacto();
            unsubGaleria();
            unsubNoticias();
            unsubProgramas();
        };
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col pb-32 sm:pb-24">
            
            {/* Ambient Lighting sutil (anti-slop, neutral dark canvas con tinte studio) */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-accent-red/[0.04] blur-[140px] rounded-full" />
            </div>

            {/* SECCIÓN HERO — Broadcast Studio Center (1440px max width) */}
            <section className="pt-6 sm:pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                
                {/* Kicker Editorial */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
                        <span className="flex items-center gap-1.5 text-accent-red font-bold">
                            <Radio className="w-3.5 h-3.5" />
                            <span>CTN RADIO ONLINE</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>Guarambaré, Paraguay</span>
                        </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span>Frecuencia Digital 24/7</span>
                    </div>
                </div>

                {/* Grid Principal: Consola de Emisión (7 col) + Side Panel (5 col) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    {/* Consola de Transmisión */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <HeroPlayer contacto={contacto} galeria={galeria} />
                    </div>

                    {/* Panel de Estudio Lateral: Programa al aire + Chat Comunitario */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <StudioSidePanel 
                            programas={programas} 
                            contacto={contacto} 
                            onOpenFullChat={() => setIsFullChatOpen(true)}
                        />
                    </div>
                </div>
            </section>

            {/* SECCIÓN NOTICIAS DESTACADAS */}
            {noticias.length > 0 && (
                <section className="mt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    <div className="flex items-end justify-between mb-8 pb-4 border-b border-[var(--card-border)]">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-accent-red block mb-1">
                                Actualidad & Comunidad
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-title font-black text-[var(--text-main)]">
                                Noticias Recientes
                            </h2>
                        </div>
                        <Link 
                            to="/noticias" 
                            className="text-xs sm:text-sm font-semibold text-accent-red hover:underline inline-flex items-center gap-1"
                        >
                            Ver todas las noticias <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Grid de Noticias */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {noticias.map((item) => {
                            const dateObj = item.fecha?.toDate ? item.fecha.toDate() : new Date(item.fecha);
                            const formattedDate = dateObj.toLocaleDateString('es-PY', { day: '2-digit', month: 'short' });
                            return (
                                <Link 
                                    key={item.id} 
                                    to={`/noticias/${item.id}`}
                                    className="group glass-card rounded-2xl overflow-hidden border border-[var(--card-border)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                                        <img 
                                            src={item.imagenUrl || 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?auto=format&fit=crop&w=800&q=80'} 
                                            alt={item.titulo} 
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            {/* Zero-Pill Metadata con separador · */}
                                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
                                                <span>{formattedDate || 'Reciente'}</span>
                                                {item.categoria && (
                                                    <>
                                                        <span aria-hidden="true">·</span>
                                                        <span className="font-semibold text-accent-red">{item.categoria}</span>
                                                    </>
                                                )}
                                            </div>

                                            <h3 className="font-title font-bold text-base text-[var(--text-main)] group-hover:text-accent-red transition-colors line-clamp-2 leading-snug">
                                                {item.titulo}
                                            </h3>

                                            {item.resumen && (
                                                <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">
                                                    {item.resumen}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex items-center justify-between text-xs font-semibold text-accent-red">
                                            <span>Leer artículo completo</span>
                                            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* SECCIÓN INSTITUCIONAL & EMISORA */}
            <section className="mt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="glass-card rounded-3xl p-8 sm:p-10 border border-[var(--card-border)] flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <span className="text-xs font-bold uppercase tracking-wider text-accent-red block mb-2">
                            La Voz de Guarambaré
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-title font-black text-[var(--text-main)] mb-3">
                            CTN Radio · Dirección Prof. Clemente Torales
                        </h2>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                            Una emisora concebida para informar, entretener y proyectar los valores y cultura de nuestra comunidad hacia todos los compatriotas alrededor del mundo. Con transmisión digital ininterrumpida y calidad acústica de alta fidelidad.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                        <Link 
                            to="/contacto" 
                            className="px-6 py-3 rounded-xl bg-[var(--text-main)] text-[var(--primary)] text-xs font-bold text-center hover:opacity-90 transition-opacity"
                        >
                            Conocer la Emisora
                        </Link>
                        <Link 
                            to="/programacion" 
                            className="px-6 py-3 rounded-xl bg-[var(--card-border)]/70 hover:bg-[var(--card-border)] text-[var(--text-main)] border border-[var(--card-border)] text-xs font-bold text-center transition-colors"
                        >
                            Grilla de Horarios
                        </Link>
                    </div>
                </div>
            </section>

            {/* Chat Modal global */}
            <ChatModal isOpen={isFullChatOpen} onClose={() => setIsFullChatOpen(false)} />
        </div>
    );
};

export default Home;
