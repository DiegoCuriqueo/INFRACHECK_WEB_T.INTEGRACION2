import DashboardLayout from "../../layout/DashboardLayout";

const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep"];
const make = (arr) => arr.map((v,i)=>({ mes: meses[i], y: v }));
const dataUsuarios = make([5,12,8,15,14,20,26,22,18]);
const dataReportes = make([2,10,6,9,8,18,24,17,19]);
const dataVisitas  = make([3,7,5,4,12,9,21,16,17]);

function Sparkline({ data }) {
  const width = 320, height = 110, pad = 10;
  const xs = data.map((_, i) => pad + (i * (width - 2*pad)) / (data.length - 1));
  const vals = data.map(d => d.y);
  const max = Math.max(...vals), min = Math.min(...vals);
  const ys = vals.map(v => {
    const t = (v - min) / (max - min || 1);
    return height - pad - t * (height - 2*pad);
  });
  const d = xs.map((x,i)=>`${i===0?"M":"L"} ${x},${ys[i]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <line x1="0" y1={height-pad} x2={width} y2={height-pad} className="stroke-slate-700" />
      <path d={d} className="fill-none stroke-indigo-400" strokeWidth="2" />
      {xs.map((x,i)=>(
        <circle key={i} cx={x} cy={ys[i]} r="3.5" className="fill-indigo-400" />
      ))}
    </svg>
  );
}

const Pill = ({ children, tone="indigo" }) => {
  const tones = {
    progress: "bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30",
    done:     "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30",
    pending:  "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/30",
    approved: "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30",
    rejected: "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30",
    danger:   "bg-rose-600/25 text-rose-300 ring-1 ring-rose-500/30",
    warning:  "bg-amber-600/25 text-amber-300 ring-1 ring-amber-500/30",
    info:     "bg-sky-700/25 text-sky-300 ring-1 ring-sky-600/30",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone] || ""}`}>
      {children}
    </span>
  );
};

export default function HomeAU() {
  return (
    <DashboardLayout>
      {/* Top: 3 informes */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          {t:"Informe de usuarios", data: dataUsuarios},
          {t:"Informe de Reportes", data: dataReportes},
          {t:"Informe de Visitas",  data: dataVisitas},
        ].map((box, i)=>(
          <article key={i} className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-4 shadow-xl">
            <h2 className="text-sm text-slate-300 mb-2">{box.t}</h2>
            <Sparkline data={box.data} />
            <p className="mt-2 text-[11px] tracking-wide text-slate-400">{meses.join("  ")}</p>
          </article>
        ))}
      </section>

      {/* Bottom: Proyectos + Prioridad */}
      <section className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Proyectos */}
        <article className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-4">
          <div className="text-sm text-slate-300 mb-3">Proyectos</div>
          <ul className="space-y-2">
            {[
              {t:"Centro Temuco", e:"En Progreso",  k:"progress"},
              {t:"Centro Temuco", e:"Completado",   k:"done"},
              {t:"Centro Temuco", e:"Pendiente",    k:"pending"},
              {t:"Centro Temuco", e:"Aprobado",     k:"approved"},
              {t:"Centro Temuco", e:"Rechazado",    k:"rejected"},
            ].map((p,i)=>(
              <li key={i} className="flex items-center justify-between bg-slate-900/50 border border-slate-700/50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="grid place-content-center h-7 w-7 rounded-lg bg-slate-700/70 text-slate-200">▦</span>
                  <span className="text-slate-200">{p.t}</span>
                </div>
                <Pill tone={p.k}>{p.e}</Pill>
              </li>
            ))}
          </ul>
        </article>

        {/* Prioridad */}
        <article className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-4">
          <div className="text-sm text-slate-300 mb-3">Prioridad</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-300">
                  <th className="py-2">ID</th>
                  <th className="py-2">Lugar</th>
                  <th className="py-2">Prioridad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
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
      </section>
    </DashboardLayout>
  );
}
