import HeroPlayer from '../components/HeroPlayer';
import logoUrl from '../assets/logo.svg';
import { Link } from 'react-router-dom';
import { MessageCircle, Facebook } from 'lucide-react';

const Home = () => {
    return (
        <div className="container mx-auto px-4 py-4 sm:py-8">
            <section className="text-center py-12 sm:py-20 flex flex-col items-center">
                <div className="w-48 sm:w-64 md:w-80 h-auto mb-6 relative">
                    <div className="absolute inset-0 bg-accent-red/10 blur-3xl rounded-full"></div>
                    <img 
                        src={logoUrl} 
                        alt="CTN Radio Logo" 
                        className="w-full h-auto object-contain relative z-10 drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                    />
                </div>
                <p className="text-lg sm:text-xl md:text-2xl text-[var(--text-muted)] font-body max-w-2xl mx-auto italic mb-8 sm:mb-12 px-4">
                    "De Guarambaré al mundo"
                </p>

                <HeroPlayer />

                {/* Botones de Contáctanos */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a 
                        href="https://facebook.com/ctnradio" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#166FE5] hover:scale-105 transition-all shadow-sm shadow-blue-500/30 w-full sm:w-auto justify-center"
                    >
                        <Facebook className="w-5 h-5" />
                        Síguenos en Facebook
                    </a>
                    <a 
                        href="https://wa.me/595000000000" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 hover:scale-105 transition-all shadow-sm shadow-green-500/30 w-full sm:w-auto justify-center"
                    >
                        <MessageCircle className="w-5 h-5" />
                        WhatsApp
                    </a>
                </div>
            </section>
        </div>
    );
};

export default Home;
