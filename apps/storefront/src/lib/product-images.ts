/**
 * IMAGE MANIFEST — derived, not hand-maintained.
 *
 * AI-generated catalogue images are installed at the paths below, with an
 * SVG fallback available if an image fails to load.
 * Rather than hand-write ~100 entries, prompts are composed from each product's
 * category and title, so the manifest stays correct as the catalogue grows.
 *
 * DROP-IN CONTRACT: generate the image, save it at `src`, done. No code change.
 * Run `npm run images:prompts` to export the base prompt list as JSON/CSV for
 * an external generator.
 *
 * HARD RULES baked into every prompt:
 *   no text · no logos · no watermark · no models/hands · no competitor
 *   branding · no invented certification or regulatory marks · no decorative
 *   background motifs — the product carries the cultural identity.
 */

import { products, sellers, type Product } from './mock-data'
import { categories, type ArtKind } from './taxonomy'

export interface ImageAsset {
  src: string
  alt: string
  prompt: string
  ratio: '4:5' | '1:1' | '16:9'
}

const CRAFT_STYLE =
  'Warm neutral seamless studio background, soft diffused natural light from the left, ' +
  'realistic material texture, product centred with generous margin, shallow depth of field, ' +
  'true-to-colour, premium Indian e-commerce catalogue photography. ' +
  'No text, no logos, no watermark, no hands, no model, no background motifs. Portrait 4:5.'

const FMCG_STYLE =
  'Clean packshot on a white-to-warm-neutral gradient, even soft studio light, realistic ' +
  'packaging with a MINIMAL UNBRANDED label — no brand name, no certification marks, no ' +
  'regulatory symbols, no text claims. Square 1:1, centred, catalogue style.'

/** Category-specific art direction, per the brief's §20. */
const directionByArt: Record<ArtKind, string> = {
  turbans: 'Neatly folded turban cloth showing the weave, layered folds and true fabric colour.',
  phulkari: 'Authentic Punjabi phulkari floss-silk darning embroidery, geometric pattern, thread sheen and khaddar base clearly visible.',
  juttis: 'A pair of handcrafted Punjabi juttis, characteristic flat sole and upturned toe, leather or fabric texture and embroidery clearly visible.',
  jewellery: 'Traditional Punjabi jewellery photographed like premium fashion commerce, fine metalwork and antiqued detail visible.',
  wedding: 'Premium Indian wedding ceremony object, elegant neutral styling, restrained and tasteful — not festive clutter.',
  menswear: 'Clean garment product photography, fabric drape and stitching visible, flat-lay or invisible-mannequin.',
  accessories: 'Small accessory shot in macro detail on a warm neutral surface, materials and finish clearly visible.',
  home: 'Punjabi-inspired home or gifting object, real product photography, warm neutral styling.',
  pantry: 'Food product in simple packaging.',
}

const slugToDir: Record<string, string> = {
  turbans: 'turbans', patka: 'turbans', headwear: 'turbans', 'turban-accessories': 'turbans',
  'kurta-pajama': 'menswear', kurta: 'menswear', pajama: 'menswear',
  phulkari: 'phulkari', jutti: 'juttis', jewellery: 'jewellery', bags: 'jewellery',
  'ceremony-trays': 'wedding', 'ceremony-boxes': 'wedding', 'ceremony-sets': 'wedding',
  'wedding-gifting': 'wedding', 'sikh-religious': 'wedding',
  'home-decor': 'gifting', gifts: 'gifting', pantry: 'pantry',
}

function buildAsset(p: Product): ImageAsset {
  const dir = slugToDir[p.category] ?? 'gifting'
  const isFmcg = p.kind === 'fmcg'
  const direction = directionByArt[p.art] ?? directionByArt.home
  return {
    src: `/images/products/${dir}/${p.slug}.webp`,
    alt: p.title,
    ratio: isFmcg ? '1:1' : '4:5',
    prompt: isFmcg
      ? `${p.title}. ${direction} ${FMCG_STYLE}`
      : `${p.title}. ${direction} ${CRAFT_STYLE}`,
  }
}

/** Keyed by product id. */
export const productImages: Record<string, ImageAsset> = Object.fromEntries(
  products.map((p) => [p.id, buildAsset(p)]),
)

export const categoryImages: Record<string, ImageAsset> = Object.fromEntries(
  categories.map((c) => [
    c.slug,
    {
      src: `/images/categories/${c.slug}.webp`,
      alt: `${c.name} — PunjabiMarts collection illustration`,
      ratio: '1:1' as const,
      prompt: `Category tile for ${c.name}. ${directionByArt[c.art] ?? directionByArt.home} ` +
        (c.kind === 'fmcg' ? FMCG_STYLE : CRAFT_STYLE.replace('Portrait 4:5.', 'Square 1:1.')),
    },
  ]),
)

export const ceremonyImages: Record<string, ImageAsset> = Object.fromEntries(
  ['roka', 'shagun', 'sahe-chithi', 'haldi', 'mehendi', 'sangeet', 'jaggo', 'chura', 'wedding', 'wedding-favours']
    .map((slug) => [
      slug,
      {
        src: `/images/ceremonies/${slug}.webp`,
        alt: `${slug.replace('-', ' ')} ceremony`,
        ratio: '4:5' as const,
        prompt: `Premium still life representing the Punjabi ${slug.replace('-', ' ')} ceremony — ` +
          `its characteristic trays, boxes or ceremony objects arranged with generous space. ${CRAFT_STYLE}`,
      },
    ]),
)

export const sellerImages: Record<string, ImageAsset> = Object.fromEntries(
  sellers.map((s) => [
    s.id,
    {
      src: `/images/sellers/${s.id}.webp`,
      alt: `AI-generated shop concept for ${s.name}, ${s.city}`,
      ratio: '16:9' as const,
      prompt: `Documentary photograph of a small traditional Indian shop interior in ${s.city} specialising in ` +
        `${s.speciality.toLowerCase()}, stock stacked on shelves, natural daylight from the shopfront, warm and ` +
        `lived-in, no people, no readable signage. Landscape 16:9.`,
    },
  ]),
)

export const heroImage: ImageAsset = {
  src: '/images/editorial/hero-composition.webp',
  alt: 'Editorial arrangement of a phulkari dupatta, folded turban cloth, juttis and silver jewellery',
  ratio: '16:9',
  prompt:
    'Premium editorial still life bringing together Punjabi craft: a folded phulkari dupatta with silk embroidery, ' +
    'a neatly folded turban cloth, a pair of embroidered juttis and oxidised silver jhumkas, arranged with generous ' +
    'negative space on a warm neutral surface, soft natural side light, shallow depth of field. Calm and premium, ' +
    'not festive. No text, no logos, no decorative motifs. Landscape 16:9.',
}

export const allAssets: ImageAsset[] = [
  ...Object.values(productImages),
  ...Object.values(categoryImages),
  ...Object.values(ceremonyImages),
  ...Object.values(sellerImages),
  heroImage,
]
