import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix iconos Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const NavItem = ({ icon, label }) => (
  <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition">
    <span className="text-xl">{icon}</span>
    <span className="text-sm md:text-base">{label}</span>
  </button>
);

const Sidebar = () => (
  <aside className="w-64 shrink-0">
    <div className="flex flex-col items-center gap-2 py-6">
      <div className="h-16 w-16 rounded-full bg-indigo-500/20 grid place-items-center">
        <span className="text-3xl">🚗</span>
      </div>
      <h1 className="text-2xl font-semibold">InfraCheck</h1>
    </div>

    <div className="bg-[#161925] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.35)] overflow-hidden">
      <div className="py-4">
        <nav className="flex flex-col gap-1">
          <NavItem icon="🏠" label="Home" />
          <NavItem icon="⚠️" label="Reportes" />
          <NavItem icon="📍" label="Mapa" />
          <NavItem icon="👤" label="Perfil" />
          <NavItem icon="❓" label="Ayuda" />
          <NavItem icon="⚙️" label="Ajustes" />
        </nav>
      </div>

      <div className="mt-10 p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300/50" />
          <div className="text-lg">Persona</div>
        </div>
      </div>
    </div>
  </aside>
);

const Badge = ({ children }) => (
  <span className="px-3 py-1 rounded-lg bg-indigo-600/70 text-white text-sm">{children}</span>
);

const HomeUsuario = () => {
  const [position] = useState([-34.234, 123.213]);
  const [reportes] = useState([1, 2]); // solo placeholders visuales

  return (
    <div className="min-h-screen bg-[#1b1b1d] text-white">
      {/* título superior sutil */}
      <div className="max-w-7xl mx-auto px-4 pt-4 text-xs tracking-widest text-white/70">
        HOME USUARIO
      </div>

      {/* tarjeta grande contenedora */}
      <div className="max-w-7xl mx-auto px-4 pb-10 pt-4">
        <div className="rounded-3xl border border-indigo-200/40 bg-[#0e1218] p-4 md:p-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <Sidebar />

            {/* Main grid */}
            <div className="flex-1 grid grid-cols-12 gap-6">
              {/* panel central (mapa + cards) */}
              <section className="col-span-12 lg:col-span-8">
                {/* cabecera lat/long */}
                <div className="flex justify-end gap-4 pr-1 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80">Latitud</span>
                    <Badge>{position[0]}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80">Longitud</span>
                    <Badge>{position[1]}</Badge>
                  </div>
                </div>

                {/* mapa */}
                <div className="rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,.45)]">
                  <MapContainer
                    center={position}
                    zoom={13}
                    className="h-[320px] w-full"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    />
                    <Marker position={position}>
                      <Popup>Mark</Popup>
                    </Marker>
                  </MapContainer>
                </div>

                {/* reportes recientes */}
                <div className="mt-4 text-sm text-white/85">Reportes Recientes</div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reportes.map((i) => (
                    <div
                      key={i}
                      className="h-28 rounded-2xl bg-[#4667b6]/85 shadow-lg"
                    />
                  ))}
                </div>
              </section>

              {/* panel derecho (formulario) */}
              <aside className="col-span-12 lg:col-span-4">
                <div className="bg-[#0f141c] rounded-2xl shadow-[0_10px_28px_rgba(0,0,0,.45)] p-6 relative">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Nuevo Reporte</h2>
                    <button
                      type="button"
                      className="h-8 w-8 grid place-items-center rounded-lg bg-indigo-600/80 hover:bg-indigo-500 transition"
                      title="Enviar"
                    >
                      📨
                    </button>
                  </div>

                  <form className="mt-5 space-y-4">
                    <div>
                      <label className="block text-sm mb-1 text-white/90">Titulo</label>
                      <input
                        type="text"
                        className="w-full rounded-xl bg-[#4667b6]/85 text-white placeholder-white/70 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder=""
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1 text-white/90">Descripción</label>
                      <textarea
                        rows={4}
                        className="w-full rounded-xl bg-[#4667b6]/85 text-white placeholder-white/70 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder=""
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1 text-white/90">Categoria del Problema</label>
                      <input
                        type="text"
                        className="w-full rounded-xl bg-[#4667b6]/85 text-white placeholder-white/70 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1 text-white/90">Ubicación</label>
                      <input
                        type="text"
                        className="w-full rounded-xl bg-[#4667b6]/85 text-white placeholder-white/70 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1 text-white/90">Nivel de Urgencia</label>
                      <select className="w-full rounded-xl bg-[#4667b6]/85 text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                        <option value="">Selecciona…</option>
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="mt-2 w-28 ml-auto block rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 font-semibold transition"
                    >
                      Guardar
                    </button>
                  </form>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeUsuario;
