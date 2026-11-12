/**
 * audit-image-sizes — catch `sizes` drift before it reaches a phone.
 *
 * A wrong `sizes` is the most expensive bug in a catalogue site and the
 * hardest to notice: nothing looks broken, the page just quietly costs twice
 * what it should, and only on the connections you are not testing on.
 *
 * This script resolves every `sizes` string in src/lib/image-sizes.ts the way
 * a browser does — evaluate the media conditions at a viewport, take the
 * first match, multiply by devicePixelRatio, round UP to the next rung of the
 * configured ladder — and compares the chosen width against the width that
 * element MEASURED at on the deployed site.
 *
 * WHAT IT CATCHES
 *   - a `sizes` edited to a value that over-fetches (the 4.55x card)
 *   - a `sizes` that leaves an image soft (declared below what it renders)
 *   - a ladder change that misaligns a rung (e.g. re-adding 384 next to 360)
 *   - two rungs close enough that one image can be fetched at both
 *
 * WHAT IT CANNOT CATCH
 *   The measurements below are a snapshot. If you change a grid's column
 *   count, a container max-width or a tile size, the CSS moves and this table
 *   does not follow it. Re-measure that role in a browser and update MEASURED.
 *   This is a regression guard on the sizes strings, not a live layout check.
 *
 * Usage:  node scripts/audit-image-sizes.mjs
 *         npm run images:audit
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

/** Over-fetching beyond this multiple of the needed pixels fails the audit. */
const MAX_OVERFETCH = 1.35
/** Serving below this fraction of the needed pixels fails as visibly soft. */
const MIN_SHARPNESS = 0.92
/** Two rungs closer than this can both be picked for one image. */
const MIN_RUNG_GAP = 1.2

const VIEWPORTS = [390, 768, 1024, 1280, 1512]
const DPR = 2

/**
 * Rendered width in CSS px of each role, measured with
 * getBoundingClientRect() on the deployed site at each viewport above.
 * Where a role appears in more than one layout (product cards appear in both
 * the home grid and the category listing) this is the MAX, because `sizes` has
 * to satisfy the widest instance or that one arrives soft.
 */
const MEASURED = {
  SIZES_HERO: [358, 396, 528, 669, 713],
  SIZES_EDITORIAL: [358, 360, 480, 608, 648],
  SIZES_STORY: [356, 346, 466, 594, 634],
  SIZES_CARD: [171, 352, 304, 390, 416],
  SIZES_CARD_HOME: [171, 352, 222, 286, 306],
  SIZES_CARD_FMCG: [171, 168, 309, 189, 203],
  SIZES_CARD_SPOTLIGHT: [155, 153, 91, 126, 135],
  SIZES_CEREMONY_TILE: [171, 230, 177, 228, 244],
  SIZES_TECHNIQUE: [138, 129, 177, 228, 244],
  SIZES_PROMO: [112, 112, 200, 200, 200],
  SIZES_CATEGORY_TILE: [110, 91, 125, 161, 173],
  SIZES_SHORTCUT: [80, 108, 146, 109, 116],
  SIZES_PDP: [358, 720, 492, 748, 828],
  SIZES_SELLER_AVATAR: [240, 240, 240, 240, 240],
  SIZES_CART_THUMB: [96, 96, 96, 96, 96],
  SIZES_LOGO: [166, 176, 260, 270, 270],
}

/**
 * Widest real source per role, in px. Next never upscales past the source, so
 * asking for a rung above it returns identical pixels under a new cache key —
 * work and a cache entry for nothing. null = not width-limited in practice.
 */
const SOURCE_WIDTH = {
  SIZES_HERO: 1672,
  SIZES_PDP: 1122,
  SIZES_CARD: 1122,
  SIZES_CARD_HOME: 1122,
  SIZES_CARD_FMCG: 1122,
  SIZES_CARD_SPOTLIGHT: 1122,
  SIZES_LOGO: 1100,
}

/**
 * Roles allowed to exceed MAX_OVERFETCH, each with the measurement that
 * justifies it. An exemption needs a reason, not just a name — if you cannot
 * write the byte counts that make over-fetching the cheaper option, the role
 * is not exempt, it is mis-sized.
 */
const EXEMPT = {
  SIZES_LOGO:
    'one shared w=640 variant (5.4KB, 1 request) beats sizing the header ' +
    'correctly, which would fetch w=360 + w=640 (8.6KB, 2 requests) because ' +
    'the footer lockup is 270px on every page. Flat art at 5KB is below the ' +
    'width where a correct `sizes` pays for itself.',
}

