import React, { useMemo, useState } from "react";

// Simulación de contexto y layout para demostración
const useAuth = () => ({
  user: {
    username: "Diego Torres",
    email: "diegotorres@admin.cl",
    rut: "12.345.678-9",
    user_id: 5,
    rous_nombre: "Administrador",
    rous_id: 5
  }
});
import AdminLayout from "../../layout/AdminLayout";

export default function ProfileADM() {
  const { user } = useAuth();
  
  const userData = {
    nombre: user?.username || "Administrador",
    email: user?.email || "Sin email",
    rut: user?.rut || "Sin RUT",
    direccion: "Av. Siempre Viva 123, Temuco",
    rol: user?.rous_nombre || "Administrador",
    estado: "Activo",
    ultimaConexion: new Date().toLocaleString('es-CL', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
  };

  const iniciales = useMemo(() => {
    if (!userData.nombre || userData.nombre === "Administrador") return "A";
    return userData.nombre
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [userData.nombre]);

  const [copiado, setCopiado] = useState("");

  const copy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiado(field);
      setTimeout(() => setCopiado(""), 1200);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const rolColor = useMemo(() => {
    switch(user?.rous_id) {
      case 1: return "from-purple-500 to-purple-600";
      case 2: return "from-blue-500 to-blue-600";
      case 3: return "from-emerald-500 to-emerald-600";
      default: return "from-indigo-500 to-indigo-600";
    }
  }, [user?.rous_id]);

  const rolBadge = useMemo(() => {
    switch(user?.rous_id) {
      case 1: return "bg-purple-500/20 border-purple-400/30 text-purple-200";
      case 2: return "bg-blue-500/20 border-blue-400/30 text-blue-200";
      case 3: return "bg-emerald-500/20 border-emerald-400/30 text-emerald-200";
      default: return "bg-indigo-500/20 border-indigo-400/30 text-indigo-200";
    }
  }, [user?.rous_id]);

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-10 py-1 max-w-7xl mx-auto">
        {/* Header Card con diseño mejorado */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-2xl mb-8">
          {/* Efectos de fondo con animación sutil */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-purple-500/5 to-transparent" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 to-cyan-600/20 rounded-full blur-3xl opacity-50" />
          
          <div className="relative p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Avatar con efecto hover mejorado */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
                <div className={`relative h-36 w-36 rounded-3xl bg-gradient-to-br ${rolColor} shadow-2xl flex items-center justify-center text-5xl font-bold text-white overflow-hidden transition-transform group-hover:scale-105 duration-300`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <span className="relative z-10 drop-shadow-lg">{iniciales}</span>
                </div>
                <div className="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white shadow-xl flex items-center gap-2 border-2 border-slate-900">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  {userData.estado}
                </div>
              </div>

              {/* Info con mejor espaciado y jerarquía */}
              <div className="flex-1 space-y-2 w-full">
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight bg-clip-text">
                    {userData.nombre}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border backdrop-blur-sm ${rolBadge}`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {userData.rol}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/80 backdrop-blur-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      ID: {user?.user_id || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-white/60 bg-white/5 rounded-xl px-4 py-3 border border-white/10 backdrop-blur-sm w-fit">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Última conexión: <span className="text-white/80">{userData.ultimaConexion}</span></span>
                </div>

                <div className="flex flex-wrap gap-3 pt-3">
                  <button className="group px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/5 flex items-center gap-2.5">
                    <svg className="w-4 h-4 group-hover:rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Perfil
                  </button>
                  <button className="group px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-indigo-500/50 flex items-center gap-2.5">
                    <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Configuración
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {/* Contact Info con diseño mejorado */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-400/20">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Datos</h2>
                  <p className="text-sm text-white/50 mt-0.5">Datos de contacto y ubicación</p>
                </div>
              </div>

              <div className="space-y-4">
                <InfoRow
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  label="Correo electrónico"
                  value={userData.email}
                  onCopy={() => copy(userData.email, "email")}
                  copied={copiado === "email"}
                />
                <InfoRow
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  }
                  label="RUT"
                  value={userData.rut}
                  onCopy={() => copy(userData.rut, "rut")}
                  copied={copiado === "rut"}
                />
                <InfoRow
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  label="Dirección"
                  value={userData.direccion}
                  onCopy={() => copy(userData.direccion, "dir")}
                  copied={copiado === "dir"}
                />
              </div>
            </div>
          </div>

          {/* Stats con animaciones mejoradas */}
          <div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-400/20">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Estadísticas</h2>
                  <p className="text-xs text-white/50 mt-0.5">Resumen general</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <StatCard 
                  title="Usuarios" 
                  value="156"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                  color="from-indigo-500 to-indigo-600"
                  bgColor="from-indigo-500/10 to-indigo-600/5"
                />
                <StatCard 
                  title="Reportes" 
                  value="892"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  color="from-blue-500 to-blue-600"
                  bgColor="from-blue-500/10 to-blue-600/5"
                />
                <StatCard 
                  title="Alertas" 
                  value="7"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                  color="from-amber-500 to-amber-600"
                  bgColor="from-amber-500/10 to-amber-600/5"
                  tone="warn"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ---------- Subcomponentes mejorados ---------- */

function InfoRow({ icon, label, value, onCopy, copied }) {
  return (
    <div className="group relative overflow-hidden flex items-center gap-4 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/20 px-6 py-5 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors duration-300">
        {icon}
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">{label}</p>
        <p className="text-white font-semibold truncate text-lg">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="relative text-xs px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all duration-300 font-semibold hover:scale-105 flex-shrink-0 shadow-lg hover:shadow-xl"
        title="Copiar"
      >
        {copied ? (
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Copiado
          </span>
        ) : "Copiar"}
      </button>
    </div>
  );
}

function StatCard({ title, value, icon, color, bgColor, tone }) {
  return (
    <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${bgColor} border border-white/10 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20 cursor-pointer`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500`} />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300 inline-block">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg ${tone === "warn" ? 'animate-pulse' : 'group-hover:rotate-12'} transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}