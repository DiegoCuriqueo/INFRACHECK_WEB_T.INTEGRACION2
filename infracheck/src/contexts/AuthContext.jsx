// src/contexts/AuthContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, logoutUser, getUserData, isAuthenticated as isAuthSrv, isTokenValid } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Inicializar autenticación al cargar
  useEffect(() => {
    const initializeAuth = () => {
      if (isTokenValid()) {
        const storedToken = localStorage.getItem("token");
        const userData = getUserData();
        setToken(storedToken);
        setUser(userData);
      } else {
        // Token inválido - limpiar
        logoutUser();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Sincroniza cuando cambie localStorage (otro tab)
  useEffect(() => {
    const handler = () => {
      if (isTokenValid()) {
        setToken(localStorage.getItem("token"));
        setUser(getUserData());
      } else {
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const refreshFromStorage = useCallback(() => {
    if (isTokenValid()) {
      setToken(localStorage.getItem("token"));
      setUser(getUserData());
    } else {
      setToken(null);
      setUser(null);
    }
  }, []);

  const login = useCallback(async ({ rut, password }) => {
    setLoading(true);
    try {
      await loginUser({ rut, password });
      refreshFromStorage();
    } finally {
      setLoading(false);
    }
  }, [refreshFromStorage]);

  const logout = useCallback(() => {
    setLoading(true);
    logoutUser();
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  // 🎯 FUNCIONES MEJORADAS PARA MANEJO DE ROLES
  const hasRole = useCallback((roleName) => {
    if (!user) return false;
    
    // Intenta con diferentes propiedades donde pueda estar el rol
    const userRole = user.role || user.rol || user.rol_nombre;
    return userRole?.toLowerCase() === roleName.toLowerCase();
  }, [user]);

  const getUserRole = useCallback(() => {
    if (!user) return null;
    return user.role || user.rol || user.rol_nombre;
  }, [user]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: !!token && isAuthSrv(),
    login,
    logout,
    refreshFromStorage,
    hasRole,
    getUserRole, // 🆕 Nueva función útil
  }), [token, user, loading, login, logout, refreshFromStorage, hasRole, getUserRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}