import { cleanApiUrl, defaultHeaders, handleApiResponse } from './apiConfig.js';

/**
 * Servicio de autenticación - Login
 * @param {Object} credentials - Credenciales del usuario
 * @param {string} credentials.rut - RUT del usuario (ej: "12345678-9")
 * @param {string} credentials.password - Contraseña del usuario
 * @returns {Promise<Object>} Respuesta del servidor con token y datos del usuario
 */
const loginUser = async (credentials) => {
  try {
    console.log('Intentando login con:', { rut: credentials.rut, url: `${cleanApiUrl}/v1/login/` });
    
    const response = await fetch(`${cleanApiUrl}/v1/login/`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        rut: credentials.rut,
        password: credentials.password
      })
    });

    console.log('Respuesta del servidor:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const data = await handleApiResponse(response);
    
    // Guardar token en localStorage si el login es exitoso
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_data', JSON.stringify({
        user_id: data.user_id,
        username: data.username,
        rut: data.rut,
        rous_id: data.rous_id,
        rous_nombre: data.rous_nombre
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error detallado en login:', {
      message: error.message,
      stack: error.stack,
      url: `${cleanApiUrl}/v1/login/`
    });
    throw error;
  }
};

/**
 * Función para cerrar sesión
 * Limpia el token y datos del usuario del localStorage
 */
const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user_data');
};

/**
 * Función para verificar si el usuario está autenticado
 * @returns {boolean} True si hay un token válido
 */
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Función para obtener los datos del usuario almacenados
 * @returns {Object|null} Datos del usuario o null si no existe
 */
const getUserData = () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

export { loginUser, logoutUser, isAuthenticated, getUserData };