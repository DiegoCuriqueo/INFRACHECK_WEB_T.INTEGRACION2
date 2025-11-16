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
    // SIEMPRE prioriza localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      console.log('🎨 Tema desde localStorage:', savedTheme);
      return savedTheme;
    }
    
    // Por defecto usar 'light' en lugar de la preferencia del sistema
    console.log('🎨 Sin tema guardado, usando: light');
    const initialTheme = 'light';
    localStorage.setItem('theme', initialTheme);
    return initialTheme;
  });

  useEffect(() => {
    console.log('🎨 Aplicando tema:', theme);
    
    // Guarda el tema en localStorage
    localStorage.setItem('theme', theme);
    
    const root = document.documentElement;
    const body = document.body;
    
    // CRÍTICO: Limpia TODAS las clases de tema
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Aplica la clase al <html> Y al <body>
    root.classList.add(theme);
    body.classList.add(theme);
    
    // FUERZA el color-scheme en ambos elementos
    root.style.colorScheme = theme;
    body.style.colorScheme = theme;
    
    // FUERZA las variables CSS si existen
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      body.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      body.setAttribute('data-theme', 'light');
    }
    
    console.log('✅ HTML class:', root.className);
    console.log('✅ BODY class:', body.className);
    console.log('✅ Color scheme:', root.style.colorScheme);
  }, [theme]);

  // NO escuchar cambios del sistema - el usuario tiene control total
  const toggleTheme = () => {
    console.log('🔄 Toggle - Antes:', theme);
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('🔄 Toggle - Después:', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};