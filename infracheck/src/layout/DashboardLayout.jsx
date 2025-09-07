import Sidebar from "../components/nav/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen w-screen bg-[#0A0F1A] text-slate-100">
      <div className="grid grid-cols-[270px_1fr] h-full">
        {/* Columna izquierda: sidebar fijo */}
        <Sidebar />

        {/* Columna derecha: contenido con scroll */}
        <main className="h-full overflow-auto bg-[#0F1724]">
          {/* padding interior del panel derecho */}
          <div className="min-h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
