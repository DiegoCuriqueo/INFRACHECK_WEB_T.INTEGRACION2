import React, { useId, useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getReportes } from "../../services/reportsService";
import { applyVotesPatch } from "../../services/votesService";
import { SEED } from "../../JSON/reportsSeed";
import AutorityLayout from "../../layout/AutorityLayout";

/* ====== Tokens ====== */
const T = {
  cardBg: "#121B2B",
  grid: "#334155",
  axis: "#9CA3AF",
  tooltipBg: "bg-slate-900/95",
  tooltipBorder: "border-slate-700",
  users: "#818CF8",
  reports: "#22D3EE",
  visits: "#60A5FA",
  // chips
  chip: {
    progreso: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30",
    completo: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
    pendiente: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/30",
    aprobado: "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30",
    rechazado: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30",

    prioridad_alta: "bg-rose-600/15 text-rose-300 ring-1 ring-rose-400/30",
    prioridad_media: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
    prioridad_normal: "bg-sky-600/15 text-sky-300 ring-1 ring-sky-400/30",
  }
};

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"];
const make = (arr) => arr.map((v, i) => ({ mes: meses[i], y: v }));

/* Función para cargar datos JSON */
const loadJSONData = async (filename) => {
  const response = await fetch(`/JSON/${filename}`);
  const data = await response.json();
  return data;
};

const fmtK = (n) =>
  Math.abs(n) >= 1e6
    ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
    : Math.abs(n) >= 1e3
    ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k"
    : String(n);

const pct = (arr) => {
  const a = arr.at(-2) || 0,
    b = arr.at(-1) || 0;
  return a ? Math.round(((b - a) / a) * 100) : 0;
};
const ma = (arr, w = 3) =>
  arr.map((_, i) => {
    const s = Math.max(0, i - w + 1);
    const slice = arr.slice(s, i + 1);
    return Math.round((slice.reduce((p, c) => p + c, 0) / slice.length) * 100) / 100;
  });

