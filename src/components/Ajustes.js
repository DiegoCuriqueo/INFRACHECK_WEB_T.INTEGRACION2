import React from 'react';
import { User, Bell } from 'lucide-react';

const Ajustes = () => {
  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          {/* Cuenta */}
          <div className="bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer">
            <div className="flex items-center p-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-lg font-medium">Cuenta</span>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer">
            <div className="flex items-center p-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-lg font-medium">Notificaciones</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ajustes;