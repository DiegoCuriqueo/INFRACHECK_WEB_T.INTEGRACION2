import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomeUSER from "./pages/user/HomeUSER";
import AjustesUSER from "./pages/user/ajustesUSER";
import MapUSER from "./pages/user/MapUSER";
import ReportesUSER from "./pages/user/ReportesUSER";
import AyudaUSER  from "./pages/user/AyudaUSER";
import PERFILUSER from "./pages/user/PerfilUser";

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


        {/* fallback */}
        <Route path="*" element={<Navigate to="/user/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
<<<<<<< Updated upstream


/*

VISTAS LADO AUTHORITY

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// lado de la autoridad
import HomeAU from "./pages/autority/homeAU";
import ProfileAU from "./pages/autority/profileAU";
import ReportesAU from "./pages/autority/ReportesAU";
import AjustesAU from "./pages/autority/ajustesAU";




export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/autority/home" />} />
        <Route path="/autority/home" element={<HomeAU />} />
        <Route path="/autority/profile" element={<ProfileAU />} />
        <Route path="/autority/Reportes" element={<ReportesAU />} />
        <Route path="/autority/ajustes" element={<AjustesAU />} />
      </Routes>
    </BrowserRouter>
  );
}





*/
=======
>>>>>>> Stashed changes
