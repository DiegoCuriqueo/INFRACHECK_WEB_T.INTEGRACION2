import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../components/shared';

const HomePage = () => {
  // Datos para los gráficos con más detalle
  const usuariosData = [
    { name: 'Feb', value: 5, nuevos: 2 },
    { name: 'Mar', value: 7, nuevos: 2 },
    { name: 'Abr', value: 9, nuevos: 2 },
    { name: 'May', value: 8, nuevos: -1 },
    { name: 'Jun', value: 10, nuevos: 2 },
    { name: 'Jul', value: 11, nuevos: 1 },
    { name: 'Ago', value: 12, nuevos: 1 },
    { name: 'Sep', value: 14, nuevos: 2 }
  ];

  const reportesData = [
    { name: 'Feb', value: 3, resueltos: 1 },
    { name: 'Mar', value: 5, resueltos: 2 },
    { name: 'Abr', value: 7, resueltos: 3 },
    { name: 'May', value: 6, resueltos: 4 },
    { name: 'Jun', value: 9, resueltos: 2 },
    { name: 'Jul', value: 8, resueltos: 5 },
    { name: 'Ago', value: 10, resueltos: 3 },
    { name: 'Sep', value: 12, resueltos: 4 }
  ];

  const visitasData = [
    { name: 'Feb', value: 120, unicas: 85 },
    { name: 'Mar', value: 150, unicas: 110 },
    { name: 'Abr', value: 180, unicas: 125 },
    { name: 'May', value: 160, unicas: 105 },
    { name: 'Jun', value: 200, unicas: 140 },
    { name: 'Jul', value: 190, unicas: 135 },
    { name: 'Ago', value: 220, unicas: 165 },
    { name: 'Sep', value: 240, unicas: 180 }
  ];

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white text-sm font-medium">{`${label}`}</p>
          <p className="text-blue-400 text-sm">
            {`Valor: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen p-4 space-y-8">
      {/* Header del Dashboard */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Principal</h1>
        <p className="text-gray-400">Resumen general del sistema InfraCheck</p>
      </div>

      {/* Tarjetas de estadísticas principales con más detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-white/90">Total Usuarios</h3>
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <span className="text-indigo-400 text-xl">👤</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-indigo-400 mb-2">12</p>
          <div className="flex items-center text-sm">
            <span className="text-green-400 font-medium">+2</span>
            <span className="text-gray-400 ml-2">este mes</span>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Activos: 10</span>
              <span>Nuevos: 2</span>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-white/90">Reportes Activos</h3>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-green-400 text-xl">📋</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-green-400 mb-2">8</p>
          <div className="flex items-center text-sm">
            <span className="text-green-400 font-medium">+3</span>
            <span className="text-gray-400 ml-2">esta semana</span>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Pendientes: 5</span>
              <span>En proceso: 3</span>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-white/90">Alertas</h3>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-red-400 mb-2">3</p>
          <div className="flex items-center text-sm">
            <span className="text-red-400 font-medium">Urgente</span>
            <span className="text-gray-400 ml-2">requiere atención</span>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Alta: 2</span>
              <span>Media: 1</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos con más espaciado y detalles */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        {/* Gráfico de Usuarios */}
        <Card className="min-h-[320px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white/90">Informe de usuarios</h3>
            <div className="text-right">
              <div className="text-sm text-gray-400">Crecimiento</div>
              <div className="text-lg font-bold text-indigo-400">+16.7%</div>
            </div>
          </div>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usuariosData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#6366F1', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <div className="text-gray-400">Promedio mensual</div>
              <div className="text-white font-semibold">9.6 usuarios</div>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <div className="text-gray-400">Pico máximo</div>
              <div className="text-white font-semibold">14 usuarios</div>
            </div>
          </div>
        </Card>

        {/* Gráfico de Reportes */}
        <Card className="min-h-[320px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white/90">Informe de Reportes</h3>
            <div className="text-right">
              <div className="text-sm text-gray-400">Tendencia</div>
              <div className="text-lg font-bold text-green-400">↗ +50%</div>
            </div>
          </div>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportesData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#6366F1', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <div className="text-gray-400">Total resueltos</div>
              <div className="text-white font-semibold">24 reportes</div>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <div className="text-gray-400">Tiempo promedio</div>
              <div className="text-white font-semibold">3.2 días</div>
            </div>
          </div>
        </Card>

        {/* Gráfico de Visitas */}
        <Card className="min-h-[320px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white/90">Informe de Visitas</h3>
            <div className="text-right">
              <div className="text-sm text-gray-400">Este mes</div>
              <div className="text-lg font-bold text-purple-400">240</div>
            </div>
          </div>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitasData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#6366F1', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <div className="text-gray-400">Visitas únicas</div>
              <div className="text-white font-semibold">180 usuarios</div>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <div className="text-gray-400">Tiempo promedio</div>
              <div className="text-white font-semibold">4.5 min</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sección adicional de estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/30 rounded-lg p-4 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-blue-400">95%</div>
          <div className="text-sm text-gray-400">Uptime del sistema</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-4 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-green-400">2.3s</div>
          <div className="text-sm text-gray-400">Tiempo de respuesta</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-4 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-yellow-400">87%</div>
          <div className="text-sm text-gray-400">Satisfacción usuario</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-4 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-purple-400">156</div>
          <div className="text-sm text-gray-400">Total reportes</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;