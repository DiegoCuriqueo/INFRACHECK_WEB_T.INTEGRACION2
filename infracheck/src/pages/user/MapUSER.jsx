import React, { useMemo, useState, useEffect } from "react";
import UserLayout from "../../layout/UserLayout";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ---- Fix icono por bundlers ---- */
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/* ---- Helpers ---- */
const fmt = (n) => Number(n).toFixed(4);
const cls = (...c) => c.filter(Boolean).join(" ");

/* ---- Datos demo de zonas de riesgo (Temuco aprox) ---- */
const RISK_ZONES = [
  { id: "z1", lat: -38.7418, lng: -72.605, nivel: "alta",  titulo: "Cruce congestionado",   desc: "Alto flujo y mala visibilidad." },
  { id: "z2", lat: -38.7375, lng: -72.590, nivel: "media", titulo: "Curva pronunciada",     desc: "Accesos sin señalización clara." },
  { id: "z3", lat: -38.7440, lng: -72.582, nivel: "baja",  titulo: "Zona escolar",          desc: "Tránsito moderado, pasos peatonales." },
  { id: "z4", lat: -38.7325, lng: -72.610, nivel: "alta",  titulo: "Intersección crítica",  desc: "Historial de incidentes." },
  { id: "z5", lat: -38.7490, lng: -72.596, nivel: "media", titulo: "Puente angosto",        desc: "Reducción de pista." },
];

const COLORS = {
  alta:  { stroke: "#f43f5e", fill: "rgba(244,63,94,0.25)" },   // rose
  media: { stroke: "#f59e0b", fill: "rgba(245,158,11,0.25)" },  // amber
  baja:  { stroke: "#10b981", fill: "rgba(16,185,129,0.25)" },  // emerald
};

