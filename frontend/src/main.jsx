import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{
      duration: 4000,
      style: {
        background: "#12141a", color: "#e2e8f0",
        border: "1px solid rgba(0,82,255,0.3)",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "0.875rem", borderRadius: "0.75rem",
        boxShadow: "0 0 20px rgba(0,82,255,0.2)",
      },
      success: { iconTheme: { primary: "#00c853", secondary: "#0a0b0f" } },
      error:   { iconTheme: { primary: "#ff3b3b", secondary: "#0a0b0f" } },
      loading: { iconTheme: { primary: "#0052ff", secondary: "#0a0b0f" } },
    }} />
  </React.StrictMode>
);
