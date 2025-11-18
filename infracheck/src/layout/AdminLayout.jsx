// src/layout/AdminLayout.jsx
import Sidebar from "../components/nav/SidebarADM";
import { useTheme } from "../themes/ThemeContext";

export default function AdminLayout({ children }) {
  const { theme } = useTheme();

  return (
    <div
      className={`relative h-screen w-screen ${
        theme === "dark"
          ? "bg-[#0A0F1A] text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="grid grid-cols-[270px_1fr] h-full">
        {/* Columna izquierda: sidebar fijo */}
        <Sidebar />

        {/* Columna derecha: contenido con scroll */}
        <main
          className={`h-full overflow-auto ${
            theme === "dark" ? "bg-[#0A0F1A]" : "bg-slate-50"
          }`}
        >
          {/* padding interior del panel derecho */}
          <div className="min-h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}