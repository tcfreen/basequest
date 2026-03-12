import os

files = {
"frontend/index.html": """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="BaseQuest — Farm Base. Earn XP. Dominate the Chain." />
    <meta name="theme-color" content="#0052ff" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&family=Orbitron:wght@400;600;700;900&display=swap" rel="stylesheet" />
    <title>BaseQuest — Farm Base. Earn XP. Dominate the Chain.</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""",

"frontend/package.json": """{
  "name": "basequest-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "ethers":          "^6.11.1",
    "react":           "^18.3.1",
    "react-dom":       "^18.3.1",
    "react-hot-toast": "^2.4.1",
    "canvas-confetti": "^1.9.3",
    "framer-motion":   "^11.1.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer":         "^10.4.19",
    "postcss":              "^8.4.38",
    "tailwindcss":          "^3.4.3",
    "vite":                 "^5.2.10"
  }
}
""",

"frontend/vite.config.js": """import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: { global: "globalThis" },
  build: {
    target: "esnext",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: { ethers: ["ethers"], react: ["react","react-dom"] },
      },
    },
  },
  server: { port: 3000, open: true },
});
""",

"frontend/tailwind.config.js": """export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0052ff", "base-dark": "#0041cc",
        cyan: "#00d4ff", gold: "#f0b429", "gold-dark": "#d4940a",
        success: "#00c853", danger: "#ff3b3b",
        surface: "#12141a", "surface-2": "#1a1d27", "surface-3": "#22263a",
        bg: "#0a0b0f",
      },
      fontFamily: {
        display: ["Syne","sans-serif"],
        mono:    ["JetBrains Mono","monospace"],
        num:     ["Orbitron","monospace"],
      },
      animation: {
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "slide-up":   "slideUp 0.4s ease-out",
        "fade-in":    "fadeIn 0.3s ease-out",
        "float":      "float 3s ease-in-out infinite",
      },
      keyframes: {
        glowPulse: { "0%,100%": { boxShadow: "0 0 5px #0052ff40" }, "50%": { boxShadow: "0 0 20px #0052ff80" } },
        slideUp:   { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        fadeIn:    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        float:     { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-6px)" } },
      },
      boxShadow: {
        "glow":      "0 0 20px rgba(0,82,255,0.4)",
        "glow-sm":   "0 0 10px rgba(0,82,255,0.3)",
        "glow-gold": "0 0 20px rgba(240,180,41,0.4)",
        "card":      "0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
""",

"frontend/postcss.config.js": """export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
""",

"frontend/src/main.jsx": """import React from "react";
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
""",
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"Created: {path}")

print("Batch 5 done!")
