// src/pages/autority/ProyectosAU.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";

/* ──────────────────────────────
   Helpers de API con fallback
   ────────────────────────────── */
async function apiListarProyectos(q = "") {
  try {
    const res = await fetch(`/api/proyectos?search=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("API proyectos no disponible");
    const data = await res.json();
    return data.results ?? data;
  } catch {
    // vacío por defecto (listado)
    return [];
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
      { id: 101, titulo: "Bache en Av. Alemania" },
      { id: 102, titulo: "Luminaria fallando en PLC" },
      { id: 103, titulo: "Microbasural sector norte" },
    ];
  }
}

async function apiCrearProyecto({ nombre, descripcion, reportes_ids }) {
  const res = await fetch("/api/proyectos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, descripcion, reportes_ids }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "No se pudo crear el proyecto");
  }
  return res.json().catch(() => ({}));
}

/* ──────────────────────────────
   Página: Proyectos (Autoridad)
   ────────────────────────────── */
export default function ProyectosAU() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);   // modal
  const [tick, setTick] = useState(0);       // refrescar luego de crear

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
              <article key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{p.nombre}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                    {p.estado ?? "borrador"}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                  {p.descripcion ?? "Sin descripción"}
                </p>
                <div className="text-xs text-slate-400 mt-3">
                  {p.comuna ?? "—"} · {p.informes ?? 0} informes
                </div>
                <NavLink
                  to={`/autority/proyectos/${p.id}`}
                  className="inline-block mt-3 text-indigo-400 hover:underline text-sm"
                >
                  Ver detalles
                </NavLink>
              </article>
            ))}
          </div>
        )}
      </section>

      {open && (
        <ModalCrearProyecto
          onClose={() => setOpen(false)}
          onOk={() => { setOpen(false); setTick(t => t + 1); }}
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

  // cargar reportes
  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await apiListarReportes();
      if (!alive) return;
      setReportes(data);
    })();
    return () => { alive = false; };
  }, []);

  // filtros + UX
  const listaFiltrada = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return reportes;
    return reportes.filter(r =>
      (r.titulo || "").toLowerCase().includes(q) || String(r.id).includes(q)
    );
  }, [busca, reportes]);

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
      await apiCrearProyecto({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        reportes_ids: sel.map(s => s.id),
      });
      onOk?.();
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
                    {s.titulo || `Reporte #${s.id}`}
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
                placeholder="Buscar reporte por título o ID…"
                className="w-80 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none"
              />
              <span className="text-xs text-slate-400">{sel.length} seleccionado(s)</span>
            </div>

            <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-white/10">
              {listaFiltrada.length === 0 ? (
                <div className="px-3 py-2 text-slate-400 text-sm">No hay reportes.</div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {listaFiltrada.map((r) => {
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
                            {r.titulo ?? `Reporte #${r.id}`}
                          </p>
                          <p className="text-xs text-slate-400">ID: {r.id}</p>
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
