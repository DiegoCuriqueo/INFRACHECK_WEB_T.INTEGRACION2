import Sidebar from "../components/nav/SidebarAU";
import { useTheme } from "../themes/ThemeContext";

export default function AutorityLayout({ children }) {
  const { theme } = useTheme();
  // El ThemeContext ya aplica la clase 'dark' al elemento <html>
  // No necesitamos aplicarla aquí también, solo usamos el theme para re-renderizar
  return (
    <div key={theme} className="h-screen w-screen bg-white text-slate-900 dark:bg-[#0A0F1A] dark:text-slate-100">
      <div className="grid grid-cols-[270px_1fr] h-full">
        {/* Columna izquierda: sidebar fijo */}
        <Sidebar />

        {/* Columna derecha: contenido con scroll */}
        <main className="h-full overflow-auto bg-white dark:bg-[#0A0F1A]">
          {/* padding interior del panel derecho */}
          <div className="min-h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
