import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";

// Registra o Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        type: "module",
        scope: "/",
      });

      // Adiciona listener para atualizações
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("New content is available; please refresh.");
            }
          });
        }
      });

      console.log("ServiceWorker registered successfully:", registration.scope);
    } catch (error) {
      if (error instanceof Error) {
        console.error("ServiceWorker registration failed:", error.message);
      } else {
        console.error("ServiceWorker registration failed:", String(error));
      }
    }
  });

  // Adiciona listener para atualizações de conteúdo
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("New ServiceWorker activated.");
  });
} else {
  console.warn("Service Worker is not supported in this browser.");
}

// Elemento root para a aplicação React
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Renderiza a aplicação React
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Previne erros em desenvolvimento
if (import.meta.hot) {
  import.meta.hot.accept();
}
