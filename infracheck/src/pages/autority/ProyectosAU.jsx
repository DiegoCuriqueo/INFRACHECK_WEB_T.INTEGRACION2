// src/pages/autority/ProyectosAU.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layout/AutorityLayout";
import { getReportes } from "../../services/reportsService";

/* ──────────────────────────────
   Helpers de API con fallback
   ────────────────────────────── */
const PROJ_STORAGE_KEY = "authorityProjects";

function loadLocalProjects() {
  try {
    const raw = localStorage.getItem(PROJ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProject(project) {
  const all = loadLocalProjects();
  const updated = [project, ...all];
  localStorage.setItem(PROJ_STORAGE_KEY, JSON.stringify(updated));
  return project;
}
async function apiListarProyectos(q = "") {
  try {
    const res = await fetch(`/api/proyectos?search=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("API proyectos no disponible");
    const data = await res.json();
    const remotos = data.results ?? data;
    const locales = loadLocalProjects();
    const combinados = [...locales, ...remotos];
    const term = q.trim().toLowerCase();
    if (!term) return combinados;
    return combinados.filter(p =>
      [p.nombre, p.descripcion, p.comuna].join(" ").toLowerCase().includes(term)
    );
  } catch {
    // fallback: proyectos locales
    const locales = loadLocalProjects();
    const term = q.trim().toLowerCase();
    if (!term) return locales;
    return locales.filter(p =>
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

async function apiCrearProyecto({ nombre, descripcion, reportes_ids }) {
  try {
    const res = await fetch("/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion, reportes_ids }),
    });
    if (!res.ok) throw new Error("bad");
    return await res.json().catch(() => ({}));
  } catch {
    // Fallback local: almacena proyecto en localStorage
    const nuevo = {
      id: crypto.randomUUID?.() || String(Date.now()),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      reportes_ids: Array.isArray(reportes_ids) ? reportes_ids : [],
      informes: Array.isArray(reportes_ids) ? reportes_ids.length : 0,
      estado: "borrador",
      comuna: null,
      createdAt: new Date().toISOString(),
    };
    saveLocalProject(nuevo);
    return nuevo;
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
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400"
          >
            + Nuevo proyecto
          </button>
        </header>

        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar proyecto..."
            className="w-72 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none"
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
            {items.map((p) => (
              <article
                key={p.id ?? p.nombre}
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-indigo-500/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-100 inline-flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">📁</span>
                    {p.nombre}
                  </h3>
                  {typeof p.informes === "number" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
                      {p.informes} reporte(s)
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                  {p.descripcion ?? "Sin descripción"}
                </p>
                <div className="text-xs text-slate-400 mt-3">
                  {p.comuna ?? "—"}
                </div>
                <button
                  onClick={() => setDetalle(p)}
                  className="inline-flex items-center gap-2 mt-3 text-sm px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30"
                >
                  Ver detalles
                </button>
              </article>
            ))}
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
        console.error("Error cargando reportes:", error);
        setReportes([]);
      }
    })();
    return () => { alive = false; };
  }, []);

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
        reportes_ids: sel.map(s => s.id),
      });
      onOk?.(creado);
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
              <div className="mt-2 flex flex-wrap gap-2">
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
                className="w-80 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none"
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
            disabled={saving}
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
function ModalDetalleProyecto({ proyecto, onClose, onGoToReportes }) {
  const [allReports, setAllReports] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const apiReports = await getReportes();
        if (!alive) return;
        const mapped = apiReports.map(r => ({ 
          id: r.id, 
          titulo: r.title || r.summary || `Reporte #${r.id}`, 
          user: r.user || "Usuario" 
        }));
        setAllReports(mapped);
      } catch (error) {
        console.error("Error cargando reportes:", error);
        setAllReports([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  const asociados = useMemo(() => {
    const ids = new Set((proyecto?.reportes_ids || []).map(String));
    return allReports.filter(r => ids.has(String(r.id)));
  }, [allReports, proyecto]);

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
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0F1525] p-6 shadow-2xl">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{proyecto?.nombre}</h2>
            <p className="text-slate-400 text-sm">{proyecto?.descripcion || 'Sin descripción'}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        </header>

        <div className="mt-4">
          <div className="text-sm text-slate-400">{proyecto?.comuna ?? '—'} · {proyecto?.informes ?? asociados.length} reportes</div>
          <div className="mt-3 rounded-xl border border-white/10">
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
        </div>

        <footer className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10"
          >
            Cerrar
          </button>
          <button
            onClick={onGoToReportes}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
          >
            Ir a Reportes
          </button>
        </footer>
      </div>
    </div>
  );
}