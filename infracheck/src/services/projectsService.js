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

  const informes =
    apiProject.informes ??
    apiProject.reports_count ??
    apiProject.total_reportes ??
    (Array.isArray(reportIds) ? reportIds.length : 0);

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
    estado:
      apiProject.estado?.nombre ??
      apiProject.estado?.name ??
      apiProject.estado ??
      apiProject.status ??
      null,
    votes: typeof votes === "number" ? votes : parseInt(votes, 10) || 0,
    informes: typeof informes === "number" ? informes : parseInt(informes, 10) || 0,
    reportes_ids: Array.isArray(reportIds) ? reportIds : [],
    createdAt: apiProject.created_at ?? apiProject.createdAt ?? apiProject.fecha_creacion ?? null,
    updatedAt: apiProject.updated_at ?? apiProject.updatedAt ?? apiProject.fecha_actualizacion ?? null,
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

