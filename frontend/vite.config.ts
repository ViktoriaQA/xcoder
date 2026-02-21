import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath, URL } from "node:url";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  envDir: '../',  // Шукати .env файл в батьківській директорії (корінь проєкту)
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
    ...(mode === 'development' && {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    }),
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
}));
