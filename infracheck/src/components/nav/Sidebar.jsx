import { NavLink } from "react-router-dom";

const base =
  "flex items-center gap-3 px-4 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-700/60 transition";
const active = "bg-slate-700/60 text-white";

export default function Sidebar() {
  return (
    <aside className="h-full w-64 bg-slate-900/80 backdrop-blur-sm border-r border-slate-800 p-4">
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-indigo-600/80 grid place-content-center text-white">🚗</div>
        <div className="text-lg font-semibold text-slate-100">InfraCheck</div>
      </div>

      <nav className="space-y-1">
        <NavLink to="/autority/home" className={({isActive}) => `${base} ${isActive ? active : ""}`}>
          <span>🏠</span> <span>Home</span>
        </NavLink>
        <NavLink to="/autority/profile" className={({isActive}) => `${base} ${isActive ? active : ""}`}>
          <span>👤</span> <span>Perfil</span>
        </NavLink>
      </nav>

      <div className="mt-6">
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/80 text-slate-200 hover:bg-slate-700/70 transition">
          <span className="h-6 w-6 rounded-full bg-slate-600 inline-grid place-content-center text-white">●</span>
          <span>Persona</span>
        </button>
      </div>
    </aside>
  );
}
