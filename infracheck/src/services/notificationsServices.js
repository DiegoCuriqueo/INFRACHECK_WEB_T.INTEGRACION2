// src/services/notificationsService.js
import { cleanApiUrl, makeAuthenticatedRequest } from "./apiConfig";
import { getUserData } from "./authService";

const SETTINGS_PREFIX = "notifications_enabled";
const SETTINGS_EVENT = "notifications:settings-changed";

const getSettingsKey = () => {
  try {
    const user = getUserData();
    if (!user?.user_id) return SETTINGS_PREFIX;
    return `${SETTINGS_PREFIX}_${user.user_id}`;
  } catch {
    return SETTINGS_PREFIX;
  }
};

/**
 * GET /api/notifications/
 * Headers:
 *   Authorization: Bearer <token>  (lo maneja makeAuthenticatedRequest)
 */

export const getNotifications = async (page = 1, pageSize = 5) => {
  const url = new URL(`${cleanApiUrl}/api/notifications/`);
  url.searchParams.set("page", page);
  url.searchParams.set("page_size", pageSize);

  const data = await makeAuthenticatedRequest(url.toString(), {
    method: "GET",
  });

  return data; // { count, results: [...] }
};

/* ------------ Preferencias de notificaciones ------------ */

export const isNotificationsEnabled = () => {
  const key = getSettingsKey();
  const raw = localStorage.getItem(key);
  if (raw === null) return true; // por defecto activadas
  return raw === "true";
};

export const setNotificationsEnabled = (enabled) => {
  const key = getSettingsKey();
  try {
    localStorage.setItem(key, enabled ? "true" : "false");
  } catch (e) {
    console.warn("No se pudo guardar preferencia de notificaciones:", e);
  }
  window.dispatchEvent(new Event(SETTINGS_EVENT));
};

export const onNotificationsSettingsChanged = (handler) => {
  const wrapped = () => handler(isNotificationsEnabled());
  window.addEventListener(SETTINGS_EVENT, wrapped);
  return () => window.removeEventListener(SETTINGS_EVENT, wrapped);
};
