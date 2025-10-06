import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Sidebars
import SidebarUSER from "./components/nav/SidebarUSER";
import SidebarAU from "./components/nav/SidebarAU";
import SidebarADM from "./components/nav/SidebarADM";

// USER pages
import HomeUSER from "./pages/user/HomeUSER";
import AjustesUSER from "./pages/user/AjustesUSER";
import MapUSER from "./pages/user/MapUSER";
import ReportesUSER from "./pages/user/ReportesUSER";
import AyudaUSER from "./pages/user/AyudaUSER";
import PerfilUSER from "./pages/user/PerfilUSER";

// AUTORITY pages
import HomeAU from "./pages/autority/HomeAU";
import AjustesAU from "./pages/autority/AjustesAU";
import ProfileAU from "./pages/autority/ProfileAU";
import ReportesAU from "./pages/autority/ReportesAU";

// ADMIN pages
import HomeADM from "./pages/admin/HomeADM";
import ReportesADM from "./pages/admin/ReportesADM";
import ProfileADM from "./pages/admin/ProfileADM";
import AjustesADM from "./pages/admin/AjustesADM";
import UsuariosADM from "./pages/admin/UsuariosADM";

// Auth
import AuthPage from "./pages/auth/AuthPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige raíz */}
        <Route path="/" element={<Navigate to="/user/home" replace />} />

        {/* USER */}
        <Route
          path="/user/*"
          element={
            <div className="flex">
              <SidebarUSER />
              <main className="flex-1 bg-[#0A0F1A] text-white min-h-screen p-6">
                <Routes>
                  <Route path="home" element={<HomeUSER />} />
                  <Route path="ajustes" element={<AjustesUSER />} />
                  <Route path="map" element={<MapUSER />} />
                  <Route path="reportes" element={<ReportesUSER />} />
                  <Route path="ayuda" element={<AyudaUSER />} />
                  <Route path="perfil" element={<PerfilUSER />} />
                </Routes>
              </main>
            </div>
          }
        />

        {/* AUTORITY */}
        <Route
          path="/autority/*"
          element={
            <div className="flex">
              <SidebarAU />
              <main className="flex-1 bg-[#0A0F1A] text-white min-h-screen p-6">
                <Routes>
                  <Route path="home" element={<HomeAU />} />
                  <Route path="ajustes" element={<AjustesAU />} />
                  <Route path="profile" element={<ProfileAU />} />
                  <Route path="reportes" element={<ReportesAU />} />
                </Routes>
              </main>
            </div>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <div className="flex">
              <SidebarADM />
              <main className="flex-1 bg-[#0A0F1A] text-white min-h-screen p-6">
                <Routes>
                  <Route path="home" element={<HomeADM />} />
                  <Route path="reportes" element={<ReportesADM />} />
                  <Route path="profile" element={<ProfileADM />} />
                  <Route path="ajustes" element={<AjustesADM />} />
                  <Route path="usuarios" element={<UsuariosADM />} />
                </Routes>
              </main>
            </div>
          }
        />

        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}
