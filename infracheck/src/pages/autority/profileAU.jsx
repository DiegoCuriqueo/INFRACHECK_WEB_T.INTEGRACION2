import React, { useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AutorityLayout from "../../layout/AutorityLayout";

export default function ProfileAU() {
  const { user } = useAuth();
  
  const userData = {
    nombre: user?.username || "Municipal",
    email: user?.email || "Sin email",
    rut: user?.rut || "Sin RUT",
    direccion: "Av. Siempre Viva 123, Temuco",
    rol: user?.rous_nombre || "Autoridad",
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
    if (!userData.nombre || userData.nombre === "Municipal") return "M";
    
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

  const rolConfig = useMemo(() => {
    switch(user?.rous_id) {
      case 1: return { 
        bg: "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
        border: "border-purple-400/40",
        text: "text-purple-300",
        badge: "bg-purple-500/90",
        glow: "shadow-purple-500/20"
      };
      case 2: return { 
        bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
        border: "border-blue-400/40",
        text: "text-blue-300",
        badge: "bg-blue-500/90",
        glow: "shadow-blue-500/20"
      };
      case 3: return { 
        bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10",
        border: "border-emerald-400/40",
        text: "text-emerald-300",
        badge: "bg-emerald-500/90",
        glow: "shadow-emerald-500/20"
      };
      default: return { 
        bg: "bg-gradient-to-br from-indigo-500/20 to-indigo-600/10",
        border: "border-indigo-400/40",
        text: "text-indigo-300",
        badge: "bg-indigo-500/90",
        glow: "shadow-indigo-500/20"
      };
    }
  }, [user?.rous_id]);

  return (
    <AutorityLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
        {/* Header Card con diseño hero */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-2xl mb-6">
          {/* Efectos de fondo animados */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Avatar mejorado */}
              <div className="relative group">
                <div className={`h-32 w-32 rounded-3xl ${rolConfig.bg} ${rolConfig.border} border-2 grid place-items-center text-4xl font-bold ${rolConfig.text} shadow-2xl ${rolConfig.glow} transition-transform group-hover:scale-105`}>
                  {iniciales}
                </div>
                {/* Badge de estado */}
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-white">{userData.estado}</span>
                </div>
              </div>

              {/* Info principal */}
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                    {userData.nombre}
                  </h1>
                  <div className="flex items-center gap-2 justify-center lg:justify-start flex-wrap">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${rolConfig.badge} text-white text-sm font-medium shadow-lg`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {userData.rol}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium">
                      ID: {user?.user_id || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Última conexión con icono */}
                <div className="flex items-center gap-2 text-sm text-white/60 justify-center lg:justify-start">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Última conexión: {userData.ultimaConexion}</span>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 justify-center lg:justify-start pt-2">
                  <button className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-white/10">
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Perfil
                  </button>
                  <button className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/50">
                    <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Estadísticas */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Estadísticas
              </h3>
              
              <div className="space-y-3">
                <StatCardEnhanced 
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  }
                  title="Proyectos" 
                  value="8"
                  color="indigo"
                />
                <StatCardEnhanced 
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                  }
                  title="Reportes" 
                  value="27"
                  color="purple"
                />
                <StatCardEnhanced 
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  }
                  title="Alertas" 
                  value="1"
                  color="amber"
                />
              </div>
            </div>
          </div>

          {/* Columna derecha - Información de contacto */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Contacto
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <InfoRowEnhanced
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  }
                  label="Correo electrónico"
                  value={userData.email}
                  onCopy={() => copy(userData.email, "email")}
                  copied={copiado === "email"}
                />
                <InfoRowEnhanced
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  }
                  label="RUT"
                  value={userData.rut}
                  onCopy={() => copy(userData.rut, "rut")}
                  copied={copiado === "rut"}
                />
                <InfoRowEnhanced
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  }
                  label="Dirección"
                  value={userData.direccion}
                  className="sm:col-span-2"
                  onCopy={() => copy(userData.direccion, "dir")}
                  copied={copiado === "dir"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AutorityLayout>
  );
}

/* ---------- Componentes mejorados ---------- */

function InfoRowEnhanced({ icon, label, value, onCopy, copied, className = "" }) {
  return (
    <div className={`group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-4 transition-all ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-white/50 mb-1">{label}</p>
          <p className="text-white font-medium truncate">{value}</p>
        </div>
        <button
          onClick={onCopy}
          className="flex-shrink-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all hover:scale-105"
          title="Copiar"
        >
          {copied ? (
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function StatCardEnhanced({ icon, title, value, color = "indigo" }) {
  const colorClasses = {
    indigo: "from-indigo-500/20 to-indigo-600/5 border-indigo-400/30 text-indigo-300",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-400/30 text-purple-300",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-400/30 text-amber-300",
  };

  return (
    <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${colorClasses[color]} border p-4 hover:scale-[1.02] transition-all cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10">
            {icon}
          </div>
          <div>
            <p className="text-sm text-white/70 font-medium">{title}</p>
            <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-white/30 group-hover:text-white/50 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}