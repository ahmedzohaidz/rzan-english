import sharp from 'sharp'
import fs    from 'fs'
import path  from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SIZES     = [72, 96, 128, 144, 192, 512]
const OUT_DIR   = path.join(__dirname, '..', 'public', 'icons')

function makeSVG(size) {
  const rx = Math.round(size * 0.22 * 512 / size)
  return Buffer.from(`<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="${rx}" fill="#7C3AED"/>
  <path d="M256,140 C220,120 130,125 100,140 L100,380 C130,365 220,360 256,380 Z" fill="white" opacity="0.95"/>
  <path d="M256,140 C292,120 382,125 412,140 L412,380 C382,365 292,360 256,380 Z" fill="white" opacity="0.85"/>
  <rect x="248" y="138" width="16" height="244" rx="8" fill="#5B21B6"/>
  <rect x="120" y="190" width="110" height="10" rx="5" fill="#7C3AED" opacity="0.3"/>
  <rect x="120" y="220" width="90"  height="10" rx="5" fill="#7C3AED" opacity="0.3"/>
  <rect x="120" y="250" width="100" height="10" rx="5" fill="#7C3AED" opacity="0.3"/>
  <rect x="282" y="190" width="110" height="10" rx="5" fill="#5B21B6" opacity="0.3"/>
  <rect x="282" y="220" width="90"  height="10" rx="5" fill="#5B21B6" opacity="0.3"/>
  <rect x="282" y="250" width="100" height="10" rx="5" fill="#5B21B6" opacity="0.3"/>
  <polygon points="420,60 428,82 452,82 433,96 440,118 420,104 400,118 407,96 388,82 412,82" fill="#F59E0B" opacity="0.9"/>
</svg>`)
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const size of SIZES) {
    const outFile = path.join(OUT_DIR, `icon-${size}x${size}.png`)
    await sharp(makeSVG(size)).resize(size, size).png().toFile(outFile)
    console.log(`  ✅ icon-${size}x${size}.png`)
  }
  console.log(`\n✨ تم توليد ${SIZES.length} أيقونة في: public/icons/`)
}

run().catch(err => { console.error('❌', err.message); process.exit(1) })
