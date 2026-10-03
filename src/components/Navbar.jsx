import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Radio, Info, Image, Newspaper, Calendar, Loader2, Play, Pause, Maximize2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import StudioAmbientMode from './StudioAmbientMode';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { isPlaying, isBuffering, togglePlay } = useAudio();
    const [isAmbientOpen, setIsAmbientOpen] = useState(false);
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const top = window.scrollY;
                    setScrolled(prev => {
                        if (!prev && top > 20) return true;
                        if (prev && top < 8) return false;
                        return prev;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { to: '/', label: 'Inicio', icon: Radio, isCenter: true },
        { to: '/programacion', label: 'Programación', icon: Calendar },
        { to: '/noticias', label: 'Noticias', icon: Newspaper },
        { to: '/galeria', label: 'Galería', icon: Image },
        { to: '/contacto', label: 'La Emisora', icon: Info },
    ];

    return (
        <>
            {/* ===== TOP NAV — Desktop Contract ===== */}
            <header className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transform-gpu will-change-[background-color,border-color,backdrop-filter] transition-colors duration-200 border-b ${
                scrolled 
                    ? 'bg-[var(--surface)] backdrop-blur-xl border-[var(--card-border)] shadow-sm' 
                    : 'bg-transparent border-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-11">
                        
                        {/* Zone 1: Single text element wordmark */}
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-xl bg-accent-red flex items-center justify-center text-white shadow-sm shadow-accent-red/25 transition-transform group-hover:scale-105">
                                <Radio className="w-4 h-4" />
                            </div>
                            <span className="text-xl font-title font-black tracking-tight text-[var(--text-main)]">
                                CTN<span className="text-accent-red">.</span>RADIO
                            </span>
                        </Link>

                        {/* Zone 2: 4-6 clean text navigation links */}
                        <nav className="hidden md:flex items-center gap-7">
                            {navLinks.map(link => {
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`text-sm font-semibold transition-colors duration-200 relative py-1.5 ${
                                            isActive 
                                                ? 'text-accent-red' 
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                        }`}
                                    >
                                        {link.label}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-red rounded-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Zone 3: Primary Actions (Live Badge & Theme toggle) */}
                        <div className="flex items-center gap-3">
                            {/* Interactive Quick Play / Live Control Button */}
                            <button
                                onClick={togglePlay}
                                aria-label={isPlaying ? "Pausar radio" : "Escuchar radio en vivo"}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer ${
                                    isPlaying 
                                        ? 'bg-accent-red text-white shadow-sm shadow-accent-red/30' 
                                        : isBuffering 
                                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' 
                                            : 'bg-[var(--card-border)] text-[var(--text-main)] hover:bg-[var(--card-border)]/80'
                                }`}
                                title={isPlaying ? "Pausar transmisión" : "Reproducir transmisión"}
                            >
                                {isBuffering ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : isPlaying ? (
                                    <Pause className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                )}
                                <span className="uppercase text-[10px] tracking-wider font-bold">
                                    {isBuffering ? 'CONECTANDO' : isPlaying ? 'EN VIVO' : 'ESCUCHAR'}
                                </span>
                            </button>

                            {/* Modo Pantalla Completa Trigger */}
                            <button 
                                onClick={() => setIsAmbientOpen(true)} 
                                className="w-9 h-9 hidden sm:flex items-center justify-center rounded-xl hover:bg-[var(--card-border)] text-[var(--text-muted)] hover:text-accent-red transition-colors active:scale-95"
                                title="Pantalla Completa / Modo Estudio"
                                aria-label="Abrir Modo Pantalla Completa"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>

                            {/* Theme Toggle */}
                            <button 
                                onClick={toggleTheme} 
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors active:scale-95"
                                aria-label="Alternar tema claro y oscuro"
                            >
                                {theme === 'dark' 
                                    ? <Sun className="w-4 h-4 text-amber-400" /> 
                                    : <Moon className="w-4 h-4" />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Studio Ambient Mode */}
            <StudioAmbientMode isOpen={isAmbientOpen} onClose={() => setIsAmbientOpen(false)} />

            {/* ===== BOTTOM NAV — Mobile Only (Thumb navigation con 44px+ hitboxes) ===== */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[70] backdrop-blur-2xl bg-[var(--surface)] border-t border-[var(--card-border)] pb-safe">
                <div className="flex items-center justify-around px-2 py-1">
                    {navLinks.map(link => {
                        const isActive = location.pathname === link.to;
                        const isCenter = link.isCenter;

                        if (isCenter) {
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="flex flex-col items-center justify-center -mt-5 relative min-w-[56px] min-h-[56px]"
                                    aria-label="Ir al Inicio y Reproductor"
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                                        isActive 
                                            ? 'bg-accent-red text-white shadow-accent-red/30 scale-105' 
                                            : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--card-border)]'
                                    }`}>
                                        <link.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className={`text-[10px] font-bold mt-1 ${
                                        isActive ? 'text-accent-red' : 'text-[var(--text-muted)]'
                                    }`}>
                                        {link.label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="flex flex-col items-center justify-center py-2 min-w-[52px] min-h-[48px] relative"
                            >
                                <div className={`relative transition-all duration-200 ${isActive ? 'text-accent-red' : 'text-[var(--text-muted)]'}`}>
                                    <link.icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 1.8} />
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-red rounded-full" />
                                    )}
                                </div>
                                <span className={`text-[10px] font-semibold mt-1 transition-colors ${
                                    isActive ? 'text-accent-red' : 'text-[var(--text-muted)]'
                                }`}>
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default Navbar;
