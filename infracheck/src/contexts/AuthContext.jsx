// src/contexts/AuthContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, logoutUser, getUserData, isAuthenticated as isAuthSrv } from "../services/authService";

/**
 * Estructura del contexto:
 * {
 *   token, user,
 *   isAuthenticated,
 *   login({ rut, password }), logout(),
 *   refreshFromStorage(), hasRole(roleName)
 * }
 * 
 * Funcion del authContext:
 * Sirve para guardar y compartir en toda la aplicacion 
 * quién es el usuario logueado (user)
 * su token (token)
 * si está autenticado (isAuthenticated)
 * qué rol tiene (Usuario, Autoridad, Admin, etc.)
 * y funciones útiles como login(), logout() o hasRole()
 * 
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => getUserData());

  // Sincroniza cuando cambie localStorage (otro tab o logout interno)
  useEffect(() => {
    const handler = () => {
      setToken(localStorage.getItem("token"));
      setUser(getUserData());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Relee desde localStorage (útil tras login/registro)
  const refreshFromStorage = useCallback(() => {
    setToken(localStorage.getItem("token"));
    setUser(getUserData());
  }, []);

  const login = useCallback(async ({ rut, password }) => {
    await loginUser({ rut, password });     // guarda token y user_data en localStorage
    refreshFromStorage();
  }, [refreshFromStorage]);

  const logout = useCallback(() => {
    logoutUser();                           // limpia localStorage (token + user_data)
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback((roleName) => {
    // Ajusta según la forma de tu user_data (ej: user.rol?.rol_nombre)
    return Boolean(
      user &&
      (user.rol_nombre?.toLowerCase?.() === roleName.toLowerCase() ||
       user.rol?.rol_nombre?.toLowerCase?.() === roleName.toLowerCase())
    );
  }, [user]);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token && isAuthSrv(),
    login,
    logout,
    refreshFromStorage,
    hasRole,
  }), [token, user, login, logout, refreshFromStorage, hasRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
