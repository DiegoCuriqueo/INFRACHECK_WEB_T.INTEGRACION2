// src/services/reportsService.js
import { cleanApiUrl, handleApiResponse, makeAuthenticatedRequest } from './apiConfig.js';
import { getToken } from './authService';


// Base URL para endpoints de reports (sin /v1/)
const REPORTS_BASE_URL = cleanApiUrl.replace('/v1', '');

const REPORTS_CHANGED_EVENT = "reports:changed";

const emitReportsChanged = () => window.dispatchEvent(new Event(REPORTS_CHANGED_EVENT));

export const onReportsChanged = (handler) => {
  window.addEventListener(REPORTS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(REPORTS_CHANGED_EVENT, handler);
};

/**
 * Mapeo de IDs de tipo_denuncia a nombres
 */
export const categoryDisplayMap = {
  1: "Bache o pavimento dañado",
  2: "Vereda rota o en mal estado",
  3: "Acceso peatonal inaccesible",
  4: "Señalización faltante o dañada",
  5: "Alumbrado público deficiente",
  6: "Basura o escombros acumulados",
  7: "Daño en mobiliario urbano",
  8: "Alcantarilla tapada u obstruida",
  9: "Árbol o vegetación que obstruye",
  10: "Graffiti o vandalismo",
  11: "Semáforo en mal estado",
  12: "Plaza o parque deteriorado",
  13: "Fuga de agua o alcantarillado",
  14: "Otro problema de infraestructura"
};

/**
 * Imágenes por defecto para cada categoría
 */
export const categoryImages = {
  "bache": "https://images.unsplash.com/photo-1617727553256-84de7c1240e8?q=80&w=1200&auto=format&fit=crop",
  "iluminacion": "https://images.unsplash.com/photo-1519683021815-c9f8a8b0f1b0?q=80&w=1200&auto=format&fit=crop",
  "residuos": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1200&auto=format&fit=crop",
  "señalizacion": "https://images.unsplash.com/photo-1603706581421-89f8b7a38f9b?q=80&w=1200&auto=format&fit=crop",
  "otro": "https://images.unsplash.com/photo-1603706581421-89f8b7a38f9b?q=80&w=1200&auto=format&fit=crop"
};

/**
 * Headers con autenticación (ya no es necesario, usamos makeAuthenticatedRequest)
 */
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Cargar todos los reportes desde la API (con paginación cursor)
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de reportes
 */
export const getReportes = async (filters = {}) => {
  try {
    // Construir query params (sin page_size por ahora)
    const params = new URLSearchParams(filters);
    
    const url = `${REPORTS_BASE_URL}/api/reports/?${params}`;
    console.log('🔍 URL completa:', url);
    console.log('🔍 REPORTS_BASE_URL:', REPORTS_BASE_URL);
    console.log('🔑 Token presente:', !!getToken());
    
    const response = await makeAuthenticatedRequest(url);
    
    console.log('✅ Respuesta recibida:', response);
    
    // La API devuelve { success: true, data: [...], pagination: {...} }
    const reports = response.success && Array.isArray(response.data) 
      ? response.data 
      : [];
    
    console.log('📊 Total de reportes:', reports.length);
    
    const transformed = reports.map(transformReportFromAPI).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    return transformed;
  } catch (error) {
    console.error("❌ Error al cargar reportes desde API:", error);
      return [];
    }
  }
};

/**
 * Obtener reportes del usuario autenticado
 * @returns {Promise<Array>} Reportes del usuario
 */
export const getUserReportes = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No estás autenticado');
    }

    const data = await makeAuthenticatedRequest(`${REPORTS_BASE_URL}/api/reports/user/`);
    const reports = Array.isArray(data) ? data : data.results || [];
    
    return reports.map(transformReportFromAPI);
  } catch (error) {
    console.error("Error al cargar reportes del usuario:", error);
    return [];
  }
};

/**
 * Obtener reportes urgentes
 * @returns {Promise<Array>} Reportes urgentes
 */
