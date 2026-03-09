import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import StickyPlayer from './StickyPlayer';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col pb-20 sm:pb-16">
            <Navbar />

            <main className="flex-grow pt-16">
                <Outlet />
            </main>

            <StickyPlayer />

            <footer className="bg-black/90 text-gray-400 py-6 text-center text-sm border-t border-white/5">
                <p>© {new Date().getFullYear()} CTN Radio. "De Guarambaré al mundo". Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default Layout;
