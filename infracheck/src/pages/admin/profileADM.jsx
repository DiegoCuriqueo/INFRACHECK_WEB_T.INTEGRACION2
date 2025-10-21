import React, { useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../layout/AdminLayout";

export default function ProfileADM() {
  const { user } = useAuth();
  
  // Datos del usuario con fallbacks
  const userData = {
    nombre: user?.username || "Administrador",
    email: user?.email || "Sin email",
    rut: user?.rut || "Sin RUT",
    direccion: "Av. Siempre Viva 123, Temuco", // Este dato no viene de la API
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

  // Color del rol según tipo
  const rolColor = useMemo(() => {
    switch(user?.rous_id) {
      case 1: return "bg-purple-500/20 border-purple-400/30 text-purple-200"; // Admin
      case 2: return "bg-blue-500/20 border-blue-400/30 text-blue-200";       // Municipal
      case 3: return "bg-emerald-500/20 border-emerald-400/30 text-emerald-200"; // Usuario
      default: return "bg-indigo-600/20 border-indigo-400/30 text-indigo-200";
    }
  }, [user?.rous_id]);

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto">
        {/* CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e1526]/80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          {/* Header gradient */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-700/20 via-fuchsia-600/10 to-emerald-500/10" />

          {/* Top section */}
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <div className="relative">
                <div className={`h-24 w-24 sm:h-28 sm:w-28 rounded-2xl ${rolColor} border grid place-items-center text-3xl font-semibold shadow-inner`}>
                  {iniciales}
                </div>
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
                  {userData.estado}
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-semibold text-white">{userData.nombre}</h1>
                <p className="text-white/60 mt-1">Rol: {userData.rol}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/80">
                    ID: {user?.user_id || 'N/A'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/80">
                    Última conexión: {userData.ultimaConexion}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm transition">
                  Editar Perfil
                </button>
                <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition">
                  Configuración
                </button>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="p-6 sm:p-8 space-y-6">
            <h2 className="text-slate-200 font-medium">Datos de contacto</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow
                label="Correo"
                value={userData.email}
                onCopy={() => copy(userData.email, "email")}
                copied={copiado === "email"}
              />
              <InfoRow
                label="RUT"
                value={userData.rut}
                onCopy={() => copy(userData.rut, "rut")}
                copied={copiado === "rut"}
              />
              <InfoRow
                label="Dirección"
                value={userData.direccion}
                className="sm:col-span-2"
                onCopy={() => copy(userData.direccion, "dir")}
                copied={copiado === "dir"}
              />
            </div>

            {/* User Data Debug (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2">Datos del usuario (debug):</p>
                <pre className="text-xs text-slate-300 overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}

            {/* Quick stats - Admin tiene acceso a todo */}
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <StatCard title="Usuarios" value="156" />
              <StatCard title="Reportes" value="892" />
              <StatCard title="Alertas" value="7" tone="warn" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ---------- subcomponents ---------- */

function InfoRow({ label, value, onCopy, copied, className = "" }) {
  return (
    <div
      className={
        "flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 " +
        className
      }
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/60">{label}</p>
        <p className="text-white truncate">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white/80 transition flex-shrink-0"
        title="Copiar"
      >
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </div>
  );
}

function StatCard({ title, value, tone }) {
  const toneClass =
    tone === "warn"
      ? "bg-amber-500/15 text-amber-200 border-amber-400/20"
      : "bg-indigo-500/15 text-indigo-200 border-indigo-400/20";
  return (
    <div
      className={`rounded-xl px-4 py-3 border ${toneClass} flex items-center justify-between`}
    >
      <span className="text-sm">{title}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}