/* ========== Sparkline ========== */
function SparklinePro({
  data,
  height = 320,
  minWidth = 760,
  padding = { t: 24, r: 40, b: 56, l: 72 },
  color = T.users,
  fillFrom = "rgba(129,140,248,0.28)",
  bgGrid = T.grid,
  axisText = T.axis,
}) {
  const svgId = useId();
  const wrapRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);

  // Controles
  const [showPoints, setShowPoints] = useState(true);
  const [smooth, setSmooth] = useState(true);
  const [range, setRange] = useState("all"); // '3m'|'6m'|'9m'|'all'

  useEffect(() => setMounted(true), []);

  const width = (() => {
    const w = wrapRef.current ? wrapRef.current.clientWidth : null;
    return Math.max(minWidth, w || minWidth + 140);
  })();

  // Subconjunto según rango
  const visibleData = useMemo(() => {
    const take =
      range === "3m" ? 3 : range === "6m" ? 6 : range === "9m" ? 9 : data.length;
    return data.slice(-take);
  }, [data, range]);

  const series = useMemo(() => {
    const ys = visibleData.map((d) => d.y);
    return smooth ? ma(ys, 3) : ys;
  }, [visibleData, smooth]);

  const calc = useMemo(() => {
    const vals = series;
    const rawMin = Math.min(...vals);
    const rawMax = Math.max(...vals);
    const span = rawMax - rawMin || 1;
    const padY = span * 0.12;
    const yMin = Math.floor((rawMin - padY) * 10) / 10;
    const yMax = Math.ceil((rawMax + padY) * 10) / 10;

    const innerW = width - padding.l - padding.r;
    const innerH = height - padding.t - padding.b;

    const xs = vals.map((_, i) => padding.l + (i * innerW) / (vals.length - 1 || 1));
    const ys = vals.map((v) => padding.t + (1 - (v - yMin) / (yMax - yMin)) * innerH);

    const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x},${ys[i]}`).join(" ");
    const areaD = `${pathD} L ${xs.at(-1)},${height - padding.b} L ${xs[0]},${height - padding.b} Z`;

    const yTicks = Array.from({ length: 4 }, (_, i) => {
      const p = i / (4 - 1);
      const yVal = yMin + (1 - p) * (yMax - yMin);
      const yPix = padding.t + p * innerH;
      return { yPix, label: fmtK(Number.isInteger(yVal) ? yVal : +yVal.toFixed(1)) };
    });

    const avg = vals.reduce((p, c) => p + c, 0) / vals.length;
    const avgY = padding.t + (1 - (avg - yMin) / (yMax - yMin)) * innerH;

    const minI = vals.indexOf(rawMin);
    const maxI = vals.indexOf(rawMax);

    const xStep = innerW / (vals.length - 1 || 1);

    return { xs, ys, pathD, areaD, yTicks, avg, avgY, minI, maxI, xStep };
  }, [series, width, height, padding.l, padding.r, padding.t, padding.b]);

  const idxFromClient = (clientX) => {
    if (!wrapRef.current) return null;
    const rect = wrapRef.current.getBoundingClientRect();
    const rel = clientX - rect.left - padding.l;
    const idx = Math.round(rel / calc.xStep);
    if (idx < 0 || idx >= visibleData.length) return null;
    return idx;
  };

  const onMove = (e) => setHoverIdx(idxFromClient(e.clientX));
  const onTouch = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    setHoverIdx(idxFromClient(t.clientX));
  };
  const onLeave = () => setHoverIdx(null);

  const tip =
    hoverIdx != null
      ? {
          x: calc.xs[hoverIdx],
          y: calc.ys[hoverIdx],
          mes: visibleData[hoverIdx].mes,
          val: visibleData[hoverIdx].y,
        }
      : null;

  const lastX = calc.xs.at(-1),
    lastY = calc.ys.at(-1),
    lastVal = visibleData.at(-1).y;

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-800/40 rounded-lg p-1 ring-1 ring-white/5">
          {["3m", "6m", "9m", "all"].map((key) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-2.5 py-1 text-xs rounded-md ${
                range === key ? "bg-slate-700/60 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              {key === "all" ? "Todos" : key.toUpperCase()}
            </button>
          ))}
        </div>

        <label className="text-xs text-slate-300 flex items-center gap-2 ml-1">
          <input type="checkbox" checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} />
          Puntos
        </label>
        <label className="text-xs text-slate-300 flex items-center gap-2">
          <input type="checkbox" checked={smooth} onChange={(e) => setSmooth(e.target.checked)} />
          Suavizar (MA3)
        </label>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id={`grad-${svgId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillFrom} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
          <filter id={`glow-${svgId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid + ticks */}
        {calc.yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padding.l} x2={width - padding.r} y1={t.yPix} y2={t.yPix} stroke={T.grid} strokeDasharray="2 4" />
            <text x={padding.l - 12} y={t.yPix + 4} textAnchor="end" fontSize="12" fill={T.axis}>
              {t.label}
            </text>
          </g>
        ))}
        <line x1={padding.l} x2={width - padding.r} y1={height - padding.b} y2={height - padding.b} stroke={T.grid} />

        {/* Área + línea */}
        <path d={calc.areaD} fill={`url(#grad-${svgId})`} opacity={mounted ? 1 : 0} />
        <path
          d={calc.pathD}
          fill="none"
          stroke={color}
          strokeWidth={2.8}
          filter={`url(#glow-${svgId})`}
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: mounted ? 0 : 1000,
            transition: "stroke-dashoffset 720ms ease-out",
          }}
        />

        {/* Línea de promedio */}
        <line x1={padding.l} x2={width - padding.r} y1={calc.avgY} y2={calc.avgY} stroke="rgba(148,163,184,0.4)" strokeDasharray="6 6" />
        <text x={width - padding.r} y={calc.avgY - 6} textAnchor="end" fontSize="11" fill="rgba(226,232,240,0.8)">
          Prom: {fmtK(+calc.avg.toFixed(2))}
        </text>

        {/* Min/Max */}
        {[calc.minI, calc.maxI].map((i, ix) => (
          <g key={ix}>
            <circle cx={calc.xs[i]} cy={calc.ys[i]} r={5} fill="#0EA5E9" />
            <circle cx={calc.xs[i]} cy={calc.ys[i]} r={2.6} fill="white" />
          </g>
        ))}

        {/* Puntos */}
          {showPoints &&
            calc.xs.map((x, i) => (
              <g key={i}>
                <circle cx={x} cy={calc.ys[i]} r={3} fill={color} />
                <circle cx={x} cy={calc.ys[i]} r={1.6} fill="white" />
                {/* Etiquetas para cada punto */}
                <text x={x} y={calc.ys[i] - 10} textAnchor="middle" fontSize="12" fill={color}>
                  {fmtK(visibleData[i].y)}
                </text>
              </g>
            ))}

        {/* Hover marker */}
        {hoverIdx != null && (
          <>
            <line x1={calc.xs[hoverIdx]} x2={calc.xs[hoverIdx]} y1={padding.t} y2={height - padding.b} stroke="#64748B" strokeDasharray="3 5" />
            <circle cx={calc.xs[hoverIdx]} cy={calc.ys[hoverIdx]} r={5.6} fill={color} />
            <circle cx={calc.xs[hoverIdx]} cy={calc.ys[hoverIdx]} r={2.8} fill="white" />
          </>
        )}

        {/* Eje X meses */}
        {visibleData.map((d, i) => (
          <text key={i} x={calc.xs[i]} y={height - padding.b + 22} textAnchor="middle" fontSize="12" fill={T.axis}>
            {d.mes}
          </text>
        ))}

        {/* Último valor */}
        <g>
          <rect
            x={calc.xs.at(-1) + 8}
            y={calc.ys.at(-1) - 16}
            rx="8"
            ry="8"
            width={String(fmtK(visibleData.at(-1).y)).length * 8 + 22}
            height="24"
            fill="rgba(15,23,42,0.9)"
            stroke="rgba(148,163,184,0.25)"
          />
          <text x={calc.xs.at(-1) + 18} y={calc.ys.at(-1)} dominantBaseline="middle" fontSize="12" fill="#E5E7EB">
            {fmtK(visibleData.at(-1).y)}
          </text>
        </g>

        {/* Área interactiva */}
        <rect
          x={padding.l}
          y={padding.t}
          width={width - padding.l - padding.r}
          height={height - padding.t - padding.b}
          fill="transparent"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          onTouchStart={onTouch}
          onTouchMove={onTouch}
        />
      </svg>
    </div>
  );
}

