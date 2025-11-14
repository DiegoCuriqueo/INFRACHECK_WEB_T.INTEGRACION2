/**
 * Servicio de búsqueda para el mapa
 * Maneja búsqueda de reportes y geocodificación de direcciones
 */

import { categoryDisplayMap } from './reportsService';

/**
 * Busca reportes locales por diferentes criterios
 * @param {Array} reports - Lista de reportes
 * @param {string} query - Término de búsqueda
 * @param {number} limit - Número máximo de resultados (default: 5)
 * @returns {Array} Reportes filtrados
 */
export const searchReports = (reports = [], query = "", limit = 5) => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  
  return reports.filter((report) => {
    // Buscar en título
    const matchTitle = report.title?.toLowerCase().includes(lowerQuery);
    
    // Buscar en descripción
    const matchDesc = report.description?.toLowerCase().includes(lowerQuery) ||
                      report.summary?.toLowerCase().includes(lowerQuery);
    
    // Buscar en categoría (usar el nombre legible)
    const categoryName = categoryDisplayMap[report.originalCategory] || report.category || '';
    const matchCategory = categoryName.toLowerCase().includes(lowerQuery);
    
    // Buscar en urgencia
    const matchUrgency = report.urgency?.toLowerCase().includes(lowerQuery) ||
                         report.urgencyLabel?.toLowerCase().includes(lowerQuery);
    
    // Buscar en dirección
    const matchAddress = report.address?.toLowerCase().includes(lowerQuery);
    
    // Buscar por ID
    const matchId = report.id?.toString().includes(lowerQuery);
    
    // Buscar en estado
    const matchStatus = report.status?.toLowerCase().includes(lowerQuery) ||
                        report.statusLabel?.toLowerCase().includes(lowerQuery);
    
    // Buscar en ciudad
    const matchCity = report.city?.toLowerCase().includes(lowerQuery);
    
    return matchTitle || matchDesc || matchCategory || matchUrgency || 
           matchAddress || matchId || matchStatus || matchCity;
  }).slice(0, limit);
};

/**
 * Busca direcciones usando la API de Nominatim (OpenStreetMap)
 * @param {string} query - Dirección a buscar
 * @param {Object} options - Opciones de búsqueda
 * @returns {Promise<Array>} Lista de ubicaciones encontradas
 */
export const searchLocations = async (query, options = {}) => {
  const {
    limit = 5,
    countryCode = 'cl', // Chile por defecto
    language = 'es-CL',
    viewbox = '-73.5,-37.0,-71.5,-39.5', // Bounding box Biobío
    bounded = true
  } = options;

  if (!query.trim() || query.length < 3) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: limit.toString(),
      countrycodes: countryCode,
      addressdetails: '1',
      'accept-language': language
    });

    // Solo agregar viewbox si bounded es true
    if (bounded && viewbox) {
      params.append('viewbox', viewbox);
      params.append('bounded', '1');
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'MapaReportesCiudadanos/1.0', // Requerido por Nominatim
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    return data.map(item => ({
      id: item.place_id,
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      category: item.category,
      address: item.address,
      importance: item.importance,
      boundingbox: item.boundingbox
    }));

  } catch (error) {
    console.error('Error buscando direcciones:', error);
    throw error;
  }
};

/**
 * Geocodificación inversa: obtiene la dirección de unas coordenadas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<Object>} Información de la ubicación
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MapaReportesCiudadanos/1.0',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      display_name: data.display_name,
      address: data.address,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon)
    };

  } catch (error) {
    console.error('Error en geocodificación inversa:', error);
    throw error;
  }
};

/**
 * Calcula la distancia entre dos puntos en metros (fórmula de Haversine)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} Distancia en metros
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Encuentra reportes cercanos a una ubicación
 * @param {Array} reports - Lista de reportes
 * @param {number} lat - Latitud de referencia
 * @param {number} lng - Longitud de referencia
 * @param {number} radiusMeters - Radio de búsqueda en metros
 * @returns {Array} Reportes dentro del radio especificado
 */
