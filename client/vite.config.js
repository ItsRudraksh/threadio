import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    port: 3000,
    // Get rid of the CORS error
    proxy: {
      "/api": {
        // target: "http://localhost:5000",
        target: "https://threadio.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
