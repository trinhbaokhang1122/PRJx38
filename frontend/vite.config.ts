import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/ors": {
        target: "http://localhost:5000",    // ← ĐÃ SỬA: proxy về backend của bạn
        changeOrigin: true,
        secure: false,
        // ĐÃ XÓA rewrite → không được rewrite khi proxy qua backend
      },
    },
  },
});