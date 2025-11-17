import React, { useState, useEffect, useRef } from "react";
import { categoryDisplayMap } from "./reportsService";

// Helpers
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

const searchReports = (reports = [], query = "", limit = 5) => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  
  return reports.filter((report) => {
    const matchTitle = report.title?.toLowerCase().includes(lowerQuery);
    const matchDesc =
      report.description?.toLowerCase().includes(lowerQuery) ||
      report.summary?.toLowerCase().includes(lowerQuery);

    const categoryName =
      categoryDisplayMap[report.originalCategory] || report.category || "";
    const matchCategory = categoryName.toLowerCase().includes(lowerQuery);

    const matchUrgency = report.urgency?.toLowerCase().includes(lowerQuery);
    const matchAddress = report.address?.toLowerCase().includes(lowerQuery);
    const matchId = report.id?.toString().includes(lowerQuery);

    return (
      matchTitle ||
      matchDesc ||
      matchCategory ||
      matchUrgency ||
      matchAddress ||
      matchId
    );
  }).slice(0, limit);
};

const searchLocations = async (query, options = {}) => {
  const {
    limit = 5,
    countryCode = "cl",
    language = "es-CL",
    viewbox = "-73.5,-37.0,-71.5,-39.5",
    bounded = true,
  } = options;

  if (!query.trim() || query.length < 3) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: limit.toString(),
      countrycodes: countryCode,
      addressdetails: "1",
      "accept-language": language,
    });

    if (bounded && viewbox) {
      params.append("viewbox", viewbox);
      params.append("bounded", "1");
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "MapaReportesCiudadanos/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    return data.map((item) => ({
      id: item.place_id,
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      category: item.category,
      address: item.address,
      importance: item.importance,
      boundingbox: item.boundingbox,
    }));
  } catch (error) {
    console.error("Error buscando direcciones:", error);
    return [];
  }
};

