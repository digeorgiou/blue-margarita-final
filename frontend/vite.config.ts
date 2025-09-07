import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          routing: ['react-router-dom'],
          icons: ['lucide-react', 'react-icons'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          utils: ['axios', 'yup']
        },
      },
    },
  },
  define: {
    'process.env': {},
  },
})