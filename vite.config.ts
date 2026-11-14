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
    // The modulepreload polyfill ends up in a shared chunk and drags a heavy
    // chunk into the first load; modern browsers handle preload natively.
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vite's dynamic-import helper is shared by every chunk; without an
          // explicit home Rollup folds it into a heavy chunk and the entry then
          // pulls that whole chunk on first paint.
          if (id.includes('vite/preload-helper')) return 'preload'
          if (!id.includes('node_modules')) return undefined
          if (/node_modules\/framer-motion\//.test(id)) return 'motion'
          if (/node_modules\/(mermaid|@mermaid-js|dompurify|cytoscape|dagre|khroma)\//.test(id)) return 'mermaid'
          if (/node_modules\/pdfjs-dist\//.test(id)) return 'pdfjs'
          if (/node_modules\/(jspdf|qrcode)\//.test(id)) return 'export'
          if (
            /node_modules\/(katex|react-markdown|remark-[a-z]+|rehype-[a-z]+|micromark[a-z-]*|mdast[a-z-]*|unified|unist[a-z-]*|hast[a-z-]*|vfile[a-z-]*|property-information|space-separated-tokens|comma-separated-tokens|decode-named-character-reference|character-entities[a-z-]*|html-url-attributes|longest-streak|zwitch|bail|trough|is-plain-obj|devlop|ccount|markdown-table|trim-lines|estree-util-[a-z-]+|style-to-object|inline-style-parser)\//.test(
              id,
            )
          )
            return 'markdown'
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|@remix-run\/router|scheduler)\//.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
})