const MapSearchBar = ({
  reports = [],
  onSelectReport,
  onSelectLocation,
  currentPosition,
}) => {
  const [query, setQuery] = useState("");
  const [reportResults, setReportResults] = useState([]);
  const [locationResults, setLocationResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");
  const searchTimeoutRef = useRef(null);
  const searchBarRef = useRef(null);

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setReportResults([]);
      setLocationResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const foundReports = searchReports(reports, query, 5);

        const reportsWithDistance = currentPosition
          ? foundReports.map((report) => ({
              ...report,
              distance: calculateDistance(
                currentPosition.lat,
                currentPosition.lng,
                report.lat,
                report.lng
              ),
            }))
          : foundReports;

        setReportResults(reportsWithDistance);

        if (query.length >= 3) {
          try {
            const locations = await searchLocations(query, {
              limit: 5,
              countryCode: "cl",
              viewbox: "-73.5,-37.0,-71.5,-39.5",
              bounded: true,
            });
            setLocationResults(locations);
          } catch (error) {
            console.error("Error buscando direcciones:", error);
            setLocationResults([]);
          }
        }
      } catch (error) {
        console.error("Error en búsqueda:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, reports, currentPosition]);

  const handleSelectReport = (report) => {
    onSelectReport(report);
    setQuery("");
    setShowResults(false);
  };

  const handleSelectLocation = (location) => {
    onSelectLocation(location);
    setQuery("");
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setQuery("");
    setReportResults([]);
    setLocationResults([]);
    setShowResults(false);
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      alta: "bg-red-500",
      media: "bg-amber-500",
      baja: "bg-emerald-500",
    };
    return colors[urgency] || "bg-slate-500";
  };

  const getCategoryColor = (category) => {
    const colors = {
      bache: "text-red-500 dark:text-red-400",
      vereda: "text-orange-500 dark:text-orange-400",
      acceso_peatonal: "text-blue-500 dark:text-blue-400",
      señalizacion: "text-indigo-500 dark:text-indigo-400",
      iluminacion: "text-amber-500 dark:text-amber-400",
      residuos: "text-emerald-500 dark:text-emerald-400",
      mobiliario: "text-teal-500 dark:text-teal-400",
      alcantarilla: "text-sky-500 dark:text-sky-400",
      vegetacion: "text-green-500 dark:text-green-400",
      vandalismo: "text-purple-500 dark:text-purple-400",
      semaforo: "text-yellow-500 dark:text-yellow-400",
      parque: "text-lime-500 dark:text-lime-400",
      agua: "text-cyan-500 dark:text-cyan-400",
      otro: "text-violet-500 dark:text-violet-400",
    };
    return colors[category] || "text-slate-500 dark:text-slate-400";
  };

  return (
    <div ref={searchBarRef} className="relative w-full">
      {/* Barra de búsqueda */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path
              d="m21 21-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder="Buscar reportes o direcciones..."
          className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm
                     bg-white text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0
                     dark:bg-slate-800/70 dark:text-slate-100 dark:ring-white/10 dark:placeholder:text-slate-500"
        />

        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 
                       dark:text-slate-500 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Panel de resultados */}
      {showResults && query.trim() && (
        <div
          className="absolute top-full mt-2 w-full rounded-xl overflow-hidden shadow-xl
                     bg-white border border-slate-200 text-slate-900
                     dark:bg-slate-900/95 dark:border-white/10 dark:text-slate-100"
          style={{ zIndex: 1000 }}
        >
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors
                ${
                  activeTab === "reports"
                    ? "bg-slate-100 text-slate-900 border-b-2 border-indigo-500 dark:bg-slate-800/70 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              📋 Reportes ({reportResults.length})
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors
                ${
                  activeTab === "locations"
                    ? "bg-slate-100 text-slate-900 border-b-2 border-indigo-500 dark:bg-slate-800/70 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              📍 Direcciones ({locationResults.length})
            </button>
          </div>

          {/* Contenido de resultados */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent" />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Buscando...
                </p>
              </div>
            ) : (
              <>
                {/* Tab de Reportes */}
                {activeTab === "reports" && (
                  <>
                    {reportResults.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700/70">
                        {reportResults.map((report) => (
                          <button
                            key={report.id}
                            onClick={() => handleSelectReport(report)}
                            className="w-full px-4 py-3 text-left transition-colors group
                                       hover:bg-slate-50 dark:hover:bg-slate-800/70"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                <div
                                  className={`h-2 w-2 rounded-full ${getUrgencyColor(
                                    report.urgency
                                  )}`}
                                ></div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">
                                  {report.title}
                                </p>

                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span
                                    className={`text-xs ${getCategoryColor(
                                      report.originalCategory
                                    )}`}
                                  >
                                    {categoryDisplayMap[report.originalCategory] ||
                                      report.category}
                                  </span>
                                  <span className="text-xs text-slate-400">•</span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                    {report.urgency}
                                  </span>
                                  {report.distance !== undefined && (
                                    <>
                                      <span className="text-xs text-slate-400">•</span>
                                      <span className="text-xs text-slate-500 dark:text-slate-400">
                                        📍 {formatDistance(report.distance)}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                                  {report.address}
                                </p>
                              </div>

                              <div className="flex-shrink-0">
                                <svg
                                  className="h-5 w-5 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M9 18l6-6-6-6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <svg
                          className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M9 9l-1.5 1.5M15 15L9 9m6 6l1.5 1.5M9 9l6 6m-6-6v6m6-6H9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No se encontraron reportes
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Intenta con otros términos
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Tab de Direcciones */}
                {activeTab === "locations" && (
                  <>
                    {locationResults.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700/70">
                        {locationResults.map((location) => (
                          <button
                            key={location.id}
                            onClick={() => handleSelectLocation(location)}
                            className="w-full px-4 py-3 text-left transition-colors group
                                       hover:bg-slate-50 dark:hover:bg-slate-800/70"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                <svg
                                  className="h-5 w-5 text-indigo-500 dark:text-indigo-400"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                                  {location.display_name.split(",")[0]}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                  {location.display_name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">
                                    {location.type}
                                  </span>
                                </div>
                              </div>

                              <div className="flex-shrink-0">
                                <svg
                                  className="h-5 w-5 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M9 18l6-6-6-6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : query.length >= 3 ? (
                      <div className="p-8 text-center">
                        <svg
                          className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <circle
                            cx="12"
                            cy="9"
                            r="2.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No se encontraron direcciones
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Intenta con otra búsqueda
                        </p>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <svg
                          className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Escribe al menos 3 caracteres
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          para buscar direcciones
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSearchBar;
