import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import App from "./App.js";
import { Provider } from "./provider.js";
import "./styles/globals.css";

window.addEventListener("error", (event) => {
  console.error("Erro global capturado:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Promise rejeitada não tratada:", event.reason);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento root não encontrado!");
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <Provider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Provider>
      </BrowserRouter>
    </React.StrictMode>,
  );
} catch (error) {
  console.error("Erro ao renderizar aplicação:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Erro ao carregar aplicação</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}