import { cleanApiUrl, defaultHeaders, handleApiResponse } from './apiConfig.js';

/**
 * Servicio de autenticación - Login
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
    });

    const data = await handleApiResponse(response);
   
    // Guardar token y datos del usuario en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      
      // MAPEAR rous_id a rol y rol_nombre para compatibilidad
      const userData = {
        user_id: data.user_id,
        username: data.username,
        rut: data.rut,
        email: data.email,
        rous_id: data.rous_id,        // ID del rol (1, 2, 3)
        rol: data.rous_id,             // Alias para ProtectedRoute
        rous_nombre: data.rous_nombre, // Nombre del rol
        rol_nombre: data.rous_nombre   // Alias para AuthPage
      };
      
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      console.log('Usuario autenticado:', userData);
    }
   
    return data;
  } catch (error) {
    console.error('Error detallado en login:', error);
    throw error;
  }
};

const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user_data');
};

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const getUserData = () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

const getToken = () => {
  return localStorage.getItem('token');
};

export { loginUser, logoutUser, isAuthenticated, getUserData, getToken };
