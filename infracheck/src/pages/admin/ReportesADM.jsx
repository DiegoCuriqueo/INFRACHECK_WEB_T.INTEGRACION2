import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layout/AdminLayout.jsx";
import { getReportes, deleteReporte, onReportsChanged, updateReporte, getReporteById, getReportComments, addReportComment, getReportVotes, voteReport } from "../../services/reportsService";
import { toggleVote, hasVoted, applyVotesPatch } from "../../services/votesService";
import Dropdown from "../../components/Dropdown.jsx";
import { User as UserIcon } from "lucide-react";

// helpers
const cls = (...c) => c.filter(Boolean).join(" ");

const pct = (votes = 0, max = 1000) =>
  Math.max(0, Math.min(100, Math.round((votes / max) * 100)));

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

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%' height='100%' fill='rgb(30,41,59)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='rgb(148,163,184)' font-family='sans-serif' font-size='16'>Sin imagen</text></svg>`
  );

  // Texto legible para el estado
  const labelStatus = (s = "pendiente") => {
    if (s === "en_proceso") return "EN PROCESO";
    if (s === "resuelto") return "FINALIZADO";
    return "PENDIENTE";
  };

// tonos por nivel
const toneForLevel = (level) => {
  if (level === "alta") return "danger";
  if (level === "media") return "warn";
  return "success";
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
  return "gray";
};

// tono por categoría
const categoryTone = (c = "") => {
  const k = c.toLowerCase();
  if (k.includes("espacio")) return "info";
  if (k.includes("ilum")) return "violet";
  if (k.includes("verde") || k.includes("parque") || k.includes("plaza")) return "success";
  if (k.includes("seguridad") || k.includes("sema")) return "danger";
  if (k.includes("calzada") || k.includes("vial") || k.includes("pav")) return "gray";
  return "neutral";
};

// íconos
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
const Up = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
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
const ChevronDown = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
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
const TrashIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const StarIcon = ({ className = "", filled = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
);

// 🆕 MODAL DE DETALLE DEL REPORTE
const ModalDetalleReporte = ({ report, onClose, onVoted }) => {
  const [myComment, setMyComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState(null);
  const [myVote, setMyVote] = useState(0); // 0 = sin voto, 1 = positivo, -1 = negativo
  const [votesData, setVotesData] = useState({ total: 0, positivos: 0, negativos: 0 });
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState(null);
  const [fullData, setFullData] = useState(null);
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
      setVotesData({
        total: vs.total || 0,
        positivos: vs.positivos || 0,
        negativos: vs.negativos || 0
      });
      setMyVote(vs.my || 0);
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
      
      if (voteLoading) return;
      if (!report?.id) {
        console.error('❌ No hay reportId válido');
        setVoteError('No se puede votar: reporte no válido');
        return;
      }
      
      setVoteLoading(true);
      setVoteError(null);
      
      console.log('🗳️ Votando:', { reportId: report?.id, valor, myVoteActual: myVote });
      
      const res = await voteReport(report?.id, valor);
      console.log('✅ Respuesta del voto:', res);
      
      const refreshedVotes = await getReportVotes(report?.id);
      console.log('🔄 Votos recargados:', refreshedVotes);
      
      setMyVote(refreshedVotes.my || res.my || 0);
      setVotesData({
        total: refreshedVotes.total || res.total || 0,
        positivos: refreshedVotes.positivos || res.positivos || 0,
        negativos: refreshedVotes.negativos || res.negativos || 0
      });
      
      onVoted?.(report.id, refreshedVotes.total || res.total);
    } catch (err) {
      console.error('❌ Error al votar:', err);
      const errorMessage = err?.message || 'No se pudo actualizar el voto';
      setVoteError(errorMessage);
      
      try {
        const currentVotes = await getReportVotes(report?.id);
        setMyVote(currentVotes.my || 0);
        setVotesData({
          total: currentVotes.total || 0,
          positivos: currentVotes.positivos || 0,
          negativos: currentVotes.negativos || 0
        });
      } catch (reloadError) {
        console.error('❌ Error al recargar votos:', reloadError);
      }
    } finally {
      setVoteLoading(false);
    }
  };

  const r = fullData || report || {};
  const imgs = r.images || [];
  const principalImg = imgs[activeIdx] || imgs[0];
  const mainUrl = (principalImg && principalImg.url) || r.image || r.imageDataUrl || null;
  const estad = r.estadisticas || {};
  const ubicStr = (r.lat && r.lng) ? `${r.lat}, ${r.lng}` : '';
  const titleText = r.title || r.summary || 'Reporte';

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/60" onClick={onClose}>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <div className="w-[88vw] max-w-3xl rounded-2xl bg-white dark:bg-[#0F1525] ring-1 ring-slate-300 dark:ring-white/10 p-4 max-h-[85vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{titleText}</h2>
            <p className="mt-1 text-slate-700 dark:text-slate-300 text-sm leading-snug max-w-[75ch]">{r.description || r.summary}</p>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">Creado: {new Date(r.createdAt).toLocaleString()} · Por: {r.user || 'Usuario'}</div>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 ring-1 ring-slate-300 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">Cerrar</button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="rounded-2xl bg-white dark:bg-slate-900/50 ring-1 ring-slate-300 dark:ring-white/10 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-400">Imágenes</div>
              <div className="mt-2 rounded-xl overflow-hidden ring-1 ring-slate-300 dark:ring-white/10 bg-slate-50 dark:bg-black">
                {mainUrl ? (
                  <img src={mainUrl} alt={principalImg?.nombre || 'Imagen principal'} className="w-full h-48 md:h-56 object-cover" />
                ) : (
                  <div className="text-slate-600 dark:text-slate-400 text-sm p-6">Sin imágenes</div>
                )}
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {imgs.map((img, idx) => (
                  <button key={img.id || img.url || idx} onClick={() => setActiveIdx(idx)} className={`flex-shrink-0 rounded-lg overflow-hidden ring-1 ${activeIdx === idx ? 'ring-violet-400' : 'ring-slate-300 dark:ring-white/10'} bg-white dark:bg-slate-900`}>
                    <img src={img.url} alt={img.nombre || 'Miniatura'} className="w-20 h-14 object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 p-3">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">Comentarios ({comments.length})</div>
              <div className="mt-2 flex items-center gap-2">
                <input value={myComment} onChange={(e)=>setMyComment(e.target.value)} placeholder="Añadir comentario (mín. 10 caracteres)" className="flex-1 rounded-xl bg-white dark:bg-[#0F1525] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-white/20 px-3 py-2 outline-none"/>
                <button onClick={addComment} disabled={(myComment.trim().length < 10)} className={`px-3 py-2 rounded-xl text-sm ${myComment.trim().length < 10 ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>Enviar</button>
              </div>
              {commentError && (
                <div className="mt-2 text-xs text-rose-600 dark:text-rose-300">{commentError}</div>
              )}
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                {comments.map((c, idx) => (
                  <div key={c.id ?? `${c.user}-${c.date}-${idx}`} className="rounded-xl bg-white dark:bg-[#0F1525] border border-slate-300 dark:border-white/10 px-3 py-2">
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span>{c.user} · {new Date(c.date).toLocaleString()}</span>
                      {c.pending && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">Pendiente</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-900 dark:text-slate-200 mt-1">{typeof c.text === 'string' ? c.text : ''}</div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-xs text-slate-600 dark:text-slate-400">Sin comentarios</div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-1 space-y-2">
            <div className="rounded-2xl ring-1 ring-slate-300 dark:ring-white/10 bg-white dark:bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-400">Estado y categoría</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(r.status || 'pendiente')}>{labelStatus(r.status || 'pendiente')}</Badge>
                <Badge tone="warn">{(r.urgencyLabel || r.urgency || '').toString()}</Badge>
                <Badge tone={categoryTone(r.category)}>{r.category}</Badge>
              </div>
            </div>
            <div className="rounded-2xl ring-1 ring-slate-300 dark:ring-white/10 bg-white dark:bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-400">Detalles</div>
              <div className="mt-2 space-y-2">
                <div className="rounded-xl bg-white dark:bg-[#0F1525] ring-1 ring-slate-300 dark:ring-white/10 px-3 py-2">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dirección</div>
                  <div className="text-sm text-slate-900 dark:text-slate-100">{r.address}</div>
                </div>
                <div className="rounded-xl bg-white dark:bg-[#0F1525] ring-1 ring-slate-300 dark:ring-white/10 px-3 py-2">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Ciudad</div>
                  <div className="text-sm text-slate-900 dark:text-slate-100">{r.city}</div>
                </div>
                <div className="rounded-xl bg-white dark:bg-[#0F1525] ring-1 ring-slate-300 dark:ring-white/10 px-3 py-2">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Comuna</div>
                  <div className="text-sm text-slate-900 dark:text-slate-100">{r.comuna || '—'}</div>
                </div>
                <div className="rounded-xl bg-white dark:bg-[#0F1525] ring-1 ring-slate-300 dark:ring-white/10 px-3 py-2">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Ubicación</div>
                  <div className="text-sm text-slate-900 dark:text-slate-100">{ubicStr || '—'}</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl ring-1 ring-slate-300 dark:ring-white/10 bg-white dark:bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-400">Estadísticas</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white dark:bg-[#0F1525] ring-1 ring-slate-300 dark:ring-white/10 px-3 py-2">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Archivos</div>
                  <div className="text-sm text-slate-900 dark:text-slate-100">{estad.total_archivos ?? imgs.length}</div>
                </div>
                <div className="rounded-xl bg-white dark:bg-[#0F1525] ring-1 ring-slate-300 dark:ring-white/10 px-3 py-2">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Días</div>
                  <div className="text-sm text-slate-900 dark:text-slate-100">{estad.dias_desde_creacion ?? '—'}</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl ring-1 ring-slate-300 dark:ring-white/10 bg-white dark:bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-400">Votos</div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm px-2.5 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-[#0F1525] dark:text-emerald-200">
                    ▲ {fmtVotes(votesData.positivos)}
                  </span>
                  <span className="text-sm px-2.5 py-1 rounded-full border border-red-300 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-[#0F1525] dark:text-red-200">
                    ▼ {fmtVotes(votesData.negativos)}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
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
                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:text-emerald-200 dark:ring-0 dark:hover:bg-emerald-600/30'
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
                        : 'bg-red-50 text-red-700 ring-1 ring-red-300 hover:bg-red-100 dark:bg-red-600/20 dark:text-red-200 dark:ring-0 dark:hover:bg-red-600/30'
                    } ${voteLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    ▼ Votar negativo
                  </button>
                </div>
                {voteError && (
                  <div className="text-[11px] text-rose-600 dark:text-rose-300 mt-1">{voteError}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ className = "", children, onClick }) => (
  <div 
    className={cls(
      "rounded-2xl bg-white ring-1 ring-slate-200",
      onClick ? "cursor-pointer hover:ring-indigo-400/30 hover:shadow-lg transition" : "",
      className
    )}
    onClick={onClick}
    role={onClick ? "button" : undefined}
  >
    {children}
  </div>
);

const Badge = ({ tone = "neutral", className = "", children }) => {
  const tones = {
    neutral: "bg-slate-100 text-slate-700 ring-1 ring-slate-300 dark:bg-slate-700/70 dark:text-slate-200 dark:ring-0",
    info: "bg-sky-100 text-sky-700 ring-1 ring-sky-300 dark:bg-sky-600 dark:text-white dark:ring-0",
    warn: "bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-500 dark:text-slate-900 dark:ring-0",
    danger: "bg-red-100 text-red-700 ring-1 ring-red-300 dark:bg-red-600 dark:text-white dark:ring-0",
    success: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-600 dark:text-white dark:ring-0",
    violet: "bg-violet-100 text-violet-700 ring-1 ring-violet-300 dark:bg-fuchsia-600 dark:text-white dark:ring-0",
    gray: "bg-slate-200 text-slate-800 ring-1 ring-slate-300 dark:bg-slate-600 dark:text-white dark:ring-0",
  };
  return (
    <span className={cls("inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
};

const PillOption = ({ active = false, tone = "neutral", onClick, children }) => {
  const tones = {
    neutral: active 
      ? "bg-slate-200 text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" 
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/40",
    danger: active 
      ? "bg-red-200 text-red-900 shadow-sm dark:bg-red-600 dark:text-white" 
      : "text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-600/20",
    warn: active 
      ? "bg-amber-200 text-amber-900 shadow-sm dark:bg-amber-500 dark:text-slate-900" 
      : "text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-500/20",
    success: active 
      ? "bg-emerald-200 text-emerald-900 shadow-sm dark:bg-emerald-600 dark:text-white" 
      : "text-emerald-700 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-600/20",
    info: active 
      ? "bg-sky-200 text-sky-900 shadow-sm dark:bg-sky-600 dark:text-white" 
      : "text-sky-700 hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-600/20",
    gray: active 
      ? "bg-slate-300 text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white" 
      : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-600/20",
  };
  return (
    <button type="button" onClick={onClick} className={cls("px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1.5 transition-colors", tones[tone])} aria-pressed={active}>
      {children}
    </button>
  );
};

const VisualPill = ({ active = false, tone = "slate", onClick, children }) => {
  const tones = {
    slate: active
      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700 dark:text-white cursor-pointer"
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/20 cursor-pointer",
    info: active
      ? "bg-sky-600 text-white shadow-sm cursor-pointer"
      : "text-sky-700 hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-600/10 cursor-pointer",
    success: active
      ? "bg-emerald-600 text-white shadow-sm cursor-pointer"
      : "text-emerald-700 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-600/10 cursor-pointer",
  };
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors",
        tones[tone] || tones.slate
      )}
    >
      {children}
    </button>
  );
};

const ConfirmDeleteModal = ({ open, onClose, onConfirm, report }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 ring-1 ring-white/10 shadow-xl">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600/15 ring-1 ring-red-500/30 grid place-content-center text-red-400">
              <TrashIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-slate-100 text-lg font-semibold">¿Eliminar este reporte?</h3>
              <p className="mt-1 text-sm text-slate-400">
                Estás a punto de eliminar <span className="text-slate-200 font-medium">"{report?.title || `Reporte #${report?.id}`}"</span>. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 space-x-3">
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {timeAgo(report?.createdAt)}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {report?.address}</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60">Cancelar</button>
            <button type="button" onClick={onConfirm} className="rounded-xl px-4 py-2.5 text-sm bg-red-600 text-white hover:bg-red-500">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VotesModal = ({ open, onClose, title, votes }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 ring-1 ring-white/10 shadow-xl">
        <div className="p-5">
          <h3 className="text-slate-100 text-lg font-semibold">Votantes de "{title}"</h3>
          {votes.length === 0 ? (
            <p className="mt-3 text-slate-400 text-sm">Nadie ha votado aún.</p>
          ) : (
            <ul className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {votes.map((v, i) => (
                <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 ring-1 ring-slate-700/50">
                  <UserIcon className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-200 text-sm">{v.user || v}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 text-right">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700/60">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ReportesAdmin() {
  const [voted, setVoted] = useState({});
  const [votingId, setVotingId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("top");
  const [urg, setUrg] = useState("todas");
  const [estado, setEstado] = useState("todos");
  const [layout, setLayout] = useState("list");
  const [openUrg, setOpenUrg] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [openOrden, setOpenOrden] = useState(false);
  const [openVista, setOpenVista] = useState(false);
  const [flashUrg, setFlashUrg] = useState(false);
  const [flashEstado, setFlashEstado] = useState(false);
  const [flashOrden, setFlashOrden] = useState(false);
  const [flashVista, setFlashVista] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [showVotesModal, setShowVotesModal] = useState(false);
  const [selectedReportVotes, setSelectedReportVotes] = useState([]);
  const [selectedReportTitle, setSelectedReportTitle] = useState("");
  
  // 🆕 Estados para el modal de detalle
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const verVotos = (report) => {
    setSelectedReportVotes(report.votedBy || []);
    setSelectedReportTitle(report.title || `Reporte #${report.id}`);
    setShowVotesModal(true);
  };

  // 🆕 Función para abrir el modal de detalle
  const openDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const closeAll = () => {
    setOpenUrg(false);
    setOpenEstado(false);
    setOpenOrden(false);
    setOpenVista(false);
  };

  const toggleSection = (section) => {
    const currentOpen = { urg: openUrg, estado: openEstado, orden: openOrden, vista: openVista }[section];
    closeAll();
    if (!currentOpen) {
      if (section === "urg") setOpenUrg(true);
      if (section === "estado") setOpenEstado(true);
      if (section === "orden") setOpenOrden(true);
      if (section === "vista") setOpenVista(true);
    } else {
      if (section === "urg") { setFlashUrg(true); setTimeout(() => setFlashUrg(false), 1200); }
      if (section === "estado") { setFlashEstado(true); setTimeout(() => setFlashEstado(false), 1200); }
      if (section === "orden") { setFlashOrden(true); setTimeout(() => setFlashOrden(false), 1200); }
      if (section === "vista") { setFlashVista(true); setTimeout(() => setFlashVista(false), 1200); }
    }
  };

  const toneForUrg = (u) => (u === "alta" ? "danger" : u === "media" ? "warn" : u === "baja" ? "success" : "neutral");
  const labelForUrg = (u) => (u === "todas" ? "Urgencia" : u[0].toUpperCase() + u.slice(1));
  const toneForEstado = (e) => (e === "pendiente" ? "gray" : e === "en_proceso" ? "info" : e === "resuelto" ? "success" : "neutral");
  const labelForEstado = (e) => (e === "todos" ? "Estado" : e === "en_proceso" ? "En proceso" : e[0].toUpperCase() + e.slice(1));
  const labelForOrden = (s) => (s === "top" ? "Más votados" : "Más recientes");
  const labelForVista = (v) => (v === "list" ? "Lista" : "Grid");

  const handleStatusChange = async (reportId, newStatus) => {
    console.log("🔍 DEBUG ESTADO - Intentando cambiar:", {
      reportId,
      newStatus
    });

    try {
      console.log("🔍 Llamando a updateReporte...");
      const result = await updateReporte(reportId, { status: newStatus });
      console.log("🔍 Respuesta de updateReporte:", result);

      if (result) {
        console.log("✅ Estado cambiado exitosamente");
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, status: newStatus } : r
        ));
      } else {
        console.log("❌ updateReporte devolvió null/undefined");
      }
    } catch (error) {
      console.error("❌ Error en handleStatusChange:", error);
    }
  };

  const loadAllReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiReports = await getReportes();
      console.log("🔍 REPORTES CARGADOS:", {
        total: apiReports.length,
        primeros3: apiReports.slice(0, 3).map(r => ({
          id: r.id,
          title: r.title,
          status: r.status,
          urgency: r.urgency
        }))
      });
      
      if (!Array.isArray(apiReports)) throw new Error('Los datos recibidos no son un array');
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

  useEffect(() => {
  loadAllReports();
}, []);

  useEffect(() => {
    const unsub = onReportsChanged(() => loadAllReports());
    return unsub;
  }, []);

  useEffect(() => {
    // Cuando reports cambie, actualizar estado de votos
    const votedReports = {};
    reports.forEach(report => {
      votedReports[report.id] = hasVoted(report.id);
    });
    setVoted(votedReports);
  }, [reports]);

  const destacados = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    return [...reports].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 3);
  }, [reports]);

  const filtered = useMemo(() => {
    const byText = (r) => [r.title, r.summary, r.description, r.category, r.address].join(" ").toLowerCase().includes(q.toLowerCase());
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

  const handleUrgencyChange = async (reportId, newUrgency) => {
    try {
      await updateReporte(reportId, { urgency: newUrgency });
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, urgency: newUrgency } : r
      ));
      // Actualizar también el reporte seleccionado si está abierto
      setSelectedReport(prev => prev && prev.id === reportId ? { ...prev, urgency: newUrgency } : prev);
    } catch (error) {
      console.error("Error al cambiar urgencia:", error);
    }
  };

  const handleVote = async (reportId) => {
  if (votingId === reportId) return;
  
  const report = reports.find(r => r.id === reportId);
  if (!report) return;

  setVotingId(reportId);
  
  try {
    const result = await toggleVote(reportId, report.votes);
    
    if (result.success) {
      setVoted(prev => ({
        ...prev,
        [reportId]: result.voted
      }));
      
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, votes: result.newVotes } : r
      ));
    }
  } catch (error) {
    console.error("Error al votar:", error);
  } finally {
    setVotingId(null);
  }
};

  const requestDelete = (report) => {
    setReportToDelete(report);
    setConfirmOpen(true);
  };

  const confirmDeleteHandler = async () => {
    if (!reportToDelete) return;
    
    console.log("🔍 DEBUG ELIMINACIÓN - Iniciando:", {
      reportId: reportToDelete.id,
      reportTitle: reportToDelete.title
    });

    try {
      console.log("🔍 Llamando a deleteReporte...");
      const success = await deleteReporte(reportToDelete.id);
      console.log("🔍 Respuesta de deleteReporte:", success);

      if (success) {
        console.log("✅ Eliminación exitosa, actualizando UI...");
        setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
        setError(null); // Limpiar error previo
      } else {
        console.log("❌ deleteReporte devolvió");
        throw new Error('No se pudo eliminar el reporte');
      }
    } catch (e) {
      console.error("❌ Error en confirmDeleteHandler:", {
        message: e.message,
        stack: e.stack,
        report: reportToDelete
      });
      setError("No se pudo eliminar el reporte: " + e.message);
    } finally {
      console.log("🔍 Cerrando modal de confirmación");
      setConfirmOpen(false);
      setReportToDelete(null);
    }
  };

  const verPerfil = (report) => {
    console.log('Ver perfil del usuario:', report.user);
  };

  return (
    <AdminLayout title="Reportes de Infraestructura">
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="space-y-3">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Buscar por título, dirección o categoría…" 
              className="w-full rounded-xl bg-slate-50 pl-9 pr-9 py-2.5 text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800/60 dark:text-slate-100 dark:ring-white/10" 
            />
            {q && (
              <button 
                onClick={() => setQ("")} 
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Dropdown label="Urgencia" open={openUrg} onToggle={() => toggleSection("urg")} onClose={() => setOpenUrg(false)} flash={{ active: flashUrg, text: labelForUrg(urg), tone: toneForUrg(urg) }}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Urgencia:</span>
                <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl ring-1 ring-slate-300 dark:bg-slate-800/60 dark:ring-white/10">
                  <PillOption active={urg === "todas"} tone="neutral" onClick={() => { setUrg("todas"); setOpenUrg(false); setFlashUrg(true); setTimeout(() => setFlashUrg(false), 1200); }}>Todas</PillOption>
                  <PillOption active={urg === "alta"} tone="danger" onClick={() => { setUrg("alta"); setOpenUrg(false); setFlashUrg(true); setTimeout(() => setFlashUrg(false), 1200); }}>Alta</PillOption>
                  <PillOption active={urg === "media"} tone="warn" onClick={() => { setUrg("media"); setOpenUrg(false); setFlashUrg(true); setTimeout(() => setFlashUrg(false), 1200); }}>Medio</PillOption>
                  <PillOption active={urg === "baja"} tone="success" onClick={() => { setUrg("baja"); setOpenUrg(false); setFlashUrg(true); setTimeout(() => setFlashUrg(false), 1200); }}>Baja</PillOption>
                </div>
              </div>
            </Dropdown>

            <Dropdown label="Estado" open={openEstado} onToggle={() => toggleSection("estado")} onClose={() => setOpenEstado(false)} flash={{ active: flashEstado, text: labelForEstado(estado), tone: toneForEstado(estado) }}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Estado:</span>
                <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl ring-1 ring-slate-300 dark:bg-slate-800/60 dark:ring-white/10">
                  <PillOption active={estado === "todos"} tone="neutral" onClick={() => { setEstado("todos"); setOpenEstado(false); setFlashEstado(true); setTimeout(() => setFlashEstado(false), 1200); }}>Todos</PillOption>
                  <PillOption active={estado === "pendiente"} tone="gray" onClick={() => { setEstado("pendiente"); setOpenEstado(false); setFlashEstado(true); setTimeout(() => setFlashEstado(false), 1200); }}>Pendiente</PillOption>
                  <PillOption active={estado === "en_proceso"} tone="info" onClick={() => { setEstado("en_proceso"); setOpenEstado(false); setFlashEstado(true); setTimeout(() => setFlashEstado(false), 1200); }}>Proceso</PillOption>
                  <PillOption active={estado === "resuelto"} tone="success" onClick={() => { setEstado("resuelto"); setOpenEstado(false); setFlashEstado(true); setTimeout(() => setFlashEstado(false), 1200); }}>Finalizado</PillOption>
                </div>
              </div>
            </Dropdown>

            <Dropdown label="Orden" open={openOrden} onToggle={() => toggleSection("orden")} onClose={() => setOpenOrden(false)} flash={{ active: flashOrden, text: labelForOrden(sort), tone: "neutral" }}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Orden:</span>
                <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl ring-1 ring-slate-300 dark:bg-slate-800/60 dark:ring-white/10">
                  <PillOption active={sort === "top"} tone="neutral" onClick={() => { setSort("top"); setOpenOrden(false); setFlashOrden(true); setTimeout(() => setFlashOrden(false), 1200); }}>Más votados</PillOption>
                  <PillOption active={sort === "recent"} tone="neutral" onClick={() => { setSort("recent"); setOpenOrden(false); setFlashOrden(true); setTimeout(() => setFlashOrden(false), 1200); }}>Más recientes</PillOption>
                </div>
              </div>
            </Dropdown>

            <Dropdown label="Vista" open={openVista} onToggle={() => toggleSection("vista")} onClose={() => setOpenVista(false)} flash={{ active: flashVista, text: labelForVista(layout), tone: "neutral" }}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Vista:</span>
                <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl ring-1 ring-slate-300 dark:bg-slate-800/60 dark:ring-white/10">
                  <PillOption active={layout === "list"} tone="neutral" onClick={() => { setLayout("list"); setOpenVista(false); setFlashVista(true); setTimeout(() => setFlashVista(false), 1200); }}><ListIcon className="h-4 w-4" /> Lista</PillOption>
                  <PillOption active={layout === "grid"} tone="neutral" onClick={() => { setLayout("grid"); setOpenVista(false); setFlashVista(true); setTimeout(() => setFlashVista(false), 1200); }}><GridIcon className="h-4 w-4" /> Grid</PillOption>
                </div>
              </div>
            </Dropdown>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-4 dark:bg-rose-500/10 dark:ring-rose-500/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-rose-800 font-medium dark:text-rose-200">Error al cargar reportes</p>
                <p className="text-rose-700/80 text-sm dark:text-rose-300/70">{error}</p>
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

        {/* Loading */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white ring-1 ring-slate-200 p-5 h-64 animate-pulse dark:bg-slate-900/60 dark:ring-white/10" />
            ))}
          </div>
        ) : (
          <>
            {/* DESTACADOS */}
            {destacados.length > 0 && (
              <section className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 sm:p-5 space-y-4 shadow-sm dark:bg-slate-900/80 dark:ring-white/10">
                <header className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 dark:text-slate-100">
                    <StarIcon className="h-6 w-6 text-amber-400" filled />
                    Reportes Destacados
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Basado en los reportes con más votos
                  </span>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {destacados.map((r, idx) => (
                    <Card key={r.id} className="p-3" onClick={() => openDetail(r)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cls(
                            "h-8 w-8 rounded-lg grid place-items-center text-sm font-bold",
                            idx === 0 
                              ? "bg-amber-500 text-slate-900 dark:text-white" 
                              : idx === 1 
                              ? "bg-slate-400 text-slate-900 dark:text-white" 
                              : "bg-orange-600 text-slate-900 dark:text-white"
                          )}>
                            #{idx + 1}
                          </div>
                          <div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
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
                              <Up className={cls("h-4 w-4 transition", voted[r.id] ? "scale-110" : "group-hover:translate-y-[-1px]")} />
                              {fmtVotes(r.votes)}
                            </button>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">votos</p>
                          </div>
                        </div>
                        <select 
                          value={r.urgency} 
                          onChange={(e) => { e.stopPropagation(); handleUrgencyChange(r.id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs rounded-lg px-2 py-1 bg-white text-slate-700 ring-1 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10"
                        >
                          <option value="baja">Baja</option>
                          <option value="media">Media</option>
                          <option value="alta">Alta</option>
                        </select>
                      </div>
                      
                      <div className="rounded-lg overflow-hidden bg-slate-100 mb-3 dark:bg-slate-800/60">
                        <div className="relative w-full aspect-[16/9]">
                          <img src={r.imageDataUrl || r.image || FALLBACK_IMG} alt={r.title || "Reporte"} className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={(e) => { if (e.currentTarget.src !== FALLBACK_IMG) e.currentTarget.src = FALLBACK_IMG; }} />
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2 dark:text-slate-100">{r.title || "Sin título"}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge tone={categoryTone(r.category)} className="text-[10px]">{r.category}</Badge>
                        <Badge tone={statusTone(r.status || "pendiente")} className="text-[10px]"><DotIcon className="h-3 w-3" />{(r.status || "pendiente").toUpperCase()}</Badge>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3 dark:text-slate-400">{r.summary || r.description || "Sin descripción."}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 pt-2 dark:border-slate-700/50">
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(r.createdAt)}</span>
                        <span className="inline-flex items-center gap-1 truncate max-w-[120px]"><MapPin className="h-3 w-3" /> {r.address}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); verPerfil(r); }} className="flex-1 text-xs rounded-lg px-3 py-1.5 bg-emerald-600/20 text-emerald-700 ring-1 ring-emerald-500/30 hover:bg-emerald-600/30 dark:bg-emerald-600/20 dark:text-emerald-300 dark:ring-emerald-500/30 dark:hover:bg-emerald-600/30">Perfil</button>
                        <button onClick={(e) => { e.stopPropagation(); requestDelete(r); }} className="flex-1 text-xs rounded-lg px-3 py-1.5 bg-red-600/20 text-red-700 ring-1 ring-red-500/30 hover:bg-red-600/30 dark:bg-red-600/20 dark:text-red-300 dark:ring-red-500/30 dark:hover:bg-red-600/30">Eliminar</button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* LISTA COMPLETA */}
            <section className="space-y-4">
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Todos los Reportes</h2>
                <span className="text-sm text-slate-600 dark:text-slate-400">Mostrando <b className="text-slate-800 dark:text-slate-200">{filtered.length}</b> de {reports.length}</span>
              </header>
              
              {filtered.length === 0 ? (
                <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-5 text-slate-600 dark:bg-slate-900/60 dark:ring-white/10 dark:text-slate-300">No hay reportes.</div>
              ) : (
                <div className={layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                  {filtered.map((r) => {
                    const urgencyTone =
                      r.urgency === "alta"
                        ? "rose"
                        : r.urgency === "media"
                        ? "amber"
                        : "emerald";
                    const priority = pct(r.votes, 1000);

                    return (
                      <Card key={r.id} className="p-4" onClick={() => openDetail(r)}>
                        <div className={layout === "grid" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-[380px_1fr] gap-5"}>
                          
                          {/* Imagen - Ahora más grande */}
                          <figure className="rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800/50 dark:ring-white/10">
                            <div className="relative w-full aspect-[16/9]">
                              <img 
                                src={r.imageDataUrl || r.image || FALLBACK_IMG} 
                                alt={r.title || "Reporte"} 
                                className="absolute inset-0 h-full w-full object-cover" 
                                loading="lazy" 
                                onError={(e) => { if (e.currentTarget.src !== FALLBACK_IMG) e.currentTarget.src = FALLBACK_IMG; }} 
                              />
                            </div>
                          </figure>

                          {/* Contenido */}
                          <div className="min-w-0 space-y-3">
                            {/* Header: Título + Votos */}
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-slate-900 font-semibold text-base flex-1 line-clamp-2 dark:text-slate-100">{r.title || `Reporte #${r.id}`}</h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                <Up className={cls("h-4 w-4 transition", voted[r.id] ? "scale-110" : "group-hover:translate-y-[-1px]")} />
                                {fmtVotes(r.votes)}
                              </button>
                            </div>            

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                              <Badge tone={categoryTone(r.category)} className="text-[10px]">
                                <TagIcon className="h-3 w-3" /> {r.category}
                              </Badge>
                              <Badge tone={toneForLevel(r.urgency)} className="text-[10px]">
                                <AlertIcon className="h-3 w-3" /> {r.urgency?.toUpperCase()}
                              </Badge>
                              <Badge tone={toneForLevel(impactLevel(r.votes))} className="text-[10px]">
                                <FlameIcon className="h-3 w-3" /> IMPACTO {impactLevel(r.votes).toUpperCase()}
                              </Badge>
                              <Badge tone={statusTone(r.status || "pendiente")} className="text-[10px]">
                                <DotIcon className="h-3 w-3" /> {(r.status || "pendiente").toUpperCase()}
                              </Badge>
                            </div>

                            {/* Descripción */}
                            <p className="text-slate-700 text-sm line-clamp-3 dark:text-slate-300">{r.summary || r.description}</p>

                            
                            {/* Barra de progreso de prioridad */}
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-600 dark:text-slate-400">Prioridad comunitaria</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{priority}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-white/10">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    urgencyTone === "rose"
                                      ? "bg-rose-500"
                                      : urgencyTone === "amber"
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${priority}%` }}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-valuenow={priority}
                                  role="progressbar"
                                />
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-500 mt-1 dark:text-slate-400">
                                <span>Baja</span>
                                <span>Media</span>
                                <span>Alta</span>
                              </div>
                            </div>

                            

                            {/* Botones: Ver perfil + estado del reporte + Eliminar */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); verPerfil(r); }} 
                                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-emerald-600 text-white ring-1 ring-emerald-500 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                                  title="Ver perfil del usuario"
                                >
                                  <UserIcon className="h-4 w-4" />
                                  Ver perfil
                                </button>
                              </div>

                              {/* Estado del reporte */}
                              <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  Estado del reporte
                                </span>
                                <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
                                  <VisualPill
                                    active={(r.status || "pendiente") === "pendiente"}
                                    tone="slate"
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(r.id, "pendiente"); }}
                                  >
                                    Pendiente
                                  </VisualPill>
                                  <VisualPill
                                    active={(r.status || "pendiente") === "en_proceso"}
                                    tone="info"
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(r.id, "en_proceso"); }}
                                  >
                                    En proceso
                                  </VisualPill>
                                  <VisualPill
                                    active={(r.status || "pendiente") === "resuelto"}
                                    tone="success"
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(r.id, "resuelto"); }}
                                  >
                                    Finalizado
                                  </VisualPill>
                                </div>
                              </div>

                              <button 
                                onClick={(e) => { e.stopPropagation(); requestDelete(r); }} 
                                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-red-600 text-white ring-1 ring-red-500 hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30 transition-all"
                                title="Eliminar este reporte"
                              >
                                <TrashIcon className="h-4 w-4" />
                                Eliminar
                              </button>
                            </div>

                            {/* Footer: Dirección + Fecha */}
                            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:text-slate-400 dark:border-slate-700/50">
                              <span className="inline-flex items-center gap-1 truncate flex-1 mr-2">
                                <MapPin className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                                <span className="truncate">{r.address}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 flex-shrink-0">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(r.createdAt).toISOString().slice(0,10)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white py-4 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.total}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white py-4 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.urgentes}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Urgentes</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white py-4 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.enProceso}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">En proceso</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white py-4 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{metrics.pendientes}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Pendientes</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white py-4 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.resueltos}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Resueltos</div>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal open={confirmOpen} onClose={() => { setConfirmOpen(false); setReportToDelete(null); }} onConfirm={confirmDeleteHandler} report={reportToDelete} />
      <VotesModal open={showVotesModal} onClose={() => { setShowVotesModal(false); setSelectedReportVotes([]); setSelectedReportTitle(""); }} title={selectedReportTitle} votes={selectedReportVotes} />
      
      {/* 🆕 MODAL DE DETALLE DEL REPORTE */}
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
    </AdminLayout>
  );
}