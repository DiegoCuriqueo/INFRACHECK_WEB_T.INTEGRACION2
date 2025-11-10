import React, { useMemo, useState } from "react";
import { User, Mail, MapPin, Shield, Activity, FileText, AlertCircle, Calendar, Copy, Check, Settings, Edit3 } from "lucide-react";

export default function ProfileAU() {
  // Simulación de datos del usuario
  const user = {
    user_id: 1,
    username: "Diego Muñoz",
    email: "diego.munoz@municipal.cl",
    rut: "12.345.678-9",
    rous_id: 2,
    rous_nombre: "Autoridad Municipal"
  };
  
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

  const rolColor = useMemo(() => {
    switch(user?.rous_id) {
      case 1: return "from-purple-500 to-purple-600";
      case 2: return "from-blue-500 to-indigo-600";
      case 3: return "from-emerald-500 to-teal-600";
      default: return "from-indigo-500 to-indigo-700";
    }
  }, [user?.rous_id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Card con Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl mb-6">
          {/* Banner decorativo */}
          <div className={`h-32 sm:h-40 bg-gradient-to-r ${rolColor} relative`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAyYy0yLjIxIDAtNCAxLjc5LTQgNHMxLjc5IDQgNCA0IDQtMS43OSA0LTQtMS43OS00LTQtNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
          </div>

          {/* Contenido del perfil */}
          <div className="relative px-6 sm:px-8 pb-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-30 sm:-mt-5">
              <div className="relative group">
                <div className={`h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-gradient-to-br ${rolColor} border-4 border-slate-900 shadow-2xl grid place-items-center text-4xl font-bold text-white`}>
                  {iniciales}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
                  <h1 className="text-3xl font-bold text-white">{userData.nombre}</h1>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {userData.estado}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-slate-300 justify-center sm:justify-start mb-3">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">{userData.rol}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Última conexión: {userData.ultimaConexion}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition group">
                  <Edit3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-500/30">
                  <Settings className="w-5 h-5" />
                  Configuración
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-xl mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            Información de Contacto
          </h2>
          
          <div className="space-y-3">
            <InfoRow
              icon={<Mail className="w-5 h-5" />}
              label="Correo Electrónico"
              value={userData.email}
              onCopy={() => copy(userData.email, "email")}
              copied={copiado === "email"}
            />
            <InfoRow
              icon={<User className="w-5 h-5" />}
              label="RUT"
              value={userData.rut}
              onCopy={() => copy(userData.rut, "rut")}
              copied={copiado === "rut"}
            />
            <InfoRow
              icon={<MapPin className="w-5 h-5" />}
              label="Dirección"
              value={userData.direccion}
              onCopy={() => copy(userData.direccion, "dir")}
              copied={copiado === "dir"}
            />
          </div>
        </div>

        {/* Detalles de cuenta */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-xl mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Detalles de Cuenta
          </h2>
          
          <div className="space-y-4">
            <DetailRow label="ID de Usuario" value={`#${user?.user_id}`} />
            <DetailRow label="Tipo de Cuenta" value={userData.rol} />
            <DetailRow label="Estado" value={userData.estado} badge />
            <DetailRow label="Fecha de Registro" value="15 Ene 2024" />
          </div>
        </div>

        {/* Estadísticas y Acciones - Alineadas horizontalmente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<FileText className="w-6 h-6" />}
            title="Proyectos Activos" 
            value="8" 
            change="+2 este mes"
            color="blue"
          />
          <StatCard 
            icon={<Activity className="w-6 h-6" />}
            title="Reportes" 
            value="27" 
            change="+5 esta semana"
            color="emerald"
          />
          <StatCard 
            icon={<AlertCircle className="w-6 h-6" />}
            title="Alertas Pendientes" 
            value="1" 
            change="Requiere atención"
            color="amber"
          />
          
          {/* Acciones rápidas */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Acciones</h2>
            
            <div className="space-y-2">
              <ActionButton text="Ver mis proyectos" />
              <ActionButton text="Generar reporte" />
              <ActionButton text="Gestionar alertas" />
              <ActionButton text="Historial de actividad" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

function InfoRow({ icon, label, value, onCopy, copied }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
      <div className="text-indigo-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
        <p className="text-white truncate font-medium">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex-shrink-0 group/btn"
        title="Copiar"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
}

function StatCard({ icon, title, value, change, color }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-indigo-600/20 border-blue-400/20 text-blue-300",
    emerald: "from-emerald-500/20 to-teal-600/20 border-emerald-400/20 text-emerald-300",
    amber: "from-amber-500/20 to-orange-600/20 border-amber-400/20 text-amber-300"
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colorClasses[color]} border py-10 px-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-white/10">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="text-xs text-white/60">{change}</div>
    </div>
  );
}

function DetailRow({ label, value, badge }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      {badge ? (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
          {value}
        </span>
      ) : (
        <span className="text-sm font-medium text-white">{value}</span>
      )}
    </div>
  );
}

function ActionButton({ text }) {
  return (
    <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white text-sm font-medium transition-all hover:translate-x-1 group flex items-center justify-between">
      <span>{text}</span>
      <span className="text-slate-400 group-hover:text-white transition-colors">→</span>
    </button>
  );
}