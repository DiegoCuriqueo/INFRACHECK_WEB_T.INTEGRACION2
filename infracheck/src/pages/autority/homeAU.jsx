import React, { useId, useMemo, useState, useRef, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";

const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep"];
const make = (arr) => arr.map((v,i)=>({ mes: meses[i], y: v }));
const dataUsuarios = make([5,12,8,15,14,20,26,22,18]);
const dataReportes = make([2,10,6,9,8,18,24,17,19]);
const dataVisitas  = make([3,7,5,4,12,9,21,16,17]);

function SparklinePlus({
  data,
  height = 160,
  padding = { t: 14, r: 14, b: 24, l: 40 },
  color = "#818CF8",
  fillFrom = "rgba(129,140,248,0.28)",
  bgGrid = "#334155",
  axisText = "#9CA3AF",
  animate = true,
}) {
  const svgId = useId();
  const [hoverIdx, setHoverIdx] = useState(null);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef(null);

  useEffect(()=>{ setMounted(true); },[]);

  const width = (() => {
    const w = wrapRef.current ? wrapRef.current.clientWidth : null;
    return Math.max(320, w || 420);
  })();

  const calc = useMemo(()=>{
    const vals = data.map(d => d.y);
    const rawMin = Math.min(...vals);
    const rawMax = Math.max(...vals);
    const span = rawMax - rawMin || 1;
    const padY = span * 0.1;
    const yMin = Math.floor((rawMin - padY) * 10) / 10;
    const yMax = Math.ceil((rawMax + padY) * 10) / 10;

    const innerW = width - padding.l - padding.r;
    const innerH = height - padding.t - padding.b;

    const xs = data.map((_, i) => padding.l + (i * innerW) / (data.length - 1));
    const ys = data.map(d =>
      padding.t + (1 - (d.y - yMin) / (yMax - yMin)) * innerH
    );

    const pathD = xs.map((x,i)=>`${i===0?"M":"L"} ${x},${ys[i]}`).join(" ");
    const areaTop = pathD;
    const areaBottom = `L ${xs[xs.length-1]},${height-padding.b} L ${xs[0]},${height-padding.b} Z`;
    const areaD = areaTop + " " + areaBottom;

    const yTicks = Array.from({length:4}, (_,i)=>{
      const p = i/(4-1);
      const yVal = yMin + (1-p)*(yMax - yMin);
      const yPix = padding.t + p*(innerH);
      return { yPix, yVal: Number.isInteger(yVal) ? yVal : yVal.toFixed(1) };
    });

    const xStep = innerW / (data.length - 1);
    const minI = vals.indexOf(rawMin);
    const maxI = vals.indexOf(rawMax);

    return { xs, ys, pathD, areaD, yTicks, xStep, minI, maxI, yMin, yMax };
  }, [JSON.stringify(data), width, height, padding.t, padding.r, padding.b, padding.l]);

  const idxFromMouseX = (clientX) => {
    if (!wrapRef.current) return null;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = clientX - rect.left - padding.l;
    const idx = Math.round(x / calc.xStep);
    if (idx < 0 || idx >= data.length) return null;
    return idx;
  };

  const onMove = (e) => setHoverIdx(idxFromMouseX(e.clientX));
  const onLeave = () => setHoverIdx(null);

  const tip = hoverIdx!=null ? {
    x: calc.xs[hoverIdx],
    y: calc.ys[hoverIdx],
    mes: data[hoverIdx].mes,
    val: data[hoverIdx].y,
  } : null;

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        aria-label="Línea temporal"
        role="img"
      >
        <defs>
          <linearGradient id={`grad-${svgId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillFrom}/>
            <stop offset="100%" stopColor="rgba(129,140,248,0)"/>
          </linearGradient>
        </defs>

        {calc.yTicks.map((t, i)=>(
          <g key={i}>
            <line x1={padding.l} x2={width-padding.r} y1={t.yPix} y2={t.yPix} stroke={bgGrid} strokeDasharray="2 4"/>
            <text x={padding.l - 8} y={t.yPix+4} textAnchor="end" fontSize="11" fill={axisText}>{t.yVal}</text>
          </g>
        ))}

        <line x1={padding.l} x2={width-padding.r} y1={height-padding.b} y2={height-padding.b} stroke={bgGrid} />

        <path d={calc.areaD} fill={`url(#grad-${svgId})`} opacity={mounted && animate ? 1 : 0}/>
        <path
          d={calc.pathD}
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          style={{
            strokeDasharray: animate ? 1000 : "none",
            strokeDashoffset: animate ? (mounted ? 0 : 1000) : 0,
            transition: animate ? "stroke-dashoffset 700ms ease-out" : "none",
          }}
        />

        {[calc.minI, calc.maxI].map((i,ix)=>(
          <g key={ix}>
            <circle cx={calc.xs[i]} cy={calc.ys[i]} r={4.2} fill="#0EA5E9"/>
            <circle cx={calc.xs[i]} cy={calc.ys[i]} r={2.2} fill="white"/>
          </g>
        ))}

        {tip && (
          <>
            <line x1={tip.x} x2={tip.x} y1={padding.t} y2={height-padding.b} stroke="#64748B" strokeDasharray="3 5"/>
            <circle cx={tip.x} cy={tip.y} r={5} fill={color}/>
            <circle cx={tip.x} cy={tip.y} r={2.5} fill="white"/>
          </>
        )}

        {calc.xs.map((x,i)=> i%2===0 ? (
          <text key={i} x={x} y={height-padding.b+16} textAnchor="middle" fontSize="11" fill={axisText}>
            {data[i].mes}
          </text>
        ) : null)}

        <rect
          x={padding.l} y={padding.t}
          width={width - padding.l - padding.r}
          height={height - padding.t - padding.b}
          fill="transparent"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        />
      </svg>

      {tip && (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded-md shadow-lg"
          style={{ left: tip.x, top: tip.y }}
        >
          <div className="font-medium">{tip.mes}</div>
          <div className="opacity-90">Valor: <span className="font-semibold">{tip.val}</span></div>
        </div>
      )}
    </div>
  );
}

const Pill = ({ children, tone }) => {
  const tones = {
    progress:"bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30",
    done:    "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30",
    pending: "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/30",
    approved:"bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30",
    rejected:"bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30",
    danger:  "bg-rose-600/25 text-rose-300 ring-1 ring-rose-500/30",
    warning: "bg-amber-600/25 text-amber-300 ring-1 ring-amber-500/30",
    info:    "bg-sky-700/25 text-sky-300 ring-1 ring-sky-600/30",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>;
};

function ChartCard({ title, stat, delta, children }) {
  return (
    <article className="bg-[#121B2B] border border-slate-800 rounded-2xl p-4">
      <header className="flex items-center justify-between mb-2">
        <h2 className="text-[13px] text-slate-300">{title}</h2>
        {(stat || delta !== undefined) && (
          <div className="flex items-center gap-2">
            {stat ? <span className="text-slate-200 text-sm font-semibold">{stat}</span> : null}
            {delta !== undefined && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                delta>=0 ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
                         : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
              }`}>
                {delta>=0 ? "▲" : "▼"} {Math.abs(delta)}%
              </span>
            )}
          </div>
        )}
      </header>
      {children}
    </article>
  );
}

export default function HomeAU() {
  const pct = (arr)=> {
    const a = arr[arr.length-2] || 0;
    const b = arr[arr.length-1] || 0;
    return a ? Math.round(((b-a)/a)*100) : 0;
  };

  return (
    <DashboardLayout>
      <div className="grid 2xl:grid-cols-3 md:grid-cols-2 gap-6">
        <ChartCard title="Informe de usuarios" stat={`${dataUsuarios[dataUsuarios.length-1].y} usuarios`} delta={pct(dataUsuarios.map(d=>d.y))}>
          <SparklinePlus data={dataUsuarios}/>
        </ChartCard>

        <ChartCard title="Informe de Reportes" stat={`${dataReportes[dataReportes.length-1].y} reportes`} delta={pct(dataReportes.map(d=>d.y))}>
          <SparklinePlus data={dataReportes} color="#22D3EE" fillFrom="rgba(34,211,238,0.28)"/>
        </ChartCard>

        <ChartCard title="Informe de Visitas" stat={`${dataVisitas[dataVisitas.length-1].y} visitas`} delta={pct(dataVisitas.map(d=>d.y))}>
          <SparklinePlus data={dataVisitas} color="#60A5FA" fillFrom="rgba(96,165,250,0.28)"/>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6 pb-6">
        <article className="bg-[#121B2B] border border-slate-800 rounded-2xl p-4">
          <div className="text-sm text-slate-300 mb-3">Proyectos</div>
          <ul className="space-y-2">
            {[
              {t:"Centro Temuco", e:"En Progreso",  k:"progress"},
              {t:"Centro Temuco", e:"Completado",   k:"done"},
              {t:"Centro Temuco", e:"Pendiente",    k:"pending"},
              {t:"Centro Temuco", e:"Aprobado",     k:"approved"},
              {t:"Centro Temuco", e:"Rechazado",    k:"rejected"},
            ].map((p,i)=>(
              <li key={i} className="flex items-center justify-between bg-[#0E1622] border border-slate-800 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="grid place-content-center h-7 w-7 rounded-lg bg-slate-700/70 text-slate-200">▦</span>
                  <span className="text-slate-200">{p.t}</span>
                </div>
                <Pill tone={p.k}>{p.e}</Pill>
              </li>
            ))}
          </ul>
        </article>

        <article className="bg-[#121B2B] border border-slate-800 rounded-2xl p-4">
          <div className="text-sm text-slate-300 mb-3">Prioridad</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-300">
                  <th className="py-2 font-medium">ID</th>
                  <th className="py-2 font-medium">Lugar</th>
                  <th className="py-2 font-medium">Prioridad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  {id:1,lugar:"Centro Temuco",p:"Muy Importante",k:"danger"},
                  {id:2,lugar:"Centro Temuco",p:"Importante",k:"warning"},
                  {id:3,lugar:"Centro Temuco",p:"Normal",k:"info"},
                ].map(row=>(
                  <tr key={row.id}>
                    <td className="py-2 text-slate-300">{row.id}</td>
                    <td className="py-2">
                      <span className="inline-flex items-center gap-2 text-slate-200">
                        <span className="grid place-content-center h-7 w-7 rounded-lg bg-slate-700/70">▦</span>
                        {row.lugar}
                      </span>
                    </td>
                    <td className="py-2"><Pill tone={row.k}>{row.p}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </DashboardLayout>
  );
}
