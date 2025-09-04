import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";
import logo from "../assets/logo.svg"; // cambia si tu archivo es .png

const links = [
  { to: "/", label: "Home", icon: "🏠", end: true },
  { to: "/reportes", label: "Reportes", icon: "⚠️" },
  { to: "/perfil", label: "Perfil", icon: "👤" },
  { to: "/ajustes", label: "Ajustes", icon: "⚙️" },
];

export default function Sidebar() {
  return (
    <aside className="sb">
      {/* Marca */}
      <div className="sb-brand">
        <img src={logo} alt="InfraCheck" />
        <span>InfraCheck</span>
      </div>

      {/* Panel nav */}
      <div className="sb-panel">
        <nav className="sb-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `sb-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sb-ico" aria-hidden>
                {l.icon}
              </span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Usuario */}
        <div className="sb-user">
          <div className="sb-avatar" />
          <span>Persona</span>
        </div>
      </div>
    </aside>
  );
}