export const getUrgentReportes = async () => {
  try {
    const data = await makeAuthenticatedRequest(`${REPORTS_BASE_URL}/api/reports/urgent/`);
    const reports = Array.isArray(data) ? data : data.results || [];
    
    return reports.map(transformReportFromAPI);
  } catch (error) {
    console.error("Error al cargar reportes urgentes:", error);
    return [];
  }
};

/**
 * Obtener un reporte por ID
 * @param {number|string} id - ID del reporte
 * @returns {Promise<Object|null>} Reporte encontrado o null
 */
export const getReporteById = async (id) => {
  try {
    const data = await makeAuthenticatedRequest(`${REPORTS_BASE_URL}/api/reports/${id}/`);
    return transformReportFromAPI(data);
  } catch (error) {
    console.error("Error al obtener reporte:", error);
    return null;
  }
};

/**
 * Crear un nuevo reporte (con soporte para múltiples imágenes)
 * @param {Object} formData - Datos del reporte desde el formulario
 * @returns {Promise<Object>} Reporte creado
 */
export const createReporte = async (formData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para crear un reporte');
    }

    // Crear FormData para enviar archivos
    const formDataToSend = new FormData();
    
    // Campos básicos
    formDataToSend.append('titulo', formData.title);
    formDataToSend.append('descripcion', formData.desc || formData.description);
    formDataToSend.append('direccion', formData.address);
    formDataToSend.append('latitud', parseFloat(formData.lat) || -38.7397);
    formDataToSend.append('longitud', parseFloat(formData.lng) || -72.5984);
    
    // Urgencia (normalizar "medio" a "media")
    let urgency = formData.urgency;
    if (urgency === 'medio') urgency = 'media';
    formDataToSend.append('urgencia', mapUrgencyToAPI(urgency));
    
    formDataToSend.append('tipo_denuncia', parseInt(formData.category) || 1);
    formDataToSend.append('ciudad', 1); // Temuco por defecto
    
    // Agregar imagen si existe (base64 a blob)
    if (formData.imageDataUrl) {
      try {
        const blob = await fetch(formData.imageDataUrl).then(r => r.blob());
        formDataToSend.append('imagenes', blob, 'image.jpg');
      } catch (error) {
        console.warn('No se pudo procesar la imagen:', error);
      }
    }
    
    console.log('📤 Enviando reporte a la API (FormData)');

    const response = await fetch(`${REPORTS_BASE_URL}/api/reports/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // NO incluir Content-Type, el navegador lo hará automáticamente con boundary
      },
      body: formDataToSend
    });

    const responseData = await handleApiResponse(response);
    
    console.log('✅ Respuesta de creación:', responseData);

    // La API devuelve { success: true, message: "...", data: {...} }
    const reportData = responseData.success ? responseData.data : responseData;
    const newReport = transformReportFromAPI(reportData);
    
    emitReportsChanged();
    return newReport;
  } catch (error) {
    console.error("❌ Error al crear reporte:", error);
    throw new Error(error.message || "No se pudo crear el reporte");
  }
};

/**
 * Actualizar un reporte existente
 * @param {number|string} id - ID del reporte
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object|null>} Reporte actualizado o null
 */
export const updateReporte = async (id, updates) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para actualizar un reporte');
    }

    const data = await makeAuthenticatedRequest(
      `${REPORTS_BASE_URL}/api/reports/${id}/update/`,
      {
        method: 'PUT',
        body: JSON.stringify(updates)
      }
    );

    const updatedReport = transformReportFromAPI(data);
    
    emitReportsChanged();
    return updatedReport;
  } catch (error) {
    console.error("Error al actualizar reporte:", error);
    return null;
  }
};

/**
 * Eliminar un reporte
 * @param {number|string} id - ID del reporte
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export const deleteReporte = async (id) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para eliminar un reporte');
    }

    await makeAuthenticatedRequest(
      `${REPORTS_BASE_URL}/api/reports/${id}/delete/`,
      { method: 'DELETE' }
    );

    emitReportsChanged();
    return true;
  } catch (error) {
    console.error("Error al eliminar reporte:", error);
    return false;
  }
};

/**
 * Obtener reportes en formato GeoJSON para mapas
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>} GeoJSON FeatureCollection
 */
export const getReportesGeoJSON = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const data = await makeAuthenticatedRequest(
      `${REPORTS_BASE_URL}/api/reports/geojson/?${params}`
    );
    return data;
  } catch (error) {
    console.error("Error al obtener reportes GeoJSON:", error);
    return {
      type: "FeatureCollection",
      features: [],
      metadata: { total_features: 0 }
    };
  }
};

/**
 * Subir archivos adicionales a un reporte existente
 * @param {number} reportId - ID del reporte
 * @param {File[]} imagenes - Archivos de imagen
 * @param {File} video - Archivo de video (opcional)
 * @returns {Promise<Object>} Archivos subidos
 */
export const uploadReportMedia = async (reportId, imagenes = [], video = null) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Debes iniciar sesión');
    }

    const formData = new FormData();
    
    // Agregar hasta 3 imágenes
    imagenes.slice(0, 3).forEach(img => {
      formData.append('imagenes', img);
    });
    
    if (video) {
      formData.append('video', video);
    }

    const response = await fetch(
      `${REPORTS_BASE_URL}/api/reports/${reportId}/media/upload/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      }
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error al subir archivos:", error);
    throw error;
  }
};

