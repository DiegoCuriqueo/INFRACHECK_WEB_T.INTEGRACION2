import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AutorityLayout from "../../layout/AutorityLayout.jsx";
import { getReportes, updateReporte, onReportsChanged } from "../../services/reportsService";
import { applyVotesPatch } from "../../services/votesService";
import Dropdown from "../../components/Dropdown.jsx";

// Helper para cargar proyectos locales
const PROJ_STORAGE_KEY = "authorityProjects";
function loadLocalProjects() {
  try {
    const raw = localStorage.getItem(PROJ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Obtener proyectos asociados a un reporte
function getProjectsForReport(reportId, allProjects) {
  if (!reportId || !Array.isArray(allProjects)) return [];
  const reportIdStr = String(reportId);
  return allProjects.filter(proj => {
    const reportIds = proj.reportes_ids || [];
    return reportIds.some(id => String(id) === reportIdStr);
  });
}

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

// tonos por nivel
const toneForLevel = (level) => {
  if (level === "alta") return "danger";
  if (level === "media") return "warn";
  return "success"; // baja
};

// impacto estimado según cantidad de votos
const impactLevel = (votes = 0) => {
  if (votes >= 200) return "alta";
  if (votes >= 75) return "media";
  return "baja";
};

// tono por estado
const statusTone = (s) => {
  if (s === "resuelto") return "success";
  if (s === "en_proceso") return "info";
  return "gray"; // pendiente
};
// Texto legible para el estado
const labelStatus = (s = "pendiente") => {
  if (s === "en_proceso") return "EN PROCESO";
  if (s === "resuelto") return "FINALIZADO";
  return "PENDIENTE";
};

// tono por categoría
const categoryTone = (c = "") => {
  const k = c.toLowerCase();
  if (k.includes("espacio")) return "info"; // azul cielo
  if (k.includes("ilum")) return "violet"; // fucsia
  if (k.includes("verde") || k.includes("parque") || k.includes("plaza")) return "success"; // verde
  if (k.includes("seguridad") || k.includes("sema")) return "danger"; // rojo
  if (k.includes("calzada") || k.includes("vial") || k.includes("pav")) return "gray"; // gris
  return "neutral";
};

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

// Chevron para algunos íconos internos
const ChevronDown = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Componente de sección con animación fluida (grid rows)
const Section = ({ label, open, onToggle, children }) => (
  <div className="space-y-1">
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/60 px-3 py-2 text-sm text-slate-200 ring-1 ring-slate-700 hover:bg-slate-800/60 transition-colors"
    >
      {label}
      <ChevronDown className={cls("h-4 w-4 text-slate-400 transition-transform transform-gpu", open ? "rotate-180" : "")} />
    </button>
    <div className={cls("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr]")}
    >
      <div className="overflow-hidden">
        <div className="rounded-2xl bg-slate-900/60 p-3 ring-1 ring-slate-700">
          {children}
        </div>
      </div>
    </div>
  </div>
);

// íconos para badges
const TagIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M20 13l-7 7-9-9V4h7l9 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
  </svg>
);
const AlertIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 3l10 18H2L12 3Z" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M12 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1.2" fill="currentColor" />
  </svg>
);
const FlameIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 3c2 3 5 4 5 8a5 5 0 1 1-10 0c0-3 3-5 5-8Z" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const DotIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

const VotesModal = ({ isOpen, onClose, votes = [], reportTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl ring-1 ring-white/10 max-w-md w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-white font-semibold text-lg">Votos</h3>
              <p className="text-slate-400 text-sm mt-1 line-clamp-1">{reportTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 overflow-y-auto max-h-[calc(80vh-100px)]">
          {votes.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Aún no hay votos para este reporte</p>
            </div>
          ) : (
            <div className="space-y-2">
              {votes.map((vote, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {vote.user?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium">{vote.user || 'Usuario anónimo'}</p>
                    <p className="text-slate-400 text-xs">
                      {vote.timestamp ? new Date(vote.timestamp).toLocaleString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Fecha no disponible'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-700 bg-slate-900/60">
          <p className="text-slate-400 text-sm">
            Total de votos: <span className="text-white font-semibold">{votes.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

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

// Botón tipo píldora simplificado para reducir "cajas" visuales
const PillOption = ({ active = false, tone = "neutral", onClick, children }) => {
  const tones = {
    neutral: active
      ? "bg-slate-700 text-white shadow-sm"
      : "text-slate-200 hover:bg-slate-700/40",
    danger: active
      ? "bg-red-600 text-white shadow-sm"
      : "text-red-300 hover:bg-red-600/20",
    warn: active
      ? "bg-amber-500 text-slate-900 shadow-sm"
      : "text-amber-200 hover:bg-amber-500/20",
    success: active
      ? "bg-emerald-600 text-white shadow-sm"
      : "text-emerald-200 hover:bg-emerald-600/20",
    info: active
      ? "bg-sky-600 text-white shadow-sm"
      : "text-sky-200 hover:bg-sky-600/20",
    gray: active
      ? "bg-slate-600 text-white shadow-sm"
      : "text-slate-300 hover:bg-slate-600/20",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1.5 transition-colors",
        tones[tone]
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
};

export default function ReportesAU() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]); // Proyectos locales
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("top"); // top|recent
  const [urg, setUrg] = useState("todas"); // baja|media|alta|todas
  const [estado, setEstado] = useState("todos"); // pendiente|en_proceso|resuelto|todos
  const [layout, setLayout] = useState("list"); // list|grid
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [openUrg, setOpenUrg] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [openOrden, setOpenOrden] = useState(false);
  const [openVista, setOpenVista] = useState(false);

  // flash de título por sección
  const [flashUrg, setFlashUrg] = useState(false);
  const [flashEstado, setFlashEstado] = useState(false);
  const [flashOrden, setFlashOrden] = useState(false);
  const [flashVista, setFlashVista] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [showVotesModal, setShowVotesModal] = useState(false);

  const closeAll = () => {
    setOpenUrg(false);
    setOpenEstado(false);
    setOpenOrden(false);
    setOpenVista(false);
  };

  const toggleSection = (section) => {
    const currentOpen = {
      urg: openUrg,
      estado: openEstado,
      orden: openOrden,
      vista: openVista,
    }[section];
    closeAll();
    if (!currentOpen) {
      if (section === "urg") setOpenUrg(true);
      if (section === "estado") setOpenEstado(true);
      if (section === "orden") setOpenOrden(true);
      if (section === "vista") setOpenVista(true);
    } else {
      // al cerrar, disparamos el flash con la opción actual
      if (section === "urg") {
        setFlashUrg(true);
        setTimeout(() => setFlashUrg(false), 1200);
      }
      if (section === "estado") {
        setFlashEstado(true);
        setTimeout(() => setFlashEstado(false), 1200);
      }
      if (section === "orden") {
        setFlashOrden(true);
        setTimeout(() => setFlashOrden(false), 1200);
      }
      if (section === "vista") {
        setFlashVista(true);
        setTimeout(() => setFlashVista(false), 1200);
      }
    }
  };

  // helpers para label y tono
  const toneForUrg = (u) => (u === "alta" ? "danger" : u === "media" ? "warn" : u === "baja" ? "success" : "neutral");
  const labelForUrg = (u) => (u === "todas" ? "Urgencia" : (u[0].toUpperCase() + u.slice(1)));
  const toneForEstado = (e) => (e === "pendiente" ? "gray" : e === "en_proceso" ? "info" : e === "resuelto" ? "success" : "neutral");
  const labelForEstado = (e) => (e === "todos" ? "Estado" : e === "en_proceso" ? "En proceso" : (e[0].toUpperCase() + e.slice(1)));
  const toneForOrden = (s) => "neutral";
  const labelForOrden = (s) => (s === "top" ? "Más votados" : "Más recientes");
  const toneForVista = (v) => "neutral";
  const labelForVista = (v) => (v === "list" ? "Lista" : "Grid");

  const loadAllReports = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Cargando reportes desde la API...');
      const apiReports = await getReportes();
      
      console.log('📦 Reportes recibidos:', apiReports);
      
      if (!Array.isArray(apiReports)) {
        throw new Error('Los datos recibidos no son un array');
      }
      
      const reportsWithVotes = applyVotesPatch(apiReports);
      
      console.log('✅ Reportes procesados:', reportsWithVotes.length);
      setReports(reportsWithVotes);
    } catch (error) {
      console.error("❌ Error al cargar reportes:", error);
      setError(error.message || "Error al cargar reportes");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar proyectos locales
  const loadProjects = () => {
    try {
      const localProjects = loadLocalProjects();
      setProjects(localProjects);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      setProjects([]);
    }
  };

  useEffect(() => {
    loadAllReports();
    loadProjects();
  }, []);

  // 🔄 Escuchar cambios globales (cuando se actualizan reportes desde otros lugares)
  useEffect(() => {
    const unsub = onReportsChanged(() => {
      loadAllReports();
    });
    return unsub;
  }, []);

  // Recargar proyectos cuando cambien
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === PROJ_STORAGE_KEY) {
        loadProjects();
      }
    };
    const handleProjectsChanged = () => {
      loadProjects();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('projects:changed', handleProjectsChanged);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('projects:changed', handleProjectsChanged);
    };
  }, []);

  // Aplicar filtros desde URL y centrar un reporte específico
  useEffect(() => {
    const urgParam = searchParams.get("urg");
    const idParam = searchParams.get("id");
    const qParam = searchParams.get("q");
    if (urgParam) setUrg(urgParam);
    if (qParam) setQ(qParam);
    if (idParam) {
      const el = document.getElementById(`report-${idParam}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-cyan-500");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-cyan-500");
        }, 1600);
      }
    }
  }, [searchParams, reports]);

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

  const handleStatusChange = async (id, newStatus) => {
    // 1) Persistimos en localStorage
    await updateReporte(id, { status: newStatus });

    // 2) Actualizamos el estado local para feedback inmediato
    setReports(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
    );
};

  const handleShowVotes = (report) => {
    setSelectedReport(report);
    setShowVotesModal(true);
  };

  return (
    <AutorityLayout title="Reportes de Infraestructura">
      <div className="space-y-5 font-sans">
        {/* toolbar */}
        <div className="space-y-3">
          {/* fila: búsqueda amplia */}
          <div className="space-y-3">
            <div className="relative w-full md:flex-1">
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

            {/* filtros debajo de la búsqueda */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Dropdown
                label="Urgencia"
                open={openUrg}
                onToggle={() => toggleSection("urg")}
                onClose={() => setOpenUrg(false)}
                flash={{ active: flashUrg, text: labelForUrg(urg), tone: toneForUrg(urg) }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Urgencia:</span>
                  <div className="inline-flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl ring-1 ring-slate-700">
                    <PillOption active={urg === "todas"} tone="neutral" onClick={() => { setUrg("todas"); setOpenUrg(false); setFlashUrg(true); setTimeout(() => setFlashUrg(false), 1200); }}>Todas</PillOption>
                    <PillOption active={urg === "alta"} tone="danger" onClick={() => { setUrg("alta"); setOpenUrg(false); setFlashUrg(true); setTimeout(() => setFlashUrg(false), 1200); }}>Alta</PillOption>
                    <PillOption active={urg === "media"} tone="warn" onClick={() => { setUrg("media"); setOpenUrg(false); setFlashUrg(true); setTimeout(() => setFlashUrg(false), 1200); }}>Medio</PillOption>
                    <PillOption active={urg === "baja"} tone="success" onClick={() => { setUrg("baja"); setOpenUrg(false); setFlashUrg(true); setTimeout(() => setFlashUrg(false), 1200); }}>Baja</PillOption>
                  </div>
                </div>
              </Dropdown>

              <Dropdown
                label="Estado"
                open={openEstado}
                onToggle={() => toggleSection("estado")}
                onClose={() => setOpenEstado(false)}
                flash={{ active: flashEstado, text: labelForEstado(estado), tone: toneForEstado(estado) }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Estado:</span>
                  <div className="inline-flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl ring-1 ring-slate-700">
                    <PillOption active={estado === "todos"} tone="neutral" onClick={() => { setEstado("todos"); setOpenEstado(false); setFlashEstado(true); setTimeout(() => setFlashEstado(false), 1200); }}>Todos</PillOption>
                    <PillOption active={estado === "pendiente"} tone="gray" onClick={() => { setEstado("pendiente"); setOpenEstado(false); setFlashEstado(true); setTimeout(() => setFlashEstado(false), 1200); }}>Pendiente</PillOption>
                    <PillOption active={estado === "en_proceso"} tone="info" onClick={() => { setEstado("en_proceso"); setOpenEstado(false); setFlashEstado(true); setTimeout(() => setFlashEstado(false), 1200); }}>Proceso</PillOption>
                    <PillOption active={estado === "resuelto"} tone="success" onClick={() => { setEstado("resuelto"); setOpenEstado(false); setFlashEstado(true); setTimeout(() => setFlashEstado(false), 1200); }}>Finalizado</PillOption>
                  </div>
                </div>
              </Dropdown>

              <Dropdown
                label="Orden"
                open={openOrden}
                onToggle={() => toggleSection("orden")}
                onClose={() => setOpenOrden(false)}
                flash={{ active: flashOrden, text: labelForOrden(sort), tone: toneForOrden(sort) }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Orden:</span>
                  <div className="inline-flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl ring-1 ring-slate-700">
                    <PillOption active={sort === "top"} tone="neutral" onClick={() => { setSort("top"); setOpenOrden(false); setFlashOrden(true); setTimeout(() => setFlashOrden(false), 1200); }}>Mas votados</PillOption>
                    <PillOption active={sort === "recent"} tone="neutral" onClick={() => { setSort("recent"); setOpenOrden(false); setFlashOrden(true); setTimeout(() => setFlashOrden(false), 1200); }}>Más recientes</PillOption>
                  </div>
                </div>
              </Dropdown>

              <Dropdown
                label="Vista"
                open={openVista}
                onToggle={() => toggleSection("vista")}
                onClose={() => setOpenVista(false)}
                flash={{ active: flashVista, text: labelForVista(layout), tone: toneForVista(layout) }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Vista:</span>
                  <div className="inline-flex items-center gap-1.5 bg-slate-800/30 p-1 rounded-xl">
                    <PillOption active={layout === "list"} tone="neutral" onClick={() => { setLayout("list"); setOpenVista(false); setFlashVista(true); setTimeout(() => setFlashVista(false), 1200); }}>
                      <ListIcon className="h-4 w-4" /> Lista
                    </PillOption>
                    <PillOption active={layout === "grid"} tone="neutral" onClick={() => { setLayout("grid"); setOpenVista(false); setFlashVista(true); setTimeout(() => setFlashVista(false), 1200); }}>
                      <GridIcon className="h-4 w-4" /> Grid
                    </PillOption>
                  </div>
                </div>
              </Dropdown>
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

{/* lista */}
{loading ? (
  <div className="space-y-6">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-4 sm:p-5 h-64 animate-pulse"
      />
    ))}
  </div>
) : filtered.length === 0 ? (
  <div className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-5 text-slate-300">
    No hay reportes.
  </div>
) : (
  <div
    className={
      layout === "grid"
        ? "grid grid-cols-1 md:grid-cols-2 gap-4"
        : "space-y-4"
    }
  >
    {filtered.map((r) => (
      <div key={r.id} id={`report-${r.id}`}>
      <Card className="p-4 sm:p-5">
        {/* header */}
<div className="space-y-3">

  {/* Título y badges */}
  <div className="flex items-start justify-between gap-3">
    <div className="flex-1">
      <h3 className="text-white font-semibold hover:text-white">
        {r.title || `Reporte #${r.id}`}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {/* Categoría */}
        <Badge tone={categoryTone(r.category)} className="shadow-sm">
          <span className="inline-flex items-center gap-1">
            <TagIcon className="h-3.5 w-3.5" /> {r.category}
          </span>
        </Badge>

        {/* Urgencia */}
        <Badge tone={toneForLevel(r.urgency)} className="shadow-sm">
          <span className="inline-flex items-center gap-1">
            <AlertIcon className="h-3.5 w-3.5" /> {`URGENCIA ${r.urgency?.toUpperCase() || ""}`}
          </span>
        </Badge>

        {/* Impacto */}
        <Badge tone={toneForLevel(impactLevel(r.votes))} className="shadow-sm">
          <span className="inline-flex items-center gap-1">
            <FlameIcon className="h-3.5 w-3.5" /> {`IMPACTO ${impactLevel(r.votes).toUpperCase()}`}
          </span>
        </Badge>

        {/* Estado */}
        <Badge
          tone={statusTone(r.status || "pendiente")}
          className="shadow-sm transition-colors duration-200"
        >
          <span className="inline-flex items-center gap-1">
            <DotIcon className="h-3.5 w-3.5" />
            {labelStatus(r.status || "pendiente")}
          </span>
        </Badge>
      </div>
    </div>

        {/* right meta: votos + imagen */}
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => handleShowVotes(r)}
            className="inline-flex"
          >
            <Badge tone="violet" className="cursor-pointer hover:ring-2 hover:ring-fuchsia-400 transition-all">
              ▲ {fmtVotes(r.votes)}
            </Badge>
          </button>

            {r.image ? (
              <div className="relative group">
                <Badge tone="info" className="bg-slate-700/60 text-slate-200 cursor-pointer">IMAGEN</Badge>
                {/* Preview de imagen al hover */}
                <div className="absolute right-full mr-2 top-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <div className="rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/20 bg-slate-900">
                    <img 
                      src={r.image} 
                      alt="Preview"
                      className="max-w-md max-h-80 object-contain"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Badge tone="gray">SIN IMAGEN</Badge>
            )}
          </div>
          </div>
        </div>

        {/* Usuario y fecha arriba del summary */}
        <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
          <span className="inline-flex items-center gap-1">👤 {r.user || "Usuario"}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {new Date(r.createdAt).toISOString().slice(0, 10)}
          </span>
        </div>

        {/* summary */}
        <div className="mt-2 text-slate-300 text-sm max-w-[70ch]">
          {r.summary || r.description}
        </div>

        {/* address */}
        <div className="mt-3 text-sm text-slate-200 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-red-500" /> {r.address}
        </div>

        {/* Proyectos asociados */}
        {(() => {
          const associatedProjects = getProjectsForReport(r.id, projects);
          if (associatedProjects.length === 0) return null;
          return (
            <div className="mt-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  📋 Proyectos asociados ({associatedProjects.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {associatedProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => navigate(`/autority/proyectos?q=${encodeURIComponent(proj.nombre || '')}`)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors"
                    title={`Ver proyecto: ${proj.nombre}`}
                  >
                    {proj.nombre || `Proyecto #${proj.id}`}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Controles de estado */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Cambiar estado:</span>
          <div className="inline-flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl ring-1 ring-slate-700">
            <PillOption
              active={(r.status || "pendiente") === "pendiente"}
              tone="gray"
              onClick={() => handleStatusChange(r.id, "pendiente")}
            >
              Pendiente
            </PillOption>

            <PillOption
              active={(r.status || "pendiente") === "en_proceso"}
              tone="info"
              onClick={() => handleStatusChange(r.id, "en_proceso")}
            >
              En proceso
            </PillOption>

            <PillOption
              active={(r.status || "pendiente") === "resuelto"}
              tone="success"
              onClick={() => handleStatusChange(r.id, "resuelto")}
            >
              Finalizado
            </PillOption>
          </div>
        </div>
      </Card>
      </div>
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
       <VotesModal
        isOpen={showVotesModal}
        onClose={() => setShowVotesModal(false)}
        votes={selectedReport?.votedBy || []}
        reportTitle={selectedReport?.title || ''}
      />
    </AutorityLayout>
  );
}
