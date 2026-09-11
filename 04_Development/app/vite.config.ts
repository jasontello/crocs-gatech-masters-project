import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/crocs-gatech-masters-project/",
  plugins: [
    react(),
    VitePWA({
      manifest: false,
      injectRegister: "script",
      workbox: {
        cacheId: "crocs-setup-a",
        globPatterns: [
          "**/*.{js,css,html,webp,svg,webmanifest}",
          "icons/*.png",
        ],
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});
