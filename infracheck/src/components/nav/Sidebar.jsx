import { NavLink } from "react-router-dom";

const itemBase = "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/60 transition";
const itemActive = "bg-slate-700/60 text-white shadow-inner";

const Icon = {
  home:(c="")=>(<svg className={c} viewBox="0 0 24 24" fill="none"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  user:(c="")=>(<svg className={c} viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" stroke="currentColor" strokeWidth="1.6"/><path d="M3 21a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
};

export default function Sidebar() {
  return (
    <aside className="h-full w-[270px] bg-[#0E1420] border-r border-slate-800 px-4 py-5">
      <div className="flex items-center gap-3 px-2 pb-5">
        <div className="h-11 w-11 rounded-full bg-indigo-600/90 grid place-content-center text-white shadow-lg">🚗</div>
        <div className="text-xl font-semibold text-slate-100">InfraCheck</div>
      </div>

      <nav className="space-y-2">
        <NavLink to="/autority/home" className={({isActive}) => `${itemBase} ${isActive?itemActive:""}`}>
          {Icon.home("w-5 h-5 text-slate-400 group-hover:text-white")}
          <span>Home</span>
        </NavLink>
        <NavLink to="/autority/profile" className={({isActive}) => `${itemBase} ${isActive?itemActive:""}`}>
          {Icon.user("w-5 h-5 text-slate-400 group-hover:text-white")}
          <span>Perfil</span>
        </NavLink>
      </nav>

      <div className="mt-6">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/60 text-slate-200 hover:bg-slate-700/70 transition">
          <span className="h-6 w-6 rounded-full bg-slate-500 inline-grid place-content-center text-white">●</span>
          <span>Persona</span>
        </button>
      </div>
    </aside>
  );
}
