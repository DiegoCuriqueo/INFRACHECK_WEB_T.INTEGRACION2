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
import { getReportes } from "../../services/reportsService";
import { 
  getReportCircleStyle, 
  generateReportPopup, 
  filterReports,
  getMapStats,
  REPORT_COLORS 
} from "../../services/mapReportsHelper";

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
// Eliminamos las zonas de riesgo que se estaban mostrando en el mapa
// const RISK_ZONES = [
//   { id: "z1", lat: -38.7418, lng: -72.605, nivel: "alta",  titulo: "Cruce congestionado",   desc: "Alto flujo y mala visibilidad." },
//   { id: "z2", lat: -38.7375, lng: -72.590, nivel: "media", titulo: "Curva pronunciada",     desc: "Accesos sin señalización clara." },
//   { id: "z3", lat: -38.7440, lng: -72.582, nivel: "baja",  titulo: "Zona escolar",          desc: "Tránsito moderado, pasos peatonales." },
//   { id: "z4", lat: -38.7325, lng: -72.610, nivel: "alta",  titulo: "Intersección crítica",  desc: "Historial de incidentes." },
//   { id: "z5", lat: -38.7490, lng: -72.596, nivel: "media", titulo: "Puente angosto",        desc: "Reducción de pista." },
// ];

const COLORS = {
  alta:  { stroke: "#f43f5e", fill: "rgba(244,63,94,0.25)" },
  media: { stroke: "#f59e0b", fill: "rgba(245,158,11,0.25)" },
  baja:  { stroke: "#10b981", fill: "rgba(16,185,129,0.25)" },
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
  const initial = useMemo(() => ({ lat: -38.7397, lng: -72.5984 }), []);
  const [pos, setPos] = useState(initial);

  // Reportes
  const [reports, setReports] = useState([]);
  const [showReports, setShowReports] = useState(true);
  
  // Filtros de reportes
  const [reportFilters, setReportFilters] = useState({
    categories: [],
    urgencies: ["alta", "media", "baja"]
  });

  // Toast
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Cargar reportes
  useEffect(() => {
    const loadReports = () => {
      const allReports = getReportes();
      setReports(allReports);
    };
    
    loadReports();
    // Recargar cada 30 segundos para reflejar cambios
    const interval = setInterval(loadReports, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // Filtrar reportes
  const filteredReports = useMemo(() => {
    return filterReports(reports, reportFilters);
  }, [reports, reportFilters]);

  // Estadísticas
  const stats = useMemo(() => getMapStats(filteredReports), [filteredReports]);

  // Toggle categoría de reporte
  const toggleCategory = (cat) => {
    setReportFilters(prev => {
      const cats = prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: cats };
    });
  };

  // Toggle urgencia de reporte
  const toggleUrgency = (urg) => {
    setReportFilters(prev => {
      const urgs = prev.urgencies.includes(urg)
        ? prev.urgencies.filter(u => u !== urg)
        : [...prev.urgencies, urg];
      return { ...prev, urgencies: urgs };
    });
  };

  return (
    <UserLayout title="Mapa">
      <div className="space-y-4">
        <header className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Mapa Interactivo</h1>
              <p className="text-sm text-slate-400">
                Visualiza reportes ciudadanos en tiempo real
              </p>
            </div>
          </div>

          {/* Controles de visualización */}
          <div className="flex flex-wrap gap-3">
            {/* Toggle Reportes */}
            <label className={cls(
              "select-none cursor-pointer rounded-lg px-3 py-1.5 text-sm ring-1 ring-white/10",
              showReports ? "bg-indigo-600 text-white" : "bg-slate-800/30 text-slate-300"
            )}>
              <input
                type="checkbox"
                checked={showReports}
                onChange={(e) => setShowReports(e.target.checked)}
                className="mr-2 align-middle accent-indigo-500"
              />
              Reportes ({filteredReports.length})
            </label>

            {/* Filtros de urgencia de reportes */}
            {showReports && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <span className="text-xs text-slate-400">Urgencia:</span>
                {["alta", "media", "baja"].map((urg) => (
                  <button
                    key={urg}
                    onClick={() => toggleUrgency(urg)}
                    className={cls(
                      "px-2 py-1 text-xs rounded ring-1 ring-white/10",
                      reportFilters.urgencies.includes(urg)
                        ? "bg-slate-700 text-white"
                        : "bg-slate-800/30 text-slate-400"
                    )}
                  >
                    {urg[0].toUpperCase() + urg.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* Filtros de categorías */}
            {showReports && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <span className="text-xs text-slate-400">Categoría:</span>
                {Object.entries(REPORT_COLORS).map(([cat, color]) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={cls(
                      "px-2 py-1 text-xs rounded ring-1",
                      reportFilters.categories.length === 0 || reportFilters.categories.includes(cat)
                        ? "text-white"
                        : "bg-slate-800/30 text-slate-400"
                    )}
                    style={{
                      backgroundColor: reportFilters.categories.length === 0 || reportFilters.categories.includes(cat) ? color : undefined,
                      borderColor: color
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Estadísticas */}
          {showReports && filteredReports.length > 0 && (
            <div className="flex gap-4 text-xs">
              <span className="text-slate-400">
                Mostrando: <b className="text-slate-200">{filteredReports.length}</b> reportes
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-400">
                Alta: <b className="text-red-400">{stats.porUrgencia.alta || 0}</b>
              </span>
              <span className="text-slate-400">
                Media: <b className="text-amber-400">{stats.porUrgencia.media || 0}</b>
              </span>
              <span className="text-slate-400">
                Baja: <b className="text-emerald-400">{stats.porUrgencia.baja || 0}</b>
              </span>
            </div>
          )}
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

          <MapContainer center={[pos.lat, pos.lng]} zoom={13} scrollWheelZoom className="h-[520px]">
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OSM Standard">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="OpenTopoMap">
                <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution="&copy; OpenTopoMap, &copy; OpenStreetMap contributors" />
              </LayersControl.BaseLayer>
            </LayersControl>

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

            {/* Reportes ciudadanos */}
            {showReports && filteredReports.map((report) => (
              <CircleMarker
                key={report.id}
                center={[report.lat, report.lng]}
                pathOptions={getReportCircleStyle(report.originalCategory, report.urgency)}
              >
                <Popup>
                  <div dangerouslySetInnerHTML={{ __html: generateReportPopup(report) }} />
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={cls(
            "fixed bottom-5 right-6 z-[500] px-4 py-3 rounded-lg text-sm shadow-lg ring-1",
            toast.type === "warn" ? "bg-amber-600 text-white ring-white/10" : "bg-emerald-600 text-white ring-white/10"
          )}
        >
          {toast.msg}
        </div>
      )}
    </UserLayout>
  );
}
