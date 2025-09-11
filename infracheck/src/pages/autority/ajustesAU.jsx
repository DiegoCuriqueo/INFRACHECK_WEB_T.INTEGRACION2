// src/pages/autority/ajustesAU.jsx
import React, { useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";

import { User, Bell, Shield, FileText, ChevronRight } from "lucide-react";


// Helpers UI sin dependencias extras
const Card = ({ className = "", children }) => (
  <div
    className={
      "rounded-2xl bg-[#0f1424] border border-white/5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] p-4 sm:p-5 " +
      className
    }
  >
    {children}
  </div>
);

const ToggleSwitch = ({ enabled, onToggle, label, hint }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-white/90 text-sm sm:text-base">{label}</p>
      {hint ? <p className="text-white/50 text-xs mt-0.5">{hint}</p> : null}
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        enabled ? "bg-indigo-600" : "bg-gray-600"
      }`}
      aria-pressed={enabled}
      aria-label={label}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
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
    setNotifications({ email: true, push: false, reportes: true, alertas: true });
    setDarkMode(true);
    setAutoSave(true);
    setIdioma("es");
    setZona("america/santiago");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto space-y-6">
      {/* Opciones principales */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
          Configuraciones Generales
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {ajustesOptions.map((option, index) => (
            <Card
              key={index}
              className="hover:bg-[#111832] transition-colors cursor-pointer"
              onClick={option.action}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600/30 rounded-full flex items-center justify-center border border-indigo-400/30 flex-shrink-0">
                    <span className="text-indigo-400">{option.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white text-base sm:text-lg font-medium truncate">
                      {option.title}
                    </h3>
                    <p className="text-white/60 text-xs sm:text-sm line-clamp-2 leading-tight">
                      {option.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 flex-shrink-0 ml-2" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Notificaciones */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
          Preferencias de Notificación
        </h2>
        <Card className="space-y-4">
          <ToggleSwitch
            enabled={notifications.email}
            onToggle={() => toggleNotification("email")}
            label="Notificaciones por Email"
          />
          <ToggleSwitch
            enabled={notifications.push}
            onToggle={() => toggleNotification("push")}
            label="Notificaciones Push"
          />
          <ToggleSwitch
            enabled={notifications.reportes}
            onToggle={() => toggleNotification("reportes")}
            label="Alertas de Reportes"
          />
          <ToggleSwitch
            enabled={notifications.alertas}
            onToggle={() => toggleNotification("alertas")}
            label="Alertas del Sistema"
          />
        </Card>
      </section>

      {/* Preferencias de aplicación */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
          Preferencias de Aplicación
        </h2>
        <Card className="space-y-4">
          <ToggleSwitch
            enabled={darkMode}
            onToggle={() => setDarkMode(!darkMode)}
            label="Modo Oscuro"
          />
          <ToggleSwitch
            enabled={autoSave}
            onToggle={() => setAutoSave(!autoSave)}
            label="Guardado Automático"
          />

          <div className="pt-4 border-t border-white/10">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-white/90">Idioma</label>
                <select
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                  className="w-full bg-[#0f141c] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-indigo-200/20 text-sm sm:text-base"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-white/90">Zona Horaria</label>
                <select
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="w-full bg-[#0f141c] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-indigo-200/20 text-sm sm:text-base"
                >
                  <option value="america/santiago">Santiago (UTC-3)</option>
                  <option value="america/mexico_city">Ciudad de México (UTC-6)</option>
                  <option value="america/bogota">Bogotá (UTC-5)</option>
                  <option value="america/lima">Lima (UTC-5)</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      </section>

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
          className="sm:px-6 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
}

export default function AjustesAU() {
  // Si tu DashboardLayout no acepta `title`, quita la prop.
  return (
    <DashboardLayout title="Configuración">
      <AjustesContent />
    </DashboardLayout>
  );
}
