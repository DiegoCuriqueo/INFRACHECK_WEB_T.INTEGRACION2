import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/shared';

const ReportesPage = () => {
  const data = [
    { name: 'Ene', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 200 },
    { name: 'Abr', value: 278 },
    { name: 'May', value: 189 },
    { name: 'Jun', value: 239 },
  ];

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4 text-white">Estadísticas de Reportes</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#161925', 
              border: '1px solid #374151',
              color: '#F9FAFB',
              borderRadius: '12px'
            }} 
          />
          <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ReportesPage;