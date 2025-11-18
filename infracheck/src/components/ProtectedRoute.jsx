import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  // No logueado → al login
  if (!user) return <Navigate to="/auth" replace />;

  // Si la ruta tiene restricción de roles y el rol del user no está
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirige al home según su rol real
    switch (user.role) {
      case "USER":
        return <Navigate to="/user/home" replace />;
      case "AUTORIDAD":
        return <Navigate to="/autority/home" replace />;
      case "ADMIN":
        return <Navigate to="/admin/home" replace />;
      default:
        return <Navigate to="/inicio" replace />;
    }
  }

  // Tiene permiso → deja renderizar las rutas hijas
  return <Outlet />;
}
