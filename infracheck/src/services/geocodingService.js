/**
 * Servicio de geocodificación mejorado con Nominatim (OpenStreetMap)
 * Incluye: rate limiting, caché, validaciones, mejor manejo de errores
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const RATE_LIMIT_MS = 1000; // 1 segundo entre peticiones
const CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hora

// Estado interno del servicio
const state = {
  lastRequestTime: 0,
  cache: new Map(),
  requestQueue: [],
  isProcessingQueue: false,
};

/**
 * Errores personalizados
 */
class GeocodingError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'GeocodingError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Validar coordenadas
 */
const validateCoordinates = (lat, lng) => {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  
  if (isNaN(latNum) || isNaN(lngNum)) {
    return { valid: false, error: 'Coordenadas deben ser números válidos' };
  }
  
  if (latNum < -90 || latNum > 90) {
    return { valid: false, error: 'Latitud debe estar entre -90 y 90' };
  }
  
  if (lngNum < -180 || lngNum > 180) {
    return { valid: false, error: 'Longitud debe estar entre -180 y 180' };
  }
  
  return { valid: true, lat: latNum, lng: lngNum };
};

/**
 * Generar clave de caché
 */
const getCacheKey = (type, params) => {
  return `${type}:${JSON.stringify(params)}`;
};

/**
 * Obtener desde caché
 */
const getFromCache = (key) => {
  const cached = state.cache.get(key);
  
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION_MS;
  
  if (isExpired) {
    state.cache.delete(key);
    return null;
  }
  
  return cached.data;
};

/**
 * Guardar en caché
 */
const saveToCache = (key, data) => {
  state.cache.set(key, {
    data,
    timestamp: Date.now(),
  });
  
  // Limpiar caché antigua (mantener máximo 100 entradas)
  if (state.cache.size > 100) {
    const firstKey = state.cache.keys().next().value;
    state.cache.delete(firstKey);
  }
};

/**
 * Esperar el tiempo necesario para respetar rate limit
 */
const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - state.lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  state.lastRequestTime = Date.now();
};

/**
 * Fetch con throttling y reintentos
 */
const throttledFetch = async (url, options = {}, retries = 3) => {
  await waitForRateLimit();
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'CiudadApp/1.0',
          ...options.headers,
        },
      });
      
      // Manejo específico de errores HTTP
      if (response.status === 429) {
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }
        throw new GeocodingError(
          'Límite de peticiones excedido. Intenta nuevamente en un momento.',
          'RATE_LIMIT_EXCEEDED'
        );
      }
      
      if (response.status === 404) {
        throw new GeocodingError(
          'No se encontró la ubicación solicitada',
          'NOT_FOUND'
        );
      }
      
      if (!response.ok) {
        throw new GeocodingError(
          `Error del servidor: ${response.status}`,
          'SERVER_ERROR'
        );
      }
      
      return response;
    } catch (error) {
      if (error instanceof GeocodingError) {
        throw error;
      }
      
      if (attempt === retries - 1) {
        throw new GeocodingError(
          'Error de conexión. Verifica tu internet.',
          'NETWORK_ERROR',
          error
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
};

/**
 * Buscar coordenadas desde una dirección
 * @param {string} address - Dirección a buscar
 * @param {Object} options - Opciones adicionales
 * @param {string} options.city - Ciudad (ej: "Temuco")
 * @param {string} options.country - País (ej: "Chile")
 * @param {string} options.countryCode - Código de país (ej: "cl")
 * @param {boolean} options.useCache - Usar caché (default: true)
 * @returns {Promise<Array>} Array de resultados con lat, lng y detalles
 */
export const geocodeAddress = async (address, options = {}) => {
  // Validaciones
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    throw new GeocodingError(
      'La dirección es obligatoria y debe ser un texto válido',
      'INVALID_INPUT'
    );
  }
  
  // Construir query con contexto de ubicación
  let query = address.trim();
  if (options.city) query += `, ${options.city}`;
  if (options.country) query += `, ${options.country}`;
  
  // Verificar caché
  const useCache = options.useCache !== false;
  const cacheKey = getCacheKey('geocode', { query, countryCode: options.countryCode });
  
  if (useCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: options.limit || 5,
      addressdetails: 1,
      countrycodes: options.countryCode || 'cl',
    });
    
    const response = await throttledFetch(`${NOMINATIM_BASE_URL}/search?${params}`);
    const data = await response.json();
    
    // Validar que hay resultados
    if (!data || data.length === 0) {
      throw new GeocodingError(
        'No se encontraron resultados para esta dirección',
        'NO_RESULTS'
      );
    }
    
    // Formatear y ordenar resultados por relevancia
    const results = data
      .map((item) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        address: item.address,
        type: item.type,
        importance: parseFloat(item.importance) || 0,
        placeId: item.place_id,
        boundingBox: item.boundingbox,
      }))
      .sort((a, b) => b.importance - a.importance); // Ordenar por importancia
    
    // Guardar en caché
    if (useCache) {
      saveToCache(cacheKey, results);
    }
    
    return results;
  } catch (error) {
    if (error instanceof GeocodingError) {
      throw error;
    }
    throw new GeocodingError(
      'Error al procesar la búsqueda de ubicación',
      'PROCESSING_ERROR',
      error
    );
  }
};

