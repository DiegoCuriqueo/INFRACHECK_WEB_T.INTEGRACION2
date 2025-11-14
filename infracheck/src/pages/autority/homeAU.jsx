import React, {
  useId,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { getReportes } from "../../services/reportsService";
import { applyVotesPatch } from "../../services/votesService";
import { getProjects } from "../../services/projectsService";
import AutorityLayout from "../../layout/AutorityLayout";

/* ====== Tokens ====== */
const T = {
  cardBg: "#121B2B",
  grid: "#3A4A63",
  axis: "#E2E8F0",
  tooltipBg: "bg-slate-900/95",
  tooltipBorder: "border-slate-700",
  users: "#818CF8",
  reports: "#22D3EE",
  visits: "#60A5FA",
  chip: {
    progreso: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30",
    completo: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
    pendiente: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/30",
    aprobado: "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30",
    rechazado: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30",

    prioridad_alta: "bg-rose-600/15 text-rose-300 ring-1 ring-rose-400/30",
    prioridad_media: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
    prioridad_normal: "bg-sky-600/15 text-sky-300 ring-1 ring-sky-400/30",
  },
};

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const make = (arr) => arr.map((v, i) => ({ mes: meses[i], y: v }));

// Datos de fallback (por si la API falla)
const DEFAULT_USUARIOS = make([5, 12, 8, 15, 14, 20, 26, 22, 18, 18, 18, 18]);
const DEFAULT_REPORTES = make([2, 10, 6, 9, 8, 18, 24, 17, 19, 19, 19, 19]);
const DEFAULT_VISITAS  = make([3, 7, 5, 4, 12, 9, 21, 16, 17, 17, 17, 17]);

const fmtK = (n) =>
  Math.abs(n) >= 1e6
    ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
    : Math.abs(n) >= 1e3
    ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k"
    : String(n);

const pct = (arr) => {
  const a = arr.at(-2) || 0;
  const b = arr.at(-1) || 0;
  return a ? Math.round(((b - a) / a) * 100) : 0;
};

const ma = (arr, w = 3) =>
  arr.map((_, i) => {
    const s = Math.max(0, i - w + 1);
    const slice = arr.slice(s, i + 1);

    // promedio móvil redondeado a 2 decimales
    return (
      Math.round(
        (slice.reduce((p, c) => p + c, 0) / slice.length) * 100
      ) / 100
    );
  });

/** Serie mensual desde reportes API (9 meses hacia atrás) */
function buildMonthlySeriesFromReports(reports, months = 9) {
  if (!Array.isArray(reports) || !reports.length) return [];

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const buckets = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const label = meses[d.getMonth()];
    buckets.push({ mes: label, y: 0 });
  }

  reports.forEach((r) => {
    const created = r?.createdAt ? new Date(r.createdAt) : null;
    if (!created || Number.isNaN(created.getTime())) return;
    if (created < start || created > now) return;

    const idx =
      (created.getFullYear() - start.getFullYear()) * 12 +
      (created.getMonth() - start.getMonth());
    if (idx >= 0 && idx < months) {
      buckets[idx].y += 1;
    }
  });

  return buckets;
}