/**
 * Eliminar un archivo de un reporte
 * @param {number} reportId - ID del reporte
 * @param {number} archivoId - ID del archivo
 * @returns {Promise<boolean>}
 */
export const deleteReportMedia = async (reportId, archivoId) => {
  try {
    await makeAuthenticatedRequest(
      `${REPORTS_BASE_URL}/api/reports/${reportId}/media/${archivoId}/delete/`,
      { method: 'DELETE' }
    );
    return true;
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
    return false;
  }
};

/**
 * Filtrar reportes por categoría (local)
 */
export const getReportesByCategory = (reports, category) => {
  if (!category || category === "todos") {
    return reports;
  }
  return reports.filter(r => 
    r.originalCategory === category || r.category === category
  );
};

/**
 * Filtrar reportes por urgencia (local)
 */
export const getReportesByUrgency = (reports, urgency) => {
  if (!urgency || urgency === "todos") {
    return reports;
  }
  return reports.filter(r => r.urgency === urgency);
};

// ============================================
// TRANSFORMADORES DE DATOS
// ============================================

/**
 * Transforma un reporte de la API al formato del frontend
 * @param {Object} apiReport - Reporte desde la API
 * @returns {Object} Reporte en formato frontend
 */
function transformReportFromAPI(apiReport) {
  if (!apiReport) return null;

  // Obtener la imagen principal
  const mainImage = apiReport.archivos?.find(a => a.es_principal) || apiReport.archivos?.[0];
  const imageUrl = mainImage?.url ? `${REPORTS_BASE_URL}${mainImage.url}` : null;

  return {
    // Campos básicos del reporte
    id: apiReport.id,
    title: apiReport.titulo || "Sin título",
    summary: apiReport.descripcion || "",
    description: apiReport.descripcion || "",
    
    // Ubicación
    address: apiReport.direccion || apiReport.ubicacion_texto || "Dirección no especificada",
    lat: apiReport.ubicacion?.latitud || -38.7397,  // Coordenadas anidadas
    lng: apiReport.ubicacion?.longitud || -72.5984,
    
    // Visibilidad
    visible: apiReport.visible !== false,
    
    // Nivel de urgencia (ahora es un objeto)
    urgency: mapUrgencyFromAPI(apiReport.urgencia?.valor),
    urgencyLabel: apiReport.urgencia?.etiqueta || "Media",
    
    // Fechas
    createdAt: apiReport.fecha_creacion || new Date().toISOString(),
    updatedAt: apiReport.fecha_actualizacion,
    
    // Usuario (ahora es un objeto)
    user: apiReport.usuario?.nombre || apiReport.usuario?.email || "Usuario",
    userId: apiReport.usuario?.id,
    
    // Estado del reporte (ahora es un objeto)
    status: mapStatusFromAPI(apiReport.estado?.id),
    statusLabel: apiReport.estado?.nombre || "Abierto",
    reportStateId: apiReport.estado?.id,
    
    // Categoría (tipo de denuncia - ahora es un objeto)
    category: apiReport.tipo_denuncia?.nombre || "Otro problema de infraestructura",
    originalCategory: apiReport.tipo_denuncia?.id,
    reportTypeId: apiReport.tipo_denuncia?.id,
    
    // Ciudad (ahora es un objeto)
    city: apiReport.ciudad?.nombre || "Temuco",
    cityId: apiReport.ciudad?.id,
    
    // Archivos (NUEVO - ahora hay múltiples imágenes)
    image: imageUrl || categoryImages["otro"],
    imageDataUrl: imageUrl,
    archivos: apiReport.archivos || [],
    images: apiReport.archivos?.filter(a => a.tipo === 'imagen').map(a => ({
      id: a.id,
      url: `${REPORTS_BASE_URL}${a.url}`,
      nombre: a.nombre,
      esPrincipal: a.es_principal,
      orden: a.orden
    })) || [],
    
    // Estadísticas (NUEVO)
    estadisticas: apiReport.estadisticas || {
      total_archivos: 0,
      imagenes: 0,
      videos: 0,
      dias_desde_creacion: 0
    },
    
    // Votos (no está en la API, se maneja aparte)
    votes: 0
  };
}

