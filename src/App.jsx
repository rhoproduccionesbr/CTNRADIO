import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';
import ProgramacionGrid from './pages/ProgramacionGrid';
import Institucional from './pages/Institucional';
import Contacto from './pages/Contacto';
import NewsPortal from './pages/NewsPortal';
import NewsDetail from './pages/NewsDetail';
import AdminLayout from './components/admin/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Programacion from './pages/admin/Programacion';
import AdminInstitucional from './pages/admin/AdminInstitucional';
import AdminNoticias from './pages/admin/AdminNoticias';
import AdminSociales from './pages/admin/AdminSociales';

function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="programacion" element={<ProgramacionGrid />} />
              <Route path="institucional" element={<Institucional />} />
              <Route path="contacto" element={<Contacto />} />
              <Route path="noticias" element={<NewsPortal />} />
              <Route path="noticias/:id" element={<NewsDetail />} />
            </Route>

            {/* Rutas del Panel de Administración */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="programacion" element={<Programacion />} />
              <Route path="institucional" element={<AdminInstitucional />} />
              <Route path="noticias" element={<AdminNoticias />} />
              <Route path="sociales" element={<AdminSociales />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AudioProvider>
    </ThemeProvider>
  );
}

export default App;
