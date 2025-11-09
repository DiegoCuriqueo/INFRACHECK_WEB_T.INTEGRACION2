import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

/**
 * Componente para mostrar marcadores de reportes en el mapa
 * @param {Array} reports - Lista de reportes a mostrar
 * @param {Function} onSelectReport - Callback cuando se selecciona un reporte
 * @param {Array} categories - Lista de categorías disponibles
 */
export function ReportMapMarkers({ reports, onSelectReport, categories }) {
  /**
   * Crea un ícono personalizado para el marcador según urgencia
   * @param {string} urgency - Nivel de urgencia (alta/media/baja)
   * @param {string} category - Categoría del reporte
   * @returns {L.DivIcon} Ícono de Leaflet personalizado
   */
  const createReportIcon = (urgency, category) => {
    const color = urgency === "alta" ? "#ef4444" : urgency === "media" ? "#f59e0b" : "#10b981";
    
    return new L.DivIcon({
      html: `
        <div class="report-marker-wrapper">
          <div class="report-marker-ping" style="background: ${color}"></div>
          <div class="report-marker" style="border-color: ${color}; background: rgba(15, 23, 42, 0.95);">
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

  /**
   * Formatea la fecha de creación del reporte
   * @param {string} date - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  /**
   * Obtiene el nombre de la categoría según su valor
   * @param {number|string} categoryValue - Valor numérico o nombre de la categoría
   * @returns {string} Nombre de la categoría
   */
  const getCategoryName = (categoryValue) => {
    // Si ya es un string (nombre de categoría), devolverlo directamente
    if (typeof categoryValue === 'string') {
      return categoryValue;
    }
    
    // Si es un número, buscar en el array de categorías
    if (typeof categoryValue === 'number' && categories) {
      const category = categories.find(c => c.value === parseInt(categoryValue));
      return category?.label || 'Sin categoría';
    }
    
    return 'Sin categoría';
  };

  return (
    <>
      <style>{`
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
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          z-index: 10;
        }
        
        .report-marker:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
        }
        
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.98) !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.98) !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          color: #f1f5f9;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }
        
        .popup-category {
          font-size: 12px;
          color: #818cf8;
          margin: 0 0 8px 0;
        }
        
        .popup-desc {
          font-size: 14px;
          color: #cbd5e1;
          margin: 0 0 12px 0;
          line-height: 1.5;
        }
        
        .popup-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
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
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }
        
        .urgency-media {
          background: rgba(245, 158, 11, 0.2);
          color: #fcd34d;
        }
        
        .urgency-baja {
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
        }
        
        .popup-date {
          font-size: 11px;
          color: #94a3b8;
        }

        .selected-report-panel {
          position: absolute;
          top: 72px;
          left: 16px;
          z-index: 400;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          max-width: 340px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
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
          color: #f1f5f9;
          margin: 0 0 8px 0;
        }

        .selected-report-panel .category-badge {
          display: inline-block;
          font-size: 12px;
          color: #818cf8;
          background: rgba(129, 140, 248, 0.1);
          padding: 4px 12px;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .selected-report-panel p {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .selected-report-panel .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .close-panel-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(100, 116, 139, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-panel-btn:hover {
          background: rgba(100, 116, 139, 0.5);
          color: #f1f5f9;
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
                  {report.category || getCategoryName(report.originalCategory) || 'Sin categoría'}
                </p>
                <p className="popup-desc">
                  {(report.description || report.summary || '').slice(0, 100)}
                  {(report.description || report.summary || '').length > 100 ? '...' : ''}
                </p>
                <div className="popup-meta">
                  <span className={`popup-urgency urgency-${report.urgency}`}>
                    {report.urgency}
                  </span>
                  <span className="popup-date">
                    {report.createdAt ? formatDate(report.createdAt) : 'Sin fecha'}
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