import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


// Importa las páginas de usuario
import HomeUSER from "./pages/user/HomeUSER";
import AjustesUSER from "./pages/user/ajustesUSER";
import MapUSER from "./pages/user/MapUSER";
import ReportesUSER from "./pages/user/ReportesUSER";
import AyudaUSER  from "./pages/user/AyudaUSER";
import PERFILUSER from "./pages/user/PerfilUser";

// importaciones de autority
import HomeAU from "./pages/autority/homeAU";
import AjustesAU from "./pages/autority/ajustesAU";
import ProfileAU from "./pages/autority/profileAU";
import ReportesAU from "./pages/autority/reportesAU";

// importaciones de admin
import HomeADM from "./pages/admin/HomeADM";
import ReportesADM from "./pages/admin/ReportesADM";
import ProfileADM from "./pages/admin/profileADM";
import AjustesADM from "./pages/admin/ajustesADM";
import UsuariosADM from "./pages/admin/UsuariosADM";


// inicio de sesion y registro
import AuthPage from "./pages/auth/AuthPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige la raíz al home del usuario */}
        <Route path="/" element={<Navigate to="/user/home" replace />} />

        {/* Rutas USER */}
        <Route path="/user/home" element={<HomeUSER />} />
        <Route path="/user/ajustes" element={<AjustesUSER />} />
        <Route path="/user/map" element={<MapUSER />} />
        <Route path="/user/reportes" element={<ReportesUSER />} />
        <Route path="/user/ayuda" element={<AyudaUSER />} />
        <Route path="/user/perfil" element={<PERFILUSER />} />

        {/* Rutas USER */}
        <Route path="/autority/home" element={<HomeAU />} />
        <Route path="/autority/ajustes" element={<AjustesAU />} />
        <Route path="/autority/profile" element={<ProfileAU />} />
        <Route path="/autority/reportes" element={<ReportesAU />} />


      {/* Rutas ADMIN */}
      <Route path="/admin/Home" element={<HomeADM />} />
      <Route path="/admin/Reportes" element={<ReportesADM />} />
      <Route path="/admin/Profile" element={<ProfileADM />} />
      <Route path="/admin/Ajustes" element={<AjustesADM />} />
      <Route path="/admin/Usuarios" element={<UsuariosADM />} />

      {/* Rutas de autenticación */}
      <Route path="/auth" element={<AuthPage />} />




      </Routes>
    </BrowserRouter>
  );
}
