import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 4000,
    open: true,
    allowedHosts: ['d204d7a2a9ce.ngrok-free.app'],
  },
  build: {
    outDir: 'dist',
  },
})

