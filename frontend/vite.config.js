import { defineConfig } from "vite";
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
