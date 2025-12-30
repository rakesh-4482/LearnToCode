import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy /api/* to backend (keeping the /api prefix)
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      // WebSocket endpoint for compiler
      '/ws': {
        target: 'ws://localhost:5001',
        ws: true,
        changeOrigin: true
      },
      // Health check endpoint
      '/health': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    },
    cors: true
  },
  define: {
    'process.env': {}
  }
})
