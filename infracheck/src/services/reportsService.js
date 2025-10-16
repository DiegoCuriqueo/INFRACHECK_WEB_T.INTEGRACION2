const STORAGE_KEY = "userReports";

/** NUEVO: Sembrar SEED solo si no hay nada guardado */
export const ensureSeeded = (seedArray = []) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(current) || current.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedArray));
    }
  } catch (e) {
    console.error("No se pudo inicializar con SEED:", e);
  }
};

/**
 * Mapeo de categorías para mostrar nombres más presentables
 */
export const categoryDisplayMap = {
  "bache": "Vialidad",
  "iluminacion": "Iluminación",
  "residuos": "Residuos",
  "señalizacion": "Señalización",
  "otro": "Espacio público"
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
 * Cargar todos los reportes desde localStorage
 * @returns {Array} Array de reportes
 */
export const getReportes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const reports = stored ? JSON.parse(stored) : [];
    // Ordenar por fecha de creación (más recientes primero)
    return reports.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (error) {
    console.error("Error al cargar reportes:", error);
    return [];
  }
};

/**
 * Obtener un reporte por ID
 * @param {string} id - ID del reporte
 * @returns {Object|null} Reporte encontrado o null
 */
export const getReporteById = (id) => {
  try {
    const reports = getReportes();
    return reports.find(report => String(report.id) === String(id)) || null;
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
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 450));
    
    const newReport = {
      id: crypto.randomUUID(),
      user: "Usuario", // En una app real, vendría del contexto de autenticación
      title: reportData.title.trim(),
      summary: reportData.desc.trim(),
      description: reportData.desc.trim(),
      category: categoryDisplayMap[reportData.category] || reportData.category,
      originalCategory: reportData.category,
      urgency: reportData.urgency,
      // Usamos la imagen adjunta si existe, sino la imagen por defecto de la categoría
      image: reportData.imageDataUrl || categoryImages[reportData.category] || categoryImages["otro"],
      votes: 0, // Votos iniciales a 0
      createdAt: new Date().toISOString(),
      lat: reportData.lat,
      lng: reportData.lng,
      address: reportData.address.trim() || `${reportData.lat.toFixed(4)}, ${reportData.lng.toFixed(4)}`,
      status: "pendiente" // Estados posibles: pendiente, en_proceso, resuelto
    };
    
    // Guardar en localStorage
    const allReports = getReportes();
    const updatedReports = [newReport, ...allReports];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
    
    return newReport;
  } catch (error) {
    console.error("Error al crear reporte:", error);
    throw new Error("No se pudo crear el reporte");
  }
};

/**
 * Actualizar un reporte existente
 * @param {string} id - ID del reporte
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object|null>} Reporte actualizado o null
 */
export const updateReporte = async (id, updates) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allReports = getReportes();
    const reportIndex = allReports.findIndex(r => String(r.id) === String(id));
    
    if (reportIndex === -1) {
      throw new Error("Reporte no encontrado");
    }
    
    allReports[reportIndex] = {
      ...allReports[reportIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allReports));
    return allReports[reportIndex];
  } catch (error) {
    console.error("Error al actualizar reporte:", error);
    return null;
  }
};

/**
 * Eliminar un reporte
 * @param {string} id - ID del reporte
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export const deleteReporte = async (id) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allReports = getReportes();
    const filteredReports = allReports.filter(r => String(r.id) !== String(id));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredReports));
    return true;
  } catch (error) {
    console.error("Error al eliminar reporte:", error);
    return false;
  }
};

/**
 * Filtrar reportes por categoría
 */
export const getReportesByCategory = (category) => {
  const allReports = getReportes();
  if (!category || category === "todos") {
    return allReports;
  }
  return allReports.filter(r => r.originalCategory === category || r.category === category);
};

/**
 * Filtrar reportes por urgencia
 */
export const getReportesByUrgency = (urgency) => {
  const allReports = getReportes();
  if (!urgency || urgency === "todos") {
    return allReports;
  }
  return allReports.filter(r => r.urgency === urgency);
};

/**
 * Obtener estadísticas de reportes
 */
export const getReportesStats = () => {
  const allReports = getReportes();
  
  return {
    total: allReports.length,
    porCategoria: allReports.reduce((acc, r) => {
      const cat = r.originalCategory || r.category;
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {}),
    porUrgencia: allReports.reduce((acc, r) => {
      acc[r.urgency] = (acc[r.urgency] || 0) + 1;
      return acc;
    }, {}),
    porEstado: allReports.reduce((acc, r) => {
      const status = r.status || "pendiente";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  };
};
