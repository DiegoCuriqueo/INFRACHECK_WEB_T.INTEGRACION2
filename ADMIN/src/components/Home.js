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
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-900">
      {/* Page Title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">
          Dashboard Principal
        </h1>
        <p className="text-gray-400 text-center mt-2 text-sm sm:text-base">
          Resumen general de estadísticas y métricas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* User Report Chart */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
          <h3 className="text-white text-base sm:text-lg font-semibold mb-3 sm:mb-4">Informe de usuarios</h3>
          <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF" 
                fontSize={12}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Reports Chart */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
          <h3 className="text-white text-base sm:text-lg font-semibold mb-3 sm:mb-4">Informe de Reportes</h3>
          <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF" 
                fontSize={12}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="reports" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Visits Chart */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 md:col-span-2 xl:col-span-1">
          <h3 className="text-white text-base sm:text-lg font-semibold mb-3 sm:mb-4">Informe de Visitas</h3>
          <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF" 
                fontSize={12}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Home; 