import L from "leaflet";

/**
 * Colores por categoría de reporte
 * Las claves deben coincidir exactamente con los IDs de categoría del backend
 */
export const REPORT_COLORS = {
  // Formato: category_id o category_name
  "1": "#3b82f6",  // Calles y Veredas en Mal Estado
  "2": "#f59e0b",  // Luz o Alumbrado Público Dañado
  "3": "#06b6d4",  // Drenaje o Aguas Estancadas
  "4": "#10b981",  // Parques, Plazas o Árboles con Problemas
  "5": "#ef4444",  // Basura, Escombros o Espacios Sucios
  "6": "#dc2626",  // Emergencias o Situaciones de Riesgo
  "7": "#8b5cf6",  // Infraestructura o Mobiliario Público Dañado
  
  // Alternativas por nombre (por si el backend envía nombres)
  "calles_veredas": "#3b82f6",
  "alumbrado_publico": "#f59e0b",
  "drenaje_aguas": "#06b6d4",
  "parques_plazas": "#10b981",
  "basura_escombros": "#ef4444",
  "emergencias": "#dc2626",
  "infraestructura": "#8b5cf6",
  
  // Fallback
  "otro": "#6b7280"
};

/**
 * Mapeo de nombres de categorías legibles
 */
export const CATEGORY_NAMES = {
  "1": "Calles y Veredas",
  "2": "Alumbrado Público",
  "3": "Drenaje y Aguas",
  "4": "Parques y Plazas",
  "5": "Basura y Escombros",
  "6": "Emergencias",
  "7": "Infraestructura",
  "calles_veredas": "Calles y Veredas",
  "alumbrado_publico": "Alumbrado Público",
  "drenaje_aguas": "Drenaje y Aguas",
  "parques_plazas": "Parques y Plazas",
  "basura_escombros": "Basura y Escombros",
  "emergencias": "Emergencias",
  "infraestructura": "Infraestructura"
};

/**
 * Estilos por nivel de urgencia
 */
export const URGENCY_STYLES = {
  "alta": {
    radius: 12,
    weight: 3,
    opacity: 0.9,
    fillOpacity: 0.7,
    className: "urgency-high"
  },
  "media": {
    radius: 10,
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.5,
    className: "urgency-medium"
  },
  "baja": {
    radius: 8,
    weight: 2,
    opacity: 0.7,
    fillOpacity: 0.4,
    className: "urgency-low"
  }
};

/**
 * Crea un ícono personalizado para reportes según categoría
 * @param {string} category - Categoría del reporte
 * @param {string} urgency - Urgencia del reporte
 * @returns {L.DivIcon} Ícono de Leaflet
 */
