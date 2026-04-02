import { useState, useEffect } from 'react';
import HeroPlayer from '../components/HeroPlayer';
import { db } from '../services/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';

const Home = () => {
    const [contacto, setContacto] = useState(null);
    const [galeria, setGaleria] = useState([]);

    useEffect(() => {
        const unsubContacto = onSnapshot(doc(db, 'configuracion', 'contacto'), (docSnap) => {
            if (docSnap.exists()) setContacto(docSnap.data());
        });

        const qGaleria = query(collection(db, 'galeria'), orderBy('createdAt', 'desc'), limit(30));
        const unsubGaleria = onSnapshot(qGaleria, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const caratulas = items.filter(img => img.isCover === true);
            setGaleria(caratulas);
        });

        return () => { unsubContacto(); unsubGaleria(); };
    }, []);

    return (
        <div className="relative min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center p-4 overflow-hidden transition-colors pb-24 sm:pb-20">
            {/* Fondo decorativo con gradientes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Glow superior */}
                <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-accent-red/[0.03] blur-[120px]"></div>
                {/* Glow lateral */}
                <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-accent-blue/[0.03] blur-[100px]"></div>
                {/* Grid pattern sutil */}
                <div className="absolute inset-0 opacity-[0.015]" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            <HeroPlayer contacto={contacto} galeria={galeria} />
        </div>
    );
};

export default Home;
