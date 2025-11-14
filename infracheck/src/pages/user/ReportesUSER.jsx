import React, { useEffect, useMemo, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import { getReportes, onReportsChanged } from "../../services/reportsService";
import {
  getVotedReports,
  toggleVote,
  applyVotesPatch,
} from "../../services/votesService";
import { useAuth } from "../../contexts/AuthContext";

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
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%' height='100%' fill='rgb(30,41,59)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='rgb(148,163,184)' font-family='sans-serif' font-size='16'>Sin imagen</text></svg>`
  );

const pct = (votes = 0, max = 1000) =>
  Math.max(0, Math.min(100, Math.round((votes / max) * 100)));

// helpers de estado (solo visual en USER)
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
    <path
      d="M12 7v5l3 3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

/* -------------- small UI atoms -------------- */
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

// Botón tipo píldora SOLO VISUAL (no interactivo en USER)
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
      className={cls(
        "px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-default",
        tones[tone] || tones.slate
      )}
      title="Solo la autoridad puede cambiar el estado"
      onClick={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
};

/* ---------------- main page ---------------- */
export default function ReportesUSER() {
  const { user } = useAuth();

  // Estado para TODOS los reportes
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [votingId, setVotingId] = useState(null);
  const [voted, setVoted] = useState({});

  const [q, setQ] = useState("");
  const [urg, setUrg] = useState("todas"); // baja|media|alta|todas
  const [sort, setSort] = useState("top"); // top|recent

  /* ---------- load data ---------- */
  useEffect(() => {
    loadAllReports();
    loadVotedState();
  }, []);

  // 🔄 Escuchar cambios globales
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
      const reportsWithVotes = applyVotesPatch(apiReports);
      setReports(reportsWithVotes);
    } catch (error) {
      console.error("❌ Error al cargar reportes:", error);
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
      console.error("Error al cargar estado de votos:", error);
      setVoted({});
    }
  };

  /* ---------- interactions ---------- */
  const handleVote = async (reportId) => {
    if (votingId) return; // evita doble click
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
      console.error("Error al votar:", error);
      alert(
        error.message || "No se pudo procesar tu voto. Intenta nuevamente."
      );
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

    if (sort === "top") return [...arr].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    return [...arr].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [reports, q, urg, sort]);

  // ⭐ Reportes destacados: top 3 por votos (independiente de filtros)
  const destacados = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    const ordenados = [...reports].sort(
      (a, b) => (b.votes || 0) - (a.votes || 0)
    );
    return ordenados.slice(0, 3);
  }, [reports]);

  // 🧍‍♂️ MIS REPORTES: filtrados desde todos los reportes
  const myReports = useMemo(() => {
    if (!user || !reports || reports.length === 0) return [];

    // posibles IDs del usuario en el objeto user
    const userIds = [
      user.id,
      user.userId,
      user.user_id,
      user.usu_id,
    ]
      .filter((v) => v !== undefined && v !== null)
      .map((v) => String(v));

    // posibles nombres
    const usernameVariants = [
      user.username,
      user.nombre,
      user.name,
    ]
      .filter(Boolean)
      .map((s) => s.toLowerCase().trim());

    return reports.filter((r) => {
      // 1) match por id
      if (
        userIds.length > 0 &&
        r.userId !== undefined &&
        r.userId !== null &&
        userIds.includes(String(r.userId))
      ) {
        return true;
      }

      // 2) match por nombre (ej. "Larry" en r.user = "Larry Verdugo")
      const authorName = (r.user || "").toLowerCase().trim();
      if (authorName && usernameVariants.length > 0) {
        if (usernameVariants.some((name) => name && authorName.includes(name))) {
          return true;
        }
      }

      return false;
    });
  }, [reports, user]);

  /* ---------- UI ---------- */
  return (
    <UserLayout title="Reportes">
      <div className="space-y-5">
        {/* toolbar (sticky) */}
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
                  className="w-[320px] max-w-full rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 placeholder:text-slate-400 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Buscar reportes"
                />
                {q && (
                  <button
                    onClick={() => setQ("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    title="Limpiar búsqueda"
                    aria-label="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={urg}
                onChange={(e) => setUrg(e.target.value)}
                className="rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Filtrar por urgencia"
              >
                <option value="todas">Todas las urgencias</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Ordenar resultados"
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
                  className="rounded-xl px-3 py-2.5 text-xs bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title="Restablecer filtros"
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

        {/* error state */}
        {error && (
          <div className="rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20 p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-rose-200 font-medium">Error al cargar reportes</p>
                <p className="text-rose-300/70 text-sm">{error}</p>
              </div>
              <button
                onClick={loadAllReports}
                className="ml-auto text-xs rounded-lg px-3 py-2 bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/30 hover:bg-rose-500/30 transition"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* loading state general */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* ⭐ Reportes destacados */}
            {destacados.length > 0 && (
              <section className="rounded-2xl bg-slate-900/80 ring-1 ring-white/10 p-4 sm:p-5 space-y-4">
                <header className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <span>⭐</span>
                    <span>Reportes destacados</span>
                  </h2>
                  <span className="text-xs text-slate-400">
                    Basado en los reportes con más votos
                  </span>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {destacados.map((r) => (
                    <article
                      key={r.id}
                      className="rounded-xl bg-slate-900/80 ring-1 ring-white/10 p-3 flex flex-col hover:ring-indigo-400/40 transition"
                    >
                      <div className="rounded-lg overflow-hidden bg-slate-800/60 mb-3">
                        <div className="relative w-full aspect-[16/9]">
                          <img
                            src={r.imageDataUrl || r.image || FALLBACK_IMG}
                            alt={r.title || "Reporte"}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              if (e.currentTarget.src !== FALLBACK_IMG) {
                                e.currentTarget.src = FALLBACK_IMG;
                              }
                            }}
                          />
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 mb-1">
                        {r.title || "Reporte sin título"}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-3 mb-2">
                        {r.summary || r.description || "Sin descripción."}
                      </p>

                      <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400">
                        <span>{fmtVotes(r.votes)} votos</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {timeAgo(r.createdAt)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* 🧍‍♂️ Mis reportes (lista con imagen + detalles) */}
            {user && (
              <section className="rounded-2xl bg-slate-900/80 ring-1 ring-white/10 p-4 sm:p-5 space-y-4">
                <header className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <span>📌</span>
                    <span>Mis reportes</span>
                  </h2>
                  {myReports.length > 0 && (
                    <span className="text-xs text-slate-400">
                      Tienes <b>{myReports.length}</b> reporte
                      {myReports.length === 1 ? "" : "s"} creado
                      {myReports.length === 1 ? "" : "s"}
                    </span>
                  )}
                </header>

                {myReports.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Aún no has creado ningún reporte. ¡Anímate a registrar un
                    problema en tu comunidad! ✨
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myReports.map((r) => (
                      <article
                        key={r.id}
                        className="flex gap-3 rounded-xl bg-slate-900 ring-1 ring-white/10 p-3 hover:ring-indigo-400/40 transition"
                      >
                        <div className="h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800/60">
                          <img
                            src={r.imageDataUrl || r.image || FALLBACK_IMG}
                            alt={r.title || "Mi reporte"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              if (e.currentTarget.src !== FALLBACK_IMG) {
                                e.currentTarget.src = FALLBACK_IMG;
                              }
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-semibold text-slate-100 truncate">
                              {r.title || "Reporte sin título"}
                            </h3>
                            <Badge tone={statusTone(r.status)}>
                              {labelStatus(r.status)}
                            </Badge>
                          </div>

                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {r.address}
                          </p>

                          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                            {r.summary || r.description || "Sin descripción."}
                          </p>

                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {timeAgo(r.createdAt)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              {fmtVotes(r.votes)} votos •{" "}
                              <span
                                className={cls(
                                  "capitalize px-2 py-0.5 rounded-full",
                                  r.urgency === "alta"
                                    ? "bg-rose-500/15 text-rose-200"
                                    : r.urgency === "media"
                                    ? "bg-amber-500/15 text-amber-200"
                                    : "bg-emerald-500/15 text-emerald-200"
                                )}
                              >
                                {r.urgency}
                              </span>
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* LISTA completa con filtros */}
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
                        <span className="text-base" aria-hidden="true">
                          👤
                        </span>
                        <span className="sr-only">Autor del reporte</span>
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
                            <MapPin className="h-4 w-4" />{" "}
                            <span className="truncate max-w-[220px]">
                              {r.address}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* right side actions */}
                      <div className="ml-auto flex items-center gap-2">
                        <Badge tone={urgencyTone}>{r.urgency}</Badge>

                        {/* Estado actual (badge visual) */}
                        <Badge tone={statusTone(r.status)}>
                          {labelStatus(r.status)}
                        </Badge>

                        <button
                          onClick={() => handleVote(r.id)}
                          disabled={votingId === r.id}
                          aria-pressed={!!voted[r.id]}
                          className={cls(
                            "relative overflow-hidden flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ring-1 transition focus:outline-none focus:ring-2 focus:ring-indigo-500",
                            votingId === r.id
                              ? "opacity-60 cursor-wait"
                              : "hover:translate-y-[-1px]",
                            voted[r.id]
                              ? "bg-indigo-600 text-white ring-white/10"
                              : "bg-slate-800/60 text-slate-200 ring-white/10 hover:bg-slate-700/60"
                          )}
                          title={
                            votingId === r.id
                              ? "Procesando…"
                              : voted[r.id]
                              ? "Voto aplicado (click para quitar)"
                              : "Votar prioridad"
                          }
                        >
                          <Up
                            className={cls(
                              "h-4 w-4 transition",
                              voted[r.id]
                                ? "scale-110"
                                : "group-hover:translate-y-[-1px]"
                            )}
                          />
                          {fmtVotes(r.votes)}
                        </button>
                      </div>
                    </div>

                    {/* body: media + summary */}
                    <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-5">
                      <figure className="rounded-xl overflow-hidden bg-slate-800/50 ring-1 ring-white/10">
                        <div className="relative w-full aspect-[16/9]">
                          <img
                            src={r.imageDataUrl || r.image || FALLBACK_IMG}
                            alt={r.title || "Reporte"}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              if (e.currentTarget.src !== FALLBACK_IMG)
                                e.currentTarget.src = FALLBACK_IMG;
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

                        {/* Barra de prioridad */}
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
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={priority}
                              role="progressbar"
                            />
                          </div>
                        </div>

                        {/* Estado (botonera visual, no interactiva) */}
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-wider text-slate-400">
                            Estado del reporte
                          </span>
                          <div className="inline-flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl ring-1 ring-slate-700">
                            <VisualPill
                              active={(r.status || "pendiente") === "pendiente"}
                              tone="slate"
                            >
                              Pendiente
                            </VisualPill>
                            <VisualPill
                              active={(r.status || "pendiente") === "en_proceso"}
                              tone="info"
                            >
                              En proceso
                            </VisualPill>
                            <VisualPill
                              active={(r.status || "pendiente") === "resuelto"}
                              tone="success"
                            >
                              Finalizado
                            </VisualPill>
                          </div>
                        </div>

                        {/* acciones */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <a
                            href={`/user/map?lat=${r.lat}&lng=${r.lng}`}
                            className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            Ver en mapa
                          </a>

                          <button
                            type="button"
                            className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            Comentar
                          </button>

                          <button
                            type="button"
                            className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            Compartir
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

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
                      className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
}
