import React from 'react';
import { useTheme } from './ThemeContext';

const Sun = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 1v6m0 6v6m11-11h-6m-6 0H1m16.485-4.485l-4.242 4.242M11.757 11.757l-4.242 4.242m12.97 0l-4.242-4.242M11.757 12.243l-4.242-4.242" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const Moon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="h-10 w-10 grid place-content-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-1 ring-slate-300 dark:ring-white/10 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}