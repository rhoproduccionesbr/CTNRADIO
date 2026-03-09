import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Info, Target, Radio, Loader2 } from 'lucide-react';

const Institucional = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstitucional = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'configuracion', 'institucional'));
                if (docSnap.exists()) {
                    setData(docSnap.data());
                } else {
                    setData({
                        mision: "Informar, entretener y conectar a la comunidad de Guarambaré y al mundo entero a través de una propuesta radiofónica plural, objetiva y participativa. Buscamos promover los valores, la cultura local y mantener a nuestra audiencia al tanto del acontecer diario con responsabilidad.",
                        vision: "Ser la radio digital líder y de mayor alcance oriunda de Guarambaré, reconocida por su excelencia informativa, su compromiso con la verdad y la alta fidelidad técnica de sus transmisiones ininterrumpidas mediante el uso y adopción de tecnologías de última generación.",
                        perfil: "Dedicado a la comunicación y la docencia, el Prof. Clemente Torales ha sido una voz reconocida y respetada en Guarambaré.\n\nCTN Radio nace de su visión de llevar la esencia de la radio local más allá de las fronteras geográficas, aprovechando el potencial de internet para conectar a los compatriotas alrededor del mundo.",
                        fotoUrl: "https://ui-avatars.com/api/?name=Clemente+Torales&background=B71C1C&color=fff&size=512&font-size=0.3"
                    });
                }
            } catch (error) {
                console.error("Error obteniendo datos institucionales:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstitucional();
    }, []);

    if (loading || !data) {
        return (
            <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-accent-red animate-spin mb-4" />
                <p className="text-gray-400 font-bold">Cargando información...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 pt-32 max-w-5xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-title font-bold text-white mb-4">La Emisora</h1>
                <p className="text-gray-400 text-lg">Conoce más sobre CTN Radio y nuestra trayectoria.</p>
                <div className="w-24 h-1 bg-accent-red mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div className="glass-card rounded-3xl p-8 transform hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 bg-accent-red/20 rounded-2xl flex items-center justify-center mb-6 border border-accent-red/30">
                        <Target className="w-8 h-8 text-accent-red" />
                    </div>
                    <h2 className="text-2xl font-title font-bold mb-4 text-white">Nuestra Misión</h2>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {data.mision}
                    </p>
                </div>

                <div className="glass-card rounded-3xl p-8 transform hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6 border border-accent-blue/30">
                        <Info className="w-8 h-8 text-accent-blue" />
                    </div>
                    <h2 className="text-2xl font-title font-bold mb-4 text-white">Nuestra Visión</h2>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {data.vision}
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-3xl p-8 md:p-12 border-t-4 border-t-accent-red relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-x-1/2 -translate-y-1/2">
                    <Radio className="w-96 h-96" />
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/10 shrink-0 bg-gray-800 shadow-2xl">
                        <img src={data.fotoUrl || "https://ui-avatars.com/api/?name=Clemente+Torales&background=B71C1C&color=fff&size=512&font-size=0.3"} alt="Prof. Clemente Torales" className="w-full h-full object-cover" />
                    </div>

                    <div>
                        <h3 className="text-xl text-accent-red font-bold tracking-widest uppercase mb-2">Fundador y Director</h3>
                        <h2 className="text-3xl md:text-4xl font-title font-bold text-white mb-6">Prof. Clemente Torales Núñez</h2>

                        <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                            {data.perfil}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Institucional;
