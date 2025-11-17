// PerfilUser.jsx
import React, { useMemo, useState, useEffect } from "react";
import { getUserData, changePassword } from "../../services/authService";
import { getReportes, deleteReporte } from "../../services/reportsService";
import AutorityLayout from "../../layout/UserLayout";
// 👇 Notificaciones
import {
  isNotificationsEnabled,
  setNotificationsEnabled,
} from "../../services/notificationsServices";

export default function ProfileAU() {
  const FALLBACK_IMG =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%' height='100%' fill='rgb(30,41,59)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='rgb(148,163,184)' font-family='sans-serif' font-size='16'>Sin imagen</text></svg>`
    );
  const user = getUserData();

  // Estado para los reportes del usuario
  const [userReports, setUserReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [deleteMessageType, setDeleteMessageType] = useState("success");

  // Estado para Configuración y cambio de contraseña
  const [showConfig, setShowConfig] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordMessageType, setPasswordMessageType] = useState("success");

  // 👇 Estado de notificaciones (activadas / desactivadas)
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);

  // Cargar reportes del usuario desde la API /api/reports/user/
  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        setLoadingReports(true);
        console.log(
          "🔄 Cargando TODOS los reportes y filtrando los del usuario…"
        );

        const allReports = await getReportes(); // trae todos
        const onlyMine = Array.isArray(allReports)
          ? allReports.filter((r) => isMyReport(r, user))
          : [];

        console.log("✅ Reportes del usuario:", onlyMine.length);

        setUserReports(onlyMine);
      } catch (error) {
        console.error("❌ Error al cargar reportes:", error);
        setUserReports([]);
      } finally {
        setLoadingReports(false);
      }
    };

    if (user) {
      fetchUserReports();
    } else {
      setLoadingReports(false);
      setUserReports([]);
    }
  }, [user?.user_id]);

  // Inicializar estado de notificaciones desde localStorage
  useEffect(() => {
    setNotificationsEnabledState(isNotificationsEnabled());
  }, []);

  const userData = {
    nombre: user?.username || "Usuario",
    email: user?.email || "Sin email",
    rut: user?.rut || "Sin RUT",
    direccion: "Av. Alemania 123, Temuco",
    rol: user?.rous_nombre || user?.rol_nombre || "Usuario",
    estado: "Activo",
    ultimaConexion: new Date().toLocaleString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      console.error("Error al copiar:", err);
    }
  };

  const rolConfig = useMemo(() => {
    const rousId = user?.rous_id || user?.rol;

    switch (rousId) {
      case 1:
        return {
          bg: "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
          border: "border-purple-400/40",
          text: "text-purple-300",
          badge: "bg-purple-500/90",
          glow: "shadow-purple-500/20",
          gradient: "from-purple-500 to-purple-600",
        };
      case 2:
        return {
          bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
          border: "border-blue-400/40",
          text: "text-blue-300",
          badge: "bg-blue-500/90",
          glow: "shadow-blue-500/20",
          gradient: "from-blue-500 to-blue-600",
        };
      case 3:
        return {
          bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10",
          border: "border-emerald-400/40",
          text: "text-emerald-300",
          badge: "bg-emerald-500/90",
          glow: "shadow-emerald-500/20",
          gradient: "from-emerald-500 to-emerald-600",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-indigo-500/20 to-indigo-600/10",
          border: "border-indigo-400/40",
          text: "text-indigo-300",
          badge: "bg-indigo-500/90",
          glow: "shadow-indigo-500/20",
          gradient: "from-indigo-500 to-indigo-600",
        };
    }
  }, [user?.rous_id, user?.rol]);

  const handleDeleteReport = async (id) => {
    const ok = window.confirm(
      "¿Seguro que quieres eliminar este reporte? Se ocultará de los listados públicos."
    );
    if (!ok) return;

    setDeletingId(id);
    setDeleteMessage(null);

    try {
      const success = await deleteReporte(id);

      if (success) {
        setUserReports((prev) => prev.filter((r) => r.id !== id));
        setDeleteMessageType("success");
        setDeleteMessage("Reporte eliminado correctamente.");
      } else {
        setDeleteMessageType("error");
        setDeleteMessage("No se pudo eliminar el reporte. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error al eliminar reporte:", err);
      setDeleteMessageType("error");
      setDeleteMessage("Ocurrió un error inesperado al eliminar el reporte.");
    } finally {
      setDeletingId(null);
    }
  };

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
      setPasswordMessage(
        "La nueva contraseña debe tener al menos 6 caracteres."
      );
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

  //Handler para activar/desactivar notificaciones
  const handleToggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabledState(next);
    setNotificationsEnabled(next);
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
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${rolConfig.gradient} rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300 dark:opacity-30`}
                />
                <div
                  className={[
                    "relative h-32 w-32 sm:h-36 sm:w-36 rounded-3xl grid place-items-center text-4xl sm:text-5xl font-bold shadow-xl transition-all duration-300 group-hover:scale-105",
                    "bg-slate-100 border border-slate-200 text-slate-700",
                    "dark:" + rolConfig.bg,
                    "dark:" + rolConfig.border,
                    "dark:" + rolConfig.text,
                    "dark:" + rolConfig.glow,
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
                        "dark:border-white/10",
                      ].join(" ")}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
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

                  <button
                    onClick={() => setShowConfig((prev) => !prev)}
                    className="group flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/40 hover:scale-[1.02]"
                  >
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

        {/* Panel de Configuración */}
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
                  Configura tus notificaciones y cambia tu contraseña de acceso.
                </p>
              </div>
            </div>

            {/* Preferencias de notificaciones */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 flex items-center justify-between gap-4 dark:bg-slate-900/60 dark:border-white/10">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Notificaciones en la aplicación
                </p>
                <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
                  Muestra avisos en la esquina inferior izquierda cuando haya
                  actualizaciones sobre tus reportes.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleNotifications}
                className="relative inline-flex h-6 w-11 items-center rounded-full border border-slate-300 bg-slate-200 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600"
                aria-pressed={notificationsEnabled}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    notificationsEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
                <span className="sr-only">Toggle notificaciones</span>
                <span
                  className={`absolute inset-0 rounded-full transition-opacity ${
                    notificationsEnabled
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 opacity-60"
                      : "opacity-0"
                  }`}
                />
              </button>
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text:white">
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
                    userReports?.filter((r) => r.status === "resuelto").length ||
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
                      (r) =>
                        r.status === "pendiente" || r.status === "en_proceso"
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

        {/* Mis reportes */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white backdrop-blur-xl p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
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
                    d="M8 7h12M8 12h12M8 17h6M3 7h.01M3 12h.01M3 17h.01"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Mis reportes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
                  Reportes que has creado con tu cuenta.
                </p>
              </div>
            </div>
            {deleteMessage && (
              <div
                className={[
                  "mb-4 rounded-xl px-4 py-3 text-sm flex items-start gap-3 border",
                  deleteMessageType === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-400/40"
                    : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/40",
                ].join(" ")}
              >
                <span className="mt-0.5">
                  {deleteMessageType === "success" ? "✅" : "⚠️"}
                </span>
                <span>{deleteMessage}</span>
              </div>
            )}
            {!loadingReports && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total: <b>{userReports.length}</b> reporte
                {userReports.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {loadingReports ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cargando reportes…
            </p>
          ) : userReports.length === 0 ? (
            <div className="text-sm text-slate-600 rounded-xl bg-slate-50 border border-slate-200 px-4 py-6 text-center dark:bg-slate-900/60 dark:border-white/10 dark:text-slate-300">
              Aún no has creado ningún reporte.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userReports.map((r) => (
                <article
                  key={r.id}
                  className="flex gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3 hover:border-indigo-300 hover:shadow-md transition dark:bg-slate-900/70 dark:border-white/10 dark:hover:border-indigo-400/60"
                >
                  <div className="h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800/60">
                    <img
                      src={r.imageDataUrl || r.image || FALLBACK_IMG}
                      alt={r.title || "Reporte"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.src !== FALLBACK_IMG) {
                          e.currentTarget.src = FALLBACK_IMG;
                        }
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 truncate dark:text-slate-50">
                        {r.title || "Reporte sin título"}
                      </h4>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border bg-slate-100 text-slate-700 dark:bg-slate-800/70 dark:text-slate-100">
                        {r.statusLabel || "Estado"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5 truncate dark:text-slate-400">
                      {r.address}
                    </p>

                    <p className="text-xs text-slate-700 mt-1 line-clamp-2 dark:text-slate-300">
                      {r.summary || r.description || "Sin descripción."}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{r.city || "Temuco"}</span>
                      <span>Urgencia: {r.urgency || "media"}</span>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(r.id)}
                        disabled={deletingId === r.id}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/40 dark:hover:bg-rose-500/20"
                      >
                        {deletingId === r.id ? (
                          <>
                            <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          <>🗑️ Eliminar</>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AutorityLayout>
  );
}

/* ---------- Componentes ---------- */
function isMyReport(report, user) {
  if (!user || !report) return false;

  // posibles IDs del usuario
  const userIds = [user.id, user.userId, user.user_id, user.usu_id]
    .filter((v) => v !== undefined && v !== null)
    .map((v) => String(v));

  // posibles nombres
  const usernameVariants = [user.username, user.nombre, user.name]
    .filter(Boolean)
    .map((s) => s.toLowerCase().trim());

  // 1) match por id
  if (
    userIds.length > 0 &&
    report.userId !== undefined &&
    report.userId !== null &&
    userIds.includes(String(report.userId))
  ) {
    return true;
  }

  // 2) match por nombre
  const authorName = (report.user || "").toLowerCase().trim();
  if (authorName && usernameVariants.length > 0) {
    if (usernameVariants.some((name) => name && authorName.includes(name))) {
      return true;
    }
  }

  return false;
}

function InfoRowEnhanced({
  icon,
  label,
  value,
  onCopy,
  copied,
  className = "",
}) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-xl p-4 transition-all duration-300",
        "bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-sm",
        "dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:hover:border-white/20 dark:shadow-lg dark:hover:shadow-white/5",
        className,
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
      gradient: "from-indigo-500 to-indigo-600",
    },
    purple: {
      bg: "from-purple-100 to-purple-50 dark:from-purple-500/20 dark:to-purple-600/5",
      border: "border-purple-200 dark:border-purple-400/30",
      text: "text-purple-600 dark:text-purple-300",
      iconBg: "bg-purple-100 dark:bg-purple-500/20",
      gradient: "from-purple-500 to-purple-600",
    },
    amber: {
      bg: "from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-600/5",
      border: "border-amber-200 dark:border-amber-400/30",
      text: "text-amber-600 dark:text-amber-300",
      iconBg: "bg-amber-100 dark:bg-amber-500/20",
      gradient: "from-amber-500 to-amber-600",
    },
  };

  const config = colorClasses[color];

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-xl bg-gradient-to-br border p-4 cursor-pointer transition-all duration-300",
        config.bg,
        config.border,
        "hover:shadow-md hover:scale-[1.02] dark:hover:shadow-xl",
      ].join(" ")}
    >
      <div
        className={`absolute top-0 right-0 hidden dark:block w-24 h-24 bg-gradient-to-br ${config.gradient} opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500`}
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={[
              "p-3 rounded-xl transition-transform duration-300 group-hover:scale-105",
              config.iconBg,
              config.text,
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
