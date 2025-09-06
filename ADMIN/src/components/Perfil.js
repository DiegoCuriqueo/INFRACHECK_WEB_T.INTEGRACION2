import React from 'react';

const Perfil = () => {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-900">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          Perfil de Usuario
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Información personal y datos de la cuenta
        </p>
      </div>
      
      {/* User Profile Content */}
      <div className="max-w-sm sm:max-w-md mx-auto">
        {/* User Avatar */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 sm:border-4 border-blue-500">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Ricardo Peña</h2>
        </div>
        
        {/* Information Fields */}
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-blue-600 rounded-lg p-3 sm:p-4 text-center">
            <span className="text-white font-medium text-sm sm:text-base">Correo Electronico</span>
          </div>
          <div className="bg-blue-600 rounded-lg p-3 sm:p-4 text-center">
            <span className="text-white font-medium text-sm sm:text-base">Rut</span>
          </div>
          <div className="bg-blue-600 rounded-lg p-3 sm:p-4 text-center">
            <span className="text-white font-medium text-sm sm:text-base">Dirección</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil; 