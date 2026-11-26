import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

/**
 * Every deploy must be distinguishable to the browser. The service worker is
 * copied verbatim from public/, so without a changing byte a browser can keep
 * the old worker forever and users never learn there is a new version.
 *
 * This plugin stamps a deploy id into dist/sw.js and writes version.json, which
 * the app polls to offer a refresh even if the worker check is bypassed.
 */
function buildVersion(): Plugin {
  const version = `${(process.env.GITHUB_SHA || '').slice(0, 7) || 'dev'}-${Date.now().toString(36)}`
  return {
    name: 'jessica-build-version',
    config() {
      return { define: { __APP_VERSION__: JSON.stringify(version) } }
    },
    closeBundle() {
      const dir = path.resolve(__dirname, 'dist')
      const swPath = path.join(dir, 'sw.js')
      try {
        let sw = readFileSync(swPath, 'utf8').replace(/__BUILD__/g, version)
        // Precache the hashed entry JS/CSS (and modulepreload chunks) so the
        // very first visit can boot offline; lazy routes stay runtime-cached.
        const html = readFileSync(path.join(dir, 'index.html'), 'utf8')
        const entryAssets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((match) => match[1])
        // Fonts and images referenced from the built CSS never appear in
        // index.html; precache them too so Arabic text keeps its webfont offline.
        const entryCss = entryAssets.filter((file) => file.endsWith('.css'))
        const cssAssets = entryCss
          .flatMap((file) =>
            [...readFileSync(path.join(dir, file.replace('./', '')), 'utf8').matchAll(/url\(\.\/([^)'"]+)\)/g)].map(
              (match) => `./assets/${match[1]}`,
            ),
          )
          // Only the shell faces: Cairo (Arabic UI) and Plus Jakarta (Latin).
          // KaTeX/Atkinson live in lazy chunks and stay runtime-cached.
          .filter((url) => url.endsWith('.woff2') && /(cairo|plus-jakarta)-/.test(url))
        const assets = [...new Set([...entryAssets, ...cssAssets])]
        sw = `self.JESSICA_ASSETS = ${JSON.stringify(assets)};\n${sw}`
        writeFileSync(swPath, sw)
        writeFileSync(path.join(dir, 'version.json'), JSON.stringify({ version }, null, 2))
      } catch {
        /* a dev build without a service worker is still a valid build */
      }
    },
  }
}

/**
 * Content Security Policy for the built app (a meta tag, because GitHub Pages
 * cannot send headers). The two small inline scripts in index.html are allowed
 * by hash, computed here so the policy always matches what ships.
 *
 * connect-src allows any https host on purpose: the "custom AI provider" setting
 * lets people type their own endpoint. Everything that can run code stays tight.
 */
function contentSecurityPolicy(): Plugin {
  return {
    name: 'jessica-csp',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const hashes = [...html.matchAll(/<script(?![^>]*\b(?:src|type)=)[^>]*>([\s\S]*?)<\/script>/g)].map(
          (match) => `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`,
        )
        const policy = [
          "default-src 'self'",
          `script-src 'self' 'wasm-unsafe-eval' ${hashes.join(' ')} https://cdn.jsdelivr.net https://esm.run`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "media-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self' https: data: blob: http://localhost:* http://127.0.0.1:*",
          "worker-src 'self' blob: https://cdn.jsdelivr.net",
          'frame-src https://www.youtube-nocookie.com',
          "manifest-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; ')
        return html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`)
      },
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), buildVersion(), contentSecurityPolicy()],
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
