import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { X, ZoomIn, Calendar, Image as ImageIcon } from 'lucide-react';

const GaleriaPublica = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'galeria'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setImages(items);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="w-12 h-12 border-4 border-accent-red border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-title font-black text-[var(--text-main)] mb-4 tracking-tight uppercase">
                        Galería <span className="text-accent-red">CTN</span>
                    </h1>
                    <div className="w-24 h-1.5 bg-accent-red mx-auto rounded-full mb-6"></div>
                    <p className="text-[var(--text-muted)] max-w-2xl mx-auto font-body text-lg italic">
                        Revive los mejores momentos de nuestra programación y eventos en Guarambaré.
                    </p>
                </div>

                {/* Grid de Imágenes */}
                {images.length > 0 ? (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {images.map((img) => (
                            <div 
                                key={img.id}
                                className="break-inside-avoid group relative rounded-3xl overflow-hidden bg-[var(--surface)] border border-[var(--card-border)] shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
                                onClick={() => setSelectedImage(img)}
                            >
                                <img 
                                    src={img.imageUrl} 
                                    alt={img.caption}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                
                                {/* Overlay al Hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase tracking-widest mb-2">
                                            <Calendar className="w-3 h-3 text-accent-red" />
                                            {img.createdAt?.toDate().toLocaleDateString() || 'Hace poco'}
                                        </div>
                                        <p className="text-white font-bold text-sm line-clamp-2">
                                            {img.caption || 'Recuerdo de CTN Radio'}
                                        </p>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                        <ZoomIn className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[var(--surface)] rounded-[3rem] border border-[var(--card-border)]">
                        <ImageIcon className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                        <p className="text-[var(--text-muted)] text-xl">Aún no hay fotos en nuestra galería.</p>
                    </div>
                )}
            </div>

            {/* Modal de Imagen (Lighthouse) */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
                        <img 
                            src={selectedImage.imageUrl} 
                            alt={selectedImage.caption}
                            className="w-full h-full object-contain rounded-xl shadow-2xl"
                        />
                        {selectedImage.caption && (
                            <div className="mt-6 text-center max-w-2xl">
                                <p className="text-white text-xl font-bold tracking-tight">
                                    {selectedImage.caption}
                                </p>
                                <div className="mt-2 text-white/40 text-xs uppercase tracking-[0.2em] font-black">
                                    CTN RADIO - Guarambaré, Paraguay
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
