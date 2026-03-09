import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, Tag, ArrowLeft, Loader2 } from 'lucide-react';

const NewsDetail = () => {
    const { id } = useParams();
    const [noticia, setNoticia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-accent-red animate-spin mb-4" />
                <p className="text-gray-400 font-bold">Cargando artículo...</p>
            </div>
        );
    }

    if (error || !noticia) {
        return (
            <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-white mb-4">Artículo no encontrado</h1>
                <p className="text-gray-400 mb-8">La noticia que buscas ya no existe o el enlace es incorrecto.</p>
                <Link to="/noticias" className="bg-accent-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition inline-flex items-center">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Volver a Noticias
                </Link>
            </div>
        );
    }

    const imagenUrl = noticia.imagenUrl || 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

    let fechaFormat = "";
    if (noticia.fecha) {
        const dateObj = noticia.fecha.toDate ? noticia.fecha.toDate() : new Date(noticia.fecha);
        fechaFormat = dateObj.toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    return (
        <article className="container mx-auto px-4 py-32 max-w-4xl">
            <Link to="/noticias" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 font-bold text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al listado
            </Link>

            <header className="mb-10">
                {noticia.categoria && (
                    <span className="inline-block bg-accent-red/20 border border-accent-red/30 text-accent-red text-sm font-bold px-4 py-1.5 rounded-full mb-6">
                        {noticia.categoria}
                    </span>
                )}

                <h1 className="text-4xl md:text-5xl font-title font-bold text-white mb-6 leading-tight">
                    {noticia.titulo}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm font-mono border-y border-white/10 py-4">
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {fechaFormat || "Fecha Reciente"}
                    </div>
                    {noticia.autor && (
                        <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            Redacción: {noticia.autor}
                        </div>
                    )}
                </div>
            </header>

            <div className="relative w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-2xl">
                <img
                    src={imagenUrl}
                    alt={noticia.titulo}
                    className="w-full h-full object-cover"
                />
            </div>

            <div
                className="prose prose-lg prose-invert max-w-none text-gray-300 font-body
                           prose-headings:font-title prose-headings:text-white
                           prose-a:text-accent-blue hover:prose-a:text-blue-400
                           prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: noticia.contenido }}
            />
            {/* Si el contenido de Firestore es texto plano simple, 
                será mejor usar etiquetas <p> estándar. Pero asumimos que 
                el panel administrativo podría enviar algo de HTML básico (ej. react-quill). */}
        </article>
    );
};

export default NewsDetail;
