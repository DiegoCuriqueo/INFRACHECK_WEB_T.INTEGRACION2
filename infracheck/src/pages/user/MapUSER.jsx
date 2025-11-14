import React, { useMemo, useState, useEffect, useRef } from "react";
import UserLayout from "../../layout/UserLayout";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Circle,
  LayersControl,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getReportes, categoryDisplayMap } from "../../services/reportsService";
import { getUserData } from "../../services/authService";
import { 
  getReportCircleStyle, 
  generateReportPopup, 
  filterReports,
  getMapStats,
  REPORT_COLORS 
} from "../../services/mapReportsHelper";
import MapSearchBar from "../../components/MapSearchBar";

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

/* ---- Configuración de zonas de riesgo por urgencia ---- */
const RISK_ZONE_CONFIG = {
  alta: {
    radius: 300,
    color: "#dc2626",
    fillOpacity: 0.15,
    weight: 3,
    opacity: 0.7
  },
  media: {
    radius: 200,
    color: "#f59e0b",
    fillOpacity: 0.12,
    weight: 2.5,
    opacity: 0.6
  },
  baja: {
    radius: 100,
    color: "#10b981",
    fillOpacity: 0.1,
    weight: 2,
    opacity: 0.5
  }
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

const UserIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6"/>
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

/* ---- Componente para controlar el mapa desde fuera ---- */
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], zoom || map.getZoom(), {
        animate: true,
        duration: 0.8
      });
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapUSER() {
  const initial = useMemo(() => ({ lat: -38.7397, lng: -72.5984 }), []);
  const [pos, setPos] = useState(initial);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);

  // Usuario actual
  const currentUser = getUserData();

  // Reportes
  const [reports, setReports] = useState([]);
  const [showReports, setShowReports] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  
  // Filtros de reportes
  const [reportFilters, setReportFilters] = useState({
    categories: [],
    urgencies: ["alta", "media", "baja"],
    showMyReportsOnly: false // 🆕 Nuevo filtro
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
    const loadReports = async () => {
      try {
        const allReports = await getReportes();
        console.log('📍 Reportes cargados en mapa:', allReports);
        setReports(allReports);
      } catch (error) {
        console.error('Error al cargar reportes en mapa:', error);
        setReports([]);
        setToast({ type: "warn", msg: "Error al cargar reportes." });
      }
    };
    
    loadReports();
    
    // Recargar cada 30 segundos
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
      (p) => {
        const newPos = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPos(newPos);
        setMapCenter(newPos);
        setMapZoom(15);
        setToast({ type: "success", msg: "📍 Ubicación actualizada" });
      },
      () => setToast({ type: "warn", msg: "No se pudo obtener tu ubicación." }),
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // 🆕 Filtrar reportes (incluyendo "Mis reportes")
  const filteredReports = useMemo(() => {
    let filtered = filterReports(reports, reportFilters);
    
    // Si está activo el filtro "Mis reportes", filtrar por userId
    if (reportFilters.showMyReportsOnly && currentUser) {
      filtered = filtered.filter(report => report.userId === currentUser.user_id);
    }
    
    return filtered;
  }, [reports, reportFilters, currentUser]);

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

  // 🆕 Toggle "Mis reportes"
  const toggleMyReports = () => {
    setReportFilters(prev => ({
      ...prev,
      showMyReportsOnly: !prev.showMyReportsOnly
    }));
    
    const newState = !reportFilters.showMyReportsOnly;
    setToast({ 
      type: "success", 
      msg: newState ? "🔍 Mostrando solo mis reportes" : "🔍 Mostrando todos los reportes" 
    });
  };

  // Handlers para el buscador
  const handleSelectReport = (report) => {
    setMapCenter({ lat: report.lat, lng: report.lng });
    setMapZoom(17);
    setPos({ lat: report.lat, lng: report.lng });
    setToast({ type: "success", msg: `📍 ${report.title}` });
  };

  const handleSelectLocation = (location) => {
    setMapCenter({ lat: location.lat, lng: location.lng });
    setMapZoom(16);
    setPos({ lat: location.lat, lng: location.lng });
    setToast({ type: "success", msg: "📍 Ubicación encontrada" });
  };

  // 🆕 Contar mis reportes
  const myReportsCount = useMemo(() => {
    if (!currentUser) return 0;
    return reports.filter(r => r.userId === currentUser.user_id).length;
  }, [reports, currentUser]);

  return (
    <UserLayout title="Mapa">
      <div className="space-y-4">
        <header className="space-y-4 Sans-serif">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Mapa Interactivo</h1>
              <p className="text-sm text-slate-400">
                Visualiza reportes ciudadanos y sus zonas de riesgo en tiempo real
              </p>
            </div>
          </div>

          {/* Buscador de Reportes y Direcciones */}
          <MapSearchBar
            reports={filteredReports}
            onSelectReport={handleSelectReport}
            onSelectLocation={handleSelectLocation}
            currentPosition={pos}
          />

          {/* Controles de visualización */}
          <div className="flex flex-wrap gap-3">
            {/* Toggle Zonas de Riesgo */}
            <label className={cls(
              "select-none cursor-pointer rounded-lg px-3 py-1.5 text-sm ring-1 ring-white/10 transition-colors",
              showRiskZones ? "bg-rose-600 text-white" : "bg-slate-800/30 text-slate-300"
            )}>
              <input
                type="checkbox"
                checked={showRiskZones}
                onChange={(e) => setShowRiskZones(e.target.checked)}
                className="mr-2 align-middle accent-rose-500"
              />
              Zonas de Riesgo
            </label>

            {/* Toggle Reportes */}
            <label className={cls(
              "select-none cursor-pointer rounded-lg px-3 py-1.5 text-sm ring-1 ring-white/10 transition-colors",
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

            {/* 🆕 Toggle "Mis reportes" */}
            {currentUser && (
              <button
                onClick={toggleMyReports}
                className={cls(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ring-1 ring-white/10 transition-colors",
                  reportFilters.showMyReportsOnly 
                    ? "bg-purple-600 text-white ring-purple-500/50" 
                    : "bg-slate-800/30 text-slate-300 hover:bg-slate-700/30"
                )}
                title="Ver solo mis reportes"
              >
                <UserIcon className="h-4 w-4" />
                Mis reportes ({myReportsCount})
              </button>
            )}

            {/* Filtros de urgencia de reportes */}
            {showReports && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <span className="text-xs text-slate-400">Urgencia:</span>
                {["alta", "media", "baja"].map((urg) => (
                  <button
                    key={urg}
                    onClick={() => toggleUrgency(urg)}
                    className={cls(
                      "px-2 py-1 text-xs rounded ring-1 ring-white/10 transition-colors",
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
                      "px-2 py-1 text-xs rounded ring-1 transition-colors",
                      reportFilters.categories.length === 0 || reportFilters.categories.includes(cat)
                        ? "text-white"
                        : "bg-slate-800/30 text-slate-400"
                    )}
                    style={{
                      backgroundColor: reportFilters.categories.length === 0 || reportFilters.categories.includes(cat) ? color : undefined,
                      borderColor: color
                    }}
                  >
                    {categoryDisplayMap[cat] || cat}
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
                {reportFilters.showMyReportsOnly && (
                  <span className="ml-2 text-purple-400">(tuyos)</span>
                )}
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

          {/* Leyenda de zonas de riesgo */}
          {showRiskZones && (
            <div className="flex gap-4 text-xs bg-slate-800/30 rounded-lg p-2">
              <span className="text-slate-400 font-medium">Radio de zonas:</span>
              <span className="text-red-400">Alta: 300m</span>
              <span className="text-amber-400">Media: 200m</span>
              <span className="text-emerald-400">Baja: 100m</span>
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
              className="h-9 w-9 grid place-content-center rounded-lg bg-slate-900/80 text-slate-200 ring-1 ring-white/10 hover:bg-slate-800/80 transition-colors shadow-lg"
              title="Usar mi ubicación"
            >
              <Crosshair className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setPos(initial);
                setMapCenter(initial);
                setMapZoom(13);
              }}
              className="h-9 w-9 grid place-content-center rounded-lg bg-slate-900/80 text-slate-200 ring-1 ring-white/10 hover:bg-slate-800/80 transition-colors shadow-lg"
              title="Volver al inicio"
            >
              <Reset className="h-5 w-5" />
            </button>
          </div>

          <MapContainer center={[pos.lat, pos.lng]} zoom={mapZoom} scrollWheelZoom className="h-[520px]">
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OSM Standard">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="OpenTopoMap">
                <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution="&copy; OpenTopoMap, &copy; OpenStreetMap contributors" />
              </LayersControl.BaseLayer>
            </LayersControl>

            <MapClick onPick={setPos} />
            <MapController center={mapCenter} zoom={mapZoom} />

            {/* Marcador de referencia */}
            <Marker icon={markerIcon} position={[pos.lat, pos.lng]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">Centro actual</p>
                  <p className="text-slate-600">Lat: {fmt(pos.lat)} | Lng: {fmt(pos.lng)}</p>
                </div>
              </Popup>
            </Marker>

            {/* Zonas de Riesgo por cada reporte */}
            {showRiskZones && filteredReports.map((report) => {
              const riskConfig = RISK_ZONE_CONFIG[report.urgency] || RISK_ZONE_CONFIG.media;
              
              return (
                <React.Fragment key={`risk-${report.id}`}>
                  {/* Círculo de zona de riesgo */}
                  <Circle
                    center={[report.lat, report.lng]}
                    radius={riskConfig.radius}
                    pathOptions={{
                      color: riskConfig.color,
                      fillColor: riskConfig.color,
                      fillOpacity: riskConfig.fillOpacity,
                      weight: riskConfig.weight,
                      opacity: riskConfig.opacity
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold" style={{ color: riskConfig.color }}>
                          Zona de Riesgo {report.urgency.toUpperCase()}
                        </p>
                        <p className="text-slate-600 text-xs mt-1">{report.title}</p>
                        <p className="text-slate-500 text-xs mt-2">
                          Radio de afectación: {riskConfig.radius}m
                        </p>
                      </div>
                    </Popup>
                  </Circle>
                  
                  {/* Punto central de la zona de riesgo */}
                  <CircleMarker
                    center={[report.lat, report.lng]}
                    radius={6}
                    pathOptions={{
                      color: riskConfig.color,
                      fillColor: riskConfig.color,
                      fillOpacity: 1,
                      weight: 2,
                      opacity: 1
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold" style={{ color: riskConfig.color }}>
                          Epicentro del Reporte
                        </p>
                        <p className="text-slate-600 text-xs mt-1">{report.title}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          Lat: {fmt(report.lat)} | Lng: {fmt(report.lng)}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

            {/* Marcadores de reportes ciudadanos */}
            {showReports && filteredReports.map((report) => (
              <CircleMarker
                key={`report-${report.id}`}
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