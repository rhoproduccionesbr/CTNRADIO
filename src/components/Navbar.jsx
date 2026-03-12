import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

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
                    {/* Logo simplificado */}
                    <Link to="/" className="flex items-center space-x-3 group text-2xl font-title font-extrabold hover:text-accent-red transition-colors" onClick={() => setMobileOpen(false)}>
                        <span>CTN - RADIO</span>
                    </Link>

                    {/* Enlaces de escritorio */}
                    <div className="hidden md:flex space-x-6 lg:space-x-8">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`font-bold transition-colors ${link.accent ? 'text-accent-blue hover:text-blue-600' : 'hover:text-accent-red'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
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

                        {/* Botón Hamburguesa para mobile */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 hover:text-accent-red transition-colors"
                            aria-label="Menú de navegación"
                        >
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú Mobile Desplegable */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-80 border-t border-[var(--card-border)] bg-[var(--surface)] backdrop-blur-md shadow-lg rounded-b-xl' : 'max-h-0'}`}>
                <div className="container mx-auto px-4 py-4 space-y-1">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-4 py-3 rounded-xl font-bold transition-colors ${link.accent ? 'text-accent-blue hover:bg-accent-blue/10' : 'hover:text-accent-red hover:bg-[var(--card-border)]'}`}
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
