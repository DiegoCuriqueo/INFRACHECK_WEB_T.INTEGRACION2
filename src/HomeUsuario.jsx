import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import {
  HomeIcon,
  DocumentTextIcon,
  MapIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

/* Leaflet icons fix */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* Helpers UI */
const NavItem = ({ icon, label, active = false }) => (
  <button
    className={
      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition " +
      (active
        ? "bg-slate-800/70 text-white"
        : "text-slate-300 hover:bg-slate-800/50 hover:text-white")
    }
  >
    {icon}
    <span>{label}</span>
  </button>
);

const Sidebar = () => (
  <aside className="h-full w-[260px] shrink-0 rounded-2xl bg-[#0c1018] p-6 shadow-[0_8px_24px_rgba(0,0,0,.35)]">
    <div className="flex flex-col items-start gap-3">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-indigo-500/20">
        <span className="text-3xl">🚗</span>
      </div>
      <h1 className="text-2xl font-semibold">InfraCheck</h1>
    </div>

    <nav className="mt-8 flex flex-col gap-1">
      <NavItem icon={<HomeIcon className="h-5 w-5" />} label="Home" active />
      <NavItem icon={<DocumentTextIcon className="h-5 w-5" />} label="Reportes" />
      <NavItem icon={<MapIcon className="h-5 w-5" />} label="Mapa" />
      <NavItem icon={<UserIcon className="h-5 w-5" />} label="Perfil" />
      <NavItem icon={<QuestionMarkCircleIcon className="h-5 w-5" />} label="Ayuda" />
      <NavItem icon={<Cog6ToothIcon className="h-5 w-5" />} label="Ajustes" />
    </nav>

    <div className="mt-auto pt-8">
      <div className="flex items-center gap-3 rounded-xl bg-slate-800/40 p-3">
        <div className="h-7 w-7 rounded-full bg-slate-600/60" />
        <span className="text-slate-300">Persona</span>
      </div>
    </div>
  </aside>
);

const Badge = ({ label, value }) => (
  <div className="flex items-center gap-2">
    <span className="text-sm text-white/80">{label}</span>
    <span className="rounded-lg bg-slate-800/70 px-3 py-1 text-xs">{value}</span>
  </div>
);

export default function HomeUsuario() {
  // Temuco, Chile
  const [position] = useState([-38.7397, -72.5984]);

  return (
    <div className="min-h-screen w-full bg-[#0f1115] text-slate-100">
      {/* GRID de ancho completo: sidebar | contenido | panel derecho */}
      <div className="grid min-h-screen grid-cols-1 gap-6 p-6 lg:grid-cols-[260px_1fr_380px]">
        {/* Sidebar */}
        <Sidebar />

        {/* Centro (mapa + cards) */}
        <main className="flex flex-col">
          {/* Lat/Lng arriba a la derecha */}
          <div className="mb-3 flex justify-end gap-4">
            <Badge label="Latitud" value={position[0]} />
            <Badge label="Longitud" value={position[1]} />
          </div>

          {/* Mapa */}
          <section className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/40 shadow-[0_12px_32px_rgba(0,0,0,.45)]">
            <MapContainer center={position} zoom={13} className="h-[420px] w-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              />
              <Marker position={position}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">Temuco, Chile</div>
                    <div>Lat: {position[0]}</div>
                    <div>Lng: {position[1]}</div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </section>

          {/* Reportes recientes */}
          <h3 className="mt-4 text-sm text-white/85">Reportes Recientes</h3>
          <div className="mt-3 grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
            <div className="h-28 rounded-2xl border border-slate-700/60 bg-slate-900/40" />
            <div className="h-28 rounded-2xl border border-slate-700/60 bg-slate-900/40" />
          </div>
        </main>

        {/* Panel derecho: formulario */}
        <aside className="rounded-2xl border border-slate-700/60 bg-[#0b0f16] p-6 shadow-[0_10px_28px_rgba(0,0,0,.45)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Nuevo Reporte</h2>
            <button
              type="button"
              title="Enviar"
              className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600/80 transition hover:bg-indigo-500"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>

          <form className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-white/90">Título</label>
              <input className="input" placeholder="Título del reporte" />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/90">Descripción</label>
              <textarea rows={4} className="input resize-none" placeholder="Describe el problema" />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/90">Categoría del Problema</label>
              <input className="input" placeholder="Bache, Alumbrado, etc." />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/90">Ubicación</label>
              <input className="input" placeholder="Calle, número, referencia" />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/90">Nivel de Urgencia</label>
              <select className="input">
                <option value="">Selecciona…</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <button
              type="button"
              className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Guardar
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