/* ====== Helpers UI ====== */
const IconMiniGrid = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="2" fill="#94a3b8" />
    <rect x="14" y="3" width="7" height="7" rx="2" fill="#94a3b8" opacity=".6" />
    <rect x="3" y="14" width="7" height="7" rx="2" fill="#94a3b8" opacity=".6" />
    <rect x="14" y="14" width="7" height="7" rx="2" fill="#94a3b8" opacity=".35" />
  </svg>
);

const Chip = ({ className = "", children }) => (
  <span className={`px-2.5 py-1 text-xs rounded-full ${className}`}>
    {children}
  </span>
);

// Indicador de acción (chevron)
const ChevronRight = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Iconos pequeños para metadatos
const IconClock = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" fill="none" />
    <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconAlert = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <path d="M12 3 3 21h18L12 3z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
    <path d="M12 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" />
  </svg>
);

/* ====== Card genérica ====== */
function Card({ title, children, className = "" }) {
  return (
    <article className={`rounded-2xl p-6 border shadow-sm ring-1 ring-white/5 ${className}`} style={{ background: T.cardBg }}>
      <h2 className="text-[14px] text-slate-200 font-semibold mb-4">{title}</h2>
      {children}
    </article>
  );
}

/* ====== Card Chart ====== */
function ChartCard({ title, stat, delta, color, fillFrom, data }) {
  return (
    <article className="rounded-2xl p-6 shadow-sm" style={{ background: T.cardBg }}>
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] text-slate-200 font-semibold">{title}</h2>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            delta >= 0
              ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
              : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
          }`}
        >
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
        </span>
      </header>
      <p className="text-slate-300 text-sm mb-4">{stat}</p>
      <SparklinePro data={data} color={color} fillFrom={fillFrom} />
    </article>
  );
}

/* ====== Card Proyectos (lista basada en proyectos creados) ====== */
const PROJ_STORAGE_KEY = "authorityProjects";
const loadLocalProjects = () => {
  try {
    const raw = localStorage.getItem(PROJ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const chipFromEstado = (estado) => {
  const s = String(estado || "").toLowerCase();
  if (s.includes("progreso")) return T.chip.progreso;
  if (s.includes("complet")) return T.chip.completo;
  if (s.includes("pend")) return T.chip.pendiente;
  if (s.includes("aprob")) return T.chip.aprobado;
  if (s.includes("rechaz")) return T.chip.rechazado;
  if (s.includes("borrador")) return T.chip.pendiente;
  return "bg-slate-700/40 text-slate-300 ring-1 ring-white/10";
};

function ProyectosCard({ items = [] }) {
  const navigate = useNavigate();
  const pageSize = 5;
  const [page, setPage] = useState(0);

  const proyectos = useMemo(() => {
    const withIndex = items.map((p, idx) => ({ ...p, __idx: idx }));
    return [...withIndex].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : null;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : null;
      if (ta != null && tb != null) return tb - ta; // más reciente primero
      if (ta != null) return -1;
      if (tb != null) return 1;
      const ia = Number(a.id), ib = Number(b.id);
      if (!Number.isNaN(ia) && !Number.isNaN(ib)) return ib - ia; // id mayor primero
      return b.__idx - a.__idx; // último insertado primero
    });
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(proyectos.length / pageSize));
  const clampedPage = Math.min(page, totalPages - 1);
  const visible = proyectos.slice(clampedPage * pageSize, clampedPage * pageSize + pageSize);

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <Card title="Proyectos" className="border border-white/10">
      {/* Toolbar superior */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] text-slate-400">
          {proyectos.length} proyecto(s)
        </span>
        <div className="flex items-center gap-2">
          {proyectos.length > pageSize && (
            <div className="flex items-center gap-2">
              <button
                className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 ring-1 ring-white/10 disabled:opacity-40"
                onClick={prev}
                disabled={clampedPage === 0}
              >
                Anterior
              </button>
              <span className="text-[12px] text-slate-400">Página {clampedPage + 1} de {totalPages}</span>
              <button
                className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 ring-1 ring-white/10 disabled:opacity-40"
                onClick={next}
                disabled={clampedPage >= totalPages - 1}
              >
                Siguiente
              </button>
            </div>
          )}
          <button
            className="px-2.5 py-1 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500"
            onClick={() => navigate("/autority/proyectos")}
          >
            Abrir Proyectos
          </button>
        </div>
      </div>

      {proyectos.length === 0 ? (
        <div className="px-4 py-3 text-sm text-slate-400">No hay proyectos creados.</div>
      ) : (
        <div className="rounded-xl">
          <ul className="divide-y divide-white/10">
            {visible.map((p) => (
              <li
                key={p.id ?? p.nombre}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 hover:ring-1 hover:ring-white/10 rounded-lg transition cursor-pointer"
                onClick={() => {
                  const target = p.id ?? p.nombre;
                  navigate(`/autority/proyectos?id=${encodeURIComponent(String(target))}`);
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-slate-800/60 ring-1 ring-white/10">
                    <IconMiniGrid />
                  </span>
                  <div className="min-w-0">
                    <p className="text-slate-200 truncate" title={p.nombre ?? "Proyecto"}>{p.nombre ?? "Proyecto"}</p>
                    {p.descripcion && (
                      <p
                        className="text-[12px] text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis"
                        title={p.descripcion}
                      >
                        {p.descripcion}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-none shrink-0">
                  {typeof p.informes === "number" && (
                    <span className="px-2 py-0.5 text-[11px] rounded-full bg-slate-700/50 text-slate-300">
                      {p.informes} rep.
                    </span>
                  )}
                  {p.createdAt && (
                    <span className="flex items-center gap-1 text-[12px] text-slate-400 flex-none shrink-0">
                      <IconClock />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {p.estado && String(p.estado).toLowerCase() !== "borrador" && (
                    <Chip className={chipFromEstado(p.estado)}>{p.estado}</Chip>
                  )}
                  <span className="text-slate-400 group-hover:text-slate-200">
                    <ChevronRight />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

/* ====== Card Prioridad (tabla) ====== */
const prioridades = [
  { id: 1, lugar: "Centro Temuco", prioridad: "Muy importante", key: "prioridad_alta" },
  { id: 2, lugar: "Centro Temuco", prioridad: "Importante", key: "prioridad_media" },
  { id: 3, lugar: "Centro Temuco", prioridad: "Normal", key: "prioridad_normal" },
];

function PrioridadCard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const pageSize = 5;
  const [page, setPage] = useState(0);

  useEffect(() => {
    try {
      const userReports = applyVotesPatch(getReportes());
      const seedReports = applyVotesPatch(SEED);
      setReports([...userReports, ...seedReports]);
    } catch (e) {
      console.error("Error cargando reportes para prioridad:", e);
      setReports(applyVotesPatch(SEED));
    }
  }, []);

  const urgOrder = { alta: 3, media: 2, baja: 1 };
  const sorted = useMemo(() => {
    return [...reports].sort((a, b) => {
      const ua = urgOrder[a.urgency] || 0;
      const ub = urgOrder[b.urgency] || 0;
      if (ub !== ua) return ub - ua; // alta primero
      // desempate por votos y fecha
      const v = (b.votes || 0) - (a.votes || 0);
      if (v !== 0) return v;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [reports]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const clampedPage = Math.min(page, totalPages - 1);
  const visible = sorted.slice(clampedPage * pageSize, clampedPage * pageSize + pageSize);
  const chipUrg = (u) =>
    u === "alta"
      ? T.chip.prioridad_alta
      : u === "media"
      ? T.chip.prioridad_media
      : T.chip.prioridad_normal;

  const bubbleUrg = (u) =>
    u === "alta"
      ? "bg-rose-600/25 ring-rose-400/40 text-rose-300"
      : u === "media"
      ? "bg-amber-500/25 ring-amber-400/40 text-amber-300"
      : "bg-sky-600/25 ring-sky-400/40 text-sky-300";

  return (
    <Card title="Prioridad" className="border border-white/10">
      {/* Toolbar superior */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] text-slate-400">
          {reports.length} reporte(s)
        </span>
        <div className="flex items-center gap-2">
          {sorted.length > pageSize && (
            <div className="flex items-center gap-2">
              <button
                className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 ring-1 ring-white/10 disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={clampedPage === 0}
              >
                Anterior
              </button>
              <span className="text-[12px] text-slate-400">Página {clampedPage + 1} de {totalPages}</span>
              <button
                className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 ring-1 ring-white/10 disabled:opacity-40"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={clampedPage >= totalPages - 1}
              >
                Siguiente
              </button>
            </div>
          )}
          <button
            className="px-2.5 py-1 text-xs rounded-md bg-cyan-600 hover:bg-cyan-500"
            onClick={() => navigate("/autority/reportes")}
          >
            Abrir Reportes
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="px-4 py-3 text-sm text-slate-400">No hay reportes.</div>
      ) : (
        <div className="rounded-xl">
          <ul className="divide-y divide-white/10">
            {visible.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 hover:ring-1 hover:ring-white/10 rounded-lg transition cursor-pointer"
                onClick={() => navigate(`/autority/reportes?urg=${encodeURIComponent(r.urgency || "todas")}&id=${encodeURIComponent(String(r.id))}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`inline-flex items-center justify-center h-9 w-9 rounded-lg ring-1 ${bubbleUrg(r.urgency)}`}>
                    <IconAlert />
                  </span>
                  <div className="min-w-0">
                    <p className="text-slate-200 truncate" title={r.title || r.address || "Reporte"}>{r.title || r.address || "Reporte"}</p>
                    <div className="flex items-center gap-3">
                      {r.address && (
                        <span
                          className="flex-1 min-w-0 text-[12px] text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis"
                          title={r.address}
                        >
                          {r.address}
                        </span>
                      )}
                      {r.createdAt && (
                        <span className="flex items-center gap-1 text-[12px] text-slate-400 flex-none shrink-0">
                          <IconClock />
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {typeof r.votes === "number" && (
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-slate-700/50 text-slate-300 flex-none shrink-0">
                          {r.votes} votos
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-none shrink-0">
                  <Chip className={chipUrg(r.urgency)}>
                    {r.urgency === "alta" ? "Muy importante" : r.urgency === "media" ? "Importante" : "Normal"}
                  </Chip>
                  <span className="text-slate-400 group-hover:text-slate-200">
                    <ChevronRight />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

/* ====== Página ====== */
export default function HomeAU() {
  // Estados para los datos
  const [dataUsuarios, setDataUsuarios] = useState([]);
  const [dataReportes, setDataReportes] = useState([]);
  const [dataVisitas, setDataVisitas] = useState([]);
  const [proyectosAU, setProyectosAU] = useState([]);
  const [range, setRange] = useState("all");
  const [showPoints, setShowPoints] = useState(true);
  const [smooth, setSmooth] = useState(true);

  // Cargar los datos desde los archivos JSON
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuarios = await loadJSONData("usuarios.json");
        const reportes = await loadJSONData("reportes.json");
        const visitas = await loadJSONData("visitas.json");

        setDataUsuarios(usuarios);
        setDataReportes(reportes);
        setDataVisitas(visitas);
      } catch (error) {
        console.error("Error cargando los datos:", error);
      }
    };

    fetchData();
  }, []); // Solo se ejecuta una vez cuando el componente se monta

  // Cargar proyectos creados localmente (Proyectos Autoridad)
  useEffect(() => {
    setProyectosAU(loadLocalProjects());
  }, []);

  // Mostrar mensaje mientras los datos se están cargando
  if (!dataUsuarios.length || !dataReportes.length || !dataVisitas.length) {
    return <div>Cargando...</div>;
  }

  return (
    <AutorityLayout>
      {/* Grid general en 12 columnas para layout preciso */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-10">
        {/* Gráficos */}
        <div className="2xl:col-span-6">
          <ChartCard
            title="Informe de usuarios"
            stat={`${dataUsuarios.at(-1).y} usuarios`}
            delta={pct(dataUsuarios.map((d) => d.y))}
            color={T.users}
            fillFrom="rgba(129,140,248,0.28)"
            data={dataUsuarios}
          />
        </div>

        <div className="2xl:col-span-6">
          <ChartCard
            title="Informe de Reportes"
            stat={`${dataReportes.at(-1).y} reportes`}
            delta={pct(dataReportes.map((d) => d.y))}
            color={T.reports}
            fillFrom="rgba(34,211,238,0.28)"
            data={dataReportes}
          />
        </div>

        <div className="2xl:col-span-12">
          <ChartCard
            title="Informe de Visitas"
            stat={`${dataVisitas.at(-1).y} visitas`}
            delta={pct(dataVisitas.map((d) => d.y))}
            color={T.visits}
            fillFrom="rgba(96,165,250,0.28)"
            data={dataVisitas}
          />
        </div>

        {/* Tarjetas nuevas: Proyectos y Prioridad (como en la imagen) */}
        <div className="2xl:col-span-6">
          <ProyectosCard items={proyectosAU} />
        </div>
        <div className="2xl:col-span-6">
          <PrioridadCard />
        </div>
      </div>
    </AutorityLayout>
  );
}
