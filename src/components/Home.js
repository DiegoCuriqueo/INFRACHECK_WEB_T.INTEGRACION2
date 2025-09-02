import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Home = () => {
  const data = [
    { month: 'Ene', users: 65, reports: 45, visits: 120 },
    { month: 'Feb', users: 78, reports: 52, visits: 135 },
    { month: 'Mar', users: 90, reports: 68, visits: 150 },
    { month: 'Abr', users: 85, reports: 75, visits: 140 },
    { month: 'May', users: 95, reports: 82, visits: 165 },
    { month: 'Jun', users: 88, reports: 78, visits: 155 },
    { month: 'Jul', users: 102, reports: 85, visits: 175 },
    { month: 'Ago', users: 95, reports: 90, visits: 160 },
    { month: 'Sep', users: 110, reports: 95, visits: 180 }
  ];

  return (
    <div className="flex-1 p-8 bg-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Report Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-4">Informe de usuarios</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Reports Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-4">Informe de Reportes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="reports" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Visits Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-4">Informe de Visitas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Home; 