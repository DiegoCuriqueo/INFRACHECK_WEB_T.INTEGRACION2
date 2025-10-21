import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Base de estilos
const baseItem =   "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white transition";
const activeItem = "text-white bg-slate-700/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]";

// Iconos
const Icon = {
  home: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  user: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 21a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),

  report: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M3 3h18v18H3V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  settings: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  perfil: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 21a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),

  logout: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

function NavItem({ to, icon: IconEl, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${baseItem} ${isActive ? activeItem : "hover:bg-slate-800/30"}`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md transition ${
              isActive
                ? "bg-indigo-500 shadow-[0_0_10px_2px_rgba(99,102,241,0.6)]"
                : "bg-transparent group-hover:bg-indigo-400/60"
            }`}
          />
          {IconEl(isActive ? "w-5 h-5 text-white" : "w-5 h-5 text-slate-400 group-hover:text-white")}
          <span className="truncate min-w-0">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function SidebarADM() {
  const { user, logout } = useAuth();

  const items = [
    { to: "/admin/home",     label: "Home",     icon: Icon.home },
    { to: "/admin/reportes", label: "Reportes", icon: Icon.report },
    { to: "/admin/profile",  label: "Perfil",   icon: Icon.perfil },
    { to: "/admin/usuarios", label: "Usuarios", icon: Icon.user },
    { to: "/admin/ajustes",  label: "Ajustes",  icon: Icon.settings },
  ];

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
    }
  };

  // Obtener datos del usuario
  const userInitial = user?.username?.charAt(0).toUpperCase() || 'A';
  const userName = user?.username || 'Admin';
  const userRole = user?.rous_nombre || 'Administrador';

  return (
    <aside className="h-full w-[260px] bg-[#0B1220] bg-gradient-to-b from-[#0B1220] to-[#0A0F1A] border-r border-slate-800/80 px-4 py-5 relative flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 px-2 pb-6">
        <div className="h-10 w-10 rounded-2xl bg-indigo-600/90 grid place-content-center text-white shadow-lg ring-1 ring-white/10">
          <img src="/logo1.png" alt="InfraCheck" className="h-full w-full object-contain" />
        </div>

        <div>
          <div className="text-lg font-semibold leading-tight text-slate-100">InfraCheck</div>
          <div className="text-[11px] text-slate-400">Gestión de reportes</div>
        </div>
      </div>

      {/* Sección principal - Scroll */}
      <div className="flex-1 overflow-y-auto space-y-1">
        <p className="px-3 text-[11px] uppercase tracking-wider text-slate-400/70 mb-1">Principal</p>
        
        {items.map(item => (
          <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
        ))}
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-slate-800/70" />

      {/* Cuenta - Fixed al fondo */}
      <div className="space-y-3">
        <p className="px-3 text-[11px] uppercase tracking-wider text-slate-400/70">Cuenta</p>
        
        {/* Info del Usuario */}
        <div className="px-3">
          <div className="w-full flex items-center gap-3 rounded-2xl bg-slate-800/40 px-3 py-2.5 ring-1 ring-white/5">
            <span className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 grid place-content-center text-white text-sm font-semibold">
              {userInitial}
            </span>
            <div className="min-w-0 text-left flex-1">
              <p className="text-sm text-slate-100 leading-5 truncate">{userName}</p>
              <p className="text-[11px] text-slate-400 -mt-0.5">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="px-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300 hover:text-white hover:bg-red-500/10 transition group"
          >
            <span className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition">
              {Icon.logout("w-5 h-5")}
            </span>
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Borde interior */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-slate-700/40 to-transparent" />
    </aside>
  );
}