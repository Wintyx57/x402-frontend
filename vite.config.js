/// <reference types="vitest" />
import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { generateRoutePages } from "./vite-plugin-generate-routes.js";

export default defineConfig({
  plugins: [react(), tailwindcss(), generateRoutePages()],
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      // Force single copy of react-query (0xtrails bundles its own v5.90.9)
      "@tanstack/react-query": path.resolve(
        "./node_modules/@tanstack/react-query",
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three")) return "vendor-three"; // Three.js isolated for hero 3D scene
            // Trails SDK — lazy-loaded only via /fund page
            if (id.includes("0xtrails") || id.includes("@0xsequence")) {
              return "vendor-trails";
            }
            // Thirdweb SDK — isolated (social login, fiat onramp)
            if (id.includes("thirdweb")) {
              return "vendor-thirdweb";
            }
            // Web3 core: viem + wagmi + react-query
            if (
              id.includes("/viem/") ||
              id.includes("wagmi") ||
              id.includes("@tanstack/react-query")
            ) {
              return "vendor-web3";
            }
            if (id.includes("react-dom") || id.includes("react/")) {
              return "vendor-react";
            }
            if (id.includes("react-router-dom")) {
              return "vendor-router";
            }
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            if (id.includes("chart.js") || id.includes("react-chartjs-2")) {
              return "vendor-charts";
            }
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    env: {
      NODE_ENV: "test",
    },
  },
});
