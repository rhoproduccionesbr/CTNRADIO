import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logoUrl from '../assets/logo.svg';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { to: '/', label: 'Inicio' },
        { to: '/noticias', label: 'Noticias' },
        { to: '/programacion', label: 'Programación' },
        { to: '/institucional', label: 'Institucional' },
        { to: '/contacto', label: 'Contacto', accent: true },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group" onClick={() => setMobileOpen(false)}>
                        <div className="relative w-16 h-10 md:w-20 md:h-12 flex items-center justify-center">
                            <div className="absolute inset-0 bg-white/20 blur-md rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <img
                                src={logoUrl}
                                alt="CTN Radio Logo"
                                className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                    </Link>

                    {/* Enlaces de escritorio */}
                    <div className="hidden md:flex space-x-6 lg:space-x-8">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`font-bold transition-colors ${link.accent ? 'text-accent-blue hover:text-blue-400' : 'hover:text-accent-red'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Indicador En Vivo */}
                        <div className="flex items-center space-x-2 bg-accent-red/20 text-accent-red px-3 py-1 rounded-full border border-accent-red/30">
                            <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse"></span>
                            <span className="text-xs sm:text-sm font-bold tracking-wide">EN VIVO</span>
                        </div>

                        {/* Botón Hamburguesa para mobile */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
                            aria-label="Menú de navegación"
                        >
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú Mobile Desplegable */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-80 border-t border-white/10' : 'max-h-0'}`}>
                <div className="container mx-auto px-4 py-4 space-y-1">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-4 py-3 rounded-xl font-bold transition-colors ${link.accent ? 'text-accent-blue hover:bg-accent-blue/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
