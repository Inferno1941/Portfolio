import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "PORT");
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // Keep the browser's Host so the API's same-origin check matches the Origin header.
        "/api": {
          target: `http://localhost:${process.env.PORT || env.PORT || 3001}`,
          changeOrigin: false,
        },
      },
    },
  };
});
