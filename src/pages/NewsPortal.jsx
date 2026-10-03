import { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Newspaper, Loader2, Search } from 'lucide-react';
import NewsCard from '../components/NewsCard';

const NewsPortal = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    useEffect(() => {
        const q = query(collection(db, 'noticias'), orderBy('fecha', 'desc'), limit(30));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNoticias(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Extraer categorías únicas
    const categorias = useMemo(() => {
        const cats = new Set(noticias.map(n => n.categoria).filter(Boolean));
        return ['Todas', ...Array.from(cats)];
    }, [noticias]);

    const noticiasFiltradas = useMemo(() => {
        return noticias.filter(n => {
            const matchCategory = selectedCategory === 'Todas' || n.categoria === selectedCategory;
            if (!matchCategory) return false;
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (n.titulo && n.titulo.toLowerCase().includes(term)) ||
                   (n.resumen && n.resumen.toLowerCase().includes(term));
        });
    }, [noticias, selectedCategory, searchTerm]);

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            
            {/* Header Editorial */}
            <div className="mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-red block mb-2">
                    Actualidad & Comunidad
                </span>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--card-border)]">
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-title font-black text-[var(--text-main)] tracking-tight">
                            Portal de Noticias
                        </h1>
                        <p className="text-sm sm:text-base text-[var(--text-muted)] mt-2 max-w-2xl leading-relaxed">
                            Acontecimientos, cultura, deportes e informaciones de interés desde Guarambaré hacia todo el departamento Central.
                        </p>
                    </div>

                    {/* Barra de Búsqueda Moderna */}
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar en noticias..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--card-border)]/50 border border-[var(--card-border)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-accent-red transition-all"
                        />
                    </div>
                </div>

                {/* Filtro de Categorías Segmentado */}
                {categorias.length > 2 && (
                    <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                        {categorias.map((cat) => {
                            const isActive = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                                        isActive
                                            ? 'bg-accent-red text-white shadow-sm shadow-accent-red/25'
                                            : 'bg-[var(--card-border)]/50 hover:bg-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Listado de Noticias */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-14 h-14 rounded-2xl bg-accent-red/10 flex items-center justify-center mb-4">
                        <Loader2 className="w-6 h-6 text-accent-red animate-spin" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-muted)]">Cargando noticias...</p>
                </div>
            ) : noticias.length === 0 ? (
                <div className="glass-card rounded-3xl p-16 text-center border border-[var(--card-border)] max-w-lg mx-auto">
                    <Newspaper className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="font-title font-bold text-lg text-[var(--text-main)]">Sin publicaciones</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Pronto compartiremos las novedades del día.</p>
                </div>
            ) : noticiasFiltradas.length === 0 ? (
                <div className="glass-card rounded-3xl p-16 text-center border border-[var(--card-border)] max-w-lg mx-auto">
                    <Search className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="font-title font-bold text-lg text-[var(--text-main)]">Sin coincidencias</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">No se encontraron noticias con ese criterio.</p>
                    <button
                        onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); }}
                        className="mt-4 px-4 py-2 rounded-xl bg-accent-red text-white text-xs font-bold"
                    >
                        Restablecer filtros
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {noticiasFiltradas.map((noticia) => (
                        <NewsCard key={noticia.id} noticia={noticia} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsPortal;
