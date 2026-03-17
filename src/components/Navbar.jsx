import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Home, Radio, Info, Image, Phone, Newspaper } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const navLinks = [
        { to: '/', label: 'Inicio', icon: Home },
        { to: '/noticias', label: 'Noticias', icon: Newspaper },
        { to: '/programacion', label: 'Radio', icon: Radio },
        { to: '/institucional', label: 'Nosotros', icon: Info },
        { to: '/galeria', label: 'Galería', icon: Image },
        { to: '/contacto', label: 'Contacto', accent: true, icon: Phone },
    ];

    return (
        <>
            {/* Top Navigation - Desktop (Full) & Mobile (Logo/Theme solo) */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo simplificado */}
                        <Link to="/" className="flex items-center space-x-3 group text-2xl font-title font-extrabold hover:text-accent-red transition-colors">
                            <span>CTN - RADIO</span>
                        </Link>

                        {/* Enlaces de escritorio */}
                        <div className="hidden md:flex space-x-6 lg:space-x-8">
                            {navLinks.map(link => {
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`font-bold transition-all flex items-center gap-2 ${
                                            isActive 
                                                ? 'text-accent-red' 
                                                : link.accent ? 'text-accent-blue hover:text-blue-600' : 'hover:text-accent-red'
                                        }`}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Theme Toggle */}
                            <button 
                                onClick={toggleTheme} 
                                className="p-2 rounded-full hover:bg-[var(--card-border)] transition-colors"
                                aria-label="Alternar tema"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Indicador En Vivo */}
                            <div className="hidden sm:flex items-center space-x-2 bg-accent-red/10 text-accent-red px-3 py-1 rounded-full border border-accent-red/20 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse"></span>
                                <span className="text-xs sm:text-sm font-bold tracking-wide">EN VIVO</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] backdrop-blur-xl border-t border-[var(--card-border)] px-2 pb-safe pt-2 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-around">
                    {navLinks.map(link => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 relative ${
                                    isActive ? 'text-accent-red' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                }`}
                            >
                                <link.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 mb-1' : 'mb-0.5'}`} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-[10px] font-bold tracking-tight transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                    {link.label}
                                </span>
                                {isActive && (
                                    <span className="absolute -top-1 w-1 h-1 bg-accent-red rounded-full"></span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default Navbar;
