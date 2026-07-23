import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During local dev we proxy /api to the wrangler pages functions server.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8788",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
