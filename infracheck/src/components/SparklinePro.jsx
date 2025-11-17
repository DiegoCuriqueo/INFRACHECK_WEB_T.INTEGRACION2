import React, {
  useId,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const fmtK = (n) =>
  Math.abs(n) >= 1e6
    ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
    : Math.abs(n) >= 1e3
    ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k"
    : String(n);
const fmtPct = (n) => `${Math.round(n)}%`;

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

function SparklinePro({
  T,
  data,
  height = 260,
  minWidth = 520,
  padding = { t: 20, r: 36, b: 48, l: 60 },
  color,
  fillFrom,
  asPercent = false,
  theme,
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
    const raw = smooth ? ma(ys, 3) : ys;
    if (!asPercent) return raw;
    const maxRaw = Math.max(...raw, 0);
    return raw.map((v) => (maxRaw ? (v / maxRaw) * 100 : 0));
  }, [visibleData, smooth, asPercent]);

  const calc = useMemo(() => {
    const vals = series;
    const rawMin = Math.min(...vals);
    const rawMax = Math.max(...vals);
    const span = rawMax - rawMin || 1;
    const padY = asPercent ? 0 : span * 0.12;
    const yMin = asPercent ? 0 : Math.floor((rawMin - padY) * 10) / 10;
    const yMax = asPercent ? 100 : Math.ceil((rawMax + padY) * 10) / 10;

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

    const ticksBase = asPercent ? [0, 25, 50, 75, 100] : Array.from({ length: 4 }, (_, i) => {
      const p = i / (4 - 1);
      return yMin + (1 - p) * (yMax - yMin);
    });
    const yTicks = ticksBase.map((yVal, i) => {
      const p = asPercent ? (yVal - yMin) / (yMax - yMin) : i / (ticksBase.length - 1);
      const yPix = padding.t + p * innerH;
      return {
        yPix,
        label: asPercent ? fmtPct(yVal) : fmtK(Number.isInteger(yVal) ? yVal : +yVal.toFixed(1)),
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
  }, [series, width, height, padding.l, padding.r, padding.t, padding.b, asPercent]);

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

  const lastVal = (() => {
    const last = visibleData.at(-1)?.y ?? 0;
    if (!asPercent) return last;
    const maxRaw = Math.max(...visibleData.map((d) => d.y), 0);
    return maxRaw ? (last / maxRaw) * 100 : 0;
  })();

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className={`flex items-center gap-1 ${theme === "dark" ? "bg-slate-800/40 ring-white/5" : "bg-gray-100/50 ring-gray-300"} rounded-lg p-1 ring-1`}>
          {["3m", "6m", "9m", "all"].map((key) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-2.5 py-1 text-xs rounded-md ${theme === "dark" ? (range === key ? "bg-slate-700/60 text-white" : "text-slate-300 hover:text-white") : (range === key ? "bg-gray-300 text-gray-800" : "text-gray-600 hover:text-gray-800")}`}
            >
              {key === "all" ? "Todos" : key.toUpperCase()}
            </button>
          ))}
        </div>

        <label className={`text-xs flex items-center gap-2 ml-1 ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
          <input
            type="checkbox"
            checked={showPoints}
            onChange={(e) => setShowPoints(e.target.checked)}
          />
          Puntos
        </label>
        <label className={`text-xs flex items-center gap-2 ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
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

        {/* Promedio ocultado */}

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
                {asPercent ? fmtPct(series[i]) : fmtK(visibleData[i].y)}
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
            fill={theme === "dark" ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)"}
            stroke={theme === "dark" ? "rgba(148,163,184,0.25)" : "rgba(100,100,100,0.25)"}
          />
          <text
            x={calc.xs.at(-1) + 18}
            y={calc.ys.at(-1)}
            dominantBaseline="middle"
            fontSize="12"
            fill={theme === "dark" ? "#E5E7EB" : "#333333"}
          >
            {asPercent ? fmtPct(lastVal) : fmtK(lastVal)}
          </text>
        </g>

        {/* Área interactiva */}
        <rect
          x={padding.l}
          y={padding.t}
          width={width - padding.l - padding.r}
          height={height - padding.b}
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

export default SparklinePro;