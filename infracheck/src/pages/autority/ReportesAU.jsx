import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AutorityLayout from "../../layout/AutorityLayout.jsx";
import { getReportes, updateReporte, onReportsChanged, onReportVotesUpdated, getReporteById, getReportComments, addReportComment, getReportVotes, voteReport } from "../../services/reportsService";
import { getUserData, isAuthenticated } from "../../services/authService";
import { getProjects } from "../../services/projectsService";
import Dropdown from "../../components/Dropdown.jsx";

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
const DEBUG_LOGS = false;
const log = (...a) => { if (DEBUG_LOGS) console.log(...a); };

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

const medalToneForIndex = (i) => (i === 0 ? "warn" : i === 1 ? "gray" : "violet");
const medalBgForIndex = (i) => (
  i === 0
    ? "from-amber-400 to-orange-600 text-slate-900"
    : i === 1
    ? "from-slate-300 to-slate-500 text-slate-900"
    : "from-fuchsia-500 to-purple-700 text-white"
);

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

const TrophyIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M7 4h10v3a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V4Z" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M7 7H5a3 3 0 0 0 3 3M17 7h2a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M12 11v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M9 19h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const FolderIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.6"/>
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
const Card = ({ className = "", children, onClick }) => (
  <div
    className={cls(
      "rounded-2xl bg-slate-900/60 ring-1 ring-white/10",
      onClick ? "cursor-pointer hover:ring-indigo-400/40 hover:shadow-lg transition" : "",
      className
    )}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    aria-label={onClick ? "Abrir detalle de reporte" : undefined}
  >
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


const ModalDetalleReporte = ({ report, onClose, onVoted }) => {
  const [myComment, setMyComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState(null);
  const [myVote, setMyVote] = useState(0); // 0 = sin voto, 1 = positivo, -1 = negativo
  const [votesData, setVotesData] = useState({ total: 0, positivos: 0, negativos: 0 });
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState(null);
  const [fullData, setFullData] = useState(null);
  const [stickyTitle, setStickyTitle] = useState(() => (report?.title || report?.summary || 'Reporte'));
  const [stickyImage, setStickyImage] = useState(() => {
    const first = (report?.images || [])[0];
    return (first && first.url) || report?.image || report?.imageDataUrl || null;
  });
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const full = await getReporteById(report?.id);
      const comm = await getReportComments(report?.id);
      const vs = await getReportVotes(report?.id);
      if (!mounted) return;
      setFullData(full);
      setComments(comm);
      // Actualizar datos de votos
      setVotesData({
        total: vs.total || 0,
        positivos: vs.positivos || 0,
        negativos: vs.negativos || 0
      });
      setMyVote(vs.my || 0); // 0, 1 o -1
      if (full?.title || full?.summary) setStickyTitle(full.title || full.summary);
      const firstF = (full?.images || [])[0];
      const urlF = (firstF && firstF.url) || full?.image || full?.imageDataUrl || null;
      if (urlF) setStickyImage(urlF);
    })();
    return () => { mounted = false; };
  }, [report?.id]);

  const addComment = async () => {
    const text = myComment.trim();
    if (!text) return;
    try {
      const created = await addReportComment(report.id, text);
      const refreshed = await getReportComments(report.id);
      if (Array.isArray(refreshed) && refreshed.length > 0) {
        const exists = refreshed.some(c => c.id === created?.id);
        if (!exists && created?.visible === true) {
          setComments([created, ...refreshed]);
        } else {
          setComments(refreshed);
        }
      } else if (created?.visible === true) {
        setComments([created]);
      } else {
        setComments([]);
      }
      setMyComment('');
      setCommentError(null);
    } catch (err) {
      setCommentError(err?.message || 'No se pudo enviar el comentario');
    }
  };

  const handleVote = async (valor, e) => {
    try {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      
      // Prevenir múltiples clicks
      if (voteLoading) {
      log('⏳ Voto ya en proceso, ignorando click');
        return;
      }
      
      // Validar que tenemos un reportId válido
      if (!report?.id) {
        console.error('❌ No hay reportId válido');
        setVoteError('No se puede votar: reporte no válido');
        return;
      }
      
      setVoteLoading(true);
      setVoteError(null);
      
      log('🗳️ Votando:', { reportId: report?.id, valor, myVoteActual: myVote });
      
      // Enviar el valor seleccionado (1 o -1)
      // La API maneja el toggle: si ya tienes ese voto, lo quita; si no, lo agrega/cambia
      const res = await voteReport(report?.id, valor);
      
      log('✅ Respuesta del voto:', res);
      
      // Recargar los votos desde la API para asegurar que tenemos los datos más actualizados
      const refreshedVotes = await getReportVotes(report?.id);
      log('🔄 Votos recargados:', refreshedVotes);
      
      // Actualizar estado local con los datos recargados
      setMyVote(refreshedVotes.my || res.my || 0);
      setVotesData({
        total: refreshedVotes.total || res.total || 0,
        positivos: refreshedVotes.positivos || res.positivos || 0,
        negativos: refreshedVotes.negativos || res.negativos || 0
      });
      
      // Notificar al componente padre
      onVoted?.(report.id, refreshedVotes.total || res.total);
    } catch (err) {
      console.error('❌ Error al votar:', err);
      const errorMessage = err?.message || 'No se pudo actualizar el voto';
      setVoteError(errorMessage);
      
      // Intentar recargar los votos actuales para mantener la UI sincronizada
      try {
        const currentVotes = await getReportVotes(report?.id);
        setMyVote(currentVotes.my || 0);
        setVotesData({
          total: currentVotes.total || 0,
          positivos: currentVotes.positivos || 0,
          negativos: currentVotes.negativos || 0
        });
      } catch (reloadError) {
        console.error('❌ Error al recargar votos después del error:', reloadError);
      }
    } finally {
      setVoteLoading(false);
    }
  };

  const r = fullData || report || {};
  const imgs = r.images || [];
  const principalImg = imgs[activeIdx] || imgs[0];
  const mainUrl = (principalImg && principalImg.url) || r.image || r.imageDataUrl || stickyImage || null;
  const estad = r.estadisticas || {};
  const ubicStr = (r.lat && r.lng) ? `${r.lat}, ${r.lng}` : '';
  const titleText = r.title || r.summary || stickyTitle || 'Reporte';

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/60">
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <div className="w-[88vw] max-w-3xl rounded-2xl bg-[#0F1525] ring-1 ring-white/10 p-4 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-100 truncate">{titleText}</h2>
            <p className="mt-1 text-slate-300 text-sm leading-snug max-w-[75ch]">{r.description || r.summary}</p>
            <div className="mt-2 text-xs text-slate-400">Creado: {new Date(r.createdAt).toLocaleString()} · Por: {r.user || 'Usuario'}</div>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10">Cerrar</button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="rounded-2xl bg-slate-900/50 ring-1 ring-white/10 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Imágenes</div>
              <div className="mt-2 rounded-xl overflow-hidden ring-1 ring-white/10 bg-black">
                {mainUrl ? (
                  <img src={mainUrl} alt={principalImg?.nombre || 'Imagen principal'} className="w-full h-48 md:h-56 object-cover" />
                ) : (
                  <div className="text-slate-400 text-sm p-6">Sin imágenes</div>
                )}
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {imgs.map((img, idx) => (
                  <button key={img.id || img.url || idx} onClick={() => setActiveIdx(idx)} className={`flex-shrink-0 rounded-lg overflow-hidden ring-1 ${activeIdx === idx ? 'ring-fuchsia-400' : 'ring-white/10'} bg-slate-900`}>
                    <img src={img.url} alt={img.nombre || 'Miniatura'} className="w-20 h-14 object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-semibold text-slate-200">Comentarios ({comments.length})</div>
              <div className="mt-2 flex items-center gap-2">
                <input value={myComment} onChange={(e)=>setMyComment(e.target.value)} placeholder="Añadir comentario (mín. 10 caracteres)" className="flex-1 rounded-xl bg-[#0F1525] text-slate-200 border border-white/20 px-3 py-2 outline-none"/>
                <button onClick={addComment} disabled={(myComment.trim().length < 10)} className={`px-3 py-2 rounded-xl text-sm ${myComment.trim().length < 10 ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>Enviar</button>
              </div>
              {commentError && (
                <div className="mt-2 text-xs text-rose-300">{commentError}</div>
              )}
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                {comments.map((c, idx) => (
                  <div key={c.id ?? `${c.user}-${c.date}-${idx}`} className="rounded-xl bg-[#0F1525] border border-white/10 px-3 py-2">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{c.user} · {new Date(c.date).toLocaleString()}</span>
                      {c.pending && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">Pendiente</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-200 mt-1">{typeof c.text === 'string' ? c.text : ''}</div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-xs text-slate-400">Sin comentarios</div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-1 space-y-2">
            <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Estado y categoría</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(r.status || 'pendiente')}>{labelStatus(r.status || 'pendiente')}</Badge>
                <Badge tone="warn">{(r.urgencyLabel || r.urgency || '').toString()}</Badge>
                <Badge tone={categoryTone(r.category)}>{r.category}</Badge>
              </div>
            </div>
            <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Detalles</div>
              <div className="mt-2 space-y-2">
                <div className="rounded-xl bg-[#0F1525] ring-1 ring-white/10 px-3 py-2">
                  <div className="text-[11px] text-slate-400">Dirección</div>
                  <div className="text-sm text-slate-100">{r.address}</div>
                </div>
                <div className="rounded-xl bg-[#0F1525] ring-1 ring-white/10 px-3 py-2">
                  <div className="text-[11px] text-slate-400">Ciudad</div>
                  <div className="text-sm text-slate-100">{r.city}</div>
                </div>
                <div className="rounded-xl bg-[#0F1525] ring-1 ring-white/10 px-3 py-2">
                  <div className="text-[11px] text-slate-400">Ubicación</div>
                  <div className="text-sm text-slate-100">{ubicStr || '—'}</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Estadísticas</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#0F1525] ring-1 ring-white/10 px-3 py-2">
                  <div className="text-[11px] text-slate-400">Archivos</div>
                  <div className="text-sm text-slate-100">{estad.total_archivos ?? imgs.length}</div>
                </div>
                <div className="rounded-xl bg-[#0F1525] ring-1 ring-white/10 px-3 py-2">
                  <div className="text-[11px] text-slate-400">Días</div>
                  <div className="text-sm text-slate-100">{estad.dias_desde_creacion ?? '—'}</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Votos</div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm px-2.5 py-1 rounded-full border border-emerald-400/30 bg-[#0F1525] text-emerald-200">
                    ▲ {fmtVotes(votesData.positivos)}
                  </span>
                  <span className="text-sm px-2.5 py-1 rounded-full border border-red-400/30 bg-[#0F1525] text-red-200">
                    ▼ {fmtVotes(votesData.negativos)}
                  </span>
                  <span className="text-xs text-slate-400">
                    Total: {fmtVotes(votesData.total)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    disabled={voteLoading} 
                    onClick={(e) => handleVote(1, e)} 
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      myVote === 1 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-emerald-600/20 text-emerald-200 hover:bg-emerald-600/30'
                    } ${voteLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    ▲ Votar positivo
                  </button>
                  <button 
                    type="button" 
                    disabled={voteLoading} 
                    onClick={(e) => handleVote(-1, e)} 
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      myVote === -1 
                        ? 'bg-red-600 text-white' 
                        : 'bg-red-600/20 text-red-200 hover:bg-red-600/30'
                    } ${voteLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    ▼ Votar negativo
                  </button>
                </div>
                {voteError && (
                  <div className="text-[11px] text-rose-300 mt-1">{voteError}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
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
  const [projects, setProjects] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("top"); // top|recent
  const [featuredSort, setFeaturedSort] = useState("top"); // top|recent (solo destacados)
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState(null);
  const currentUser = getUserData();

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
      log('🔄 Cargando reportes desde la API...');
      const apiReports = await getReportes();
      log('📦 Reportes recibidos:', apiReports);
      if (!Array.isArray(apiReports)) {
        throw new Error('Los datos recibidos no son un array');
      }
      log('✅ Reportes procesados:', apiReports.length);
      // Render rápido sin esperar votos
      setReports(apiReports.map(r => ({ ...r, votes: r.votes || 0 })));
      // Prefetch de votos en lotes para no bloquear la UI
      const batchSize = 6;
      let idx = 0;
      while (idx < apiReports.length) {
        const chunk = apiReports.slice(idx, idx + batchSize);
        await Promise.all(
          chunk.map(async (r) => {
            try {
              const vs = await getReportVotes(r.id);
              setReports(prev => prev.map(x => x.id === r.id ? { ...x, votes: vs.total || 0 } : x));
            } catch {
              // ignorar fallo de votos para no romper render
            }
          })
        );
        idx += batchSize;
      }
    } catch (error) {
      console.error("❌ Error al cargar reportes:", error);
      setError(error.message || "Error al cargar reportes");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const apiProjects = await getProjects();
      setProjects(Array.isArray(apiProjects) ? apiProjects : []);
    } catch (error) {
      console.error("Error cargando proyectos desde API:", error);
      setProjects([]);
    }
  };

  useEffect(() => {
    loadAllReports();
    loadProjects();
  }, []);

  useEffect(() => {
    const handleProjectsChanged = () => {
      loadProjects();
    };
    window.addEventListener('projects:changed', handleProjectsChanged);
    return () => {
      window.removeEventListener('projects:changed', handleProjectsChanged);
    };
  }, []);

  // 🔄 Escuchar cambios globales (cuando se actualizan reportes desde otros lugares)
  useEffect(() => {
    const unsub = onReportVotesUpdated((e) => {
      const d = e?.detail || {};
      if (!d?.id) return;
      setReports(prev => prev.map(r => r.id === d.id ? { ...r, votes: d.total || r.votes } : r));
      setSelectedReport(prev => prev && prev.id === d.id ? { ...prev, votes: d.total || prev.votes } : prev);
    });
    return unsub;
  }, []);

  // Proyectos desde API (sin almacenamiento local)
  useEffect(() => {
    loadProjects();
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


  const destacados = useMemo(() => {
    if (!Array.isArray(reports) || reports.length === 0) return [];
    const base = [...reports];
    if (featuredSort === "top") base.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    else base.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return base.slice(0, 3);
  }, [reports, featuredSort]);

  const metrics = useMemo(() => {
    const total = reports.length;
    const urgentes = reports.filter(r => r.urgency === "alta").length;
    const enProceso = reports.filter(r => (r.status || "pendiente") === "en_proceso").length;
    const pendientes = reports.filter(r => (r.status || "pendiente") === "pendiente").length;
    const resueltos = reports.filter(r => (r.status || "pendiente") === "resuelto").length;
    return { total, urgentes, enProceso, pendientes, resueltos };
  }, [reports]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setStatusChangeError(null);

      if (!isAuthenticated()) {
        setStatusChangeError("Debes iniciar sesión para actualizar el estado");
        return;
      }

      // 🔍 Traemos el reporte completo para ver qué userId tiene
      const currentReport = await getReporteById(id);
      const currentUser = getUserData?.() || null;

      console.log("🧾 Reporte antes de actualizar:", currentReport);
      console.log("👤 Usuario logueado:", currentUser);

      // Payload mínimo + userId por si tu API lo valida
      const payload = {
        status: newStatus,
        // si tu backend usa esto, le llega el dueño correcto
        userId: currentReport?.userId ?? currentUser?.user_id ?? currentUser?.id,
      };

      console.log("📤 Enviando a updateReporte:", { id, payload });

      const res = await updateReporte(id, payload);

      console.log("📥 Respuesta de updateReporte:", res);

      // Si algo en la respuesta indica error, lo levantamos
      if (res?.error || res?.detail) {
        throw new Error(res.error || res.detail || "Error en updateReporte");
      }

      // status devuelto o el que pedimos
      const updatedStatus = res?.status || newStatus;

      // ✅ Actualizar lista
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: updatedStatus } : r
        )
      );

      // ✅ Actualizar modal de detalle si está abierto
      setSelectedReport((prev) =>
        prev && prev.id === id ? { ...prev, status: updatedStatus } : prev
      );

      // 🔄 Aviso global por si otros escuchan
      window.dispatchEvent(
        new CustomEvent("reports:changed", {
          detail: { id, status: updatedStatus },
        })
      );
    } catch (err) {
      console.error("❌ Error al actualizar estado:", err);
      setStatusChangeError(err?.message || "No se pudo actualizar el estado");
    }
  };



  const handleShowVotes = (report) => {
    setSelectedReport(report);
    setShowVotesModal(true);
  };

  const openDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
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

        {destacados.length > 0 && (
          <div className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-200 font-semibold">Reportes destacados</h3>
              <div className="inline-flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl ring-1 ring-slate-700">
                <PillOption active={featuredSort === "top"} tone="neutral" onClick={() => setFeaturedSort("top")}>Más votados</PillOption>
                <PillOption active={featuredSort === "recent"} tone="neutral" onClick={() => setFeaturedSort("recent")}>Más recientes</PillOption>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {destacados.map((d, idx) => (
                <Card key={d.id} className="p-3 relative" onClick={() => openDetail(d)}>
                  <div className={`absolute -top-2 -left-2 px-2 py-1 rounded-full ring-1 ring-white/20 shadow-md bg-gradient-to-br ${medalBgForIndex(idx)} inline-flex items-center gap-1`}>
                    <TrophyIcon className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">{idx + 1}°</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm text-slate-100 truncate">{d.title || `Reporte #${d.id}`}</div>
                      <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {new Date(d.createdAt).toISOString().slice(0, 10)}
                        </span>
                        <Badge tone={categoryTone(d.category)}>{d.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="violet" className="flex-shrink-0">▲ {fmtVotes(d.votes || 0)}</Badge>
                      {(() => {
                        const aps = getProjectsForReport(d.id, projects);
                        if (aps.length === 0) return null;
                        const firstName = aps[0]?.nombre || `Proyecto #${aps[0]?.id}`;
                        const more = aps.length - 1;
                        const tooltip = aps.map(p => p?.nombre || `Proyecto #${p?.id}`).join(', ');
                        return (
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl bg-[#0B1220] text-slate-200 ring-1 ring-white/10"
                            title={`Proyectos: ${tooltip}`}
                          >
                            <FolderIcon className="h-3.5 w-3.5 text-indigo-400" />
                            <span className="max-w-[120px] truncate">{firstName}</span>
                            {more > 0 && <span className="text-slate-400">+{more}</span>}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-300 line-clamp-2">{d.summary || d.description}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone(d.status || "pendiente")}>{labelStatus(d.status || "pendiente")}</Badge>
                    <Badge tone={toneForLevel(d.urgency)}>{`URGENCIA ${d.urgency?.toUpperCase?.() || ''}`}</Badge>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                    <span className="truncate">{d.address}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 flex items-center" aria-hidden="true">
          <div className="flex-1 h-px bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
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
      <Card className="p-4 sm:p-5" onClick={() => openDetail(r)}>
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

        {/* right meta: votos */}
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => handleShowVotes(r)}
            className="inline-flex"
          >
            <Badge tone="violet" className="cursor-pointer hover:ring-2 hover:ring-fuchsia-400 transition-all">
              ▲ {fmtVotes(r.votes)}
            </Badge>
          </button>
          {(() => {
            const aps = getProjectsForReport(r.id, projects);
            if (aps.length === 0) return null;
            const firstName = aps[0]?.nombre || `Proyecto #${aps[0]?.id}`;
            const more = aps.length - 1;
            const tooltip = aps.map(p => p?.nombre || `Proyecto #${p?.id}`).join(', ');
            return (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/autority/proyectos?q=${encodeURIComponent(firstName || '')}`); }}
                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl bg-[#0B1220] text-slate-200 ring-1 ring-white/10 hover:bg-[#0D1626]"
                title={`Proyectos: ${tooltip}`}
              >
                <FolderIcon className="h-3.5 w-3.5 text-indigo-400" />
                <span className="max-w-[140px] truncate">Proyecto: {firstName}</span>
                {more > 0 && <span className="text-slate-400">+{more}</span>}
              </button>
            );
          })()}
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
        {(() => { return null; })()}

        {/* Controles de estado */}
        <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] text-slate-400">Cambiar estado:</span>
          <div className="inline-flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl ring-1 ring-slate-700">
           <PillOption
            active={(r.status || "pendiente") === "pendiente"}
            tone="gray"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(r.id, "pendiente");
            }}
          >
            Pendiente
          </PillOption>

          <PillOption
            active={(r.status || "pendiente") === "en_proceso"}
            tone="info"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(r.id, "en_proceso");
            }}
          >
            En proceso
          </PillOption>

          <PillOption
            active={(r.status || "pendiente") === "resuelto"}
            tone="success"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(r.id, "resuelto");
            }}
          >
            Finalizado
          </PillOption>

          </div>
        </div>
        {statusChangeError && (
          <div className="mt-2 text-[11px] text-rose-300" onClick={(e) => e.stopPropagation()}>{statusChangeError}</div>
        )}
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
      {showDetailModal && selectedReport && (
        <ModalDetalleReporte
          report={selectedReport}
          onClose={() => setShowDetailModal(false)}
          onVoted={(id, newVotes) => {
            setReports(prev => prev.map(x => x.id === id ? { ...x, votes: newVotes } : x));
            setSelectedReport(prev => ({ ...prev, votes: newVotes }));
          }}
        />
      )}
    </AutorityLayout>
  );
}
