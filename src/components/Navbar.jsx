import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Radio, Info, Image, Newspaper, Calendar, Menu, X, Maximize2, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import StudioAmbientMode from './StudioAmbientMode';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const [isAmbientOpen, setIsAmbientOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

    // Bloquear el scroll del body cuando el menú lateral está abierto
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isDrawerOpen]);

    const navLinks = [
        { to: '/', label: 'Inicio', icon: Radio, isCenter: true },
        { to: '/programacion', label: 'Programación', icon: Calendar },
        { to: '/noticias', label: 'Noticias', icon: Newspaper },
        { to: '/galeria', label: 'Galería', icon: Image },
        { to: '/contacto', label: 'La Emisora', icon: Info },
    ];

    return (
        <>
            {/* ===== ENCABEZADO SUPERIOR (Más fino, CTN Radio a la izquierda, menú sandwich a la derecha) ===== */}
            <header className={`fixed top-0 left-0 right-0 z-50 h-13 flex items-center transform-gpu will-change-[background-color,border-color,backdrop-filter] transition-colors duration-200 border-b ${
                scrolled 
                    ? 'bg-[var(--surface)] backdrop-blur-xl border-[var(--card-border)] shadow-sm' 
                    : 'bg-[var(--surface)]/90 backdrop-blur-md border-[var(--card-border)]/60'
            }`}>
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-10">
                        
                        {/* Lado Superior Izquierdo: Título CTN Radio. más fino */}
                        <Link to="/" className="flex items-center group">
                            <span className="text-lg sm:text-xl font-title font-bold tracking-tight text-[var(--text-main)] group-hover:text-accent-red transition-colors">
                                CTN Radio<span className="text-accent-red">.</span>
                            </span>
                        </Link>

                        {/* Enlaces centrales para pantallas de escritorio */}
                        <nav className="hidden md:flex items-center gap-7">
                            {navLinks.map(link => {
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`text-sm font-medium transition-colors duration-200 relative py-1.5 ${
                                            isActive 
                                                ? 'text-accent-red font-semibold' 
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

                        {/* Lado Superior Derecho: Botón Menú tipo Sandwich */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsDrawerOpen(true)}
                                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[var(--card-border)]/40 hover:bg-[var(--card-border)] text-[var(--text-main)] transition-colors active:scale-95 border border-[var(--card-border)] cursor-pointer"
                                aria-label="Abrir menú lateral"
                                title="Menú"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== MENÚ LATERAL DESPLEGABLE (DRAWER) ===== */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        {/* Fondo difuminado oscuro */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                        />

                        {/* Panel lateral que se despliega desde la derecha */}
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-[var(--surface)] backdrop-blur-2xl border-l border-[var(--card-border)] z-[100] flex flex-col justify-between p-6 shadow-2xl"
                        >
                            {/* Parte Superior: Encabezado del menú y enlaces */}
                            <div>
                                <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)]">
                                    <span className="text-lg font-title font-bold tracking-tight text-[var(--text-main)]">
                                        CTN Radio<span className="text-accent-red">.</span>
                                    </span>
                                    <button
                                        onClick={() => setIsDrawerOpen(false)}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors active:scale-95"
                                        aria-label="Cerrar menú"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Enlaces de las diferentes secciones */}
                                <nav className="flex flex-col gap-1 mt-6">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 mb-2">
                                        Secciones
                                    </span>
                                    {navLinks.map(link => {
                                        const isActive = location.pathname === link.to;
                                        return (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                onClick={() => setIsDrawerOpen(false)}
                                                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                                                    isActive
                                                        ? 'bg-accent-red text-white shadow-md shadow-accent-red/25'
                                                        : 'text-[var(--text-main)] hover:bg-[var(--card-border)]/50'
                                                }`}
                                            >
                                                <link.icon className="w-4 h-4 shrink-0" />
                                                <span>{link.label}</span>
                                            </Link>
                                        );
                                    })}

                                    {/* Opción Pantalla Completa / Modo Estudio */}
                                    <button
                                        onClick={() => {
                                            setIsDrawerOpen(false);
                                            setIsAmbientOpen(true);
                                        }}
                                        className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--card-border)]/50 transition-all text-left mt-1 cursor-pointer"
                                    >
                                        <Maximize2 className="w-4 h-4 text-accent-red shrink-0" />
                                        <span>Modo Pantalla Completa</span>
                                    </button>

                                    {/* Enlace a Políticas de Privacidad */}
                                    <Link
                                        to="/politicas"
                                        onClick={() => setIsDrawerOpen(false)}
                                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all mt-1 ${
                                            location.pathname === '/politicas'
                                                ? 'bg-accent-red text-white shadow-md shadow-accent-red/25'
                                                : 'text-[var(--text-main)] hover:bg-[var(--card-border)]/50'
                                        }`}
                                    >
                                        <ShieldCheck className={`w-4 h-4 shrink-0 ${location.pathname === '/politicas' ? 'text-white' : 'text-accent-red'}`} />
                                        <span>Políticas de Privacidad</span>
                                    </Link>
                                </nav>
                            </div>

                            {/* Abajo de todo: Selector de Modo Oscuro o Claro */}
                            <div className="pt-5 border-t border-[var(--card-border)] flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
                                    Apariencia
                                </span>
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--card-border)]/40 hover:bg-[var(--card-border)]/70 text-[var(--text-main)] transition-all border border-[var(--card-border)] active:scale-98 cursor-pointer"
                                    aria-label="Alternar tema claro y oscuro"
                                >
                                    <div className="flex items-center gap-3">
                                        {theme === 'dark' ? (
                                            <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400">
                                                <Sun className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                <Moon className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div className="text-left">
                                            <div className="text-xs font-bold">
                                                {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                                            </div>
                                            <div className="text-[10px] text-[var(--text-muted)]">
                                                {theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Switch Toggle */}
                                    <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                                        theme === 'dark' ? 'bg-accent-red' : 'bg-zinc-300 dark:bg-zinc-700'
                                    }`}>
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                            theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </div>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

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
