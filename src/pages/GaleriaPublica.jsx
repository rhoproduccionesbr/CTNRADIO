import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { X, ZoomIn, Calendar, Image as ImageIcon, Filter } from 'lucide-react';

const GaleriaPublica = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [filterAlbum, setFilterAlbum] = useState('Todos');

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

    // Obtener álbumes únicos de las imágenes disponibles
    const albumesUnicos = [...new Set(images.map(img => img.album || 'General'))];
    const albumesDisponibles = ['Todos', ...albumesUnicos];
    
    // Filtrar imágenes por selección
    const filteredImages = filterAlbum === 'Todos' 
        ? images 
        : images.filter(img => (img.album || 'General') === filterAlbum);

    // Agrupar imágenes por álbum (para vista "Todos")
    const imagenesAgrupadas = {};
    albumesUnicos.forEach(album => {
        const fotos = images.filter(img => (img.album || 'General') === album);
        if (fotos.length > 0) imagenesAgrupadas[album] = fotos;
    });

    // Componente de tarjeta de imagen reutilizable
    const ImageCard = ({ img }) => (
        <div 
            className="group relative aspect-square rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--card-border)] shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
            onClick={() => setSelectedImage(img)}
        >
            <img 
                src={img.imageUrl} 
                alt={img.caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Overlay al Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-2 text-white/70 text-[10px] uppercase tracking-widest mb-1.5">
                        <Calendar className="w-3 h-3 text-accent-red" />
                        {img.createdAt?.toDate().toLocaleDateString() || 'Hace poco'}
                    </div>
                    <p className="text-white font-bold text-sm line-clamp-2">
                        {img.caption || 'Recuerdo de CTN Radio'}
                    </p>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-3 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <ZoomIn className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Badge de Álbum — abajo para no tapar caras */}
            <div className="absolute bottom-3 left-3 z-10 opacity-90 group-hover:opacity-0 transition-opacity duration-300">
                <span className="bg-black/60 backdrop-blur-md text-white border border-white/10 text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg shadow-sm">
                    {img.album || 'General'}
                </span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-title font-black text-[var(--text-main)] mb-4 tracking-tight uppercase">
                        Galería <span className="text-accent-red">CTN</span>
                    </h1>
                    <div className="w-24 h-1.5 bg-accent-red mx-auto rounded-full mb-6"></div>
                    <p className="text-[var(--text-muted)] max-w-2xl mx-auto font-body text-lg italic">
                        Revive los mejores momentos de nuestra programación y eventos en Guarambaré.
                    </p>
                </div>

                {/* Filtro de Álbumes */}
                {albumesDisponibles.length > 2 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                        <Filter className="w-5 h-5 text-[var(--text-muted)] mr-2" />
                        {albumesDisponibles.map(album => (
                            <button
                                key={album}
                                onClick={() => setFilterAlbum(album)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                                    filterAlbum === album 
                                    ? 'bg-accent-red text-white shadow-lg shadow-accent-red/30' 
                                    : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--card-border)] hover:border-accent-red hover:text-accent-red'
                                }`}
                            >
                                {album}
                            </button>
                        ))}
                    </div>
                )}

                {/* Contenido */}
                {images.length === 0 ? (
                    <div className="text-center py-20 bg-[var(--surface)] rounded-[3rem] border border-[var(--card-border)]">
                        <ImageIcon className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                        <p className="text-[var(--text-muted)] text-xl">Aún no hay fotos en nuestra galería.</p>
                    </div>
                ) : filterAlbum === 'Todos' ? (
                    /* Vista agrupada por álbum */
                    <div className="space-y-12">
                        {Object.entries(imagenesAgrupadas).map(([albumName, fotos]) => (
                            <section key={albumName}>
                                <div className="flex items-center gap-3 mb-5">
                                    <h2 className="text-2xl font-title font-black text-[var(--text-main)] uppercase tracking-tight">
                                        {albumName}
                                    </h2>
                                    <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--card-border)] px-3 py-1 rounded-full">
                                        {fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'}
                                    </span>
                                    <div className="flex-1 h-px bg-[var(--card-border)]"></div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {fotos.map(img => <ImageCard key={img.id} img={img} />)}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : filteredImages.length > 0 ? (
                    /* Vista filtrada por un álbum específico */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredImages.map(img => <ImageCard key={img.id} img={img} />)}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[var(--surface)] rounded-[3rem] border border-[var(--card-border)]">
                        <ImageIcon className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                        <p className="text-[var(--text-muted)] text-xl mb-4">No hay fotos en el álbum "{filterAlbum}".</p>
                        <button 
                            onClick={() => setFilterAlbum('Todos')}
                            className="text-accent-red font-bold hover:underline"
                        >
                            Ver todas las fotos
                        </button>
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
                            <div className="mt-6 text-center max-w-2xl px-4">
                                <p className="text-white text-xl font-bold tracking-tight">
                                    {selectedImage.caption}
                                </p>
                                <div className="mt-2 text-white/40 text-[10px] uppercase tracking-[0.2em] font-black flex items-center justify-center gap-2">
                                    <span>CTN RADIO</span>
                                    <span>•</span>
                                    <span>Álbum: {selectedImage.album || 'General'}</span>
                                    <span>•</span>
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
