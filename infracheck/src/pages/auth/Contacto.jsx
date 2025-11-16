// src/pages/auth/Contacto.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Contacto() {
  const navigate = useNavigate();

  const goToAuth = (mode) => {
    navigate("/auth", { state: { mode } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1420] to-[#1a1f35] text-white font-sans flex flex-col relative overflow-hidden">
      {/* 🔮 ANIMACIÓN DE CÍRCULOS MORADOS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[
          { size: 520, x: 10, y: -10, color: "rgba(88, 28, 120, 0.9)", delay: 0, duration: 28 },
          { size: 380, x: 25, y: 40, color: "rgba(109, 40, 200, 0.65)", delay: 4, duration: 30 },
          { size: 440, x: 80, y: 0, color: "rgba(147, 51, 234, 0.75)", delay: 2, duration: 32 },
          { size: 500, x: 95, y: 70, color: "rgba(76, 29, 149, 0.8)", delay: 6, duration: 26 },
          { size: 380, x: 55, y: 95, color: "rgba(129, 140, 248, 0.65)", delay: 7, duration: 34 },
        ].map((circle, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${circle.size}px`,
              height: `${circle.size}px`,
              left: `${circle.x}%`,
              top: `${circle.y}%`,
              background: `radial-gradient(circle at center, ${circle.color} 10%, transparent 60%)`,
              filter: "blur(10px)",
              opacity: 0.9,
              transform: "translate(-50%, -50%)",
              animation: `infraFloat ${circle.duration}s ease-in-out infinite`,
              animationDelay: `${circle.delay}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes infraFloat {
          0% {
            transform: translate(-50%, -50%) translate3d(0, 0, 0) scale(1);
          }
          25% {
            transform: translate(-50%, -50%) translate3d(40px, -60px, 0) scale(1.05);
          }
          50% {
            transform: translate(-50%, -50%) translate3d(-35px, 40px, 0) scale(0.96);
          }
          75% {
            transform: translate(-50%, -50%) translate3d(20px, 20px, 0) scale(1.03);
          }
          100% {
            transform: translate(-50%, -50%) translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>

      {/* Logo en esquina superior izquierda */}
      <div className="absolute top-6 left-22 z-20 flex items-center gap-3">
        <img
          src="/logo1.png"
          alt="Infracheck Logo"
          className="h-16 w-16 object-contain drop-shadow-lg"
        />
        <span className="text-xl font-bold tracking-tight">InfraCheck</span>
      </div>

      {/* HERO */}
      <main className="flex-1 relative z-10">
        <section className="relative overflow-hidden">
          <div className="relative max-w-6xl mx-auto px-4 lg:px-0 py-12 lg:py-20 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
            {/* Texto */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-emerald-50">
                Tus contactos.
                <br />
                Tu ciudad,
                <br />
                <span className="text-violet-400">conectada.</span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-emerald-50/80 max-w-xl">
                El módulo de contactos de InfraCheck centraliza vecinos,
                dirigentes, organizaciones, proveedores y equipos municipales
                en un solo lugar. Vincula cada contacto con reportes,
                reuniones e incidencias para una gestión más transparente
                y coordinada.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-lg text-sm">
                <FeatureItem text="Ficha única por vecino, organización o proveedor" />
                <FeatureItem text="Historial de interacciones, llamadas y reuniones" />
                <FeatureItem text="Segmentación por barrio, rol y tipo de contacto" />
                <FeatureItem text="Contactos vinculados a reportes e iniciativas" />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => goToAuth("register")}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white text-sm font-semibold shadow-lg shadow-purple-500/40 hover:from-[#6d28d9] hover:to-[#9333ea] transition-all"
                >
                  REGISTRARSE
                </button>
                <button
                  onClick={() => goToAuth("login")}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white text-sm font-semibold shadow-lg shadow-purple-500/40 hover:from-[#6d28d9] hover:to-[#9333ea] transition-all"
                >
                  INICIAR SESIÓN
                </button>
              </div>
            </div>

            {/* Mockup derecha adaptado a contactos */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-500/40 to-lime-400/30 blur-3xl opacity-40" />

              <div className="relative rounded-3xl bg-[#0f1229] border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="grid md:grid-cols-[1.1fr_0.9fr]">
                  {/* Lista de contactos */}
                  <div className="p-4 sm:p-5 border-r border-white/5 bg-[#0a0d1f]">
                    <h3 className="text-xs font-semibold text-emerald-200 mb-3 flex items-center justify-between">
                      Contactos recientes
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200">
                        Actualizado hace 3 min
                      </span>
                    </h3>

                    <div className="space-y-2.5">
                      {[
                        {
                          title: "Junta de Vecinos Villa Las Rosas",
                          subtitle: "Dirigente: Ana Pérez • Sector Norte",
                          badge: "Organización vecinal",
                          color:
                            "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
                        },
                        {
                          title: "María López",
                          subtitle: "Vecina • Ha realizado 7 reportes",
                          badge: "Alta interacción",
                          color:
                            "bg-violet-500/15 text-violet-100 border-violet-400/40",
                        },
                        {
                          title: "Iluminaciones Sur SpA",
                          subtitle: "Proveedor • Alumbrado público",
                          badge: "Proveedor",
                          color:
                            "bg-amber-500/15 text-amber-200 border-amber-400/40",
                        },
                        {
                          title: "Equipo Operaciones Terreno",
                          subtitle: "Cuadrilla 03 • Turno noche",
                          badge: "Equipo municipal",
                          color:
                            "bg-sky-500/15 text-sky-200 border-sky-400/40",
                        },
                      ].map((c, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-white/5 bg-white/3 px-3 py-2.5 text-xs flex items-start gap-2 hover:border-emerald-400/40 hover:bg-emerald-500/5 transition-colors"
                        >
                          <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                          <div className="flex-1">
                            <p className="text-emerald-50 leading-snug">
                              {c.title}
                            </p>
                            <p className="mt-0.5 text-[10px] text-emerald-100/70">
                              {c.subtitle}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-emerald-100/70">
                              <span
                                className={`px-2 py-0.5 rounded-full border ${c.color}`}
                              >
                                {c.badge}
                              </span>
                              <span className="text-emerald-200/60">
                                Temuco • sin actividad hace 2 días
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estadísticas y mini mapa de contactos */}
                  <div className="p-4 sm:p-5 bg-gradient-to-b from-[#0f1535] to-[#070919] flex flex-col gap-3">
                    <div className="relative rounded-2xl bg-black/40 border border-emerald-500/40 overflow-hidden h-32">
                      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(52,211,153,0.3),_transparent_55%)]" />
                      <div className="relative w-full h-full grid grid-cols-4 grid-rows-3 gap-1 p-2 opacity-90">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="rounded-sm bg-emerald-900/40 border border-emerald-600/30"
                          />
                        ))}
                      </div>

                      {/* Puntos representando clusters de contactos */}
                      <div className="absolute top-5 left-6 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_20px_rgba(248,113,113,0.8)]" />
                      <div className="absolute bottom-4 right-10 h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)]" />
                      <div className="absolute bottom-6 left-10 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-[11px]">
                      <SmallStat label="Total contactos" value="1.284" />
                      <SmallStat label="Vecinos activos" value="643" />
                      <SmallStat label="Sociedades" value="97" />
                    </div>

                    <div className="mt-1 text-[11px] text-emerald-100/70">
                      "Con el módulo de contactos de InfraCheck es mucho más
                      fácil coordinar con dirigentes, proveedores y equipos
                      internos sin perder el contexto de cada caso."
                      <span className="block mt-1 text-emerald-300 font-medium">
                        Dirección de Ciudadana, Temuco
                      </span>
                      <span className="block mt-1 text-emerald-300 font-medium">
                        infracheck@gmail.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex absolute -right-4 top-6 rotate-6">
                <div className="bg-emerald-400 text-[#1a1f3a] rounded-full px-3 py-1 text-[11px] font-semibold shadow-xl flex items-center gap-1.5">
                  Ciudad conectada, gestión más humana.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---- Subcomponentes ---- */

function FeatureItem({ text }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-[#1a1f3a] font-bold">
        ✓
      </span>
      <p className="text-emerald-100/85 text-xs sm:text-sm">{text}</p>
    </div>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="rounded-xl bg-black/40 border border-white/10 px-3 py-2">
      <p className="text-[10px] text-emerald-200/70">{label}</p>
      <p className="text-sm font-semibold text-emerald-100">{value}</p>
    </div>
  );
}
