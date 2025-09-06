import React from 'react';
import { Card } from '../components/shared';

const HomePage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <h3 className="text-lg font-medium mb-2 text-white/90">Total Usuarios</h3>
        <p className="text-3xl font-bold text-indigo-400">12</p>
      </Card>
      <Card>
        <h3 className="text-lg font-medium mb-2 text-white/90">Reportes Activos</h3>
        <p className="text-3xl font-bold text-green-400">8</p>
      </Card>
      <Card>
        <h3 className="text-lg font-medium mb-2 text-white/90">Alertas</h3>
        <p className="text-3xl font-bold text-red-400">3</p>
      </Card>
    </div>
  );
};

export default HomePage;