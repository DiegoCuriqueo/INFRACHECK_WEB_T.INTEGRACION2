import { Link, usePage } from "@inertiajs/react";

/* Base de estilos */
const baseItem   = "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white transition";
const activeItem = "text-white bg-slate-700/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]";

/* Iconos */
const Icon = {
  home: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  user: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M3 21a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  report: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M3 3h18v18H3V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  settings: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  map: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M3 6.5 9 4l6 2 6-2v13l-6 2-6-2-6 2V6.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 4v13"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 6.5v13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ayuda: (c="") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M12 16h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.9.44-1.6 1.2-1.6 2.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
};

/* NavItem que calcula color de ícono según isActive */
function NavItem({ to, icon: IconEl, label }) {
  const { url } = usePage();
  const normalize = (s) => (s || "").split("?")[0].replace(/\/+$/, "");
  const isActive = (() => {
    const current = normalize(url);
    const target = normalize(to);
    return current === target || current.startsWith(`${target}/`);
  })();

  return (
    <Link
      href={to}
      className={`${baseItem} ${isActive ? activeItem : "hover:bg-slate-800/30"}`}
    >
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md transition ${
          isActive
            ? "bg-indigo-500 shadow-[0_0_10px_2px_rgba(99,102,241,0.6)]"
            : "bg-transparent group-hover:bg-indigo-400/60"
        }`}
      />
      {IconEl(isActive ? "w-5 h-5 text-white" : "w-5 h-5 text-slate-400 group-hover:text-white")}
      <span className="truncate min-w-0">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const items = [
    { to: "/user/home",    label: "Home",    icon: Icon.home },
    { to: "/user/reportes",label: "Reportes",icon: Icon.report },
    { to: "/user/perfil",  label: "Perfil",  icon: Icon.user },
    { to: "/user/map",     label: "Mapa",    icon: Icon.map },
    { to: "/user/ayuda",   label: "Ayuda",   icon: Icon.ayuda }, 
    { to: "/user/ajustes", label: "Ajustes", icon: Icon.settings },
  ];

  return (
    <aside className="h-full w-[260px] bg-[#0B1220] bg-gradient-to-b from-[#0B1220] to-[#0A0F1A] border-r border-slate-800/80 px-4 py-5 relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 pb-6">
        <div className="h-10 w-10 rounded-2xl bg-indigo-600/90 grid place-content-center text-white shadow-lg ring-1 ring-white/10">
          🚗
        </div>
        <div>
          <div className="text-lg font-semibold leading-tight text-slate-100">InfraCheck</div>
          <div className="text-[11px] text-slate-400">Gestión de reportes</div>
        </div>
      </div>

      {/* Principal */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] uppercase tracking-wider text-slate-400/70 mb-1">Principal</p>
        {items.map(item => (
          <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
        ))}
      </div>

      <div className="my-5 border-t border-slate-800/70" />

      {/* Cuenta */}
      <div className="space-y-3">
        <p className="px-3 text-[11px] uppercase tracking-wider text-slate-400/70">Cuenta</p>
        <div className="px-3">
          <button className="w-full flex items-center gap-3 rounded-2xl bg-slate-800/40 hover:bg-slate-700/40 transition px-3 py-2.5 ring-1 ring-white/5">
            <span className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 grid place-content-center text-white text-sm font-semibold">
              P
            </span>
            <div className="min-w-0 text-left">
              <p className="text-sm text-slate-100 leading-5">Persona</p>
              <p className="text-[11px] text-slate-400 -mt-0.5">Usuario</p>
            </div>
            <span className="ml-auto text-xs rounded-full px-2 py-0.5 bg-slate-700/60 text-slate-300">
              Activo
            </span>
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-slate-700/40 to-transparent" />
    </aside>
  );
}
