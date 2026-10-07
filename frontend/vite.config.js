import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// El proxy envía /api al backend de Java, así no hace falta configurar CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { "/api": "http://localhost:8080" },
  },
});
