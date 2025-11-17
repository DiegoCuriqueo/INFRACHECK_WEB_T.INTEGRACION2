import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../themes/ThemeContext";

/* Base de estilos */
const baseItem =
  "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm " +
  "text-slate-700 dark:text-slate-300 " +
  "hover:text-slate-900 dark:hover:text-white " +
  "transition-colors";

const activeItem =
  "text-slate-900 bg-slate-100 ring-1 ring-slate-200 shadow-sm " +
  "dark:text-white dark:bg-slate-700/40 dark:ring-white/10";

/* Iconos */
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
      <path
        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 21a9 9 0 0 1 18 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  report: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3h18v18H3V3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 9h8M8 13h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  settings: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  map: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 6.5 9 4l6 2 6-2v13l-6 2-6-2-6 2V6.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 4v13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 6.5v13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ayuda: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M12 16h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.9.44-1.6 1.2-1.6 2.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  logout: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17l5-5-5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12H9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  sun: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 1v6m0 6v6m11-11h-6m-6 0H1m16.485-4.485l-4.242 4.242M11.757 11.757l-4.242 4.242m12.97 0l-4.242-4.242M11.757 12.243l-4.242-4.242"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  moon: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

/* NavItem que calcula color de ícono según isActive */
function NavItem({ to, icon: IconEl, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${baseItem} ${
          isActive
            ? activeItem
            : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md transition
              ${
                isActive
                  ? "bg-indigo-500 shadow-[0_0_10px_2px_rgba(99,102,241,0.6)]"
                  : "bg-transparent group-hover:bg-indigo-400/60"
              }`}
          />
          {IconEl(
            isActive
              ? "w-5 h-5 text-indigo-600 dark:text-white"
              : "w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-white"
          )}
          <span className="truncate min-w-0">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const items = [
    { to: "/user/home", label: "Home", icon: Icon.home },
    { to: "/user/reportes", label: "Reportes", icon: Icon.report },
    { to: "/user/perfil", label: "Perfil", icon: Icon.user },
    { to: "/user/map", label: "Mapa", icon: Icon.map },
    { to: "/user/ayuda", label: "Ayuda", icon: Icon.ayuda },
  ];

  const handleLogout = async () => {
    if (!window.confirm("¿Estás seguro que deseas cerrar sesión?")) return;

    try {
      await logout();
    } finally {
      navigate("/auth", { replace: true });
      window.scrollTo(0, 0);
    }
  };

  const userInitial = user?.username?.charAt(0).toUpperCase() || "U";
  const userName = user?.username || "Usuario";
  const userRole = user?.rous_nombre || "Usuario";

  return (
    <aside className="fixed top-0 left-0 h-screen w-[260px] bg-white dark:bg-[#0B1220] dark:bg-gradient-to-b dark:from-[#0B1220] dark:to-[#0A0F1A] border-r border-slate-200 dark:border-slate-800/80 px-4 py-5 flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6">
        <div className="h-14 w-14 rounded-2xl bg-slate-50 ring-1 ring-slate-200 grid place-content-center dark:bg-slate-900 dark:ring-white/10">
          <img
            src={theme === 'dark' ? "/logo1.png" : "/logoOscuro.png"}
            alt="InfraCheck"
            className="h-10 w-10 object-contain"
          />
        </div>

        <div>
          <div className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-100">
            InfraCheck
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300">
            Gestión de reportes
          </div>
        </div>
      </div>

      {/* Principal - Scroll */}
      <div className="flex-1 overflow-y-auto space-y-1">
        <p className="px-3 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400/70 mb-1">
          Principal
        </p>
        {items.map((item) => (
          <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
        ))}
      </div>

      <div className="my-5 border-t border-slate-200 dark:border-slate-800/70" />

      {/* Cuenta - Fixed al fondo */}
      <div className="space-y-3">
        <p className="px-3 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400/70">
          Cuenta
        </p>

        {/* Toggle tema */}

        {/* Info del Usuario */}
        <div className="px-3">
          <div className="w-full flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 px-3 py-2.5 ring-1 ring-slate-200 dark:ring-white/5">
            <span className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 grid place-content-center text-white text-sm font-semibold">
              {userInitial}
            </span>
            <div className="min-w-0 text-left flex-1">
              <p className="text-sm text-slate-900 dark:text-slate-100 leading-5 truncate">
                {userName}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 -mt-0.5">
                {userRole}
              </p>
            </div>
          </div>
        </div>

        {/* Modo Claro/Oscuro */}
        <div className="px-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/30 transition group"
            title={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
          >
            <span className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition">
              {theme === "light"
                ? Icon.moon("w-5 h-5")
                : Icon.sun("w-5 h-5")}
            </span>
            <span className="text-sm">
              {theme === "light" ? "Modo Oscuro" : "Modo Claro"}
            </span>
          </button>
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="px-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition group"
          >
            <span className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition">
              {Icon.logout("w-5 h-5")}
            </span>
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700/40 to-transparent" />
    </aside>
  );
}
