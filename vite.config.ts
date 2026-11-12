import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    // Chrome 64+/Safari 12+ stay supported; older browsers get the friendly
    // "can't open" screen from index.html instead of a blank page.
    target: 'es2017',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          pdf: ['pdfjs-dist'],
          markdown: ['react-markdown', 'remark-gfm', 'remark-math', 'rehype-katex', 'katex'],
          visuals: ['mermaid', 'framer-motion'],
          export: ['jspdf', 'qrcode'],
        },
      },
    },
  },
})