/* ========== Sparkline ========== */
function SparklinePro({
  data,
  height = 260,
  minWidth = 520,
  padding = { t: 20, r: 36, b: 48, l: 60 },
  color = T.users,
  fillFrom = "rgba(129,140,248,0.3)",
}) {
  const svgId = useId();
  const wrapRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);

  const [showPoints, setShowPoints] = useState(true);
  const [smooth, setSmooth] = useState(true);
  const [range, setRange] = useState("all");

  useEffect(() => setMounted(true), []);

  const width = (() => {
    const w = wrapRef.current ? wrapRef.current.clientWidth : null;
    return Math.max(minWidth, w || minWidth + 140);
  })();

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

    const xs = vals.map(
      (_, i) =>
        padding.l + (i * innerW) / (vals.length - 1 || 1)
    );
    const ys = vals.map(
      (v) =>
        padding.t +
        (1 - (v - yMin) / (yMax - yMin)) * innerH
    );

    const pathD = xs
      .map((x, i) => `${i === 0 ? "M" : "L"} ${x},${ys[i]}`)
      .join(" ");
    const areaD = `${pathD} L ${
      xs.at(-1)
    },${height - padding.b} L ${xs[0]},${height - padding.b} Z`;

    const yTicks = Array.from({ length: 4 }, (_, i) => {
      const p = i / (4 - 1);
      const yVal = yMin + (1 - p) * (yMax - yMin);
      const yPix = padding.t + p * innerH;
      return {
        yPix,
        label: fmtK(
          Number.isInteger(yVal) ? yVal : +yVal.toFixed(1)
        ),
      };
    });

    const avg = vals.reduce((p, c) => p + c, 0) / vals.length;
    const avgY =
      padding.t +
      (1 - (avg - yMin) / (yMax - yMin)) * innerH;

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

  const lastVal = visibleData.at(-1)?.y ?? 0;

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
                range === key
                  ? "bg-slate-700/60 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {key === "all" ? "Todos" : key.toUpperCase()}
            </button>
          ))}
        </div>

        <label className="text-xs text-slate-300 flex items-center gap-2 ml-1">
          <input
            type="checkbox"
            checked={showPoints}
            onChange={(e) => setShowPoints(e.target.checked)}
          />
          Puntos
        </label>
        <label className="text-xs text-slate-300 flex items-center gap-2">
          <input
            type="checkbox"
            checked={smooth}
            onChange={(e) => setSmooth(e.target.checked)}
          />
          Suavizar (MA3)
        </label>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id={`grad-${svgId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillFrom} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
          <filter
            id={`glow-${svgId}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
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
            <line
              x1={padding.l}
              x2={width - padding.r}
              y1={t.yPix}
              y2={t.yPix}
              stroke={T.grid}
              strokeDasharray="2 4"
            />
            <text
              x={padding.l - 12}
              y={t.yPix + 4}
              textAnchor="end"
              fontSize="12"
              fill={T.axis}
            >
              {t.label}
            </text>
          </g>
        ))}
        <line
          x1={padding.l}
          x2={width - padding.r}
          y1={height - padding.b}
          y2={height - padding.b}
          stroke={T.grid}
        />

        {/* Área + línea */}
        <path
          d={calc.areaD}
          fill={`url(#grad-${svgId})`}
          opacity={mounted ? 1 : 0}
        />
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
        <line
          x1={padding.l}
          x2={width - padding.r}
          y1={calc.avgY}
          y2={calc.avgY}
          stroke="rgba(148,163,184,0.4)"
          strokeDasharray="6 6"
        />
        <text
          x={width - padding.r}
          y={calc.avgY - 6}
          textAnchor="end"
          fontSize="11"
          fill="rgba(226,232,240,0.8)"
        >
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
              <text
                x={x}
                y={calc.ys[i] - 10}
                textAnchor="middle"
                fontSize="12"
                fill={color}
              >
                {fmtK(visibleData[i].y)}
              </text>
            </g>
          ))}

        {/* Hover marker */}
        {hoverIdx != null && (
          <>
            <line
              x1={calc.xs[hoverIdx]}
              x2={calc.xs[hoverIdx]}
              y1={padding.t}
              y2={height - padding.b}
              stroke="#64748B"
              strokeDasharray="3 5"
            />
            <circle
              cx={calc.xs[hoverIdx]}
              cy={calc.ys[hoverIdx]}
              r={5.6}
              fill={color}
            />
            <circle
              cx={calc.xs[hoverIdx]}
              cy={calc.ys[hoverIdx]}
              r={2.8}
              fill="white"
            />
          </>
        )}

        {/* Eje X meses */}
        {visibleData.map((d, i) => (
          <text
            key={i}
            x={calc.xs[i]}
            y={height - padding.b + 22}
            textAnchor="middle"
            fontSize="12"
            fill={T.axis}
          >
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
            width={String(fmtK(lastVal)).length * 8 + 22}
            height="24"
            fill="rgba(15,23,42,0.9)"
            stroke="rgba(148,163,184,0.25)"
          />
          <text
            x={calc.xs.at(-1) + 18}
            y={calc.ys.at(-1)}
            dominantBaseline="middle"
            fontSize="12"
            fill="#E5E7EB"
          >
            {fmtK(lastVal)}
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
    <rect
      x="14"
      y="3"
      width="7"
      height="7"
      rx="2"
      fill="#94a3b8"
      opacity=".6"
    />
    <rect
      x="3"
      y="14"
      width="7"
      height="7"
      rx="2"
      fill="#94a3b8"
      opacity=".6"
    />
    <rect
      x="14"
      y="14"
      width="7"
      height="7"
      rx="2"
      fill="#94a3b8"
      opacity=".35"
    />
  </svg>
);

const Chip = ({ className = "", children }) => (
  <span className={`px-2.5 py-1 text-xs rounded-full ${className}`}>
    {children}
  </span>
);

const ChevronRight = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconClock = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
    />
    <path
      d="M12 7v6l4 2"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconAlert = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <path
      d="M12 3 3 21h18L12 3z"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinejoin="round"
    />
    <path
      d="M12 9v5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" />
  </svg>
);

/* ====== Cards ====== */
function Card({ title, children, className = "" }) {
  return (
    <article
      className={`rounded-2xl p-6 border shadow-sm ring-1 ring-white/5 ${className}`}
      style={{ background: T.cardBg }}
    >
      <h2 className="text-[14px] text-slate-200 font-semibold mb-4">
        {title}
      </h2>
      {children}
    </article>
  );
}

function ChartCard({ title, stat, delta, color, fillFrom, data }) {
  const trend = delta;
  return (
    <article
      className="rounded-2xl p-6 shadow-sm ring-1 ring-white/5"
      style={{ background: T.cardBg }}
    >
      <header className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[13px] uppercase tracking-wide text-slate-400 font-medium">
            {title}
          </h2>
          <p className="mt-1 text-2xl font-semibold text-slate-100">
            {stat}
          </p>
        </div>
        <span
          className={`mt-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
            trend >= 0
              ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
              : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
          }`}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(Math.round(trend))}%
        </span>
      </header>
      <p className="text-xs text-slate-400 mb-3">
        Comparado con el periodo anterior
      </p>
      <SparklinePro data={data} color={color} fillFrom={fillFrom} />
    </article>
  );
}

