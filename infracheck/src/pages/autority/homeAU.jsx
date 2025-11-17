import React, {
  useId,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { useTheme } from "../../themes/ThemeContext";
import { useNavigate } from "react-router-dom";
import { getReportes } from "../../services/reportsService";
import { getProjects } from "../../services/projectsService";
import AutorityLayout from "../../layout/AutorityLayout";
import { getUserData } from "../../services/authService";
import Tag from "../../components/Tag";
import SparklinePro from "../../components/SparklinePro";

/* ====== Helpers y Datos por Defecto ====== */
const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const make = (arr) => arr.map((v, i) => ({ mes: meses[i], y: v }));

// Datos de fallback (por si la API falla)
const DEFAULT_USUARIOS = make([5, 12, 8, 15, 14, 20, 26, 22, 18, 18, 18, 18]);
const DEFAULT_REPORTES = make([2, 10, 6, 9, 8, 18, 24, 17, 19, 19, 19, 19]);
const DEFAULT_VISITAS = make([3, 7, 5, 4, 12, 9, 21, 16, 17, 17, 17, 17]);

const fmtK = (n) =>
  Math.abs(n) >= 1e6
    ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
    : Math.abs(n) >= 1e3
    ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k"
    : String(n);

const fmtPct = (n) => `${Math.round(n)}%`;

const pct = (arr) => {
  const a = arr.at(-2) || 0;
  const b = arr.at(-1) || 0;
  if (a === 0) return b > 0 ? 100 : 0;
  return ((b - a) / a) * 100;
};

const ma = (arr, window = 3) => {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = arr.slice(start, i + 1);
    const avg = slice.reduce((s, v) => s + v, 0) / slice.length;
    result.push(avg);
  }
  return result;
};

const buildMonthlySeriesFromReports = (reports) => {
  if (!Array.isArray(reports) || reports.length === 0) return [];
  const counts = new Array(12).fill(0);
  reports.forEach((r) => {
    try {
      const d = r.createdAt ? new Date(r.createdAt) : null;
      if (d && !isNaN(d.getTime())) {
        const month = d.getMonth();
        if (month >= 0 && month < 12) counts[month] += 1;
      }
    } catch {}
  });
  return make(counts);
};

/* ====== Tokens ====== */
const getTokens = (theme) => ({
  cardBg: theme === "dark" ? "#121B2B" : "#FFFFFF",
  grid: theme === "dark" ? "#3A4A63" : "#E0E0E0",
  axis: theme === "dark" ? "#E2E8F0" : "#333333",
  tooltipBg: theme === "dark" ? "bg-slate-900/95" : "bg-white/95",
  tooltipBorder: theme === "dark" ? "border-slate-700" : "border-gray-300",
  users: "#818CF8",
  fillFromUsers: theme === "dark" ? "rgba(129,140,248,0.3)" : "rgba(129,140,248,0.1)",
  reports: "#22D3EE",
  fillFromReports: theme === "dark" ? "rgba(34,211,238,0.3)" : "rgba(34,211,238,0.1)",
  visits: "#60A5FA",
  fillFromVisits: theme === "dark" ? "rgba(96,165,250,0.3)" : "rgba(96,165,250,0.1)",
  chip: {
    progreso: theme === "dark" ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30" : "bg-sky-100 text-sky-700 ring-1 ring-sky-300",
    completo: theme === "dark" ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30" : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300",
    pendiente: theme === "dark" ? "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/30" : "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-300",
    aprobado: theme === "dark" ? "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30" : "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300",
    rechazado: theme === "dark" ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30" : "bg-rose-100 text-rose-700 ring-1 ring-rose-300",

    prioridad_alta: theme === "dark" ? "bg-rose-600/15 text-rose-300 ring-1 ring-rose-400/30" : "bg-rose-100 text-rose-700 ring-1 ring-rose-300",
    prioridad_media: theme === "dark" ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30" : "bg-amber-100 text-amber-700 ring-1 ring-amber-300",
    prioridad_normal: theme === "dark" ? "bg-sky-600/15 text-sky-300 ring-1 ring-sky-400/30" : "bg-sky-100 text-sky-700 ring-1 ring-sky-300",
  },
});

