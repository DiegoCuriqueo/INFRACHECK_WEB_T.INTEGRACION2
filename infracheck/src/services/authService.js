// authService.js
import { cleanApiUrl, defaultHeaders, handleApiResponse } from './apiConfig.js';

// 🆕 Mapa de IDs de rol -> código de rol
// AJUSTA los números (1,2,3) según tu backend.
const ROLE_MAP = {
  1: "ADMIN",      // ej: rous_id = 1 => ADMIN
  2: "AUTORIDAD",  // ej: rous_id = 2 => AUTORIDAD
  3: "USER",       // ej: rous_id = 3 => USER
};

/**
 * Servicio de autenticación - Login
 */
const loginUser = async (credentials) => {
  try {
    console.log('Intentando login con:', { rut: credentials.rut, url: `${cleanApiUrl}/api/v1/login/` });
   
    const response = await fetch(`${cleanApiUrl}/api/v1/login/`, {
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

      // 🆕 Normalizar rol
      const normalizedRole = ROLE_MAP[data.rous_id] || "USER"; 
      // si no calza, lo dejamos como USER por defecto (ajusta si quieres)

      const userData = {
        user_id: data.user_id,
        username: data.username,
        rut:      data.rut,
        email:    data.email,

        // datos originales del backend (por si los necesitas)
        rous_id:      data.rous_id,
        rous_nombre:  data.rous_nombre,

        // 🆕 campos normalizados que usará el front
        role:         normalizedRole,      // "USER" | "AUTORIDAD" | "ADMIN"
        roleName:     data.rous_nombre,    // nombre legible del rol

        // 💡 Si el resto del código usa aún "rol" y "rol_nombre",
        // puedes mantenerlos como alias:
        rol:          normalizedRole,
        rol_nombre:   data.rous_nombre,
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

// 🆕 helper opcional, por si quieres
const getUserRole = () => {
  const user = getUserData();
  return user?.role ?? null;
};

// 🆕 AGREGAR ESTA FUNCIÓN AL EXPORT
const isTokenValid = () => {
  try {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user_data');
    if (!token || !userData) return false;
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      // Si no parece JWT, asumimos válido (por si cambias backend)
      return true;
    }
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload || !payload.exp) return true;
    
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp > nowSec;
  } catch {
    return true;
  }
};

const getToken = () => {
  return isTokenValid() ? localStorage.getItem('token') : null;
};

/**
 * 🔐 Cambiar contraseña del usuario autenticado
 */
const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  const token = getToken();
  if (!token) {
    throw new Error("Usuario no autenticado. Inicia sesión nuevamente.");
  }

  const response = await fetch(`${cleanApiUrl}/api/v1/change-password/`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`, // ✅ como te indicaron
    },
    body: JSON.stringify({
      current_password: currentPassword,   // ✅ tal como pide el backend
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });

  return handleApiResponse(response);
};

// 🆕 EXPORT ACTUALIZADO - Agregar isTokenValid
export { 
  loginUser, 
  logoutUser, 
  isAuthenticated, 
  getUserData, 
  getUserRole,
  getToken, 
  changePassword,
  isTokenValid  // 🆕 ¡ESTE ERA EL QUE FALTABA!
};