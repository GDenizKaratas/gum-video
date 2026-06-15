import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  // Serve the project's public/ folder so Remotion staticFile() resolves
  // audio/captions/logo the same way it does during render.
  publicDir: path.resolve(here, "../public"),
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4005",
      "/output": "http://localhost:4005",
      // Photo render page + design-system assets (iframe preview)
      "/photo-render": "http://localhost:4005",
      "/ds": "http://localhost:4005",
    },
  },
});
