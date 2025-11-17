// src/pages/autority/ProyectosAU.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layout/AutorityLayout";
import { getReportes } from "../../services/reportsService";
import { getProjects, transformProjectFromAPI, getProjectById } from "../../services/projectsService";
import { cleanApiUrl, makeAuthenticatedRequest } from "../../services/apiConfig";
import { useAuth } from "../../contexts/AuthContext";
import { getRegions, getCommunes } from "../../services/geoData";
import { useTheme } from "../../themes/ThemeContext";

/* ──────────────────────────────
   Helpers de API (solo servidor)
   ────────────────────────────── */
const PROJECTS_BASE_URL = cleanApiUrl.replace(/\/api\/v1$/, '');
const PROJ_COMMENTS_PREFIX = "authorityProjectComments:";
const commentsKey = (id) => `${PROJ_COMMENTS_PREFIX}${id}`;
function loadLocalComments(projectId) {
  try {
    const raw = localStorage.getItem(commentsKey(projectId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveLocalComment(projectId, comment) {
  const all = loadLocalComments(projectId);
  const updated = [comment, ...all];
  try { localStorage.setItem(commentsKey(projectId), JSON.stringify(updated)); } catch {}
  return comment;
}
function saveLocalCommentsList(projectId, list) {
  try { localStorage.setItem(commentsKey(projectId), JSON.stringify(list)); } catch {}
}

const P = {
  light: {
    bg: "#FFFFFF",
    surface: "#F8FAFC",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    border: "#CBD5E1",
    indigo: "#4F46E5",
    emerald: "#059669",
    amber: "#F59E0B",
    rose: "#E11D48"
  },
  dark: {
    bg: "#0F1525",
    surface: "#0F1525",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    border: "rgba(255,255,255,0.1)",
    indigo: "#6366F1",
    emerald: "#10B981",
    amber: "#F59E0B",
    rose: "#F43F5E"
  }
};

async function apiListarComentariosProyecto(id) {
  return loadLocalComments(id);
}
async function apiAgregarComentarioProyecto(id, texto, author, authorId) {
  const nuevo = {
    id: crypto.randomUUID?.() || String(Date.now()),
    texto: (texto || '').trim(),
    author: author || 'Usuario',
    authorId: authorId || null,
    createdAt: new Date().toISOString(),
    parentId: null,
  };
  return saveLocalComment(id, nuevo);
}
async function apiResponderComentarioProyecto(id, parentId, texto, author, authorId) {
  const reply = {
    id: crypto.randomUUID?.() || String(Date.now()),
    texto: (texto || '').trim(),
    author: author || 'Usuario',
    authorId: authorId || null,
    createdAt: new Date().toISOString(),
    parentId: parentId,
  };
  return saveLocalComment(id, reply);
}
async function apiEliminarComentarioProyecto(projectId, commentId) {
  const list = loadLocalComments(projectId);
  const filtered = list.filter(c => String(c.id) !== String(commentId) && String(c.parentId) !== String(commentId));
  saveLocalCommentsList(projectId, filtered);
  return { ok: true };
}

async function apiEditarComentarioProyecto(projectId, commentId, texto) {
  const list = loadLocalComments(projectId);
  const updated = list.map(c => String(c.id) === String(commentId) ? { ...c, texto: (texto || '').trim(), editedAt: new Date().toISOString() } : c);
  saveLocalCommentsList(projectId, updated);
  const changed = updated.find(c => String(c.id) === String(commentId));
  return changed || { id: commentId, texto: (texto || '').trim(), editedAt: new Date().toISOString() };
}
function loadLocalVotes() {
  try { return JSON.parse(localStorage.getItem('projects:votes') || '{}'); } catch { return {}; }
}
function saveLocalVotes(data) {
  try { localStorage.setItem('projects:votes', JSON.stringify(data)); } catch {}
}
function loadLocalVisibility() {
  try { return JSON.parse(localStorage.getItem('projects:visible') || '{}'); } catch { return {}; }
}
function saveLocalVisibility(id, value) {
  try {
    const store = loadLocalVisibility();
    store[String(id)] = !!value;
    localStorage.setItem('projects:visible', JSON.stringify(store));
  } catch {}
}
function loadLocalCreator() {
  try { return JSON.parse(localStorage.getItem('projects:creator') || '{}'); } catch { return {}; }
}
function saveLocalCreator(id, name) {
  try {
    const store = loadLocalCreator();
    store[String(id)] = String(name || 'Usuario');
    localStorage.setItem('projects:creator', JSON.stringify(store));
  } catch {}
}
function loadLocalCreatorId() {
  try { return JSON.parse(localStorage.getItem('projects:creator_id') || '{}'); } catch { return {}; }
}
function saveLocalCreatorId(id, userId) {
  try {
    const store = loadLocalCreatorId();
    store[String(id)] = String(userId || '');
    localStorage.setItem('projects:creator_id', JSON.stringify(store));
  } catch {}
}
function hasUserVotedProject(id, userId) {
  const store = loadLocalVotes();
  const entry = store[String(id)] || { count: 0, voters: {} };
  return Boolean(entry.voters?.[String(userId)]);
}
async function apiVotarProyecto(id, delta = 1, userId = 'anon') {
  const store = loadLocalVotes();
  const key = String(id);
  const entry = store[key] || { count: 0, voters: {} };
  const already = Boolean(entry.voters[String(userId)]);
  let hasVoted = already;
  let count = entry.count || 0;
  if (delta > 0 && !already) {
    entry.voters[String(userId)] = true;
    count = Math.max(0, count + 1);
    hasVoted = true;
  } else if (delta < 0 && already) {
    delete entry.voters[String(userId)];
    count = Math.max(0, count - 1);
    hasVoted = false;
  }
  entry.count = count;
  store[key] = entry;
  saveLocalVotes(store);
  try { window.dispatchEvent(new Event('projects:changed')); } catch {}
  return { id, votes: count, hasVoted };
}

// Eliminado almacenamiento local: se usa solo API
async function apiListarProyectos(q = "") {
  const rawSearch = q.trim();
  const filters = rawSearch ? { search: rawSearch } : {};
  const remotos = await getProjects(filters);
  return Array.isArray(remotos) ? remotos : [];
}

async function apiListarReportes(q = "") {
  const rawSearch = q.trim();
  const reports = await getReportes(rawSearch ? { search: rawSearch } : {});
  return reports.map(r => ({ id: r.id, titulo: r.title || r.summary || "Reporte", user: r.user || "Usuario" }));
}

async function apiCrearProyecto({ nombre, descripcion, reportes_ids, comuna, region, estado, lugar, prioridad, fecha_inicio_estimada, tipo_denuncia }) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Debes iniciar sesión');
  const firstReportId = Array.isArray(reportes_ids) && reportes_ids.length > 0 ? reportes_ids[0] : null;
  const payload = {
    proy_titulo: (nombre || '').trim(),
    proy_descripcion: (descripcion || '').trim(),
    denu_id: firstReportId,
    ...(estado ? { proy_estado: parseInt(estado) } : {}),
    ...((lugar || comuna) ? { proy_lugar: String(lugar || comuna).trim() } : {}),
    ...(prioridad ? { proy_prioridad: parseInt(prioridad) } : {}),
    ...(fecha_inicio_estimada ? { proy_fecha_inicio_estimada: String(fecha_inicio_estimada).trim() } : {}),
    ...(tipo_denuncia ? { proy_tipo_denuncia: String(tipo_denuncia).trim() } : {}),
  };
  const createUrl = `${PROJECTS_BASE_URL}/api/proyectos/create/`;
  return await makeAuthenticatedRequest(createUrl, { method: 'POST', body: JSON.stringify(payload) });
}
async function apiEliminarProyecto(id) {
  const primary = `${PROJECTS_BASE_URL}/api/proyectos/${id}/`;
  const fallback = `${PROJECTS_BASE_URL}/api/proyectos/${id}/delete/`;
  try {
    const res = await makeAuthenticatedRequest(fallback, { method: 'DELETE' });
    return { ok: true, deletedId: id, response: res };
  } catch (e1) {
    try {
      const res2 = await makeAuthenticatedRequest(primary, { method: 'DELETE' });
      return { ok: true, deletedId: id, response: res2 };
    } catch (e2) {
      return { ok: false, error: e2?.message || e1?.message };
    }
  }
}

async function apiEditarProyecto(id, { nombre, descripcion, estado, lugar, prioridad, fecha_inicio_estimada, tipo_denuncia, visible }) {
  const payload = {
    ...(nombre ? { proy_titulo: (nombre || '').trim() } : {}),
    ...(descripcion ? { proy_descripcion: (descripcion || '').trim() } : {}),
    ...(estado ? { proy_estado: parseInt(estado) } : {}),
    ...(lugar ? { proy_lugar: String(lugar).trim() } : {}),
    ...(prioridad ? { proy_prioridad: parseInt(prioridad) } : {}),
    ...(fecha_inicio_estimada ? { proy_fecha_inicio_estimada: String(fecha_inicio_estimada).trim() } : {}),
    ...(tipo_denuncia ? { proy_tipo_denuncia: String(tipo_denuncia).trim() } : {}),
    ...(visible !== undefined ? { proy_visible: visible ? 1 : 0 } : {}),
  };
  const updateUrl = `${PROJECTS_BASE_URL}/api/proyectos/${id}/update/`;
  try {
    return await makeAuthenticatedRequest(updateUrl, { method: 'PUT', body: JSON.stringify(payload) });
  } catch (e0) {
    return await makeAuthenticatedRequest(updateUrl, { method: 'PATCH', body: JSON.stringify(payload) });
  }
}

/* ──────────────────────────────
   Página: Proyectos (Autoridad)
   ────────────────────────────── */
export default function ProyectosAU() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.get("q") || "";
    } catch {
      return "";
    }
  });

  const [open, setOpen] = useState(false);   // modal
  const [tick, setTick] = useState(0);       // refrescar luego de crear
  const [detalle, setDetalle] = useState(null); // proyecto seleccionado para detalle
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const currentUserId = user?.user_id || user?.id || user?.username || 'anon';
  const { theme } = useTheme();
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const data = await apiListarProyectos(q);
      if (!alive) return;
      setItems(data);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [q, tick]);

  // Si viene un parámetro ?id= desde HomeAU, abrir el detalle automáticamente
  useEffect(() => {
    if (loading) return;
    const target = searchParams.get("id");
    if (!target) return;
    const found = items.find(p => String(p.id) === String(target) || String(p.nombre) === String(target));
    if (found) setDetalle(found);
  }, [loading, items, searchParams]);

  // Votar directamente desde la tarjeta (▲/▼)
  const voteOnCard = async (proj, delta) => {
    try {
      const updated = await apiVotarProyecto(proj?.id, delta, currentUserId);
      setItems(prev => prev.map(it => (
        String(it.id) === String(proj.id)
          ? { ...it, votes: updated?.votes ?? Math.max(0, (it.votes || 0) + (updated?.hasVoted ? +1 : -1)), voted: updated?.hasVoted }
          : it
      )));
    } catch (e) {
      console.error('Error votando proyecto:', e);
    }
  };

  return (
    <DashboardLayout>
      <section className="space-y-4 font-sans">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Proyectos</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Gestión de informes por proyecto.</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 shadow-sm hover:shadow-md transition text-white"
          >
            + Nuevo proyecto
          </button>
        </header>

        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar proyecto..."
            className="w-72 px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-300/40 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:border-indigo-400"
          />
        </div>

        {loading ? (
          <p className="text-slate-600 dark:text-slate-400">Cargando…</p>
        ) : items.length === 0 ? (
          <div className="p-6 rounded-2xl border border-slate-300/40 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300">
            No hay proyectos.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((p) => {
              const hasVoted = Boolean(p.voted);
              return (
              <article
                key={p.id ?? p.nombre}
                onClick={() => setDetalle(p)}
                role="button"
                aria-label={`Abrir detalles de ${p.nombre}`}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/40 hover:shadow-lg border-slate-300/40 dark:border-white/10 bg-white dark:bg-white/5`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className={`font-semibold inline-flex items-center gap-2 text-slate-900 dark:text-slate-100`}>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">📁</span>
                      <span className="truncate">{p.nombre}</span>
                    </h3>
                    <p className={`text-sm mt-1 line-clamp-2 text-slate-700 dark:text-slate-300`}>
                      {p.descripcion ?? "Sin descripción"}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {p.region && (
                        <span className={`px-2 py-0.5 rounded-full border border-slate-300/40 dark:border-white/15 bg-white dark:bg-[#0F1525] text-indigo-700 dark:text-indigo-200`}>{p.region}</span>
                      )}
                      <span className={'text-slate-600 dark:text-slate-400'}>{p.comuna ?? "—"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {(() => {
                      const label = ({ '1':'Planificación','2':'En Progreso','3':'Completado','4':'Cancelado','5':'Pendiente','6':'Aprobado','7':'Rechazado' })[String((p?.raw?.proy_estado) ?? '')] || p?.estado || '—';
                      const color = ({
                        'Planificación': 'border-amber-400/30 text-amber-700 dark:text-amber-200',
                        'En Progreso': 'border-indigo-400/30 text-indigo-700 dark:text-indigo-200',
                        'Completado': 'border-emerald-400/30 text-emerald-700 dark:text-emerald-200',
                        'Cancelado': 'border-rose-400/30 text-rose-700 dark:text-rose-200',
                        'Pendiente': 'border-slate-400/30 text-slate-700 dark:text-slate-200',
                        'Aprobado': 'border-green-400/30 text-green-700 dark:text-green-200',
                        'Rechazado': 'border-rose-400/30 text-rose-700 dark:text-rose-200'
                      })[label] || 'border-slate-300/40 dark:border-white/15 text-slate-700 dark:text-slate-200';
                      return (
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${color} bg-white dark:bg-[#0F1525]`}>{label}</span>
                      );
                    })()}
                    {typeof p.votes === "number" && (
                      <span className={`text-xs px-2.5 py-1 rounded-full border border-emerald-400/30 bg-white dark:bg-[#0F1525] text-emerald-700 dark:text-emerald-200`}>▲ {p.votes}</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <div className={`inline-flex rounded-full overflow-hidden border border-slate-300/40 dark:border-white/10`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); voteOnCard(p, +1); }}
                      disabled={hasVoted}
                      title="Votar a favor"
                      aria-label="Votar a favor"
                      className={`px-3 py-1 text-xs bg-emerald-600/20 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-40 transition`}
                    >
                      ▲ Votar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); voteOnCard(p, -1); }}
                      disabled={!hasVoted}
                      title="Quitar voto"
                      aria-label="Quitar voto"
                      className={`px-3 py-1 text-xs bg-rose-600/20 text-rose-700 dark:text-rose-200 hover:bg-rose-600/30 disabled:opacity-40 transition`}
                    >
                      ▼ Quitar voto
                    </button>
                  </div>
                </div>
              </article>
            );
            })}
          </div>
        )}
      </section>

      {open && (
        <ModalCrearProyecto
          onClose={() => setOpen(false)}
          onOk={(created) => { setOpen(false); setTick(t => t + 1); setDetalle(created); }}
        />
      )}

      {detalle && (
        <ModalDetalleProyecto
          proyecto={detalle}
          onClose={() => setDetalle(null)}
          onGoToReportes={() => { setDetalle(null); navigate('/autority/reportes'); }}
          onProjectUpdated={(updated) => {
            setDetalle(prev => ({ ...prev, ...updated }));
            setItems(prev => prev.map(it => (
              String(it.id) === String(updated?.id)
                ? { ...it, ...updated }
                : it
            )));
            
            }}
          onProjectDeleted={(deleted) => { setDetalle(null); setItems(prev => prev.filter(p => String(p.id) !== String(deleted.id))); setTick(t => t + 1); }}
        />
      )}
    </DashboardLayout>
  );
}

