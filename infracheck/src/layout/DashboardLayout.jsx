import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import "../styles/Layout.css"; // si usas estilos globales

export default function DashboardLayout() {
  return (
    <div className="app-shell">
      <Sidebar />        {/* 👈 aquí va el Sidebar */}
      <main className="app-content">
        <Outlet />      {/* 👈 aquí se carga Home, Perfil, etc */}
      </main>
    </div>
  );
}


