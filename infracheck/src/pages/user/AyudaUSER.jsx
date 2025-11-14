import React, { useMemo, useState } from "react";
import UserLayout from "../../layout/UserLayout";

/* -------------------- ICONOS -------------------- */
const Chevron = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SearchI = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const MailI = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.6"/><path d="m4 6 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const PhoneI = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M5 4h3l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const BookI = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M4 19V5a2 2 0 0 1 2-2h11v18H6a2 2 0 0 1-2-2Z" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M17 3v16M7.5 7H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const HelpI = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M9.5 9a2.5 2.5 0 1 1 3.7 2.2c-.9.44-1.7 1.2-1.7 2.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
  </svg>
);

/* -------------------- DATOS (demo) -------------------- */
const FAQ = [
  {
    id: "f1",
    cat: "reportes",
    q: "¿Cómo creo un nuevo reporte con ubicación en el mapa?",
    a: "Ve a Home y haz clic sobre el mapa para fijar la ubicación. Completa título, descripción, categoría y urgencia; luego presiona Guardar.",
  },
  {
    id: "f2",
    cat: "reportes",
    q: "¿Puedo adjuntar imágenes al reporte?",
    a: "Sí. En la sección Nuevo Reporte encontrarás el campo para subir fotografías que ayuden a evidenciar el problema.",
  },
  {
    id: "f3",
    cat: "prioridad",
    q: "¿Cómo funcionan las votaciones de prioridad?",
    a: "Cada usuario puede votar una vez por reporte. Los más votados suben en prioridad para su atención. Puedes quitar tu voto si te arrepientes.",
  },
  {
    id: "f4",
    cat: "mapa",
    q: "¿Qué significan las zonas de riesgo en el mapa?",
    a: "Son áreas donde se concentran incidentes o condiciones peligrosas. Se clasifican en alta, media y baja severidad.",
  },
  {
    id: "f5",
    cat: "cuenta",
    q: "Olvidé mi contraseña, ¿qué hago?",
    a: "En la pantalla de acceso, usa “¿Olvidaste tu contraseña?” para recibir un correo de recuperación.",
  },
  {
    id: "f6",
    cat: "tecnico",
    q: "El mapa no carga o se queda en blanco",
    a: "Prueba actualizar la página, verifica tu conexión o desactiva extensiones que bloqueen scripts. Si persiste, contáctanos.",
  },
];

const CATS = [
  { k: "todo", label: "Todo" },
  { k: "reportes", label: "Reportes" },
  { k: "prioridad", label: "Votaciones" },
  { k: "mapa", label: "Mapa" },
  { k: "cuenta", label: "Cuenta" },
  { k: "tecnico", label: "Técnico" },
];

/* -------------------- UTILS -------------------- */
const cls = (...c) => c.filter(Boolean).join(" ");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function highlight(text, q) {
  if (!q) return text;
  const parts = text.split(new RegExp(`(${esc(q)})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="bg-yellow-300/20 text-yellow-100 rounded px-0.5">{p}</mark>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

/* -------------------- COMPONENTES -------------------- */
function AccordionItem({ open, onToggle, title, content, query }) {
  return (
    <div className="rounded-xl bg-slate-800/50 ring-1 ring-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-800/60 transition"
      >
        <span className="text-slate-100 font-medium">{highlight(title, query)}</span>
        <Chevron className={cls("h-5 w-5 text-slate-300 transition-transform", open && "rotate-180")} />
      </button>
      <div className={cls("grid transition-all", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 text-slate-300 leading-7">{highlight(content, query)}</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- PÁGINA -------------------- */
export default function AyudaUSER() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todo");
  const [openAll, setOpenAll] = useState(false);

  const items = useMemo(() => {
    return FAQ.filter((f) => (cat === "todo" ? true : f.cat === cat)).filter((f) => {
      if (!q) return true;
      const s = (f.q + " " + f.a).toLowerCase();
      return s.includes(q.toLowerCase());
    });
  }, [q, cat]);

  return (
    <UserLayout title="Ayuda">
      <div className="space-y-6 Sans-serif">
        {/* encabezado */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-100">¿Necesitas ayuda?</h1>
          <p className="text-sm text-slate-400">Busca una respuesta o navega por categorías.</p>
        </div>

        {/* búsqueda + categorías */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <section>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <SearchI className="h-4 w-4" />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-[320px] max-w-full rounded-xl bg-slate-800/60 pl-9 pr-3 py-2.5 text-slate-100 placeholder:text-slate-400 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Buscar en Ayuda…"
                />
                {q && (
                  <button
                    onClick={() => setQ("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {CATS.map((c) => (
                  <button
                    key={c.k}
                    onClick={() => setCat(c.k)}
                    className={cls(
                      "text-sm rounded-full px-3 py-1.5 ring-1 ring-white/10",
                      cat === c.k ? "bg-indigo-600/90 text-white" : "bg-slate-800/50 text-slate-200 hover:bg-slate-800/70"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setOpenAll((v) => !v)}
                className="ml-auto text-sm rounded-full px-3 py-1.5 bg-slate-800/60 text-slate-200 ring-1 ring-white/10 hover:bg-slate-800/80"
              >
                {openAll ? "Contraer todo" : "Desplegar todo"}
              </button>
            </div>

            {/* lista FAQ */}
            <div className="space-y-3">
              {items.map((f) => (
                <AccordionItem
                  key={f.id}
                  open={openAll}
                  onToggle={() => setOpenAll((v) => !v)} // simple: alterna global
                  title={f.q}
                  content={f.a}
                  query={q}
                />
              ))}
              {items.length === 0 && (
                <div className="rounded-xl bg-slate-900/50 ring-1 ring-white/10 p-6 text-slate-300">
                  No encontramos resultados. Prueba con otras palabras o revisa otra categoría.
                </div>
              )}
            </div>
          </section>

          {/* aside derecho */}
          <aside className="space-y-4">
            <div className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-4">
              <h3 className="text-slate-100 font-medium mb-2 flex items-center gap-2">
                <BookI className="h-5 w-5" /> Guías rápidas
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/user/home" className="block rounded-lg px-3 py-2 bg-slate-800/60 hover:bg-slate-800/80 text-slate-200 ring-1 ring-white/10">
                    Crear un reporte nuevo
                  </a>
                </li>
                <li>
                  <a href="/user/reportes" className="block rounded-lg px-3 py-2 bg-slate-800/60 hover:bg-slate-800/80 text-slate-200 ring-1 ring-white/10">
                    Votar prioridad de un caso
                  </a>
                </li>
                <li>
                  <a href="/user/map" className="block rounded-lg px-3 py-2 bg-slate-800/60 hover:bg-slate-800/80 text-slate-200 ring-1 ring-white/10">
                    Ver zonas de riesgo en el mapa
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-4">
              <h3 className="text-slate-100 font-medium mb-2 flex items-center gap-2">
                <HelpI className="h-5 w-5" /> ¿Aún necesitas ayuda?
              </h3>
              <p className="text-sm text-slate-300 mb-3">
                Escríbenos y te responderemos lo antes posible.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="mailto:soporte@infracheck.cl"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-indigo-600/90 text-white hover:bg-indigo-500 transition ring-1 ring-white/10"
                >
                  <MailI className="h-5 w-5" /> soporte@infracheck.cl
                </a>
                <a
                  href="tel:+56912345678"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-slate-800/60 text-slate-200 hover:bg-slate-800/80 ring-1 ring-white/10"
                >
                  <PhoneI className="h-5 w-5" /> +56 9 1234 5678
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </UserLayout>
  );
}
