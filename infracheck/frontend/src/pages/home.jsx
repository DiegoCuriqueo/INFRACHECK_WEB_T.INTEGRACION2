import "../styles/home.css";

const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep"];
const make = (arr) => arr.map((v,i)=>({ mes: meses[i], y: v }));

const dataUsuarios = make([5,12,8,15,14,20,26,22,18]);
const dataReportes = make([2,10,6,9,8,18,24,17,19]);
const dataVisitas  = make([3,7,5,4,12,9,21,16,17]);

/** Pequeño sparkline en SVG para simular el gráfico (luego lo puedes cambiar por Recharts) */
function Sparkline({ data }) {
  const width = 320, height = 110, pad = 10;
  const xs = data.map((_, i) => pad + (i * (width - 2*pad)) / (data.length - 1));
  const ys = (() => {
    const vals = data.map(d => d.y);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return vals.map(v => {
      const t = (v - min) / (max - min || 1);
      return height - pad - t * (height - 2*pad);
    });
  })();
  const d = xs.map((x,i)=>`${i===0?"M":"L"} ${x},${ys[i]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="spark">
      <line x1="0" y1={height-pad} x2={width} y2={height-pad} className="axis" />
      <path d={d} className="line" />
      {xs.map((x,i)=>(
        <circle key={i} cx={x} cy={ys[i]} r="3.5" className="dot" />
      ))}
    </svg>
  );
}

export default function Home() {
  return (
    <div className="home">
      {/* TOP: 3 tarjetas con gráficos */}
      <section className="grid charts3">
        <article className="card glass">
          <h2>Informe de usuarios</h2>
          <Sparkline data={dataUsuarios} />
          <p className="axis-labels">{meses.join(" ")}</p>
        </article>
        <article className="card glass">
          <h2>Informe de Reportes</h2>
          <Sparkline data={dataReportes} />
          <p className="axis-labels">{meses.join(" ")}</p>
        </article>
        <article className="card glass">
          <h2>Informe de Visitas</h2>
          <Sparkline data={dataVisitas} />
          <p className="axis-labels">{meses.join(" ")}</p>
        </article>
      </section>

      {/* BOTTOM: Proyectos + Prioridad */}
      <section className="grid twoCols">
        {/* Proyectos */}
        <article className="card glass">
          <div className="section-title">Proyectos</div>
          <ul className="project-list">
            {[
              {t:"Centro Temuco", e:"En Progreso",  k:"progress"},
              {t:"Centro Temuco", e:"Completada",   k:"done"},
              {t:"Centro Temuco", e:"Pendiente",    k:"pending"},
              {t:"Centro Temuco", e:"Aprobado",     k:"approved"},
              {t:"Centro Temuco", e:"Rechazado",    k:"rejected"},
            ].map((p,i)=>(
              <li key={i} className="project-item">
                <span className="icon-box">▦</span>
                <span className="project-name">{p.t}</span>
                <span className={`pill ${p.k}`}>{p.e}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* Prioridad */}
        <article className="card glass">
          <div className="section-title">Prioridad</div>
          <table className="nice-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Lugar</th>
                <th>Prioridad</th>
              </tr>
            </thead>
            <tbody>
              {[
                {id:1,lugar:"Centro Temuco",p:"Muy Importante",k:"danger"},
                {id:2,lugar:"Centro Temuco",p:"Importante",k:"warning"},
                {id:3,lugar:"Centro Temuco",p:"Normal",k:"info"},
              ].map(row=>(
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td className="cell-with-icon"><span className="icon-box">▦</span>{row.lugar}</td>
                  <td><span className={`pill ${row.k}`}>{row.p}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </div>
  );
}
