import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Escuchar el evento que indica que la PWA se puede instalar
        const handleBeforeInstallPrompt = (e) => {
            // Prevenir la mini-infobar predeterminada
            e.preventDefault();
            // Guardar el evento para dispararlo luego
            setDeferredPrompt(e);
            // Mostrar nuestro propio modal
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Si ya está instalada o es standalone, no mostramos nada
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        // Mostrar el prompt de instalación nativo
        deferredPrompt.prompt();
        
        // Esperar la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        // Limpiamos la variable
        setDeferredPrompt(null);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[var(--surface)] border border-[var(--card-border)] rounded-3xl p-6 max-w-sm w-full shadow-2xl relative transform transition-all text-center">
                <button 
                    onClick={() => setShowPrompt(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--card-border)] text-[var(--text-muted)] transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <div className="w-20 h-20 mx-auto bg-[var(--primary)] rounded-full flex items-center justify-center mb-4 shadow-inner border border-[var(--card-border)]">
                    <img src="/logo.svg" alt="CTN Radio Icon" className="w-12 h-12" />
                </div>
                
                <h3 className="text-xl font-title font-bold text-[var(--text-main)] mb-2">Instalar CTN Radio</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                    Añade nuestra app a tu pantalla de inicio para acceder rápidamente a la radio en vivo y más.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleInstallClick}
                        className="w-full bg-accent-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-accent-red/20"
                    >
                        <Download className="w-5 h-5" />
                        Instalar Aplicación
                    </button>
                    <button 
                        onClick={() => setShowPrompt(false)}
                        className="w-full bg-[var(--card-border)] hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-main)] font-semibold py-3 px-4 rounded-xl transition-colors"
                    >
                        Ahora no
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
