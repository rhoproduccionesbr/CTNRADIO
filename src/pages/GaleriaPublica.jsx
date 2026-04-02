import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { X, ZoomIn, Calendar, Image as ImageIcon, Filter, Camera } from 'lucide-react';

const GaleriaPublica = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [filterAlbum, setFilterAlbum] = useState('Todos');

    useEffect(() => {
        const q = query(collection(db, 'galeria'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setImages(items);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent-red/10 flex items-center justify-center">
                        <Camera className="w-7 h-7 text-accent-red animate-pulse" />
                    </div>
                    <p className="text-[var(--text-muted)] font-semibold text-sm">Cargando galería...</p>
                </div>
            </div>
        );
    }

    const albumesUnicos = [...new Set(images.map(img => img.album || 'General'))];
    const albumesDisponibles = ['Todos', ...albumesUnicos];
    const filteredImages = filterAlbum === 'Todos' ? images : images.filter(img => (img.album || 'General') === filterAlbum);
    
    const imagenesAgrupadas = {};
    albumesUnicos.forEach(album => {
        const fotos = images.filter(img => (img.album || 'General') === album);
        if (fotos.length > 0) imagenesAgrupadas[album] = fotos;
    });

    const ImageCard = ({ img, idx }) => (
        <div 
            className="group relative aspect-square rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--card-border)] cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up"
            style={{ animationDelay: `${(idx % 8) * 60}ms` }}
            onClick={() => setSelectedImage(img)}
        >
            <img 
                src={img.imageUrl} alt={img.caption}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-1.5 text-white/60 text-[9px] uppercase tracking-widest mb-1">
                        <Calendar className="w-2.5 h-2.5 text-accent-red" />
                        {img.createdAt?.toDate().toLocaleDateString() || 'Reciente'}
                    </div>
                    <p className="text-white font-bold text-sm line-clamp-2 leading-snug">
                        {img.caption || 'Recuerdo CTN Radio'}
                    </p>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 backdrop-blur-xl rounded-xl flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300">
                    <ZoomIn className="w-5 h-5 text-white" />
                </div>
            </div>
            {/* Badge álbum */}
            <div className="absolute bottom-2.5 left-2.5 z-10 opacity-90 group-hover:opacity-0 transition-opacity duration-300">
                <span className="bg-black/50 backdrop-blur-xl text-white text-[8px] uppercase tracking-widest font-bold px-2 py-1 rounded-lg border border-white/10">
                    {img.album || 'General'}
                </span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6">
            {/* Header */}
            <div className="page-header text-center mb-10 relative">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-accent-red/8 text-accent-red text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 border border-accent-red/10">
                        <Camera className="w-3.5 h-3.5" />
                        Momentos CTN
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-title font-black text-[var(--text-main)] mb-4 tracking-tight">
                        Galería <span className="gradient-text">CTN</span>
                    </h1>
                    <p className="text-[var(--text-muted)] max-w-xl mx-auto text-base leading-relaxed">
                        Revive los mejores momentos de nuestra programación y eventos en Guarambaré.
                    </p>
                </div>
            </div>

            {/* Filtro de álbumes */}
            {albumesDisponibles.length > 2 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-3xl mx-auto">
                    {albumesDisponibles.map(album => (
                        <button
                            key={album}
                            onClick={() => setFilterAlbum(album)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                filterAlbum === album 
                                    ? 'bg-accent-red text-white shadow-lg shadow-accent-red/20' 
                                    : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--card-border)] hover:border-accent-red/30 hover:text-accent-red'
                            }`}
                        >
                            {album}
                        </button>
                    ))}
                </div>
            )}

            {/* Contenido */}
            <div className="max-w-7xl mx-auto">
                {images.length === 0 ? (
                    <div className="text-center py-24 glass-card rounded-2xl">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--card-border)] mx-auto mb-6 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-[var(--text-muted)]" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Aún no hay fotos</h3>
                        <p className="text-[var(--text-muted)] text-sm">Pronto compartiremos nuestros mejores momentos.</p>
                    </div>
                ) : filterAlbum === 'Todos' ? (
                    <div className="space-y-12">
                        {Object.entries(imagenesAgrupadas).map(([albumName, fotos]) => (
                            <section key={albumName}>
                                <div className="flex items-center gap-3 mb-5">
                                    <h2 className="text-xl font-title font-black text-[var(--text-main)] uppercase tracking-tight">
                                        {albumName}
                                    </h2>
                                    <span className="text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--card-border)] px-2.5 py-1 rounded-lg">
                                        {fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'}
                                    </span>
                                    <div className="flex-1 h-px bg-[var(--card-border)]"></div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                    {fotos.map((img, idx) => <ImageCard key={img.id} img={img} idx={idx} />)}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : filteredImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {filteredImages.map((img, idx) => <ImageCard key={img.id} img={img} idx={idx} />)}
                    </div>
                ) : (
                    <div className="text-center py-24 glass-card rounded-2xl">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--card-border)] mx-auto mb-6 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-[var(--text-muted)]" />
                        </div>
                        <p className="text-[var(--text-muted)] text-base mb-4">No hay fotos en el álbum "{filterAlbum}".</p>
                        <button onClick={() => setFilterAlbum('Todos')} className="text-accent-red font-bold text-sm hover:underline">
                            Ver todas las fotos
                        </button>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-colors z-[110]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center animate-scale-in" onClick={e => e.stopPropagation()}>
                        <img 
                            src={selectedImage.imageUrl} alt={selectedImage.caption}
                            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                        />
                        {selectedImage.caption && (
                            <div className="mt-5 text-center max-w-xl px-4">
                                <p className="text-white text-lg font-bold">{selectedImage.caption}</p>
                                <div className="mt-2 text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2">
                                    <span>CTN RADIO</span>
                                    <span>·</span>
                                    <span>{selectedImage.album || 'General'}</span>
                                    <span>·</span>
                                    <span>{selectedImage.createdAt?.toDate().toLocaleDateString() || ''}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GaleriaPublica;
