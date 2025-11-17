import React, { useState, useEffect, useRef } from "react";
import { searchReports, searchLocations, formatDistance, calculateDistance } from "./mapSearchService";

/* ---- Iconos ---- */
const SearchIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const LocationIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const FileIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const XIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const NavigationIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polygon points="3 11 22 2 13 21 11 13 3 11" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

/**
 * Componente de búsqueda de reportes y direcciones para el mapa
 */
export default function MapSearchBar({
  reports = [],
  onSelectReport,
  onSelectLocation,
  currentPosition = null,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({ reports: [], locations: [] });
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manejar búsqueda con debounce
  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowResults(true);
    setError(null);

    if (!query.trim()) {
      setSearchResults({ reports: [], locations: [] });
      setIsSearching(false);
      return;
    }

    // Búsqueda inmediata de reportes locales
    try {
      const reportResults = searchReports(reports, query);
      setSearchResults((prev) => ({ ...prev, reports: reportResults }));
    } catch (err) {
      console.error("Error en búsqueda de reportes:", err);
    }

    // Búsqueda con debounce para direcciones (API externa)
    clearTimeout(debounceTimer.current);
    setIsSearching(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const locationResults = await searchLocations(query, {
          limit: 5,
          countryCode: "cl",
          viewbox: "-73.5,-37.0,-71.5,-39.5",
          bounded: true,
        });
        setSearchResults((prev) => ({ ...prev, locations: locationResults }));
        setIsSearching(false);
      } catch (err) {
        console.error("Error en búsqueda de direcciones:", err);
        setError("Error al buscar direcciones. Intenta nuevamente.");
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectReport = (report) => {
    onSelectReport?.(report);
    setSearchQuery(report.title);
    setShowResults(false);
  };

  const handleSelectLocation = (location) => {
    onSelectLocation?.(location);
    setSearchQuery(location.display_name);
    setShowResults(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults({ reports: [], locations: [] });
    setShowResults(false);
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const allResults = [...searchResults.reports, ...searchResults.locations];
      if (allResults.length > 0) {
        if (searchResults.reports[0]) {
          handleSelectReport(searchResults.reports[0]);
        } else if (searchResults.locations[0]) {
          handleSelectLocation(searchResults.locations[0]);
        }
      }
    }
  };

  const hasResults =
    searchResults.reports.length > 0 || searchResults.locations.length > 0;
  const showNoResults =
    searchQuery.trim() && !isSearching && !hasResults && !error;

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Barra de búsqueda */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar reportes o direcciones..."
          className="
            w-full pl-11 pr-10 py-3 rounded-xl text-sm
            bg-white text-slate-900 placeholder-slate-400 ring-1 ring-slate-300 shadow-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0
            dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder-slate-400 dark:ring-white/10
          "
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="
              absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded
              text-slate-400 hover:text-slate-600 hover:bg-slate-100
              dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/60
              transition-all
            "
            aria-label="Limpiar búsqueda"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {showResults && (searchQuery.trim() || isSearching) && (
        <div
          className="
            absolute top-full mt-2 w-full max-h-[500px] overflow-y-auto z-[500]
            rounded-xl shadow-2xl ring-1 backdrop-blur-sm
            bg-white/95 ring-slate-200
            dark:bg-slate-800/95 dark:ring-white/10
          "
        >
          {/* Loading */}
          {isSearching && (
            <div className="px-4 py-4 text-center text-sm text-slate-500 border-b border-slate-200 dark:text-slate-400 dark:border-slate-700/50">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent" />
                <span>Buscando direcciones...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-200 dark:text-red-300 dark:bg-red-500/10 dark:border-red-500/30">
              ⚠️ {error}
            </div>
          )}

          {/* Reportes encontrados */}
          {searchResults.reports.length > 0 && (
            <div className="border-b border-slate-200 dark:border-slate-700/50">
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 dark:text-slate-400">
                  <FileIcon className="h-3.5 w-3.5" />
                  Reportes ({searchResults.reports.length})
                </h3>
              </div>
              {searchResults.reports.map((report) => {
                const distance = currentPosition
                  ? calculateDistance(
                      currentPosition.lat,
                      currentPosition.lng,
                      report.lat,
                      report.lng
                    )
                  : null;

                return (
                  <button
                    key={`report-${report.id}`}
                    onClick={() => handleSelectReport(report)}
                    className="
                      w-full px-4 py-3 text-left flex items-start gap-3 transition-all
                      border-b border-slate-100 last:border-b-0 hover:bg-slate-50
                      dark:border-slate-700/30 dark:hover:bg-slate-700/50
                      group
                    "
                  >
                    <div
                      className="
                        mt-0.5 p-2 rounded-lg ring-1
                        bg-slate-100 ring-slate-200
                        group-hover:bg-slate-200
                        dark:bg-slate-700/50 dark:ring-white/5 dark:group-hover:bg-slate-600/50
                        transition-colors
                      "
                    >
                      <FileIcon className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-slate-950 transition-colors dark:text-slate-100 dark:group-hover:text-white">
                        {report.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700/70 dark:text-slate-300 dark:ring-white/5">
                          {report.originalCategory}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-medium ring-1 ${
                            report.urgency === "alta"
                              ? "bg-red-100 text-red-600 ring-red-200 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-500/20"
                              : report.urgency === "media"
                              ? "bg-amber-100 text-amber-600 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/20"
                              : "bg-emerald-100 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/20"
                          }`}
                        >
                          {report.urgency}
                        </span>
                        {distance && (
                          <span className="text-xs text-slate-500 flex items-center gap-1 dark:text-slate-400">
                            <NavigationIcon className="h-3 w-3" />
                            {formatDistance(distance)}
                          </span>
                        )}
                      </div>
                      {report.address && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-1 flex items-center gap-1 dark:text-slate-400">
                          <LocationIcon className="h-3 w-3 flex-shrink-0" />
                          {report.address}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Direcciones encontradas */}
          {searchResults.locations.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 dark:text-slate-400">
                  <LocationIcon className="h-3.5 w-3.5" />
                  Direcciones ({searchResults.locations.length})
                </h3>
              </div>
              {searchResults.locations.map((location) => {
                const distance = currentPosition
                  ? calculateDistance(
                      currentPosition.lat,
                      currentPosition.lng,
                      location.lat,
                      location.lng
                    )
                  : null;

                return (
                  <button
                    key={`location-${location.id}`}
                    onClick={() => handleSelectLocation(location)}
                    className="
                      w-full px-4 py-3 text-left flex items-start gap-3 transition-all
                      border-b border-slate-100 last:border-b-0 hover:bg-slate-50
                      dark:border-slate-700/30 dark:hover:bg-slate-700/50
                      group
                    "
                  >
                    <div
                      className="
                        mt-0.5 p-2 rounded-lg ring-1
                        bg-indigo-50 text-indigo-600 ring-indigo-100
                        group-hover:bg-indigo-100
                        dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20 dark:group-hover:bg-indigo-500/20
                        transition-colors
                      "
                    >
                      <LocationIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 line-clamp-2 group-hover:text-slate-950 transition-colors dark:text-slate-100 dark:group-hover:text-white">
                        {location.display_name}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </span>
                        {distance && (
                          <span className="flex items-center gap-1">
                            <NavigationIcon className="h-3 w-3" />
                            {formatDistance(distance)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Sin resultados */}
          {showNoResults && (
            <div className="px-4 py-12 text-center">
              <SearchIcon className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 font-medium dark:text-slate-400">
                No se encontraron resultados
              </p>
              <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}

          {/* Tip de ayuda */}
          {searchQuery.length === 0 && (
            <div className="px-4 py-3 text-xs text-slate-500 text-center bg-slate-50 dark:bg-slate-900/30 dark:text-slate-400">
              💡 Busca por título, categoría, urgencia o dirección
            </div>
          )}
        </div>
      )}
    </div>
  );
}
