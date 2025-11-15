import React, { useMemo, useState, useEffect } from "react";
import { getUserData } from "../../services/authService"; 
import { getProjects } from "../../services/projectsService";
import { getReportes, getReportVotes } from "../../services/reportsService";
import AutorityLayout from "../../layout/AutorityLayout";
export default function ProfileAU() {
  const user = getUserData();
  
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
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-2xl mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-purple-500/5 to-transparent" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 opacity-60" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 opacity-60" />
          
          
          <div className="relative z-10 p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8">
              <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r ${rolConfig.gradient} rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300`} />
                <div className={`relative h-36 w-36 rounded-3xl ${rolConfig.bg} ${rolConfig.border} border-2 grid place-items-center text-5xl font-bold ${rolConfig.text} shadow-2xl ${rolConfig.glow} transition-all duration-300 group-hover:scale-105`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl" />
                  <span className="relative drop-shadow-lg">{iniciales}</span>
                </div>
                <div className="absolute -bottom-3 -right-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 border-2 border-slate-900 shadow-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                  <span className="text-xs font-bold text-white">{userData.estado}</span>
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left space-y-2 w-full">
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    {userData.nombre}
                  </h1>
                  <div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
                    <span className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl ${rolConfig.badge} text-white text-sm font-bold shadow-lg backdrop-blur-sm border border-white/10`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {userData.rol}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-semibold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      ID: {user?.user_id || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-white/60 justify-start bg-white/5 rounded-xl px-5 py-3 border border-white/10 backdrop-blur-sm">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Última conexión: <span className="text-white/80">{userData.ultimaConexion}</span></span>
                </div>

                <div className="flex gap-3 justify-center lg:justify-start pt-3 flex-wrap">
                  <button className="group flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white text-sm font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-white/10 hover:scale-[1.02]">
                    <svg className="w-4 h-4 group-hover:rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Perfil
                  </button>
                  <button className="group flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-[1.02]">
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

        <div className="grid lg:grid-cols-3 gap-4 items-stretch">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl p-8 shadow-xl h-full flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-400/20">
                  <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Estadísticas</h3>
                  <p className="text-xs text-white/50 mt-0.5">Resumen de actividad</p>
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
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl p-8 shadow-xl h-full">
              <div className="flex items-center gap-3 mb-7">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-400/20">
                  <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Datos</h3>
                  <p className="text-xs text-white/50 mt-0.5">Datos personales y ubicación</p>
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
    <div className={`group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/20 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-white/5 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-start gap-4">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-300 flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors duration-300">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">{label}</p>
          <p className="text-white font-semibold truncate text-base">{value}</p>
        </div>
        <button
          onClick={onCopy}
          className="flex-shrink-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
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
    <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${config.bg} ${config.border} border p-6 hover:scale-[1.03] transition-all duration-300 cursor-pointer hover:shadow-xl`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.gradient} opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500`} />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${config.iconBg} ${config.text} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-white/70 font-semibold mb-1 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300 inline-block">{value}</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-white/30 group-hover:text-white/50 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}