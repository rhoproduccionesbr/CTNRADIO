import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import PWAInstallPrompt from './PWAInstallPrompt';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col pb-24 md:pb-0">
            <PWAInstallPrompt />
            <Navbar />

            <main className="flex-grow pt-14 sm:pt-16">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
