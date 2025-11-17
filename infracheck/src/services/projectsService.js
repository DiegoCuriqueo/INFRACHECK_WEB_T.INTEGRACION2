import { cleanApiUrl, makeAuthenticatedRequest } from "./apiConfig";

const API_ROOT = cleanApiUrl.replace(/\/api\/v1$/, "");
const PROJECTS_ENDPOINT = `${API_ROOT}/api/proyectos/`;

const loadLocalVisibility = () => {
  try { return JSON.parse(localStorage.getItem('projects:visible') || '{}'); } catch { return {}; }
};

const loadLocalCreatorId = () => {
  try { return JSON.parse(localStorage.getItem('projects:creator_id') || '{}'); } catch { return {}; }
};
const loadLocalCreatorName = () => {
  try { return JSON.parse(localStorage.getItem('projects:creator_name') || '{}'); } catch { return {}; }
};

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

const loadLocalVotes = () => {
  try { return JSON.parse(localStorage.getItem('projects:votes') || '{}'); } catch { return {}; }
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
    // Si es fecha-only (YYYY-MM-DD), mantenerla tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
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

  let reportIds =
    apiProject.reportes_ids ||
    apiProject.report_ids ||
    (Array.isArray(reportsArray) ? reportsArray.map((r) => r?.id ?? r) : []) ||
    [];

  const singleReportId = (() => {
    const v = apiProject.denu_id ?? apiProject.denuncia_id ?? apiProject.reporte_id ?? null;
    if (v && typeof v === "object") return v.id ?? null;
    return v;
  })();

  if (singleReportId !== null && singleReportId !== undefined) {
    const base = Array.isArray(reportIds) ? reportIds : [];
    reportIds = Array.from(new Set([...base, singleReportId]));
  }

  const votes =
    apiProject.votos ??
    apiProject.votes ??
    apiProject.total_votos ??
    apiProject.totalVotes ??
    0;

  const finalVotes = (() => {
    const store = loadLocalVotes();
    const idKey = String(apiProject.id ?? apiProject.uuid ?? apiProject.pk ?? apiProject.slug ?? '');
    const entry = store[idKey];
    if (entry && typeof entry.count === 'number') return entry.count;
    const n = typeof votes === 'number' ? votes : parseInt(votes, 10) || 0;
    return n;
  })();

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

  let prioridad = null;
  if (apiProject.prioridad !== undefined && apiProject.prioridad !== null) {
    prioridad = mapString(apiProject.prioridad);
  } else if (apiProject.priority !== undefined && apiProject.priority !== null) {
    prioridad = mapString(apiProject.priority);
  }

  const lugar = mapString(apiProject.lugar || apiProject.place || apiProject.ubicacionEspecifica);

  const fechaInicioEstimada = normalizeDate(
    apiProject.proy_fecha_inicio_estimada ||
    apiProject.fechaInicioEstimada ||
    apiProject.fecha_inicio_estimada
  );

  const visible = (() => {
    const v = apiProject.proy_visible ?? apiProject.visible;
    if (v === undefined || v === null) return undefined;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
    return !!v;
  })();

  const visibleFinal = (() => {
    if (visible !== undefined) return visible;
    const store = loadLocalVisibility();
    const idKey = String(apiProject.id ?? apiProject.uuid ?? apiProject.pk ?? apiProject.slug ?? '');
    const cached = store[idKey];
    return cached === undefined ? undefined : !!cached;
  })();

  const creatorId = (() => {
    const direct = apiProject.usuario || apiProject.user || apiProject.created_by || apiProject.owner || null;
    const extractId = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      const idVal = obj.id ?? obj.user_id ?? obj.usuario_id ?? obj.pk ?? obj.uid ?? null;
      return idVal !== null && idVal !== undefined ? String(idVal) : null;
    };
    const directIdField = (
      apiProject.usuario_id ??
      apiProject.user_id ??
      apiProject.created_by_id ??
      apiProject.owner_id ??
      null
    );
    if (directIdField !== null && directIdField !== undefined) {
      return String(directIdField);
    }
    if (direct) {
      const idFromObject = extractId(direct);
      if (idFromObject) return idFromObject;
      if (typeof direct === 'string' || typeof direct === 'number') return String(direct);
    }
    const storeId = loadLocalCreatorId();
    const idKey = String(apiProject.id ?? apiProject.uuid ?? apiProject.pk ?? apiProject.slug ?? '');
    const cachedId = storeId[idKey];
    return cachedId ? String(cachedId) : null;
  })();

  const creatorName = (() => {
    const direct = apiProject.usuario || apiProject.user || apiProject.created_by || apiProject.owner || null;
    const extractName = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      const n = obj.nombre ?? obj.name ?? obj.username ?? obj.email ?? null;
      return n ? String(n) : null;
    };
    const nameField = (
      apiProject.usuario_nombre ??
      apiProject.user_name ??
      apiProject.created_by_nombre ??
      apiProject.owner_nombre ??
      null
    );
    if (nameField) return String(nameField);
    const fromObj = extractName(direct);
    if (fromObj) return fromObj;
    const storeName = loadLocalCreatorName();
    const idKey = String(apiProject.id ?? apiProject.uuid ?? apiProject.pk ?? apiProject.slug ?? '');
    const cachedName = storeName[idKey];
    return cachedName ? String(cachedName) : null;
  })();

  return {
    id: apiProject.id ?? apiProject.uuid ?? apiProject.pk ?? apiProject.slug ?? null,
    nombre:
      apiProject.nombre ??
      apiProject.nombreProyecto ??
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
    prioridad: prioridad,
    lugar: lugar,
    fechaInicioEstimada: fechaInicioEstimada,
    visible: visibleFinal,
    creator: creatorId,
    creatorName: creatorName,
    tipoDenuncia: mapString(apiProject.tipoDenuncia || apiProject.proy_tipo_denuncia),
    denuncia_titulo: mapString(apiProject.denuncia_titulo),
    denuncia_ubicacion: mapString(apiProject.denuncia_ubicacion),
    denuncia_id: apiProject.denu_id ?? apiProject.denuncia_id ?? null,
    dias_desde_creacion: (() => {
      const v = apiProject.dias_desde_creacion ?? apiProject.dias_activo ?? null;
      if (v === null || v === undefined) return null;
      const n = typeof v === 'number' ? v : parseInt(v, 10);
      return isNaN(n) ? null : n;
    })(),
    total_archivos: (() => {
      const v = apiProject.total_archivos ?? (Array.isArray(apiProject.archivos) ? apiProject.archivos.length : null);
      if (v === null || v === undefined) return null;
      const n = typeof v === 'number' ? v : parseInt(v, 10);
      return isNaN(n) ? null : n;
    })(),
    es_completado: (() => {
      const v = apiProject.es_completado ?? apiProject.completado ?? null;
      if (v === null || v === undefined) return null;
      if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
      if (typeof v === 'number') return v !== 0;
      return !!v;
    })(),
    votes: finalVotes,
    informes: informes,
    reportes_ids: Array.isArray(reportIds) ? reportIds : [],
    createdAt: normalizeDate(apiProject.created_at ?? apiProject.createdAt ?? apiProject.fecha_creacion),
    updatedAt: normalizeDate(apiProject.updated_at ?? apiProject.updatedAt ?? apiProject.fecha_actualizacion),
    raw: apiProject,
  };
};

export const getProjectById = async (id) => {
  const url = `${PROJECTS_ENDPOINT}${id}/`;
  const data = await makeAuthenticatedRequest(url);
  const mapped = transformProjectFromAPI(data);
  return mapped;
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

