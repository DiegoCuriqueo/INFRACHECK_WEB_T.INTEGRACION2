import React from "react";
import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import "../index.css";

// Auto-resuelve páginas por nombre: "carpeta/Componente"
// Ej: backend envía "user/HomeUSER" -> ../pages/user/HomeUSER.jsx
const pages = import.meta.glob("../pages/**/*.jsx", { eager: true });

createInertiaApp({
  resolve: (name) => {
    const path = `../pages/${name}.jsx`;
    const page = pages[path];
    if (!page) {
      console.error(`[Inertia] Page not found: ${name} -> ${path}`);
    }
    return page?.default ?? page;
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <React.StrictMode>
        <App {...props} />
      </React.StrictMode>
    );
  },
});