/* ──────────────────────────────
   Modal: Crear Proyecto (UX amigable)
   ────────────────────────────── */
function ModalCrearProyecto({ onClose, onOk }) {
  // campos
  const { user } = useAuth();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [region, setRegion] = useState("");
  const [comunes, setComunes] = useState([]);
  const [comuna, setComuna] = useState("");
  const [estado, setEstado] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [visible, setVisible] = useState(true);
  // selector de reportes
  const [reportes, setReportes] = useState([]);
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState([]); // [{id,titulo}, ...]

  // estado UI
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const maxNombre = 80;
  const maxDesc = 500;

  // cargar reportes desde la API
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const apiReports = await getReportes();
        if (!alive) return;
        const mapped = apiReports.map(r => ({
          id: r.id,
          titulo: r.title || r.summary || "Reporte",
          user: r.user || "Usuario"
        }));
        setReportes(mapped);
      } catch (error) {
        const sample = await apiListarReportes();
        if (!alive) return;
        setReportes(Array.isArray(sample) ? sample : []);
      }
    })();
    return () => { alive = false; };
  }, []);

  // actualizar comunas al seleccionar región
  useEffect(() => {
    setComunes(region ? getCommunes(region) : []);
    setComuna("");
  }, [region]);

  // filtros + UX
  const listaFiltrada = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return reportes;
    return reportes.filter(r =>
      (r.titulo || "").toLowerCase().includes(q) || (r.user || "").toLowerCase().includes(q)
    );
  }, [busca, reportes]);

  // agrupación simple por usuario (sin afectar otras páginas)
  const grupos = useMemo(() => {
    const map = new Map();
    for (const r of listaFiltrada) {
      const owner = r.user || r.usuario || "Usuario";
      if (!map.has(owner)) map.set(owner, []);
      map.get(owner).push(r);
    }
    return Array.from(map.entries()).map(([owner, items]) => ({ owner, items }));
  }, [listaFiltrada]);

  const idsSeleccionados = useMemo(() => new Set(sel.map(s => s.id)), [sel]);

  const toggle = (item) => {
    setSel([{ id: item.id, titulo: item.titulo }]);
  };

  const quitarChip = (id) => setSel(sel.filter(s => s.id !== id));

  // validación simple
  const validar = () => {
    if (!nombre.trim()) return "El nombre es obligatorio.";
    if (nombre.trim().length < 3) return "El nombre debe tener al menos 3 caracteres.";
    if (nombre.trim().length > 50) return "El nombre no debe superar 50 caracteres.";
    if (nombre.length > maxNombre) return `Máximo ${maxNombre} caracteres en nombre.`;
    const descTrim = descripcion.trim();
    if (descTrim.length < 20) return "La descripción debe tener al menos 20 caracteres.";
    if (descripcion.length > maxDesc) return `Máximo ${maxDesc} caracteres en descripción.`;
    if (!region.trim()) return "Selecciona una región.";
    if (sel.length !== 1) return "Selecciona exactamente un reporte asociado.";
    return "";
  };

  const submit = async () => {
    const v = validar();
    if (v) { setErr(v); return; }
    setErr("");
    setSaving(true);
    try {
      const creado = await apiCrearProyecto({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        comuna: comuna.trim(),
        region: region.trim(),
        reportes_ids: sel.map(s => s.id),
        estado,
        prioridad,
        fecha_inicio_estimada: fechaInicio,
      });
      try { if (creado?.id !== undefined && creado?.id !== null) { await apiEditarProyecto(creado.id, { visible }); } } catch {}
      try { if (creado?.id !== undefined && creado?.id !== null) { saveLocalVisibility(creado.id, visible); } } catch {}
      try { if (creado?.id !== undefined && creado?.id !== null) { saveLocalCreatorId(creado.id, (user?.user_id ?? user?.id ?? '')); } } catch {}
      try { if (creado?.id !== undefined && creado?.id !== null) { saveLocalCreator(creado.id, (user?.username || user?.name || 'Usuario')); } } catch {}
      const mapped = transformProjectFromAPI(creado) || {
        id: creado?.id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        comuna: comuna.trim(),
        region: region.trim(),
        reportes_ids: sel.map(s => s.id),
        informes: sel.length,
        votes: 0,
        estado: (estado ? ({ '1':'Planificación','2':'En Progreso','3':'Completado','4':'Cancelado','5':'Pendiente','6':'Aprobado','7':'Rechazado' })[String(estado)] : undefined),
        prioridad: (prioridad ? ({ '1':'Normal','2':'Importante','3':'Muy Importante' })[String(prioridad)] : undefined),
        lugar: (comuna || '').trim() || undefined,
        fechaInicioEstimada: fechaInicio ? String(fechaInicio) : undefined,
        visible: visible,
        creator: (user?.user_id ?? user?.id ?? null),
        creatorName: (user?.username || user?.name || 'Usuario'),
        raw: { proy_estado: estado ? parseInt(estado) : undefined, proy_prioridad: prioridad ? parseInt(prioridad) : undefined }
      };
      // Asegurar que los IDs seleccionados queden reflejados
      mapped.reportes_ids = sel.map(s => s.id);
      onOk?.(mapped);
      try { window.dispatchEvent(new Event('projects:changed')); } catch {}
    } catch (e) {
      setErr(e.message || "Error creando proyecto");
    } finally {
      setSaving(false);
    }
  };

  // cerrar con ESC / backdrop
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-300/40 dark:border-white/10 bg-white dark:bg-[#0F1525] shadow-2xl overflow-hidden">
        {/* Header fijo */}
        <header className="flex items-start justify-between p-6 pb-4 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Nuevo proyecto</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Crea un proyecto para agrupar reportes y priorizar soluciones.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">✕</button>
        </header>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid gap-4">
          {/* Nombre */}
          <div className="rounded-2xl border border-slate-300/40 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
            <label className="text-sm text-slate-700 dark:text-slate-300">Nombre *</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Baches en Temuco"
              className="mt-1 w-full rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/10 px-3 py-2 outline-none"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span>Obligatorio</span>
              <span>{nombre.length}/{maxNombre}</span>
            </div>
          </div>

          {/* Región y Comuna dependientes */}
          <div className="rounded-2xl border border-slate-300/40 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300">Región</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/20 px-3 py-2 outline-none focus:border-indigo-400"
                >
                  <option value="">Selecciona una región…</option>
                  {getRegions().map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300">Ciudad/Comuna</label>
                <select
                  value={comuna}
                  onChange={(e) => setComuna(e.target.value)}
                  disabled={!region}
                  className="mt-1 w-full rounded-xl bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/20 px-3 py-2 outline-none focus:border-indigo-400 disabled:opacity-60"
                >
                  <option value="">{region ? "Selecciona una comuna…" : "Selecciona una región primero"}</option>
                  {comunes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="rounded-2xl border border-slate-300/40 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
            <label className="text-sm text-slate-700 dark:text-slate-300">Descripción</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Objetivo, alcance y criterios de priorización…"
              className="mt-1 w-full rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/10 px-3 py-2 outline-none"
            />
            <div className="mt-1 text-right text-[11px] text-slate-600 dark:text-slate-400">
              {descripcion.length}/{maxDesc}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-300/40 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300">Estado</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/20 px-3 py-2 outline-none focus:border-indigo-400"
                >
                  <option value="">Selecciona estado…</option>
                  <option value="1">Planificación</option>
                  <option value="2">En Progreso</option>
                  <option value="3">Completado</option>
                  <option value="4">Cancelado</option>
                  <option value="5">Pendiente</option>
                  <option value="6">Aprobado</option>
                  <option value="7">Rechazado</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300">Prioridad</label>
                <select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/20 px-3 py-2 outline-none focus:border-indigo-400"
                >
                  <option value="">Selecciona prioridad…</option>
                  <option value="1">Normal</option>
                  <option value="2">Importante</option>
                  <option value="3">Muy Importante</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300">Fecha inicio estimada</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/20 px-3 py-2 outline-none focus:border-indigo-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-700 dark:text-slate-300">Visibilidad</label>
                <div className="mt-1 inline-flex rounded-xl border border-slate-300/40 dark:border-white/10 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setVisible(true)}
                    className={`px-3 py-2 text-sm transition-colors ${visible ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    Visible
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className={`px-3 py-2 text-sm transition-colors ${!visible ? 'bg-rose-600 text-white' : 'bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    Oculto
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reportes asociados */}
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300">Reportes asociados</label>

            {/* Chips seleccionados */}
            {sel.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto overflow-x-hidden flex flex-wrap gap-2 rounded-xl border border-slate-300/40 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2">
                {sel.map(s => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 text-indigo-200 px-3 py-1 text-xs"
                  >
                    <span className="truncate max-w-[200px]">{s.titulo || "Reporte"}</span>
                    <button 
                      onClick={() => quitarChip(s.id)} 
                      className="hover:text-white flex-shrink-0 transition-colors"
                      title="Quitar reporte"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Buscador + lista */}
            <div className="mt-2 flex items-center gap-2">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar reporte por título o usuario…"
                className="w-full rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/10 px-3 py-2 outline-none"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">{sel.length} seleccionado(s)</span>
            </div>

            <div className="mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-300/40 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              {listaFiltrada.length === 0 ? (
            <div className="px-3 py-4 text-slate-600 dark:text-slate-400 text-sm text-center">No hay reportes disponibles.</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-white/10">
                  {grupos.map((g) => (
                    <div key={g.owner} className="">
              <div className="sticky top-0 z-10 bg-white dark:bg-[#0F1525] px-3 py-2 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
                        <span className="inline-flex items-center gap-2">👤 {g.owner}</span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">{g.items.length} reporte(s)</span>
                      </div>
                      <ul className="divide-y divide-white/5">
                        {g.items.map((r) => {
                          const activo = idsSeleccionados.has(r.id);
                          return (
                            <li
                              key={r.id}
                              className={`flex items-center justify-between gap-3 px-3 py-2 cursor-pointer transition-colors ${
                                activo ? "bg-indigo-500/10" : "hover:bg-white/5"
                              }`}
                              onClick={() => toggle(r)}
                            >
                              <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-900 dark:text-slate-200 truncate" title={r.titulo}>
                                  {r.titulo ?? "Reporte"}
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={activo}
                                onChange={() => toggle(r)}
                                className="accent-indigo-500 flex-shrink-0 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {err && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {err}
            </div>
          )}
          </div>
        </div>

        {/* Footer fijo */}
        <footer className="p-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2 flex-shrink-0 bg-white dark:bg-[#0F1525]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 transition-colors"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium transition-colors"
            disabled={saving}
          >
            {saving ? "Creando..." : "Crear proyecto"}
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ──────────────────────────────
   Modal: Detalle de Proyecto (overlay)
   ────────────────────────────── */
function ModalDetalleProyecto({ proyecto, onClose, onGoToReportes, onProjectUpdated, onProjectDeleted }) {
  const { user } = useAuth();
  const currentUserId = user?.user_id || user?.id || user?.username || 'anon';
  const [allReports, setAllReports] = useState([]);
  const [votes, setVotes] = useState(() => proyecto?.votes ?? 0);
  const [hasVoted, setHasVoted] = useState(() => Boolean(proyecto?.voted));
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [errComment, setErrComment] = useState("");
  const maxCommentLen = 300;
  const authorName = user?.username || user?.name || 'Usuario';
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyPosting, setReplyPosting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingPosting, setEditingPosting] = useState(false);
  const [replyLimitByComment, setReplyLimitByComment] = useState({});
   // Minimizar comentarios
   const [commentsCollapsed, setCommentsCollapsed] = useState(true);
  

   // Edición de proyecto
  const [editingProject, setEditingProject] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [editNombre, setEditNombre] = useState(proyecto?.nombre || '');
  const [editDescripcion, setEditDescripcion] = useState(proyecto?.descripcion || '');
  const [editComuna, setEditComuna] = useState(proyecto?.comuna || '');
  const [editRegion, setEditRegion] = useState(proyecto?.region || '');
  const [editEstado, setEditEstado] = useState('');
  const [editPrioridad, setEditPrioridad] = useState('');
  const [editFechaInicio, setEditFechaInicio] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [editComunes, setEditComunes] = useState([]);
   const [editSelectedIds, setEditSelectedIds] = useState(() => new Set((proyecto?.reportes_ids || []).map(String)));
  const [editedProject, setEditedProject] = useState(null);
  const [fullProject, setFullProject] = useState(null);

  const pBase = editedProject ?? fullProject ?? proyecto;
  const p = editingProject ? {
    ...pBase,
    nombre: (editNombre || pBase?.nombre || pBase?.titulo || pBase?.nombreProyecto || ''),
    descripcion: (editDescripcion || pBase?.descripcion || ''),
    comuna: (editComuna || pBase?.comuna || ''),
    region: (editRegion || pBase?.region || ''),
    estado: (editEstado ? ({ '1':'Planificación','2':'En Progreso','3':'Completado','4':'Cancelado','5':'Pendiente','6':'Aprobado','7':'Rechazado' })[String(editEstado)] : (pBase?.estado || '')),
    prioridad: (editPrioridad ? ({ '1':'Normal','2':'Importante','3':'Muy Importante' })[String(editPrioridad)] : (pBase?.prioridad || '')),
    lugar: (pBase?.lugar || pBase?.comuna || ''),
    fechaInicioEstimada: (editFechaInicio ? String(editFechaInicio) : pBase?.fechaInicioEstimada),
    visible: editVisible,
    tipoDenuncia: (pBase?.tipoDenuncia || ''),
    raw: {
      ...(pBase?.raw || {}),
      proy_estado: editEstado ? parseInt(editEstado) : pBase?.raw?.proy_estado,
      proy_prioridad: editPrioridad ? parseInt(editPrioridad) : pBase?.raw?.proy_prioridad
    }
  } : pBase;
  const ubicRaw = p?.denuncia_ubicacion || '';
  const ubic = (() => {
    const m = String(ubicRaw).match(/POINT\s*\(\s*([-\d\.]+)\s+([-\d\.]+)\s*\)/i);
    if (m) return `${m[2]}, ${m[1]}`;
    const s = String(ubicRaw);
    return s.length > 120 ? (s.slice(0, 120) + '…') : s;
  })();

  const creadoAt = p?.createdAt || p?.fechaCreacion;
  const actualizadoAt = p?.updatedAt || p?.ultima_actualizacion;
  const regionDispRaw = (editedProject?.region) || (proyecto?.region) || (fullProject?.region) || (p?.region) || (p?.raw?.region ? String(p.raw.region) : '') || '';
  const comunaDisp = (editedProject?.comuna) || (proyecto?.comuna) || (fullProject?.comuna) || (p?.comuna) || (p?.raw?.comuna ? String(p.raw.comuna) : '') || p?.lugar || '';
  const regionFromComuna = (c) => {
    if (!c) return '';
    try {
      const regions = getRegions();
      for (const r of regions) {
        const cs = getCommunes(r);
        if (Array.isArray(cs) && cs.includes(c)) return r;
      }
    } catch {}
    return '';
  };
  const regionDisp = regionDispRaw || regionFromComuna(comunaDisp);
  const visibleDisp = (() => {
    const candidates = [editedProject?.visible, fullProject?.visible, proyecto?.visible, p?.visible];
    for (const v of candidates) {
      if (typeof v === 'boolean') return v;
    }
    const rv = (p?.raw?.proy_visible ?? proyecto?.raw?.proy_visible ?? fullProject?.raw?.proy_visible);
    if (rv === undefined || rv === null) return undefined;
    if (typeof rv === 'number') return rv !== 0;
    if (typeof rv === 'string') return rv === '1' || rv.toLowerCase() === 'true';
    return !!rv;
  })();
  const visibleDispText = (visibleDisp === undefined ? '—' : (visibleDisp ? 'Visible' : 'Oculto'));
  const fechaInicioDisplay = (() => {
    const raw = p?.fechaInicioEstimada;
    if (!raw) return '—';
    const s = String(raw);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y,m,d] = s.split('-');
      return `${d}-${m}-${y}`;
    }
    try { const dt = new Date(s); if (!isNaN(dt)) return dt.toLocaleDateString(); } catch {}
    return s;
  })();

  useEffect(() => {
    try {
      setHasVoted(hasUserVotedProject(proyecto?.id, currentUserId));
      const store = loadLocalVotes();
      const entry = store[String(proyecto?.id)] || { count: proyecto?.votes || 0 };
      setVotes(typeof entry.count === 'number' ? entry.count : (proyecto?.votes || 0));
    } catch {
      setHasVoted(Boolean(proyecto?.voted));
      setVotes(proyecto?.votes || 0);
    }
  }, [proyecto, currentUserId]);

  // Resetear estados de edición cuando cambia el proyecto
  useEffect(() => {
    setEditNombre(proyecto?.nombre || '');
    setEditDescripcion(proyecto?.descripcion || '');
    setEditComuna(proyecto?.comuna || '');
    setEditRegion(proyecto?.region || '');
    setEditSelectedIds(new Set((proyecto?.reportes_ids || []).map(String)));
    setEditedProject(null);
    const estadoCode = (proyecto?.raw?.proy_estado !== undefined && proyecto?.raw?.proy_estado !== null)
      ? String(proyecto.raw.proy_estado)
      : ({ 'Planificación':'1','En Progreso':'2','Completado':'3','Cancelado':'4','Pendiente':'5','Aprobado':'6','Rechazado':'7' })[String(proyecto?.estado || '').trim()] || '';
    const prioridadCode = (proyecto?.raw?.proy_prioridad !== undefined && proyecto?.raw?.proy_prioridad !== null)
      ? String(proyecto.raw.proy_prioridad)
      : ({ 'Normal':'1','Importante':'2','Muy Importante':'3' })[String(proyecto?.prioridad || '').trim()] || '';
    setEditEstado(estadoCode);
    setEditPrioridad(prioridadCode);
    setEditFechaInicio(() => {
      const v = proyecto?.fechaInicioEstimada;
      if (!v) return '';
      const d = new Date(v);
      return isNaN(d.getTime()) ? '' : d.toISOString().slice(0,10);
    });
    setEditVisible(Boolean(proyecto?.visible));
    setEditComunes(proyecto?.region ? getCommunes(proyecto.region) : []);
    setFullProject(null);
  }, [proyecto]);

  useEffect(() => {
    setEditComunes(editRegion ? getCommunes(editRegion) : []);
    if (!editRegion) setEditComuna('');
  }, [editRegion]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!proyecto?.id) return;
      try {
        const data = await getProjectById(proyecto.id);
        if (!alive) return;
        setFullProject(data);
      } catch {}
    })();
    return () => { alive = false; };
  }, [proyecto?.id]);
  

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const apiReports = await getReportes();
        if (!alive) return;
        const mapped = apiReports.map(r => ({
          id: r.id,
          titulo: r.title || r.summary || "Reporte",
          user: r.user || "Usuario",
        }));
        setAllReports(mapped);
      } catch (error) {
        const sample = await apiListarReportes();
        if (!alive) return;
        setAllReports(Array.isArray(sample) ? sample : []);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await apiListarComentariosProyecto(proyecto?.id);
      if (!alive) return;
      setComments(Array.isArray(list) ? list : []);
    })();
    return () => { alive = false; };
  }, [proyecto]);

  const [associatedReports, setAssociatedReports] = useState([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const url = `${PROJECTS_BASE_URL}/api/proyectos/${proyecto?.id}/reports/`;
        const data = await makeAuthenticatedRequest(url);
        const list = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
        if (!alive) return;
        setAssociatedReports(list.map(r => ({ id: r.id, titulo: r.titulo || r.descripcion || 'Reporte', user: r.usuario || 'Usuario' })));
      } catch (e) {
        if (!alive) return;
        setAssociatedReports([]);
      }
    })();
    return () => { alive = false; };
  }, [proyecto]);

  const asociados = associatedReports;

  const handleVote = async (delta) => {
    const res = await apiVotarProyecto(proyecto?.id, delta, currentUserId);
    setHasVoted(Boolean(res?.hasVoted));
    setVotes(typeof res?.votes === 'number' ? res.votes : votes);
    onProjectUpdated?.({ id: proyecto?.id, votes: res?.votes, voted: res?.hasVoted });
    try { window.dispatchEvent(new Event('projects:changed')); } catch {}
  };

  const handleAddComment = async () => {
    const text = newComment.trim();
    if (!text) { setErrComment("El comentario está vacío."); return; }
    if (text.length > maxCommentLen) { setErrComment(`Máximo ${maxCommentLen} caracteres.`); return; }
    setPosting(true);
    setErrComment("");
    try {
      const created = await apiAgregarComentarioProyecto(proyecto?.id, text, authorName, currentUserId);
      setComments([created, ...comments]);
      setNewComment("");
    } finally {
      setPosting(false);
    }
  };

  const handleAddReply = async () => {
    const text = replyText.trim();
    if (!replyTo) return;
    if (!text) return;
    if (text.length > maxCommentLen) return;
    setReplyPosting(true);
    try {
      const created = await apiResponderComentarioProyecto(proyecto?.id, replyTo, text, authorName, currentUserId);
      setComments([created, ...comments]);
      setReplyText("");
      setReplyTo(null);
    } finally {
      setReplyPosting(false);
    }
  };
  const handleDeleteComment = async (id) => {
    setDeletingId(id);
    const res = await apiEliminarComentarioProyecto(proyecto?.id, id);
    if (res?.ok) {
      setComments(prev => prev.filter(c => String(c.id) !== String(id) && String(c.parentId) !== String(id)));
    }
    setDeletingId(null);
  };

  const handleDeleteProject = async () => {
    setConfirmingDelete(false);
    const res = await apiEliminarProyecto(proyecto?.id);
    if (res?.ok) {
      onProjectDeleted?.({ id: proyecto?.id });
      try { window.dispatchEvent(new Event('projects:changed')); } catch {}
    }
  };

  // Edición de proyecto
  const toggleEditProject = () => {
    setEditingProject((v) => !v);
    setEditNombre(proyecto?.nombre || '');
    setEditDescripcion(proyecto?.descripcion || '');
    setEditComuna(proyecto?.comuna || '');
    setEditRegion(proyecto?.region || '');
    setEditComunes(proyecto?.region ? getCommunes(proyecto.region) : []);
    const estadoCode = (proyecto?.raw?.proy_estado !== undefined && proyecto?.raw?.proy_estado !== null)
      ? String(proyecto.raw.proy_estado)
      : ({ 'Planificación':'1','En Progreso':'2','Completado':'3','Cancelado':'4','Pendiente':'5','Aprobado':'6','Rechazado':'7' })[String(proyecto?.estado || '').trim()] || '';
    const prioridadCode = (proyecto?.raw?.proy_prioridad !== undefined && proyecto?.raw?.proy_prioridad !== null)
      ? String(proyecto.raw.proy_prioridad)
      : ({ 'Normal':'1','Importante':'2','Muy Importante':'3' })[String(proyecto?.prioridad || '').trim()] || '';
    setEditEstado(estadoCode);
    setEditPrioridad(prioridadCode);
    setEditFechaInicio(() => {
      const v = proyecto?.fechaInicioEstimada;
      if (!v) return '';
      const d = new Date(v);
      return isNaN(d.getTime()) ? '' : d.toISOString().slice(0,10);
    });
    setEditVisible(Boolean(proyecto?.visible));
    setEditSelectedIds(new Set((proyecto?.reportes_ids || []).map(String)));
  };
  const toggleEditReportId = (id) => {
    setEditSelectedIds(prev => {
      const next = new Set(prev);
      const sid = String(id);
      if (next.has(sid)) next.delete(sid); else next.add(sid);
      return next;
    });
  };
  const submitEditProject = async () => {
    setSavingProject(true);
    try {
      const lugarFinal = (editComuna || '').trim();
      const payload = {
        nombre: editNombre.trim(),
        descripcion: editDescripcion.trim(),
        estado: editEstado,
        lugar: lugarFinal,
        prioridad: editPrioridad,
        fecha_inicio_estimada: editFechaInicio,
        visible: editVisible,
      };
      const updated = await apiEditarProyecto(proyecto?.id, payload);
      if (updated) {
        const mapped = transformProjectFromAPI(updated) || {
          id: proyecto?.id,
          nombre: editNombre.trim(),
          descripcion: editDescripcion.trim(),
          comuna: editComuna.trim(),
          region: editRegion.trim() || ((editedProject ?? proyecto)?.region ?? ''),
          estado: (editEstado ? ({ '1':'Planificación','2':'En Progreso','3':'Completado','4':'Cancelado','5':'Pendiente','6':'Aprobado','7':'Rechazado' })[String(editEstado)] : (editedProject ?? proyecto)?.estado),
          prioridad: (editPrioridad ? ({ '1':'Normal','2':'Importante','3':'Muy Importante' })[String(editPrioridad)] : (editedProject ?? proyecto)?.prioridad),
          lugar: lugarFinal || (editedProject ?? proyecto)?.lugar,
          fechaInicioEstimada: editFechaInicio ? String(editFechaInicio) : (editedProject ?? proyecto)?.fechaInicioEstimada,
          visible: editVisible,
          raw: { proy_estado: editEstado ? parseInt(editEstado) : undefined, proy_prioridad: editPrioridad ? parseInt(editPrioridad) : undefined }
        };
        if (mapped.visible === undefined) mapped.visible = editVisible;
        try { saveLocalVisibility(mapped.id, mapped.visible); } catch {}
        setEditedProject(mapped);
        onProjectUpdated?.(mapped);
        try { window.dispatchEvent(new Event('projects:changed')); } catch {}
        setEditingProject(false);
      }
    } finally {
      setSavingProject(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl rounded-2xl ring-1 ring-slate-300/30 dark:ring-white/10 bg-white dark:bg-[#0F1525] p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <header className="flex items-start justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 truncate">{p?.nombre || p?.titulo || p?.nombreProyecto || 'Proyecto'}</h2>
            <p className="mt-1 text-[15px] text-slate-700 dark:text-slate-200 font-medium leading-snug">
              {p?.descripcion || 'Sin descripción'}
            </p>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Creado: {creadoAt ? new Date(creadoAt).toLocaleString() : '—'}
              {actualizadoAt ? ` · Editado: ${new Date(actualizadoAt).toLocaleString()}` : ''}
              {(() => { const label = p?.creatorName || p?.raw?.usuario?.nombre || p?.raw?.usuario?.email; return label ? ` · Por: ${label}` : ''; })()}
            </div>
           </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleEditProject} className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 text-sm">Editar</button>
            <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
          </div>
        </header>
        

        <div className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
          <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Información del proyecto</h3>
          <div className="mt-2 rounded-2xl border border-slate-300/40 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl ring-1 ring-slate-300/30 dark:ring-white/10 bg-white dark:bg-[#0F1525] p-4 shadow-sm hover:shadow-md transition">
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Estado</div>
                <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{({ '1':'Planificación','2':'En Progreso','3':'Completado','4':'Cancelado','5':'Pendiente','6':'Aprobado','7':'Rechazado' })[String((p?.raw?.proy_estado) ?? '')] || p?.estado || '—'}</div>
              </div>
              <div className="rounded-2xl ring-1 ring-slate-300/30 dark:ring-white/10 bg-white dark:bg-[#0F1525] p-4 shadow-sm hover:shadow-md transition">
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Prioridad</div>
                <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{({ '1':'Normal','2':'Importante','3':'Muy Importante' })[String((p?.raw?.proy_prioridad) ?? '')] || p?.prioridad || '—'}</div>
              </div>
              <div className="rounded-2xl ring-1 ring-slate-300/30 dark:ring-white/10 bg-white dark:bg-[#0F1525] p-4 shadow-sm hover:shadow-md transition">
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Región</div>
                <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{regionDisp || '—'}</div>
              </div>
              <div className="rounded-2xl ring-1 ring-slate-300/30 dark:ring-white/10 bg-white dark:bg-[#0F1525] p-4 shadow-sm hover:shadow-md transition">
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Comuna</div>
                <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{comunaDisp || '—'}</div>
              </div>
              <div className="rounded-2xl ring-1 ring-slate-300/30 dark:ring-white/10 bg-white dark:bg-[#0F1525] p-4 shadow-sm hover:shadow-md transition">
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Inicio estimado</div>
                <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{fechaInicioDisplay}</div>
              </div>
              <div className="rounded-2xl ring-1 ring-slate-300/30 dark:ring-white/10 bg-white dark:bg-[#0F1525] p-4 shadow-sm hover:shadow-md transition">
                <div className="text-[11px] uppercase tracking-wide text-slate-400">Visibilidad</div>
                <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{visibleDispText}</div>
              </div>
            </div>
          </div>
          {editingProject && (
            <div className="rounded-2xl border border-slate-300/40 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 max-h-[60vh] overflow-y-auto">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Editar proyecto</h3>
              <div className="mt-3 space-y-4">
                <div className="rounded-2xl border border-slate-300/40 dark:border-white/10 bg-white dark:bg-[#0F1525] p-3">
                  <span className="text-xs text-slate-400">Título</span>
                  <input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
                    placeholder="Nombre del proyecto"
                  />
                </div>
                <div className="rounded-2xl border border-slate-300/40 dark:border-white/10 bg-white dark:bg-[#0F1525] p-3">
                  <span className="text-xs text-slate-400">Descripción</span>
                  <textarea
                    rows={3}
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
                    placeholder="Describe el proyecto"
                  />
                </div>
                <div className="rounded-2xl border border-slate-300/40 dark:border-white/10 bg-white dark:bg-[#0F1525] p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-slate-400">Región</span>
                      <select
                        value={editRegion}
                        onChange={(e) => setEditRegion(e.target.value)}
                        className="mt-1 w-full rounded-xl bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/20 px-3 py-2 outline-none focus:border-indigo-400"
                      >
                        <option value="">Selecciona una región…</option>
                        {getRegions().map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Ciudad/Comuna</span>
                      <select
                        value={editComuna}
                        onChange={(e) => setEditComuna(e.target.value)}
                        disabled={!editRegion}
                        className="mt-1 w-full rounded-xl bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/20 px-3 py-2 outline-none focus:border-indigo-400 disabled:opacity-60"
                      >
                        <option value="">{editRegion ? "Selecciona una comuna…" : "Selecciona una región primero"}</option>
                        {editComunes.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-300/40 dark:border-white/10 bg-white dark:bg-[#0F1525] p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-slate-400">Estado</span>
                      <select
                        value={editEstado}
                        onChange={(e) => setEditEstado(e.target.value)}
                        className="mt-1 w-full rounded-xl bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/20 px-3 py-2 outline-none focus:border-indigo-400"
                      >
                        <option value="">Selecciona estado…</option>
                        <option value="1">Planificación</option>
                        <option value="2">En Progreso</option>
                        <option value="3">Completado</option>
                        <option value="4">Cancelado</option>
                        <option value="5">Pendiente</option>
                        <option value="6">Aprobado</option>
                        <option value="7">Rechazado</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Prioridad</span>
                      <select
                        value={editPrioridad}
                        onChange={(e) => setEditPrioridad(e.target.value)}
                        className="mt-1 w-full rounded-xl bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/20 px-3 py-2 outline-none focus:border-indigo-400"
                      >
                        <option value="">Selecciona prioridad…</option>
                        <option value="1">Normal</option>
                        <option value="2">Importante</option>
                        <option value="3">Muy Importante</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Fecha inicio estimada</span>
                      <input
                        type="date"
                        value={editFechaInicio}
                        onChange={(e) => setEditFechaInicio(e.target.value)}
                        className="mt-1 w-full rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-xs text-slate-400">Visibilidad</span>
                      <div className="mt-1 inline-flex rounded-xl border border-slate-300/40 dark:border-white/10 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setEditVisible(true)}
                          className={`px-3 py-2 text-xs transition-colors ${editVisible ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                        >
                          Visible
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditVisible(false)}
                          className={`px-3 py-2 text-xs transition-colors ${!editVisible ? 'bg-rose-600 text-white' : 'bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                        >
                          Oculto
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setEditingProject(false)} className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 text-sm">Cancelar</button>
                  <button onClick={submitEditProject} disabled={savingProject} className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm">
                    {savingProject ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {((editedProject ?? fullProject ?? proyecto)?.estado) && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-amber-500/30 bg-[#0F1525] text-amber-200">⚙ {(editedProject ?? fullProject ?? proyecto)?.estado}</span>
              )}
              {((editedProject ?? fullProject ?? proyecto)?.prioridad) && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-rose-500/30 bg-[#0F1525] text-rose-200">⭐ {(editedProject ?? fullProject ?? proyecto)?.prioridad}</span>
              )}
              <span className="text-xs px-2.5 py-1 rounded-full border border-white/15 bg-white dark:bg-[#0F1525] text-slate-700 dark:text-slate-200">{(editedProject ?? fullProject ?? proyecto)?.informes ?? asociados.length} reportes</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 bg-[#0F1525] text-emerald-200">▲ {votes}</span>
              <div className="inline-flex rounded-full overflow-hidden border border-emerald-500/30">
                <button
                  className="px-3 py-1 text-xs bg-emerald-600/20 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-50"
                  onClick={() => handleVote(+1)}
                  disabled={hasVoted}
                >
                  ▲ Votar
                </button>
                <button
                  className="px-3 py-1 text-xs bg-rose-600/20 text-rose-700 dark:text-rose-200 hover:bg-rose-600/30 disabled:opacity-50"
                  onClick={() => handleVote(-1)}
                  disabled={!hasVoted}
                >
                  ▼ Quitar voto
                </button>
              </div>
            </div>
          </div>
          </div>

          <div className="rounded-xl border border-slate-300/40 dark:border-white/10">
            <div className="px-3 py-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Reportes asociados</h3>
              <button
                className="text-indigo-400 hover:underline text-sm"
                onClick={onGoToReportes}
              >
                Ver en Reportes
              </button>
            </div>
            {asociados.length === 0 ? (
              <div className="px-3 py-2 text-slate-600 dark:text-slate-400 text-sm">Sin reportes asociados.</div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-white/10">
                {asociados.map(r => (
                  <li key={r.id} className="px-3 py-2 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-900 dark:text-slate-200 truncate">{r.titulo}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">👤 {r.user}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Comentarios */}
          <div className="mt-3 rounded-2xl border border-slate-300/40 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Comentarios ({comments.filter(c => !c.parentId).length})</h3>
              <div className="inline-flex items-center gap-2">
                <button
                  onClick={() => setCommentsCollapsed(v => !v)}
                  className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  {commentsCollapsed ? 'Mostrar' : 'Ocultar'}
                </button>
              </div>
            </div>

            {commentsCollapsed ? (
              <div className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
                {comments.filter(c => !c.parentId).length === 0
                  ? 'Sé el primero en comentar.'
                  : `Hay ${comments.filter(c => !c.parentId).length} comentario(s).`}
              </div>
            ) : (
            <>
              <div className="mt-2 flex items-start gap-2 transition-all duration-200 ease-out">
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleAddComment(); } }}
                  maxLength={maxCommentLen}
                  placeholder="Escribe un comentario… (Ctrl+Enter para publicar)"
                  aria-label="Nuevo comentario"
                  className="flex-1 rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
                />
                <button
                  onClick={handleAddComment}
                  disabled={posting || !newComment.trim()}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm shadow-sm"
                >
                  {posting ? 'Publicando…' : 'Publicar'}
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 transition-opacity duration-300">
                <span>Consejo: Ctrl+Enter para publicar</span>
                <span>{newComment.length}/{maxCommentLen}</span>
              </div>
              {errComment && (
                <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
                  {errComment}
                </div>
              )}

              {comments.filter(c => !c.parentId).length === 0 ? (
                <div className="mt-2 text-slate-600 dark:text-slate-400 text-sm">Sé el primero en comentar.</div>
              ) : (
                <ul className="mt-2 divide-y divide-slate-200 dark:divide-white/10 transition-all duration-300 ease-out">
                  {comments.filter(c => !c.parentId).map(c => (
                    <li key={c.id} className="py-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {editingId === c.id ? (
                            <div>
                              <textarea
                              rows={2}
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); /* guardar */ (async () => { if (!editingText.trim()) return; editingPosting || (setEditingPosting(true)); try { const updated = await apiEditarComentarioProyecto(proyecto?.id, editingId, editingText.trim()); setComments(prev => prev.map(cc => String(cc.id) === String(editingId) ? { ...cc, texto: updated?.texto ?? editingText.trim(), editedAt: updated?.editedAt || new Date().toISOString() } : cc)); } finally { setEditingPosting(false); setEditingId(null); setEditingText(''); } })(); } }}
                              maxLength={maxCommentLen}
                              placeholder="Edita tu comentario… (Ctrl+Enter para guardar)"
                              className="flex-1 rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
                            />
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={async () => { if (!editingText.trim()) return; setEditingPosting(true); try { const updated = await apiEditarComentarioProyecto(proyecto?.id, editingId, editingText.trim()); setComments(prev => prev.map(cc => String(cc.id) === String(editingId) ? { ...cc, texto: updated?.texto ?? editingText.trim(), editedAt: updated?.editedAt || new Date().toISOString() } : cc)); } finally { setEditingPosting(false); setEditingId(null); setEditingText(''); } }}
                                disabled={editingPosting || !editingText.trim()}
                                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm"
                              >
                                {editingPosting ? 'Guardando…' : 'Guardar'}
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditingText(''); }}
                                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-slate-900 dark:text-slate-200">{c.texto}</p>
                            <div className="text-xs text-slate-600 dark:text-slate-400">👤 {c.author || authorName} · {new Date(c.createdAt).toLocaleString()}{c.editedAt ? ' · editado' : ''}</div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReplyTo(c.id)}
                          className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10"
                        >
                          Responder
                        </button>
                        {(((c.authorId && String(c.authorId) === String(currentUserId)) || (!c.authorId && (c.author || authorName) === authorName))) && (
                          <button
                            onClick={() => { setEditingId(c.id); setEditingText(c.texto || ''); }}
                            className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10"
                          >
                            Editar
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          disabled={deletingId === c.id}
                          className="text-xs px-2 py-1 rounded-lg bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    {/* Responder caja */}
                    {replyTo === c.id && (
                      <div className="mt-2 flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleAddReply(); } }}
                          maxLength={maxCommentLen}
                          placeholder="Escribe una respuesta… (Ctrl+Enter para enviar)"
                          className="flex-1 rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleAddReply}
                            disabled={replyPosting || !replyText.trim()}
                            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm"
                          >
                            {replyPosting ? 'Enviando…' : 'Responder'}
                          </button>
                          <button
                            onClick={() => { setReplyTo(null); setReplyText(''); }}
                            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Lista de respuestas */}
                    {comments.some(rc => String(rc.parentId) === String(c.id)) && (
                      <>
                        <ul className="mt-2 ml-6 border-l border-slate-300/40 dark:border-white/10 pl-3 space-y-2">
                          {comments.filter(rc => String(rc.parentId) === String(c.id)).slice(0, Math.max(1, replyLimitByComment[c.id] || 1)).map(rc => (
                            <li key={rc.id} className="">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  {editingId === rc.id ? (
                                    <div>
                                      <textarea
                                        rows={2}
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); (async () => { if (!editingText.trim()) return; editingPosting || (setEditingPosting(true)); try { const updated = await apiEditarComentarioProyecto(proyecto?.id, editingId, editingText.trim()); setComments(prev => prev.map(cc => String(cc.id) === String(editingId) ? { ...cc, texto: updated?.texto ?? editingText.trim(), editedAt: updated?.editedAt || new Date().toISOString() } : cc)); } finally { setEditingPosting(false); setEditingId(null); setEditingText(''); } })(); } }}
                                        maxLength={maxCommentLen}
                                        placeholder="Edita tu respuesta… (Ctrl+Enter para guardar)"
                                        className="flex-1 rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-slate-200 border border-slate-300/40 dark:border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
                                      />
                                      <div className="flex items-center gap-2 mt-2">
                                        <button
                                          onClick={async () => { if (!editingText.trim()) return; setEditingPosting(true); try { const updated = await apiEditarComentarioProyecto(proyecto?.id, editingId, editingText.trim()); setComments(prev => prev.map(cc => String(cc.id) === String(editingId) ? { ...cc, texto: updated?.texto ?? editingText.trim(), editedAt: updated?.editedAt || new Date().toISOString() } : cc)); } finally { setEditingPosting(false); setEditingId(null); setEditingText(''); } }}
                                          disabled={editingPosting || !editingText.trim()}
                                          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm"
                                        >
                                          {editingPosting ? 'Guardando…' : 'Guardar'}
                                        </button>
                                        <button
                                          onClick={() => { setEditingId(null); setEditingText(''); }}
                                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm"
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-sm text-slate-900 dark:text-slate-200">{rc.texto}</p>
                                      <div className="text-xs text-slate-600 dark:text-slate-400">👤 {rc.author || authorName} · {new Date(rc.createdAt).toLocaleString()}{rc.editedAt ? ' · editado' : ''}</div>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {(((rc.authorId && String(rc.authorId) === String(currentUserId)) || (!rc.authorId && (rc.author || authorName) === authorName))) && (
                                    <button
                                      onClick={() => { setEditingId(rc.id); setEditingText(rc.texto || ''); }}
                                      className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10"
                                    >
                                      Editar
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteComment(rc.id)}
                                    disabled={deletingId === rc.id}
                                    className="text-xs px-2 py-1 rounded-lg bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 disabled:opacity-50"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        {(() => {
                          const total = comments.filter(rc => String(rc.parentId) === String(c.id)).length;
                          const shown = Math.min(total, Math.max(1, replyLimitByComment[c.id] || 1));
                          if (total > shown) {
                            return (
                              <button
                                onClick={() => setReplyLimitByComment(prev => ({ ...prev, [c.id]: Math.min(total, (prev[c.id] || 1) + 5) }))}
                                className="mt-2 ml-6 text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10"
                              >
                                Ver más respuestas ({total - shown} restantes)
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
            </>
          )}
          </div>
        </div>

        

        <footer className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10"
          >
            Cerrar
          </button>
          {confirmingDelete ? (
            <div className="inline-flex items-center gap-2">
              <span className="text-sm text-slate-700 dark:text-slate-300">¿Seguro?</span>
              <button
                onClick={handleDeleteProject}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500"
              >
                Eliminar
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500"
            >
              Eliminar proyecto
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
