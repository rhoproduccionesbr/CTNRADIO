import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const NewsCard = ({ noticia }) => {
    const imagenUrl = noticia.imagenUrl || 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?auto=format&fit=crop&w=800&q=80';

    let fechaFormat = "Reciente";
    if (noticia.fecha) {
        const dateObj = noticia.fecha.toDate ? noticia.fecha.toDate() : new Date(noticia.fecha);
        fechaFormat = dateObj.toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    return (
        <Link to={`/noticias/${noticia.id}`} className="block group h-full">
            <article className="glass-card rounded-3xl overflow-hidden h-full flex flex-col border border-[var(--card-border)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                {/* Portada del Artículo */}
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                    <img
                        src={imagenUrl}
                        alt={noticia.titulo}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Botón flotante discreto en hover */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                </div>

                {/* Contenido Editorial con Zero-Pill Metadata */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        {/* Metadatos tipográficos limpios */}
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2.5 font-medium">
                            <span className="tabular-nums">{fechaFormat}</span>
                            {noticia.categoria && (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <span className="text-accent-red font-semibold">{noticia.categoria}</span>
                                </>
                            )}
                        </div>

                        {/* Título */}
                        <h3 className="text-base sm:text-lg font-title font-bold text-[var(--text-main)] mb-2 line-clamp-2 leading-snug group-hover:text-accent-red transition-colors">
                            {noticia.titulo}
                        </h3>

                        {/* Resumen */}
                        {noticia.resumen && (
                            <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                                {noticia.resumen}
                            </p>
                        )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-[var(--card-border)] flex items-center justify-between text-xs font-semibold text-accent-red">
                        <span>Leer artículo</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default NewsCard;
