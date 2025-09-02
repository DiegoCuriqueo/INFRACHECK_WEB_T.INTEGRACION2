import React from 'react';

const Perfil = () => {
  return (
    <div className="flex-1 p-8 bg-gray-900">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Perfil de Usuario</h1>
      </div>
      
      {/* User Profile Content */}
      <div className="max-w-md mx-auto">
        {/* User Avatar */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-500">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Ricardo Peña</h2>
        </div>
        
        {/* Information Fields */}
        <div className="space-y-4">
          <div className="bg-blue-600 rounded-lg p-4 text-center">
            <span className="text-white font-medium">Correo Electronico</span>
          </div>
          <div className="bg-blue-600 rounded-lg p-4 text-center">
            <span className="text-white font-medium">Rut</span>
          </div>
          <div className="bg-blue-600 rounded-lg p-4 text-center">
            <span className="text-white font-medium">Dirección</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil; 