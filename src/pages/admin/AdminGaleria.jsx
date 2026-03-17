import { useState, useEffect } from 'react';
import { db, storage } from '../../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { ImagePlus, Trash2, Loader2, Camera, Star } from 'lucide-react';

const ALBUMES = ['General', 'Equipo', 'Publicidad', 'Postales', 'Eventos'];

const AdminGaleria = () => {
    const [images, setImages] = useState([]);
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [album, setAlbum] = useState('General');
    const [isCover, setIsCover] = useState(false);
    
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const q = query(collection(db, 'galeria'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setImages(items);
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `galeria/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(prog);
            },
            (error) => {
                console.error("Error al subir:", error);
                setUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await addDoc(collection(db, 'galeria'), {
                    imageUrl: downloadURL,
                    fileName: fileName,
                    caption: caption,
                    album: album,
                    isCover: isCover,
                    createdAt: serverTimestamp()
                });
                setUploading(false);
                setFile(null);
                setCaption('');
                setAlbum('General');
                setIsCover(false);
                setProgress(0);
            }
        );
    };

    const handleDelete = async (image) => {
        if (window.confirm('¿Eliminar esta foto de la galería?')) {
            try {
                // Eliminar de Storage
                const storageRef = ref(storage, `galeria/${image.fileName}`);
                await deleteObject(storageRef);
                // Eliminar de Firestore
                await deleteDoc(doc(db, 'galeria', image.id));
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    const toggleCover = async (image) => {
        try {
            await updateDoc(doc(db, 'galeria', image.id), {
                isCover: !image.isCover
            });
        } catch (error) {
            console.error("Error al actualizar carátula:", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-title font-bold text-accent-red">Galería de Fotos</h1>
                    <p className="text-[var(--text-muted)]">Organiza por álbumes y selecciona cuáles aparecen en la Carátula de Inicio.</p>
                </div>
            </div>

            {/* Formulario de Subida */}
            <div className="glass-card p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--surface)]">
                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    
                    {/* Input de Imagen */}
                    <div className="space-y-2 lg:col-span-1">
                        <label className="text-sm font-bold text-[var(--text-muted)]">Imagen</label>
                        <div className="relative group cursor-pointer">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                required
                            />
                            <div className="w-full h-32 bg-[var(--primary)] rounded-xl border-2 border-dashed border-[var(--card-border)] flex flex-col items-center justify-center text-[var(--text-muted)] group-hover:border-accent-red transition-colors overflow-hidden">
                                {file ? (
                                    <p className="text-xs px-4 text-center truncate w-full">{file.name}</p>
                                ) : (
                                    <>
                                        <ImagePlus className="w-8 h-8 mb-2" />
                                        <span className="text-xs">Seleccionar imagen</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Meta Datos (Caption, Album, check) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--text-muted)]">Pie de Foto (Opcional)</label>
                            <input 
                                type="text"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Ej: Evento en vivo..."
                                className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-red/20 transition-all font-body text-[var(--text-main)]"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-bold text-[var(--text-muted)]">Álbum</label>
                                <select 
                                    value={album}
                                    onChange={(e) => setAlbum(e.target.value)}
                                    className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-red/20 transition-all font-body text-[var(--text-main)]"
                                >
                                    {ALBUMES.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 mt-4 sm:mt-8 bg-[var(--primary)] px-4 py-3 rounded-xl border border-[var(--card-border)]">
                                <input 
                                    type="checkbox"
                                    id="isCover"
                                    checked={isCover}
                                    onChange={(e) => setIsCover(e.target.checked)}
                                    className="w-5 h-5 accent-accent-red cursor-pointer"
                                />
                                <label htmlFor="isCover" className="text-sm font-bold text-[var(--text-main)] cursor-pointer flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    Carátula Inicio
                                </label>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={uploading || !file}
                        className="w-full bg-accent-red text-white py-3 rounded-xl font-bold shadow-lg shadow-accent-red/20 hover:bg-[#c92a35] transition-all flex items-center justify-center gap-2 disabled:opacity-50 h-full min-h-[50px] lg:h-[100px]"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{progress}%</span>
                            </>
                        ) : (
                            <div className="flex flex-row lg:flex-col items-center justify-center gap-2">
                                <Camera className="w-5 h-5" />
                                <span className="flex flex-col text-center">
                                    <span>Subir Foto</span>
                                    <span className="text-[10px] font-normal opacity-80 uppercase tracking-widest hidden lg:block">al álbum {album}</span>
                                </span>
                            </div>
                        )}
                    </button>
                </form>
            </div>

            {/* Grid de Imágenes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map(img => (
                    <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--card-border)] shadow-sm">
                        <img 
                            src={img.imageUrl} 
                            alt={img.caption} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 p-2">
                            <button 
                                onClick={() => toggleCover(img)}
                                className={`p-3 rounded-full transition-colors shadow-lg ${img.isCover ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm'}`}
                                title={img.isCover ? "Quitar de Carátula" : "Añadir a Carátula"}
                            >
                                <Star className={`w-5 h-5 ${img.isCover ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                                onClick={() => handleDelete(img)}
                                className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                title="Eliminar"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Badges de Información */}
                        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
                            {img.isCover && (
                                <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1 border border-yellow-400">
                                    <Star className="w-3 h-3 fill-current" /> Carátula
                                </span>
                            )}
                            <span className="bg-accent-blue text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border border-blue-400">
                                {img.album || 'General'}
                            </span>
                        </div>

                        {img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm">
                                <p className="text-[10px] text-white truncate text-center">{img.caption}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {images.length === 0 && (
                <div className="text-center py-20 bg-[var(--surface)] rounded-3xl border border-[var(--card-border)]">
                    <p className="text-[var(--text-muted)]">No hay fotos en la galería. ¡Sube tu primera foto!</p>
                </div>
            )}
        </div>
    );
};

export default AdminGaleria;
