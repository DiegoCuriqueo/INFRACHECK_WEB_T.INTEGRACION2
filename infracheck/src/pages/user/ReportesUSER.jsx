import React, { useEffect, useMemo, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import { getReportes, onReportsChanged } from "../../services/reportsService";
import { getVotedReports, toggleVote, applyVotesPatch } from "../../services/votesService";

/* ---------------- helpers ---------------- */
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

const fmtVotes = (n = 0) =>
  Number.isFinite(n) ? n.toLocaleString("es-CL") : "0";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>
       <rect width='100%' height='100%' fill='rgb(30,41,59)'/>
       <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
             fill='rgb(148,163,184)' font-family='sans-serif' font-size='16'>
         Sin imagen
       </text>
     </svg>`
  );

const pct = (votes = 0, max = 1000) =>
  Math.max(0, Math.min(100, Math.round((votes / max) * 100)));

const labelStatus = (s = "pendiente") =>
  s === "en_proceso"
    ? "En proceso"
    : s === "resuelto"
    ? "Finalizado"
    : "Pendiente";

const statusTone = (s = "pendiente") =>
  s === "resuelto" ? "indigo" : s === "en_proceso" ? "slate" : "slate";

/* ---------------- icons ---------------- */
const Up = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 5l6 6H6l6-6Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MapPin = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="10" r="2.5" fill="currentColor" />
  </svg>
);

const Clock = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/* ---------------- small UI atoms ---------------- */
const Badge = ({ tone = "slate", children }) => {
  const tones = {
    slate: "bg-slate-800/70 text-slate-200 ring-white/10",
    rose: "bg-rose-500/20 text-rose-300 ring-rose-300/20",
    amber: "bg-amber-500/20 text-amber-200 ring-amber-300/20",
    emerald: "bg-emerald-500/20 text-emerald-300 ring-emerald-300/20",
    indigo: "bg-indigo-600 text-white ring-white/10",
  };

  return (
    <span
      className={cls(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1",
        tones[tone] || tones.slate
      )}
    >
      {children}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-4 sm:p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 rounded-full bg-slate-700/70 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-40 bg-slate-800/60 rounded animate-pulse" />
        <div className="h-3 w-64 bg-slate-800/60 rounded animate-pulse" />
      </div>
      <div className="h-7 w-24 bg-slate-800/60 rounded-full animate-pulse" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-5">
      <div className="h-[220px] w-full rounded-xl bg-slate-800/60 animate-pulse" />
      <div className="space-y-3">
        <div className="h-5 w-2/3 bg-slate-800/60 rounded animate-pulse" />
        <div className="h-4 w-24 bg-slate-800/60 rounded animate-pulse" />
        <div className="h-[84px] w-full bg-slate-800/60 rounded animate-pulse" />
        <div className="h-2 w-full bg-slate-800/60 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const VisualPill = ({ active = false, tone = "slate", children }) => {
  const tones = {
    slate: active
      ? "bg-slate-700 text-white shadow-sm"
      : "text-slate-300 hover:bg-slate-700/20",
    info: active
      ? "bg-sky-600 text-white shadow-sm"
      : "text-sky-200 hover:bg-sky-600/10",
    success: active
      ? "bg-emerald-600 text-white shadow-sm"
      : "text-emerald-200 hover:bg-emerald-600/10",
  };

  return (
    <button
      type="button"
      aria-disabled
      onClick={(e) => e.preventDefault()}
      title="Solo la autoridad puede cambiar el estado"
      className={cls(
        "px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-default",
        tones[tone] || tones.slate
      )}
    >
      {children}
    </button>
  );
};

/* ---------------- main page ---------------- */
export default function ReportesUSER() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const [voted, setVoted] = useState({});
  const [q, setQ] = useState("");
  const [urg, setUrg] = useState("todas");
  const [sort, setSort] = useState("top");

  /* ---------- load data ---------- */
  useEffect(() => {
    loadAllReports();
    loadVotedState();
  }, []);

  useEffect(() => {
    const unsub = onReportsChanged(() => {
      loadAllReports();
    });
    return unsub;
  }, []);

  const loadAllReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiReports = await getReportes();
      if (!Array.isArray(apiReports)) {
        throw new Error("Los datos recibidos no son un array");
      }

      const reportsWithVotes = applyVotesPatch(apiReports);
      setReports(reportsWithVotes);
    } catch (error) {
      setError(error.message || "Error al cargar reportes");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVotedState = () => {
    try {
      const votedReports = getVotedReports();
      setVoted(votedReports);
    } catch (error) {
      setVoted({});
    }
  };

  /* ---------- interactions ---------- */
  const handleVote = async (reportId) => {
    if (votingId) return;

    setVotingId(reportId);

    try {
      const currentReport = reports.find((r) => r.id === reportId);
      if (!currentReport) throw new Error("Reporte no encontrado");

      const result = await toggleVote(reportId, currentReport.votes);

      setVoted((prev) => {
        const updated = { ...prev };
        if (result.voted) updated[reportId] = true;
        else delete updated[reportId];
        return updated;
      });

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, votes: result.newVotes } : r
        )
      );
    } catch (error) {
      alert(error.message || "No se pudo procesar tu voto.");
    } finally {
      setVotingId(null);
    }
  };

  /* ---------- filtering/sorting ---------- */
  const filtered = useMemo(() => {
    const byText = (r) =>
      [r.title, r.summary, r.description, r.category, r.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase());

    const byUrg = (r) => (urg === "todas" ? true : r.urgency === urg);

    const arr = reports.filter((r) => byText(r) && byUrg(r));

    if (sort === "top") return [...arr].sort((a, b) => b.votes - a.votes);

    return [...arr].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [reports, q, urg, sort]);

  /* ---------- UI ---------- */
  return (
    <UserLayout title="Reportes">
      <div className="space-y-5">
        {/* toolbar */}
        <div
          className="sticky top-0 z-10 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 backdrop-blur bg-slate-900/40 border-b border-white/10"
          role="region"
          aria-label="Barra de herramientas de reportes"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por título, dirección o categoría…"
                  aria-label="Buscar reportes"
                  className="w-[320px] max-w-full rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 placeholder:text-slate-400 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {q && (
                  <button
                    onClick={() => setQ("")}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={urg}
                onChange={(e) => setUrg(e.target.value)}
                aria-label="Filtrar por urgencia"
                className="rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todas">Todas las urgencias</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Ordenar resultados"
                className="rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="top">Más votados</option>
                <option value="recent">Más recientes</option>
              </select>

              {(q || urg !== "todas" || sort !== "top") && (
                <button
                  onClick={() => {
                    setQ("");
                    setUrg("todas");
                    setSort("top");
                  }}
                  className="rounded-xl px-3 py-2.5 text-xs bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60"
                >
                  Restablecer
                </button>
              )}
            </div>

            <div className="text-sm text-slate-300">
              Mostrando <b>{filtered.length}</b> de {reports.length} reporte
              {reports.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {/* error */}
        {error && (
          <div className="rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20 p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-rose-200 font-medium">
                  Error al cargar reportes
                </p>
                <p className="text-rose-300/70 text-sm">{error}</p>
              </div>
              <button
                onClick={loadAllReports}
                className="ml-auto text-xs rounded-lg px-3 py-2 bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/30 hover:bg-rose-500/30"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* loading */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          /* lista */
          <div className="space-y-6">
            {filtered.map((r) => {
              const urgencyTone =
                r.urgency === "alta"
                  ? "rose"
                  : r.urgency === "media"
                  ? "amber"
                  : "emerald";

              const priority = pct(r.votes, 1000);

              return (
                <article
                  key={r.id}
                  className="group rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-4 sm:p-5 hover:ring-indigo-400/30 hover:shadow-lg/5 transition"
                >
                  {/* header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-full bg-slate-700/70 grid place-content-center text-slate-200 ring-1 ring-white/10">
                      <span className="text-base">👤</span>
                    </div>

                    <div className="min-w-0">
                      <p
                        className="text-sm text-slate-200 truncate"
                        title={r.user}
                      >
                        {r.user || "Usuario"}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span
                          className="inline-flex items-center gap-1"
                          title={new Date(r.createdAt).toLocaleString()}
                        >
                          <Clock className="h-4 w-4" /> {timeAgo(r.createdAt)}
                        </span>

                        <span
                          className="inline-flex items-center gap-1 truncate"
                          title={r.address}
                        >
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-[220px]">
                            {r.address}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* right actions */}
                    <div className="ml-auto flex items-center gap-2">
                      <Badge tone={urgencyTone}>{r.urgency}</Badge>
                      <Badge tone={statusTone(r.status)}>
                        {labelStatus(r.status)}
                      </Badge>

                      <button
                        onClick={() => handleVote(r.id)}
                        disabled={votingId === r.id}
                        aria-pressed={!!voted[r.id]}
                        title={
                          votingId === r.id
                            ? "Procesando…"
                            : voted[r.id]
                            ? "Voto aplicado"
                            : "Votar prioridad"
                        }
                        className={cls(
                          "relative overflow-hidden flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ring-1 transition focus:outline-none focus:ring-2 focus:ring-indigo-500",
                          votingId === r.id
                            ? "opacity-60 cursor-wait"
                            : "hover:translate-y-[-1px]",
                          voted[r.id]
                            ? "bg-indigo-600 text-white ring-white/10"
                            : "bg-slate-800/60 text-slate-200 ring-white/10 hover:bg-slate-700/60"
                        )}
                      >
                        <Up
                          className={cls(
                            "h-4 w-4 transition",
                            voted[r.id] ? "scale-110" : ""
                          )}
                        />
                        {fmtVotes(r.votes)}
                      </button>
                    </div>
                  </div>

                  {/* body */}
                  <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-5">
                    <figure className="rounded-xl overflow-hidden bg-slate-800/50 ring-1 ring-white/10">
                      <div className="relative w-full aspect-[16/9]">
                        <img
                          src={r.imageDataUrl || r.image || FALLBACK_IMG}
                          alt={r.title || "Reporte"}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => {
                            if (e.currentTarget.src !== FALLBACK_IMG) {
                              e.currentTarget.src = FALLBACK_IMG;
                            }
                          }}
                        />
                      </div>
                    </figure>

                    <div className="min-w-0">
                      <h3
                        className="text-slate-100 font-semibold mb-1 line-clamp-2"
                        title={r.title}
                      >
                        {r.title || "Reporte sin título"}
                      </h3>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400">
                          Categoría
                        </span>
                        <Badge>{r.category || "General"}</Badge>
                      </div>

                      <p className="text-sm text-slate-300 leading-6 line-clamp-4">
                        {r.summary || r.description || "Sin descripción."}
                      </p>

                      {/* barra prioridad */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>Prioridad comunitaria</span>
                          <span>{priority}%</span>
                        </div>

                        <div className="h-2 rounded-full bg-slate-800/60 overflow-hidden ring-1 ring-white/10">
                          <div
                            className={cls(
                              "h-full rounded-full transition-all duration-500",
                              r.urgency === "alta"
                                ? "bg-rose-500"
                                : r.urgency === "media"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            )}
                            style={{ width: `${priority}%` }}
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={priority}
                          />
                        </div>
                      </div>

                      {/* estado */}
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400">
                          Estado del reporte
                        </span>

                        <div className="inline-flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl ring-1 ring-slate-700">
                          <VisualPill
                            active={(r.status || "pendiente") === "pendiente"}
                          >
                            Pendiente
                          </VisualPill>

                          <VisualPill
                            tone="info"
                            active={(r.status || "pendiente") === "en_proceso"}
                          >
                            En proceso
                          </VisualPill>

                          <VisualPill
                            tone="success"
                            active={(r.status || "pendiente") === "resuelto"}
                          >
                            Finalizado
                          </VisualPill>
                        </div>
                      </div>

                      {/* acciones */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <a
                          href={`/user/map?lat=${r.lat}&lng=${r.lng}`}
                          className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60"
                        >
                          Ver en mapa
                        </a>

                        <button
                          type="button"
                          className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60"
                        >
                          Comentar
                        </button>

                        <button
                          type="button"
                          className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60"
                        >
                          Compartir
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* no resultados */}
            {filtered.length === 0 && !loading && !error && (
              <div className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-10 text-center">
                <div className="mx-auto mb-3 h-10 w-10 grid place-content-center rounded-full bg-slate-800/70 ring-1 ring-white/10">
                  🔎
                </div>
                <p className="text-slate-200 font-medium">Sin resultados</p>
                <p className="text-slate-400 text-sm">
                  No encontramos reportes que coincidan con tu búsqueda.
                </p>

                <div className="mt-4">
                  <button
                    onClick={() => {
                      setQ("");
                      setUrg("todas");
                      setSort("top");
                    }}
                    className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
