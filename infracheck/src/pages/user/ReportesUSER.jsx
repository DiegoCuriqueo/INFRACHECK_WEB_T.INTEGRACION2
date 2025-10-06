import React, { useEffect, useMemo, useState } from "react";
import UserLayout from "../../layout/UserLayout";

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
const SEED = [
  {
    id: "r1",
    user: "Usuario",
    title: "Bache profundo en Av. Alemania",
    summary:
      "Hueco de ~50 cm que provoca desvíos bruscos. Alto flujo horario punta.",
    category: "Vialidad",
    urgency: "alta",
    image:
      "https://images.unsplash.com/photo-1617727553256-84de7c1240e8?q=80&w=1200&auto=format&fit=crop",
    votes: 254,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    lat: -38.7411,
    lng: -72.598,
    address: "Av. Alemania 1450, Temuco",
  },
  {
    id: "r2",
    user: "Usuario",
    title: "Baldosas sueltas en Plaza Aníbal Pinto",
    summary:
      "Tramo resbaladizo y con desniveles. Riesgo de caídas de adultos mayores.",
    category: "Espacio público",
    urgency: "media",
    image:
      "https://images.unsplash.com/photo-1603706581421-89f8b7a38f9b?q=80&w=1200&auto=format&fit=crop",
    votes: 254,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    lat: -38.7388,
    lng: -72.604,
    address: "Plaza Aníbal Pinto, Temuco",
  },
  {
    id: "r3",
    user: "Usuario",
    title: "Luminaria apagada en pasaje Los Robles",
    summary:
      "Sector oscuro durante la noche. Solicita recambio de ampolleta y revisión de poste.",
    category: "Iluminación",
    urgency: "baja",
    image:
      "https://images.unsplash.com/photo-1519683021815-c9f8a8b0f1b0?q=80&w=1200&auto=format&fit=crop",
    votes: 73,
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    lat: -38.7482,
    lng: -72.59,
    address: "Psje. Los Robles 220, Temuco",
  },
];

// Función para cargar reportes del usuario desde localStorage
const loadUserReports = () => {
  try {
    const stored = localStorage.getItem("userReports");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

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
  // votos persistidos por usuario (toggle)
  const [voted, setVoted] = useState(() => {
    try {
      const raw = localStorage.getItem("votedReports");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Combinar reportes demo con reportes del usuario
  const [reports, setReports] = useState(() => {
    try {
      const userReports = loadUserReports();
      const patch = JSON.parse(localStorage.getItem("votesPatch") || "{}");
      const seedWithPatches = SEED.map((r) => ({ ...r, votes: patch[r.id] ?? r.votes }));
      // Combinar reportes: primero los del usuario (más recientes), luego los demo
      return [...userReports, ...seedWithPatches];
    } catch {
      return SEED;
    }
  });

  const [q, setQ] = useState("");
  const [urg, setUrg] = useState("todas"); // baja|media|alta|todas
  const [sort, setSort] = useState("top"); // top|recent

  // Recargar reportes del usuario cuando el componente se monta
  useEffect(() => {
    const userReports = loadUserReports();
    const patch = JSON.parse(localStorage.getItem("votesPatch") || "{}");
    const seedWithPatches = SEED.map((r) => ({ ...r, votes: patch[r.id] ?? r.votes }));
    setReports([...userReports, ...seedWithPatches]);
  }, []);

  // persist vote state
  useEffect(() => {
    localStorage.setItem("votedReports", JSON.stringify(voted));
  }, [voted]);

  const handleVote = (id) => {
    setReports((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const wasVoted = !!voted[id];
        const delta = wasVoted ? -1 : +1;
        const next = { ...r, votes: Math.max(0, r.votes + delta) };
        
        // Actualizar parche de votos
        const patch = JSON.parse(localStorage.getItem("votesPatch") || "{}");
        patch[id] = next.votes;
        localStorage.setItem("votesPatch", JSON.stringify(patch));
        
        // Si es un reporte del usuario, también actualizar en userReports
        const userReports = loadUserReports();
        const updatedUserReports = userReports.map(ur => 
          ur.id === id ? { ...ur, votes: next.votes } : ur
        );
        if (userReports.some(ur => ur.id === id)) {
          localStorage.setItem("userReports", JSON.stringify(updatedUserReports));
        }
        
        return next;
      })
    );
    setVoted((v) => ({ ...v, [id]: !v[id] }));
  };

  const filtered = useMemo(() => {
    const byText = (r) =>
      [r.title, r.summary, r.category, r.address]
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

        {/* list */}
        <div className="space-y-6">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-4 sm:p-5"
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
                    className={cls(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs ring-1 transition",
                      voted[r.id]
                        ? "bg-indigo-600 text-white ring-white/10"
                        : "bg-slate-800/60 text-slate-200 ring-white/10 hover:bg-slate-700/60"
                    )}
                    title={voted[r.id] ? "Voto aplicado (click para quitar)" : "Votar prioridad"}
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
                    {r.summary}
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
                      className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60"
                    >
                      Ver en mapa
                    </a>
                    <button className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60">
                      Comentar
                    </button>
                    <button className="text-xs rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60">
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
      </div>
    </UserLayout>
  );
}