// components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, getUserRole } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 🎯 OBTENER ROL CONSISTENTEMENTE
  const userRole = getUserRole();
  
  // Si la ruta tiene restricción de roles y el rol del user no está
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirige al home según su rol real
    const roleRoutes = {
      "USER": "/user/home",
      "AUTORIDAD": "/autority/home", 
      "ADMIN": "/admin/home"
    };
    
    const redirectTo = roleRoutes[userRole] || "/inicio";
    return <Navigate to={redirectTo} replace />;
  }

  // Tiene permiso → deja renderizar las rutas hijas
  return <Outlet />;
}