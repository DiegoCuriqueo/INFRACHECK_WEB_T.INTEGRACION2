import { cleanApiUrl, handleApiResponse, makeAuthenticatedRequest } from './apiConfig.js';
import { getToken } from './authService';


// Base URL para endpoints de reports
const REPORTS_BASE_URL = cleanApiUrl.replace(/\/api(?:\/v\d+)?$/, '');

const REPORTS_CHANGED_EVENT = "reports:changed";
const REPORTS_VOTES_UPDATED_EVENT = "reports:votes_updated";

const emitReportsChanged = () => window.dispatchEvent(new Event(REPORTS_CHANGED_EVENT));
const emitReportVotesUpdated = (detail) => window.dispatchEvent(new CustomEvent(REPORTS_VOTES_UPDATED_EVENT, { detail }));

export const onReportsChanged = (handler) => {
  window.addEventListener(REPORTS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(REPORTS_CHANGED_EVENT, handler);
};

export const onReportVotesUpdated = (handler) => {
  window.addEventListener(REPORTS_VOTES_UPDATED_EVENT, handler);
  return () => window.removeEventListener(REPORTS_VOTES_UPDATED_EVENT, handler);
};

// Almacenamiento local de votos de reportes (fallback cuando no hay autenticación)
const LOCAL_REPORT_VOTES_KEY = 'reports:votes';
const loadLocalReportVotesStore = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_REPORT_VOTES_KEY) || '{}'); } catch { return {}; }
};
const saveLocalReportVotesStore = (store) => {
  try { localStorage.setItem(LOCAL_REPORT_VOTES_KEY, JSON.stringify(store)); } catch {}
};
const getLocalUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user_data') || 'null');
    const id = u?.user_id ?? u?.id ?? u?.username ?? null;
    return id !== null && id !== undefined ? String(id) : 'anon';
  } catch {
    return 'anon';
  }
};
const getLocalReportVotes = (reportId) => {
  const store = loadLocalReportVotesStore();
  const entry = store[String(reportId)] || {};
  const voters = entry.voters || {};
  const pos = Object.values(voters).filter(v => v === 1).length;
  const neg = Object.values(voters).filter(v => v === -1).length;
  const total = pos + neg;
  const my = voters[getLocalUserId()] ?? entry.my ?? 0;
  return { total, my, positivos: pos, negativos: neg };
};
const setLocalReportVoteForUser = (reportId, userId, valor) => {
  const store = loadLocalReportVotesStore();
  const key = String(reportId);
  const entry = store[key] || { voters: {} };
  const voters = entry.voters || {};
  const uid = String(userId || getLocalUserId());
  if (valor === 0) {
    delete voters[uid];
  } else {
    voters[uid] = valor === 1 ? 1 : -1;
  }
  const pos = Object.values(voters).filter(v => v === 1).length;
  const neg = Object.values(voters).filter(v => v === -1).length;
  const total = pos + neg;
  const my = voters[uid] ?? 0;
  store[key] = { voters, total, positivos: pos, negativos: neg, my };
  saveLocalReportVotesStore(store);
  return { total, my, positivos: pos, negativos: neg };
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

// Sanitización básica de texto de comentario
const sanitizeCommentText = (t) => {
  try {
    const s = String(t || '')
      .replace(/<[^>]+>/g, '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return s.slice(0, 500);
  } catch {
    return '';
  }
};
const MIN_COMMENT_LEN = 10;
const PENDING_COMMENTS_KEY = 'reports:pending_comments';
const loadPendingCommentsStore = () => {
  try { return JSON.parse(localStorage.getItem(PENDING_COMMENTS_KEY) || '{}'); } catch { return {}; }
};
const savePendingCommentsStore = (store) => {
  try { localStorage.setItem(PENDING_COMMENTS_KEY, JSON.stringify(store)); } catch {}
};
const getPendingForReport = (reportId) => {
  const store = loadPendingCommentsStore();
  return Array.isArray(store[String(reportId)]) ? store[String(reportId)] : [];
};
const addPendingForReport = (reportId, entry) => {
  const store = loadPendingCommentsStore();
  const arr = Array.isArray(store[String(reportId)]) ? store[String(reportId)] : [];
  store[String(reportId)] = [entry, ...arr].slice(0, 20);
  savePendingCommentsStore(store);
};
const removePendingByText = (reportId, text) => {
  const store = loadPendingCommentsStore();
  const arr = Array.isArray(store[String(reportId)]) ? store[String(reportId)] : [];
  store[String(reportId)] = arr.filter(c => (c.text || '').trim() !== (text || '').trim());
  savePendingCommentsStore(store);
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
;

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
    const payload = (data && typeof data === 'object' && 'success' in data) ? (data.data || {}) : data;
    return transformReportFromAPI(payload);
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

    const payload = { ...(updates || {}) };
    if (typeof payload.status === 'string') {
      const s = payload.status === 'completado' ? 'resuelto' : payload.status;
      const map = { pendiente: 1, en_proceso: 2, resuelto: 3 };
      const estadoId = map[s];
      delete payload.status;
      if (estadoId) {
        payload.estado_id = estadoId;
        payload.estado = estadoId;
      }
    }
    const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isFinite(idNum)) {
      payload.report_id = idNum;
      payload.id = idNum;
    }

    const data = await makeAuthenticatedRequest(
      `${REPORTS_BASE_URL}/api/reports/${id}/update/`,
      {
        method: 'PUT',
        body: JSON.stringify(payload)
      }
    );

    let updatedReport = transformReportFromAPI(data);
    if (payload.estado_id && (!updatedReport || !updatedReport.status)) {
      updatedReport = { ...(updatedReport || {}), status: mapStatusFromAPI(payload.estado_id) };
    }
    
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
 * Obtener comentarios visibles de un reporte
 * @param {number|string} reportId
 * @returns {Promise<Array>} Lista de comentarios
 */
export const getReportComments = async (reportId) => {
  try {
    const data = await makeAuthenticatedRequest(`${REPORTS_BASE_URL}/api/reports/${reportId}/comments/list/`);
    const results = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
    return results.map(normalizeComment).filter(c => !!c);
  } catch (error) {
    return [];
  }
};

/**
 * Crear comentario en un reporte
 * @param {number|string} reportId
 * @param {string} texto
 * @returns {Promise<Object|null>} Comentario creado
 */
export const addReportComment = async (reportId, texto) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No estás autenticado');
    const content = sanitizeCommentText(texto);
    if (content.length < MIN_COMMENT_LEN) throw new Error('El comentario es muy corto');
    try {
      const payloadJson = { texto: content, comentario: content };
      console.log('📨 Enviando comentario (JSON):', payloadJson);
      const data = await makeAuthenticatedRequest(`${REPORTS_BASE_URL}/api/reports/${reportId}/comments/`, {
        method: 'POST',
        body: JSON.stringify(payloadJson)
      });
      const c = data?.data || data;
      const n = normalizeComment(c);
      console.log('✅ Respuesta creación comentario (JSON):', c);
      return n;
    } catch (eJson) {
      try {
        const form = new FormData();
        form.append('texto', content);
        form.append('comentario', content);
        console.log('📨 Enviando comentario (FormData)', Array.from(form.entries()));
        const response = await fetch(`${REPORTS_BASE_URL}/api/reports/${reportId}/comments/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          body: form
        });
        const data2 = await handleApiResponse(response);
        const c2 = data2?.data || data2;
        const n2 = normalizeComment(c2);
        console.log('✅ Respuesta creación comentario (FormData):', c2);
        return n2;
      } catch (eForm) {
        const body = new URLSearchParams();
        body.set('texto', content);
        body.set('comentario', content);
        console.log('📨 Enviando comentario (URL-encoded):', body.toString());
        const response3 = await fetch(`${REPORTS_BASE_URL}/api/reports/${reportId}/comments/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
          body: body.toString()
        });
        const data3 = await handleApiResponse(response3);
        const c3 = data3?.data || data3;
        const n3 = normalizeComment(c3);
        console.log('✅ Respuesta creación comentario (URL-encoded):', c3);
        return n3;
      }
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar comentario (soft delete)
 * @param {number|string} commentId
 * @returns {Promise<boolean>}
 */
export const deleteReportComment = async (commentId) => {
  try {
    const token = getToken();
    if (!token) return false;
    await makeAuthenticatedRequest(`${REPORTS_BASE_URL}/api/reports/comments/${commentId}/delete/`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return false;
  }
};

/**
 * Resumen de votos de un reporte
 * @param {number|string} reportId
 * @returns {Promise<{total:number, my:number, positivos:number, negativos:number}>}
 */
export const getReportVotes = async (reportId) => {
  try {
    const token = getToken();
    if (!token) {
      return getLocalReportVotes(reportId);
    }
    console.log('📊 Obteniendo votos para reporte:', reportId);
    const data = await makeAuthenticatedRequest(`${REPORTS_BASE_URL}/api/reports/${reportId}/votes/`);
    console.log('📊 Respuesta de votos completa:', JSON.stringify(data, null, 2));
    
    // La API puede devolver diferentes formatos:
    // 1. { votos_positivos, votos_negativos, total_votos, mi_voto }
    // 2. { count, results: [...], usuario_ha_votado }
    // 3. { totales: { votos_positivos, votos_negativos }, mi_voto }
    
    let pos = 0;
    let neg = 0;
    let total = 0;
    let my = 0;
    
    // Formato 1: datos directos
    if (data?.votos_positivos !== undefined || data?.totales) {
      pos = Number(data?.votos_positivos ?? data?.totales?.votos_positivos ?? 0) || 0;
      neg = Number(data?.votos_negativos ?? data?.totales?.votos_negativos ?? 0) || 0;
      total = Number(data?.total_votos ?? (pos + neg)) || 0;
      my = Number(data?.mi_voto ?? data?.my_voto ?? 0) || 0;
    }
    // Formato 2: con results array
    else if (data?.results && Array.isArray(data.results)) {
      console.log('📊 Procesando formato con results array');
      console.log('📊 Count:', data.count);
      console.log('📊 Results array:', JSON.stringify(data.results, null, 2));
      console.log('📊 usuario_ha_votado:', data.usuario_ha_votado);
      
      // Contar votos positivos y negativos desde el array
      const votos = data.results || [];
      
      // Si los objetos no tienen campo 'valor', necesitamos otra forma de determinar
      // Por ahora, si hay votos pero no tienen 'valor', asumimos que son positivos
      // O podemos contar todos como positivos si no hay distinción
      
      // Intentar obtener el valor de cada voto
      let positivosCount = 0;
      let negativosCount = 0;
      
      votos.forEach(v => {
        const val = v.valor ?? v.value ?? v.tipo_voto ?? null;
        if (val !== null) {
          if (val === 1 || val > 0) {
            positivosCount++;
          } else if (val === -1 || val < 0) {
            negativosCount++;
          }
        } else {
          // Si no hay campo valor, asumir positivo (comportamiento por defecto)
          positivosCount++;
        }
      });
      
      pos = positivosCount;
      neg = negativosCount;
      total = Number(data?.count ?? (pos + neg)) || 0;
      
      console.log('📊 Votos contados:', { pos, neg, total, votosArrayLength: votos.length });
      
      // Verificar si el usuario ha votado y obtener su voto
      // Primero obtener el ID del usuario actual
      let currentUserId = null;
      try {
        const userData = JSON.parse(localStorage.getItem('user_data') || 'null');
        currentUserId = userData?.user_id ?? userData?.id ?? null;
      } catch (e) {
        console.warn('No se pudo obtener user_data:', e);
      }
      
      console.log('📊 ID del usuario actual:', currentUserId);
      console.log('📊 usuario_ha_votado:', data?.usuario_ha_votado);
      
      if (data?.usuario_ha_votado && currentUserId) {
        // Buscar el voto del usuario actual en el array
        const userVote = votos.find(v => {
          const voteUserId = v.usuario?.id ?? v.usuario_id ?? v.user_id ?? v.usuario ?? null;
          return voteUserId && String(voteUserId) === String(currentUserId);
        });
        
        if (userVote) {
          const val = userVote.valor ?? userVote.value ?? userVote.tipo_voto ?? null;
          if (val !== null) {
            my = val > 0 ? 1 : (val < 0 ? -1 : 0);
          } else {
            // Si no hay valor pero el usuario ha votado, asumir positivo
            my = 1;
          }
          console.log('📊 Voto del usuario encontrado:', { userVote, val, my, currentUserId });
        } else {
          // Si usuario_ha_votado es true pero no encontramos el voto del usuario actual
          // podría ser que el voto sea de otro usuario, así que verificamos
          console.log('📊 usuario_ha_votado es true pero no encontramos voto del usuario actual');
          console.log('📊 Votos en array:', votos.map(v => ({
            id: v.id,
            usuario_id: v.usuario?.id ?? v.usuario_id,
            usuario_nickname: v.usuario?.nickname
          })));
          
          // Si hay votos pero ninguno es del usuario actual, entonces el usuario no ha votado realmente
          // Esto puede pasar si la API tiene un bug o si hay un problema de sincronización
          my = 0;
        }
      } else if (data?.usuario_ha_votado && !currentUserId) {
        // Si usuario_ha_votado es true pero no tenemos el ID del usuario, asumir que votó
        // pero esto es un caso edge
        console.warn('⚠️ usuario_ha_votado es true pero no tenemos currentUserId');
        my = 1; // Asumir positivo por defecto
      } else {
        my = 0;
      }
    }
    // Formato 3: con objeto votos
    else if (data?.votos) {
      pos = Number(data.votos?.votos_positivos ?? data.votos?.positivos ?? 0) || 0;
      neg = Number(data.votos?.votos_negativos ?? data.votos?.negativos ?? 0) || 0;
      total = Number(data.votos?.total ?? (pos + neg)) || 0;
      my = Number(data.votos?.mi_voto ?? data.votos?.my_voto ?? 0) || 0;
    }
    
    const result = { total, my, positivos: pos, negativos: neg };
    console.log('📊 Votos procesados:', result);
    return result;
  } catch (error) {
    console.error('❌ Error al obtener votos:', error);
    return getLocalReportVotes(reportId);
  }
};

/**
 * Crear/actualizar voto para un reporte
 * @param {number|string} reportId
 * @param {number} valor 1 (positivo) o -1 (negativo)
 * @returns {Promise<{total:number, my:number, positivos:number, negativos:number}>}
 */
export const voteReport = async (reportId, valor = 1) => {
  try {
    const token = getToken();
    if (!token) {
      const uid = getLocalUserId();
      if (valor === 1) {
        const updated = setLocalReportVoteForUser(reportId, uid, 1);
        emitReportsChanged();
        return updated;
      } else if (valor === -1) {
        const updated = setLocalReportVoteForUser(reportId, uid, -1);
        emitReportsChanged();
        return updated;
      } else {
        const updated = setLocalReportVoteForUser(reportId, uid, 0);
        emitReportsChanged();
        return updated;
      }
    }
    
    // Llamada a la API - solo acepta 1 o -1
    if (valor !== 1 && valor !== -1) {
      console.warn('Valor de voto inválido, debe ser 1 o -1');
      const fallback = getLocalReportVotes(reportId);
      return { total: fallback.total || 0, my: fallback.my || 0, positivos: fallback.positivos || 0, negativos: fallback.negativos || 0 };
    }
    
    console.log('🗳️ Enviando voto:', { reportId, valor });
    
    const data = await makeAuthenticatedRequest(`${REPORTS_BASE_URL}/api/reports/${reportId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ valor })
    });
    
    console.log('✅ Respuesta de voto completa:', JSON.stringify(data, null, 2));
    
    // La API puede devolver diferentes formatos:
    // 1. { reporte_id, usuario_id, valor, totales: { votos_positivos, votos_negativos } }
    // 2. { message, action, votos: { votos_positivos, votos_negativos, total, mi_voto } }
    // 3. { votos_positivos, votos_negativos, total_votos, mi_voto }
    
    let pos = 0;
    let neg = 0;
    let total = 0;
    let my = 0;
    
    // Formato 1: con totales
    if (data?.totales) {
      console.log('✅ Procesando formato con totales');
      pos = Number(data.totales?.votos_positivos ?? 0) || 0;
      neg = Number(data.totales?.votos_negativos ?? 0) || 0;
      total = Number(data?.total_votos ?? (pos + neg)) || 0;
      my = Number(data?.valor ?? data?.mi_voto ?? 0) || 0;
    }
    // Formato 2: con objeto votos
    else if (data?.votos) {
      console.log('✅ Procesando formato con objeto votos');
      console.log('✅ Objeto votos completo:', JSON.stringify(data.votos, null, 2));
      console.log('✅ Action:', data.action);
      
      pos = Number(data.votos?.votos_positivos ?? data.votos?.positivos ?? data.votos?.votos_positivos_count ?? 0) || 0;
      neg = Number(data.votos?.votos_negativos ?? data.votos?.negativos ?? data.votos?.votos_negativos_count ?? 0) || 0;
      total = Number(data.votos?.total ?? data.votos?.total_votos ?? data.votos?.count ?? (pos + neg)) || 0;
      my = Number(data.votos?.mi_voto ?? data.votos?.my_voto ?? data.votos?.valor ?? data.votos?.user_vote ?? 0) || 0;
      
      // Si action es 'removed', el usuario ya no tiene voto
      if (data.action === 'removed') {
        my = 0;
        console.log('✅ Voto removido, estableciendo my = 0');
      }
    }
    // Formato 3: datos directos
    else {
      pos = Number(data?.votos_positivos ?? 0) || 0;
      neg = Number(data?.votos_negativos ?? 0) || 0;
      total = Number(data?.total_votos ?? (pos + neg)) || 0;
      my = Number(data?.valor ?? data?.mi_voto ?? 0) || 0;
      
      // Si action es 'removed', el usuario ya no tiene voto
      if (data.action === 'removed') {
        my = 0;
      }
    }
    
    console.log('📊 Votos procesados:', { pos, neg, total, my });
    
    const result = { total, my, positivos: pos, negativos: neg };
    emitReportVotesUpdated({ id: reportId, ...result });
    return result;
  } catch (error) {
    console.error('❌ Error al votar:', error);
    console.error('❌ Detalles del error:', {
      message: error?.message,
      stack: error?.stack,
      reportId,
      valor
    });
    // Re-lanzar el error para que el componente pueda manejarlo
    throw error;
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
const normalizeComment = (raw) => {
  const id = raw?.id ?? raw?.comentario?.id;
  const usuario = raw?.usuario || raw?.comentario?.usuario || {};
  let userName = usuario?.nombre || usuario?.email || '';
  let userId = usuario?.id;
  if (!userName || !userId) {
    try {
      const u = JSON.parse(localStorage.getItem('user_data') || 'null');
      if (!userName) userName = u?.username || u?.email || 'Usuario';
      if (!userId) userId = u?.user_id ?? u?.id ?? null;
    } catch {}
  }
  const nested = raw?.comentario || raw?.comment || {};
  const textVal = (
    typeof raw?.comentario === 'string' ? raw.comentario :
    (nested?.texto ?? nested?.text ?? nested?.contenido ?? nested?.comentario ?? raw?.texto ?? raw?.text ?? '')
  );
  const dateVal = raw?.fecha_comentario ?? nested?.fecha_comentario ?? raw?.fecha_creacion ?? raw?.created_at ?? new Date().toISOString();
  const visible = (raw?.comment_visible ?? nested?.comment_visible ?? raw?.visible ?? nested?.visible) === true;
  return { id, user: userName || 'Usuario', userId, text: typeof textVal === 'string' ? textVal : '', date: dateVal, visible };
};