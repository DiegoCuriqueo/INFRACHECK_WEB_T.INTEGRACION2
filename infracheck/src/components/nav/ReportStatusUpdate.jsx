import React, { useState, useEffect } from "react";
import { updateReporte } from "../../services/reportsService";
import styled from "styled-components";

const StatusUpdateContainer = styled.div`
  padding: 20px;
  background-color: #f4f4f4;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
`;

const StatusButtons = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
`;

const StatusBtn = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  font-size: 14px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #45a049;
  }

  &.active {
    background-color: #8bc34a;
    color: white;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  color: green;
  margin-top: 10px;
`;

const ReportStatusUpdate = ({ reportId, initialStatus, urgency, onStatusChange }) => {
  const [status, setStatus] = useState(initialStatus); // Estado inicial
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null); // Manejo de errores
  const [success, setSuccess] = useState(null); // Mensaje de éxito

  // Asignar estado inicial según la urgencia
  useEffect(() => {
    if (urgency === "alta" && status === "pendiente") {
      setStatus("en_proceso"); // Si la urgencia es alta, establecer el estado a "en_proceso"
    }
  }, [urgency, status]);

  // Función para manejar el cambio de estado
  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await updateReporte(reportId, { status: newStatus });
      const finalStatus = res?.status || newStatus;
      setStatus(finalStatus);
      setSuccess(`Estado actualizado a ${finalStatus}.`);
      if (onStatusChange) onStatusChange(reportId, finalStatus);
    } catch (err) {
      setError("Error al cambiar el estado. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StatusUpdateContainer>
      <h2>Actualizar Estado del Reporte</h2>
      <p>Estado actual: {status}</p>

      {error && <ErrorMessage>{error}</ErrorMessage>} {/* Mostrar el error */}
      {success && <SuccessMessage>{success}</SuccessMessage>} {/* Mostrar el mensaje de éxito */}

      <StatusButtons>
        <StatusBtn
          onClick={() => handleStatusChange("pendiente")}
          disabled={loading}
          className={status === "pendiente" ? "active" : ""}
        >
          Pendiente
        </StatusBtn>
        <StatusBtn
          onClick={() => handleStatusChange("en_proceso")}
          disabled={loading}
          className={status === "en_proceso" ? "active" : ""}
        >
          En Proceso
        </StatusBtn>
        <StatusBtn
          onClick={() => handleStatusChange("resuelto")}
          disabled={loading}
          className={status === "resuelto" ? "active" : ""}
        >
          Resuelto
        </StatusBtn>
      </StatusButtons>

      {loading && <p>Cargando...</p>} {/* Mostrar el estado de carga */}
    </StatusUpdateContainer>
  );
};

export default ReportStatusUpdate;
