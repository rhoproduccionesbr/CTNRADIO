import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';

// Rutas públicas diferidas (Code Splitting)
const ProgramacionGrid = lazy(() => import('./pages/ProgramacionGrid'));
const Contacto = lazy(() => import('./pages/Contacto'));
const NewsPortal = lazy(() => import('./pages/NewsPortal'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const GaleriaPublica = lazy(() => import('./pages/GaleriaPublica'));

// Rutas de administración diferidas (Code Splitting masivo)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Programacion = lazy(() => import('./pages/admin/Programacion'));
const AdminInstitucional = lazy(() => import('./pages/admin/AdminInstitucional'));
const AdminNoticias = lazy(() => import('./pages/admin/AdminNoticias'));
const AdminSociales = lazy(() => import('./pages/admin/AdminSociales'));
const AdminGaleria = lazy(() => import('./pages/admin/AdminGaleria'));
const AdminChat = lazy(() => import('./pages/admin/AdminChat'));

const RouteLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-accent-red/20 border-t-accent-red animate-spin"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <AudioProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="programacion" element={<ProgramacionGrid />} />
                  <Route path="contacto" element={<Contacto />} />
                  <Route path="noticias" element={<NewsPortal />} />
                  <Route path="noticias/:id" element={<NewsDetail />} />
                  <Route path="galeria" element={<GaleriaPublica />} />
                </Route>

                {/* Rutas del Panel de Administración */}
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="programacion" element={<Programacion />} />
                  <Route path="institucional" element={<AdminInstitucional />} />
                  <Route path="noticias" element={<AdminNoticias />} />
                  <Route path="sociales" element={<AdminSociales />} />
                  <Route path="galeria" element={<AdminGaleria />} />
                  <Route path="chat" element={<AdminChat />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AudioProvider>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
