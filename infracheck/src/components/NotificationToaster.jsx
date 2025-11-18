// src/components/NotificationToaster.jsx
import React, { useEffect, useState } from "react";
import {
  getNotifications,
  isNotificationsEnabled,
  onNotificationsSettingsChanged,
} from "../services/notificationsServices";

const POLL_INTERVAL_MS = 30000;

const formatDate = (isoStr) => {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleString("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

export default function NotificationToaster() {
  const [enabled, setEnabled] = useState(() => isNotificationsEnabled());
  const [queue, setQueue] = useState([]);
  const [seenIds, setSeenIds] = useState(() => {
    try {
      const raw = localStorage.getItem("notifications_seen_ids");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // escuchar cambios de preferencia (PerfilUser, otras pestañas, etc.)
  useEffect(() => {
    const updateEnabled = () => setEnabled(isNotificationsEnabled());
    const offSettings = onNotificationsSettingsChanged(updateEnabled);
    const onStorage = (e) => {
      if (e.key && e.key.startsWith("notifications_enabled")) {
        updateEnabled();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      offSettings();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // persistir IDs de notificaciones ya vistas
  useEffect(() => {
    try {
      localStorage.setItem("notifications_seen_ids", JSON.stringify(seenIds));
    } catch (e) {
      console.warn("No se pudieron guardar IDs de notificaciones vistas:", e);
    }
  }, [seenIds]);

  // polling al backend
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const fetchNotifications = async () => {
      try {
        const data = await getNotifications(1, 5);
        if (cancelled || !data) return;

        const results = Array.isArray(data.results) ? data.results : [];
        const unread = results.filter((n) => n.leida === false);

        if (!unread.length) return;

        setQueue((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const seenSet = new Set(seenIds);
          const fresh = unread.filter(
            (n) => !existingIds.has(n.id) && !seenSet.has(n.id)
          );
          if (!fresh.length) return prev;
          return [...prev, ...fresh];
        });
      } catch (err) {
        console.error("Error al obtener notificaciones:", err);
      }
    };

    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled, seenIds]);

  const dismiss = (id) => {
    setQueue((prev) => prev.filter((n) => n.id !== id));
    setSeenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  if (!enabled || !queue.length) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[60] flex flex-col gap-3 max-w-sm w-[min(100%,320px)] pointer-events-none">
      {queue.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl border border-slate-200/80 dark:bg-slate-900/95 dark:border-slate-700/70"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent" />
          <div className="relative p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {n.titulo}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {n.mensaje}
                </p>
                {n.fecha_creacion && (
                  <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                    {formatDate(n.fecha_creacion)}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismiss(n.id)}
                className="ml-2 mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-700/80 transition"
              >
                <span className="sr-only">Cerrar</span>
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
