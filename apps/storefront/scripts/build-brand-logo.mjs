/**
 * build-brand-logo — derive the served wordmark from the master PNG.
 *
 * The master is 2172x724 and 1.1MB. The wordmark never renders wider than
 * 270px (the footer lockup), so even a 4x device needs only ~1080px. The
 * master is kept in the repo as the editable original; this script derives
 * the file the site actually ships.
 *
 * Measured: 1100px wide, webp q88, no alpha (the art is opaque) = ~16KB.
 * That is 1/70th of the master, and the master's extra 1072px of width were
 * never reaching a screen.
 *
 * Run after replacing the master:  node scripts/build-brand-logo.mjs
 */
import { createRequire } from 'node:module'
import { mkdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
/**
 * sharp comes in with next (which uses it for image optimization) rather than
 * being declared here, because this script runs once when the wordmark
 * changes, not in the build. If that ever stops being true the message says
 * so plainly instead of throwing MODULE_NOT_FOUND at someone.
 */
let sharp
try {
  sharp = require('sharp')
} catch {
  console.error(
    'sharp is not resolvable. It normally arrives as a dependency of next.\n' +
      'Install it just for this script:  npm i -D sharp -w storefront',
  )
  process.exit(1)
}

const root = dirname(dirname(fileURLToPath(import.meta.url)))
/**
 * The master lives OUTSIDE public/ on purpose. Anything under public/ is
 * uploaded to the edge and publicly fetchable, so leaving an unreferenced
 * 1.1MB PNG there shipped it with every deployment for nothing.
 */
const SRC = join(root, 'assets/brand/punjabimarts-logo.png')
const OUT = join(root, 'public/brand/punjabimarts-logo.webp')

/** 1100px covers the 270px lockup at devicePixelRatio 4 with room to spare. */
const WIDTH = 1100
/**
 * q88, not the q75 used for photography. A wordmark is flat art with hard
 * edges, where webp's chroma handling shows banding far earlier than it does
 * on embroidery. Measured cost of q88 over q80 on this file: 3KB.
 */
const QUALITY = 88

const kb = (n) => `${Math.round(n / 1024)}KB`

const meta = await sharp(SRC).metadata()
await mkdir(dirname(OUT), { recursive: true })

const { height } = await sharp(SRC)
  .resize({ width: WIDTH, withoutEnlargement: true })
  .webp({ quality: QUALITY, effort: 6 })
  .toFile(OUT)

const before = await stat(SRC)
const after = await stat(OUT)

console.log(
  `brand logo  ${meta.width}x${meta.height} ${meta.format} ${kb(before.size)}` +
    `  ->  ${WIDTH}x${height} webp ${kb(after.size)}` +
    `  (${Math.round((1 - after.size / before.size) * 100)}% smaller)`,
)
console.log(`  intrinsic height for <Image>: ${height}`)
