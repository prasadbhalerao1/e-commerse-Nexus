/* global process */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: backendUrl,
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  }
});
