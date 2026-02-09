import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  
  return {
    plugins: [react(), tsconfigPaths(), tailwindcss()],
    
    base: isProduction ? "./" : "/",
    
    clearScreen: false,
    
    server: {
      port: 5173,
      strictPort: true,
      host: "localhost",
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 5173,
      },
    },
    
    build: {
      outDir: "dist",
      minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
      sourcemap: !!process.env.TAURI_DEBUG,
      target: "esnext",
      assetsDir: "assets",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    
    envPrefix: ["VITE_", "TAURI_"],
  };
});
