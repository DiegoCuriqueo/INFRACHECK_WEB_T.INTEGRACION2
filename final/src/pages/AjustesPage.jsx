import React, { useState } from 'react';
import { User, Bell, Shield, FileText, ChevronRight } from 'lucide-react';
import { Card, ToggleSwitch } from '../components/shared';

const AjustesPage = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reportes: true,
    alertas: true
  });

  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const ajustesOptions = [
    { 
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />, 
      title: 'Cuenta', 
      description: 'Gestiona tu información personal y preferencias',
      action: () => console.log('Navegar a cuenta')
    },
    { 
      icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />, 
      title: 'Notificaciones', 
      description: 'Configura alertas y notificaciones del sistema',
      action: () => console.log('Navegar a notificaciones')
    },
    { 
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />, 
      title: 'Seguridad', 
      description: 'Configuración de seguridad y privacidad',
      action: () => console.log('Navegar a seguridad')
    },
    { 
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />, 
      title: 'Reportes', 
      description: 'Configuración de reportes y exportaciones',
      action: () => console.log('Navegar a reportes')
    },
  ];

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 max-w-7xl mx-auto">
      {/* Opciones principales */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Configuraciones Generales</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {ajustesOptions.map((option, index) => (
            <Card 
              key={index} 
              className="hover:bg-[#1a1f2e] transition-colors cursor-pointer"
              onClick={option.action}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600/30 rounded-full flex items-center justify-center border border-indigo-400/30 flex-shrink-0">
                    <span className="text-indigo-400">{option.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white text-base sm:text-lg font-medium truncate">{option.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 leading-tight">{option.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Notificaciones */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Preferencias de Notificación</h2>
        <Card className="space-y-4">
          <ToggleSwitch 
            enabled={notifications.email}
            onToggle={() => toggleNotification('email')}
            label="Notificaciones por Email"
          />
          <ToggleSwitch 
            enabled={notifications.push}
            onToggle={() => toggleNotification('push')}
            label="Notificaciones Push"
          />
          <ToggleSwitch 
            enabled={notifications.reportes}
            onToggle={() => toggleNotification('reportes')}
            label="Alertas de Reportes"
          />
          <ToggleSwitch 
            enabled={notifications.alertas}
            onToggle={() => toggleNotification('alertas')}
            label="Alertas del Sistema"
          />
        </Card>
      </div>

      {/* Preferencias de aplicación */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Preferencias de Aplicación</h2>
        <Card className="space-y-4">
          <ToggleSwitch 
            enabled={darkMode}
            onToggle={() => setDarkMode(!darkMode)}
            label="Modo Oscuro"
          />
          <ToggleSwitch 
            enabled={autoSave}
            onToggle={() => setAutoSave(!autoSave)}
            label="Guardado Automático"
          />
          
          <div className="pt-4 border-t border-gray-700">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-white/90">Idioma</label>
                <select className="w-full bg-[#0f141c] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-indigo-200/20 text-sm sm:text-base">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-white/90">Zona Horaria</label>
                <select className="w-full bg-[#0f141c] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-indigo-200/20 text-sm sm:text-base">
                  <option value="america/santiago">Santiago (UTC-3)</option>
                  <option value="america/mexico_city">Ciudad de México (UTC-6)</option>
                  <option value="america/bogota">Bogotá (UTC-5)</option>
                  <option value="america/lima">Lima (UTC-5)</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-4">
        <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base">
          Guardar Cambios
        </button>
        <button className="sm:px-6 bg-gray-600 hover:bg-gray-500 text-white py-3 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base">
          Restablecer
        </button>
      </div>
    </div>
  );
};

export default AjustesPage;