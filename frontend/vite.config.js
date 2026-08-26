import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces for AirNav
    port: 5173,
    strictPort: false,
    middlewareMode: false,
    hmr: {
      host: '172.21.9.76', // AirNav Network IP
      port: 5174
    }
  }
})
