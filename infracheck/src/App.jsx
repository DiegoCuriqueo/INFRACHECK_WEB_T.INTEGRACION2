import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Importa las páginas de usuario
import HomeUSER from "./pages/user/HomeUSER";
import AjustesUSER from "./pages/user/ajustesUSER";
import MapUSER from "./pages/user/MapUSER";
import ReportesUSER from "./pages/user/ReportesUSER";
import AyudaUSER from "./pages/user/AyudaUSER";
import PERFILUSER from "./pages/user/PerfilUser";

// Importaciones de autoridad
import HomeAU from "./pages/autority/homeAU";
import AjustesAU from "./pages/autority/ajustesAU";
import ProfileAU from "./pages/autority/profileAU";
import ReportesAU from "./pages/autority/ReportesAU";
import ProyectosAU from "./pages/autority/ProyectosAU";

// Importaciones de admin
import HomeADM from "./pages/admin/HomeADM";
import ReportesADM from "./pages/admin/ReportesADM";
import ProfileADM from "./pages/admin/profileADM";
import AjustesADM from "./pages/admin/ajustesADM";
import UsuariosADM from "./pages/admin/UsuariosADM";

// Login y registro
import AuthPage from "./pages/auth/AuthPage";
import Inicio from "./pages/auth/Inicio"
import Contacto from "./pages/auth/Contacto"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirige la raíz al home del usuario */}
          <Route path="/" element={<Navigate to="/inicio" replace />} />

          {/* Rutas USER */}
          <Route path="/user/home" element={<HomeUSER />} />
          <Route path="/user/ajustes" element={<AjustesUSER />} />
          <Route path="/user/map" element={<MapUSER />} />
          <Route path="/user/reportes" element={<ReportesUSER />} />
          <Route path="/user/ayuda" element={<AyudaUSER />} />
          <Route path="/user/perfil" element={<PERFILUSER />} />

          {/* Rutas AUTORITY */}
          <Route path="/autority/home" element={<HomeAU />} />
          <Route path="/autority/ajustes" element={<AjustesAU />} />
          <Route path="/autority/profile" element={<ProfileAU />} />
          <Route path="/autority/reportes" element={<ReportesAU />} />
          <Route path="/autority/proyectos" element={<ProyectosAU />} />

          {/* Rutas ADMIN */}
          <Route path="/admin/home" element={<HomeADM />} />
          <Route path="/admin/reportes" element={<ReportesADM />} />
          <Route path="/admin/profile" element={<ProfileADM />} />
          <Route path="/admin/ajustes" element={<AjustesADM />} />
          <Route path="/admin/usuarios" element={<UsuariosADM />} />

          {/* Autenticación */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
