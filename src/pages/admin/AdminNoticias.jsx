import { useState, useEffect } from 'react';
import { db, storage } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Newspaper, Plus, Trash2, Edit2, Loader2, Save, X, Image as ImageIcon } from 'lucide-react';

const AdminNoticias = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentNoticia, setCurrentNoticia] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        titulo: '',
        resumen: '',
        contenido: '',
        autor: '',
        categoria: '',
        imagenUrl: '',
        file: null // para subir foto nueva
    });

    useEffect(() => {
        const q = query(collection(db, 'noticias'), orderBy('fecha', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNoticias(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const resetForm = () => {
        setFormData({
            titulo: '',
            resumen: '',
            contenido: '',
            autor: '',
            categoria: '',
            imagenUrl: '',
            file: null
        });
        setCurrentNoticia(null);
        setIsEditing(false);
    };

    const handleEdit = (noticia) => {
        setCurrentNoticia(noticia);
        setFormData({
            titulo: noticia.titulo || '',
            resumen: noticia.resumen || '',
            contenido: noticia.contenido || '',
            autor: noticia.autor || '',
            categoria: noticia.categoria || '',
            imagenUrl: noticia.imagenUrl || '',
            file: null
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta noticia permanentemente?')) {
            try {
                await deleteDoc(doc(db, 'noticias', id));
            } catch (error) {
                console.error("Error al eliminar noticia:", error);
                alert("Error al eliminar la noticia.");
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setUploadingImage(true);

        try {
            let finalImageUrl = formData.imagenUrl;

            // 1. Si hay un archivo nuevo, subirlo a Firebase Storage
            if (formData.file) {
                const fileRef = ref(storage, `noticias/${Date.now()}_${formData.file.name}`);
                const uploadTask = await uploadBytesResumable(fileRef, formData.file);
                finalImageUrl = await getDownloadURL(uploadTask.ref);
            }

            // 2. Preparar el documento para Firestore
            const noticiaData = {
                titulo: formData.titulo,
                resumen: formData.resumen,
                contenido: formData.contenido,
                autor: formData.autor,
                categoria: formData.categoria,
                imagenUrl: finalImageUrl,
                fecha: currentNoticia ? currentNoticia.fecha : serverTimestamp()
            };

            // 3. Guardar o actualizar en Firestore
            const docId = currentNoticia ? currentNoticia.id : Date.now().toString();
            await setDoc(doc(db, 'noticias', docId), noticiaData, { merge: true });

            resetForm();
        } catch (error) {
            console.error("Error guardando noticia:", error);
            alert("Error al procesar la noticia. Verifica tus permisos de Storage y Firestore.");
        } finally {
            setUploadingImage(false);
        }
    };


    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-accent-red" /></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-title font-bold flex items-center">
                    <Newspaper className="w-8 h-8 mr-3 text-accent-red" />
                    Gestor de Noticias
                </h1>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-accent-red hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold flex items-center transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Redactar Noticia
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="glass-card rounded-2xl p-6 border border-white/10 animate-fadeIn bg-black/40">
                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                        <h2 className="text-xl font-bold">{currentNoticia ? 'Editar Noticia' : 'Nueva Noticia'}</h2>
                        <button onClick={resetForm} className="text-gray-400 hover:text-white transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1">Título</label>
                                    <input required type="text" value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1">Resumen Corto</label>
                                    <textarea required rows="2" value={formData.resumen} onChange={e => setFormData({ ...formData, resumen: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-white resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-1">Autor</label>
                                        <input type="text" value={formData.autor} onChange={e => setFormData({ ...formData, autor: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-1">Categoría</label>
                                        <input type="text" value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} placeholder="Ej. Locales, Deportes" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-1">Cuerpo de la Noticia</label>
                                    <textarea required rows="8" value={formData.contenido} onChange={e => setFormData({ ...formData, contenido: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-white resize-none" placeholder="El artículo completo va aquí. Puedes usar etiquetas HTML básicas (<br>, <b>)." />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center">
                                <ImageIcon className="w-4 h-4 mr-2" /> Imagen de Portada
                            </label>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-red/20 file:text-accent-red hover:file:bg-accent-red/30 focus:outline-none transition"
                                />
                                {formData.imagenUrl && !formData.file && (
                                    <img src={formData.imagenUrl} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-white/20" />
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Sube una imagen desde tu PC. Reemplazará la existente si es una edición.</p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button disabled={uploadingImage} type="submit" className="bg-accent-blue hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center transition disabled:opacity-50">
                                {uploadingImage ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                {uploadingImage ? 'Subiendo contenido...' : 'Guardar y Publicar'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {noticias.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-400 glass-card rounded-2xl">
                            No hay noticias publicadas.
                        </div>
                    ) : (
                        noticias.map((noticia) => (
                            <div key={noticia.id} className="glass-card rounded-2xl overflow-hidden flex flex-col">
                                <div className="h-40 bg-gray-800 relative">
                                    {noticia.imagenUrl ? (
                                        <img src={noticia.imagenUrl} alt="Portada" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon className="w-10 h-10" /></div>
                                    )}
                                </div>
                                <div className="p-4 flex-1">
                                    <h3 className="font-bold text-lg mb-1 line-clamp-2">{noticia.titulo}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{noticia.resumen}</p>

                                    <div className="flex justify-end space-x-2 mt-auto pt-4 border-t border-white/5">
                                        <button onClick={() => handleEdit(noticia)} className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded-lg transition" title="Editar">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(noticia.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-lg transition" title="Eliminar">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminNoticias;