/**
 * Transforma un reporte del frontend al formato de la API
 * @param {Object} frontendReport - Reporte desde el frontend
 * @returns {Object} Reporte en formato API
 */
function transformReportToAPI(frontendReport) {
  // Normalizar urgencia
  let urgency = frontendReport.urgency;
  if (urgency === 'medio') urgency = 'media';
  
  const apiData = {
    titulo: frontendReport.title,
    descripcion: frontendReport.desc || frontendReport.description,
    direccion: frontendReport.address, // ← Cambiar de 'ubicacion' a 'direccion'
    ubicacion: {  // ← Ahora es un objeto anidado
      latitud: parseFloat(frontendReport.lat) || -38.7397,
      longitud: parseFloat(frontendReport.lng) || -72.5984
    },
    urgencia: mapUrgencyToAPI(urgency), // 1, 2 o 3 (la API lo convierte a objeto)
    tipo_denuncia: parseInt(frontendReport.category) || 1,
    ciudad: 1, // Por defecto ciudad 1 (Temuco)
    visible: true,
    // usuario_id se asigna automáticamente desde el token
    // estado se asigna automáticamente (Abierto por defecto)
  };
  
  console.log('🔄 Transformando reporte:', {
    frontend: frontendReport,
    api: apiData
  });
  
  return apiData;
}

/**
 * Mapea urgencia de API a formato frontend
 */
function mapUrgencyFromAPI(urgenciaId) {
  // Según tu tabla: 1=baja, 2=media, 3=alta (int4)
  const urgencyMap = {
    1: 'baja',
    2: 'media',
    3: 'alta',
  };
  return urgencyMap[urgenciaId] || 'media';
}

/**
 * Mapea urgencia de frontend a formato API
 */
function mapUrgencyToAPI(frontendUrgency) {
  const urgencyMap = {
    'baja': 1,
    'media': 2,
    'alta': 3
  };
  return urgencyMap[frontendUrgency] || 2;
}

/**
 * Mapea estado de API a formato frontend
 */
function mapStatusFromAPI(estadoId) {
  // Mapeo según estado.id
  // Ajustar según los IDs reales de tu tabla estados
  const statusMap = {
    1: 'pendiente',     // Abierto
    2: 'en_proceso',    // En proceso
    3: 'resuelto',      // Resuelto/Cerrado
  };
  return statusMap[estadoId] || 'pendiente';
}

// ============================================
// MANTENER COMPATIBILIDAD CON SEED
// ============================================

/**
 * Sembrar SEED solo si no hay datos (para desarrollo)
 */
export const ensureSeeded = (seedArray = []) => {
  console.warn('ensureSeeded ya no es necesario con la API');
  // Mantener por compatibilidad pero no hace nada
};  