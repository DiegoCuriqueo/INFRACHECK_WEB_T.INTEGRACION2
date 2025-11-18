// components/DynamicNavigation.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DynamicNavigation() {
  const { user, logout, getUserRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = getUserRole();

  // Rutas según el rol - COMPATIBLE con tu estructura
  const roleBasedRoutes = {
    "USER": [
      { path: "/user/home", label: "Inicio" },
      { path: "/user/map", label: "Mapa" },
      { path: "/user/reportes", label: "Reportes" },
      { path: "/user/perfil", label: "Perfil" },
    ],
    "AUTORIDAD": [
      { path: "/autority/home", label: "Inicio" },
      { path: "/autority/reportes", label: "Reportes" },
      { path: "/autority/proyectos", label: "Proyectos" },
      { path: "/autority/profile", label: "Perfil" },
    ],
    "ADMIN": [
      { path: "/admin/home", label: "Dashboard" },
      { path: "/admin/usuarios", label: "Usuarios" },
      { path: "/admin/reportes", label: "Reportes" },
      { path: "/admin/profile", label: "Perfil" },
    ]
  };

  const handleLogout = () => {
    logout();
    navigate("/inicio");
  };

  if (!user) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/inicio" className="font-bold text-xl">
              TuApp
            </Link>
            <div className="flex space-x-4">
              <Link 
                to="/inicio" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === "/inicio" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Inicio
              </Link>
              <Link 
                to="/auth" 
                className="px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
              >
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const userRoutes = roleBasedRoutes[userRole] || [];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={userRoutes[0]?.path || "/inicio"} 
            className="font-bold text-xl"
          >
            TuApp - {user.username}
          </Link>

          {/* Navegación */}
          <div className="flex items-center space-x-4">
            {userRoutes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === route.path
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {route.label}
              </Link>
            ))}
            
            {/* Menú de usuario */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                <span>{user.username}</span>
                <span>▼</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  to={`/${userRole?.toLowerCase()}/ajustes`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Ajustes
                </Link>
                <Link
                  to={`/${userRole?.toLowerCase()}/ayuda`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Ayuda
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}