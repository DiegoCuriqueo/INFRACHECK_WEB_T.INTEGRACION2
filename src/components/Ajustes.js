import React from 'react';
import { User, Bell } from 'lucide-react';

const Ajustes = () => {
  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 sm:p-6">
      <div className="max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Configuración del Sistema
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Gestiona las preferencias de tu cuenta y notificaciones
          </p>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Cuenta */}
          <div className="bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer">
            <div className="flex items-center p-3 sm:p-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-white text-base sm:text-lg font-medium">Cuenta</span>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer">
            <div className="flex items-center p-3 sm:p-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <Bell className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-white text-base sm:text-lg font-medium">Notificaciones</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ajustes;