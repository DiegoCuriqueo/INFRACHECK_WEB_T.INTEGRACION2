import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layout/UserLayout";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

/* ---- Componente para capturar click en mapa ---- */
function MapClick({ onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function HomeUser() {
  const navigate = useNavigate();
  
  /* Temuco aprox (coherente con tu captura) */
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

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const canSubmit =
    form.title.trim().length >= 3 &&
    form.desc.trim().length >= 10 &&
    form.category !== "";

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setToast({ type: "warn", msg: "Completa título, descripción y categoría." });
      return;
    }
    setIsSending(true);
    const payload = {
      ...form,
      lat: pos.lat,
      lng: pos.lng,
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
    };
    // TODO: reemplazar por POST real (axios/fetch)
    await new Promise((r) => setTimeout(r, 450));
    setRecent((r) => [payload, ...r].slice(0, 6));
    setForm({ title: "", desc: "", category: "", address: "", urgency: "media" });
    setToast({ type: "ok", msg: "Reporte guardado" });
    setIsSending(false);
  };

  // Función para manejar el guardado y navegación
  const handleSave = async () => {
    if (!canSubmit || isSending) return;
    
    setIsSending(true);
    
    try {
      const payload = {
        ...form,
        lat: pos.lat,
        lng: pos.lng,
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
      };
      
      // Simular guardado en backend
      await new Promise((r) => setTimeout(r, 450));
      
      // Actualizar reportes recientes
      setRecent((r) => [payload, ...r].slice(0, 6));
      
      // Limpiar formulario
      setForm({ title: "", desc: "", category: "", address: "", urgency: "media" });
      
      // Mostrar toast de éxito
      setToast({ type: "ok", msg: "Reporte guardado exitosamente" });
      
      // Navegar a la página de reportes después de un breve delay
      setTimeout(() => {
        navigate("/user/reportes"); // Cambia esta ruta por la que necesites
      }, 1000);
      
    } catch (error) {
      setToast({ type: "warn", msg: "Error al guardar el reporte" });
    } finally {
      setIsSending(false);
    }
  };

  /* ---- Geolocalización nativa (opcional) ---- */
  const locate = () => {
    if (!navigator.geolocation) {
      setToast({ type: "warn", msg: "Geolocalización no disponible en el navegador." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setToast({ type: "warn", msg: "No se pudo obtener tu ubicación." }),
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  /* ---- Toast autodestruct ---- */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <UserLayout title="Home">
      <div className="flex gap-6 h-full min-h-[calc(100vh-88px)]">
        {/* MAIN */}
        <div className="flex-1">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* MAPA */}
            <div className="xl:col-span-2">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 ring-1 ring-white/10">
                {/* chips de coord */}
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

                {/* controles flotantes */}
                <div className="absolute z-[400] right-3 top-3 flex flex-col gap-2">
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
              <p className="mt-2 text-[12px] text-slate-400">
                * Haz clic en el mapa para fijar la ubicación o arrastra el marcador.
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
                    <label className="block text-sm text-slate-300 mb-1">Ubicación (referencia)</label>
                    <input
                      value={form.address}
                      onChange={update("address")}
                      className="w-full rounded-lg bg-slate-700/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Calle / N° / sector"
                    />
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

                  <button
                    type="button"
                    disabled={!canSubmit || isSending}
                    onClick={handleSave}
                    className={cls(
                      "w-full rounded-lg font-medium py-2.5 transition ring-1 ring-white/10",
                      canSubmit && !isSending
                        ? "bg-indigo-600 text-white hover:bg-indigo-500"
                        : "bg-slate-700/60 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {isSending ? "Guardando..." : "Guardar"}
                  </button>
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
                        <div className="h-8 w-8 rounded-lg bg-indigo-600/80 text-white grid place-content-center text-sm">
                          {r.title?.[0]?.toUpperCase() || "R"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-slate-100 font-medium truncate">{r.title || "(sin título)"}</h5>
                          <p className="text-xs text-slate-400">
                            {fmt(r.lat)}, {fmt(r.lng)} • {r.category || "sin categoría"}
                          </p>
                          <p className="text-sm text-slate-300 mt-1 line-clamp-2">{r.desc || "Sin descripción"}</p>
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

      {/* Toast simple */}
      {toast && (
        <div
          className={cls(
            "fixed bottom-5 right-6 z-[500] px-4 py-2 rounded-lg text-sm shadow-lg ring-1",
            toast.type === "ok"
              ? "bg-emerald-600 text-white ring-white/10"
              : "bg-amber-600 text-white ring-white/10"
          )}
        >
          {toast.msg}
        </div>
      )}
    </UserLayout>
  );
}