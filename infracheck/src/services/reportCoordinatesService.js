const COORDS_STORAGE_KEY = 'report_coordinates';

/**
 * Guardar coordenadas de un reporte
 * @param {number} reportId - ID del reporte
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 */
export const saveReportCoordinates = (reportId, lat, lng) => {
  try {
    const coords = getStoredCoordinates();
    coords[reportId] = { lat, lng, savedAt: new Date().toISOString() };
    localStorage.setItem(COORDS_STORAGE_KEY, JSON.stringify(coords));
    console.log(`💾 Coordenadas guardadas para reporte ${reportId}:`, { lat, lng });
  } catch (error) {
    console.error('Error al guardar coordenadas:', error);
  }
};

/**
 * Obtener todas las coordenadas guardadas
 * @returns {Object} Objeto con coordenadas por ID de reporte
 */
export const getStoredCoordinates = () => {
  try {
    const stored = localStorage.getItem(COORDS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error al leer coordenadas:', error);
    return {};
  }
};

/**
 * Obtener coordenadas de un reporte específico
 * @param {number} reportId - ID del reporte
 * @returns {Object|null} Coordenadas {lat, lng} o null
 */
export const getReportCoordinates = (reportId) => {
  const coords = getStoredCoordinates();
  return coords[reportId] || null;
};

/**
 * Aplicar coordenadas guardadas a un array de reportes
 * @param {Array} reports - Array de reportes desde la API
 * @returns {Array} Reportes con coordenadas aplicadas
 */
export const applyStoredCoordinates = (reports) => {
  const storedCoords = getStoredCoordinates();
  
  return reports.map(report => {
    const coords = storedCoords[report.id];
    
    if (coords) {
      return {
        ...report,
        lat: coords.lat,
        lng: coords.lng
      };
    }
    
    // Si no hay coordenadas guardadas, usar coordenadas por defecto de Temuco
    // con un pequeño offset aleatorio para que no se solapen
    const randomOffset = () => (Math.random() - 0.5) * 0.01;
    return {
      ...report,
      lat: -38.7397 + randomOffset(),
      lng: -72.5984 + randomOffset()
    };
  });
};

/**
 * Limpiar coordenadas antiguas (opcional, para mantenimiento)
 * @param {number} daysOld - Días de antigüedad para eliminar
 */
export const cleanOldCoordinates = (daysOld = 30) => {
  try {
    const coords = getStoredCoordinates();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const cleaned = {};
    let removedCount = 0;
    
    Object.entries(coords).forEach(([id, data]) => {
      const savedDate = new Date(data.savedAt);
      if (savedDate > cutoffDate) {
        cleaned[id] = data;
      } else {
        removedCount++;
      }
    });
    
    localStorage.setItem(COORDS_STORAGE_KEY, JSON.stringify(cleaned));
    console.log(`🧹 Limpiadas ${removedCount} coordenadas antiguas`);
  } catch (error) {
    console.error('Error al limpiar coordenadas:', error);
  }
};