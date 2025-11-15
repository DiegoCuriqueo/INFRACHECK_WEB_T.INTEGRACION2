// src/services/votesService.js
import { cleanApiUrl, makeAuthenticatedRequest } from "./apiConfig";

const VOTES_STORAGE_KEY = "votedReports";
const VOTES_PATCH_KEY = "votesPatch";

/* ==================== NAMESPACE POR USUARIO ==================== */
const getNamespacedKey = (baseKey) => {
  try {
    const raw = localStorage.getItem("user_data");
    if (!raw) return baseKey;

    const user = JSON.parse(raw);
    const suffix =
      user.user_id || user.id || user.username || user.rut || "";

    if (!suffix) return baseKey;
    return `${baseKey}_${suffix}`;
  } catch {
    return baseKey;
  }
};

/* ==================== ESTADO LOCAL ==================== */

export const getVotedReports = () => {
  try {
    const raw = localStorage.getItem(getNamespacedKey(VOTES_STORAGE_KEY));
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("Error al cargar votos:", error);
    return {};
  }
};

export const getVotesPatch = () => {
  try {
    const raw = localStorage.getItem(VOTES_PATCH_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("Error al cargar parche de votos:", error);
    return {};
  }
};

const saveVotedReports = (votedReports) => {
  try {
    localStorage.setItem(
      getNamespacedKey(VOTES_STORAGE_KEY),
      JSON.stringify(votedReports)
    );
  } catch (error) {
    console.error("Error al guardar votos:", error);
  }
};

const saveVotesPatch = (votesPatch) => {
  try {
    localStorage.setItem(VOTES_PATCH_KEY, JSON.stringify(votesPatch));
  } catch (error) {
    console.error("Error al guardar parche de votos:", error);
  }
};

export const hasVoted = (reportId) => {
  const votedReports = getVotedReports();
  return !!votedReports[reportId];
};

/* ==================== API REAL ==================== */
/**
 * POST /api/reports/{report_id}/vote/
 * Body: { "valor": 1 | -1 }
 */
const voteReportAPI = async (reportId, valor) => {
  const url = `${cleanApiUrl}/api/reports/${reportId}/vote/`;

  return makeAuthenticatedRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ valor }),
  });
};

/* ==================== LÓGICA PRINCIPAL ==================== */
/**
 * Toggle de voto:
 *  - Si el usuario NO había votado → valor = 1 (suma 1)
 *  - Si YA había votado           → valor = -1 (resta 1 / quita voto)
 */
export const toggleVote = async (reportId, currentVotes = 0) => {
  try {
    // Estado actual por ESTE usuario
    const votedReports = getVotedReports();
    const votesPatch = getVotesPatch();

    const alreadyVoted = !!votedReports[reportId];
    const isVoting = !alreadyVoted;   // true = votar, false = quitar voto
    const valor = isVoting ? 1 : -1;

    // ======= ACTUALIZACIÓN OPTIMISTA EN UI =======
    let newVotes = Number(currentVotes) || 0;
    const delta = isVoting ? 1 : -1;
    newVotes = Math.max(0, newVotes + delta);

    // Actualizar estado local de este usuario
    const updatedVotedReports = { ...votedReports };
    if (isVoting) {
      updatedVotedReports[reportId] = true;   // marcamos que votó
    } else {
      delete updatedVotedReports[reportId];   // quitamos su voto
    }

    // Parche global de totales (para UI)
    const updatedVotesPatch = { ...votesPatch, [reportId]: newVotes };

    saveVotedReports(updatedVotedReports);
    saveVotesPatch(updatedVotesPatch);
    updateUserReportVotes(reportId, newVotes);

    // ======= SINCRONIZACIÓN CON BACKEND =======
    try {
      const apiResponse = await voteReportAPI(reportId, valor);

      // Si el backend devuelve totales, usamos ese número como fuente de verdad
      if (
        apiResponse &&
        apiResponse.totales &&
        typeof apiResponse.totales.votos_positivos === "number"
      ) {
        newVotes = apiResponse.totales.votos_positivos;
        updatedVotesPatch[reportId] = newVotes;
        saveVotesPatch(updatedVotesPatch);
        updateUserReportVotes(reportId, newVotes);
      }
    } catch (apiError) {
      console.warn(
        "⚠️ No se pudo sincronizar con el servidor, usando valor local:",
        apiError
      );
      // No re-lanzamos, dejamos el valor optimista
    }

    return {
      success: true,
      voted: isVoting,   // true = quedó votado, false = quedó sin voto
      newVotes,
      reportId,
    };
  } catch (error) {
    console.error("Error crítico al votar:", error);
    throw new Error(
      error?.message || "No se pudo procesar tu voto. Intenta nuevamente."
    );
  }
};

/* ==================== SINCRONIZACIÓN ==================== */

const updateUserReportVotes = (reportId, newVotes) => {
  try {
    const userReportsRaw = localStorage.getItem("userReports");
    if (!userReportsRaw) return;

    const userReports = JSON.parse(userReportsRaw);
    const reportIndex = userReports.findIndex((r) => r.id === reportId);

    if (reportIndex !== -1) {
      userReports[reportIndex].votes = newVotes;
      localStorage.setItem("userReports", JSON.stringify(userReports));
    }
  } catch (error) {
    console.error("Error al actualizar votos en userReports:", error);
  }
};

/* ==================== HELPERS EXTRA ==================== */

export const getTotalUserVotes = () => {
  const votedReports = getVotedReports();
  return Object.keys(votedReports).length;
};

export const clearAllVotes = () => {
  try {
    localStorage.removeItem(getNamespacedKey(VOTES_STORAGE_KEY));
    localStorage.removeItem(VOTES_PATCH_KEY);
    return true;
  } catch (error) {
    console.error("Error al limpiar votos:", error);
    return false;
  }
};

export const applyVotesPatch = (reports = []) => {
  const votesPatch = getVotesPatch();
  return reports.map((report) => ({
    ...report,
    votes: votesPatch[report.id] ?? report.votes,
  }));
};
