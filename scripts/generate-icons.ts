/**
 * generate-icons.ts
 * يولّد 6 أحجام PNG لأيقونة PWA (كتاب مفتوح بنفسجي)
 * تشغيل: npx ts-node --skip-project --transpile-only scripts/generate-icons.ts
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs    = require('fs')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path  = require('path')

const SIZES   = [72, 96, 128, 144, 192, 512]
const OUT_DIR = path.join(process.cwd(), 'public', 'icons')

/** أيقونة: مربع بنفسجي مدوّر + كتاب مفتوح أبيض (SVG paths — بدون خطوط) */
function makeSVG(size: number): Buffer {
  const rx = Math.round(size * 0.22)   // دوران الزوايا 22%

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg">
  <!-- خلفية بنفسجية مدوّرة -->
  <rect width="512" height="512" rx="${rx * 512 / size}" fill="#7C3AED"/>

  <!-- كتاب مفتوح — جانب أيسر -->
  <path d="M256,140 C220,120 130,125 100,140 L100,380
           C130,365 220,360 256,380 Z"
        fill="white" opacity="0.95"/>

  <!-- كتاب مفتوح — جانب أيمن -->
  <path d="M256,140 C292,120 382,125 412,140 L412,380
           C382,365 292,360 256,380 Z"
        fill="white" opacity="0.85"/>

  <!-- خط وسط الكتاب -->
  <rect x="248" y="138" width="16" height="244" rx="8" fill="#5B21B6"/>

  <!-- ثلاثة خطوط صفحة (يسار) -->
  <rect x="120" y="190" width="110" height="10" rx="5" fill="#7C3AED" opacity="0.3"/>
  <rect x="120" y="220" width="90"  height="10" rx="5" fill="#7C3AED" opacity="0.3"/>
  <rect x="120" y="250" width="100" height="10" rx="5" fill="#7C3AED" opacity="0.3"/>

  <!-- ثلاثة خطوط صفحة (يمين) -->
  <rect x="282" y="190" width="110" height="10" rx="5" fill="#5B21B6" opacity="0.3"/>
  <rect x="282" y="220" width="90"  height="10" rx="5" fill="#5B21B6" opacity="0.3"/>
  <rect x="282" y="250" width="100" height="10" rx="5" fill="#5B21B6" opacity="0.3"/>

  <!-- نجمة ذهبية صغيرة أعلى يمين -->
  <polygon points="420,60 428,82 452,82 433,96 440,118 420,104 400,118 407,96 388,82 412,82"
           fill="#F59E0B" opacity="0.9"/>
</svg>`

  return Buffer.from(svg)
}

async function run(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const size of SIZES) {
    const svgBuf = makeSVG(size)
    const outFile = path.join(OUT_DIR, `icon-${size}x${size}.png`)

    await sharp(svgBuf)
      .resize(size, size)
      .png()
      .toFile(outFile)

    console.log(`  ✅ icon-${size}x${size}.png`)
  }

  console.log(`\n✨ تم توليد ${SIZES.length} أيقونة في: public/icons/`)
}

run().catch((err: Error) => {
  console.error('❌ خطأ:', err.message)
  process.exit(1)
})
