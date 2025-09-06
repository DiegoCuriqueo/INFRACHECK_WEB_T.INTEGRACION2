import React, { useState } from 'react';
import { User, Edit3, Trash2 } from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#161925] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.35)] p-6 ${className}`}>
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
    <div className="min-h-screen bg-[#1b1b1d] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Gestión de Usuarios</h1>
        
        <div className="space-y-6">
          {/* Search Bar */}
          <Card>
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f141c] text-white px-4 py-3 rounded-xl placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-indigo-200/20"
            />
          </Card>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="flex items-center justify-between hover:bg-[#1a1f2e] transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-600/30 rounded-full flex items-center justify-center border border-indigo-400/30">
                    <User className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{user.name}</h3>
                    <p className="text-gray-400 text-sm max-w-xs truncate">{user.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEdit(user.id)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="Editar usuario"
                  >
                    <Edit3 className="w-4 h-4 text-green-400" />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No se encontraron usuarios</h3>
                <p className="text-gray-400">Intenta con un término de búsqueda diferente</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuariosPage;