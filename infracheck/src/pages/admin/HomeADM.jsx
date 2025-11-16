import React, { useId, useMemo, useState, useRef, useEffect } from "react";
import AdminLayout from "../../layout/AdminLayout";
import { getUsers } from "../../services/getUserService";
import { getReportes } from "../../services/reportsService";
import { useTheme } from "../../themes/ThemeContext";

/* ====== Tokens ====== */
const T = {
  light: {
    cardBg: "#FFFFFF",
    grid: "#E2E8F0",
    axis: "#64748B",
    users: "#4F46E5",
    reports: "#06B6D4",
    visits: "#3B82F6",
    textPrimary: "#1E293B",
    textSecondary: "#475569",
    bgPrimary: "#F8FAFC",
  },
  dark: {
    cardBg: "#121B2B",
    grid: "#334155",
    axis: "#9CA3AF",
    users: "#818CF8",
    reports: "#22D3EE",
    visits: "#60A5FA",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    bgPrimary: "#0F172A",
  }
};

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"];

// Función para hacer el formato de los datos como lo tenías
const make = (arr) => arr.map((v, i) => ({ mes: meses[i], y: v }));

function HomeADM() {
  const { theme } = useTheme();
  const tokens = T[theme];
  
  // Estados para los datos
  const [dataUsuarios, setDataUsuarios] = useState([]);
  const [dataReportes, setDataReportes] = useState([]);
  const [dataVisitas, setDataVisitas] = useState([]);
  const [range, setRange] = useState("all");
  const [showPoints, setShowPoints] = useState(true);

  // Inicializamos los totales como null para saber si los datos están cargados
  const [totalUsuarios, setTotalUsuarios] = useState(null);
  const [totalReportes, setTotalReportes] = useState(null);
  const [totalVisitas, setTotalVisitas] = useState(null);

  // Función para calcular el total de un conjunto de datos
  const calculateTotal = (data) => {
    return data.slice(-getRangeInMonths(range)).reduce((sum, item) => sum + item.y, 0);
  };

  // Función para determinar cuántos meses tomar según el rango
  const getRangeInMonths = (range) => {
    switch (range) {
      case "3m":
        return 3;
      case "6m":
        return 6;
      case "9m":
        return 9;
      default:
        return dataUsuarios.length; // Todos los meses
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 Usuarios reales desde backend
        const usuarios = await getUsers();
        // Convertimos a formato esperado por el gráfico (mes, y)
        const usuariosFormatted = make(Array(meses.length).fill(usuarios.length));

        // 🔹 Reportes reales desde backend
        const reportes = await getReportes();
        const reportesFormatted = make(Array(meses.length).fill(reportes.length));

        // 🔸 Visitas (si aún no tienes endpoint real)
        // Por ahora seguimos usando un JSON local o lo lleno con datos fake:
        const visitasFormatted = make([10,20,30,40,50,60,70,80,90]);

        setDataUsuarios(usuariosFormatted);
        setDataReportes(reportesFormatted);
        setDataVisitas(visitasFormatted);

        // Totales reales
        setTotalUsuarios(usuarios.length);
        setTotalReportes(reportes.length);
        setTotalVisitas(visitasFormatted.reduce((a, b) => a + b.y, 0));

      } catch (error) {
        console.error("Error cargando datos del Admin:", error);
      }
    };

    fetchData();
  }, [range]);

  // Mostrar mensaje mientras los datos se están cargando
  if (!dataUsuarios.length || !dataReportes.length || !dataVisitas.length) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600 dark:text-slate-400">Cargando...</div>
        </div>
      </AdminLayout>
    );
  }

  // Funciones para formatear los datos
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

  function SparklinePro({
    data,
    height = 320,
    minWidth = 760,
    padding = { t: 24, r: 40, b: 56, l: 72 },
    color = tokens.users,
    fillFrom,
    range,
    showPoints,
    smooth,
  }) {
    const svgId = useId();
    const wrapRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    const [hoverIdx, setHoverIdx] = useState(null);

    useEffect(() => setMounted(true), []);

    const width = (() => {
      const w = wrapRef.current ? wrapRef.current.clientWidth : null;
      return Math.max(minWidth, w || minWidth + 140);
    })();

    // Subconjunto de datos según el rango de meses
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

    return (
      <div ref={wrapRef} className="relative w-full select-none">
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
              <line
                x1={padding.l}
                x2={width - padding.r}
                y1={t.yPix}
                y2={t.yPix}
                stroke={tokens.grid}
                strokeDasharray="2 4"
              />
              <text x={padding.l - 12} y={t.yPix + 4} textAnchor="end" fontSize="12" fill={tokens.axis}>
                {t.label}
              </text>
            </g>
          ))}
          <line x1={padding.l} x2={width - padding.r} y1={height - padding.b} y2={height - padding.b} stroke={tokens.grid} />

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
          <line
            x1={padding.l}
            x2={width - padding.r}
            y1={calc.avgY}
            y2={calc.avgY}
            stroke={theme === 'dark' ? "rgba(148,163,184,0.4)" : "rgba(100,116,139,0.4)"}
            strokeDasharray="6 6"
          />
          <text x={width - padding.r} y={calc.avgY - 6} textAnchor="end" fontSize="11" fill={theme === 'dark' ? "rgba(226,232,240,0.8)" : "rgba(71,85,105,0.8)"}>
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
              <line
                x1={calc.xs[hoverIdx]}
                x2={calc.xs[hoverIdx]}
                y1={padding.t}
                y2={height - padding.b}
                stroke={tokens.axis}
                strokeDasharray="3 5"
              />
              <circle cx={calc.xs[hoverIdx]} cy={calc.ys[hoverIdx]} r={5.6} fill={color} />
              <circle cx={calc.xs[hoverIdx]} cy={calc.ys[hoverIdx]} r={2.8} fill="white" />
            </>
          )}

          {/* Eje X meses */}
          {visibleData.map((d, i) => (
            <text key={i} x={calc.xs[i]} y={height - padding.b + 22} textAnchor="middle" fontSize="12" fill={tokens.axis}>
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
              fill={theme === 'dark' ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)"}
              stroke={theme === 'dark' ? "rgba(148,163,184,0.25)" : "rgba(203,213,225,0.25)"}
            />
            <text x={calc.xs.at(-1) + 18} y={calc.ys.at(-1)} dominantBaseline="middle" fontSize="12" fill={theme === 'dark' ? "#E5E7EB" : "#374151"}>
              {fmtK(visibleData.at(-1).y)}
            </text>
          </g>

          {/* Área interactiva */}
          <rect
            x={padding.l} y={padding.t}
            width={width - padding.l - padding.r}
            height={height - padding.t - padding.b}
            fill="transparent"
            onMouseMove={(e) => setHoverIdx(idxFromClient(e.clientX))}
            onMouseLeave={() => setHoverIdx(null)}
            onTouchStart={(e) => {
              const t = e.touches?.[0];
              if (!t) return;
              setHoverIdx(idxFromClient(t.clientX));
            }}
            onTouchMove={(e) => {
              const t = e.touches?.[0];
              if (!t) return;
              setHoverIdx(idxFromClient(t.clientX));
            }}
          />
        </svg>
      </div>
    );
  }

  /* ====== Card Chart simple ====== */
  function ChartCard({ title, stat, delta, color, fillFrom, data, range, showPoints}) {
    return (
      <article 
        className="rounded-2xl p-6 shadow-sm ring-1 transition-colors" 
        style={{ 
          background: tokens.cardBg,
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}
      >
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>
            {title}
          </h2>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              delta >= 0
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-400/30"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-1 ring-rose-400/30"
            }`}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        </header>

        {/* Cuadro destacado para mostrar el número de usuarios, reportes y visitas */}
        <div
          className="inline-block rounded-xl px-4 py-2 mb-4 shadow-md"
          style={{ backgroundColor: color }}
        >
          <p className="text-white text-lg font-semibold text-center">{stat}</p>
        </div>

        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div 
            className="flex items-center gap-1 rounded-lg p-1 ring-1 transition-colors"
            style={{ 
              background: theme === 'dark' ? 'rgba(30,41,59,0.4)' : 'rgba(241,245,249,0.4)',
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'
            }}
          >
            {["3m", "6m", "9m", "all"].map((key) => (
              <button
                key={key}
                onClick={() => setRange(key)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  range === key 
                    ? theme === 'dark' 
                      ? "bg-slate-700/60 text-white" 
                      : "bg-slate-200 text-slate-900"
                    : theme === 'dark'
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {key === "all" ? "Todos" : key.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Controles de Mostrar puntos*/}
          <button
            onClick={() => setShowPoints(!showPoints)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              showPoints
                ? theme === 'dark'
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-slate-800 text-white shadow-sm"
                : theme === 'dark'
                ? "bg-slate-700/40 text-slate-300 hover:bg-slate-600/50"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Mostrar puntos
          </button>
        </div>

        <SparklinePro
          data={data}
          color={color}
          fillFrom={fillFrom}
          range={range}
          showPoints={showPoints}
        />
      </article>
    );
  }

  return (
    <AdminLayout>
      <div 
        className="min-h-screen p-6 transition-colors"
        style={{ backgroundColor: tokens.bgPrimary }}
      >
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-10">
          {/* Informe de Usuarios */}
          <div className="2xl:col-span-6">
            <ChartCard
              title="Informe de usuarios"
              stat={totalUsuarios !== null ? `${totalUsuarios} usuarios` : `${dataUsuarios.at(-1).y} usuarios`}
              delta={pct(dataUsuarios.map((d) => d.y))}
              color={tokens.users}
              fillFrom={theme === 'dark' ? "rgba(129,140,248,0.28)" : "rgba(79,70,229,0.28)"}
              data={dataUsuarios}
              range={range}
              showPoints={showPoints}
            />
          </div>

          {/* Informe de Reportes */}
          <div className="2xl:col-span-6">
            <ChartCard
              title="Informe de reportes"
              stat={totalReportes !== null ? `${totalReportes} reportes` : `${dataReportes.at(-1).y} reportes`}
              delta={pct(dataReportes.map((d) => d.y))}
              color={tokens.reports}
              fillFrom={theme === 'dark' ? "rgba(34,211,238,0.28)" : "rgba(6,182,212,0.28)"}
              data={dataReportes}
              range={range}
              showPoints={showPoints}
            />
          </div>

          {/* Informe de Visitas */}
          <div className="2xl:col-span-12">
            <ChartCard
              title="Informe de visitas"
              stat={totalVisitas !== null ? `${totalVisitas} visitas` : `${dataVisitas.at(-1).y} visitas`}
              delta={pct(dataVisitas.map((d) => d.y))}
              color={tokens.visits}
              fillFrom={theme === 'dark' ? "rgba(96,165,250,0.28)" : "rgba(59,130,246,0.28)"}
              data={dataVisitas}
              range={range}
              showPoints={showPoints}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default HomeADM;