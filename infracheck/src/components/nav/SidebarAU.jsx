import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../themes/ThemeContext";

// Base de estilos
const baseItem =
  "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors " +
  "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/40";
const activeItem =
  "text-slate-900 bg-slate-100 ring-1 ring-slate-200 shadow-sm dark:text-white dark:bg-slate-700/40 dark:ring-white/10";

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

  projects: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="4" width="7" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="13" width="7" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),

  logout: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  sun: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  moon: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function NavItem({ to, icon: IconEl, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${baseItem} ${isActive ? activeItem : ''}`}
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md transition ${
              isActive ? "bg-violet-500 shadow-[0_0_10px_2px_rgba(139,92,246,0.6)]" : "bg-transparent group-hover:bg-violet-400/60"
            }`}
          />
          {IconEl(isActive ? "w-5 h-5 text-violet-600 dark:text-white" : "w-5 h-5 text-slate-500 group-hover:text-slate-700 dark:text-slate-300")}
          <span className={`truncate min-w-0 ${isActive ? 'font-medium' : ''}`}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function SidebarAU() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const items = [
    { to: "/autority/home",      label: "Home",      icon: Icon.home },
    { to: "/autority/reportes",  label: "Reportes",  icon: Icon.report },
    { to: "/autority/profile",   label: "Perfil",    icon: Icon.user },
    { to: "/autority/proyectos", label: "Proyectos", icon: Icon.projects },
  ];

  const handleLogout = async () => {
    if (!window.confirm('¿Estás seguro que deseas cerrar sesión?')) return;

    try {
      await logout();
    } finally {
      navigate("/auth", { replace: true });
      window.scrollTo(0, 0);
    }
  };

  // Obtener datos del usuario
  const userInitial = user?.username?.charAt(0).toUpperCase() || 'M';
  const userName = user?.username || 'Municipal';
  const userRole = user?.rous_nombre || 'Autoridad';

  return (
    <aside className={`relative h-full w-[260px] px-4 py-5 flex flex-col ${theme === 'dark' ? 'bg-[#0B1220] bg-gradient-to-b from-[#0B1220] to-[#0A0F1A] border-r border-slate-800/80' : 'bg-white border-r border-slate-200'}`}>

      {/* Header */}
      <div className="flex items-center gap-3 px-0 pb-6">
        <div className={`${theme === 'dark' ? 'bg-slate-800 ring-1 ring-white/20' : 'bg-slate-100 ring-1 ring-slate-200'} h-14 w-14 rounded-2xl grid place-content-center`}>
          <img src={theme === 'dark' ? '/logo2.png' : '/logo1.png'} alt="InfraCheck" className={`${theme === 'dark' ? 'opacity-100' : ''} h-10 w-10 object-contain`} />
        </div>
        <div>
          <div className={`text-lg font-semibold leading-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>InfraCheck</div>
          <div className={`text-[11px] ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>Gestión de reportes</div>
        </div>
      </div>

      {/* Sección principal - Scroll */}
      <div className="flex-1 overflow-y-auto space-y-1">
        <p className={`px-3 text-[11px] uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400/70' : 'text-slate-500'} mb-1`}>Principal</p>

        {items.map(item => (
          <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
        ))}
      </div>

      {/* Divider */}
      <div className={`my-5 border-t ${theme === 'dark' ? 'border-slate-800/70' : 'border-slate-200'}`} />

      {/* Cuenta - Fixed al fondo */}
      <div className="space-y-3">
        <p className={`px-3 text-[11px] uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400/70' : 'text-slate-500'}`}>Cuenta</p>

        {/* Info del Usuario */}
        <div className="px-3">
          <div className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 ring-1 ${theme === 'dark' ? 'bg-slate-800/40 ring-white/5' : 'bg-slate-100 ring-slate-200'}`}>
            <span className="h-8 w-8 rounded-full bg-violet-600 grid place-content-center text-white text-sm font-semibold">
              {userInitial}
            </span>
            <div className="min-w-0 text-left flex-1">
              <p className={`text-sm leading-5 truncate ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{userName}</p>
              <p className={`text-[11px] -mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{userRole}</p>
            </div>
          </div>
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="px-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-100 transition group dark:text-slate-300 dark:hover:bg-slate-700/40"
          >
            <span className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition dark:text-slate-300">
              {theme === "dark" ? Icon.sun("w-5 h-5") : Icon.moon("w-5 h-5")}
            </span>
            <span className="text-sm">{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>
        </div>
        <div className="px-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-100 transition group dark:text-slate-300 dark:hover:bg-slate-700/40"
          >
            <span className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition dark:text-slate-300">
              {Icon.logout("w-5 h-5")}
            </span>
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Borde interior para depth */}
      <div className={`pointer-events-none absolute inset-y-0 right-0 w-px ${theme === 'dark' ? 'bg-gradient-to-b from-transparent via-slate-700/40 to-transparent' : 'bg-gradient-to-b from-transparent via-slate-200 to-transparent'}`} />
    </aside>
  );
}