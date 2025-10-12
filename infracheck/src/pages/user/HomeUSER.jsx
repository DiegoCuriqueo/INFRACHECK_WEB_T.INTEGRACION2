import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layout/UserLayout";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { createReporte, getReportes } from "../../services/reportsService";
import { geocodeAddress, reverseGeocode, formatAddress } from "../../services/geocodingService";

/* ---- Icono Leaflet (fix bundlers) ---- */
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

const categories = [
  { value: "bache", label: "Bache" },
  { value: "iluminacion", label: "Iluminación" },
  { value: "residuos", label: "Residuos" },
  { value: "señalizacion", label: "Señalización" },
  { value: "otro", label: "Otro" },
];

/* ---- Iconos inline ---- */
const PaperPlane = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M21.5 3.5 9.6 13.2m0 0L3 10.8l18.5-7.3-6.3 17L9.6 13.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const Crosshair = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 2v3m0 14v3m9-9h-3M6 12H3M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12m0-14.12 2.12 2.12m9.9 9.9 2.12 2.12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const Target = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);
const Reset = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 0 0-14.14-4.94M4 16a8 8 0 0 0 14.14 4.94" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const Search = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6"/>
    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const MapPin = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const Loader = ({ className = "" }) => (
  <svg className={cls("animate-spin", className)} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
    <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/>
  </svg>
);

