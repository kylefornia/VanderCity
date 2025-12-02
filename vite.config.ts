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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split three.js and related libraries into separate chunks
          if (id.includes('three') || id.includes('@react-three')) {
            return 'three';
          }

          // Split react-icons into separate chunk
          if (id.includes('react-icons')) {
            return 'icons';
          }

          // Split node_modules into vendor chunk
          if (id.includes('node_modules')) {
            // Keep react and react-dom together
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})

