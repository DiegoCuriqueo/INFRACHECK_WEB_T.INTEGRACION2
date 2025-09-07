import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import ReportesPage from './pages/ReportesPage';
import UsuariosPage from './pages/UsuariosPage';
import PerfilPage from './pages/PerfilPage';
import AjustesPage from './pages/AjustesPage';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'usuarios':
        return <UsuariosPage />;
      case 'ajustes':
        return <AjustesPage />;
      case 'reportes':
        return <ReportesPage />;
      case 'perfil':
        return <PerfilPage />;
      default:
        return <HomePage />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'usuarios': return 'Gestión de Usuarios';
      case 'ajustes': return 'Configuración';
      case 'reportes': return 'Reportes y Estadísticas';
      case 'perfil': return 'Mi Perfil';
      default: return 'Dashboard Principal';
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Cerrar sidebar en móvil al cambiar de pestaña
  };

  return (
    <div className="min-h-screen bg-[#1b1b1d] text-white">
      {/* Header móvil */}
      <div className="lg:hidden bg-[#161925] border-b border-gray-700/50 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white truncate">{getPageTitle()}</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenedor principal */}
      <div className="relative">
        <div className="flex">
          {/* Sidebar */}
          <div className={`
            fixed lg:sticky top-0 left-0 z-50 h-full lg:h-auto
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={handleTabChange}
              onClose={() => setSidebarOpen(false)}
            />
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0 lg:ml-0">
            {/* Header desktop */}
            <div className="hidden lg:block bg-[#161925] border-b border-gray-700/50 px-6 py-4 mb-6">
              <h1 className="text-2xl font-bold text-white">{getPageTitle()}</h1>
            </div>

            {/* Contenido */}
            <div className="lg:px-0">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación inferior para móvil (alternativa) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#161925] border-t border-gray-700/50 px-4 py-2 z-30">
        <div className="flex justify-around">
          {[
            { key: 'home', icon: '🏠', label: 'Inicio' },
            { key: 'reportes', icon: '📊', label: 'Reportes' },
            { key: 'usuarios', icon: '👥', label: 'Usuarios' },
            { key: 'perfil', icon: '👤', label: 'Perfil' },
            { key: 'ajustes', icon: '⚙️', label: 'Ajustes' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleTabChange(item.key)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 ${
                activeTab === item.key
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Espaciado inferior para el nav móvil */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
};

export default App;