/* ====== Helpers UI ====== */
const IconMiniGrid = ({ theme, ...props }) => {
  const fillColor = theme === "dark" ? "#94a3b8" : "#6B7280";
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="2" fill={fillColor} />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="2"
        fill={fillColor}
        opacity=".6"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="2"
        fill={fillColor}
        opacity=".6"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="2"
        fill={fillColor}
        opacity=".35"
      />
    </svg>
  );
};

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

const BrandLine = ({ variant = "secondary", className = "" }) => (
  <div
    aria-hidden="true"
    className={`${variant === "primary" ? "brand-line-primary" : "brand-line-secondary"} ${className}`}
  />
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
      d="M12 9v6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />

  </svg>
);

/* ====== Cards ====== */
function Card({ T, theme, title, children, className = "" }) {
  const headingId = useId();
  return (
    <article
      role="region"
      aria-labelledby={headingId}
      className={`relative rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-shadow ring-1 ${theme === "dark" ? "ring-white/10" : "ring-gray-300"} ${className}`}
      style={{ background: T.cardBg }}
    >
      <h2 id={headingId} className={`text-[18px] md:text-[20px] font-semibold bg-clip-text text-transparent tracking-tight ${theme === "dark" ? "bg-gradient-to-r from-slate-100 to-slate-300" : "bg-gradient-to-r from-gray-700 to-gray-900"}`} style={{animation:'fadeUp 500ms ease-out both'}}>
        {title}
      </h2>
      {children}
    </article>
  );
}

function ChartCard({ T, id, title, stat, delta, color, fillFrom, data, asPercent = false, theme }) {
  const trend = delta;
  return (
    <article id={id}
      className={`rounded-2xl p-6 shadow-sm ring-1 ${theme === "dark" ? "ring-white/10" : "ring-gray-300"} min-h-[460px]`}
      style={{ background: T.cardBg }}
    >
      <header className="flex items-start justify-between mb-4">
        <div>
          <h2 className={`text-[14px] uppercase tracking-wide font-medium ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
            {title}
          </h2>
          <p className={`mt-1 text-3xl font-semibold ${theme === "dark" ? "text-slate-100" : "text-gray-900"}`}>
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
      <p className={`text-[12px] mb-3 ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
        Comparado con el periodo anterior
      </p>
      <SparklinePro T={T} data={data} color={color} fillFrom={fillFrom} height={380} minWidth={720} padding={{ t: 20, r: 36, b: 60, l: 60 }} asPercent={asPercent} theme={theme} />
      <div className="mt-3" />
    </article>
  );
}

function HorizontalBarsCard({ T, theme, title, subtitle, items = [] }) {
  const totalBars = items.reduce((s, i) => s + (i?.value || 0), 0);
  const topBar = items.reduce((acc, cur) => (cur?.value > (acc?.value || 0) ? cur : acc), null);
  return (
    <article
      className={`rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow ring-1 ${theme === "dark" ? "ring-white/10" : "ring-gray-300"} min-h-[360px]`}
      style={{ background: T.cardBg }}
    >
      <header className="mb-4">
        <h2 className={`text-[14px] font-semibold ${theme === "dark" ? "text-slate-200" : "text-gray-800"}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>{subtitle}</p>
        )}
      </header>
      
        <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.label} className="group" style={{animation:'fadeUp 500ms ease-out both'}}>
            <div className={`flex items-center justify-between text-[13px] mb-1 ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
              <span className={`inline-flex items-center gap-2 font-medium ${theme === "dark" ? "text-slate-200" : "text-gray-800"}`}>
                <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white/10" style={{ background: item.color }} />
                {item.label}
              </span>
              <span className="inline-flex items-center gap-2">
                {typeof item.delta === "number" && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ring-1 ${
                    item.delta >= 0
                      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                      : "bg-rose-500/15 text-rose-300 ring-rose-400/30"
                  }`}>
                    {item.delta >= 0 ? "▲" : "▼"} {Math.abs(item.delta)}%
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[11px] ${theme === "dark" ? "bg-slate-800/60 ring-white/10 text-slate-200" : "bg-gray-200/60 ring-gray-300 text-gray-800"}`}>
                  {fmtK(item.value)} ({item.percent}%)
                </span>
              </span>
            </div>
            <div className={`relative h-5 w-full rounded-full overflow-hidden ring-1 ${theme === "dark" ? "bg-slate-900/40 ring-white/10" : "bg-gray-200/40 ring-gray-300"}`}>
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-700 ease-out group-hover:brightness-110"
                style={{
                  width: `${Math.min(item.percent, 100)}%`,
                  background: `linear-gradient(to right, ${item.color}, ${item.color}99)`,
                  boxShadow: `0 0 16px ${item.color}55`,
                }}
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-white/90">
                {item.percent}%
              </div>
              <div className={`absolute right-2 top-1/2 -translate-y-1/2 text-[11px] ${theme === "dark" ? "text-slate-200" : "text-gray-800"}`}>
                {fmtK(item.value)}
              </div>
            </div>
          </li>
        ))}
        </ul>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className={`rounded-lg px-3 py-2 ring-1 ${theme === "dark" ? "bg-slate-800/50 ring-white/10 text-slate-300" : "bg-gray-200/50 ring-gray-300 text-gray-700"}`}>
          Total <span className={`font-semibold ${theme === "dark" ? "text-slate-100" : "text-gray-900"}`}>{fmtK(totalBars)}</span>
        </div>
        <div className={`rounded-lg px-3 py-2 ring-1 ${theme === "dark" ? "bg-slate-800/50 ring-white/10 text-slate-300" : "bg-gray-200/50 ring-gray-300 text-gray-700"}`}>
          Más frecuente <span className={`font-semibold ${theme === "dark" ? "text-slate-100" : "text-gray-900"}`}>{topBar?.label || '-'}</span>
        </div>
        <div className="col-span-2 mt-1 h-0" />
      </div>
    </article>
  );
}

