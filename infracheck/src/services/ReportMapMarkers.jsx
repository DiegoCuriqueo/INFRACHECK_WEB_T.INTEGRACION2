import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

/**
 * Componente para mostrar marcadores de reportes en el mapa
 */
export function ReportMapMarkers({ reports, onSelectReport, categories }) {
  /**
   * Crea un ícono personalizado para el marcador según urgencia
   */
  const createReportIcon = (urgency, category) => {
    const color =
      urgency === "alta" ? "#ef4444" :
      urgency === "media" ? "#f59e0b" :
      "#10b981";
    
    return new L.DivIcon({
      html: `
        <div class="report-marker-wrapper">
          <div class="report-marker-ping" style="background: ${color}"></div>
          <div class="report-marker" style="border-color: ${color};">
            <svg viewBox="0 0 24 24" fill="none" style="width: 16px; height: 16px; color: ${color};">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      `,
      className: 'custom-report-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const getCategoryName = (categoryValue) => {
    if (typeof categoryValue === 'string') return categoryValue;
    if (typeof categoryValue === 'number' && categories) {
      const category = categories.find(c => c.value === parseInt(categoryValue));
      return category?.label || 'Sin categoría';
    }
    return 'Sin categoría';
  };

  return (
    <>
      <style>{`
        /* ==========================
           VARIABLES LIGHT / DARK
        =========================== */
        :root {
          --rm-popup-bg: rgba(255, 255, 255, 0.98);
          --rm-popup-border: rgba(15, 23, 42, 0.12);
          --rm-popup-title: #0f172a;
          --rm-popup-category: #4f46e5;
          --rm-popup-text: #1e293b;
          --rm-popup-muted: #64748b;

          --rm-panel-bg: rgba(255, 255, 255, 0.98);
          --rm-panel-border: rgba(15, 23, 42, 0.12);
          --rm-panel-title: #0f172a;
          --rm-panel-category: #4f46e5;
          --rm-panel-text: #1e293b;
          --rm-panel-muted: #64748b;

          --rm-marker-bg: #0f172a;
        }

        html.dark {
          --rm-popup-bg: rgba(15, 23, 42, 0.98);
          --rm-popup-border: rgba(148, 163, 184, 0.35);
          --rm-popup-title: #f1f5f9;
          --rm-popup-category: #a5b4fc;
          --rm-popup-text: #cbd5e1;
          --rm-popup-muted: #94a3b8;

          --rm-panel-bg: rgba(15, 23, 42, 0.95);
          --rm-panel-border: rgba(148, 163, 184, 0.35);
          --rm-panel-title: #e2e8f0;
          --rm-panel-category: #a5b4fc;
          --rm-panel-text: #cbd5e1;
          --rm-panel-muted: #94a3b8;

          --rm-marker-bg: #020617;
        }

        /* ==========================
           MARCADORES
        =========================== */
        .custom-report-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .report-marker-wrapper {
          position: relative;
          width: 32px;
          height: 32px;
        }
        
        .report-marker-ping {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          opacity: 0.75;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes ping {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.75;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        
        .report-marker {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          z-index: 10;
          background: var(--rm-marker-bg);
        }
        
        .report-marker:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
        }

        /* ==========================
           POPUP LEAFLET
        =========================== */
        .leaflet-popup-content-wrapper {
          background: var(--rm-popup-bg) !important;
          border: 1px solid var(--rm-popup-border);
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        
        .leaflet-popup-tip {
          background: var(--rm-popup-bg) !important;
          border: 1px solid var(--rm-popup-border);
        }
        
        .report-popup {
          min-width: 280px;
          max-width: 320px;
        }
        
        .popup-image {
          width: 100%;
          height: 160px;
          object-fit: cover;
          display: block;
        }
        
        .popup-content {
          padding: 16px;
        }
        
        .popup-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--rm-popup-title);
          margin: 0 0 6px 0;
          line-height: 1.3;
        }
        
        .popup-category {
          font-size: 12px;
          color: var(--rm-popup-category);
          margin: 0 0 8px 0;
        }
        
        .popup-desc {
          font-size: 14px;
          color: var(--rm-popup-text);
          margin: 0 0 12px 0;
          line-height: 1.5;
        }
        
        .popup-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid rgba(148, 163, 184, 0.35);
        }
        
        .popup-urgency {
          font-size: 11px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .urgency-alta {
          background: rgba(239, 68, 68, 0.12);
          color: #b91c1c;
        }
        
        .urgency-media {
          background: rgba(245, 158, 11, 0.12);
          color: #b45309;
        }
        
        .urgency-baja {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
        }

        html.dark .urgency-alta {
          background: rgba(239, 68, 68, 0.2);
          color: #fecaca;
        }
        
        html.dark .urgency-media {
          background: rgba(245, 158, 11, 0.2);
          color: #fed7aa;
        }
        
        html.dark .urgency-baja {
          background: rgba(16, 185, 129, 0.2);
          color: #a7f3d0;
        }
        
        .popup-date {
          font-size: 11px;
          color: var(--rm-popup-muted);
        }

        /* ==========================
           PANEL LATERAL SELECCIONADO
           (si lo usas en algún lado)
        =========================== */
        .selected-report-panel {
          position: absolute;
          top: 72px;
          left: 16px;
          z-index: 400;
          background: var(--rm-panel-bg);
          backdrop-filter: blur(12px);
          border: 1px solid var(--rm-panel-border);
          border-radius: 16px;
          padding: 20px;
          max-width: 340px;
          box-shadow: 0 8px 32px rgba(15, 23, 42, 0.35);
          animation: slideInLeft 0.3s ease-out;
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .selected-report-panel img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .selected-report-panel h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--rm-panel-title);
          margin: 0 0 8px 0;
        }

        .selected-report-panel .category-badge {
          display: inline-block;
          font-size: 12px;
          color: var(--rm-panel-category);
          background: rgba(129, 140, 248, 0.08);
          padding: 4px 12px;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        html.dark .selected-report-panel .category-badge {
          background: rgba(129, 140, 248, 0.16);
        }

        .selected-report-panel p {
          font-size: 14px;
          color: var(--rm-panel-text);
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .selected-report-panel .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid var(--rm-panel-border);
        }

        .close-panel-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(148, 163, 184, 0.16);
          border: 1px solid rgba(148, 163, 184, 0.4);
          color: var(--rm-panel-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-panel-btn:hover {
          background: rgba(148, 163, 184, 0.28);
          color: var(--rm-panel-title);
        }
      `}</style>

      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.lat, report.lng]}
          icon={createReportIcon(report.urgency, report.category)}
          eventHandlers={{
            click: () => onSelectReport && onSelectReport(report),
          }}
        >
          <Popup className="custom-popup">
            <div className="report-popup">
              {(report.imageDataUrl || report.image) && (
                <img
                  src={report.imageDataUrl || report.image}
                  alt={report.title}
                  className="popup-image"
                />
              )}
              <div className="popup-content">
                <h3 className="popup-title">{report.title}</h3>
                <p className="popup-category">
                  {report.category ||
                    getCategoryName(report.originalCategory) ||
                    "Sin categoría"}
                </p>
                <p className="popup-desc">
                  {(report.description || report.summary || "").slice(0, 100)}
                  {(report.description || report.summary || "").length > 100
                    ? "..."
                    : ""}
                </p>
                <div className="popup-meta">
                  <span className={`popup-urgency urgency-${report.urgency}`}>
                    {report.urgency}
                  </span>
                  <span className="popup-date">
                    {report.createdAt ? formatDate(report.createdAt) : "Sin fecha"}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default ReportMapMarkers;
