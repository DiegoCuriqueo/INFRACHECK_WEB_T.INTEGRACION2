import React, { useState } from 'react';
import { User, Edit3, Trash2 } from 'lucide-react';

const Usuarios = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users] = useState([
    { id: 1, name: 'User 1', description: 'lorem ipsum dolor, consectetur...' },
    { id: 2, name: 'User 2', description: 'lorem ipsum dolor, consectetur...' },
    { id: 3, name: 'User 3', description: 'lorem ipsum dolor, consectetur...' },
    { id: 4, name: 'User 3', description: 'lorem ipsum dolor, consectetur...' },
    { id: 5, name: 'User 3', description: 'lorem ipsum dolor, consectetur...' },
    { id: 6, name: 'User 3', description: 'lorem ipsum dolor, consectetur...' },
    { id: 7, name: 'User 3', description: 'lorem ipsum dolor, consectetur...' },
    { id: 8, name: 'User 3', description: 'lorem ipsum dolor, consectetur...' },
    { id: 9, name: 'User 3', description: 'lorem ipsum dolor, consectetur...' },
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-center mb-6">Usuarios</h1>
          
          {/* Search Bar */}
          <div className="flex justify-center mb-8">
            <input
              type="text"
              placeholder="Barra de Búsqueda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg w-80 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{user.name}</h3>
                  <p className="text-gray-400 text-sm">{user.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-700 rounded transition-colors">
                  <Edit3 className="w-4 h-4 text-green-500" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
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