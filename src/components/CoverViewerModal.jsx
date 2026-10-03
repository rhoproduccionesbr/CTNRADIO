import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ZoomIn, ZoomOut, Download, Share2, 
  MessageCircle, Calendar, Check, Radio 
} from 'lucide-react';

const CoverViewerModal = ({ isOpen, onClose, photo, programaEnVivo, contacto }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClose = useCallback(() => {
    setIsZoomed(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleShare = async () => {
    if (!photo) return;
    const shareData = {
      title: photo.caption || programaEnVivo || 'CTN Radio',
      text: `Mira el afiche de ${programaEnVivo || 'CTN Radio'} en vivo desde Guarambaré:`,
      url: photo.imageUrl
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch { /* cancel */ }
    } else {
      try {
        await navigator.clipboard.writeText(photo.imageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch { /* fallback */ }
    }
  };

  const whatsappNum = contacto?.whatsapp?.replace(/[^0-9]/g, '') || '595981000000';
  const dateFormatted = photo?.createdAt?.toDate 
    ? photo.createdAt.toDate().toLocaleDateString('es-PY', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Reciente';

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[130] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 select-none"
          onClick={handleClose}
        >
          {/* Indicador táctil de deslizamiento para móviles */}
          <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-2 sm:hidden shrink-0" />

          {/* Top Header Bar */}
          <motion.div 
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10 shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-red flex items-center justify-center text-white shadow-md shadow-accent-red/25">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-red block">
                  Afiche Oficial de Emisión
                </span>
                <h3 className="font-title font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                  {photo.caption || programaEnVivo || 'CTN Radio — En Vivo'}
                </h3>
              </div>
            </div>

            {/* Toolbar Superior */}
            <div className="flex items-center gap-2">
              {/* Zoom Toggle */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsZoomed(!isZoomed)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title={isZoomed ? "Reducir tamaño" : "Ampliar afiche"}
              >
                {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </motion.button>

              {/* Compartir */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleShare}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Compartir afiche"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </motion.button>

              {/* Descargar original */}
              <motion.a
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                href={photo.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                download="afiche-ctn-radio.jpg"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Abrir imagen original"
              >
                <Download className="w-4 h-4" />
              </motion.a>

              {/* Cerrar */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleClose}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors ml-1"
                title="Cerrar visor (Esc o deslizar abajo)"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Main Image Stage con gesto táctil de arrastre (drag-to-dismiss) */}
          <div 
            className="relative z-10 flex-1 flex items-center justify-center overflow-hidden py-4 px-2"
            onClick={e => e.stopPropagation()}
          >
            <motion.div 
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.1, bottom: 0.8 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > 120 || velocity.y > 500) {
                  handleClose();
                }
              }}
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative max-h-full max-w-full flex items-center justify-center cursor-zoom-in active:cursor-grabbing"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <motion.img
                src={photo.imageUrl}
                alt={photo.caption || "Afiche de cabina"}
                animate={{ scale: isZoomed ? 1.35 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl pointer-events-none"
              />
            </motion.div>
          </div>

          {/* Bottom Footer Info & Actions */}
          <motion.div 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 15, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-accent-red" />
              <span>Publicado: <strong className="text-zinc-200">{dateFormatted}</strong></span>
              <span>·</span>
              <span>Álbum: <strong className="text-zinc-200">{photo.album || 'Programas'}</strong></span>
            </div>

            {/* WhatsApp Directo */}
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              href={`https://wa.me/${whatsappNum}?text=Hola%20CTN%20Radio,%20estoy%20viendo%20el%20afiche%20de%20${encodeURIComponent(photo.caption || programaEnVivo || 'la radio')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/25"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Consultar por WhatsApp a Cabina</span>
            </motion.a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoverViewerModal;
