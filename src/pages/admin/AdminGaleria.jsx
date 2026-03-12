import { useState, useEffect } from 'react';
import { db, storage } from '../../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { ImagePlus, Trash2, Loader2, Camera } from 'lucide-react';

const AdminGaleria = () => {
    const [images, setImages] = useState([]);
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
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
                    createdAt: serverTimestamp()
                });
                setUploading(false);
                setFile(null);
                setCaption('');
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

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-title font-bold text-accent-red">Galería de Fotos</h1>
                    <p className="text-[var(--text-muted)]">Sube fotos que aparecerán aleatoriamente en el reproductor de inicio.</p>
                </div>
            </div>

            {/* Formulario de Subida */}
            <div className="glass-card p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--surface)]">
                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-2">
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

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-muted)]">Pie de Foto (Opcional)</label>
                        <input 
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Ej: Evento en vivo..."
                            className="w-full bg-[var(--primary)] border border-[var(--card-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-red/20 transition-all font-body"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={uploading || !file}
                        className="w-full bg-accent-red text-white py-3 rounded-xl font-bold shadow-lg shadow-accent-red/20 hover:bg-[#c92a35] transition-all flex items-center justify-center gap-2 disabled:opacity-50 h-[50px]"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Subiendo {progress}%
                            </>
                        ) : (
                            <>
                                <Camera className="w-5 h-5" />
                                Subir Foto
                            </>
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
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                            <button 
                                onClick={() => handleDelete(img)}
                                className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                title="Eliminar"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
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
