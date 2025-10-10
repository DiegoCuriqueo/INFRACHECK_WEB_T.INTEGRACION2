import React, { useEffect, useMemo, useState } from "react";
import AutorityLayout from "../../layout/AutorityLayout.jsx";
import { getReportes } from "../../services/reportsService";
import { applyVotesPatch } from "../../services/votesService";
import { SEED } from "../../JSON/reportsSeed";

// helpers
const cls = (...c) => c.filter(Boolean).join(" ");
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
};
const fmtVotes = (n) => n.toLocaleString("es-CL");

// íconos mínimos
const MapPin = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="12" cy="10" r="2.5" fill="currentColor" />
  </svg>
);
const Clock = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const SearchIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const CloseIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const ListIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const GridIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
    <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
    <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
    <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);

// diseño de tarjeta estilo screenshot
const Card = ({ className = "", children }) => (
  <div className={cls("rounded-2xl bg-slate-900/60 ring-1 ring-white/10", className)}>
    {children}
  </div>
);

const Badge = ({ tone = "neutral", className = "", children }) => {
  const tones = {
    neutral: "bg-slate-700/70 text-slate-200",
    info: "bg-sky-600",
    warn: "bg-amber-500 text-slate-900",
    danger: "bg-red-600",
    success: "bg-emerald-600",
    violet: "bg-fuchsia-600 text-white",
    gray: "bg-slate-600 text-white",
  };
  return (
    <span className={cls("inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
};

export default function ReportesAU() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("top"); // top|recent
  const [urg, setUrg] = useState("todas"); // baja|media|alta|todas
  const [estado, setEstado] = useState("todos"); // pendiente|en_proceso|resuelto|todos
  const [layout, setLayout] = useState("list"); // list|grid

  useEffect(() => {
    try {
      setLoading(true);
      const userReports = getReportes();
      const userWithVotes = applyVotesPatch(userReports);
      const seedWithVotes = applyVotesPatch(SEED);
      // Primero los del usuario (más recientes), luego los demo
      setReports([...userWithVotes, ...seedWithVotes]);
    } catch (e) {
      console.error("Error cargando reportes autoridad:", e);
      setReports(applyVotesPatch(SEED));
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const byText = (r) =>
      [r.title, r.summary, r.description, r.category, r.address]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase());
    const byUrg = (r) => (urg === "todas" ? true : r.urgency === urg);
    const byEstado = (r) => (estado === "todos" ? true : (r.status || "pendiente") === estado);
    const arr = reports.filter((r) => byText(r) && byUrg(r) && byEstado(r));
    if (sort === "top") return arr.sort((a, b) => b.votes - a.votes);
    return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reports, q, sort, urg, estado]);

  const metrics = useMemo(() => {
    const total = reports.length;
    const urgentes = reports.filter(r => r.urgency === "alta").length;
    const enProceso = reports.filter(r => (r.status || "pendiente") === "en_proceso").length;
    const pendientes = reports.filter(r => (r.status || "pendiente") === "pendiente").length;
    const resueltos = reports.filter(r => (r.status || "pendiente") === "resuelto").length;
    return { total, urgentes, enProceso, pendientes, resueltos };
  }, [reports]);

  return (
    <AutorityLayout title="Reportes de Infraestructura">
      <div className="space-y-5">
        {/* toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* search mejorada */}
            <div className="relative w-[360px] max-w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por título, dirección o categoría…"
                className="w-full rounded-xl bg-slate-800/60 pl-9 pr-9 py-2.5 text-slate-100 placeholder:text-slate-400 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
              {q && (
                <button
                  aria-label="Limpiar búsqueda"
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* selects mejorados */}
            <select
              value={urg}
              onChange={(e) => setUrg(e.target.value)}
              className="rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              <option value="todas">Todas las urgencias</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="resuelto">Resuelto</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              <option value="top">Más votados</option>
              <option value="recent">Más recientes</option>
            </select>

            {/* toggle de vista segmentado */}
            <div className="inline-flex items-center rounded-xl bg-slate-800/60 p-1 ring-1 ring-white/10">
              <button
                onClick={() => setLayout("list")}
                className={cls("px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1", layout === "list" ? "bg-slate-700 text-slate-100" : "text-slate-300 hover:text-slate-100")}
                title="Vista lista"
              >
                <ListIcon className="h-4 w-4" /> Lista
              </button>
              <button
                onClick={() => setLayout("grid")}
                className={cls("px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1", layout === "grid" ? "bg-slate-700 text-slate-100" : "text-slate-300 hover:text-slate-100")}
                title="Vista grid"
              >
                <GridIcon className="h-4 w-4" /> Grid
              </button>
            </div>
          </div>
        </div>

        {/* lista */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-4 sm:p-5 h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-5 text-slate-300">No hay reportes.</div>
        ) : (
          <div className={layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
            {filtered.map((r) => (
              <Card key={r.id} className="p-4 sm:p-5">
                {/* header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-cyan-300 font-semibold hover:text-cyan-200">{r.title || `Reporte #${r.id}`}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone="info" className="shadow-sm">{r.category}</Badge>
                      {/* duplicar urgencia para un look más marcado */}
                      <Badge tone={r.urgency === "alta" ? "danger" : r.urgency === "media" ? "warn" : "neutral"} className="shadow-sm">
                        {r.urgency?.toUpperCase() || ""}
                      </Badge>
                      <Badge tone={r.urgency === "alta" ? "danger" : r.urgency === "media" ? "warn" : "neutral"} className="shadow-sm">
                        {r.urgency?.toUpperCase() || ""}
                      </Badge>
                      <Badge tone="gray" className="shadow-sm">{(r.status || "pendiente").toUpperCase()}</Badge>
                    </div>
                  </div>

                  {/* right meta: votos + imagen + fecha/usuario */}
                  <div className="flex flex-col items-end gap-2">
                    <Badge tone="violet">▲ {fmtVotes(r.votes)}</Badge>
                    {r.image ? (
                      <Badge tone="info" className="bg-slate-700/60 text-slate-200">IMAGEN</Badge>
                    ) : (
                      <Badge tone="gray">SIN IMAGEN</Badge>
                    )}
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(r.createdAt).toISOString().slice(0,10)}</span>
                      <span className="inline-flex items-center gap-1">👤 {r.user || "Usuario"}</span>
                    </div>
                  </div>
                </div>

                {/* summary */}
                <div className="mt-3 text-slate-300 text-sm max-w-[70ch]">{r.summary || r.description}</div>

                {/* address */}
                <div className="mt-3 text-sm text-slate-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" /> {r.address}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* conteo abajo */}
        <div className="pt-2 text-sm text-slate-400">Mostrando <b>{filtered.length}</b> de {reports.length}</div>

        {/* métricas al final */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-4 text-center">
            <div className="text-2xl font-bold text-slate-100">{metrics.total}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-4 text-center">
            <div className="text-2xl font-bold text-red-400">{metrics.urgentes}</div>
            <div className="text-xs text-slate-400">Urgentes</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{metrics.enProceso}</div>
            <div className="text-xs text-slate-400">En proceso</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{metrics.pendientes}</div>
            <div className="text-xs text-slate-400">Pendientes</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{metrics.resueltos}</div>
            <div className="text-xs text-slate-400">Resueltos</div>
          </div>
        </div>
      </div>
    </AutorityLayout>
  );
}
