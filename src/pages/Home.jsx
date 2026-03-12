import { useState, useEffect } from 'react';
import HeroPlayer from '../components/HeroPlayer';
import { db } from '../services/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';

const Home = () => {
    const [contacto, setContacto] = useState(null);
    const [galeria, setGaleria] = useState([]);

    useEffect(() => {
        // Suscribirse a datos de contacto
        const unsubContacto = onSnapshot(doc(db, 'configuracion', 'contacto'), (docSnap) => {
            if (docSnap.exists()) setContacto(docSnap.data());
        });

        // Suscribirse a la galería (últimas 15 fotos)
        const qGaleria = query(collection(db, 'galeria'), orderBy('createdAt', 'desc'), limit(15));
        const unsubGaleria = onSnapshot(qGaleria, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGaleria(items);
        });

        return () => {
            unsubContacto();
            unsubGaleria();
        };
    }, []);

    return (
        <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 md:p-8 overflow-hidden bg-primary transition-colors">
            <div className="w-full max-w-4xl h-full flex items-center justify-center">
                <HeroPlayer contacto={contacto} galeria={galeria} />
            </div>
        </div>
    );
};

export default Home;
