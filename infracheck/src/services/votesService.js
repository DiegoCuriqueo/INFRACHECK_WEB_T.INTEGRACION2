const VOTES_STORAGE_KEY = "votedReports";
const VOTES_PATCH_KEY = "votesPatch";

/**
 * Obtener el estado de votos del usuario
 * @returns {Object} Objeto con los IDs de reportes votados
 */
export const getVotedReports = () => {
  try {
    const raw = localStorage.getItem(VOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("Error al cargar votos:", error);
    return {};
  }
};

/**
 * Obtener el parche de votos (contador actualizado de votos)
 * @returns {Object} Objeto con los contadores de votos por ID de reporte
 */
export const getVotesPatch = () => {
  try {
    const raw = localStorage.getItem(VOTES_PATCH_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("Error al cargar parche de votos:", error);
    return {};
  }
};

/**
 * Guardar el estado de votos del usuario
 * @param {Object} votedReports - Objeto con los IDs de reportes votados
 */
const saveVotedReports = (votedReports) => {
  try {
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votedReports));
  } catch (error) {
    console.error("Error al guardar votos:", error);
  }
};

/**
 * Guardar el parche de votos
 * @param {Object} votesPatch - Objeto con los contadores de votos
 */
const saveVotesPatch = (votesPatch) => {
  try {
    localStorage.setItem(VOTES_PATCH_KEY, JSON.stringify(votesPatch));
  } catch (error) {
    console.error("Error al guardar parche de votos:", error);
  }
};

/**
 * Verificar si el usuario ya votó por un reporte
 * @param {string} reportId - ID del reporte
 * @returns {boolean} true si ya votó
 */
export const hasVoted = (reportId) => {
  const votedReports = getVotedReports();
  return !!votedReports[reportId];
};

/**
 * Simular llamada API para votar
 * @param {string} reportId - ID del reporte
 * @param {boolean} isVoting - true para votar, false para quitar voto
 * @returns {Promise<Object>} Resultado de la operación
 */
const voteReportAPI = async (reportId, isVoting) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Simular respuesta de API
  // En producción, esto sería una llamada fetch/axios al backend
  // Ejemplo: 
  // const response = await fetch(`/api/reports/${reportId}/vote`, {
  //   method: isVoting ? 'POST' : 'DELETE',
  //   headers: { 'Content-Type': 'application/json' }
  // });
  // return response.json();
  
  return {
    success: true,
    reportId,
    voted: isVoting,
    timestamp: new Date().toISOString()
  };
};

/**
 * Agregar o quitar voto de un reporte
 * @param {string} reportId - ID del reporte
 * @param {number} currentVotes - Cantidad actual de votos del reporte
 * @returns {Promise<Object>} Objeto con el resultado de la operación
 */
export const toggleVote = async (reportId, currentVotes) => {
  try {
    // Obtener estado actual
    const votedReports = getVotedReports();
    const votesPatch = getVotesPatch();
    
    // Verificar si ya votó
    const alreadyVoted = votedReports[reportId];
    const isVoting = !alreadyVoted;
    
    // Calcular nuevos votos
    const delta = isVoting ? 1 : -1;
    const newVotes = Math.max(0, currentVotes + delta);
    
    // Llamar a la API (simulada)
    const apiResponse = await voteReportAPI(reportId, isVoting);
    
    if (!apiResponse.success) {
      throw new Error("Error al procesar el voto en el servidor");
    }
    
    // Actualizar estado local
    const updatedVotedReports = { ...votedReports };
    if (isVoting) {
      updatedVotedReports[reportId] = true;
    } else {
      delete updatedVotedReports[reportId];
    }
    
    // Actualizar parche de votos
    const updatedVotesPatch = { ...votesPatch };
    updatedVotesPatch[reportId] = newVotes;
    
    // Guardar en localStorage
    saveVotedReports(updatedVotedReports);
    saveVotesPatch(updatedVotesPatch);
    
    // Actualizar también en userReports si existe
    updateUserReportVotes(reportId, newVotes);
    
    return {
      success: true,
      voted: isVoting,
      newVotes,
      reportId
    };
  } catch (error) {
    console.error("Error al votar:", error);
    throw new Error("No se pudo procesar tu voto. Intenta nuevamente.");
  }
};

/**
 * Actualizar votos en userReports si el reporte existe allí
 * @param {string} reportId - ID del reporte
 * @param {number} newVotes - Nueva cantidad de votos
 */
const updateUserReportVotes = (reportId, newVotes) => {
  try {
    const userReportsRaw = localStorage.getItem("userReports");
    if (!userReportsRaw) return;
    
    const userReports = JSON.parse(userReportsRaw);
    const reportIndex = userReports.findIndex(r => r.id === reportId);
    
    if (reportIndex !== -1) {
      userReports[reportIndex].votes = newVotes;
      localStorage.setItem("userReports", JSON.stringify(userReports));
    }
  } catch (error) {
    console.error("Error al actualizar votos en userReports:", error);
  }
};

/**
 * Obtener el conteo total de votos del usuario
 * @returns {number} Total de votos realizados
 */
export const getTotalUserVotes = () => {
  const votedReports = getVotedReports();
  return Object.keys(votedReports).length;
};

/**
 * Limpiar todos los votos (útil para testing o reset)
 * @returns {boolean} true si se limpiaron correctamente
 */
export const clearAllVotes = () => {
  try {
    localStorage.removeItem(VOTES_STORAGE_KEY);
    localStorage.removeItem(VOTES_PATCH_KEY);
    return true;
  } catch (error) {
    console.error("Error al limpiar votos:", error);
    return false;
  }
};

/**
 * Aplicar parche de votos a una lista de reportes
 * @param {Array} reports - Array de reportes
 * @returns {Array} Reportes con votos actualizados
 */
export const applyVotesPatch = (reports) => {
  const votesPatch = getVotesPatch();
  return reports.map(report => ({
    ...report,
    votes: votesPatch[report.id] ?? report.votes
  }));
};