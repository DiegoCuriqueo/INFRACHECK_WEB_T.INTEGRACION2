import React, { useMemo, useState, useEffect } from "react";
import { getUserData } from "../../services/authService"; 
import { getReportes } from "../../services/reportsService";
import AutorityLayout from "../../layout/UserLayout";

export default function ProfileAU() {
  const user = getUserData();
  
  // Estado para los reportes del usuario
  const [userReports, setUserReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  
  // Cargar reportes del usuario filtrando por userId
  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        setLoadingReports(true);
        console.log('🔄 Cargando todos los reportes...');
        console.log('👤 Usuario actual ID:', user?.user_id);
        
        const allReports = await getReportes();
        console.log('📊 Total reportes obtenidos:', allReports.length);
        
        const filteredReports = allReports.filter(report => {
          console.log('🔍 Comparando:', report.userId, '===', user?.user_id);
          return report.userId === user?.user_id;
        });
        
        console.log('✅ Reportes del usuario:', filteredReports.length);
        setUserReports(filteredReports || []);
      } catch (error) {
        console.error("❌ Error al cargar reportes del usuario:", error);
        setUserReports([]);
      } finally {
        setLoadingReports(false);
        console.log('✅ Carga de reportes finalizada');
      }
    };
    
    if (user?.user_id) {
      fetchUserReports();
    } else {
      setLoadingReports(false);
      setUserReports([]);
    }
  }, [user?.user_id]);
  
  const userData = {
    nombre: user?.username || "Usuario",
    email: user?.email || "Sin email",
    rut: user?.rut || "Sin RUT",
    direccion: "Av. Alemania 123, Temuco",
    rol: user?.rous_nombre || user?.rol_nombre || "Usuario",
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
    if (!userData.nombre || userData.nombre === "Usuario") return "U";
    
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
    const rousId = user?.rous_id || user?.rol;
    
    switch(rousId) {
      case 1: return { 
        bg: "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
        border: "border-purple-400/40",
        text: "text-purple-300",
        badge: "bg-purple-500/90",
        glow: "shadow-purple-500/20",
        gradient: "from-purple-500 to-purple-600"
      };
      case 2: return { 
        bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
        border: "border-blue-400/40",
        text: "text-blue-300",
        badge: "bg-blue-500/90",
        glow: "shadow-blue-500/20",
        gradient: "from-blue-500 to-blue-600"
      };
      case 3: return { 
        bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10",
        border: "border-emerald-400/40",
        text: "text-emerald-300",
        badge: "bg-emerald-500/90",
        glow: "shadow-emerald-500/20",
        gradient: "from-emerald-500 to-emerald-600"
      };
      default: return { 
        bg: "bg-gradient-to-br from-indigo-500/20 to-indigo-600/10",
        border: "border-indigo-400/40",
        text: "text-indigo-300",
        badge: "bg-indigo-500/90",
        glow: "shadow-indigo-500/20",
        gradient: "from-indigo-500 to-indigo-600"
      };
    }
  }, [user?.rous_id, user?.rol]);

  // Validar que el usuario esté autenticado
  if (!user) {
    return (
      <AutorityLayout>
        <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-7xl mx-auto">
          <div className="text-center py-12 rounded-2xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900/80 dark:border-white/10">
            <p className="text-slate-700 text-lg dark:text-slate-200">
              No hay datos de usuario disponibles. Por favor, inicia sesión.
            </p>
          </div>
        </div>
      </AutorityLayout>
    );
  }

  return (
    <AutorityLayout>
      <div className="px-4 sm:px-6 lg:px-10 py-4 max-w-7xl mx-auto">
        {/* Header / Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-lg mb-8 dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95">
          {/* Efectos de fondo solo en dark */}
          <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-purple-500/5 to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 hidden dark:block w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 opacity-60" />
          <div className="pointer-events-none absolute bottom-0 left-0 hidden dark:block w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 opacity-60" />
          
          <div className="relative z-10 p-6 sm:p-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8">
              {/* Avatar */}
              <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r ${rolConfig.gradient} rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300 dark:opacity-30`} />
                <div
                  className={[
                    "relative h-32 w-32 sm:h-36 sm:w-36 rounded-3xl grid place-items-center text-4xl sm:text-5xl font-bold shadow-xl transition-all duration-300 group-hover:scale-105",
                    "bg-slate-100 border border-slate-200 text-slate-700",
                    "dark:" + rolConfig.bg,
                    "dark:" + rolConfig.border,
                    "dark:" + rolConfig.text,
                    "dark:" + rolConfig.glow
                  ].join(" ")}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-3xl dark:from-black/20" />
                  <span className="relative drop-shadow-sm dark:drop-shadow-lg">
                    {iniciales}
                  </span>
                </div>

                {/* Badge estado */}
                <div className="absolute -bottom-3 -right-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 border-2 border-white shadow-xl dark:border-slate-900">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                  <span className="text-xs font-bold text-emerald-50">
                    {userData.estado}
                  </span>
                </div>
              </div>

              {/* Info principal */}
              <div className="flex-1 text-center lg:text-left space-y-3 w-full">
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {userData.nombre}
                  </h1>

                  <div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
                    <span
                      className={[
                        "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm border",
                        "bg-indigo-600 text-white border-indigo-500/80",
                        "dark:" + rolConfig.badge,
                        "dark:border-white/10"
                      ].join(" ")}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {userData.rol}
                    </span>

                    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-sm font-semibold dark:bg-white/10 dark:text-white/90 dark:border-white/20">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        />
                      </svg>
                      ID: {user?.user_id || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Última conexión */}
                <div className="flex items-center gap-3 text-sm justify-center lg:justify-start bg-slate-50 rounded-xl px-5 py-3 border border-slate-200 text-slate-600 w-fit mx-auto lg:mx-0 dark:bg-white/5 dark:border-white/10 dark:text-white/70">
                  <svg
                    className="w-5 h-5 text-indigo-500 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">
                    Última conexión:{" "}
                    <span className="text-slate-900 dark:text-white/80">
                      {userData.ultimaConexion}
                    </span>
                  </span>
                </div>

                {/* Botones acción */}
                <div className="flex gap-3 justify-center lg:justify-start pt-3 flex-wrap">
                  <button className="group flex items-center gap-2.5 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-sm font-semibold transition-all duration-300 hover:shadow-md hover:scale-[1.02] dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20 dark:text-white">
                    <svg
                      className="w-4 h-4 group-hover:rotate-6 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Editar Perfil
                  </button>

                  <button className="group flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/40 hover:scale-[1.02]">
                    <svg
                      className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Configuración
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white backdrop-blur-xl p-6 shadow-sm dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-400/20">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Estadísticas
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 dark:text-white/50">
                    Resumen de actividad
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <StatCardEnhanced 
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  title="Reportes" 
                  value={(userReports?.length || 0).toString()}
                  color="purple"
                />
                <StatCardEnhanced 
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  title="Resueltos" 
                  value={(
                    userReports?.filter(r => r.status === "resuelto").length ||
                    0
                  ).toString()}
                  color="indigo"
                />
                <StatCardEnhanced 
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  title="Pendientes" 
                  value={(
                    userReports?.filter(
                      r => r.status === "pendiente" || r.status === "en_proceso"
                    ).length || 0
                  ).toString()}
                  color="amber"
                />
              </div>
            </div>
          </div>

          {/* Columna derecha - Datos personales */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white backdrop-blur-xl p-6 shadow-sm dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-400/20">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Datos
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 dark:text-white/50">
                    Datos personales y ubicación
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <InfoRowEnhanced
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
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
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  label="RUT"
                  value={userData.rut}
                  onCopy={() => copy(userData.rut, "rut")}
                  copied={copiado === "rut"}
                />

                <InfoRowEnhanced
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
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

/* ---------- Componentes ---------- */

function InfoRowEnhanced({ icon, label, value, onCopy, copied, className = "" }) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-xl p-4 transition-all duration-300",
        "bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-sm",
        "dark:bg-white/5 dark:hover:bg-white/[0.08] dark:border-white/10 dark:hover:border-white/20 dark:shadow-lg dark:hover:shadow-white/5",
        className
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600 flex-shrink-0 transition-colors duration-300 group-hover:bg-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:group-hover:bg-indigo-500/20">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-white/50">
            {label}
          </p>
          <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <button
          onClick={onCopy}
          className="flex-shrink-0 p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/10 dark:hover:border-white/20 dark:text-white/80 dark:hover:text-white"
          title="Copiar"
        >
          {copied ? (
            <svg
              className="w-4 h-4 text-emerald-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function StatCardEnhanced({ icon, title, value, color = "indigo" }) {
  const colorClasses = {
    indigo: {
      bg: "from-indigo-100 to-indigo-50 dark:from-indigo-500/20 dark:to-indigo-600/5",
      border: "border-indigo-200 dark:border-indigo-400/30",
      text: "text-indigo-600 dark:text-indigo-300",
      iconBg: "bg-indigo-100 dark:bg-indigo-500/20",
      gradient: "from-indigo-500 to-indigo-600"
    },
    purple: {
      bg: "from-purple-100 to-purple-50 dark:from-purple-500/20 dark:to-purple-600/5",
      border: "border-purple-200 dark:border-purple-400/30",
      text: "text-purple-600 dark:text-purple-300",
      iconBg: "bg-purple-100 dark:bg-purple-500/20",
      gradient: "from-purple-500 to-purple-600"
    },
    amber: {
      bg: "from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-600/5",
      border: "border-amber-200 dark:border-amber-400/30",
      text: "text-amber-600 dark:text-amber-300",
      iconBg: "bg-amber-100 dark:bg-amber-500/20",
      gradient: "from-amber-500 to-amber-600"
    },
  };

  const config = colorClasses[color];

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-xl bg-gradient-to-br border p-4 cursor-pointer transition-all duration-300",
        config.bg,
        config.border,
        "hover:shadow-md hover:scale-[1.02] dark:hover:shadow-xl"
      ].join(" ")}
    >
      <div className={`absolute top-0 right-0 hidden dark:block w-24 h-24 bg-gradient-to-br ${config.gradient} opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500`} />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={[
              "p-3 rounded-xl transition-transform duration-300 group-hover:scale-105",
              config.iconBg,
              config.text
            ].join(" ")}
          >
            {icon}
          </div>
          <div>
            <p className="text-xs text-slate-600 font-semibold mb-1 uppercase tracking-wide dark:text-white/60">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 inline-block group-hover:scale-105 transition-transform duration-300 dark:text-white">
              {value}
            </p>
          </div>
        </div>
        <svg
          className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300 dark:text-white/30 dark:group-hover:text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-300/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:via-white/20" />
    </div>
  );
}
  