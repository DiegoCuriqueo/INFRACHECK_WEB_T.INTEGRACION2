import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // SIEMPRE prioriza localStorage sobre la preferencia del sistema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      console.log('🎨 Tema desde localStorage:', savedTheme);
      return savedTheme;
    }
    
    // Si no hay tema guardado, usa la preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('🎨 Preferencia del sistema:', prefersDark ? 'dark' : 'light');
    const initialTheme = prefersDark ? 'dark' : 'light';
    
    // Guarda la preferencia inicial
    localStorage.setItem('theme', initialTheme);
    return initialTheme;
  });

  useEffect(() => {
    console.log('🎨 Aplicando tema:', theme);
    
    // Guarda el tema en localStorage
    localStorage.setItem('theme', theme);
    
    const root = document.documentElement;
    
    // Limpia todas las clases relacionadas con tema
    root.classList.remove('light', 'dark');
    
    // Aplica la clase correspondiente
    root.classList.add(theme);
    
    // CRÍTICO: Fuerza el color-scheme para override del navegador
    root.style.colorScheme = theme;
    
    console.log('🎨 Clases en <html>:', root.className);
    console.log('🎨 Color scheme:', root.style.colorScheme);
  }, [theme]);

  // Escuchar cambios en la preferencia del sistema SOLO si no hay tema guardado
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem('theme');
      // Solo actualiza si NO hay tema guardado (usuario nunca usó el toggle)
      if (!savedTheme) {
        console.log('🎨 Sistema cambió a:', e.matches ? 'dark' : 'light');
        setTheme(e.matches ? 'dark' : 'light');
      } else {
        console.log('🎨 Sistema cambió pero ignorado (hay tema manual guardado)');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    console.log('🎨 Toggle theme - Antes:', theme);
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('🎨 Toggle theme - Después:', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};