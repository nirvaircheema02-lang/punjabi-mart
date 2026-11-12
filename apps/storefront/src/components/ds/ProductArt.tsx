/**
 * ProductArt — deterministic SVG artwork per product.
 *
 * Why generated SVG rather than stock photography: PunjabiMarts has no product
 * photography yet, and using someone else's photos of someone else's products
 * would be both a licensing problem and a lie about the catalogue. These are
 * honest, designed placeholders that hold the real layout — swapping in real
 * shots later is a data change, not a redesign.
 *
 * They also happen to be the performance-optimal choice: inline SVG, no network
 * request, no layout shift, scales to any density (§7c).
 *
 * Phulkari is geometric embroidery, so geometric pattern work here is
 * on-brand rather than a stand-in for it.
 */

import type { ArtKind } from '@/lib/taxonomy'

/** Stable pseudo-random from a string, so a product's art never changes. */
function seeded(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

/**
 * Palette drawn from the craft traditions, not from the UI chrome.
 * Each category carries several colourways so that two products in the same
 * grid never read as the same swatch — a single palette per category made
 * phulkari rows look like repeating wallpaper.
 */
const palettes: Record<ArtKind, Array<[string, string, string]>> = {
  phulkari: [
    ['#7A1F3D', '#D4713A', '#E8B84B'],
    ['#3E2A56', '#B5527F', '#EFC98F'],
    ['#8A3411', '#E0913C', '#F5DCA8'],
  ],
  juttis: [
    ['#8C3A1E', '#C98A4B', '#F0D9B5'],
    ['#5E1F2B', '#A9713F', '#EBD2AE'],
    ['#2E3C52', '#8C7B54', '#E8DCC2'],
  ],
  jewellery: [
    ['#4A4458', '#9A8CA8', '#D8C9A3'],
    ['#3A3F46', '#8E94A0', '#CFC6AE'],
    ['#4F3B33', '#A08B7A', '#DED2BE'],
  ],
  turbans: [
    ['#2F4A7A', '#5A8AC4', '#D9E4F2'],
    ['#7A2E1E', '#C97A4B', '#F0DCC8'],
    ['#2C4A3A', '#6E9B7E', '#DCE8DF'],
  ],
  wedding: [
    ['#7D1F2E', '#C9A227', '#F2E3C4'],
    ['#5A2350', '#B98A3E', '#EFDDBE'],
  ],
  home: [
    ['#3F5B4A', '#8DA98F', '#E4E8DC'],
    ['#4A4038', '#9B8A76', '#E8E0D2'],
  ],
  pantry: [
    ['#6B4A1E', '#C79A3C', '#F2E6CC'],
    ['#5A3A18', '#B8862F', '#EFE0C2'],
    ['#7A5A22', '#D0A648', '#F5EAD2'],
  ],
  menswear: [
    ['#2E3A4A', '#7C8899', '#E4E8ED'],
    ['#4A4236', '#9B9079', '#EDE7DA'],
    ['#3A2F3E', '#8C7F92', '#E8E2EA'],
  ],
  accessories: [
    ['#3F4448', '#8B9298', '#DFE3E6'],
    ['#4A3C2E', '#9B8B79', '#E9E1D6'],
    ['#2F3E3A', '#7E918B', '#DEE6E3'],
  ],
}

export function ProductArt({
  kind, seed, ratio = '4:5', className,
}: { kind: ArtKind; seed: string; ratio?: '4:5' | '1:1' | '16:9'; className?: string }) {
  const rand = seeded(seed)
  const ways = palettes[kind] ?? palettes.home
  // Colourway is chosen from the seed, so it's stable per product but varies
  // across a grid. Rotating the generator first keeps it independent of the
  // motif randomness below.
  const [deep, mid, light] = ways[Math.floor(rand() * ways.length) % ways.length]
  const vb = ratio === '1:1' ? '0 0 100 100' : ratio === '16:9' ? '0 0 160 90' : '0 0 100 125'
  const h = ratio === '1:1' ? 100 : ratio === '16:9' ? 90 : 125
  const id = `a${seed.replace(/[^a-z0-9]/gi, '')}`

  return (
    <svg
      viewBox={vb}
      className={className}
      role="img"
      aria-label={`${kind} artwork`}
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={mid} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}g)`} />
      {renderMotif(kind, { deep, mid, light, seed, h })}
    </svg>
  )
}

type Ctx = { deep: string; mid: string; light: string; seed: string; h: number }

function renderMotif(kind: ArtKind, c: Ctx) {
  switch (kind) {
    case 'phulkari':  return <Phulkari {...c} />
    case 'juttis':    return <Jutti {...c} />
    case 'jewellery': return <Jewellery {...c} />
    case 'turbans':   return <Turban {...c} />
    case 'wedding':   return <Wedding {...c} />
    case 'pantry':    return <Pantry {...c} />
    case 'menswear':  return <Menswear {...c} />
    case 'accessories': return <AccessoryMotif {...c} />
    default:          return <HomeMotif {...c} />
  }
}

/** Kurta silhouette — collar, placket and sleeve line. */
function Menswear({ deep, mid, light, h }: Ctx) {
  const cy = h * 0.5
  return (
    <g>
      <path d={`M36 ${cy - 30} L50 ${cy - 24} L64 ${cy - 30}
                L76 ${cy - 22} L72 ${cy + 4} L68 ${cy + 2} L68 ${cy + 32}
                L32 ${cy + 32} L32 ${cy + 2} L28 ${cy + 4} L24 ${cy - 22} Z`} fill={deep} />
      <path d={`M50 ${cy - 24} L50 ${cy + 24}`} stroke={light} strokeWidth="1.6" opacity="0.8" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx="50" cy={cy - 16 + i * 11} r="1.8" fill={mid} />
      ))}
      <path d={`M36 ${cy - 30} L50 ${cy - 18} L64 ${cy - 30}`} fill="none" stroke={light} strokeWidth="1.8" />
    </g>
  )
}

/** Pin / salayi cluster — long slender forms with worked heads. */
function AccessoryMotif({ deep, mid, light, h }: Ctx) {
  const cy = h * 0.5
  return (
    <g>
      {[-14, 0, 14].map((dx, i) => (
        <g key={i} transform={`rotate(${dx * 0.6} 50 ${cy})`}>
          <rect x={48 + dx * 0.2} y={cy - 26} width="3" height="50" rx="1.5"
            fill={i === 1 ? deep : mid} opacity={0.9} />
          <circle cx={49.5 + dx * 0.2} cy={cy - 28} r="5" fill={deep} />
          <circle cx={49.5 + dx * 0.2} cy={cy - 28} r="2" fill={light} />
        </g>
      ))}
    </g>
  )
}

/** Darning-stitch diamond grid — the structural logic of real phulkari.
 *  Grid pitch and density vary per seed so two phulkari pieces in one row read
 *  as different cloth rather than the same repeated swatch. */
function Phulkari({ deep, mid, h, seed }: Ctx) {
  // Keep the generator local: React can replay this component independently.
  const rand = seeded(seed)
  rand() // Match the palette draw made by ProductArt.
  const cols = 6 + Math.floor(rand() * 4) // 6-9 columns
  const pitch = 100 / cols
  const density = 0.38 + rand() * 0.3
  const half = pitch * 0.34
  const rows = Math.ceil(h / pitch)
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      // Offset alternate rows — real darning stitch staggers.
      const x = col * pitch + pitch / 2 + (r % 2 ? pitch / 2 : 0)
      const y = r * pitch + pitch / 2
      if (rand() > density) continue
      cells.push(
        <path
          key={`${r}-${col}`}
          d={`M${x} ${y - half} L${x + half} ${y} L${x} ${y + half} L${x - half} ${y} Z`}
          fill={rand() > 0.5 ? deep : mid}
          opacity={0.5 + rand() * 0.45}
        />,
      )
    }
  }
  return <g>{cells}</g>
}

/** Jutti — the distinctive upturned toe and embroidered vamp. */
function Jutti({ deep, mid, light, h }: Ctx) {
  const cy = h * 0.55
  return (
    <g>
      <path
        d={`M18 ${cy + 18} C18 ${cy + 2} 30 ${cy - 8} 50 ${cy - 8}
            C68 ${cy - 8} 80 ${cy - 2} 86 ${cy + 4}
            C90 ${cy + 8} 86 ${cy + 14} 78 ${cy + 16}
            C60 ${cy + 20} 34 ${cy + 22} 18 ${cy + 18} Z`}
        fill={deep}
      />
      <path d={`M80 ${cy + 2} C88 ${cy - 6} 92 ${cy - 14} 86 ${cy - 16}
                C80 ${cy - 18} 76 ${cy - 10} 78 ${cy + 1} Z`} fill={deep} />
      <path d={`M30 ${cy + 4} C42 ${cy - 4} 58 ${cy - 4} 70 ${cy + 1}`}
            stroke={light} strokeWidth="1.6" fill="none" opacity="0.85" />
      {[38, 48, 58].map((x, i) => (
        <circle key={i} cx={x} cy={cy + 2} r="2.2" fill={mid} opacity="0.9" />
      ))}
    </g>
  )
}

/** Jhumka — radial bell with drop fringe. */
function Jewellery({ deep, mid, light, h }: Ctx) {
  const cy = h * 0.46
  return (
    <g>
      <circle cx="50" cy={cy - 20} r="5" fill="none" stroke={deep} strokeWidth="2" />
      <path d={`M34 ${cy + 8} A16 16 0 0 1 66 ${cy + 8} Z`} fill={deep} />
      <path d={`M36 ${cy + 8} A14 14 0 0 1 64 ${cy + 8}`} fill="none" stroke={light} strokeWidth="1.2" opacity="0.7" />
      {Array.from({ length: 7 }).map((_, i) => {
        const x = 36 + i * 4.7
        return <circle key={i} cx={x} cy={cy + 13} r="2" fill={mid} />
      })}
      <circle cx="50" cy={cy - 6} r="3" fill={light} opacity="0.9" />
    </g>
  )
}

/** Turban — layered wrapped bands (larh), the defining visual of a dastaar. */
function Turban({ deep, mid, light, h }: Ctx) {
  const cy = h * 0.5
  return (
    <g>
      <path d={`M22 ${cy + 22} C22 ${cy - 10} 36 ${cy - 26} 52 ${cy - 26}
                C70 ${cy - 26} 82 ${cy - 8} 82 ${cy + 22} Z`} fill={deep} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${24 + i * 1.5} ${cy + 18 - i * 8} C${40} ${cy - 6 - i * 8} ${64} ${cy - 10 - i * 7} ${80 - i * 1.5} ${cy + 16 - i * 8}`}
          fill="none"
          stroke={i % 2 ? light : mid}
          strokeWidth="2.4"
          opacity={0.75}
          strokeLinecap="round"
        />
      ))}
      <path d={`M50 ${cy - 26} L54 ${cy - 34} L58 ${cy - 26} Z`} fill={mid} opacity="0.9" />
    </g>
  )
}

