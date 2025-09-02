import React, { useState } from 'react';
import { User, Edit3, Trash2 } from 'lucide-react';

const Usuarios = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users] = useState([
    { id: 1, name: 'User 1', description: 'lorem ipsum dolor, consectetur...' },
    { id: 2, name: 'User 2', description: 'lorem ipsum dolor, consectetur...' },
    { id: 3, name: 'User 3', description: 'lorem ipsum dolor, consectetur...' },
    { id: 4, name: 'User 4', description: 'lorem ipsum dolor, consectetur...' },
    { id: 5, name: 'User 5', description: 'lorem ipsum dolor, consectetur...' },
    { id: 6, name: 'User 6', description: 'lorem ipsum dolor, consectetur...' },
    { id: 7, name: 'User 7', description: 'lorem ipsum dolor, consectetur...' },
    { id: 8, name: 'User 8', description: 'lorem ipsum dolor, consectetur...' },
    { id: 9, name: 'User 9', description: 'lorem ipsum dolor, consectetur...' },
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-center mb-2">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm sm:text-base">
            Administra y gestiona los usuarios del sistema
          </p>
          
          {/* Search Bar */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <input
              type="text"
              placeholder="Barra de Búsqueda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-200 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-gray-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-medium text-sm sm:text-base truncate">{user.name}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{user.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2">
                <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors">
                  <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                </button>
                <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Usuarios;