/* ---- Iconitos ---- */
const Crosshair = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 2v3m0 14v3m9-9h-3M6 12H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const Reset = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 0 0-14.14-4.94M4 16a8 8 0 0 0 14.14 4.94" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ---- Capturar clicks del mapa ---- */
function MapClick({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapUSER() {
  // Centro inicial (Temuco)
  const initial = useMemo(() => ({ lat: -38.7397, lng: -72.5984 }), []);
  const [pos, setPos] = useState(initial);

  // Filtro de niveles visibles
  const [show, setShow] = useState({ alta: true, media: true, baja: true });

  // Toast simple
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Geolocalización
  const locate = () => {
    if (!navigator.geolocation) {
      setToast({ type: "warn", msg: "Geolocalización no disponible." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setToast({ type: "warn", msg: "No se pudo obtener tu ubicación." }),
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const totalVisibles = RISK_ZONES.filter((z) => show[z.nivel]).length;

  return (
    <UserLayout title="Mapa">
      <div className="space-y-4">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Mapa de Zonas de Riesgo</h1>
            <p className="text-sm text-slate-400">
              Interactividad libre. Muestra zonas con nivel estimado de riesgo de accidente.
            </p>
          </div>

          {/* Filtros por nivel */}
          <div className="flex items-center gap-2">
            {["alta", "media", "baja"].map((k) => (
              <label
                key={k}
                className={cls(
                  "select-none cursor-pointer rounded-lg px-3 py-1.5 text-sm ring-1 ring-white/10",
                  show[k] ? "bg-slate-800/70 text-white" : "bg-slate-800/30 text-slate-300"
                )}
              >
                <input
                  type="checkbox"
                  checked={show[k]}
                  onChange={(e) => setShow((s) => ({ ...s, [k]: e.target.checked }))}
                  className="mr-2 align-middle accent-indigo-500"
                />
                {k[0].toUpperCase() + k.slice(1)}
              </label>
            ))}
            <span className="ml-2 text-xs text-slate-400">
              Mostrando: <b>{totalVisibles}</b> zonas
            </span>
          </div>
        </header>

        {/* MAPA */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 ring-1 ring-white/10">
          {/* Chips coord */}
          <div className="absolute z-[400] left-1/2 -translate-x-1/2 top-3 flex gap-3 text-[11px]">
            <div className="px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur text-slate-100 ring-1 ring-white/10 shadow-sm">
              <span className="uppercase tracking-wider mr-1.5 text-slate-300">Latitud</span>
              <span className="px-2 py-0.5 rounded bg-slate-700/70">{fmt(pos.lat)}</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur text-slate-100 ring-1 ring-white/10 shadow-sm">
              <span className="uppercase tracking-wider mr-1.5 text-slate-300">Longitud</span>
              <span className="px-2 py-0.5 rounded bg-slate-700/70">{fmt(pos.lng)}</span>
            </div>
          </div>

          {/* Controles flotantes */}
          <div className="absolute z-[400] right-3 top-3 flex flex-col gap-2">
            <button
              onClick={locate}
              className="h-9 w-9 grid place-content-center rounded-lg bg-slate-900/80 text-slate-200 ring-1 ring-white/10 hover:bg-slate-800/80"
              title="Usar mi ubicación"
            >
              <Crosshair className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPos(initial)}
              className="h-9 w-9 grid place-content-center rounded-lg bg-slate-900/80 text-slate-200 ring-1 ring-white/10 hover:bg-slate-800/80"
              title="Volver al inicio"
            >
              <Reset className="h-5 w-5" />
            </button>
          </div>

          {/* Leyenda */}
          <div className="absolute z-[400] left-3 bottom-3 rounded-lg bg-slate-900/80 backdrop-blur px-3 py-2 ring-1 ring-white/10 text-xs text-slate-200">
            <p className="mb-1 font-medium">Leyenda</p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="h-3 w-3 rounded-full" style={{ background: COLORS.alta.stroke }} /> Alta
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-3 w-3 rounded-full" style={{ background: COLORS.media.stroke }} /> Media
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-3 w-3 rounded-full" style={{ background: COLORS.baja.stroke }} /> Baja
              </span>
            </div>
          </div>

          <MapContainer center={[pos.lat, pos.lng]} zoom={13} scrollWheelZoom className="h-[520px]">
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OSM Standard">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="OpenTopoMap">
                <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution="&copy; OpenTopoMap, &copy; OpenStreetMap contributors" />
              </LayersControl.BaseLayer>
            </LayersControl>

            {/* Click para mover el centro */}
            <MapClick onPick={setPos} />

            {/* Marcador de referencia */}
            <Marker icon={markerIcon} position={[pos.lat, pos.lng]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">Centro actual</p>
                  <p className="text-slate-600">Lat: {fmt(pos.lat)} | Lng: {fmt(pos.lng)}</p>
                </div>
              </Popup>
            </Marker>

            {/* Zonas de riesgo (filtradas) */}
            {RISK_ZONES.filter((z) => show[z.nivel]).map((z) => (
              <CircleMarker
                key={z.id}
                center={[z.lat, z.lng]}
                radius={16}
                pathOptions={{ color: COLORS[z.nivel].stroke, weight: 2, fillColor: COLORS[z.nivel].fill, fillOpacity: 1 }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium">{z.titulo}</p>
                    <p className="text-xs text-slate-500 capitalize">Nivel: {z.nivel}</p>
                    <p className="mt-1 text-slate-700">{z.desc}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <p className="text-[12px] text-slate-400">
          * Haz clic en el mapa para mover el centro. Puedes alternar capas en la esquina superior derecha.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={cls(
            "fixed bottom-5 right-6 z-[500] px-4 py-2 rounded-lg text-sm shadow-lg ring-1",
            toast.type === "warn" ? "bg-amber-600 text-white ring-white/10" : "bg-emerald-600 text-white ring-white/10"
          )}
        >
          {toast.msg}
        </div>
      )}
    </UserLayout>
  );
}
