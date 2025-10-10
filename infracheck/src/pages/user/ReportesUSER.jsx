import React, { useEffect, useMemo, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import { getReportes } from "../../services/reportsService";
import { getVotedReports,toggleVote,applyVotesPatch} from "../../services/votesService";
import { SEED } from "../../JSON/reportsSeed";

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
const fmtVotes = (n) => n.toLocaleString("es-CL");

/* ----------- data demo (reemplaza por tu API) ----------- */
// SEED ahora se comparte desde ../../JSON/reportsSeed

/* ---------------- icons ---------------- */
const Up = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 5l6 6H6l6-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
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

/* ---------------- main page ---------------- */
export default function ReportesUSER() {
  // Estado para reportes
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null); // ID del reporte siendo votado
  const [voted, setVoted] = useState({});

  const [q, setQ] = useState("");
  const [urg, setUrg] = useState("todas"); // baja|media|alta|todas
  const [sort, setSort] = useState("top"); // top|recent

  // Cargar reportes y estado de votos al montar el componente
  useEffect(() => {
    loadAllReports();
    loadVotedState();
  }, []);

  const loadAllReports = () => {
    setLoading(true);
    try {
      // Obtener reportes del usuario desde el servicio
      const userReports = getReportes();
      
      // Aplicar parche de votos a reportes demo y de usuario
      const seedWithVotes = applyVotesPatch(SEED);
      const userReportsWithVotes = applyVotesPatch(userReports);
      
      // Combinar reportes: primero los del usuario (más recientes), luego los demo
      setReports([...userReportsWithVotes, ...seedWithVotes]);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
      setReports(SEED);
    } finally {
      setLoading(false);
    }
  };

  const loadVotedState = () => {
    const votedReports = getVotedReports();
    setVoted(votedReports);
  };

  const handleVote = async (reportId) => {
    // Prevenir múltiples clics mientras se procesa
    if (votingId) return;
    
    setVotingId(reportId);
    
    try {
      // Encontrar el reporte actual
      const currentReport = reports.find(r => r.id === reportId);
      if (!currentReport) {
        throw new Error("Reporte no encontrado");
      }

      // Llamar al servicio de votos
      const result = await toggleVote(reportId, currentReport.votes);

      // Actualizar estado local de votos del usuario
      setVoted(prev => {
        const updated = { ...prev };
        if (result.voted) {
          updated[reportId] = true;
        } else {
          delete updated[reportId];
        }
        return updated;
      });

      // Actualizar la lista de reportes con los nuevos votos
      setReports(prev => 
        prev.map(r => 
          r.id === reportId 
            ? { ...r, votes: result.newVotes }
            : r
        )
      );

      // Opcional: Mostrar notificación de éxito
      // showNotification(result.voted ? "Voto agregado" : "Voto eliminado");
      
    } catch (error) {
      console.error("Error al votar:", error);
      // Opcional: Mostrar notificación de error
      // showNotification("Error al procesar tu voto", "error");
      alert(error.message || "No se pudo procesar tu voto. Intenta nuevamente.");
    } finally {
      setVotingId(null);
    }
  };

  const filtered = useMemo(() => {
    const byText = (r) =>
      [r.title, r.summary, r.description, r.category, r.address]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase());
    const byUrg = (r) => (urg === "todas" ? true : r.urgency === urg);
    const arr = reports.filter((r) => byText(r) && byUrg(r));
    if (sort === "top") return arr.sort((a, b) => b.votes - a.votes);
    return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reports, q, urg, sort]);

  return (
    <UserLayout title="Reportes">
      <div className="space-y-5">
        {/* toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por título, dirección o categoría…"
                className="w-[320px] max-w-full rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 placeholder:text-slate-400 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={urg}
              onChange={(e) => setUrg(e.target.value)}
              className="rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 ring-1 ring-white/10 focus:outline-none"
            >
              <option value="todas">Todas las urgencias</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl bg-slate-800/60 px-3 py-2.5 text-slate-100 ring-1 ring-white/10 focus:outline-none"
            >
              <option value="top">Más votados</option>
              <option value="recent">Más recientes</option>
            </select>
          </div>

          <div className="text-sm text-slate-400">
            Mostrando <b>{filtered.length}</b> de {reports.length}
          </div>
        </div>

        {/* loading state */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-4 sm:p-5 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : (
          /* list */
          <div className="space-y-6">
            {filtered.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-4 sm:p-5 hover:ring-indigo-400/30 transition"
              >
                {/* header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-slate-700/70 grid place-content-center text-slate-200">
                    <span className="text-base">👤</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200">{r.user}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {timeAgo(r.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {r.address}
                      </span>
                    </div>
                  </div>

                  {/* votes */}
                  <div className="ml-auto flex items-center gap-2">
                    <span
                      className={cls(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        r.urgency === "alta"
                          ? "bg-rose-500/20 text-rose-300"
                          : r.urgency === "media"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      )}
                    >
                      {r.urgency}
                    </span>

                    <button
                      onClick={() => handleVote(r.id)}
                      disabled={votingId === r.id}
                      className={cls(
                        "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs ring-1 transition",
                        votingId === r.id
                          ? "opacity-50 cursor-wait"
                          : "",
                        voted[r.id]
                          ? "bg-indigo-600 text-white ring-white/10"
                          : "bg-slate-800/60 text-slate-200 ring-white/10 hover:bg-slate-700/60"
                      )}
                      title={
                        votingId === r.id 
                          ? "Procesando..." 
                          : voted[r.id] 
                          ? "Voto aplicado (click para quitar)" 
                          : "Votar prioridad"
                      }
                    >
                      <Up className="h-4 w-4" />
                      {fmtVotes(r.votes)}
                    </button>
                  </div>
                </div>

                {/* body: media + summary */}
                <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-5">
                  <figure className="rounded-xl overflow-hidden bg-slate-800/50 ring-1 ring-white/10">
                    <img
                      src={r.image}
                      alt={r.title}
                      className="h-[220px] w-full object-cover"
                      loading="lazy"
                    />
                  </figure>

                  <div className="min-w-0">
                    <h3 className="text-slate-100 font-semibold mb-1">{r.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400">Categoría</span>
                      <span className="text-xs rounded-full px-2 py-0.5 bg-slate-800/70 text-slate-200 ring-1 ring-white/10">
                        {r.category}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 leading-6">
                      {r.summary || r.description}
                    </p>

                    {/* Barra de prioridad */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Prioridad comunitaria</span>
                        <span>{Math.min(100, Math.round((r.votes / 1000) * 100))}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800/60 overflow-hidden ring-1 ring-white/10">
                        <div
                          className={cls(
                            "h-full rounded-full transition-all",
                            r.urgency === "alta"
                              ? "bg-rose-500"
                              : r.urgency === "media"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          )}
                          style={{ width: `${Math.min(100, (r.votes / 1000) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* acciones */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a
                        href={`/user/map?lat=${r.lat}&lng=${r.lng}`}
                        className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60 transition"
                      >
                        Ver en mapa
                      </a>
                      <button className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60 transition">
                        Comentar
                      </button>
                      <button className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60 transition">
                        Compartir
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="rounded-xl bg-slate-900/50 ring-1 ring-white/10 p-8 text-center text-slate-300">
                No hay resultados para tu búsqueda.
              </div>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}