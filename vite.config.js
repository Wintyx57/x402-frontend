/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { generateRoutePages } from './vite-plugin-generate-routes.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), generateRoutePages()],
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-web3': ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-trails': ['0xtrails'],
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    env: {
      NODE_ENV: 'test',
    },
  },
})
