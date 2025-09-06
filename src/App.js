import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import ReportesPage from './pages/ReportesPage';
import UsuariosPage from './pages/UsuariosPage';
import PerfilPage from './pages/PerfilPage';
import AjustesPage from './pages/AjustesPage';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');

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

  return (
    <div className="min-h-screen bg-[#1b1b1d] text-white">
      {/* Contenedor principal */}
      <div className="px-4 pb-10 pt-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Contenido principal */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;