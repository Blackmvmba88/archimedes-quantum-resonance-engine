import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/archimedes-quantum-resonance-engine/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          plotly: ['plotly.js-dist'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
