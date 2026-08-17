import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the built app works from any static path (or file://)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
})
