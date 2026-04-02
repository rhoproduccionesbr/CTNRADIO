import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Radio, Info, Image, Newspaper, Calendar, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import logoUrl from '../assets/logo.svg';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { isPlaying, isBuffering } = useAudio();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { to: '/noticias', label: 'Noticias', icon: Newspaper },
        { to: '/programacion', label: 'Programas', icon: Calendar },
        { to: '/', label: 'Inicio', icon: Radio, isCenter: true },
        { to: '/galeria', label: 'Galería', icon: Image },
        { to: '/contacto', label: 'Nosotros', icon: Info },
    ];

    return (
        <>
            {/* ===== TOP NAV — Desktop & Mobile ===== */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled 
                    ? 'bg-[var(--surface)] backdrop-blur-2xl shadow-lg shadow-black/5 border-b border-[var(--card-border)]' 
                    : 'bg-transparent'
            }`}>
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <span className="text-lg font-title font-black tracking-tight mt-1">
                                CTN <span className="text-accent-red">RADIO</span>
                            </span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(link => {
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                                            isActive 
                                                ? 'text-accent-red bg-accent-red/8' 
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-border)]'
                                        }`}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        {link.label}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent-red rounded-full"></span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button 
                                onClick={toggleTheme} 
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--card-border)] transition-all duration-300 active:scale-90"
                                aria-label="Alternar tema"
                            >
                                {theme === 'dark' 
                                    ? <Sun className="w-[18px] h-[18px] text-amber-400" /> 
                                    : <Moon className="w-[18px] h-[18px]" />
                                }
                            </button>

                            {/* Live Badge */}
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all duration-500 ${
                                isPlaying 
                                    ? 'bg-accent-red/12 text-accent-red border border-accent-red/20' 
                                    : isBuffering 
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-400/20' 
                                        : 'bg-[var(--card-border)] text-[var(--text-muted)] border border-transparent'
                            }`}>
                                {isBuffering ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        isPlaying ? 'bg-accent-red animate-pulse' : 'bg-[var(--text-muted)]'
                                    }`}></span>
                                )}
                                {isBuffering ? 'CARGANDO' : isPlaying ? 'EN VIVO' : 'OFFLINE'}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ===== BOTTOM NAV — Mobile Only (SIEMPRE accesible, z máximo) ===== */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[70] backdrop-blur-2xl bg-[var(--surface)] border-t border-[var(--card-border)] pb-safe">
                <div className="flex items-end justify-around px-2 pt-1.5 pb-1">
                    {navLinks.map(link => {
                        const isActive = location.pathname === link.to;
                        const isCenter = link.isCenter;

                        if (isCenter) {
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="flex flex-col items-center justify-center -mt-4 relative"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                                        isActive 
                                            ? 'bg-accent-red text-white shadow-accent-red/30 scale-105' 
                                            : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--card-border)] shadow-black/5'
                                    }`}>
                                        <link.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className={`text-[9px] font-bold mt-1 transition-colors ${
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
                                className="flex flex-col items-center justify-center py-2 w-16 relative"
                            >
                                <div className={`relative transition-all duration-300 ${isActive ? 'text-accent-red' : 'text-[var(--text-muted)]'}`}>
                                    <link.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 1.8} />
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-red rounded-full"></span>
                                    )}
                                </div>
                                <span className={`text-[9px] font-semibold mt-1.5 transition-all duration-300 ${
                                    isActive ? 'text-accent-red' : 'text-[var(--text-muted)] opacity-70'
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
