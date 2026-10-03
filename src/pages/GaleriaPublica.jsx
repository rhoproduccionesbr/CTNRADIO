import { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { X, ZoomIn, Calendar, Image as ImageIcon, Camera } from 'lucide-react';

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

    // Extraer álbumes únicos
    const albumesDisponibles = useMemo(() => {
        const albumes = new Set(images.map(img => img.album || 'General'));
        return ['Todos', ...Array.from(albumes)];
    }, [images]);

    const filteredImages = useMemo(() => {
        if (filterAlbum === 'Todos') return images;
        return images.filter(img => (img.album || 'General') === filterAlbum);
    }, [images, filterAlbum]);

    const imagenesAgrupadas = useMemo(() => {
        const agrupadas = {};
        images.forEach(img => {
            const alb = img.album || 'General';
            if (!agrupadas[alb]) agrupadas[alb] = [];
            agrupadas[alb].push(img);
        });
        return agrupadas;
    }, [images]);

    const ImageCard = ({ img }) => {
        const dateStr = img.createdAt?.toDate 
            ? img.createdAt.toDate().toLocaleDateString('es-PY') 
            : (img.createdAt ? new Date(img.createdAt).toLocaleDateString('es-PY') : 'Reciente');

        return (
            <div 
                className="group relative aspect-square rounded-3xl overflow-hidden bg-zinc-950 border border-[var(--card-border)] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                onClick={() => setSelectedImage(img)}
            >
                <img 
                    src={img.imageUrl} 
                    alt={img.caption || 'Galería CTN Radio'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                
                {/* Overlay con Scrim Oscuro */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {/* Metadatos limpios */}
                        <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-mono tabular-nums mb-1">
                            <Calendar className="w-3 h-3 text-accent-red" />
                            <span>{dateStr}</span>
                            <span>·</span>
                            <span>{img.album || 'General'}</span>
                        </div>
                        <p className="text-white font-title font-bold text-sm line-clamp-2 leading-snug">
                            {img.caption || 'CTN Radio en vivo'}
                        </p>
                    </div>

                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                        <ZoomIn className="w-4 h-4" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            
            {/* Header Editorial */}
            <div className="mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-red block mb-2">
                    Momentos en Imagen
                </span>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--card-border)]">
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-title font-black text-[var(--text-main)] tracking-tight">
                            Galería de la Emisora
                        </h1>
                        <p className="text-sm sm:text-base text-[var(--text-muted)] mt-2 max-w-2xl leading-relaxed">
                            Cabina de locución, transmisiones en vivo, coberturas comunitarias y recuerdos de nuestra trayectoria en Guarambaré.
                        </p>
                    </div>

                    {/* Filtro de Álbumes (Segmented Controls) */}
                    {albumesDisponibles.length > 2 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {albumesDisponibles.map(album => {
                                const isActive = filterAlbum === album;
                                return (
                                    <button
                                        key={album}
                                        onClick={() => setFilterAlbum(album)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                                            isActive
                                                ? 'bg-accent-red text-white shadow-sm shadow-accent-red/25'
                                                : 'bg-[var(--card-border)]/50 hover:bg-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                        }`}
                                    >
                                        {album}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido de la Galería */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-14 h-14 rounded-2xl bg-accent-red/10 flex items-center justify-center mb-4">
                        <Camera className="w-6 h-6 text-accent-red animate-pulse" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-muted)]">Cargando fotografías...</p>
                </div>
            ) : images.length === 0 ? (
                <div className="glass-card rounded-3xl p-16 text-center border border-[var(--card-border)] max-w-lg mx-auto">
                    <ImageIcon className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="font-title font-bold text-lg text-[var(--text-main)]">Sin fotos disponibles</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Pronto publicaremos recuerdos de nuestras transmisiones.</p>
                </div>
            ) : filterAlbum === 'Todos' ? (
                <div className="space-y-12">
                    {Object.entries(imagenesAgrupadas).map(([albumName, fotos]) => (
                        <section key={albumName}>
                            <div className="flex items-center gap-3 mb-5">
                                <h2 className="text-lg font-title font-bold text-[var(--text-main)] uppercase tracking-tight">
                                    {albumName}
                                </h2>
                                <span className="text-xs text-[var(--text-muted)] font-medium">
                                    ({fotos.length})
                                </span>
                                <div className="flex-1 h-px bg-[var(--card-border)]" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {fotos.map((img) => <ImageCard key={img.id} img={img} />)}
                            </div>
                        </section>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredImages.map((img) => <ImageCard key={img.id} img={img} />)}
                </div>
            )}

            {/* Lightbox Modal Profesional */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-md animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-5 right-5 sm:top-8 sm:right-8 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-colors z-[120]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div 
                        className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center animate-scale-in" 
                        onClick={e => e.stopPropagation()}
                    >
                        <img 
                            src={selectedImage.imageUrl} 
                            alt={selectedImage.caption || "Fotografía CTN"}
                            className="max-w-full max-h-[72vh] object-contain rounded-3xl shadow-2xl border border-white/10"
                        />
                        {selectedImage.caption && (
                            <div className="mt-5 text-center max-w-xl px-4">
                                <p className="text-white text-base sm:text-lg font-bold">
                                    {selectedImage.caption}
                                </p>
                                <div className="mt-1.5 text-zinc-400 text-xs font-mono tabular-nums flex items-center justify-center gap-2">
                                    <span>CTN RADIO</span>
                                    <span>·</span>
                                    <span>{selectedImage.album || 'General'}</span>
                                    {selectedImage.createdAt && (
                                        <>
                                            <span>·</span>
                                            <span>{selectedImage.createdAt?.toDate ? selectedImage.createdAt.toDate().toLocaleDateString('es-PY') : ''}</span>
                                        </>
                                    )}
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
