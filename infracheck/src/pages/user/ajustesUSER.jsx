// src/pages/autority/ajustesAU.jsx
import React, { useState } from "react";
import UserLayout from "../../layout/UserLayout";
import { User, Bell, Shield, FileText, ChevronRight } from "lucide-react";

// Helpers UI sin dependencias extras
const Card = ({ className = "", children, onClick }) => {
  const isClickable = typeof onClick === "function";

  return (
    <div
      onClick={onClick}
      className={
        "rounded-2xl bg-white border border-slate-200 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.3)] p-4 sm:p-5 " +
        "dark:bg-[#0f1424] dark:border-white/5 " +
        (isClickable
          ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-[#111832] transition-colors"
          : "") +
        " " +
        className
      }
      {...(isClickable
        ? { role: "button", tabIndex: 0 }
        : {})}
    >
      {children}
    </div>
  );
};

const ToggleSwitch = ({ enabled, onToggle, label, hint }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-slate-900 text-sm sm:text-base dark:text-white/90">
        {label}
      </p>
      {hint ? (
        <p className="text-slate-500 text-xs mt-0.5 dark:text-white/50">
          {hint}
        </p>
      ) : null}
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-gray-600"
      }`}
      aria-pressed={enabled}
      aria-label={label}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

function AjustesContent() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reportes: true,
    alertas: true,
  });
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [idioma, setIdioma] = useState("es");
  const [zona, setZona] = useState("america/santiago");

  const ajustesOptions = [
    {
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Cuenta",
      description: "Gestiona tu información personal y preferencias",
      action: () => console.log("Navegar a cuenta"),
    },
    {
      icon: <Bell className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Notificaciones",
      description: "Configura alertas y notificaciones del sistema",
      action: () => console.log("Navegar a notificaciones"),
    },
    {
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Seguridad",
      description: "Configuración de seguridad y privacidad",
      action: () => console.log("Navegar a seguridad"),
    },
    {
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Reportes",
      description: "Configuración de reportes y exportaciones",
      action: () => console.log("Navegar a reportes"),
    },
  ];

  const toggleNotification = (key) =>
    setNotifications((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    const payload = { notifications, darkMode, autoSave, idioma, zona };
    console.log("Guardar cambios:", payload);
    // TODO: enviar al backend si corresponde
  };

  const handleReset = () => {
    setNotifications({
      email: true,
      push: false,
      reportes: true,
      alertas: true,
    });
    setDarkMode(true);
    setAutoSave(true);
    setIdioma("es");
    setZona("america/santiago");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto space-y-6 Sans-serif">
      {/* Opciones principales */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 dark:text-white">
          Configuraciones Generales
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {ajustesOptions.map((option, index) => (
            <Card key={index} onClick={option.action}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200 flex-shrink-0 dark:bg-indigo-600/30 dark:border-indigo-400/30">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {option.icon}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-slate-900 text-base sm:text-lg font-medium truncate dark:text-white">
                      {option.title}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 leading-tight dark:text-white/60">
                      {option.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0 ml-2 dark:text-white/50" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Notificaciones */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 dark:text-white">
          Preferencias de Notificación
        </h2>
        <Card className="space-y-4">
          <ToggleSwitch
            enabled={notifications.email}
            onToggle={() => toggleNotification("email")}
            label="Notificaciones por Email"
            hint="Te avisaremos sobre cambios importantes en reportes y tu cuenta."
          />
          <ToggleSwitch
            enabled={notifications.push}
            onToggle={() => toggleNotification("push")}
            label="Notificaciones Push"
            hint="Ideal si usas la app frecuentemente en tu navegador."
          />
          <ToggleSwitch
            enabled={notifications.reportes}
            onToggle={() => toggleNotification("reportes")}
            label="Alertas de Reportes"
            hint="Recibe avisos cuando cambie el estado de tus reportes."
          />
          <ToggleSwitch
            enabled={notifications.alertas}
            onToggle={() => toggleNotification("alertas")}
            label="Alertas del Sistema"
            hint="Mensajes importantes sobre mantenimiento o actualizaciones."
          />
        </Card>
      </section>

      {/* (Espacio futuro: idioma / zona horaria / auto guardado, si quieres UI) */}
      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
        >
          Guardar Cambios
        </button>
        <button
          onClick={handleReset}
          className="sm:px-6 bg-slate-200 hover:bg-slate-300 text-slate-900 py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
}

export default function AjustesAU() {
  return (
    <UserLayout title="Configuración">
      <AjustesContent />
    </UserLayout>
  );
}
