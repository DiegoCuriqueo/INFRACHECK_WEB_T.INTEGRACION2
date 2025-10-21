// src/services/reportsService.js
import { cleanApiUrl, handleApiResponse, makeAuthenticatedRequest } from './apiConfig.js';
import { getToken } from './authService';
import { applyStoredCoordinates, saveReportCoordinates } from './reportCoordinatesService';

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
 * Cargar todos los reportes desde la API
 * @returns {Promise<Array>} Array de reportes
 */
export const getReportes = async () => {
  try {
    const url = `${REPORTS_BASE_URL}/api/reports/`;
    console.log('🔍 Cargando reportes desde:', url);
    
    const data = await makeAuthenticatedRequest(url);
    const reports = Array.isArray(data) ? data : data.results || [];
    
    console.log('📊 Total de reportes:', reports.length);
    
    // Transformar datos
    const transformed = reports.map(transformReportFromAPI);
    
    // ✅ Aplicar coordenadas guardadas en localStorage
    const withCoordinates = applyStoredCoordinates(transformed);
    
    return withCoordinates.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (error) {
    console.error("❌ Error al cargar reportes desde API:", error);
    return [];
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
 * Crear un nuevo reporte
 * @param {Object} reportData - Datos del reporte
 * @returns {Promise<Object>} Reporte creado
 */
export const createReporte = async (reportData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para crear un reporte');
    }

    const apiData = transformReportToAPI(reportData);
    
    console.log('📤 Enviando reporte a la API:', apiData);

    const data = await makeAuthenticatedRequest(
      `${REPORTS_BASE_URL}/api/reports/create/`,
      {
        method: 'POST',
        body: JSON.stringify(apiData)
      }
    );

    console.log('✅ Reporte creado:', data);

    // ✅ Guardar coordenadas en localStorage
    saveReportCoordinates(data.id, reportData.lat, reportData.lng);

    const newReport = transformReportFromAPI(data);
    
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
 * Obtener estadísticas de reportes
 * @returns {Promise<Object>} Estadísticas
 */
export const getReportesStats = async () => {
  try {
    return await makeAuthenticatedRequest(`${REPORTS_BASE_URL}/api/reports/statistics/`);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return {
      total: 0,
      porCategoria: {},
      porUrgencia: {},
      porEstado: {}
    };
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

  console.log('📥 Transformando reporte desde API:', apiReport); // ← Debug

  return {
    // Campos básicos del reporte
    id: apiReport.id,
    title: apiReport.titulo || "Sin título",
    summary: apiReport.descripcion || "",
    description: apiReport.descripcion || "",
    
    // Ubicación
    address: apiReport.ubicacion || "Dirección no especificada",
    lat: apiReport.latitud || -38.7397,
    lng: apiReport.longitud || -72.5984,
    
    // Visibilidad
    visible: apiReport.visible !== false,
    
    // Nivel de urgencia (1=baja, 2=media, 3=alta)
    urgency: mapUrgencyFromAPI(apiReport.urgencia),
    
    // Fechas
    createdAt: apiReport.fecha_creacion || new Date().toISOString(),
    updatedAt: apiReport.fecha_actualizacion,
    
    // IDs relacionados
    cityId: apiReport.ciudad_id || apiReport.ciudad,
    userId: apiReport.usuario_id || apiReport.usuario,
    reportStateId: apiReport.denuncia_estado_id || apiReport.estado,
    reportTypeId: apiReport.tipo_denuncia_id || apiReport.tipo_denuncia,
    
    // Usuario (si viene poblado)
    user: apiReport.usuario?.username || apiReport.usuario_nombre || "Usuario",
    
    // Estado del reporte
    status: mapStatusFromAPI(apiReport.denuncia_estado_id || apiReport.estado || 1),
    
    // ✅ CATEGORÍA - usar el ID directamente
    category: categoryDisplayMap[apiReport.tipo_denuncia_id || apiReport.tipo_denuncia] || "Otro problema de infraestructura",
    originalCategory: apiReport.tipo_denuncia_id || apiReport.tipo_denuncia || 1,
    
    // Imagen
    image: categoryImages["otro"],
    imageDataUrl: apiReport.imagen_url || apiReport.imagen || null,
    
    // Votos
    votes: apiReport.votos || apiReport.total_votos || 0
  };
}

/**
 * Transforma un reporte del frontend al formato de la API
 * @param {Object} frontendReport - Reporte desde el frontend
 * @returns {Object} Reporte en formato API
 */
function transformReportToAPI(frontendReport) {
  // Normalizar urgencia (HomeUser puede enviar "medio" en lugar de "media")
  let urgency = frontendReport.urgency;
  if (urgency === 'medio') urgency = 'media';
  
  const apiData = {
    titulo: frontendReport.title,
    descripcion: frontendReport.desc || frontendReport.description,
    ubicacion: frontendReport.address,
    latitud: parseFloat(frontendReport.lat) || -38.7397,
    longitud: parseFloat(frontendReport.lng) || -72.5984,
    urgencia: mapUrgencyToAPI(urgency), // 1, 2 o 3
    tipo_denuncia_id: parseInt(frontendReport.category) || 1, // ⚠️ Cambiar a tipo_denuncia (sin _id)
    ciudad_id: 1, // Por defecto ciudad 1 (ajustar según necesites)
    // visible: true,  // Se asigna automáticamente en el backend
    // usuario_id se asigna automáticamente desde el token
    // denuncia_estado_id se asigna automáticamente (pendiente por defecto)
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
function mapStatusFromAPI(denunciaEstadoId) {
  // Mapeo según denuncia_estado_id
  // Ajustar según los IDs reales de tu tabla estados_denuncia
  const statusMap = {
    1: 'pendiente',
    2: 'en_proceso',
    3: 'resuelto',
  };
  return statusMap[denunciaEstadoId] || 'pendiente';
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