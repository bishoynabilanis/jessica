import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = await readFile(join(root, 'public', 'icons', 'icon.svg'))
const out = join(root, 'public', 'icons')

await sharp(svg).resize(192, 192).png().toFile(join(out, 'icon-192.png'))
await sharp(svg).resize(512, 512).png().toFile(join(out, 'icon-512.png'))

// Maskable icon: keep art inside the 80% safe zone.
const inner = await sharp(svg).resize(360, 360).png().toBuffer()
const bg = await sharp({
  create: { width: 512, height: 512, channels: 4, background: { r: 5, g: 7, b: 15, alpha: 1 } },
})
  .png()
  .toBuffer()
await sharp(bg)
  .composite([{ input: inner, top: 76, left: 76 }])
  .png()
  .toFile(join(out, 'icon-maskable-512.png'))

console.log('Generated PWA icons')