function readLadder() {
  const cfg = readFileSync(join(root, 'next.config.ts'), 'utf8')
  const grab = (key) => {
    const m = cfg.match(new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`))
    if (!m) throw new Error(`could not read images.${key} from next.config.ts`)
    return m[1].split(',').map((n) => Number(n.trim())).filter(Number.isFinite)
  }
  return { deviceSizes: grab('deviceSizes'), imageSizes: grab('imageSizes') }
}

function readSizes() {
  const src = readFileSync(join(root, 'src/lib/image-sizes.ts'), 'utf8')
  const out = {}
  for (const m of src.matchAll(/export const (SIZES_\w+) = '([^']+)'/g)) out[m[1]] = m[2]
  return out
}

/** Resolve a `sizes` string at one viewport, as the browser's parser would. */
function resolve(sizes, vw) {
  for (const partRaw of sizes.split(',')) {
    const part = partRaw.trim()
    const cond = part.match(/^\(min-width:\s*(\d+)px\)\s*(.+)$/)
    const value = cond ? cond[2].trim() : part
    if (cond && vw < Number(cond[1])) continue
    const vwUnit = value.match(/^([\d.]+)vw$/)
    if (vwUnit) return (Number(vwUnit[1]) / 100) * vw
    const px = value.match(/^([\d.]+)px$/)
    if (px) return Number(px[1])
    throw new Error(`unparsable sizes value: "${value}"`)
  }
  throw new Error(`no fallback in sizes: "${sizes}"`)
}

/**
 * Which candidate the browser downloads. srcset candidates come from the
 * ladder; viewport-relative `sizes` draw on deviceSizes only, fixed-px `sizes`
 * may also hit the smaller imageSizes rungs.
 */
function pick(declaredPx, sizes, ladder) {
  const fixedOnly = !/vw/.test(sizes)
  const rungs = fixedOnly
    ? [...ladder.imageSizes, ...ladder.deviceSizes].sort((a, b) => a - b)
    : [...ladder.deviceSizes].sort((a, b) => a - b)
  const want = declaredPx * DPR
  return rungs.find((r) => r >= want) ?? rungs[rungs.length - 1]
}

const ladder = readLadder()
const sizes = readSizes()
const failures = []
const rows = []

// --- ladder self-check: no two rungs close enough to both serve one image ---
const all = [...new Set([...ladder.imageSizes, ...ladder.deviceSizes])].sort((a, b) => a - b)
for (let i = 1; i < all.length; i++) {
  const ratio = all[i] / all[i - 1]
  if (ratio < MIN_RUNG_GAP) {
    failures.push(
      `ladder: rungs ${all[i - 1]} and ${all[i]} are only ${Math.round((ratio - 1) * 100)}% apart ` +
        `(need ${Math.round((MIN_RUNG_GAP - 1) * 100)}%) — one image can be fetched at both`,
    )
  }
}

// --- every role must have measurements, and vice versa ---
for (const name of Object.keys(sizes)) {
  if (!MEASURED[name]) failures.push(`${name}: exported but has no entry in MEASURED`)
}
for (const name of Object.keys(MEASURED)) {
  if (!sizes[name]) failures.push(`${name}: in MEASURED but no longer exported`)
}

for (const [name, sizeStr] of Object.entries(sizes)) {
  const measured = MEASURED[name]
  if (!measured) continue
  const cap = SOURCE_WIDTH[name] ?? null
  for (let i = 0; i < VIEWPORTS.length; i++) {
    const vw = VIEWPORTS[i]
    const rendered = measured[i]
    const declared = resolve(sizeStr, vw)
    const served = pick(declared, sizeStr, ladder)
    // The source caps what can actually be delivered, so sharpness is judged
    // against the best available, not against an unreachable ideal.
    const need = Math.min(rendered * DPR, cap ?? Infinity)
    const ratio = served / need
    const verdict =
      ratio > MAX_OVERFETCH ? 'OVER' : ratio < MIN_SHARPNESS ? 'SOFT' : 'ok'
    if (cap && served > cap && !EXEMPT[name]) {
      failures.push(
        `${name} @${vw}px: asks w=${served} but the source is only ${cap}px wide — ` +
          `identical pixels under a new cache key`,
      )
    }
    if (verdict === 'OVER' && EXEMPT[name]) {
      rows.push({ name, vw, rendered, declared: Math.round(declared), served, ratio, verdict: 'exempt' })
      continue
    }
    if (verdict !== 'ok') {
      failures.push(
        `${name} @${vw}px: renders ${rendered}px (needs w=${Math.round(need)} at dpr${DPR}), ` +
          `declares ${Math.round(declared)}px so fetches w=${served} — ${ratio.toFixed(2)}x ${verdict}`,
      )
    }
    rows.push({ name, vw, rendered, declared: Math.round(declared), served, ratio, verdict })
  }
}

const w = (s, n) => String(s).padEnd(n)
const pad = (s, n) => String(s).padStart(n)
console.log(`ladder  ${all.join(' ')}\n`)
console.log(`${w('role', 22)}${w('vw', 7)}${pad('render', 7)}${pad('declare', 8)}${pad('fetch', 7)}${pad('ratio', 8)}  verdict`)
let lastName = ''
for (const r of rows) {
  console.log(
    w(r.name === lastName ? '' : r.name, 22) +
      w(r.vw, 7) +
      pad(r.rendered, 7) +
      pad(r.declared, 8) +
      pad(r.served, 7) +
      pad(r.ratio.toFixed(2) + 'x', 8) +
      '  ' +
      (r.verdict === 'ok' ? 'ok' : `<-- ${r.verdict}`),
  )
  lastName = r.name
}

for (const name of Object.keys(EXEMPT)) {
  if (!sizes[name]) {
    failures.push(`${name}: exempted but no longer exported — drop the exemption`)
  } else if (!rows.some((r) => r.name === name && r.verdict === 'exempt')) {
    failures.push(
      `${name}: exempted but now within budget at every viewport — drop the ` +
        `exemption so the next regression is caught`,
    )
  }
}

const scored = rows.filter((r) => r.verdict !== 'exempt')
const worst = scored.reduce((a, b) => (b.ratio > a.ratio ? b : a))
console.log(
  `\n${rows.length} role/viewport pairs checked. ` +
    `worst over-fetch ${worst.ratio.toFixed(2)}x (${worst.name} @${worst.vw}px).`,
)

const exemptRows = rows.filter((r) => r.verdict === 'exempt')
if (exemptRows.length) {
  console.log('\nexemptions (over budget on purpose):')
  for (const name of [...new Set(exemptRows.map((r) => r.name))]) {
    const at = exemptRows.filter((r) => r.name === name).map((r) => `${r.vw}px ${r.ratio.toFixed(2)}x`)
    console.log(`  ${name} @ ${at.join(', ')}`)
    console.log(`    ${EXEMPT[name]}`)
  }
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('all roles within budget.')
