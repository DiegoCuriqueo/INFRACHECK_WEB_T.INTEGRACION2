import React from "react";

export default function InfracheckLanding() {
  return (
    <div className="min-h-screen bg-[#1a1f3a] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Animación de fondo sofisticada con múltiples capas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Capa 1: Malla de gradiente animada */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.25) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 90% 30%, rgba(168, 85, 247, 0.25) 0%, transparent 50%)
            `,
            animation: "morphGradient 20s ease-in-out infinite",
          }}
        />

        {/* Capa 2: Ondas circulares expansivas */}
        {[0, 1, 2].map((i) => (
          <div
            key={`wave-${i}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "100px",
              height: "100px",
              border: "2px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "50%",
              animation: `ripple 8s ease-out infinite`,
              animationDelay: `${i * 2.5}s`,
            }}
          />
        ))}

        {/* Capa 3: Partículas flotantes */}
        {Array.from({ length: 30 }).map((_, i) => {
          const size = Math.random() * 4 + 2;
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          return (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${startX}%`,
                top: `${startY}%`,
                background: `radial-gradient(circle, ${
                  i % 3 === 0
                    ? "rgba(99, 102, 241, 0.6)"
                    : i % 3 === 1
                    ? "rgba(139, 92, 246, 0.6)"
                    : "rgba(59, 130, 246, 0.6)"
                }, transparent)`,
                animation: `float3d ${Math.random() * 10 + 15}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
                filter: "blur(1px)",
              }}
            />
          );
        })}

        {/* Capa 4: Líneas de conexión */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          style={{ animation: "fadeInOut 8s ease-in-out infinite" }}
        >
          {Array.from({ length: 15 }).map((_, i) => {
            const x1 = Math.random() * 100;
            const y1 = Math.random() * 100;
            const x2 = Math.random() * 100;
            const y2 = Math.random() * 100;
            return (
              <line
                key={`line-${i}`}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="rgba(99, 102, 241, 0.3)"
                strokeWidth="1"
                style={{
                  animation: `drawLine 12s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            );
          })}
        </svg>

        {/* Capa 5: Orbes brillantes grandes */}
        {[
          { size: 600, x: 10, y: 20, color: "rgba(99, 102, 241, 0.4)", delay: 0, duration: 25 },
          { size: 500, x: 70, y: 60, color: "rgba(139, 92, 246, 0.35)", delay: 5, duration: 30 },
          { size: 700, x: 50, y: 40, color: "rgba(59, 130, 246, 0.3)", delay: 10, duration: 35 },
          { size: 450, x: 85, y: 15, color: "rgba(168, 85, 247, 0.35)", delay: 8, duration: 28 },
        ].map((orb, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: "blur(40px)",
              animation: `floatOrb ${orb.duration}s ease-in-out infinite`,
              animationDelay: `${orb.delay}s`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Capa 6: Rejilla animada de puntos */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(99, 102, 241, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "gridMove 30s linear infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes morphGradient {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.6;
          }
          25% {
            transform: translate(5%, -5%) scale(1.1) rotate(90deg);
            opacity: 0.7;
          }
          50% {
            transform: translate(-3%, 3%) scale(0.95) rotate(180deg);
            opacity: 0.5;
          }
          75% {
            transform: translate(4%, -2%) scale(1.05) rotate(270deg);
            opacity: 0.65;
          }
        }

        @keyframes ripple {
          0% {
            width: 100px;
            height: 100px;
            opacity: 0.6;
          }
          100% {
            width: 1200px;
            height: 1200px;
            opacity: 0;
          }
        }

        @keyframes float3d {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translate3d(100px, -100px, 50px) rotate(90deg);
            opacity: 0.6;
          }
          50% {
            transform: translate3d(-50px, 50px, -30px) rotate(180deg);
            opacity: 0.4;
          }
          75% {
            transform: translate3d(80px, 80px, 40px) rotate(270deg);
            opacity: 0.7;
          }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }

        @keyframes drawLine {
          0%, 100% {
            stroke-dasharray: 0, 1000;
            opacity: 0;
          }
          50% {
            stroke-dasharray: 1000, 0;
            opacity: 0.3;
          }
        }

        @keyframes floatOrb {
          0%, 100% {
            transform: translate(-50%, -50%) translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate(-50%, -50%) translate3d(60px, -80px, 20px) scale(1.2);
          }
          66% {
            transform: translate(-50%, -50%) translate3d(-50px, 40px, -15px) scale(0.9);
          }
        }

        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>

      {/* NAVBAR */}
      <header className="border-b border-white/5 bg-transparent backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 lg:px-0 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img
              src="/logo1.png"
              alt="Infracheck Logo"
              className="h-8 w-8 rounded-lg object-cover shadow-lg shadow-emerald-500/40"
            />
            <span className="text-lg font-bold tracking-tight">InfraCheck</span>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3 text-sm">
            <button className="hidden sm:inline text-emerald-200 hover:text-emerald-100">
              Regístrate
            </button>
            <button className="border border-emerald-400/80 text-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-[#1a1f3a] hover:border-emerald-500 transition-colors text-xs sm:text-sm">
              Iniciar sesión
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main className="flex-1 relative z-10">
        <section className="relative overflow-hidden">
          {/* Fondo con patrón y gradiente suave */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.15),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(22,163,74,0.20),_transparent_55%)]" />
          <div className="absolute inset-0 opacity-[0.05] mix-blend-soft-light bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png')]" />

          <div className="relative max-w-6xl mx-auto px-4 lg:px-0 py-12 lg:py-20 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
            {/* Columna izquierda: texto */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-emerald-50">
                Tus reportes.
                <br />
                Tu ciudad, 
                <br />
                <span className="text-emerald-300">organizada.</span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-emerald-50/80 max-w-xl">
                InfraCheck te permite registrar baches, luminarias en mal
                estado, señalización dañada y más, directamente desde el mapa.
                La municipalidad prioriza las reparaciones según el impacto
                real en la comunidad.
              </p>

              {/* Bullets */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-lg text-sm">
                <FeatureItem text="Reportes geolocalizados en segundos" />
                <FeatureItem text="Seguimiento del estado de cada incidencia" />
                <FeatureItem text="Votación ciudadana para priorizar arreglos" />
                <FeatureItem text="Panel especial para equipos municipales" />
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-emerald-500 text-[#1a1f3a] text-sm font-semibold shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition-colors">
                  REGISTRARSE
                </button>
              </div>
            </div>

            {/* Columna derecha: mockup de app */}
            <div className="relative">
              {/* brillo de fondo */}
              <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-500/40 to-lime-400/30 blur-3xl opacity-40" />

              <div className="relative rounded-3xl bg-[#0f1229] border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
                {/* Barra superior "app" */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="grid md:grid-cols-[1.1fr_0.9fr]">
                  {/* Lista de reportes */}
                  <div className="p-4 sm:p-5 border-r border-white/5 bg-[#0a0d1f]">
                    <h3 className="text-xs font-semibold text-emerald-200 mb-3 flex items-center justify-between">
                      Reportes recientes
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200">
                        En tiempo real
                      </span>
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        {
                          title: "Bache profundo en Av. Alemania",
                          badge: "Alta prioridad",
                          color: "bg-red-500/20 text-red-300 border-red-400/40",
                        },
                        {
                          title: "Luminaria apagada en Plaza Recabarren",
                          badge: "Media",
                          color:
                            "bg-amber-500/15 text-amber-200 border-amber-400/40",
                        },
                        {
                          title: "Vereda rota frente a Escuela N° 23",
                          badge: "Alta",
                          color:
                            "bg-red-500/15 text-red-300 border-red-400/40",
                        },
                        {
                          title: "Basura acumulada en pasaje Los Robles",
                          badge: "Baja",
                          color:
                            "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
                        },
                      ].map((r, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-white/5 bg-white/3 px-3 py-2.5 text-xs flex items-start gap-2 hover:border-emerald-400/40 hover:bg-emerald-500/5 transition-colors"
                        >
                          <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                          <div className="flex-1">
                            <p className="text-emerald-50 leading-snug">
                              {r.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-emerald-100/70">
                              <span
                                className={`px-2 py-0.5 rounded-full border ${r.color}`}
                              >
                                {r.badge}
                              </span>
                              <span className="text-emerald-200/60">
                                Temuco • hace 5 min
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini mapa y stats */}
                  <div className="p-4 sm:p-5 bg-gradient-to-b from-[#0f1535] to-[#070919] flex flex-col gap-3">
                    <div className="relative rounded-2xl bg-black/40 border border-emerald-500/40 overflow-hidden h-32">
                      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(52,211,153,0.3),_transparent_55%)]" />
                      {/* "Mapa" falso */}
                      <div className="relative w-full h-full grid grid-cols-4 grid-rows-3 gap-1 p-2 opacity-90">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="rounded-sm bg-emerald-900/40 border border-emerald-600/30"
                          />
                        ))}
                      </div>
                      {/* puntos de calor */}
                      <div className="absolute top-5 left-6 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_20px_rgba(248,113,113,0.8)]" />
                      <div className="absolute bottom-4 right-10 h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)]" />
                      <div className="absolute bottom-6 left-10 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <SmallStat label="Total reportes" value="427" />
                      <SmallStat label="En proceso" value="89" />
                      <SmallStat label="Resueltos" value="312" />
                    </div>

                    <div className="mt-1 text-[11px] text-emerald-100/70">
                      "Desde que usamos InfraCheck, priorizar mantenciones es
                      mucho más transparente para la comunidad."
                      <span className="block mt-1 text-emerald-300 font-medium">
                        Dirección de Obras Municipales, Temuco
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estrellita estilo "destacado" */}
              <div className="hidden sm:flex absolute -right-4 top-6 rotate-6">
                <div className="bg-emerald-400 text-[#1a1f3a] rounded-full px-3 py-1 text-[11px] font-semibold shadow-xl flex items-center gap-1.5">
                  Ciudad más segura, vecinos más felices.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---- Subcomponentes pequeños ---- */

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
