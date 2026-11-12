/**
 * Exports every image slot + its generation prompt to CSV and JSON.
 *
 * Run:  npm run images:prompts
 * Out:  image-prompts.csv  /  image-prompts.json  (in the app root)
 *
 * Workflow: generate each image with the prompt, save it to the exact
 * `save_to` path, then `npm run images:scan`. No code changes needed.
 */
import { writeFileSync } from 'node:fs'

// Load the TS manifest through Next's bundled transpiler isn't available here,
// so we re-derive from the same source data via a tiny TS-free reader.
const { execSync } = await import('node:child_process')

const script = `
import { allAssets } from './src/lib/product-images.ts'
console.log(JSON.stringify(allAssets))
`
writeFileSync('.export-tmp.mts', script)

let assets
try {
  const out = execSync('npx tsx .export-tmp.mts', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  assets = JSON.parse(out.trim().split('\n').pop())
} finally {
  execSync('rm -f .export-tmp.mts')
}

const rows = assets.map((a, i) => ({
  n: i + 1,
  save_to: `public${a.src}`,
  ratio: a.ratio,
  alt: a.alt,
  prompt: a.prompt,
}))

writeFileSync('image-prompts.json', JSON.stringify(rows, null, 2) + '\n')

const esc = (s) => `"${String(s).replace(/"/g, '""')}"`
const csv = [
  '#,save_to,ratio,alt,prompt',
  ...rows.map((r) => [r.n, esc(r.save_to), r.ratio, esc(r.alt), esc(r.prompt)].join(',')),
].join('\n')
writeFileSync('image-prompts.csv', csv + '\n')

const byRatio = rows.reduce((m, r) => ({ ...m, [r.ratio]: (m[r.ratio] ?? 0) + 1 }), {})
console.log(`[prompts] ${rows.length} slots exported`)
console.log(`[prompts] by ratio:`, byRatio)
console.log(`[prompts] → image-prompts.csv and image-prompts.json`)
