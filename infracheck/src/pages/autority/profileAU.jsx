import React, { useState, useEffect } from "react";
import { getUserData } from "../../services/authService"; 
import { getProjects } from "../../services/projectsService";
import { getReportes, getReportVotes } from "../../services/reportsService";
import AutorityLayout from "../../layout/AutorityLayout";
export default function ProfileAU() {
  const user = getUserData();
  const iniciales = (() => {
    if (!user.nombre || user.nombre === "Usuario") return "U";
    
    return user.nombre
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  })();

  const rolConfig = (() => {
    switch (user.rol) {
      case "admin":
        return {
          gradient: "from-red-500 to-orange-500",
          bg: "bg-red-600",
          border: "border-red-400",
          text: "text-red-50",
          glow: "drop-shadow-lg-red",
          badge: "bg-red-500/80",
        };
      case "authority":
        return {
          gradient: "from-blue-500 to-purple-500",
          bg: "bg-blue-600",
          border: "border-blue-400",
          text: "text-blue-50",
          glow: "drop-shadow-lg-blue",
          badge: "bg-blue-500/80",
        };
      case "user":
        return {
          gradient: "from-green-500 to-teal-500",
          bg: "bg-green-600",
          border: "border-green-400",
          text: "text-green-50",
          glow: "drop-shadow-lg-green",
          badge: "bg-green-500/80",
        };
      default:
        return {
          gradient: "from-gray-500 to-gray-500",
          bg: "bg-gray-600",
          border: "border-gray-400",
          text: "text-gray-50",
          glow: "drop-shadow-lg-gray",
          badge: "bg-gray-500/80",
        };
    }
  })();










  // Estado para los proyectos del usuario
  const [userProjects, setUserProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [userReports, setUserReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [reportsVotesTotal, setReportsVotesTotal] = useState(0);
  
  // Cargar proyectos creados por el usuario
  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        setLoadingProjects(true);
        console.log('🗂️ Cargando proyectos del usuario...');
        console.log('👤 Usuario actual ID:', user?.user_id);
        
        // Obtener todos los proyectos
        const allProjects = await getProjects();
        console.log('📊 Total proyectos obtenidos:', allProjects.length);
        
        const filteredProjects = allProjects.filter(project => {
          const currentUserId = String(user?.user_id);
          const projectCreator = project?.creator !== undefined && project?.creator !== null ? String(project.creator) : null;
          const raw = project?.raw || {};
          const rawId = raw?.usuario?.id ?? raw?.created_by?.id ?? raw?.owner?.id ?? raw?.usuario_id ?? raw?.user_id ?? raw?.created_by_id ?? raw?.owner_id ?? null;
          const candidate = projectCreator ?? (rawId !== null && rawId !== undefined ? String(rawId) : null);
          return candidate && candidate === currentUserId;
        });
        
        console.log('✅ Proyectos del usuario actual:', filteredProjects.length);
        console.log('📋 IDs de proyectos:', filteredProjects.map(p => p.id));
        
        setUserProjects(filteredProjects || []);
      } catch (error) {
        console.error("❌ Error al cargar proyectos:", error);
        setUserProjects([]);
      } finally {
        setLoadingProjects(false);
        console.log('✅ Carga de proyectos finalizada');
      }
    };
    
    if (user?.user_id) {
      fetchUserProjects();
    } else {
      setLoadingProjects(false);
      setUserProjects([]);
    }
  }, [user?.user_id, reloadKey]);

  

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        setLoadingReports(true);
        const allReports = await getReportes();
        const currentUserId = String(user?.user_id);
        const mine = allReports.filter(r => {
          const id = r?.userId ?? r?.usuario?.id ?? r?.raw?.usuario?.id ?? null;
          return id !== null && id !== undefined && String(id) === currentUserId;
        });
        setUserReports(mine || []);
      } catch (error) {
        setUserReports([]);
      } finally {
        setLoadingReports(false);
      }
    };
    if (user?.user_id) {
      fetchUserReports();
    } else {
      setLoadingReports(false);
      setUserReports([]);
    }
  }, [user?.user_id, reloadKey]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!Array.isArray(userReports) || userReports.length === 0) {
        if (alive) setReportsVotesTotal(0);
        return;
      }
      const list = await Promise.all(
        userReports.map(r => getReportVotes(r.id).catch(() => ({ total: 0 })))
      );
      const s = list.reduce((sum, x) => sum + (x?.total || 0), 0);
      if (alive) setReportsVotesTotal(s);
    })();
    return () => { alive = false; };
  }, [userReports]);

  useEffect(() => {
    const handler = () => setReloadKey((k) => k + 1);
    try { window.addEventListener('projects:changed', handler); } catch {}
    try { window.addEventListener('reports:changed', handler); } catch {}
    try { window.addEventListener('reports:votes_updated', handler); } catch {}
    return () => { try { window.removeEventListener('projects:changed', handler); } catch {} };
  }, []);
  
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

  

  if (!user) {
    return (
      <AutorityLayout>
        <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-white/70 text-lg">No hay datos de usuario disponibles. Por favor, inicia sesión.</p>
          </div>
        </div>
      </AutorityLayout>
    );
  }

  return (
    <AutorityLayout>
      <div className="px-4 sm:px-6 lg:px-10 py-1 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xl mb-8 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative">
              <div className="h-36 w-36 rounded-3xl bg-slate-100 dark:bg-slate-800 grid place-items-center text-5xl font-bold text-slate-900 dark:text-slate-100 ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
                {iniciales}
              </div>
              <div className="absolute -bottom-3 -right-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white shadow">
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
                <span className="text-xs font-bold">{userData.estado}</span>
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left w-full">
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100">
                  {userData.nombre}
                </h1>
                <div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
                  <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold shadow">
                    {userData.rol}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white/90 dark:border-white/20 text-sm font-semibold">
                    ID: {user?.user_id || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm justify-start bg-slate-100 text-slate-700 rounded-xl px-5 py-3 border border-slate-200 dark:bg-white/5 dark:text-white/60 dark:border-white/10 mt-3">
                <span className="text-indigo-600">Última conexión:</span>
                <span className="font-medium text-slate-900 dark:text-white/80">{userData.ultimaConexion}</span>
              </div>

              <div className="flex gap-3 justify-center lg:justify-start pt-3 flex-wrap">
                <button className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 text-sm font-semibold transition">
                  Editar Perfil
                </button>
                <button className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow">
                  Configuración
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 items-stretch">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border bg-white dark:bg-slate-900/80 border-slate-200 dark:border-white/10 p-8 shadow h-full flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-400/20">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Estadísticas</h3>
                  <p className="text-xs text-slate-600 dark:text-white/50 mt-0.5">Resumen de actividad</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <StatCardEnhanced 
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  }
                  title="Proyectos" 
                  value={loadingProjects ? "..." : (userProjects?.length || 0).toString()}
                  color="emerald"
                />
                <StatCardEnhanced 
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  }
                  title="Reportes" 
                  value={loadingReports ? "..." : ((userReports?.length || 0)).toString()}
                  color="blue"
                />
                <StatCardEnhanced 
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 3h14v2H3V3zm0 6h14v2H3V9zm0 6h14v2H3v-2z" />
                    </svg>
                  }
                  title="Votos Reportes" 
                  value={(loadingReports) ? "..." : (reportsVotesTotal || 0).toString()}
                  color="purple"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-white dark:bg-slate-900/80 border-slate-200 dark:border-white/10 p-8 shadow h-full">
              <div className="flex items-center gap-3 mb-7">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-400/20">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Datos</h3>
                  <p className="text-xs text-slate-600 dark:text-white/50 mt-0.5">Datos personales y ubicación</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
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

