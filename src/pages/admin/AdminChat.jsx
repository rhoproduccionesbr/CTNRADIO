import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { Trash2, ShieldBan, AlertTriangle, Shield, CheckCircle, MessageSquare } from 'lucide-react';
import chatService from '../../services/chatService';

const AdminChat = () => {
    const { messages, isConnected, connections } = useChat();
    const [adminSecret, setAdminSecret] = useState(() => localStorage.getItem('ctn_chat_admin_secret') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('ctn_chat_admin_secret'));
    const [secretInput, setSecretInput] = useState('');
    const [adminMessage, setAdminMessage] = useState('');
    
    // Auto-scroll
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (secretInput.trim()) {
            setAdminSecret(secretInput.trim());
            localStorage.setItem('ctn_chat_admin_secret', secretInput.trim());
            setIsAuthenticated(true);
        }
    };

    const handleLogout = () => {
        setAdminSecret('');
        localStorage.removeItem('ctn_chat_admin_secret');
        setIsAuthenticated(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("¿Seguro que deseas borrar este mensaje de todas las pantallas?")) {
            chatService.adminDelete(id, adminSecret);
        }
    };

    const handleBan = (id) => {
        if (window.confirm("🛑 ¿Seguro que deseas BANEAR permanentemente la IP de este usuario? Perderá el acceso al chat de inmediato.")) {
            chatService.adminBanIp(id, adminSecret);
        }
    };

    const handleEmptyChat = () => {
        if (window.confirm("⚠️ PELIGRO: Esto borrará TODOS los mensajes del día actual para todos los usuarios. ¿Proceder?")) {
            chatService.adminEmpty(adminSecret);
        }
    };

    const handleSendAdminMessage = (e) => {
        e.preventDefault();
        if (adminMessage.trim()) {
            chatService.sendMessage('EQUIPO CTN RADIO', '', adminMessage.trim(), adminSecret);
            setAdminMessage('');
            // Scroll automatico
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto mt-20 glass-card p-8 rounded-3xl text-center border border-accent-red/20 shadow-2xl">
                <Shield className="w-16 h-16 text-accent-red mx-auto mb-4 drop-shadow-[0_0_15px_rgba(230,57,70,0.5)]" />
                <h1 className="text-2xl font-bold font-title mb-2">Seguridad del Chat</h1>
                <p className="text-text-muted text-sm mb-6">Ingresa la clave maestra del servidor WebSocket para habilitar los poderes de moderación en vivo.</p>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        value={secretInput}
                        onChange={(e) => setSecretInput(e.target.value)}
                        placeholder="Clave secreta del servidor..."
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--card-border)] text-[var(--text-main)] focus:ring-2 focus:ring-accent-red/50 transition-all font-mono"
                    />
                    <button type="submit" className="w-full py-3 bg-accent-red text-white rounded-xl font-bold hover:bg-red-600 active:scale-95 transition-all shadow-lg">
                        Autorizar Sesión
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-title flex items-center gap-3">
                        <Shield className="w-8 h-8 text-emerald-500" />
                        Moderación en Vivo
                    </h1>
                    <p className="text-text-muted mt-1">Controla los mensajes en tiempo real. Los borrados son instantáneos para todos.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[var(--surface)] px-4 py-2 rounded-xl border border-[var(--card-border)] shadow-sm font-bold text-sm">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {isConnected ? 'Conectado al Server' : 'Desconectado'}
                    </div>
                    <button onClick={handleLogout} className="text-xs font-bold text-text-muted hover:text-red-500 underline">
                        Cambiar Clave
                    </button>
                </div>
            </div>

            <div className="glass-card flex-1 rounded-3xl border border-[var(--card-border)] shadow-xl overflow-hidden flex flex-col">
                {/* Header Panel */}
                <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between bg-black/5 dark:bg-white/5">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-sm flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-accent-red" />
                            {messages.length} Mensajes Hoy
                        </span>
                        <span className="font-bold text-sm text-text-muted flex items-center gap-1.5">
                            Conexiones Activas: <span className="text-emerald-500">{connections}</span>
                        </span>
                    </div>
                    <button 
                        onClick={handleEmptyChat}
                        disabled={messages.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold text-xs transition-all disabled:opacity-30 border border-red-600/20"
                    >
                        <AlertTriangle className="w-4 h-4" /> Vaciar Todo el Chat
                    </button>
                </div>

                {/* Lista de Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--primary)]">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-50 text-text-muted">
                            <CheckCircle className="w-16 h-16 mb-4 text-emerald-500" />
                            <p className="font-bold">El chat está limpio.</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={`flex items-start justify-between p-4 rounded-2xl border ${msg.admin ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[var(--surface)] border-[var(--card-border)]'} shadow-sm group hover:border-accent-red/50 transition-all`}>
                                <div className="flex-1 mr-4">
                                    <div className="flex items-baseline gap-3 mb-1">
                                        <span className={`font-bold font-title ${msg.admin ? 'text-emerald-500' : 'text-accent-red'}`}>
                                            {msg.nombre} {msg.admin && '(ADMIN)'}
                                        </span>
                                        <span className="text-xs text-text-muted">{msg.localidad || 'Sin ubicación'}</span>
                                        <span className="text-xs text-text-muted font-mono bg-black/5 dark:bg-white/10 px-1.5 rounded">{new Date(msg.hora).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm font-medium">{msg.texto}</p>
                                    {msg.reacciones > 0 && <span className="text-[10px] text-rose-500 mt-1 inline-block font-bold">❤️ {msg.reacciones} reacciones</span>}
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleDelete(msg.id)}
                                        title="Borrar solo este mensaje"
                                        className="p-2 bg-white dark:bg-zinc-800 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleBan(msg.id)}
                                        title="Banear IP del remitente"
                                        className="p-2 bg-black text-white hover:bg-red-700 rounded-xl transition-all shadow-sm flex items-center gap-1 font-bold text-xs"
                                    >
                                        <ShieldBan className="w-4 h-4" /> <span className="hidden sm:inline">BAN</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Zona de Envío (Admin) */}
                <div className="p-4 border-t border-[var(--card-border)] bg-[var(--surface)]">
                    <form onSubmit={handleSendAdminMessage} className="flex gap-2 relative">
                        <input
                            type="text"
                            value={adminMessage}
                            onChange={(e) => setAdminMessage(e.target.value)}
                            placeholder="Escribe un anuncio oficial como Administrador..."
                            className="flex-1 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--card-border)] focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm font-medium"
                        />
                        <button 
                            type="submit"
                            disabled={!adminMessage.trim()}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <MessageSquare className="w-4 h-4" /> Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
