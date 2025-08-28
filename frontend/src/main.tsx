import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/system/ErrorBoundary";

function showBootError(err: unknown) {
  const el = document.getElementById("root");
  if (!el) return;
  const pre = document.createElement("pre");
  pre.style.whiteSpace = "pre-wrap";
  pre.style.padding = "16px";
  pre.style.fontFamily = "system-ui, monospace";
  pre.style.background = "#fff3f3";
  pre.style.border = "1px solid #f0caca";
  pre.style.color = "#c00";
  pre.textContent = "App failed to load:\n\n" + String(err);
  el.innerHTML = "";
  el.appendChild(pre);
}

// Surface uncaught errors after mount too
window.addEventListener("error", (e) => showBootError(e.error ?? e.message));
window.addEventListener("unhandledrejection", (e) => showBootError(e.reason ?? "Unhandled promise rejection"));

async function bootstrap() {
  const el = document.getElementById("root");
  if (!el) throw new Error("#root not found");

  let AppMod: any;
  try {
    AppMod = await import("./App");
  } catch (e) {
    showBootError(e);
    return;
  }
  const App = AppMod?.default ?? AppMod;
  if (!App) {
    showBootError("No default export from ./App");
    return;
  }

  const root = createRoot(el);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        {/* Tiny banner so we know mount succeeded */}
        <div style={{padding:"6px 10px",background:"#eef",borderBottom:"1px solid #ccd",fontFamily:"system-ui"}}>
          app mounted (debug)
        </div>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

bootstrap();
