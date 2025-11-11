import { cleanApiUrl, makeAuthenticatedRequest } from "./apiConfig";

const PROJECTS_BASE_URL = cleanApiUrl.replace("/v1", "");
const PROJECTS_ENDPOINT = `${PROJECTS_BASE_URL}/api/proyectos/`;

const normaliseListResponse = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.data)) return response.data;
  if (response.results && typeof response.results === "object") {
    return Object.values(response.results);
  }
  return [];
};

const mapString = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.nombre || value.name || value.title || value.label || "";
  }
  return String(value);
};

// Normalizar fecha a formato ISO string
const normalizeDate = (dateValue) => {
  if (!dateValue) return null;
  if (typeof dateValue === "string") {
    // Si ya es ISO string, devolverlo
    if (dateValue.includes("T") || dateValue.includes("Z")) {
      return dateValue;
    }
    // Intentar parsear como fecha
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
    return dateValue;
  }
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }
  return null;
};

export const transformProjectFromAPI = (apiProject) => {
  if (!apiProject) return null;

  const reportsArray =
    apiProject.reportes ||
    apiProject.reports ||
    apiProject.report_list ||
    apiProject.items ||
    [];

  const reportIds =
    apiProject.reportes_ids ||
    apiProject.report_ids ||
    (Array.isArray(reportsArray) ? reportsArray.map((r) => r?.id ?? r) : []) ||
    [];

  const votes =
    apiProject.votos ??
    apiProject.votes ??
    apiProject.total_votos ??
    apiProject.totalVotes ??
    0;

  // Calcular informes: preferir el campo explícito, sino contar reportes_ids, sino contar reportes array
  let informes = 0;
  if (apiProject.informes !== undefined && apiProject.informes !== null) {
    informes = typeof apiProject.informes === "number" ? apiProject.informes : parseInt(apiProject.informes, 10) || 0;
  } else if (apiProject.reports_count !== undefined && apiProject.reports_count !== null) {
    informes = typeof apiProject.reports_count === "number" ? apiProject.reports_count : parseInt(apiProject.reports_count, 10) || 0;
  } else if (apiProject.total_reportes !== undefined && apiProject.total_reportes !== null) {
    informes = typeof apiProject.total_reportes === "number" ? apiProject.total_reportes : parseInt(apiProject.total_reportes, 10) || 0;
  } else if (Array.isArray(reportIds) && reportIds.length > 0) {
    informes = reportIds.length;
  } else if (Array.isArray(reportsArray) && reportsArray.length > 0) {
    informes = reportsArray.length;
  }

  // Normalizar estado: puede ser objeto o string
  let estado = null;
  if (apiProject.estado) {
    if (typeof apiProject.estado === "object") {
      estado = apiProject.estado.nombre || apiProject.estado.name || apiProject.estado.label || null;
    } else {
      estado = String(apiProject.estado);
    }
  } else if (apiProject.status) {
    if (typeof apiProject.status === "object") {
      estado = apiProject.status.nombre || apiProject.status.name || apiProject.status.label || null;
    } else {
      estado = String(apiProject.status);
    }
  }

  return {
    id: apiProject.id ?? apiProject.uuid ?? apiProject.pk ?? apiProject.slug ?? null,
    nombre:
      apiProject.nombre ??
      apiProject.name ??
      apiProject.titulo ??
      apiProject.title ??
      "Proyecto",
    descripcion:
      apiProject.descripcion ??
      apiProject.description ??
      apiProject.resumen ??
      apiProject.summary ??
      "",
    comuna: mapString(apiProject.comuna),
    region: mapString(apiProject.region),
    estado: estado,
    votes: typeof votes === "number" ? votes : parseInt(votes, 10) || 0,
    informes: informes,
    reportes_ids: Array.isArray(reportIds) ? reportIds : [],
    createdAt: normalizeDate(apiProject.created_at ?? apiProject.createdAt ?? apiProject.fecha_creacion),
    updatedAt: normalizeDate(apiProject.updated_at ?? apiProject.updatedAt ?? apiProject.fecha_actualizacion),
    raw: apiProject,
  };
};

export const getProjects = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const stringValue = typeof value === "string" ? value.trim() : value;
    if (stringValue === "" || stringValue === false) return;
    params.append(key, String(stringValue));
  });

  const queryString = params.toString();
  const url = queryString ? `${PROJECTS_ENDPOINT}?${queryString}` : PROJECTS_ENDPOINT;

  const response = await makeAuthenticatedRequest(url);
  const rawProjects = normaliseListResponse(response);

  return rawProjects
    .map(transformProjectFromAPI)
    .filter(Boolean);
};

export const PROJECTS_ENDPOINT_URL = PROJECTS_ENDPOINT;

