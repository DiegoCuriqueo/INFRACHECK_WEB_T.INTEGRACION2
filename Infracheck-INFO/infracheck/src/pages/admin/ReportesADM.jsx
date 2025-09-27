import AdminLayout from "../../layout/AdminLayout.jsx";

// Card mínimo (si ya tienes uno, usa el tuyo)
const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-slate-800 bg-[#0B1220]/60 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide text-white/95 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] ${className}`}
  >
    {children}
  </span>
);

const ImgPill = () => (
  <div className="inline-flex h-6 min-w-14 items-center justify-center rounded-full bg-slate-700/70 text-[10px] text-slate-300 px-2">
    IMG
  </div>
);

const ReportesPage = () => {
  const reportesEjemplo = [
    { id:1, titulo:"Bache en la calle", descripcion:"Daño severo en el pavimento que causa problemas a los vehículos", ubicacion:"Avenida Libertador 456, Temuco", nivelUrgencia:"MEDIA", estado:"PENDIENTE", fecha:"2024-01-15", usuario:"María González", categoria:"Vialidad", imagen:"" },
    { id:2, titulo:"Semáforo dañado", descripcion:"Luz roja intermitente no funciona correctamente, peligro para transeúntes", ubicacion:"Intersección Calle Principal con Av. Alemania", nivelUrgencia:"ALTA", estado:"EN PROCESO", fecha:"2024-01-14", usuario:"Carlos Martínez", categoria:"Señalización", imagen:"" },
    { id:3, titulo:"Alcantarilla tapada", descripcion:"Obstrucción completa en drenaje causa acumulación de agua", ubicacion:"Barrio Centro, Calle Montt 234", nivelUrgencia:"MEDIA", estado:"ASIGNADO", fecha:"2024-01-13", usuario:"Ana López", categoria:"Drenaje", imagen:"" },
    { id:4, titulo:"Poste de luz caído", descripcion:"Poste de alumbrado público derribado por viento fuerte, cables expuestos", ubicacion:"Sector Norte, Pasaje Los Aromos 123", nivelUrgencia:"ALTA", estado:"URGENTE", fecha:"2024-01-12", usuario:"Pedro Ramírez", categoria:"Electricidad", imagen:"" },
    { id:5, titulo:"Grieta en acera", descripcion:"Fisura extensa en vereda que representa peligro para peatones", ubicacion:"Plaza de Armas, frente a Municipalidad", nivelUrgencia:"BAJA", estado:"COMPLETADO", fecha:"2024-01-11", usuario:"Sofía Torres", categoria:"Infraestructura", imagen:"" },
    { id:6, titulo:"Señal de tránsito rota", descripcion:"Señal de pare completamente destruida por vandalismo", ubicacion:"Intersección Sur, Calle Bulnes con O'Higgins", nivelUrgencia:"MEDIA", estado:"PENDIENTE", fecha:"2024-01-10", usuario:"Roberto Silva", categoria:"Señalización", imagen:"" },
    { id:7, titulo:"Árbol caído en vía pública", descripcion:"Árbol de gran tamaño obstruye completamente el paso vehicular", ubicacion:"Av. Pablo Neruda 789, sector Universidad", nivelUrgencia:"ALTA", estado:"EN PROCESO", fecha:"2024-01-09", usuario:"Carmen Morales", categoria:"Áreas Verdes", imagen:"" },
    { id:8, titulo:"Fuga de agua potable", descripcion:"Rotura en tubería principal causa desperdicio de agua y daños", ubicacion:"Calle Arturo Prat 456, Villa Los Pinos", nivelUrgencia:"ALTA", estado:"ASIGNADO", fecha:"2024-01-08", usuario:"Diego Herrera", categoria:"Agua Potable", imagen:"" },
  ];

  const getUrgencia = (nivel) => {
    switch (nivel) {
      case "ALTA": return "bg-red-500";
      case "MEDIA": return "bg-yellow-500 text-slate-900";
      case "BAJA": return "bg-green-500";
      default: return "bg-slate-500";
    }
  };

  const getEstado = (estado) => {
    switch (estado) {
      case "COMPLETADO": return "bg-green-600";
      case "EN PROCESO": return "bg-blue-600";
      case "ASIGNADO": return "bg-violet-600";
      case "URGENTE": return "bg-red-600";
      case "PENDIENTE": return "bg-slate-600";
      default: return "bg-slate-500";
    }
  };

  const getCategoria = (categoria) => {
    switch (categoria) {
      case "Vialidad": return "bg-orange-500";
      case "Señalización": return "bg-cyan-500";
      case "Drenaje": return "bg-indigo-500";
      case "Electricidad": return "bg-amber-500 text-slate-900";
      case "Infraestructura": return "bg-pink-500";
      case "Áreas Verdes": return "bg-emerald-600";
      case "Agua Potable": return "bg-sky-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <AdminLayout title="Reportes de Infraestructura">
      <Card className="p-5">
        {/* Título + total */}
        <div className="flex items-start sm:items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-100">Reportes de Infraestructura</h2>
          <div className="text-xs sm:text-sm text-slate-400">
            Total: {reportesEjemplo.length} reportes
          </div>
        </div>

        {/* Header tabla */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 pb-3 border-b border-slate-700/70 text-slate-400 text-[12px] font-medium">
          <div className="col-span-2">Título</div>
          <div className="col-span-3">Descripción</div>
          <div className="col-span-2">Ubicación</div>
          <div className="col-span-1">Urgencia</div>
          <div className="col-span-1">Estado</div>
          <div className="col-span-1">Fecha</div>
          <div className="col-span-1">Usuario</div>
          <div className="col-span-1">Imagen</div>
        </div>

        {/* Filas */}
        <div className="divide-y divide-slate-800/80">
          {reportesEjemplo.map((r) => (
            <div
              key={r.id}
              className="py-4 lg:py-0 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center"
            >
              {/* Título + categoría */}
              <div className="col-span-2 mb-3 lg:mb-0">
                <div className="flex flex-col">
                  <button className="text-left text-sky-300 hover:text-sky-200 font-semibold">
                    {r.titulo}
                  </button>
                  <div className="mt-2">
                    <Badge className={getCategoria(r.categoria)}>
                      {r.categoria}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="col-span-3 mb-3 lg:mb-0">
                <p className="text-sm text-slate-300 leading-relaxed">{r.descripcion}</p>
              </div>

              {/* Ubicación */}
              <div className="col-span-2 mb-3 lg:mb-0">
                <div className="text-sm text-slate-300">
                  <span className="mr-1">📍</span>
                  {r.ubicacion}
                </div>
              </div>

              {/* Urgencia */}
              <div className="col-span-1 mb-3 lg:mb-0">
                <Badge className={`${getUrgencia(r.nivelUrgencia)} justify-center w-24`}>
                  {r.nivelUrgencia}
                </Badge>
              </div>

              {/* Estado */}
              <div className="col-span-1 mb-3 lg:mb-0">
                <Badge className={`${getEstado(r.estado)} justify-center w-28`}>
                  {r.estado}
                </Badge>
              </div>

              {/* Fecha */}
              <div className="col-span-1 mb-1 lg:mb-0">
                <div className="text-xs text-slate-400">{r.fecha}</div>
              </div>

              {/* Usuario */}
              <div className="col-span-1 mb-3 lg:mb-0">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <span>👤</span> {r.usuario}
                </div>
              </div>

              {/* Imagen */}
              <div className="col-span-1">
                {r.imagen ? (
                  <img
                    src={r.imagen}
                    alt="Imagen del reporte"
                    className="h-10 w-20 rounded-lg object-cover border border-slate-700"
                    onError={(e) => { e.currentTarget.replaceWith(document.createElement("div")); }}
                  />
                ) : (
                  <ImgPill />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Métricas inferiores */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-4 text-center">
            <div className="text-2xl font-bold text-red-400">2</div>
            <div className="text-sm text-slate-400">Urgentes</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-4 text-center">
            <div className="text-2xl font-bold text-blue-400">2</div>
            <div className="text-sm text-slate-400">En Proceso</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-4 text-center">
            <div className="text-2xl font-bold text-violet-400">2</div>
            <div className="text-sm text-slate-400">Asignados</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-4 text-center">
            <div className="text-2xl font-bold text-green-400">1</div>
            <div className="text-sm text-slate-400">Completados</div>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default ReportesPage;
