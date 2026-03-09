import { useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { auth } from '../../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { LogOut, Home, Settings, Radio, Calendar, Newspaper, Info } from 'lucide-react';

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
        <div className="min-h-screen bg-primary flex flex-col md:flex-row font-body text-white">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-surface backdrop-blur-md border-r border-white/10 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-title font-bold text-accent-red flex items-center">
                        <Settings className="w-5 h-5 mr-2" /> Panel Admin
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink to="/admin" end className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Radio className="w-5 h-5" />
                        <span>Control de Transmisión</span>
                    </NavLink>
                    <NavLink to="/admin/programacion" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Calendar className="w-5 h-5" />
                        <span>Programación</span>
                    </NavLink>
                    <NavLink to="/admin/institucional" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Info className="w-5 h-5" />
                        <span>Datos de la Radio</span>
                    </NavLink>
                    <NavLink to="/admin/noticias" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Newspaper className="w-5 h-5" />
                        <span>Noticias</span>
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition font-bold text-sm"
                    >
                        <Home className="w-4 h-4" />
                        <span>Ir al Sitio</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-900/50 hover:bg-red-900 transition text-red-200 font-bold text-sm"
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
