import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Newspaper, Loader2, Search } from 'lucide-react';
import NewsCard from '../components/NewsCard';

const NewsPortal = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Obtenemos las últimas 20 noticias publicadas
        const q = query(
            collection(db, 'noticias'),
            orderBy('fecha', 'desc'),
            limit(20)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNoticias(data);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    // Filtro simple en el cliente
    const noticiasFiltradas = noticias.filter(n => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (n.titulo && n.titulo.toLowerCase().includes(lowerTerm)) ||
            (n.resumen && n.resumen.toLowerCase().includes(lowerTerm));
    });

    return (
        <div className="container mx-auto px-4 py-12 pt-32 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-title font-bold text-white mb-4 flex items-center">
                        <Newspaper className="w-10 h-10 mr-4 text-accent-red" />
                        Portal de Noticias
                    </h1>
                    <p className="text-gray-400 text-lg">Mantente informado con las novedades locales e internacionales.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:bg-black/80 focus:ring-1 focus:ring-accent-red focus:border-accent-red transition sm:text-sm"
                        placeholder="Buscar noticias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="w-24 h-1 bg-accent-red mb-12 rounded-full"></div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-accent-red animate-spin mb-4" />
                    <p className="text-gray-400 font-bold">Cargando noticias...</p>
                </div>
            ) : noticias.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-3xl border border-white/5">
                    <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">No hay noticias publicadas</h3>
                    <p className="text-gray-400">Pronto el equipo editorial subirá nuevo contenido.</p>
                </div>
            ) : noticiasFiltradas.length === 0 ? (
                <div className="text-center py-20">
                    <h3 className="text-xl font-bold text-white mb-2">Sin resultados</h3>
                    <p className="text-gray-400">No se encontraron noticias que coincidan con tu búsqueda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {noticiasFiltradas.map((noticia) => (
                        <NewsCard key={noticia.id} noticia={noticia} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsPortal;
