import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reportes = () => {
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
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          Sistema de Reportes
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Administrador / Autoridad - Gestión de incidencias y reportes
        </p>
      </div>
      
      {/* Reports Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-wider">Titulo</th>
                <th className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-wider">Descripción</th>
                <th className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-wider hidden sm:table-cell">Ubicación</th>
                <th className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-wider">Urgencia</th>
                <th className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-wider">Imagen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {/* Report 1 */}
              <tr className="hover:bg-gray-700 transition-colors">
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-medium text-white">Bache en la calle</div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                  <div className="text-xs sm:text-sm text-gray-300 max-w-[120px] sm:max-w-none truncate">Daño en el pavimento</div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-xs sm:text-sm text-gray-300">Avenida 456</div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-md bg-yellow-100 text-yellow-800">
                    MEDIA
                  </span>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 bg-gray-600 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=80&h=64&fit=crop&crop=center" 
                      alt="Bache en la calle"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
              </tr>
              
              {/* Report 2 */}
              <tr className="hover:bg-gray-700 transition-colors">
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-medium text-white">Alumbrado público</div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                  <div className="text-xs sm:text-sm text-gray-300 max-w-[120px] sm:max-w-none truncate">Lámpara rota en poste</div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-xs sm:text-sm text-gray-300">Calle Principal 123</div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-800">
                    ALTA
                  </span>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 bg-gray-600 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=80&h=64&fit=crop&crop=center" 
                      alt="Alumbrado público"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
              </tr>
              
              {/* Report 3 */}
              <tr className="hover:bg-gray-700 transition-colors">
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-medium text-white">Basura en la vía</div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                  <div className="text-xs sm:text-sm text-gray-300 max-w-[120px] sm:max-w-none truncate">Acumulación de residuos</div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-xs sm:text-sm text-gray-300">Plaza Central</div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-800">
                    BAJA
                  </span>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 bg-gray-600 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=80&h=64&fit=crop&crop=center" 
                      alt="Basura en la vía"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reportes; 