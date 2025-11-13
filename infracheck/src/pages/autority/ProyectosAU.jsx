// src/pages/autority/ProyectosAU.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layout/AutorityLayout";
import { getReportes } from "../../services/reportsService";
import { getProjects } from "../../services/projectsService";
import { useAuth } from "../../contexts/AuthContext";
import { getRegions, getCommunes } from "../../services/geoData";

/* ──────────────────────────────
   Helpers de API con fallback
   ────────────────────────────── */
const PROJ_STORAGE_KEY = "authorityProjects";
// Agrego soporte local para comentarios y votos
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
  localStorage.setItem(commentsKey(projectId), JSON.stringify(updated));
  return comment;
}
function saveLocalCommentsList(projectId, list) {
  try {
    localStorage.setItem(commentsKey(projectId), JSON.stringify(list));
  } catch {}
}

async function apiListarComentariosProyecto(id) {
  try {
    const res = await fetch(`/api/proyectos/${id}/comentarios`);
    if (!res.ok) throw new Error("API comentarios no disponible");
    const data = await res.json();
    return data.results ?? data;
  } catch {
    return loadLocalComments(id);
  }
}
async function apiAgregarComentarioProyecto(id, texto, author, authorId) {
  try {
    const res = await fetch(`/api/proyectos/${id}/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto, author, authorId })
    });
    if (!res.ok) throw new Error("API comentarios no disponible");
    const data = await res.json();
    return data;
  } catch {
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
}
async function apiResponderComentarioProyecto(id, parentId, texto, author, authorId) {
  try {
    const res = await fetch(`/api/proyectos/${id}/comentarios/${parentId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto, author, authorId })
    });
    if (!res.ok) throw new Error("API respuestas no disponible");
    const data = await res.json();
    return data;
  } catch {
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
}
async function apiEliminarComentarioProyecto(projectId, commentId) {
  try {
    const res = await fetch(`/api/proyectos/${projectId}/comentarios/${commentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('API eliminar comentario no disponible');
    return { ok: true };
  } catch {
    const list = loadLocalComments(projectId);
    const filtered = list.filter(c => String(c.id) !== String(commentId) && String(c.parentId) !== String(commentId));
    saveLocalCommentsList(projectId, filtered);
    return { ok: true };
  }
}

async function apiEditarComentarioProyecto(projectId, commentId, texto) {
  try {
    const res = await fetch(`/api/proyectos/${projectId}/comentarios/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto })
    });
    if (!res.ok) throw new Error('API editar comentario no disponible');
    const data = await res.json();
    return data;
  } catch {
    const list = loadLocalComments(projectId);
    const updated = list.map(c => String(c.id) === String(commentId) ? { ...c, texto: (texto || '').trim(), editedAt: new Date().toISOString() } : c);
    saveLocalCommentsList(projectId, updated);
    const changed = updated.find(c => String(c.id) === String(commentId));
    return changed || { id: commentId, texto: (texto || '').trim(), editedAt: new Date().toISOString() };
  }
}
const PROJ_VOTES_PREFIX = "authorityProjectVotes:";
const votesKey = (id) => `${PROJ_VOTES_PREFIX}${id}`;
function loadProjectVoters(id) {
  try {
    const raw = localStorage.getItem(votesKey(id));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveProjectVoters(id, voters) {
  try {
    localStorage.setItem(votesKey(id), JSON.stringify(voters));
  } catch {}
}
function hasUserVotedProject(id, userId) {
  const voters = loadProjectVoters(id);
  return voters.map(String).includes(String(userId));
}
function updateLocalProjectVotesCount(id, nextVotes) {
  const list = loadLocalProjects();
  const idx = list.findIndex(p => String(p.id) === String(id));
  if (idx >= 0) {
    list[idx] = { ...list[idx], votes: Math.max(0, nextVotes || 0) };
    saveLocalProjectsList(list);
  }
}
async function apiVotarProyecto(id, delta = 1, userId) {
  try {
    const res = await fetch(`/api/proyectos/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta })
    });
    if (!res.ok) throw new Error("API votos no disponible");
    const data = await res.json();
    // Actualizamos espejo local de votantes para reflejar el estado en la UI
    const currentVoters = loadProjectVoters(id);
    const hasVoted = currentVoters.map(String).includes(String(userId));
    let nextVoters = currentVoters;
    if (delta > 0 && !hasVoted) nextVoters = [...currentVoters, String(userId)];
    if (delta < 0 && hasVoted) nextVoters = currentVoters.filter(u => String(u) !== String(userId));
    saveProjectVoters(id, nextVoters);
    updateLocalProjectVotesCount(id, data?.votes);
    return { id, votes: data?.votes ?? 0, hasVoted: delta > 0 };
  } catch {
    // Fallback local: toggling por usuario
    const currentVoters = loadProjectVoters(id);
    const hasVoted = currentVoters.map(String).includes(String(userId));
    let nextVoters = currentVoters;
    let deltaApplied = 0;
    if (delta > 0 && !hasVoted) {
      nextVoters = [...currentVoters, String(userId)];
      deltaApplied = +1;
    } else if (delta < 0 && hasVoted) {
      nextVoters = currentVoters.filter(u => String(u) !== String(userId));
      deltaApplied = -1;
    } else {
      deltaApplied = 0; // No cambio si ya votó y quiere votar de nuevo o quitar sin voto previo
    }
    saveProjectVoters(id, nextVoters);

    // Actualizar conteo en proyectos locales
    const list = loadLocalProjects();
    const idx = list.findIndex(p => String(p.id) === String(id));
    if (idx >= 0) {
      const current = list[idx];
      const nextVotes = Math.max(0, (current.votes || 0) + deltaApplied);
      const updated = { ...current, votes: nextVotes };
      list[idx] = updated;
      saveLocalProjectsList(list);
      return { id, votes: nextVotes, hasVoted: deltaApplied > 0 ? true : (deltaApplied < 0 ? false : hasVoted) };
    }
    return { id, votes: Math.max(0, deltaApplied > 0 ? 1 : 0), hasVoted: deltaApplied > 0 };
  }
}

function loadLocalProjects() {
  try {
    const raw = localStorage.getItem(PROJ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProjectsList(list) {
  try {
    localStorage.setItem(PROJ_STORAGE_KEY, JSON.stringify(list));
    // Disparar evento para notificar cambios
    window.dispatchEvent(new Event('projects:changed'));
  } catch {}
}

function saveLocalProject(project) {
  const all = loadLocalProjects();
  const updated = [project, ...all];
  localStorage.setItem(PROJ_STORAGE_KEY, JSON.stringify(updated));
  // Disparar evento para notificar cambios
  window.dispatchEvent(new Event('projects:changed'));
  return project;
}
async function apiListarProyectos(q = "") {
  const rawSearch = q.trim();
  const term = rawSearch.toLowerCase();

  const createKey = (project) => {
    if (!project) return null;
    if (project.id !== undefined && project.id !== null) {
      return `id:${String(project.id)}`;
    }
    const name = (project.nombre || project.name || "").trim().toLowerCase();
    if (!name) return null;
    return `name:${name}`;
  };

  try {
    const remoteFilters = rawSearch ? { search: rawSearch } : {};
    const remotos = await getProjects(remoteFilters);
    const locales = loadLocalProjects();

    const dedup = new Map();
    for (const remote of Array.isArray(remotos) ? remotos : []) {
      if (!remote) continue;
      const key = createKey(remote);
      if (!key) continue;
      dedup.set(key, remote);
    }

    for (const local of Array.isArray(locales) ? locales : []) {
      if (!local) continue;
      const key = createKey(local);
      if (!key) continue;
      if (!dedup.has(key)) {
        dedup.set(key, local);
      }
    }

    const combinados = Array.from(dedup.values());
    if (!term) return combinados;
    return combinados.filter((p) =>
      [p.nombre, p.descripcion, p.comuna].join(" ").toLowerCase().includes(term)
    );
  } catch (error) {
    console.error("Error al listar proyectos desde la API:", error);
    const locales = loadLocalProjects();
    if (!term) return locales;
    return locales.filter((p) =>
      [p.nombre, p.descripcion, p.comuna].join(" ").toLowerCase().includes(term)
    );
  }
}

async function apiListarReportes(q = "") {
  try {
    const res = await fetch(`/api/reportes?search=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("API reportes no disponible");
    const data = await res.json();
    return data.results ?? data;
  } catch {
    // fallback de prueba para que el selector sea usable
    return [
      { id: 101, titulo: "Bache en Av. Alemania", user: "Juan Pérez" },
      { id: 102, titulo: "Luminaria fallando en PLC", user: "María López" },
      { id: 103, titulo: "Microbasural sector norte", user: "Juan Pérez" },
      { id: 104, titulo: "Semáforo descoordinado", user: "Pedro Díaz" },
    ];
  }
}

async function apiCrearProyecto({ nombre, descripcion, reportes_ids, comuna, region }) {
  try {
    const res = await fetch("/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion, reportes_ids, comuna, region }),
    });
    if (!res.ok) throw new Error("bad");
    const data = await res.json();
    // Disparar evento incluso si se guarda en API
    window.dispatchEvent(new Event('projects:changed'));
    return data;
  } catch {
    // Fallback local: almacena proyecto en localStorage
    const nuevo = {
      id: crypto.randomUUID?.() || String(Date.now()),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      reportes_ids: Array.isArray(reportes_ids) ? reportes_ids : [],
      informes: Array.isArray(reportes_ids) ? reportes_ids.length : 0,
      estado: "borrador",
      comuna: (comuna || '').trim() || null,
      region: (region || '').trim() || null,
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    saveLocalProject(nuevo);
    return nuevo;
  }
}
async function apiEliminarProyecto(id) {
  try {
    const res = await fetch(`/api/proyectos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('bad');
    window.dispatchEvent(new Event('projects:changed'));
    return { ok: true, deletedId: id };
  } catch {
    const list = loadLocalProjects();
    const filtered = list.filter(p => String(p.id) !== String(id));
    saveLocalProjectsList(filtered);
    try { localStorage.removeItem(votesKey(id)); } catch {}
    try { localStorage.removeItem(commentsKey(id)); } catch {}
    return { ok: true, deletedId: id };
  }
}

async function apiEditarProyecto(id, { nombre, descripcion, comuna, reportes_ids, region }) {
  try {
    const res = await fetch(`/api/proyectos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion, comuna, reportes_ids, region })
    });
    if (!res.ok) throw new Error('bad');
    const data = await res.json();
    window.dispatchEvent(new Event('projects:changed'));
    return data;
  } catch {
    const list = loadLocalProjects();
    const idx = list.findIndex(p => String(p.id) === String(id));
    if (idx >= 0) {
      const prev = list[idx];
      const nextIds = Array.isArray(reportes_ids) ? reportes_ids : (prev.reportes_ids || []);
      const updated = {
        ...prev,
        nombre: typeof nombre === 'string' ? nombre.trim() : prev.nombre,
        descripcion: typeof descripcion === 'string' ? descripcion.trim() : prev.descripcion,
        comuna: typeof comuna === 'string' ? comuna.trim() || null : (prev.comuna || null),
        region: typeof region === 'string' ? region.trim() || null : (prev.region || null),
        reportes_ids: nextIds,
        informes: Array.isArray(nextIds) ? nextIds.length : (prev.informes ?? 0),
        updatedAt: new Date().toISOString(),
      };
      list[idx] = updated;
      saveLocalProjectsList(list);
      return updated;
    }
    return null;
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
          ? { ...it, votes: updated?.votes ?? Math.max(0, (it.votes || 0) + (updated?.hasVoted ? +1 : -1)) }
          : it
      )));
    } catch (e) {
      console.error('Error votando proyecto:', e);
    }
  };

  return (
    <DashboardLayout>
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Proyectos</h1>
            <p className="text-slate-400 text-sm">Gestión de informes por proyecto.</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 shadow-sm hover:shadow-md transition"
          >
            + Nuevo proyecto
          </button>
        </header>

        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar proyecto..."
            className="w-72 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-indigo-400"
          />
        </div>

        {loading ? (
          <p className="text-slate-400">Cargando…</p>
        ) : items.length === 0 ? (
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-slate-300">
            No hay proyectos.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((p) => {
              const hasVoted = hasUserVotedProject(p.id, currentUserId);
              return (
              <article
                key={p.id ?? p.nombre}
                onClick={() => setDetalle(p)}
                role="button"
                aria-label={`Abrir detalles de ${p.nombre}`}
                className="group cursor-pointer rounded-2xl ring-1 ring-white/10 bg-gradient-to-br from-white/5 to-white/10 p-4 transition-all transform duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:ring-indigo-500/40 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-100 inline-flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">📁</span>
                    {p.nombre}
                  </h3>
                  <div className="flex items-center gap-2">
                    {typeof p.informes === "number" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
                        {p.informes} reporte(s)
                      </span>
                    )}
                    {typeof p.votes === "number" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200">
                        ▲ {p.votes}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                  {p.descripcion ?? "Sin descripción"}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  {p.region && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">{p.region}</span>
                  )}
                  <span className="text-slate-400">{p.comuna ?? "—"}</span>
                </div>
                <div className="mt-3 flex items-center justify-end">

                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); voteOnCard(p, +1); }}
                      disabled={hasVoted}
                      title="Votar a favor"
                      aria-label="Votar a favor"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full ring-1 ring-emerald-400/30 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 hover:ring-emerald-400/50 disabled:opacity-40 text-sm transition"
                    >
                      ▲
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); voteOnCard(p, -1); }}
                      disabled={!hasVoted}
                      title="Quitar voto"
                      aria-label="Quitar voto"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full ring-1 ring-rose-400/30 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 hover:ring-rose-400/50 disabled:opacity-40 text-sm transition"
                    >
                      ▼
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
            try {
              const locales = loadLocalProjects();
              const idx = locales.findIndex(p => String(p.id) === String(updated?.id));
              if (idx >= 0) {
                locales[idx] = { ...locales[idx], ...updated };
                saveLocalProjectsList(locales);
              }
            } catch {}
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
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [region, setRegion] = useState("");
  const [comunes, setComunes] = useState([]);
  const [comuna, setComuna] = useState("");
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
    if (idsSeleccionados.has(item.id)) {
      setSel(sel.filter(s => s.id !== item.id));
    } else {
      setSel([...sel, { id: item.id, titulo: item.titulo }]);
    }
  };

  const quitarChip = (id) => setSel(sel.filter(s => s.id !== id));

  // validación simple
  const validar = () => {
    if (!nombre.trim()) return "El nombre es obligatorio.";
    if (nombre.trim().length < 3) return "El nombre debe tener al menos 3 caracteres.";
    if (nombre.length > maxNombre) return `Máximo ${maxNombre} caracteres en nombre.`;
    if (descripcion.length > maxDesc) return `Máximo ${maxDesc} caracteres en descripción.`;
    if (!region.trim()) return "Selecciona una región.";
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
      });
      onOk?.({ ...creado, reportes_ids: sel.map(s => s.id) });
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
      className="fixed inset-0 z-50 grid place-items-center"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0F1525] p-6 shadow-2xl">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Nuevo proyecto</h2>
            <p className="text-slate-400 text-sm">
              Crea un proyecto para agrupar reportes y priorizar soluciones.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        </header>

        <div className="mt-4 grid gap-4">
          {/* Nombre */}
          <div>
            <label className="text-sm text-slate-300">Nombre *</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Baches en Temuco"
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-400">
              <span>Obligatorio</span>
              <span>{nombre.length}/{maxNombre}</span>
            </div>
          </div>

          {/* Región y Comuna dependientes */}
          <div>
            <label className="text-sm text-slate-300">Región</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#0F1525] text-slate-200 border border-white/20 px-3 py-2 outline-none focus:border-indigo-400"
              style={{ backgroundColor: '#0F1525' }}
            >
              <option value="">Selecciona una región…</option>
              {getRegions().map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300">Ciudad/Comuna</label>
            <select
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
              disabled={!region}
              className="mt-1 w-full rounded-xl bg-[#0F1525] text-slate-200 border border-white/20 px-3 py-2 outline-none focus:border-indigo-400 disabled:opacity-60"
              style={{ backgroundColor: '#0F1525' }}
            >
              <option value="">{region ? "Selecciona una comuna…" : "Selecciona una región primero"}</option>
              {comunes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm text-slate-300">Descripción</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Objetivo, alcance y criterios de priorización…"
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none"
            />
            <div className="mt-1 text-right text-[11px] text-slate-400">
              {descripcion.length}/{maxDesc}
            </div>
          </div>

          {/* Reportes asociados */}
          <div>
            <label className="text-sm text-slate-300">Reportes asociados</label>

            {/* Chips seleccionados */}
            {sel.length > 0 && (
              <div className="mt-2 max-h-24 overflow-y-auto overflow-x-hidden flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
                {sel.map(s => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 text-indigo-200 px-3 py-1 text-xs"
                  >
                    {s.titulo || "Reporte"}
                    <button onClick={() => quitarChip(s.id)} className="hover:text-white">✕</button>
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
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none"
              />
              <span className="text-xs text-slate-400">{sel.length} seleccionado(s)</span>
            </div>

            <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-white/10">
              {listaFiltrada.length === 0 ? (
                <div className="px-3 py-2 text-slate-400 text-sm">No hay reportes.</div>
              ) : (
                <div className="divide-y divide-white/10">
                  {grupos.map((g) => (
                    <div key={g.owner} className="">
                      <div className="sticky top-0 z-10 bg-[#0F1525] px-3 py-2 text-xs text-slate-300 flex items-center justify-between">
                        <span className="inline-flex items-center gap-2">👤 {g.owner}</span>
                        <span className="text-[11px] text-slate-400">{g.items.length} reporte(s)</span>
                      </div>
                      <ul className="divide-y divide-white/5">
                        {g.items.map((r) => {
                          const activo = idsSeleccionados.has(r.id);
                          return (
                            <li
                              key={r.id}
                              className={`flex items-center justify-between gap-3 px-3 py-2 cursor-pointer ${
                                activo ? "bg-indigo-500/10" : "hover:bg-white/5"
                              }`}
                              onClick={() => toggle(r)}
                            >
                              <div className="min-w-0">
                                <p className="text-sm text-slate-200 truncate">
                                  {r.titulo ?? "Reporte"}
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={activo}
                                onChange={() => toggle(r)}
                                className="accent-indigo-500"
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

        <footer className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
            disabled={saving}
          >
            Crear proyecto
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
  const [hasVoted, setHasVoted] = useState(() => hasUserVotedProject(proyecto?.id, currentUserId));
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
   const [editSelectedIds, setEditSelectedIds] = useState(() => new Set((proyecto?.reportes_ids || []).map(String)));
   const [editedProject, setEditedProject] = useState(null);

  useEffect(() => {
    setHasVoted(hasUserVotedProject(proyecto?.id, currentUserId));
  }, [proyecto, currentUserId]);

  // Resetear estados de edición cuando cambia el proyecto
  useEffect(() => {
    setEditNombre(proyecto?.nombre || '');
    setEditDescripcion(proyecto?.descripcion || '');
    setEditComuna(proyecto?.comuna || '');
    setEditSelectedIds(new Set((proyecto?.reportes_ids || []).map(String)));
    setEditedProject(null);
  }, [proyecto]);

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

  const asociados = useMemo(() => {
    const P = editedProject || proyecto;
    const ids = new Set((P?.reportes_ids || []).map(String));
    if (ids.size === 0) {
      const n = (P?.informes ?? 0);
      return n > 0 ? allReports.slice(0, n) : allReports.slice(0, 3);
    }
    return allReports.filter(r => ids.has(String(r.id)));
  }, [allReports, proyecto, editedProject]);

  const handleVote = async (delta) => {
    const updated = await apiVotarProyecto(proyecto?.id, delta, currentUserId);
    setVotes(updated?.votes ?? Math.max(0, votes + (updated?.hasVoted ? +1 : -1)));
    setHasVoted(updated?.hasVoted ?? (delta > 0));
    onProjectUpdated?.(updated);
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
    }
  };

  // Edición de proyecto
  const toggleEditProject = () => {
    setEditingProject((v) => !v);
    setEditNombre(proyecto?.nombre || '');
    setEditDescripcion(proyecto?.descripcion || '');
    setEditComuna(proyecto?.comuna || '');
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
      const reportes_ids = Array.from(editSelectedIds);
      const payload = {
        nombre: editNombre.trim(),
        descripcion: editDescripcion.trim(),
        comuna: editComuna.trim(),
        region: (editedProject ?? proyecto)?.region?.trim?.() || '',
        reportes_ids: reportes_ids
      };
      const updated = await apiEditarProyecto(proyecto?.id, payload);
      if (updated) {
        setEditedProject(updated);
        onProjectUpdated?.(updated);
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
      <div className="relative w-full max-w-2xl rounded-2xl ring-1 ring-white/10 bg-[#0F1525] p-6 shadow-2xl">
        <header className="flex items-start justify-between">
          <div className="min-w-0">
             <h2 className="text-xl font-semibold text-slate-100 truncate">{(editedProject ?? proyecto)?.nombre}</h2>
             <p className="mt-1 text-[15px] text-slate-200 font-medium leading-snug">
               {(editedProject ?? proyecto)?.descripcion || 'Sin descripción'}
             </p>
             <div className="mt-2 text-xs text-slate-400">
               Creado: {((editedProject ?? proyecto)?.createdAt) ? new Date((editedProject ?? proyecto)?.createdAt).toLocaleString() : '—'}
               {((editedProject ?? proyecto)?.updatedAt) ? ` · Editado: ${new Date((editedProject ?? proyecto)?.updatedAt).toLocaleString()}` : ''}
             </div>
           </div>
          <div className="flex items-center gap-2">

            <button onClick={toggleEditProject} className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-sm">Editar</button>
            <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
          </div>
        </header>


        <div className="mt-4 space-y-4">
          {editingProject && (
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-3">
              <h3 className="text-sm font-semibold text-slate-200">Editar proyecto</h3>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <label className="block">
                  <span className="text-xs text-slate-400">Título</span>
                  <input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
                    placeholder="Nombre del proyecto"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400">Descripción</span>
                  <textarea
                    rows={3}
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
                    placeholder="Describe el proyecto"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400">Ciudad/Comuna</span>
                  <input
                    type="text"
                    value={editComuna}
                    onChange={(e) => setEditComuna(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
                    placeholder="Ciudad o comuna"
                  />
                </label>
                <div>
                  <span className="text-xs text-slate-400">Reportes seleccionados</span>
                  <ul className="mt-2 grid grid-cols-1 gap-2 max-h-40 overflow-auto pr-1">
                    {allReports.map(r => {
                      const checked = editSelectedIds.has(String(r.id));
                      return (
                        <li key={r.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                          <div className="min-w-0">
                            <p className="text-sm text-slate-200 truncate">{r.titulo}</p>
                            <p className="text-[11px] text-slate-400">👤 {r.user}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleEditReportId(r.id)}
                            className="accent-indigo-500"
                          />
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button onClick={() => setEditingProject(false)} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">Cancelar</button>
                <button onClick={submitEditProject} disabled={savingProject} className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm">
                  {savingProject ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">📍 {(editedProject ?? proyecto)?.region ?? '—'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">🏙 {(editedProject ?? proyecto)?.comuna ?? '—'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-200">{(editedProject ?? proyecto)?.informes ?? asociados.length} reportes</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200">▲ {votes}</span>
              <button
                className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 text-sm disabled:opacity-50"
                onClick={() => handleVote(+1)}
                disabled={hasVoted}
              >
                ▲ Votar
              </button>
              <button
                className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 text-sm disabled:opacity-50"
                onClick={() => handleVote(-1)}
                disabled={!hasVoted}
              >
                ▼ Quitar voto
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10">
            {asociados.length === 0 ? (
              <div className="px-3 py-2 text-slate-400 text-sm">Sin reportes asociados.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {asociados.map(r => (
                  <li key={r.id} className="px-3 py-2 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 truncate">{r.titulo}</p>
                      <p className="text-xs text-slate-400">👤 {r.user}</p>
                    </div>
                    <button
                      className="text-indigo-400 hover:underline text-sm"
                      onClick={onGoToReportes}
                    >
                      Ver en Reportes
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Comentarios */}
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Comentarios ({comments.filter(c => !c.parentId).length})</h3>
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
              <div className="mt-2 text-slate-400 text-sm">
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
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
                />
                <button
                  onClick={handleAddComment}
                  disabled={posting || !newComment.trim()}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm shadow-sm"
                >
                  {posting ? 'Publicando…' : 'Publicar'}
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 transition-opacity duration-300">
                <span>Consejo: Ctrl+Enter para publicar</span>
                <span>{newComment.length}/{maxCommentLen}</span>
              </div>
              {errComment && (
                <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
                  {errComment}
                </div>
              )}

              {comments.filter(c => !c.parentId).length === 0 ? (
                <div className="mt-2 text-slate-400 text-sm">Sé el primero en comentar.</div>
              ) : (
                <ul className="mt-2 divide-y divide-white/10 transition-all duration-300 ease-out">
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
                              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
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
                            <p className="text-sm text-slate-200">{c.texto}</p>
                            <div className="text-xs text-slate-400">👤 {c.author || authorName} · {new Date(c.createdAt).toLocaleString()}{c.editedAt ? ' · editado' : ''}</div>
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
                          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
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
                        <ul className="mt-2 ml-6 border-l border-white/10 pl-3 space-y-2">
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
                                        className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none text-sm focus:border-indigo-400"
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
                                      <p className="text-sm text-slate-200">{rc.texto}</p>
                                      <div className="text-xs text-slate-400">👤 {rc.author || authorName} · {new Date(rc.createdAt).toLocaleString()}{rc.editedAt ? ' · editado' : ''}</div>
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
              <span className="text-sm text-slate-300">¿Seguro?</span>
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