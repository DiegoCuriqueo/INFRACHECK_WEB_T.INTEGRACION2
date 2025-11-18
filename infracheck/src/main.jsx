import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./themes/ThemeContext"; // Importa el ThemeProvider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider> {/*Envuelve tu App */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);