function InfoRowEnhanced({ icon, label, value, onCopy, copied, className = "" }) {
  return (
    <div className={`group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-4 transition ${className}`}>
      <div className="relative flex items-start gap-4">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-400/20 flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-600 dark:text-white/50 mb-1.5 uppercase tracking-wider">{label}</p>
          <p className="text-slate-900 dark:text-white font-semibold truncate text-base">{value}</p>
        </div>
        <button
          onClick={onCopy}
          className="flex-shrink-0 p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition dark:bg-white/10 dark:text-white/80 dark:border-white/10"
          title="Copiar"
        >
          {copied ? (
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
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
    indigo: {
      bg: "from-indigo-500/20 to-indigo-600/5",
      border: "border-indigo-400/30",
      text: "text-indigo-300",
      iconBg: "bg-indigo-500/20",
      gradient: "from-indigo-500 to-indigo-600"
    },
    purple: {
      bg: "from-purple-500/20 to-purple-600/5",
      border: "border-purple-400/30",
      text: "text-purple-300",
      iconBg: "bg-purple-500/20",
      gradient: "from-purple-500 to-purple-600"
    },
    amber: {
      bg: "from-amber-500/20 to-amber-600/5",
      border: "border-amber-400/30",
      text: "text-amber-300",
      iconBg: "bg-amber-500/20",
      gradient: "from-amber-500 to-amber-600"
    },
    emerald: {
      bg: "from-emerald-500/20 to-emerald-600/5",
      border: "border-emerald-400/30",
      text: "text-emerald-300",
      iconBg: "bg-emerald-500/20",
      gradient: "from-emerald-500 to-emerald-600"
    },
    blue: {
      bg: "from-blue-500/20 to-blue-600/5",
      border: "border-blue-400/30",
      text: "text-blue-300",
      iconBg: "bg-blue-500/20",
      gradient: "from-blue-500 to-blue-600"
    },
  };

  const config = colorClasses[color];

  return (
    <div className={`group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-6 shadow hover:shadow-md transition cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:${config.iconBg} dark:${config.text}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-white/70 font-semibold mb-1 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white inline-block">{value}</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-slate-400 dark:text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}