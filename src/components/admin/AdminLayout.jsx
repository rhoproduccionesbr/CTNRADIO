import { useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { auth } from '../../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { LogOut, Home, Settings, Radio, Calendar, Newspaper, Info, Link as LinkIcon } from 'lucide-react';
import AdminPlayer from './AdminPlayer';

const AdminLayout = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // Como estamos intentando loguearnos anónimamente en la app principal para lectura, 
            // aquí deberíamos verificar que no sea un usuario anónimo para el panel de admin (es_anonymous: false)
            if (currentUser && !currentUser.isAnonymous) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/admin/login');
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-primary">Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[var(--primary)] flex flex-col md:flex-row font-body text-[var(--text-main)]">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-[var(--surface)] backdrop-blur-md border-r border-[var(--card-border)] flex flex-col shadow-sm">
                <div className="p-6 border-b border-[var(--card-border)]">
                    <h2 className="text-xl font-title font-bold text-accent-red flex items-center">
                        <Settings className="w-5 h-5 mr-2" /> Panel Admin
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavLink to="/admin" end className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[var(--card-border)] text-accent-red font-bold' : 'text-[var(--text-muted)] hover:bg-[var(--card-border)] hover:text-[var(--text-main)]'}`}>
                        <Radio className="w-5 h-5" />
                        <span>Control de Transmisión</span>
                    </NavLink>
                    <NavLink to="/admin/programacion" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[var(--primary)] text-accent-red font-bold shadow-sm border border-[var(--card-border)]' : 'text-[var(--text-muted)] hover:bg-[var(--card-border)] hover:text-[var(--text-main)]'}`}>
                        <Calendar className="w-5 h-5" />
                        <span>Programación</span>
                    </NavLink>
                    <NavLink to="/admin/institucional" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[var(--primary)] text-accent-red font-bold shadow-sm border border-[var(--card-border)]' : 'text-[var(--text-muted)] hover:bg-[var(--card-border)] hover:text-[var(--text-main)]'}`}>
                        <Info className="w-5 h-5" />
                        <span>Datos de la Radio</span>
                    </NavLink>
                    <NavLink to="/admin/noticias" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[var(--primary)] text-accent-red font-bold shadow-sm border border-[var(--card-border)]' : 'text-[var(--text-muted)] hover:bg-[var(--card-border)] hover:text-[var(--text-main)]'}`}>
                        <Newspaper className="w-5 h-5" />
                        <span>Noticias</span>
                    </NavLink>
                    <NavLink to="/admin/sociales" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[var(--primary)] text-accent-red font-bold shadow-sm border border-[var(--card-border)]' : 'text-[var(--text-muted)] hover:bg-[var(--card-border)] hover:text-[var(--text-main)]'}`}>
                        <LinkIcon className="w-5 h-5" />
                        <span>Redes Sociales</span>
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-[var(--card-border)] space-y-2">
                    <AdminPlayer />
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--primary)] border border-[var(--card-border)] shadow-sm transition font-bold text-sm"
                    >
                        <Home className="w-4 h-4" />
                        <span>Ir al Sitio</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-transparent hover:border-red-600/30 transition text-red-600 font-bold text-sm shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