/* ---- Componente para capturar click en mapa ---- */
function MapClick({ onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/* ---- Hook personalizado para debounce ---- */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function HomeUser() {
  const navigate = useNavigate();

  /* Temuco aprox */
  const initial = useMemo(() => ({ lat: -38.7397, lng: -72.5984 }), []);
  const [pos, setPos] = useState(initial);

  const [form, setForm] = useState({
    title: "",
    desc: "",
    category: "",
    address: "",
    urgency: "media",
  });

  const [recent, setRecent] = useState([]);
  const [toast, setToast] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // ---- Imagen (opcional) ----
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageError("");
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeMB = 5;
    if (!validTypes.includes(file.type)) {
      setImageError("Formato no soportado. Usa JPG, PNG o WEBP.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setImageError(`La imagen supera ${maxSizeMB}MB.`);
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
  };

  // Estados para búsqueda de direcciones
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Estado para geocodificación inversa
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Refs
  const searchResultsRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounce para búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Debounce para coordenadas (geocodificación inversa)
  const debouncedPos = useDebounce(pos, 1000);

  // Cargar reportes al montar
  useEffect(() => {
    const loadRecent = () => {
      const allReports = getReportes();
      setRecent(allReports.slice(0, 6));
    };
    loadRecent();
  }, []);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showResults]);

  // Búsqueda automática con debounce
  useEffect(() => {
    if (!debouncedSearchQuery.trim() || debouncedSearchQuery.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const searchAddress = async () => {
      setIsSearching(true);
      try {
        const results = await geocodeAddress(debouncedSearchQuery, {
          city: "Temuco",
          country: "Chile",
        });
        setSearchResults(results);
        setShowResults(results.length > 0);
        if (results.length === 0) {
          showToast("warn", "No se encontraron resultados");
        }
      } catch (error) {
        console.error("Error en búsqueda:", error);
        if (error.code === "RATE_LIMIT_EXCEEDED") {
          showToast("warn", "Demasiadas búsquedas. Espera un momento.");
        } else if (error.code === "NO_RESULTS") {
          showToast("warn", "No se encontraron resultados");
        } else {
          showToast("warn", "Error al buscar. Verifica tu conexión.");
        }
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    };
    searchAddress();
  }, [debouncedSearchQuery]);

  // Geocodificación inversa con debounce
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const updateAddressFromCoords = async () => {
      setIsLoadingAddress(true);
      try {
        const result = await reverseGeocode(debouncedPos.lat, debouncedPos.lng);
        if (result) {
          const formatted = formatAddress(result);
          setForm((f) => ({ ...f, address: formatted }));
        } else {
          setForm((f) => ({ ...f, address: `${fmt(debouncedPos.lat)}, ${fmt(debouncedPos.lng)}` }));
        }
      } catch (error) {
        console.error("Error en geocodificación inversa:", error);
        setForm((f) => ({ ...f, address: `${fmt(debouncedPos.lat)}, ${fmt(debouncedPos.lng)}` }));
        if (error.code === "RATE_LIMIT_EXCEEDED") {
          showToast("warn", "Moviste el marcador muy rápido. Espera un momento.");
        }
      } finally {
        setIsLoadingAddress(false);
      }
    };
    updateAddressFromCoords();
  }, [debouncedPos]);

  // Helper para mostrar toast
  const showToast = useCallback((type, msg) => setToast({ type, msg }), []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const canSubmit =
    form.title.trim().length >= 3 &&
    form.desc.trim().length >= 10 &&
    form.category !== "";

  // Seleccionar resultado de búsqueda
  const selectSearchResult = (result) => {
    setPos({ lat: result.lat, lng: result.lng });
    setForm((f) => ({ ...f, address: result.displayName }));
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isSending) return;
    setIsSending(true);
    try {
      await createReporte({
        title: form.title,
        desc: form.desc,
        category: form.category,
        urgency: form.urgency,
        lat: pos.lat,
        lng: pos.lng,
        address: form.address,
        imageDataUrl: imagePreview || null, // <<< NUEVO
      });
      const allReports = getReportes();
      setRecent(allReports.slice(0, 6));

      setForm({ title: "", desc: "", category: "", address: "", urgency: "media" });
      setImageFile(null);
      setImagePreview(null);
      setImageError("");

      showToast("ok", "Reporte guardado exitosamente");
    } catch (error) {
      showToast("warn", "Error al guardar el reporte");
    } finally {
      setIsSending(false);
    }
  };

  const handleSave = async () => {
    if (!canSubmit || isSending) return;
    setIsSending(true);
    try {
      await createReporte({
        title: form.title,
        desc: form.desc,
        category: form.category,
        urgency: form.urgency,
        lat: pos.lat,
        lng: pos.lng,
        address: form.address,
        imageDataUrl: imagePreview || null, // <<< NUEVO
      });

      setForm({ title: "", desc: "", category: "", address: "", urgency: "media" });
      setImageFile(null);
      setImagePreview(null);
      setImageError("");

      showToast("ok", "Reporte guardado exitosamente");
      setTimeout(() => navigate("/user/reportes"), 1000);
    } catch (error) {
      showToast("warn", "Error al guardar el reporte");
    } finally {
      setIsSending(false);
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      showToast("warn", "Geolocalización no disponible en tu navegador");
      return;
    }
    showToast("ok", "Obteniendo tu ubicación...");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        showToast("ok", "Ubicación obtenida correctamente");
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        showToast("warn", "No se pudo obtener tu ubicación");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Auto-cerrar toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <UserLayout title="Home">
      <div className="flex gap-6 h-full min-h-[calc(100vh-88px)]">
        <div className="flex-1">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* MAPA */}
            <div className="xl:col-span-2">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 ring-1 ring-white/10">
                <div className="absolute z-[400] left-1/2 -translate-x-1/2 top-3 flex gap-3 text-[11px]">
                  {[
                    { k: "Latitud", v: fmt(pos.lat) },
                    { k: "Longitud", v: fmt(pos.lng) },
                  ].map((b) => (
                    <div key={b.k} className="px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur text-slate-100 ring-1 ring-white/10 shadow-sm">
                      <span className="uppercase tracking-wider mr-1.5 text-slate-300">{b.k}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-700/70">{b.v}</span>
                    </div>
                  ))}
                </div>

                <div className="absolute z-[400] right-3 bottom-3 flex flex-col gap-2">
                  <button
                    onClick={locate}
                    className="h-9 w-9 grid place-content-center rounded-lg bg-slate-900/80 text-slate-200 ring-1 ring-white/10 hover:bg-slate-800/80"
                    title="Usar mi ubicación"
                  >
                    <Crosshair className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPos((p) => ({ ...p }))}
                    className="h-9 w-9 grid place-content-center rounded-lg bg-slate-900/80 text-slate-200 ring-1 ring-white/10 hover:bg-slate-800/80"
                    title="Centrar en marcador"
                  >
                    <Target className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPos(initial)}
                    className="h-9 w-9 grid place-content-center rounded-lg bg-slate-900/80 text-slate-200 ring-1 ring-white/10 hover:bg-slate-800/80"
                    title="Volver a inicio"
                  >
                    <Reset className="h-5 w-5" />
                  </button>
                </div>

                <MapContainer
                  center={[pos.lat, pos.lng]}
                  zoom={13}
                  scrollWheelZoom
                  className="h-[440px]"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />

                  <MapClick onPick={(ll) => setPos({ lat: ll[0], lng: ll[1] })} />

                  <Marker
                    icon={markerIcon}
                    position={[pos.lat, pos.lng]}
                    draggable
                    eventHandlers={{
                      dragend: (e) => {
                        const m = e.target.getLatLng();
                        setPos({ lat: m.lat, lng: m.lng });
                      },
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-medium">Posición seleccionada</p>
                        <p className="text-slate-600">
                          Lat: {fmt(pos.lat)} | Lng: {fmt(pos.lng)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Buscador de direcciones */}
              <div className="mt-4 relative" ref={searchResultsRef}>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar dirección (ej: Av. Alemania 1234, Temuco)"
                      className="w-full rounded-lg bg-slate-900/60 px-4 py-2.5 pl-10 text-slate-100 placeholder:text-slate-400 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    {isSearching && (
                      <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                    )}
                  </div>
                </div>

                {/* Resultados de búsqueda */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-[500] w-full mt-2 rounded-lg bg-slate-900 ring-1 ring-white/10 shadow-xl max-h-64 overflow-y-auto">
                    {searchResults.map((result, idx) => (
                      <button
                        key={`${result.lat}-${result.lng}-${idx}`}
                        onClick={() => selectSearchResult(result)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800/60 transition border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-100">{result.displayName}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {fmt(result.lat)}, {fmt(result.lng)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-2 text-[12px] text-slate-400">
                * Busca una dirección, haz clic en el mapa o arrastra el marcador. La dirección se actualizará automáticamente.
              </p>
            </div>

            {/* FORM */}
            <aside className="xl:col-span-1">
              <div className="h-full rounded-2xl bg-slate-900/60 ring-1 ring-white/10 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-100 font-semibold">Nuevo Reporte</h3>
                  <div className="grid place-content-center h-9 w-9 rounded-xl bg-indigo-600/90 text-white ring-1 ring-white/10">
                    <PaperPlane className="h-5 w-5" />
                  </div>
                </div>

                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Título</label>
                    <input
                      value={form.title}
                      onChange={update("title")}
                      required
                      minLength={3}
                      className="w-full rounded-lg bg-slate-700/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Pavimento dañado en Av. ..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Descripción</label>
                    <textarea
                      value={form.desc}
                      onChange={update("desc")}
                      required
                      minLength={10}
                      rows={4}
                      className="w-full rounded-lg bg-slate-700/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe el problema..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Categoría</label>
                      <select
                        value={form.category}
                        onChange={update("category")}
                        required
                        className="w-full rounded-lg bg-slate-700/60 px-3 py-2 text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Selecciona...</option>
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Urgencia</label>
                      <div className="grid grid-cols-3 rounded-lg ring-1 ring-white/10 overflow-hidden">
                        {["baja", "media", "alta"].map((u) => (
                          <button
                            type="button"
                            key={u}
                            onClick={() => setForm((f) => ({ ...f, urgency: u }))}
                            className={cls(
                              "px-3 py-2 text-sm capitalize transition",
                              form.urgency === u ? "bg-indigo-600/80 text-white" : "bg-slate-700/40 text-slate-200 hover:bg-slate-700/60"
                            )}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-1 flex items-center gap-2">
                      Ubicación 
                      {isLoadingAddress && (<Loader className="h-3 w-3 text-indigo-400" />)}
                      <span className="text-xs text-slate-400">(se actualiza automáticamente)</span>
                    </label>
                    <input
                      value={form.address}
                      onChange={update("address")}
                      className="w-full rounded-lg bg-slate-700/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Calle / N° / sector"
                    />
                  </div>

                  {/* Adjuntar imagen (opcional) */}
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Adjuntar imagen (opcional)</label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex cursor-pointer px-3 py-2 rounded-lg bg-slate-700/60 text-slate-100 ring-1 ring-white/10 hover:bg-slate-600/60">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        Subir imagen
                      </label>

                      {imagePreview && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="text-xs px-2 py-1 rounded bg-slate-800/60 text-slate-300 ring-1 ring-white/10 hover:bg-slate-700/60"
                        >
                          Quitar
                        </button>
                      )}
                    </div>

                    {imageError && <p className="mt-2 text-xs text-amber-300">{imageError}</p>}

                    {imagePreview && (
                      <div className="mt-3">
                        <img
                          src={imagePreview}
                          alt="Vista previa"
                          className="max-h-40 rounded-lg ring-1 ring-white/10"
                        />
                        <p className="mt-1 text-[11px] text-slate-400">* Se guardará junto al reporte.</p>
                      </div>
                    )}
                  </div>


                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] text-slate-400 mb-1">Latitud</label>
                      <input readOnly value={fmt(pos.lat)} className="w-full rounded-lg bg-slate-800/60 px-3 py-2 text-slate-300 ring-1 ring-white/10"/>
                    </div>
                    <div>
                      <label className="block text-[12px] text-slate-400 mb-1">Longitud</label>
                      <input readOnly value={fmt(pos.lng)} className="w-full rounded-lg bg-slate-800/60 px-3 py-2 text-slate-300 ring-1 ring-white/10"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="submit"
                      disabled={!canSubmit || isSending}
                      className={cls(
                        "rounded-lg font-medium py-2.5 transition ring-1 ring-white/10",
                        canSubmit && !isSending
                          ? "bg-slate-700/60 text-slate-200 hover:bg-slate-600/60"
                          : "bg-slate-800/60 text-slate-500 cursor-not-allowed"
                      )}
                    >
                      {isSending ? "Guardando..." : "Guardar"}
                    </button>

                    <button
                      type="button"
                      disabled={!canSubmit || isSending}
                      onClick={handleSave}
                      className={cls(
                        "rounded-lg font-medium py-2.5 transition ring-1 ring-white/10",
                        canSubmit && !isSending
                          ? "bg-indigo-600 text-white hover:bg-indigo-500"
                          : "bg-slate-700/60 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {isSending ? "Guardando..." : "Guardar e Ir"}
                    </button>
                  </div>
                </form>
              </div>
            </aside>
          </div>

          {/* REPORTES RECIENTES */}
          <div className="mt-7">
            <h4 className="text-slate-200 mb-3">Reportes Recientes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {recent.length === 0
                ? [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-28 rounded-xl bg-slate-800/50 ring-1 ring-white/10 animate-pulse"
                    />
                  ))
                : recent.map((r) => (
                    <article
                      key={r.id}
                      className="rounded-xl bg-slate-900/50 ring-1 ring-white/10 p-4 hover:ring-indigo-400/40 transition shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                    >
                      <div className="flex items-start gap-3">
                        {r.imageDataUrl ? (
                          <img
                            src={r.imageDataUrl}
                            alt="miniatura"
                            className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-indigo-600/80 text-white grid place-content-center text-sm">
                            {r.title?.[0]?.toUpperCase() || "R"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="text-slate-100 font-medium truncate">{r.title || "(sin título)"}</h5>
                          <p className="text-xs text-slate-400">
                            {fmt(r.lat)}, {fmt(r.lng)} • {r.category || "sin categoría"}
                          </p>
                          <p className="text-sm text-slate-300 mt-1 line-clamp-2">{r.summary || r.description || "Sin descripción"}</p>
                        </div>
                        <span
                          className={cls(
                            "text-xs px-2 py-0.5 rounded-full capitalize",
                            r.urgency === "alta"
                              ? "bg-rose-500/20 text-rose-300"
                              : r.urgency === "media"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          )}
                        >
                          {r.urgency}
                        </span>
                      </div>
                    </article>
                  ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast mejorado */}
      {toast && (
        <div
          className={cls(
            "fixed bottom-5 right-6 z-[500] px-4 py-3 rounded-lg text-sm shadow-lg ring-1 flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300",
            toast.type === "ok"
              ? "bg-emerald-600 text-white ring-white/10"
              : "bg-amber-600 text-white ring-white/10"
          )}
        >
          {toast.type === "ok" ? (
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span>{toast.msg}</span>
        </div>
      )}
    </UserLayout>
  );
}
