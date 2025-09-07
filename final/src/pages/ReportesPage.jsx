import React from 'react';
import { Card } from '../components/shared';

const ReportesPage = () => {
  const reportesEjemplo = [
    {
      id: 1,
      titulo: "Bache en la calle",
      descripcion: "Daño severo en el pavimento que causa problemas a los vehículos",
      ubicacion: "Avenida Libertador 456, Temuco",
      nivelUrgencia: "MEDIA",
      estado: "PENDIENTE",
      fecha: "2024-01-15",
      usuario: "María González",
      categoria: "Vialidad",
      imagen: "/api/placeholder/80/60"
    },
    {
      id: 2,
      titulo: "Semáforo dañado",
      descripcion: "Luz roja intermitente no funciona correctamente, peligro para transeúntes",
      ubicacion: "Intersección Calle Principal con Av. Alemania",
      nivelUrgencia: "ALTA",
      estado: "EN PROCESO",
      fecha: "2024-01-14",
      usuario: "Carlos Martínez",
      categoria: "Señalización",
      imagen: "/api/placeholder/80/60"
    },
    {
      id: 3,
      titulo: "Alcantarilla tapada",
      descripcion: "Obstrucción completa en drenaje causa acumulación de agua",
      ubicacion: "Barrio Centro, Calle Montt 234",
      nivelUrgencia: "MEDIA",
      estado: "ASIGNADO",
      fecha: "2024-01-13",
      usuario: "Ana López",
      categoria: "Drenaje",
      imagen: "/api/placeholder/80/60"
    },
    {
      id: 4,
      titulo: "Poste de luz caído",
      descripcion: "Poste de alumbrado público derribado por viento fuerte, cables expuestos",
      ubicacion: "Sector Norte, Pasaje Los Aromos 123",
      nivelUrgencia: "ALTA",
      estado: "URGENTE",
      fecha: "2024-01-12",
      usuario: "Pedro Ramírez",
      categoria: "Electricidad",
      imagen: "/api/placeholder/80/60"
    },
    {
      id: 5,
      titulo: "Grieta en acera",
      descripcion: "Fisura extensa en vereda que representa peligro para peatones",
      ubicacion: "Plaza de Armas, frente a Municipalidad",
      nivelUrgencia: "BAJA",
      estado: "COMPLETADO",
      fecha: "2024-01-11",
      usuario: "Sofía Torres",
      categoria: "Infraestructura",
      imagen: "/api/placeholder/80/60"
    },
    {
      id: 6,
      titulo: "Señal de tránsito rota",
      descripcion: "Señal de pare completamente destruida por vandalismo",
      ubicacion: "Intersección Sur, Calle Bulnes con O'Higgins",
      nivelUrgencia: "MEDIA",
      estado: "PENDIENTE",
      fecha: "2024-01-10",
      usuario: "Roberto Silva",
      categoria: "Señalización",
      imagen: "/api/placeholder/80/60"
    },
    {
      id: 7,
      titulo: "Árbol caído en vía pública",
      descripcion: "Árbol de gran tamaño obstruye completamente el paso vehicular",
      ubicacion: "Av. Pablo Neruda 789, sector Universidad",
      nivelUrgencia: "ALTA",
      estado: "EN PROCESO",
      fecha: "2024-01-09",
      usuario: "Carmen Morales",
      categoria: "Áreas Verdes",
      imagen: "/api/placeholder/80/60"
    },
    {
      id: 8,
      titulo: "Fuga de agua potable",
      descripcion: "Rotura en tubería principal causa desperdicio de agua y daños",
      ubicacion: "Calle Arturo Prat 456, Villa Los Pinos",
      nivelUrgencia: "ALTA",
      estado: "ASIGNADO",
      fecha: "2024-01-08",
      usuario: "Diego Herrera",
      categoria: "Agua Potable",
      imagen: "/api/placeholder/80/60"
    }
  ];

  const getUrgenciaColor = (nivel) => {
    switch(nivel) {
      case 'ALTA': return 'bg-red-500';
      case 'MEDIA': return 'bg-yellow-500';
      case 'BAJA': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'COMPLETADO': return 'bg-green-600';
      case 'EN PROCESO': return 'bg-blue-600';
      case 'ASIGNADO': return 'bg-purple-600';
      case 'URGENTE': return 'bg-red-600';
      case 'PENDIENTE': return 'bg-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const getCategoriaColor = (categoria) => {
    switch(categoria) {
      case 'Vialidad': return 'bg-orange-500';
      case 'Señalización': return 'bg-cyan-500';
      case 'Drenaje': return 'bg-indigo-500';
      case 'Electricidad': return 'bg-yellow-600';
      case 'Infraestructura': return 'bg-pink-500';
      case 'Áreas Verdes': return 'bg-green-600';
      case 'Agua Potable': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Reportes de Infraestructura</h2>
        <div className="text-sm text-gray-400">
          Total: {reportesEjemplo.length} reportes
        </div>
      </div>

      {/* Header de la tabla */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 mb-4 pb-3 border-b border-gray-700">
        <div className="col-span-2 text-sm font-medium text-gray-400">Título</div>
        <div className="col-span-3 text-sm font-medium text-gray-400">Descripción</div>
        <div className="col-span-2 text-sm font-medium text-gray-400">Ubicación</div>
        <div className="col-span-1 text-sm font-medium text-gray-400">Urgencia</div>
        <div className="col-span-1 text-sm font-medium text-gray-400">Estado</div>
        <div className="col-span-1 text-sm font-medium text-gray-400">Fecha</div>
        <div className="col-span-1 text-sm font-medium text-gray-400">Usuario</div>
        <div className="col-span-1 text-sm font-medium text-gray-400">Imagen</div>
      </div>

      {/* Filas de reportes */}
      <div className="space-y-4">
        {reportesEjemplo.map((reporte) => (
          <div key={reporte.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
            {/* Vista móvil y tablet */}
            <div className="lg:hidden space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-blue-400 font-semibold">{reporte.titulo}</h3>
                <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center">
                  <img 
                    src={reporte.imagen} 
                    alt="Imagen del reporte" 
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full bg-gray-600 rounded items-center justify-center">
                    <span className="text-xs text-gray-400">IMG</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm">{reporte.descripcion}</p>
              
              <div className="flex flex-wrap gap-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getUrgenciaColor(reporte.nivelUrgencia)}`}>
                  {reporte.nivelUrgencia}
                </span>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getEstadoColor(reporte.estado)}`}>
                  {reporte.estado}
                </span>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoriaColor(reporte.categoria)}`}>
                  {reporte.categoria}
                </span>
              </div>
              
              <div className="text-xs text-gray-400 space-y-1">
                <div>📍 {reporte.ubicacion}</div>
                <div>📅 {reporte.fecha} | 👤 {reporte.usuario}</div>
              </div>
            </div>

            {/* Vista desktop */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
              <div className="col-span-2">
                <div>
                  <span className="text-blue-400 font-semibold text-sm">{reporte.titulo}</span>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getCategoriaColor(reporte.categoria)}`}>
                      {reporte.categoria}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-span-3">
                <span className="text-gray-300 text-sm">{reporte.descripcion}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-300 text-sm">📍 {reporte.ubicacion}</span>
              </div>
              <div className="col-span-1">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getUrgenciaColor(reporte.nivelUrgencia)}`}>
                  {reporte.nivelUrgencia}
                </span>
              </div>
              <div className="col-span-1">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getEstadoColor(reporte.estado)}`}>
                  {reporte.estado}
                </span>
              </div>
              <div className="col-span-1">
                <span className="text-gray-400 text-xs">{reporte.fecha}</span>
                <div className="text-gray-500 text-xs mt-1">👤 {reporte.usuario}</div>
              </div>
              <div className="col-span-1">
                <div className="w-20 h-15 bg-gray-700 rounded-lg flex items-center justify-center">
                  <img 
                    src={reporte.imagen} 
                    alt="Imagen del reporte" 
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full bg-gray-600 rounded-lg items-center justify-center">
                    <span className="text-xs text-gray-400">IMG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estadísticas al final */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">2</div>
          <div className="text-sm text-gray-400">Urgentes</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">2</div>
          <div className="text-sm text-gray-400">En Proceso</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">2</div>
          <div className="text-sm text-gray-400">Asignados</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">1</div>
          <div className="text-sm text-gray-400">Completados</div>
        </div>
      </div>
    </Card>
  );
};

export default ReportesPage;