export const findNearbyReports = (reports = [], lat, lng, radiusMeters = 1000) => {
  return reports
    .map(report => ({
      ...report,
      distance: calculateDistance(lat, lng, report.lat, report.lng)
    }))
    .filter(report => report.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Formatea la distancia para mostrar
 * @param {number} meters - Distancia en metros
 * @returns {string} Distancia formateada
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Debounce helper para búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Valida coordenadas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} True si las coordenadas son válidas
 */
export const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Obtiene sugerencias de búsqueda basadas en reportes frecuentes
 * @param {Array} reports - Lista de reportes
 * @returns {Array} Lista de sugerencias
 */
export const getSearchSuggestions = (reports = []) => {
  const suggestions = new Set();
  
  reports.forEach(report => {
    // Agregar categorías
    if (report.originalCategory && categoryDisplayMap[report.originalCategory]) {
      suggestions.add(categoryDisplayMap[report.originalCategory]);
    }
    
    // Agregar urgencias
    if (report.urgency) {
      suggestions.add(report.urgency);
    }
    
    // Agregar estados
    if (report.statusLabel) {
      suggestions.add(report.statusLabel);
    }
    
    // Agregar ciudades
    if (report.city) {
      suggestions.add(report.city);
    }
    
    // Agregar palabras clave del título (palabras largas)
    if (report.title) {
      report.title.split(' ')
        .filter(word => word.length > 4)
        .slice(0, 2)
        .forEach(word => suggestions.add(word));
    }
  });
  
  return Array.from(suggestions).slice(0, 10);
};

/**
 * Filtra reportes por múltiples criterios
 * @param {Array} reports - Lista de reportes
 * @param {Object} filters - Filtros a aplicar
 * @returns {Array} Reportes filtrados
 */
export const filterReportsByMultipleCriteria = (reports = [], filters = {}) => {
  let filtered = [...reports];
  
  // Filtrar por categoría
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(report => 
      filters.categories.includes(report.originalCategory) ||
      filters.categories.includes(report.category)
    );
  }
  
  // Filtrar por urgencia
  if (filters.urgencies && filters.urgencies.length > 0) {
    filtered = filtered.filter(report => 
      filters.urgencies.includes(report.urgency)
    );
  }
  
  // Filtrar por estado
  if (filters.statuses && filters.statuses.length > 0) {
    filtered = filtered.filter(report => 
      filters.statuses.includes(report.status)
    );
  }
  
  // Filtrar por ciudad
  if (filters.cities && filters.cities.length > 0) {
    filtered = filtered.filter(report => 
      filters.cities.includes(report.city) ||
      filters.cities.includes(report.cityId)
    );
  }
  
  // Filtrar por rango de fechas
  if (filters.dateFrom) {
    const dateFrom = new Date(filters.dateFrom);
    filtered = filtered.filter(report => 
      new Date(report.createdAt) >= dateFrom
    );
  }
  
  if (filters.dateTo) {
    const dateTo = new Date(filters.dateTo);
    filtered = filtered.filter(report => 
      new Date(report.createdAt) <= dateTo
    );
  }
  
  // Filtrar por radio de distancia
  if (filters.centerLat && filters.centerLng && filters.radiusMeters) {
    filtered = findNearbyReports(
      filtered, 
      filters.centerLat, 
      filters.centerLng, 
      filters.radiusMeters
    );
  }
  
  return filtered;
};

/**
 * Agrupa reportes por categoría
 * @param {Array} reports - Lista de reportes
 * @returns {Object} Reportes agrupados por categoría
 */
export const groupReportsByCategory = (reports = []) => {
  return reports.reduce((grouped, report) => {
    const category = report.originalCategory || 'otros';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(report);
    return grouped;
  }, {});
};

/**
 * Agrupa reportes por urgencia
 * @param {Array} reports - Lista de reportes
 * @returns {Object} Reportes agrupados por urgencia
 */
export const groupReportsByUrgency = (reports = []) => {
  return reports.reduce((grouped, report) => {
    const urgency = report.urgency || 'media';
    if (!grouped[urgency]) {
      grouped[urgency] = [];
    }
    grouped[urgency].push(report);
    return grouped;
  }, {});
};