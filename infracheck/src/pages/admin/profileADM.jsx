import React, { useMemo, useState } from "react";
import { getUserData, changePassword } from "../../services/authService";
import AutorityLayout from "../../layout/AdminLayout";

export default function ProfileAU() {
  const user = getUserData();
  
  // 👇 ESTADOS PARA CONFIGURACIÓN
  const [showConfig, setShowConfig] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordMessageType, setPasswordMessageType] = useState("success");

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

  // 👇 HANDLER PARA CAMBIO DE CONTRASEÑA
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessageType("error");
      setPasswordMessage("Por favor completa todos los campos.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessageType("error");
      setPasswordMessage("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessageType("error");
      setPasswordMessage("Las contraseñas nuevas no coinciden.");
      return;
    }

    try {
      setIsChangingPassword(true);

      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordMessageType("success");
      setPasswordMessage(
        "Contraseña actualizada correctamente. Por seguridad, necesitas cerrar sesión e iniciar nuevamente para aplicar los cambios."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);

      let msg = "No se pudo actualizar la contraseña. Intenta nuevamente.";
      if (error?.errors && Array.isArray(error.errors) && error.errors.length) {
        msg = error.errors[0];
      } else if (error?.message) {
        msg = error.message;
      }

      setPasswordMessageType("error");
      setPasswordMessage(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

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
      <div className="px-4 sm:px-6 lg:px-10 py-1 max-w-7xl mx-auto">
        {/* Header Card con diseño hero mejorado */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-lg mb-8 dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95">
          {/* Efectos de fondo solo en dark */}
          <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-purple-500/5 to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 hidden dark:block w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 opacity-60" />
          <div className="pointer-events-none absolute bottom-0 left-0 hidden dark:block w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 opacity-60" />
          
          <div className="relative z-10 p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8">
              {/* Avatar mejorado con efecto de brillo */}
              <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r ${rolConfig.gradient} rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300 dark:opacity-30`} />
                <div className={[
                  "relative h-36 w-36 rounded-3xl grid place-items-center text-5xl font-bold shadow-xl transition-all duration-300 group-hover:scale-105",
                  "bg-slate-100 border-2 border-slate-200 text-slate-700",
                  "dark:" + rolConfig.bg,
                  "dark:" + rolConfig.border,
                  "dark:" + rolConfig.text,
                  "dark:" + rolConfig.glow,
                ].join(" ")}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-3xl dark:from-black/20" />
                  <span className="relative drop-shadow-sm dark:drop-shadow-lg">{iniciales}</span>
                </div>
                {/* Badge de estado mejorado */}
                <div className="absolute -bottom-3 -right-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 border-2 border-white shadow-xl dark:border-slate-900">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                  <span className="text-xs font-bold text-emerald-50">{userData.estado}</span>
                </div>
              </div>

              {/* Info principal con mejor jerarquía */}
              <div className="flex-1 text-center lg:text-left space-y-2 w-full">
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight dark:text-white">
                    {userData.nombre}
                  </h1>
                  <div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
                    <span className={[
                      "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg backdrop-blur-sm border",
                      "bg-indigo-600 text-white border-indigo-500/80",
                      "dark:" + rolConfig.badge,
                      "dark:border-white/10",
                    ].join(" ")}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {userData.rol}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-sm font-semibold dark:bg-white/10 dark:text-white/90 dark:border-white/20">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      ID: {user?.user_id || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Última conexión mejorada */}
                <div className="flex items-center gap-3 text-sm justify-center lg:justify-start bg-slate-50 rounded-xl px-5 py-3 border border-slate-200 text-slate-600 w-fit mx-auto lg:mx-0 dark:bg-white/5 dark:border-white/10 dark:text-white/70">
                  <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Última conexión: <span className="text-slate-900 dark:text-white/80">{userData.ultimaConexion}</span></span>
                </div>

                {/* Botones de acción mejorados */}
                <div className="flex gap-3 justify-center lg:justify-start pt-3 flex-wrap">
                  <button className="group flex items-center gap-2.5 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-sm font-semibold transition-all duration-300 hover:shadow-md hover:scale-[1.02] dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20 dark:text-white">
                    <svg className="w-4 h-4 group-hover:rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Perfil
                  </button>
                  {/* 👇 BOTÓN DE CONFIGURACIÓN ACTUALIZADO */}
                  <button
                    onClick={() => setShowConfig((prev) => !prev)}
                    className="group flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/40 hover:scale-[1.02]"
                  >
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

        {/* 👇 PANEL DE CONFIGURACIÓN */}
        {showConfig && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white backdrop-blur-xl p-6 shadow-sm dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/20">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 3a2.25 2.25 0 00-2.25 2.25v1.005a6.75 6.75 0 109.5 0V5.25A2.25 2.25 0 0014.75 3h-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Configuración de cuenta
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 dark:text-white/50">
                  Cambia tu contraseña de acceso.
                </p>
              </div>
            </div>

            {/* Formulario cambio de contraseña */}
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-white/80">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500/70 dark:bg-slate-900/60 dark:border-white/15 dark:text-white"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-white/80">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500/70 dark:bg-slate-900/60 dark:border-white/15 dark:text-white"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-white/80">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500/70 dark:bg-slate-900/60 dark:border-white/15 dark:text-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              </div>

              {passwordMessage && (
                <div
                  className={[
                    "mt-2 rounded-xl px-4 py-3 text-sm flex items-start gap-3 border",
                    passwordMessageType === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-400/40"
                      : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/40",
                  ].join(" ")}
                >
                  <span className="mt-0.5">
                    {passwordMessageType === "success" ? (
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
                          d="M5 13l4 4L19 7"
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
                          d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </span>
                  <span>{passwordMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  {isChangingPassword ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                        ></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
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
                          d="M12 11c.5304 0 1.0391-.2107 1.4142-.5858C13.7893 10.0391 14 9.5304 14 9V7a2 2 0 10-4 0v2c0 .5304.2107 1.0391.5858 1.4142C10.9609 10.7893 11.4696 11 12 11z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 10v8a2 2 0 002 2h8a2 2 0 002-2v-8H6z"
                        />
                      </svg>
                      Cambiar contraseña
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {/* Información de contacto mejorada */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white backdrop-blur-xl p-8 shadow-sm dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95">
              <div className="flex items-center gap-3 mb-7">
                <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-400/20">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Datos</h3>
                  <p className="text-xs text-slate-500 mt-0.5 dark:text-white/50">Datos personales y ubicación</p>
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

/* ---------- Componentes mejorados ---------- */

function InfoRowEnhanced({ icon, label, value, onCopy, copied, className = "" }) {
  return (
    <div className={[
      "group relative overflow-hidden rounded-xl p-5 transition-all duration-300",
      "bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-sm",
      "dark:bg-white/5 dark:hover:bg-white/[0.08] dark:border-white/10 dark:hover:border-white/20 dark:shadow-lg dark:hover:shadow-white/5",
      className
    ].join(" ")}>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600 flex-shrink-0 transition-colors duration-300 group-hover:bg-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:group-hover:bg-indigo-500/20">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-white/50">{label}</p>
          <p className="text-base font-semibold truncate text-slate-900 dark:text-white">{value}</p>
        </div>
        <button
          onClick={onCopy}
          className="flex-shrink-0 p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/10 dark:hover:border-white/20 dark:text-white/80 dark:hover:text-white"
          title="Copiar"
        >
          {copied ? (
            <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
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