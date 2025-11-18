import React, { useEffect, useMemo, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import { getReportes, onReportsChanged, getReporteById, getReportComments, addReportComment } from "../../services/reportsService"
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
    slate:
      "bg-slate-100 text-slate-800 ring-slate-300 dark:bg-slate-800/70 dark:text-slate-200 dark:ring-white/10",
    rose:
      "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-300/20",
    amber:
      "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-300/20",
    emerald:
      "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-300/20",
    indigo:
      "bg-indigo-600 text-white ring-indigo-500/40 dark:bg-indigo-600 dark:text-white dark:ring-white/10",
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
  <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 sm:p-5 shadow-sm dark:bg-slate-900/60 dark:ring-white/10">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse dark:bg-slate-700/70" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-40 bg-slate-200 rounded animate-pulse dark:bg-slate-800/60" />
        <div className="h-3 w-64 bg-slate-200 rounded animate-pulse dark:bg-slate-800/60" />
      </div>
      <div className="h-7 w-24 bg-slate-200 rounded-full animate-pulse dark:bg-slate-800/60" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-5">
      <div className="h-[220px] w-full rounded-xl bg-slate-200 animate-pulse dark:bg-slate-800/60" />
      <div className="space-y-3">
        <div className="h-5 w-2/3 bg-slate-200 rounded animate-pulse dark:bg-slate-800/60" />
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse dark:bg-slate-800/60" />
        <div className="h-[84px] w-full bg-slate-200 rounded animate-pulse dark:bg-slate-800/60" />
        <div className="h-2 w-full bg-slate-200 rounded animate-pulse dark:bg-slate-800/60" />
      </div>
    </div>
  </div>
);