export const createReportIcon = (category, urgency) => {
  const color = REPORT_COLORS[category] || REPORT_COLORS["otro"];
  const size = urgency === "alta" ? 32 : urgency === "media" ? 28 : 24;
  
  return L.divIcon({
    className: "custom-report-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 10px;
      ">
        ${urgency === "alta" ? "!" : ""}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

/**
 * Obtiene el estilo de CircleMarker según categoría y urgencia
 * @param {string} category - Categoría del reporte
 * @param {string} urgency - Urgencia del reporte
 * @returns {Object} Opciones de estilo para CircleMarker
 */
export const getReportCircleStyle = (category, urgency) => {
  const color = REPORT_COLORS[category] || REPORT_COLORS["otro"];
  const urgencyStyle = URGENCY_STYLES[urgency] || URGENCY_STYLES["media"];
  
  return {
    color: color,
    fillColor: color,
    ...urgencyStyle
  };
};

/**
 * Formatea la fecha de un reporte
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatReportDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  // Menos de 1 hora
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `Hace ${mins} min${mins !== 1 ? 's' : ''}`;
  }
  
  // Menos de 24 horas
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  
  // Menos de 7 días
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `Hace ${days} día${days !== 1 ? 's' : ''}`;
  }
  
  // Formato de fecha normal
  return date.toLocaleDateString('es-CL', { 
    day: 'numeric', 
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Genera el contenido HTML para el popup de un reporte
 * @param {Object} report - Objeto del reporte
 * @returns {string} HTML del popup
 */
export const generateReportPopup = (report) => {
  const urgencyColors = {
    "alta": "#ef4444",
    "media": "#f59e0b",
    "baja": "#10b981"
  };
  
  const urgencyColor = urgencyColors[report.urgency] || "#6b7280";
  const categoryColor = REPORT_COLORS[report.reportTypeId] || REPORT_COLORS[report.originalCategory] || REPORT_COLORS[report.category] || REPORT_COLORS["otro"];
  
  // Obtener la imagen principal
  const imageUrl = report.image || report.imageDataUrl || (report.images && report.images[0]?.url);
  
  return `
    <div style="min-width: 260px; max-width: 320px; font-family: system-ui, -apple-system, sans-serif;">
      ${imageUrl ? `
        <div style="margin: -16px -16px 12px -16px; border-radius: 4px 4px 0 0; overflow: hidden; height: 160px;">
          <img 
            src="${imageUrl}" 
            alt="${report.title}"
            style="
              width: 100%; 
              height: 100%; 
              object-fit: cover;
              display: block;
            "
            onerror="this.style.display='none'; this.parentElement.style.height='0'; this.parentElement.style.margin='0';"
          />
        </div>
      ` : ''}
      
      <div style="margin-bottom: 8px;">
        <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: #1e293b; line-height: 1.3;">
          ${report.title}
        </h3>
        <div style="display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap;">
          <span style="
            font-size: 10px;
            padding: 3px 8px;
            border-radius: 6px;
            background: ${categoryColor};
            color: white;
            font-weight: 600;
            white-space: nowrap;
          ">
            ${report.category}
          </span>
          <span style="
            font-size: 10px;
            padding: 3px 8px;
            border-radius: 6px;
            background: ${urgencyColor};
            color: white;
            font-weight: 600;
            text-transform: uppercase;
          ">
            ${report.urgency}
          </span>
          ${report.statusLabel ? `
            <span style="
              font-size: 10px;
              padding: 3px 8px;
              border-radius: 6px;
              background: #64748b;
              color: white;
              font-weight: 500;
            ">
              ${report.statusLabel}
            </span>
          ` : ''}
        </div>
      </div>
      
      <p style="margin: 0 0 10px 0; font-size: 13px; color: #475569; line-height: 1.5;">
        ${report.description && report.description.length > 120 
          ? report.description.substring(0, 120) + '...' 
          : (report.description || report.summary || 'Sin descripción')}
      </p>
      
      <div style="font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px;">
        <div style="display: flex; align-items: start; gap: 6px; margin-bottom: 6px;">
          <span style="flex-shrink: 0;">📍</span>
          <span style="line-height: 1.4;">${report.address}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span>⏱️</span>
            <span>${formatReportDate(report.createdAt)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span>👍</span>
            <span style="font-weight: 600;">${report.votes || 0}</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Filtra reportes por categoría y urgencia
 * @param {Array} reports - Array de reportes
 * @param {Object} filters - Objeto con filtros { categories: [], urgencies: [] }
 * @returns {Array} Reportes filtrados
 */
export const filterReports = (reports, filters = {}) => {
  let filtered = [...reports];
  
  // Filtrar por categorías
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(r => 
      filters.categories.includes(r.originalCategory) ||
      filters.categories.includes(r.category) ||
      filters.categories.includes(String(r.category_id))
    );
  }
  
  // Filtrar por urgencias
  if (filters.urgencies && filters.urgencies.length > 0) {
    filtered = filtered.filter(r => 
      filters.urgencies.includes(r.urgency)
    );
  }
  
  // Filtrar por estado
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(r => 
      filters.status.includes(r.status)
    );
  }
  
  return filtered;
};

/**
 * Obtiene estadísticas de reportes para el mapa
 * @param {Array} reports - Array de reportes
 * @returns {Object} Objeto con estadísticas
 */
export const getMapStats = (reports) => {
  const stats = {
    total: reports.length,
    porUrgencia: { alta: 0, media: 0, baja: 0 },
    porCategoria: {},
    porEstado: { pendiente: 0, en_proceso: 0, resuelto: 0 }
  };
  
  reports.forEach(report => {
    // Contar por urgencia
    if (report.urgency) {
      const urgency = report.urgency.toLowerCase();
      stats.porUrgencia[urgency] = (stats.porUrgencia[urgency] || 0) + 1;
    }
    
    // Contar por categoría
    const cat = report.originalCategory || report.category || report.category_id;
    stats.porCategoria[cat] = (stats.porCategoria[cat] || 0) + 1;
    
    // Contar por estado
    const status = report.status || "pendiente";
    stats.porEstado[status] = (stats.porEstado[status] || 0) + 1;
  });
  
  return stats;
};

/**
 * Calcula el centro y zoom óptimo para mostrar todos los reportes
 * @param {Array} reports - Array de reportes con coordenadas
 * @returns {Object} { center: [lat, lng], zoom: number }
 */
export const calculateMapBounds = (reports) => {
  if (!reports || reports.length === 0) {
    return { center: [-38.7397, -72.5984], zoom: 13 }; // Centro por defecto (Temuco)
  }
  
  if (reports.length === 1) {
    return { center: [reports[0].lat, reports[0].lng], zoom: 15 };
  }
  
  // Calcular bounds
  const lats = reports.map(r => r.lat);
  const lngs = reports.map(r => r.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Centro
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  
  // Calcular zoom aproximado basado en la diferencia
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);
  
  let zoom = 13;
  if (maxDiff < 0.01) zoom = 15;
  else if (maxDiff < 0.05) zoom = 13;
  else if (maxDiff < 0.1) zoom = 12;
  else if (maxDiff < 0.5) zoom = 10;
  else zoom = 9;
  
  return { center: [centerLat, centerLng], zoom };
};