/**
 * Geocodificación inversa: obtener dirección desde coordenadas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.useCache - Usar caché (default: true)
 * @returns {Promise<Object>} Objeto con información de la dirección
 */
export const reverseGeocode = async (lat, lng, options = {}) => {
  // Validar coordenadas
  const validation = validateCoordinates(lat, lng);
  if (!validation.valid) {
    throw new GeocodingError(validation.error, 'INVALID_COORDINATES');
  }
  
  // Usar coordenadas validadas
  const validLat = validation.lat;
  const validLng = validation.lng;
  
  // Verificar caché
  const useCache = options.useCache !== false;
  const cacheKey = getCacheKey('reverse', { lat: validLat, lng: validLng });
  
  if (useCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  try {
    const params = new URLSearchParams({
      lat: validLat.toString(),
      lon: validLng.toString(),
      format: 'json',
      addressdetails: 1,
    });
    
    const response = await throttledFetch(`${NOMINATIM_BASE_URL}/reverse?${params}`);
    const data = await response.json();
    
    if (!data || data.error) {
      throw new GeocodingError(
        'No se pudo obtener información de esta ubicación',
        'REVERSE_GEOCODE_FAILED'
      );
    }
    
    const result = {
      displayName: data.display_name,
      address: data.address || {},
      road: data.address?.road || '',
      houseNumber: data.address?.house_number || '',
      neighbourhood: data.address?.neighbourhood || '',
      suburb: data.address?.suburb || '',
      city: data.address?.city || data.address?.town || data.address?.village || '',
      state: data.address?.state || '',
      country: data.address?.country || '',
      postalCode: data.address?.postcode || '',
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
    };
    
    // Guardar en caché
    if (useCache) {
      saveToCache(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    if (error instanceof GeocodingError) {
      throw error;
    }
    throw new GeocodingError(
      'Error al procesar la geocodificación inversa',
      'PROCESSING_ERROR',
      error
    );
  }
};

/**
 * Formatear dirección de manera legible
 * @param {Object} addressData - Datos de dirección de Nominatim
 * @returns {string} Dirección formateada
 */
export const formatAddress = (addressData) => {
  if (!addressData || typeof addressData !== 'object') {
    return 'Ubicación desconocida';
  }
  
  const parts = [];
  
  // Calle y número
  if (addressData.road) {
    let street = addressData.road;
    if (addressData.houseNumber) {
      street += ` ${addressData.houseNumber}`;
    }
    parts.push(street);
  }
  
  // Barrio o sector
  if (addressData.neighbourhood || addressData.suburb) {
    parts.push(addressData.neighbourhood || addressData.suburb);
  }
  
  // Ciudad
  if (addressData.city) {
    parts.push(addressData.city);
  }
  
  // Estado/Región (opcional)
  if (addressData.state && parts.length > 0) {
    parts.push(addressData.state);
  }
  
  return parts.length > 0 
    ? parts.join(', ') 
    : addressData.displayName || 'Ubicación desconocida';
};

/**
 * Formatear dirección corta (solo calle y ciudad)
 * @param {Object} addressData - Datos de dirección
 * @returns {string} Dirección corta
 */
export const formatShortAddress = (addressData) => {
  if (!addressData || typeof addressData !== 'object') {
    return 'Ubicación desconocida';
  }
  
  const parts = [];
  
  if (addressData.road) {
    let street = addressData.road;
    if (addressData.houseNumber) {
      street += ` ${addressData.houseNumber}`;
    }
    parts.push(street);
  }
  
  if (addressData.city) {
    parts.push(addressData.city);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Ubicación';
};

/**
 * Calcular distancia entre dos puntos (Haversine)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} Distancia en kilómetros
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Limpiar caché manualmente
 */
export const clearCache = () => {
  state.cache.clear();
};

/**
 * Obtener estadísticas del servicio
 */
export const getStats = () => {
  return {
    cacheSize: state.cache.size,
    lastRequestTime: state.lastRequestTime,
    queueLength: state.requestQueue.length,
  };
};