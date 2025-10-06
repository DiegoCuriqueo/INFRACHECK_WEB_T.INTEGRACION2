import React, { useMemo, memo, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

/* ----- Estilos ----- */
const baseItem =
  "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white transition";
const activeItem =
  "text-white bg-slate-700/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]";

/* ----- Iconos ----- */
const Icon = {
  home: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  user: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 21a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  report: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3h18v18H3V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  settings: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ----- NavItem (memo) ----- */
const NavItem = memo(function NavItem({ to, icon, label, active, exact }) {
  return (
    <NavLink
      to={to}
      end={!!exact}
      className={({ isActive }) =>
        `${baseItem} ${(active || isActive) ? activeItem : "hover:bg-slate-800/30"}`
      }
      aria-current={active ? "page" : undefined}
    >
      {({ isActive }) => {
        const on = active || isActive;
        return (
          <>
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md transition ${
                on ? "bg-indigo-500 shadow-[0_0_10px_2px_rgba(99,102,241,0.6)]"
                   : "bg-transparent group-hover:bg-indigo-400/60"
              }`}
            />
            {icon(on ? "w-5 h-5 text-white" : "w-5 h-5 text-slate-400 group-hover:text-white")}
            <span className="truncate min-w-0">{label}</span>
          </>
        );
      }}
    </NavLink>
  );
});

/* ----- Sidebar Usuario con guard DOM anti-duplicado ----- */
function SidebarUSER() {
  const { pathname } = useLocation();

  // Bloqueo inmediato por DOM: si ya hay un sidebar de usuario, no renderizamos otro
  if (typeof document !== "undefined" &&
      document.querySelector('aside[data-sidebar="user"]')) {
    return null;
  }

  // (opcional) marca global para depurar
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__sidebars = window.__sidebars || {};
      window.__sidebars.USER = true;
    }
    return () => {
      if (typeof window !== "undefined" && window.__sidebars) {
        window.__sidebars.USER = false;
      }
    };
  }, []);

  const items = useMemo(
    () => [
      { to: "/user/home",     label: "Home",     icon: Icon.home,    exact: true },
      { to: "/user/reportes", label: "Informes", icon: Icon.report },
      { to: "/user/perfil",   label: "Perfil",   icon: Icon.user },
      { to: "/user/map",      label: "Mapa",     icon: Icon.user },     // usa Icon.map si lo tienes
      { to: "/user/ayuda",    label: "Ayuda",    icon: Icon.user },     // usa Icon.ayuda si lo tienes
      { to: "/user/ajustes",  label: "Ajustes",  icon: Icon.settings },
    ],
    []
  );

  const isActive = (to, exact) =>
    exact ? pathname === to : (pathname === to || pathname.startsWith(to + "/"));

  return (
    <aside
      data-sidebar="user"            // << clave: selector único para el guard
      role="navigation"
      aria-label="Sidebar usuario"
      className="h-full w-[260px] bg-[#0B1220] bg-gradient-to-b from-[#0B1220] to-[#0A0F1A]
                 border-r border-slate-800/80 px-4 py-5 relative"
      // Si tienes un drawer móvil aparte, usa: "hidden md:block ..." para este aside
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-2 pb-6">
        <div className="h-10 w-10 rounded-2xl bg-indigo-600/90 grid place-content-center text-white shadow-lg ring-1 ring-white/10">
          🚗
        </div>
        <div>
          <div className="text-lg font-semibold leading-tight text-slate-100">InfraCheck</div>
          <div className="text-[11px] text-slate-400">Gestión de informes</div>
        </div>
      </div>

      {/* Principal */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] uppercase tracking-wider text-slate-400/70 mb-1">Principal</p>
        {items.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            exact={item.exact}
            active={isActive(item.to, item.exact)}
          />
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

export default memo(SidebarUSER);
