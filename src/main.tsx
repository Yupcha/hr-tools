import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LockProvider } from "./lib/lock";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LockProvider>
      <App />
    </LockProvider>
  </React.StrictMode>,
);
