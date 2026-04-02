import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Newspaper, Loader2, Search, TrendingUp } from 'lucide-react';
import NewsCard from '../components/NewsCard';

const NewsPortal = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'noticias'), orderBy('fecha', 'desc'), limit(20));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNoticias(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const noticiasFiltradas = noticias.filter(n => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (n.titulo && n.titulo.toLowerCase().includes(lowerTerm)) ||
            (n.resumen && n.resumen.toLowerCase().includes(lowerTerm));
    });

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6">
            {/* Header moderno con glow */}
            <div className="page-header max-w-7xl mx-auto mb-12 relative">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-accent-red/8 text-accent-red text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 border border-accent-red/10">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Últimas Noticias
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-title font-black text-[var(--text-main)] tracking-tight mb-3">
                                Portal de <span className="gradient-text">Noticias</span>
                            </h1>
                            <p className="text-[var(--text-muted)] text-base">
                                Mantente informado con las novedades locales e internacionales.
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-[var(--text-muted)]" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-4 py-3 glass-card rounded-xl text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red/30 transition-all"
                                placeholder="Buscar noticias..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 rounded-2xl bg-accent-red/10 flex items-center justify-center mb-4">
                            <Loader2 className="w-7 h-7 text-accent-red animate-spin" />
                        </div>
                        <p className="text-[var(--text-muted)] font-semibold text-sm">Cargando noticias...</p>
                    </div>
                ) : noticias.length === 0 ? (
                    <div className="text-center py-24 glass-card rounded-2xl">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--card-border)] mx-auto mb-6 flex items-center justify-center">
                            <Newspaper className="w-8 h-8 text-[var(--text-muted)]" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">No hay noticias publicadas</h3>
                        <p className="text-[var(--text-muted)] text-sm">Pronto el equipo editorial subirá nuevo contenido.</p>
                    </div>
                ) : noticiasFiltradas.length === 0 ? (
                    <div className="text-center py-20">
                        <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">Sin resultados</h3>
                        <p className="text-[var(--text-muted)] text-sm">No se encontraron noticias que coincidan con tu búsqueda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {noticiasFiltradas.map((noticia, idx) => (
                            <div key={noticia.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
                                <NewsCard noticia={noticia} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsPortal;
