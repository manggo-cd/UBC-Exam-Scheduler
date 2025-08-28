import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/system/ErrorBoundary";

const el = document.getElementById("root");
if (!el) {
  throw new Error("#root not found");
}

const root = createRoot(el);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);