// Botón tipo píldora SOLO VISUAL (no interactivo en USER)
const VisualPill = ({ active = false, tone = "slate", children }) => {
  const tones = {
    slate: active
      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700 dark:text-white"
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/20",
    info: active
      ? "bg-sky-600 text-white shadow-sm"
      : "text-sky-700 hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-600/10",
    success: active
      ? "bg-emerald-600 text-white shadow-sm"
      : "text-emerald-700 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-600/10",
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
const UserReportDetailModal = ({ report, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  if (!report) return null;

  const img = report.imageDataUrl || report.image || FALLBACK_IMG;

  // Cargar comentarios cuando se abre el modal o cambia el reporte
  useEffect(() => {
    if (!report?.id) return;
    let cancelled = false;

    const loadComments = async () => {
      setCommentsLoading(true);
      setCommentsError(null);
      try {
        const data = await getReportComments(report.id);
        if (!cancelled) {
          setComments(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setCommentsError(
            err?.message || "No se pudieron cargar los comentarios."
          );
        }
      } finally {
        if (!cancelled) {
          setCommentsLoading(false);
        }
      }
    };

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [report?.id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    const text = newComment.trim();
    if (text.length < 10) {
      setCommentsError("El comentario debe tener al menos 10 caracteres.");
      return;
    }

    try {
      setSending(true);
      setCommentsError(null);
      const created = await addReportComment(report.id, text);
      if (created) {
        // Lo agregamos al inicio de la lista
        setComments((prev) => [created, ...(prev || [])]);
        setNewComment("");
      }
    } catch (err) {
      setCommentsError(
        err?.message || "No se pudo publicar el comentario. Intenta nuevamente."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/60">
      <div className="w-[90vw] max-w-3xl rounded-2xl bg-white p-4 sm:p-5 max-h-[85vh] overflow-y-auto ring-1 ring-slate-200 shadow-xl dark:bg-slate-900 dark:ring-white/10">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-900 truncate dark:text-slate-100">
              {report.title || "Reporte sin título"}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Creado por{" "}
              <span className="font-medium">
                {report.user || "Usuario"}
              </span>{" "}
              ·{" "}
              {report.createdAt
                ? new Date(report.createdAt).toLocaleString("es-CL")
                : "Fecha no disponible"}
            </p>
            {report.address && (
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-1 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5" /> {report.address}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>

        {/* imagen + badges */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
          <figure className="rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-white/10">
            <div className="relative w-full aspect-[16/9]">
              <img
                src={img}
                alt={report.title || "Reporte"}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMG) {
                    e.currentTarget.src = FALLBACK_IMG;
                  }
                }}
              />
            </div>
          </figure>

          <div className="space-y-2 text-sm">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide dark:text-slate-400">
                Estado
              </p>
              <Badge tone={statusTone(report.status)}>
                {labelStatus(report.status)}
              </Badge>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mt-2 dark:text-slate-400">
                Urgencia
              </p>
              <Badge
                tone={
                  report.urgency === "alta"
                    ? "rose"
                    : report.urgency === "media"
                    ? "amber"
                    : "emerald"
                }
              >
                {report.urgency || "Sin urgencia"}
              </Badge>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mt-2 dark:text-slate-400">
                Votos
              </p>
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs bg-slate-100 text-slate-800 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-100 dark:ring-white/10">
                ▲ {fmtVotes(report.votes)}
              </span>
            </div>

            {report.category && (
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mt-2 dark:text-slate-400">
                  Categoría
                </p>
                <Badge>{report.category}</Badge>
              </div>
            )}
          </div>
        </div>

        {/* descripción completa */}
        <div className="mt-4">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1 dark:text-slate-400">
            Descripción
          </p>
          <p className="text-sm text-slate-800 leading-6 whitespace-pre-line dark:text-slate-200">
            {report.summary ||
              report.description ||
              "Sin descripción disponible."}
          </p>
        </div>

        {/* 💬 Comentarios */}
        <section className="mt-6 border-t border-slate-200 pt-4 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Comentarios
            </h3>
            {comments && comments.length > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {comments.length} comentario
                {comments.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {/* estado de carga / error */}
          {commentsLoading && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cargando comentarios…
            </p>
          )}
          {commentsError && (
            <p className="text-xs text-rose-600 mb-2 dark:text-rose-400">
              {commentsError}
            </p>
          )}

          {/* lista de comentarios */}
          {!commentsLoading && comments && comments.length === 0 && (
            <p className="text-xs text-slate-500 mb-3 dark:text-slate-400">
              Aún no hay comentarios en este reporte. Sé el primero en opinar ✨
            </p>
          )}

          {!commentsLoading && comments && comments.length > 0 && (
            <ul className="space-y-3 mb-4">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200 text-xs dark:bg-slate-800/60 dark:ring-white/10"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {c.user || "Usuario"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {c.date
                        ? new Date(c.date).toLocaleString("es-CL")
                        : ""}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 whitespace-pre-line">
                    {c.text}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* formulario de nuevo comentario */}
          <form
            onSubmit={handleSubmitComment}
            className="mt-2 space-y-2"
          >
            {!isAuthenticated && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Debes iniciar sesión para comentar este reporte.
              </p>
            )}

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder={
                isAuthenticated
                  ? "Escribe tu comentario (mín. 10 caracteres)…"
                  : "Inicia sesión para poder comentar…"
              }
              disabled={!isAuthenticated || sending}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-60 dark:bg-slate-800/60 dark:text-slate-100 dark:border-white/10 dark:placeholder:text-slate-500"
            />

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tu comentario será visible públicamente.
              </p>
              <button
                type="submit"
                disabled={!isAuthenticated || sending}
                className={cls(
                  "text-xs rounded-lg px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                )}
              >
                {sending ? "Publicando…" : "Publicar comentario"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};


export default function ReportesUSER() {
  const { user } = useAuth();

  // Estado para TODOS los reportes
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [votingId, setVotingId] = useState(null);
  const [voted, setVoted] = useState({});

  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const openDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };
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
          className="sticky top-0 z-10 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 backdrop-blur bg-white/80 border-b border-slate-200/80 dark:bg-slate-900/40 dark:border-white/10"
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
                  className="w-[320px] max-w-full rounded-xl bg-slate-50 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800/60 dark:text-slate-100 dark:ring-white/10"
                  aria-label="Buscar reportes"
                />
                {q && (
                  <button
                    onClick={() => setQ("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                className="rounded-xl bg-slate-50 px-3 py-2.5 text-slate-900 ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800/60 dark:text-slate-100 dark:ring-white/10"
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
                className="rounded-xl bg-slate-50 px-3 py-2.5 text-slate-900 ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800/60 dark:text-slate-100 dark:ring-white/10"
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
                  className="rounded-xl px-3 py-2.5 text-xs bg-slate-50 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700/60"
                  title="Restablecer filtros"
                >
                  Restablecer
                </button>
              )}
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300">
              Mostrando <b>{filtered.length}</b> de {reports.length} reporte
              {reports.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {/* error state */}
        {error && (
          <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-4 dark:bg-rose-500/10 dark:ring-rose-500/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-rose-800 font-medium dark:text-rose-200">
                  Error al cargar reportes
                </p>
                <p className="text-rose-700/80 text-sm dark:text-rose-300/70">
                  {error}
                </p>
              </div>
              <button
                onClick={loadAllReports}
                className="ml-auto text-xs rounded-lg px-3 py-2 bg-rose-100 text-rose-800 ring-1 ring-rose-200 hover:bg-rose-200 transition dark:bg-rose-500/20 dark:text-rose-200 dark:ring-rose-500/30 dark:hover:bg-rose-500/30"
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
              <section className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 sm:p-5 space-y-4 shadow-sm dark:bg-slate-900/80 dark:ring-white/10">
                <header className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 dark:text-slate-100">
                    <span>⭐</span>
                    <span>Reportes destacados</span>
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Basado en los reportes con más votos
                  </span>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {destacados.map((r) => (
                    <article
                      key={r.id}
                      className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 flex flex-col hover:ring-indigo-400/40 hover:shadow-md transition dark:bg-slate-900/80 dark:ring-white/10"
                    >
                      <div className="rounded-lg overflow-hidden bg-slate-100 mb-3 dark:bg-slate-800/60">
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

                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-1 dark:text-slate-100">
                        {r.title || "Reporte sin título"}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 mb-2 dark:text-slate-400">
                        {r.summary || r.description || "Sin descripción."}
                      </p>

                      <div className="mt-auto flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
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
              <section className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 sm:p-5 space-y-4 shadow-sm dark:bg-slate-900/80 dark:ring-white/10">
                <header className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 dark:text-slate-100">
                    <span>📌</span>
                    <span>Mis reportes</span>
                  </h2>
                  {myReports.length > 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Tienes <b>{myReports.length}</b> reporte
                      {myReports.length === 1 ? "" : "s"} creado
                      {myReports.length === 1 ? "" : "s"}
                    </span>
                  )}
                </header>

                {myReports.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Aún no has creado ningún reporte. ¡Anímate a registrar un
                    problema en tu comunidad! ✨
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myReports.map((r) => (
                      <article
                        key={r.id}
                        className="flex gap-3 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 hover:ring-indigo-400/40 hover:shadow-md transition dark:bg-slate-900 dark:ring-white/10"
                      >
                        <div className="h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800/60">
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
                            <h3 className="text-sm font-semibold text-slate-900 truncate dark:text-slate-100">
                              {r.title || "Reporte sin título"}
                            </h3>
                            <Badge tone={statusTone(r.status)}>
                              {labelStatus(r.status)}
                            </Badge>
                          </div>

                          <p className="text-xs text-slate-500 mt-0.5 truncate dark:text-slate-400">
                            {r.address}
                          </p>

                          <p className="text-xs text-slate-700 mt-1 line-clamp-2 dark:text-slate-300">
                            {r.summary || r.description || "Sin descripción."}
                          </p>

                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {timeAgo(r.createdAt)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              {fmtVotes(r.votes)} votos •{" "}
                              <span
                                className={cls(
                                  "capitalize px-2 py-0.5 rounded-full",
                                  r.urgency === "alta"
                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200"
                                    : r.urgency === "media"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
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
                    className="group rounded-2xl bg-white ring-1 ring-slate-200 p-4 sm:p-5 hover:ring-indigo-400/30 hover:shadow-lg transition dark:bg-slate-900/60 dark:ring-white/10"
                    onClick={() => openDetail(r)}
                  >

                    {/* header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 grid place-content-center text-slate-700 ring-1 ring-slate-300 dark:bg-slate-700/70 dark:text-slate-200 dark:ring-white/10">
                        <span className="text-base" aria-hidden="true">
                          👤
                        </span>
                        <span className="sr-only">Autor del reporte</span>
                      </div>

                      <div className="min-w-0">
                        <p
                          className="text-sm text-slate-900 truncate dark:text-slate-200"
                          title={r.user}
                        >
                          {r.user || "Usuario"}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
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
                          onClick={(e) => {
                            e.stopPropagation(); // no abrir modal cuando solo se vota
                            handleVote(r.id);
                          }}
                          disabled={votingId === r.id}
                          aria-pressed={!!voted[r.id]}
                          className={cls(
                            "relative overflow-hidden flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ring-1 transition focus:outline-none focus:ring-2 focus:ring-indigo-500",
                            votingId === r.id
                              ? "opacity-60 cursor-wait"
                              : "hover:translate-y-[-1px]",
                            voted[r.id]
                              ? "bg-indigo-600 text-white ring-indigo-500/60 dark:ring-white/10"
                              : "bg-slate-50 text-slate-800 ring-slate-300 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700/60"
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
                      <figure className="rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800/50 dark:ring-white/10">
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
                          className="text-slate-900 font-semibold mb-1 line-clamp-2 dark:text-slate-100"
                          title={r.title}
                        >
                          {r.title || "Reporte sin título"}
                        </h3>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Categoría
                          </span>
                          <Badge>{r.category || "General"}</Badge>
                        </div>

                        <p className="text-sm text-slate-700 leading-6 line-clamp-4 dark:text-slate-300">
                          {r.summary || r.description || "Sin descripción."}
                        </p>

                        {/* Barra de prioridad */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 dark:text-slate-400">
                            <span>Prioridad comunitaria</span>
                            <span>{priority}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-white/10">
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
                          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Estado del reporte
                          </span>
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
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
                            className="text-xs rounded-lg px-3 py-2 bg-slate-50 text-slate-800 ring-1 ring-slate-300 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700/60"
                          >
                            Ver en mapa
                          </a>

                          <button
                            type="button"
                            className="text-xs rounded-lg px-3 py-2 bg-slate-50 text-slate-800 ring-1 ring-slate-300 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700/60"
                            onClick={(e) => {
                              e.stopPropagation(); // para que no se dispare dos veces
                              openDetail(r);
                            }}
                          >
                            Comentar
                          </button>


                          <button
                            type="button"
                            className="text-xs rounded-lg px-3 py-2 bg-slate-50 text-slate-800 ring-1 ring-slate-300 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700/60"
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
                <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-10 text-center shadow-sm dark:bg-slate-900/60 dark:ring-white/10">
                  <div className="mx-auto mb-3 h-10 w-10 grid place-content-center rounded-full bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-white/10">
                    🔎
                  </div>
                  <p className="text-slate-900 font-medium dark:text-slate-200">
                    Sin resultados
                  </p>
                  <p className="text-slate-500 text-sm dark:text-slate-400">
                    No encontramos reportes que coincidan con tu búsqueda.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setQ("");
                        setUrg("todas");
                        setSort("top");
                      }}
                      className="text-xs rounded-lg px-3 py-2 bg-slate-50 text-slate-800 ring-1 ring-slate-300 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700/60"
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
    {showDetailModal && selectedReport && (
        <UserReportDetailModal
          report={selectedReport}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </UserLayout>
  );
}
