import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomeAU from "./pages/autority/homeAU";
import ProfileAU from "./pages/autority/profileAU";
import ReportesAU from "./pages/autority/ReportesAU";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/autority/home" />} />
        <Route path="/autority/home" element={<HomeAU />} />
        <Route path="/autority/profile" element={<ProfileAU />} />
        <Route path="/autority/Reportes" element={<ReportesAU />} />
      </Routes>
    </BrowserRouter>
  );
}
