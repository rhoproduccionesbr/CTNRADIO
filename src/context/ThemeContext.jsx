import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const isManual = localStorage.getItem('theme_manual') === 'true';
        const savedTheme = localStorage.getItem('theme');
        if (isManual && savedTheme) {
            return savedTheme;
        }
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Escuchar cambios de tema del sistema en tiempo real
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            const isManual = localStorage.getItem('theme_manual') === 'true';
            if (!isManual) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        localStorage.setItem('theme_manual', 'true');
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const resetToSystemTheme = () => {
        localStorage.removeItem('theme_manual');
        localStorage.removeItem('theme');
        if (typeof window !== 'undefined' && window.matchMedia) {
            setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, resetToSystemTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
