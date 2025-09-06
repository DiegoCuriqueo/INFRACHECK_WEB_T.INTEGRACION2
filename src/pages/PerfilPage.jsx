import React from 'react';
import { User } from 'lucide-react';
import { Card, Badge } from '../components/shared';

const PerfilPage = () => {
  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-6 mb-6">
        <div className="w-20 h-20 bg-indigo-600/30 rounded-full flex items-center justify-center border border-indigo-400/30">
          <User className="w-10 h-10 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Administrador</h2>
          <p className="text-gray-400">admin@infracheck.com</p>
          <Badge>Administrador Principal</Badge>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2 text-white/90">Nombre Completo</label>
          <input
            type="text"
            value="Administrador"
            className="w-full bg-[#0f141c] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-indigo-200/20"
          />
        </div>
        <div>
          <label className="block text-sm mb-2 text-white/90">Email</label>
          <input
            type="email"
            value="admin@infracheck.com"
            className="w-full bg-[#0f141c] text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-indigo-200/20"
          />
        </div>
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition-colors mt-6">
          Actualizar Perfil
        </button>
      </div>
    </Card>
  );
};

export default PerfilPage;