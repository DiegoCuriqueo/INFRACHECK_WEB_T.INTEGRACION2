import React, { useState } from 'react';
import { User, Edit3, Trash2 } from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#161925] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.35)] p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const UsuariosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users] = useState([
    { id: 1, name: 'Juan Pérez', description: 'Administrador del sistema, gestiona usuarios y reportes...' },
    { id: 2, name: 'María García', description: 'Usuario activo, reporta incidencias frecuentemente...' },
    { id: 3, name: 'Carlos López', description: 'Supervisor de zona norte, valida reportes...' },
    { id: 4, name: 'Ana Martínez', description: 'Técnico especializado en infraestructura vial...' },
    { id: 5, name: 'Pedro Rodríguez', description: 'Usuario ciudadano, reporta baches y señalización...' },
    { id: 6, name: 'Laura Sánchez', description: 'Coordinadora municipal, gestiona prioridades...' },
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (userId) => {
    console.log('Editar usuario:', userId);
    // Aquí puedes agregar la lógica para editar usuario
  };

  const handleDelete = (userId) => {
    console.log('Eliminar usuario:', userId);
    // Aquí puedes agregar la lógica para eliminar usuario
  };

  return (
    <div className="min-h-screen bg-[#1b1b1d] text-white">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Gestión de Usuarios</h1>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Search Bar */}
          <Card>
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f141c] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-indigo-200/20 text-sm sm:text-base"
            />
          </Card>

          {/* Users Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:bg-[#1a1f2e] transition-colors">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600/30 rounded-full flex items-center justify-center border border-indigo-400/30 flex-shrink-0 mt-1 sm:mt-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-medium text-sm sm:text-base line-clamp-1">{user.name}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 leading-tight mt-1">{user.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                    <button 
                      onClick={() => handleEdit(user.id)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
                      title="Editar usuario"
                    >
                      <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors w-8 h-8 flex items-center justify-center"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card>
              <div className="text-center py-6 sm:py-8">
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-white mb-2">No se encontraron usuarios</h3>
                <p className="text-gray-400 text-sm sm:text-base">Intenta con un término de búsqueda diferente</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuariosPage;