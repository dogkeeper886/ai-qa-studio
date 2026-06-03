import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Two-process dev (#2): Vite serves the UI and proxies /api + /ws to the hub.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // allow importing the design framework verbatim from the repo-root design/
    fs: { allow: ["../.."] },
    proxy: {
      "/api": "http://localhost:5174",
      "/ws": { target: "ws://localhost:5174", ws: true },
    },
  },
});
