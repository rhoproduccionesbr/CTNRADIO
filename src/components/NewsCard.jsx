import { Link } from 'react-router-dom';
import { Calendar, ArrowUpRight } from 'lucide-react';

const NewsCard = ({ noticia }) => {
    const imagenUrl = noticia.imagenUrl || 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    let fechaFormat = "";
    if (noticia.fecha) {
        const dateObj = noticia.fecha.toDate ? noticia.fecha.toDate() : new Date(noticia.fecha);
        fechaFormat = dateObj.toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    return (
        <Link to={`/noticias/${noticia.id}`} className="block group">
            <article className="glass-card rounded-2xl overflow-hidden h-full transition-all duration-400 hover:-translate-y-1 hover:shadow-xl">
                {/* Imagen */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                        src={imagenUrl}
                        alt={noticia.titulo}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {noticia.categoria && (
                        <div className="absolute top-3 left-3">
                            <span className="bg-accent-red text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-lg shadow-accent-red/20">
                                {noticia.categoria}
                            </span>
                        </div>
                    )}
                    
                    {/* Flecha de "ver más" que aparece en hover */}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/15 backdrop-blur-xl rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px] font-semibold mb-2.5">
                        <Calendar className="w-3 h-3" />
                        {fechaFormat || "Reciente"}
                    </div>

                    <h3 className="text-base font-bold font-title text-[var(--text-main)] mb-2 line-clamp-2 leading-snug group-hover:text-accent-red transition-colors">
                        {noticia.titulo}
                    </h3>

                    <p className="text-[var(--text-muted)] text-[13px] line-clamp-2 leading-relaxed">
                        {noticia.resumen}
                    </p>
                </div>
            </article>
        </Link>
    );
};

export default NewsCard;