function DonutCard({ T, theme, title, subtitle, segments = [] }) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const [focused, setFocused] = useState(null);
  const gradient = useMemo(() => {
    if (!segments.length || total === 0) {
      return theme === "dark" ? "conic-gradient(#1e293b, #0f172a)" : "conic-gradient(#E0E0E0, #FFFFFF)";
    }
    let acc = 0;
    const parts = segments.map((seg) => {
      const start = (acc / total) * 100;
      acc += seg.value;
      const end = (acc / total) * 100;
      const col = focused && focused !== seg.label ? "#0f172a" : seg.color;
      return `${col} ${start}% ${end}%`;
    });
    return `conic-gradient(${parts.join(", ")})`;
  }, [segments, total, focused, theme]);

  const topSeg = segments.reduce((acc, cur) => (cur?.value > (acc?.value || 0) ? cur : acc), null);
  return (
    <article
      className={`rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow ring-1 ${theme === "dark" ? "ring-white/10" : "ring-gray-300"} min-h-[360px]`}
      style={{ background: T.cardBg }}
    >
      <header className="mb-4">
        <h2 className={`text-[14px] font-semibold ${theme === "dark" ? "text-slate-200" : "text-gray-800"}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>{subtitle}</p>
        )}
      </header>
      

      <div className="flex flex-col xl:flex-row items-center xl:items-start gap-4">
        <div className="relative h-44 w-44 flex-none">
          <div
            className="h-full w-full rounded-full"
            style={{
              background: gradient,
              boxShadow:
                "0 0 40px rgba(15,23,42,0.55) inset, 0 0 18px rgba(14,165,233,0.28)",
            }}
          />
          <div className={`absolute inset-10 rounded-full backdrop-blur flex items-center justify-center flex-col ring-1 ${theme === "dark" ? "bg-slate-950/80 text-slate-100 ring-white/10" : "bg-white/80 text-gray-900 ring-gray-300"}`}>
            <span className="text-xl font-semibold">
              {fmtK(total)}
            </span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wide">
              Total
            </span>
          </div>
          <div className={`absolute inset-0 rounded-full ring-1 ${theme === "dark" ? "ring-white/10" : "ring-gray-300"} pointer-events-none`} />
        </div>

        <ul className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-2">
          {segments.map((seg) => {
            const p = total ? Math.round((seg.value / total) * 100) : 0;
            return (
              <li key={seg.label} className={`group flex items-center justify-between px-3 py-2 rounded-lg ring-1 hover:transition cursor-pointer duration-200 ${theme === "dark" ? "bg-slate-900/40 ring-white/10 hover:bg-slate-900/60" : "bg-gray-100/40 ring-gray-300 hover:bg-gray-200/60"}`}>
                <button type="button" onClick={() => setFocused(focused === seg.label ? null : seg.label)} className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white/10" style={{ background: seg.color }} />
                  <span className={`text-sm font-medium ${theme === "dark" ? "text-slate-200" : "text-gray-800"}`}>{seg.label}</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ring-1 ${theme === "dark" ? "bg-slate-800/60 ring-white/10 text-slate-200" : "bg-gray-200/60 ring-gray-300 text-gray-800"}`}>
                    {fmtK(seg.value)} · {p}%
                  </span>
                  {typeof seg.delta === "number" && (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] ring-1 ${
                      seg.delta >= 0
                        ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                        : "bg-rose-500/15 text-rose-300 ring-rose-400/30"
                    }`}>
                      {seg.delta >= 0 ? "▲" : "▼"} {Math.abs(seg.delta)}%
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {focused && (
          <div className="mt-3 flex items-center gap-2">
            <Tag tone="purple">Estado seleccionado: {focused}</Tag>
            <Tag tone="slate" onClick={() => setFocused(null)}>Limpiar</Tag>
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div className={`rounded-lg px-3 py-2 ring-1 ${theme === "dark" ? "bg-slate-800/50 ring-white/10 text-slate-300" : "bg-gray-200/50 ring-gray-300 text-gray-700"}`}>
          Total <span className={`font-semibold ${theme === "dark" ? "text-slate-100" : "text-gray-900"}`}>{fmtK(total)}</span>
        </div>
        <div className={`rounded-lg px-3 py-2 ring-1 ${theme === "dark" ? "bg-slate-800/50 ring-white/10 text-slate-300" : "bg-gray-200/50 ring-gray-300 text-gray-700"}`}>
          Más frecuente <span className={`font-semibold ${theme === "dark" ? "text-slate-100" : "text-gray-900"}`}>{topSeg?.label || '-'}</span>
        </div>
        <div className={`rounded-lg px-3 py-2 ring-1 ${theme === "dark" ? "bg-slate-800/50 ring-white/10 text-slate-300" : "bg-gray-200/50 ring-gray-300 text-gray-700"}`}>
          Estados <span className={`font-semibold ${theme === "dark" ? "text-slate-100" : "text-gray-900"}`}>{segments.length}</span>
        </div>
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

const chipFromEstado = (T, estado) => {
  if (!T || !T.chip) return "bg-slate-700/40 text-slate-300 ring-1 ring-white/10";
  const s = String(estado || "").toLowerCase();
  if (s.includes("progreso")) return T.chip.progreso;
  if (s.includes("complet")) return T.chip.completo;
  if (s.includes("pend")) return T.chip.pendiente;
  if (s.includes("aprob")) return T.chip.aprobado;
  if (s.includes("rechaz")) return T.chip.rechazado;
  if (s.includes("borrador")) return T.chip.pendiente;
  return "bg-slate-700/40 text-slate-300 ring-1 ring-white/10";
};

function ProyectosCard({ T, theme, items = [] }) {
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
    <Card T={T} theme={theme} title="Proyectos" className={`min-h-[480px] ${theme === "dark" ? "border border-white/10" : "border border-gray-300"}`}>
      <div className="mb-3 flex items-center justify-end">
        <div className="flex items-center gap-2">
          {proyectos.length > pageSize && (
            <div className="flex items-center gap-2">
              <button
                className={`px-2.5 py-1 text-xs rounded-md ring-1 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === "dark" ? "bg-white/5 hover:bg-white/10 ring-white/15" : "bg-gray-100 hover:bg-gray-200 ring-gray-300"}`}
                onClick={prev}
                disabled={clampedPage === 0}
              >
                Anterior
              </button>
              <span className={`text-[12px] ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                Página {clampedPage + 1} de {totalPages}
              </span>
              <button
                className={`px-2.5 py-1 text-xs rounded-md ring-1 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === "dark" ? "bg-white/5 hover:bg-white/10 ring-white/15" : "bg-gray-100 hover:bg-gray-200 ring-gray-300"}`}
                onClick={next}
                disabled={clampedPage >= totalPages - 1}
              >
                Siguiente
              </button>
            </div>
          )}
          <button
            className="px-2.5 py-1 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => navigate("/autority/proyectos")}
          >
            Abrir Proyectos
          </button>
        </div>
      </div>

      {proyectos.length === 0 ? (
        <div className={`px-4 py-3 text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
          No hay proyectos creados.
        </div>
      ) : (
        <div className="rounded-xl">
          <ul className="space-y-1.5">
            {visible.map((p, idx) => (
              <li
                key={p.id ?? p.nombre}
                style={{animation:'fadeUp 500ms ease-out both',animationDelay:`${idx*60}ms`}}
                className={`group flex items-center justify-between gap-3 px-4 py-2.5 min-h-[60px] ring-1 rounded-xl transition cursor-pointer duration-200 hover:translate-y-[1px] hover:shadow-md ${theme === "dark" ? "bg-slate-900/40 ring-white/10 hover:bg-slate-900/60 hover:ring-indigo-400/30" : "bg-gray-100/40 ring-gray-300 hover:bg-gray-200/60 hover:ring-indigo-400/30"}`}
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
                  <span className={`inline-flex items-center justify-center h-9 w-9 rounded-lg ring-1 shadow-sm ${theme === "dark" ? "bg-gradient-to-br from-slate-800 to-slate-900 ring-white/10" : "bg-gradient-to-br from-gray-200 to-gray-300 ring-gray-300"}`}>
                    <IconMiniGrid theme={theme} />
                  </span>
                  <div className="min-w-0">
                    <p
                     className={`text-[15px] font-semibold truncate ${theme === "dark" ? "text-slate-100" : "text-gray-900"}`}
                      title={p.nombre ?? "Proyecto"}
                    >
                      {p.nombre ?? "Proyecto"}
                    </p>
                    <div className="flex items-center gap-3">
                      {p.descripcion && (
                        <p
                         className={`text-[12px] whitespace-nowrap overflow-hidden text-ellipsis ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}
                          title={p.descripcion}
                        >
                          {p.descripcion}
                        </p>
                      )}
                      {p.lugar && (
                        <span
                         className={`text-[11px] whitespace-nowrap overflow-hidden text-ellipsis ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}
                          title={p.lugar}
                        >
                          · {p.lugar}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-none shrink-0">
                  {p.createdAt && (
                    <span className={`flex items-center gap-1 text-[12px] flex-none shrink-0 ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                      <IconClock />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {p.estado &&
                    String(p.estado).toLowerCase() !== "borrador" && (
                      <Chip className={chipFromEstado(T, p.estado)}>
                        {p.estado}
                      </Chip>
                    )}
                  {p.prioridad && (
                    <span className={`px-2 py-0.5 text-[11px] rounded-full ring-1 ${theme === "dark" ? "bg-slate-800/60 ring-white/10 text-slate-300" : "bg-gray-200/60 ring-gray-300 text-gray-700"}`}>
                      {p.prioridad}
                    </span>
                  )}
                  <span className={`transition-opacity duration-200 opacity-60 group-hover:opacity-100 ${theme === "dark" ? "text-slate-400 group-hover:text-slate-200" : "text-gray-600 group-hover:text-gray-800"}`}>
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
export function PrioridadCard({ T, theme, reports = [] }) {
  const navigate = useNavigate();
  const pageSize = 5;
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const urgOrder = { alta: 3, media: 2, baja: 1 };
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

  const chipUrg = (u) => {
    if (!T || !T.chip) return "bg-slate-700/40 text-slate-300 ring-1 ring-white/10";
    return u === "alta"
      ? T.chip.prioridad_alta
      : u === "media"
      ? T.chip.prioridad_media
      : T.chip.prioridad_normal;
  };

  const bubbleUrg = (u) =>
    u === "alta"
      ? theme === "dark"
        ? "bg-rose-600/25 ring-rose-400/40 text-rose-300"
        : "bg-rose-100 ring-rose-300 text-rose-700"
      : u === "media"
      ? theme === "dark"
        ? "bg-amber-500/25 ring-amber-400/40 text-amber-300"
        : "bg-amber-100 ring-amber-300 text-amber-700"
      : theme === "dark"
        ? "bg-sky-600/25 ring-sky-400/40 text-sky-300"
        : "bg-sky-100 ring-sky-300 text-sky-700";

  const chipStatus = (s) => {
    const k = String(s || "").toLowerCase();
    if (k.includes("proceso")) return T.chip.progreso;
    if (k.includes("resuelto") || k.includes("final")) return T.chip.completo;
    if (k.includes("pend")) return T.chip.pendiente;
    return theme === "dark"
      ? "bg-slate-700/40 text-slate-300 ring-1 ring-white/10"
      : "bg-gray-200 text-gray-700 ring-1 ring-gray-300";
  };

  const isRecent = (d) => {
    if (!d) return false;
    const ts = new Date(d).getTime();
    if (Number.isNaN(ts)) return false;
    const diff = Date.now() - ts;
    if (diff < 0) return false;
    return diff < 3 * 24 * 60 * 60 * 1000;
  };

  return (
    <Card T={T} theme={theme} title="Prioridad" className="border border-white/10 min-h-[480px]">
      <div className="mb-3 flex items-center justify-end">
        <div className="flex items-center gap-2">
          {sorted.length > pageSize && (
            <div className="flex items-center gap-2">
              <button
                className={`px-2.5 py-1 text-xs rounded-md ${theme === "dark" ? "bg-white/5 hover:bg-white/10 ring-1 ring-white/15" : "bg-gray-100 hover:bg-gray-200 ring-1 ring-gray-300"} disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={clampedPage === 0}
              >
                Anterior
              </button>
              <span className={`text-[12px] ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                Página {clampedPage + 1} de {totalPages}
              </span>
              <button
                className={`px-2.5 py-1 text-xs rounded-md ${theme === "dark" ? "bg-white/5 hover:bg-white/10 ring-1 ring-white/15" : "bg-gray-100 hover:bg-gray-200 ring-1 ring-gray-300"} disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={clampedPage >= totalPages - 1}
              >
                Siguiente
              </button>
            </div>
          )}
          <button
            className={`px-2.5 py-1 text-xs rounded-md ${theme === "dark" ? "bg-cyan-600 hover:bg-cyan-500" : "bg-cyan-500 hover:bg-cyan-600"} shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500`}
            onClick={() => navigate("/autority/reportes")}
          >
            Abrir Reportes
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className={`px-4 py-3 text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
          No hay reportes.
        </div>
      ) : (
        <div className="rounded-xl">
          <ul className="space-y-1.5">
            {visible.map((r, idx) => (
              <li
                key={r.id}
                style={{animation:'fadeUp 500ms ease-out both',animationDelay:`${idx*60}ms`}}
                className={`group flex items-center justify-between gap-3 px-4 py-2.5 min-h-[60px] ring-1 rounded-xl transition cursor-pointer duration-200 hover:translate-y-[1px] hover:shadow-md ${theme === "dark" ? "bg-slate-900/40 ring-white/10 hover:bg-slate-900/60 hover:ring-cyan-400/30" : "bg-gray-100/40 ring-gray-300 hover:bg-gray-200/60 hover:ring-cyan-400/30"}`}
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
                      className={`text-[15px] font-semibold truncate ${theme === "dark" ? "text-slate-100" : "text-gray-900"}`}
                      title={r.title || r.address || "Reporte"}
                    >
                      {r.title || r.address || "Reporte"}
                    </p>
                    <div className="flex items-center gap-3">
                      {r.address && (
                        <span
                          className={`flex-1 min-w-0 text-[12px] whitespace-nowrap overflow-hidden text-ellipsis ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}
                          title={r.address}
                        >
                          {r.address}
                        </span>
                      )}
                      {r.createdAt && (
                        <span className={`flex items-center gap-1 text-[12px] flex-none shrink-0 ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                          <IconClock />
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {isRecent(r.createdAt) && (
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-fuchsia-600/20 text-fuchsia-300 ring-1 ring-fuchsia-400/30 flex-none shrink-0">
                          Nuevo
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
                  {r.status && (
                    <Chip className={chipStatus(r.status)}>
                      {r.status === "en_proceso"
                        ? "En proceso"
                        : r.status === "resuelto"
                        ? "Finalizado"
                        : "Pendiente"}
                    </Chip>
                  )}
                  <span className={`transition-opacity duration-200 opacity-60 group-hover:opacity-100 ${theme === "dark" ? "text-slate-400 group-hover:text-slate-200" : "text-gray-600 group-hover:text-gray-800"}`}>
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
export default function HomeAU() {

  const { theme } = useTheme();
  const u = getUserData ? getUserData() : null;
  const nombre = u?.nombre || u?.name || u?.username || "Autoridad";
  const hoy = new Date().toLocaleDateString();
  const T = theme ? getTokens(theme) : { chip: { progreso: "", completo: "", pendiente: "", aprobado: "", rechazado: "" } };
  const navigate = useNavigate();
  const WELCOME_SKIN = "minimal";
  const [dataReportes, setDataReportes] = useState(DEFAULT_REPORTES);
  const [dataVisitas, setDataVisitas] = useState(DEFAULT_VISITAS);
  const [proyectosAU, setProyectosAU] = useState([]);
  const [reportsAU, setReportsAU] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(false);
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "InfraCheck",
    "url": "https://infracheck.local/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://infracheck.local/autority/reportes?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

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

        const onlyApiReports = Array.isArray(apiReports) ? apiReports : [];
        setReportsAU(onlyApiReports);

        const seriesReports = buildMonthlySeriesFromReports(onlyApiReports);
        setDataReportes(
          seriesReports.length ? seriesReports : DEFAULT_REPORTES
        );

        // Por ahora visitas se mantienen con datos de ejemplo
        setDataVisitas(DEFAULT_VISITAS);

        // Proyectos solo desde API
        setProyectosAU(Array.isArray(apiProjects) ? apiProjects : []);
        setDataError(false);
      } catch (error) {
        console.error("Error cargando datos del panel de autoridad:", error);
        if (!alive) return;
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
        label: "Alta prioridad 🚨",
        value: counts.alta,
        percent: Math.round((counts.alta / total) * 100),
        color: "#f43f5e",
        delta: 4,
      },
      {
        label: "Media prioridad ⚠️",
        value: counts.media,
        percent: Math.round((counts.media / total) * 100),
        color: "#f59e0b",
        delta: 2,
      },
      {
        label: "Baja prioridad ✅",
        value: counts.baja,
        percent: Math.round((counts.baja / total) * 100),
        color: "#22c55e",
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
      <div className="space-y-4 font-sans">
        <style>{`@keyframes fadeUp{from{opacity:.0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spinSlow{from{transform:rotate(0)}to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}`}</style>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
        {dataError && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            No se pudieron cargar todos los datos desde la API. Mostrando
            información de ejemplo.
          </div>
        )}

        <Card T={T} theme={theme}
              title={<span className="text-inherit" style={{ fontFamily: '"Segoe UI", Inter, system-ui, -apple-system' }}>Bienvenido, {nombre}</span>}
              className={`border ${theme === "dark" ? "border-white/10" : "border-gray-300"}`}
            >
              {(() => {
                const currentMonthIndex = new Date().getMonth();
                const currentReports = dataReportes?.[currentMonthIndex]?.y ?? 0;
                const currentVisits = dataVisitas?.[currentMonthIndex]?.y ?? 0;
                const deltaReports = pct(
                  (dataReportes || [])
                    .map((d) => d.y)
                    .slice(0, Math.min(currentMonthIndex + 1, 12))
                );
                const deltaVisits = pct(
                  (dataVisitas || [])
                    .map((d) => d.y)
                    .slice(0, Math.min(currentMonthIndex + 1, 12))
                );
                return (
                  <>
                  <p className={`mt-1 text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>Tu resumen del día y accesos rápidos</p>
                  <div className={`mt-2 ${WELCOME_SKIN === 'minimal' ? '' : 'px-4 py-3'} ${WELCOME_SKIN === 'gradient' ? (theme === "dark" ? 'rounded-lg bg-gradient-to-r from-slate-900/60 to-slate-800/40 ring-1 ring-white/10' : 'rounded-lg bg-gradient-to-r from-gray-100/60 to-gray-200/40 ring-1 ring-gray-300/50') : WELCOME_SKIN === 'glass' ? (theme === "dark" ? 'rounded-lg bg-white/[0.03] backdrop-blur-sm ring-1 ring-white/10' : 'rounded-lg bg-gray-100/[0.6] backdrop-blur-sm ring-1 ring-gray-300/50') : ''} flex flex-wrap items-center gap-3 text-sm ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                    <Tag theme={theme} tone="slate" style={{animation:'fadeUp 500ms ease-out both',animationDelay:'60ms'}}><IconClock className="w-4 h-4" /> 🗓️ Hoy: {hoy}</Tag>
                    <Tag theme={theme} tone="indigo" style={{animation:'fadeUp 500ms ease-out both',animationDelay:'120ms'}}><IconMiniGrid theme={theme} className="w-4 h-4" /> 📁 Proyectos: {proyectosAU.length}</Tag>
                    <Tag theme={theme} tone="cyan" style={{animation:'fadeUp 500ms ease-out both',animationDelay:'180ms'}}><IconAlert className="w-4 h-4" /> ⚠️ Reportes: {reportsAU.length}</Tag>
                    <Tag theme={theme} tone={dataError ? "rose" : "emerald"} style={{animation:'fadeUp 500ms ease-out both',animationDelay:'240ms'}}>{dataError ? "🧪 Modo demo" : "⚡ Datos en vivo"}</Tag>
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        label: "Reportes ⚠️",
                        value: currentReports,
                        color: T.reports,
                        icon: IconAlert,
                        href: "/autority/reportes",
                      },
                      {
                        label: "Visitas 👀",
                        value: currentVisits,
                        color: T.visits,
                        icon: IconClock,
                        href: "/autority/reportes",
                      },
                      {
                        label: "Urgentes 🚨",
                        value: reportsAU.filter((r) => String(r.urgency).toLowerCase() === "alta").length,
                        color: "#ef4444",
                        icon: IconAlert,
                        href: "/autority/reportes?urg=alta",
                      },
                    ].map((k, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => navigate(k.href)}
                        className="group rounded-xl p-3 bg-slate-900/40 ring-1 ring-white/10 hover:bg-slate-900/60 hover:ring-white/20 transition text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-slate-300">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: k.color }} />
                            {k.label}
                          </span>
                          <span className="text-slate-200 text-lg font-semibold">{fmtK(k.value)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  </>
                );
              })()}
            </Card>


        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          

        <div className="xl:col-span-6">
          {(() => {
            const currentMonthIndex = new Date().getMonth();
            const currentVal = dataReportes?.[currentMonthIndex]?.y ?? 0;
            const seriesVals = (dataReportes || []).map((d) => d.y).slice(0, Math.min(currentMonthIndex + 1, 12));
            return (
              <ChartCard
                id="chart-reportes"
                title="Informe de Reportes"
                stat={`${currentVal} reportes`}
                delta={pct(seriesVals)}
                color={T.reports}
                fillFrom="rgba(34,211,238,0.28)"
                data={dataReportes}
                asPercent
                theme={theme}
                T={T}
              />
            );
          })()}
        </div>

        <div className="xl:col-span-6">
          {(() => {
            const currentMonthIndex = new Date().getMonth();
            const currentVal = dataVisitas?.[currentMonthIndex]?.y ?? 0;
            const seriesVals = (dataVisitas || []).map((d) => d.y).slice(0, Math.min(currentMonthIndex + 1, 12));
            return (
              <ChartCard
                id="chart-visitas"
                title="Informe de Visitas"
                stat={`${currentVal} visitas`}
                delta={pct(seriesVals)}
                color={T.visits}
                fillFrom="rgba(96,165,250,0.28)"
                data={dataVisitas}
                asPercent
                theme={theme}
                T={T}
              />
            );
          })()}
        </div>

          <div className="xl:col-span-6">
            <DonutCard T={T}
              title="Estado de proyectos"
              subtitle="Distribución entre iniciativas activas, planificación y cierre"
              segments={projectStatusSegments}
              theme={theme}
            />
          </div>

          <div className="xl:col-span-6">
            <HorizontalBarsCard T={T}
              title="Carga por urgencia"
              subtitle="Reportes activos clasificados por nivel de atención"
              items={urgencyBreakdown}
              theme={theme}
            />
          </div>

          <div className="xl:col-span-6">
            <ProyectosCard items={proyectosAU} theme={theme} T={T} />
          </div>
          <div className="xl:col-span-6">
            <PrioridadCard reports={reportsAU} theme={theme} T={T} />
          </div>
        </div>
      </div>
    </AutorityLayout>
  );
}
