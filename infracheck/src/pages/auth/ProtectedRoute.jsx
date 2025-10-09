// src/components/auth/ProtectedRoute.jsx
// proteccion de rutas.. en desarrollo
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Uso:
 * <Route element={<ProtectedRoute redirect="/auth" />}>
 *   <Route path="/panel" element={<Panel />} />
 * </Route>
 */
export default function ProtectedRoute({ redirect = "/auth" }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to={redirect} replace />;
  return <Outlet />;
}
