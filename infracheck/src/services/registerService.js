import { cleanApiUrl, defaultHeaders, handleApiResponse } from './apiConfig.js';

/**
 * Servicio de registro de usuarios
 * @param {Object} userData - Datos del usuario para registro
 * @param {string} userData.rut - RUT del usuario (ej: "12345678-9")
 * @param {string} userData.username - Nickname del usuario
 * @param {string} userData.email - Correo electrónico
 * @param {string} userData.phone - Teléfono (se limpia automáticamente)
 * @param {string} userData.password - Contraseña
 * @param {string} userData.confirmPassword - Confirmación de contraseña
 * @returns {Promise<Object>} Respuesta del servidor con datos del usuario creado
 */
const registerUser = async (userData) => {
  try {
    const response = await fetch(`${cleanApiUrl}/v1/register/`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        rut: userData.rut,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        confirmPassword: userData.confirmPassword
      })
    });

    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

/**
 * Función para validar formato de RUT (básica)
 * @param {string} rut - RUT a validar
 * @returns {boolean} True si el formato es válido
 */
const validateRutFormat = (rut) => {
  const rutRegex = /^\d{1,8}-[\dkK]$/;
  return rutRegex.test(rut);
};

/**
 * Función para limpiar formato de teléfono
 * @param {string} phone - Teléfono a limpiar
 * @returns {string} Teléfono limpio (solo números)
 */
const cleanPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '');
};

/**
 * Función para validar email básico
 * @param {string} email - Email a validar
 * @returns {boolean} True si el formato es válido
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export { registerUser, validateRutFormat, cleanPhoneNumber, validateEmail };