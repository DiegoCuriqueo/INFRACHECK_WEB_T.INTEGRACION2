// Configuración base para las llamadas a la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Remover el slash final si existe para evitar URLs duplicadas
const cleanApiUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

// Configuración común para las peticiones
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Función auxiliar para manejar respuestas de la API
const handleApiResponse = async (response) => {
  // Verificar si la respuesta tiene contenido
  const contentType = response.headers.get('content-type');

  // Si no hay content-type o no es JSON, manejar como error
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Respuesta no JSON:', {
      status: response.status,
      statusText: response.statusText,
      contentType,
      body: text
    });

    throw new Error(`Error del servidor (${response.status}): ${response.statusText || 'Respuesta inválida'}`);
  }

  try {
    const data = await response.json();

    if (!response.ok) {
      const collectFromErrorsObject = (obj) => {
        try {
          const parts = [];
          Object.entries(obj || {}).forEach(([k, v]) => {
            if (Array.isArray(v)) parts.push(`${k}: ${v.join(', ')}`);
            else if (typeof v === 'string') parts.push(`${k}: ${v}`);
            else if (v && typeof v === 'object') parts.push(`${k}: ${JSON.stringify(v)}`);
          });
          return parts.join('; ');
        } catch {
          return '';
        }
      };

      const joinErrors = (errs) => Array.isArray(errs) ? errs.join('; ') : (typeof errs === 'string' ? errs : collectFromErrorsObject(errs));

      const message = (
        data.message ||
        data.detail ||
        (data.error && (data.error.message || joinErrors(data.error.details))) ||
        (data.errors && joinErrors(data.errors)) ||
        `Error ${response.status}: ${response.statusText}`
      );

      throw new Error(message);
    }

    return data;
  } catch (jsonError) {
    console.error('Error parseando JSON:', jsonError);
    throw new Error(`Error de formato en la respuesta del servidor`);
  }
};

// Función auxiliar para hacer peticiones autenticadas
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    ...defaultHeaders,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleApiResponse(response);
};

export { API_BASE_URL, cleanApiUrl, defaultHeaders, handleApiResponse, makeAuthenticatedRequest };