function HorizontalBarsCard({ title, subtitle, items = [] }) {
  return (
    <article
      className="rounded-2xl p-6 shadow-sm ring-1 ring-white/5"
      style={{ background: T.cardBg }}
    >
      <header className="mb-4">
        <h2 className="text-[14px] text-slate-200 font-semibold">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        )}
      </header>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.label}>
            <div className="flex items-center justify-between text-[13px] text-slate-300 mb-2">
              <span>{item.label}</span>
              <span className="font-semibold text-slate-100">
                {fmtK(item.value)}{" "}
                <span className="text-slate-400 text-[11px] font-normal">
                  ({item.percent}%)
                </span>
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-800/70 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(item.percent, 100)}%`,
                  background: item.color,
                  boxShadow: `0 0 16px ${item.color}55`,
                }}
              />
            </div>
            {typeof item.delta === "number" && (
              <p
                className={`mt-1 text-[11px] ${
                  item.delta >= 0
                    ? "text-emerald-300"
                    : "text-rose-300"
                }`}
              >
                {item.delta >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(item.delta)}% vs. mes anterior
              </p>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}

function DonutCard({ title, subtitle, segments = [] }) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const gradient = useMemo(() => {
    if (!segments.length || total === 0) {
      return "conic-gradient(#1e293b, #0f172a)";
    }
    let acc = 0;
    const parts = segments.map((seg) => {
      const start = (acc / total) * 100;
      acc += seg.value;
      const end = (acc / total) * 100;
      return `${seg.color} ${start}% ${end}%`;
    });
    return `conic-gradient(${parts.join(", ")})`;
  }, [segments, total]);

  return (
    <article
      className="rounded-2xl p-6 shadow-sm ring-1 ring-white/5"
      style={{ background: T.cardBg }}
    >
      <header className="mb-4">
        <h2 className="text-[14px] text-slate-200 font-semibold">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        )}
      </header>

      <div className="flex flex-col xl:flex-row items-center xl:items-start gap-6">
        <div className="relative h-40 w-40 flex-none">
          <div
            className="h-full w-full rounded-full"
            style={{
              background: gradient,
              boxShadow:
                "0 0 40px rgba(15,23,42,0.45) inset, 0 0 16px rgba(14,165,233,0.23)",
            }}
          />
          <div className="absolute inset-8 rounded-full bg-slate-950/80 backdrop-blur flex items-center justify-center flex-col text-slate-100">
            <span className="text-xl font-semibold">
              {fmtK(total)}
            </span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wide">
              Total
            </span>
          </div>
        </div>

        <ul className="flex-1 w-full space-y-3">
          {segments.map((seg) => {
            const p = total ? Math.round((seg.value / total) * 100) : 0;
            return (
              <li key={seg.label} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-8 rounded-full"
                  style={{
                    background: seg.color,
                    boxShadow: `0 0 12px ${seg.color}66`,
                  }}
                />
                <div>
                  <p className="text-sm text-slate-200 font-medium">
                    {seg.label}
                  </p>
                  <p className="text-xs text-slate-400">
                    {fmtK(seg.value)} proyectos · {p}%
                    {typeof seg.delta === "number" &&
                      ` · ${
                        seg.delta >= 0 ? "▲" : "▼"
                      } ${Math.abs(seg.delta)}%`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

/* ====== Card Proyectos ====== */
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
      if (ta != null && tb != null) return tb - ta;
      if (ta != null) return -1;
      if (tb != null) return 1;
      const ia = Number(a.id),
        ib = Number(b.id);
      if (!Number.isNaN(ia) && !Number.isNaN(ib)) return ib - ia;
      return b.__idx - a.__idx;
    });
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(proyectos.length / pageSize));
  const clampedPage = Math.min(page, totalPages - 1);
  const visible = proyectos.slice(
    clampedPage * pageSize,
    clampedPage * pageSize + pageSize
  );

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <Card title="Proyectos" className="border border-white/10">
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
              <span className="text-[12px] text-slate-400">
                Página {clampedPage + 1} de {totalPages}
              </span>
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
        <div className="px-4 py-3 text-sm text-slate-400">
          No hay proyectos creados.
        </div>
      ) : (
        <div className="rounded-xl">
          <ul className="divide-y divide-white/10">
            {visible.map((p) => (
              <li
                key={p.id ?? p.nombre}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 hover:ring-1 hover:ring-white/10 rounded-lg transition cursor-pointer"
                onClick={() => {
                  const target = p.id ?? p.nombre;
                  navigate(
                    `/autority/proyectos?id=${encodeURIComponent(
                      String(target)
                    )}`
                  );
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-slate-800/60 ring-1 ring-white/10">
                    <IconMiniGrid />
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-slate-200 truncate"
                      title={p.nombre ?? "Proyecto"}
                    >
                      {p.nombre ?? "Proyecto"}
                    </p>
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
                  {p.estado &&
                    String(p.estado).toLowerCase() !== "borrador" && (
                      <Chip className={chipFromEstado(p.estado)}>
                        {p.estado}
                      </Chip>
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

/* ====== Card Prioridad (usa reportes de la API que le pasan por props) ====== */
function PrioridadCard({ reports = [] }) {
  const navigate = useNavigate();
  const pageSize = 5;
  const [page, setPage] = useState(0);

  const urgOrder = { alta: 3, media: 2, baja: 1 };

  const sorted = useMemo(() => {
    return [...reports].sort((a, b) => {
      const ua = urgOrder[a.urgency] || 0;
      const ub = urgOrder[b.urgency] || 0;
      if (ub !== ua) return ub - ua;
      const v = (b.votes || 0) - (a.votes || 0);
      if (v !== 0) return v;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [reports]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const clampedPage = Math.min(page, totalPages - 1);
  const visible = sorted.slice(
    clampedPage * pageSize,
    clampedPage * pageSize + pageSize
  );

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
              <span className="text-[12px] text-slate-400">
                Página {clampedPage + 1} de {totalPages}
              </span>
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
        <div className="px-4 py-3 text-sm text-slate-400">
          No hay reportes.
        </div>
      ) : (
        <div className="rounded-xl">
          <ul className="divide-y divide-white/10">
            {visible.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 hover:ring-1 hover:ring-white/10 rounded-lg transition cursor-pointer"
                onClick={() =>
                  navigate(
                    `/autority/reportes?urg=${encodeURIComponent(
                      r.urgency || "todas"
                    )}&id=${encodeURIComponent(String(r.id))}`
                  )
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`inline-flex items-center justify-center h-9 w-9 rounded-lg ring-1 ${bubbleUrg(
                      r.urgency
                    )}`}
                  >
                    <IconAlert />
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-slate-200 truncate"
                      title={r.title || r.address || "Reporte"}
                    >
                      {r.title || r.address || "Reporte"}
                    </p>
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
                    {r.urgency === "alta"
                      ? "Muy importante"
                      : r.urgency === "media"
                      ? "Importante"
                      : "Normal"}
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

/* ====== Página Home de Autoridad ====== */
export default function HomeAU() {
  const [dataUsuarios, setDataUsuarios] = useState(DEFAULT_USUARIOS);
  const [dataReportes, setDataReportes] = useState(DEFAULT_REPORTES);
  const [dataVisitas, setDataVisitas] = useState(DEFAULT_VISITAS);
  const [proyectosAU, setProyectosAU] = useState([]);
  const [reportsAU, setReportsAU] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // Reportes + proyectos desde la API
        const [apiReports, apiProjects] = await Promise.all([
          getReportes(),
          getProjects({}),
        ]);

        if (!alive) return;

        const patchedReports = applyVotesPatch(
          Array.isArray(apiReports) ? apiReports : []
        );
        setReportsAU(patchedReports);

        const seriesReports = buildMonthlySeriesFromReports(patchedReports);
        setDataReportes(
          seriesReports.length ? seriesReports : DEFAULT_REPORTES
        );

        // Por ahora usuarios/visitas se mantienen con datos de ejemplo
        setDataUsuarios(DEFAULT_USUARIOS);
        setDataVisitas(DEFAULT_VISITAS);

        // Proyectos: API + locales
        const locales = loadLocalProjects();

        const createKey = (project) => {
          if (!project) return null;
          if (project.id !== undefined && project.id !== null) {
            return `id:${String(project.id)}`;
          }
          const name = (project.nombre || project.name || "")
            .trim()
            .toLowerCase();
          if (!name) return null;
          return `name:${name}`;
        };

        const dedup = new Map();
        for (const remote of Array.isArray(apiProjects)
          ? apiProjects
          : []) {
          if (!remote) continue;
          const key = createKey(remote);
          if (!key) continue;
          dedup.set(key, remote);
        }

        for (const local of Array.isArray(locales) ? locales : []) {
          if (!local) continue;
          const key = createKey(local);
          if (!key) continue;
          if (!dedup.has(key)) {
            dedup.set(key, local);
          }
        }

        setProyectosAU(Array.from(dedup.values()));
        setDataError(false);
      } catch (error) {
        console.error("Error cargando datos del panel de autoridad:", error);
        if (!alive) return;
        setDataUsuarios(DEFAULT_USUARIOS);
        setDataReportes(DEFAULT_REPORTES);
        setDataVisitas(DEFAULT_VISITAS);
        setProyectosAU(loadLocalProjects());
        setReportsAU([]);
        setDataError(true);
      } finally {
        if (alive) setLoadingData(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const urgencyBreakdown = useMemo(() => {
    if (!reportsAU.length) return [];
    const counts = { alta: 0, media: 0, baja: 0 };
    reportsAU.forEach((r) => {
      const u = String(r.urgency || "").toLowerCase();
      if (u === "alta") counts.alta += 1;
      else if (u === "media") counts.media += 1;
      else counts.baja += 1;
    });

    const total = counts.alta + counts.media + counts.baja || 1;

    return [
      {
        label: "Alta prioridad",
        value: counts.alta,
        percent: Math.round((counts.alta / total) * 100),
        color: "rgba(248,113,113,0.85)",
        delta: 4,
      },
      {
        label: "Media prioridad",
        value: counts.media,
        percent: Math.round((counts.media / total) * 100),
        color: "rgba(251,191,36,0.85)",
        delta: 2,
      },
      {
        label: "Baja prioridad",
        value: counts.baja,
        percent: Math.round((counts.baja / total) * 100),
        color: "rgba(96,165,250,0.85)",
        delta: -3,
      },
    ];
  }, [reportsAU]);

  const projectStatusSegments = useMemo(() => {
    if (!proyectosAU.length) {
      return [
        { label: "En ejecución", value: 9, color: "#6366F1", delta: 6 },
        { label: "En planificación", value: 5, color: "#22D3EE", delta: 2 },
        { label: "Cerrados", value: 3, color: "#34D399", delta: 1 },
      ];
    }
    const counts = { enCurso: 0, planificacion: 0, cerrados: 0 };
    proyectosAU.forEach((p) => {
      const estado = String(p?.estado || "").toLowerCase();
      if (estado.includes("plan")) counts.planificacion += 1;
      else if (
        estado.includes("final") ||
        estado.includes("complet") ||
        estado.includes("cerr")
      )
        counts.cerrados += 1;
      else counts.enCurso += 1;
    });
    return [
      { label: "En ejecución", value: counts.enCurso, color: "#6366F1" },
      {
        label: "En planificación",
        value: counts.planificacion,
        color: "#22D3EE",
      },
      { label: "Cerrados", value: counts.cerrados, color: "#34D399" },
    ];
  }, [proyectosAU]);

  if (loadingData) {
    return (
      <AutorityLayout>
        <div className="min-h-full flex items-center justify-center text-slate-300">
          Cargando panel de autoridad…
        </div>
      </AutorityLayout>
    );
  }

  return (
    <AutorityLayout>
      <div className="space-y-6 font-sans">
        {dataError && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            No se pudieron cargar todos los datos desde la API. Mostrando
            información de ejemplo.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* 🔻 AQUÍ YA NO ESTÁ EL GRÁFICO DE USUARIOS */}

          <div className="xl:col-span-4">
            <ChartCard
              title="Informe de Reportes"
              stat={`${dataReportes.at(-1).y} reportes`}
              delta={pct(dataReportes.map((d) => d.y))}
              color={T.reports}
              fillFrom="rgba(34,211,238,0.28)"
              data={dataReportes}
            />
          </div>

          <div className="xl:col-span-4">
            <ChartCard
              title="Informe de Visitas"
              stat={`${dataVisitas.at(-1).y} visitas`}
              delta={pct(dataVisitas.map((d) => d.y))}
              color={T.visits}
              fillFrom="rgba(96,165,250,0.28)"
              data={dataVisitas}
            />
          </div>

          <div className="xl:col-span-6">
            <DonutCard
              title="Estado de proyectos"
              subtitle="Distribución entre iniciativas activas, planificación y cierre"
              segments={projectStatusSegments}
            />
          </div>

          <div className="xl:col-span-6">
            <HorizontalBarsCard
              title="Carga por urgencia"
              subtitle="Reportes activos clasificados por nivel de atención"
              items={urgencyBreakdown}
            />
          </div>

          <div className="xl:col-span-7">
            <ProyectosCard items={proyectosAU} />
          </div>
          <div className="xl:col-span-5">
            <PrioridadCard reports={reportsAU} />
          </div>
        </div>
      </div>
    </AutorityLayout>
  );
}
