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
        </div>
    );
};

export default Layout;
