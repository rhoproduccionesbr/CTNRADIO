import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

const NewsCard = ({ noticia }) => {
    // Si no hay imagen, usamos un placeholder genérico
    const imagenUrl = noticia.imagenUrl || 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    // Formatear fecha asumiendo que es un Timestamp de Firestore
    let fechaFormat = "";
    if (noticia.fecha) {
        const dateObj = noticia.fecha.toDate ? noticia.fecha.toDate() : new Date(noticia.fecha);
        fechaFormat = dateObj.toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    return (
        <article className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group">
            <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                    src={imagenUrl}
                    alt={noticia.titulo}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                {noticia.categoria && (
                    <div className="absolute top-4 left-4 bg-accent-red text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {noticia.categoria}
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-[var(--text-muted)] text-xs font-mono mb-3">
                    <Calendar className="w-3 h-3 mr-2" />
                    {fechaFormat || "Fecha Reciente"}
                </div>

                <h3 className="text-xl font-bold font-title text-[var(--text-main)] mb-3 group-hover:text-accent-red transition-colors line-clamp-2">
                    {noticia.titulo}
                </h3>

                <p className="text-[var(--text-muted)] text-sm mb-6 line-clamp-3">
                    {noticia.resumen}
                </p>

                <div className="mt-auto">
                    <Link
                        to={`/noticias/${noticia.id}`}
                        className="inline-flex items-center text-accent-blue font-bold text-sm hover:text-blue-400 transition-colors"
                    >
                        Leer más <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default NewsCard;