/** Shagun — symmetric ceremonial medallion. */
function Wedding({ deep, mid, light, h }: Ctx) {
  const cy = h * 0.48
  return (
    <g>
      <circle cx="50" cy={cy} r="26" fill="none" stroke={deep} strokeWidth="2" opacity="0.9" />
      <circle cx="50" cy={cy} r="18" fill={deep} opacity="0.18" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <path
            key={i}
            d={`M${(50 + Math.cos(a) * 18).toFixed(4)} ${(cy + Math.sin(a) * 18).toFixed(4)}
                L${(50 + Math.cos(a) * 26).toFixed(4)} ${(cy + Math.sin(a) * 26).toFixed(4)}`}
            stroke={mid} strokeWidth="2.4" strokeLinecap="round"
          />
        )
      })}
      <circle cx="50" cy={cy} r="7" fill={light} />
      <circle cx="50" cy={cy} r="3" fill={deep} />
    </g>
  )
}

function HomeMotif({ deep, mid, light, h }: Ctx) {
  const cy = h * 0.5
  return (
    <g>
      <rect x="28" y={cy - 20} width="44" height="40" rx="4" fill={deep} opacity="0.85" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M34 ${cy - 10 + i * 11} H66`} stroke={light} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      ))}
      <circle cx="50" cy={cy + 26} r="4" fill={mid} />
    </g>
  )
}

/** Pantry — jar silhouette with a label band. Flat packshot logic. */
function Pantry({ deep, mid, light, h }: Ctx) {
  const cy = h * 0.5
  return (
    <g>
      <rect x="36" y={cy - 26} width="28" height="8" rx="2" fill={deep} />
      <path d={`M34 ${cy - 18} H66 V${cy + 24} A4 4 0 0 1 62 ${cy + 28} H38 A4 4 0 0 1 34 ${cy + 24} Z`} fill={deep} opacity="0.9" />
      <rect x="34" y={cy - 4} width="32" height="14" fill={light} opacity="0.95" />
      <path d={`M38 ${cy + 3} H62`} stroke={mid} strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}
