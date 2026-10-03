import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, ArrowLeft, Loader2, Share2, Check } from 'lucide-react';

const NewsDetail = () => {
    const { id } = useParams();
    const [noticia, setNoticia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const docRef = doc(db, 'noticias', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setNoticia({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Error obteniendo noticia:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [id]);

    const handleShare = async () => {
        if (!noticia) return;
        const shareData = {
            title: noticia.titulo,
            text: noticia.resumen || noticia.titulo,
            url: window.location.href
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch { /* cancel */ }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch { /* fallback */ }
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center pt-20">
                <Loader2 className="w-10 h-10 text-accent-red animate-spin mb-3" />
                <p className="text-xs font-semibold text-[var(--text-muted)]">Cargando artículo...</p>
            </div>
        );
    }

    if (error || !noticia) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-32 text-center">
                <h1 className="text-3xl font-title font-black text-[var(--text-main)] mb-3">Artículo no encontrado</h1>
                <p className="text-sm text-[var(--text-muted)] mb-6">El artículo solicitado no existe o fue retirado de circulación.</p>
                <Link to="/noticias" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-red text-white text-xs font-bold">
                    <ArrowLeft className="w-4 h-4" /> Volver a Noticias
                </Link>
            </div>
        );
    }

    const imagenUrl = noticia.imagenUrl || 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?auto=format&fit=crop&w=1200&q=80';

    let fechaFormat = "Reciente";
    if (noticia.fecha) {
        const dateObj = noticia.fecha.toDate ? noticia.fecha.toDate() : new Date(noticia.fecha);
        fechaFormat = dateObj.toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    return (
        <article className="min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
            
            {/* Botón Volver + Compartir */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--card-border)]">
                <Link 
                    to="/noticias" 
                    className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-accent-red transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Todas las noticias</span>
                </Link>

                <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-border)]/50 hover:bg-[var(--card-border)] text-xs font-semibold text-[var(--text-main)] transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Enlace copiado' : 'Compartir'}</span>
                </button>
            </div>

            {/* Metadatos y Título (Zero-Pill Discipline) */}
            <header className="mb-8">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-3 font-medium">
                    <span className="tabular-nums">{fechaFormat}</span>
                    {noticia.categoria && (
                        <>
                            <span aria-hidden="true">·</span>
                            <span className="text-accent-red font-bold">{noticia.categoria}</span>
                        </>
                    )}
                    {noticia.autor && (
                        <>
                            <span aria-hidden="true">·</span>
                            <span>Por {noticia.autor}</span>
                        </>
                    )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-title font-black text-[var(--text-main)] leading-tight tracking-tight">
                    {noticia.titulo}
                </h1>

                {noticia.resumen && (
                    <p className="text-base sm:text-lg text-[var(--text-muted)] mt-4 leading-relaxed font-medium">
                        {noticia.resumen}
                    </p>
                )}
            </header>

            {/* Imagen Principal */}
            <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden mb-10 shadow-xl border border-[var(--card-border)] bg-zinc-950">
                <img
                    src={imagenUrl}
                    alt={noticia.titulo}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Contenido Editorial */}
            <div 
                className="prose prose-base sm:prose-lg max-w-none text-[var(--text-main)] leading-relaxed font-body
                           prose-headings:font-title prose-headings:font-bold prose-headings:text-[var(--text-main)]
                           prose-a:text-accent-red hover:prose-a:underline
                           prose-strong:text-[var(--text-main)]
                           prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: noticia.contenido }}
            />
        </article>
    );
};

export default NewsDetail;
