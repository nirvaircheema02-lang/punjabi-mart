/**
 * DEMO SEED CATALOGUE — not real seller inventory.
 *
 * Every SKU here is `isDemo: true`. This flag exists so demo data can never be
 * silently shipped as live inventory: the backend seeder and any production
 * import must filter on it. Replace with real seller stock via the Laravel API.
 *
 * Hybrid ownership per §0.2: products are PLATFORM_OWNED (commission 0) or
 * SELLER_OWNED. `sellerId` is nullable and platform items genuinely have none.
 */

import type { ArtKind, OccasionSlug } from './taxonomy'
export type { ArtKind } from './taxonomy'
export {
  categories, ceremonies, occasions, navGroups,
  getCategory, getCeremony, categoriesInGroup, getNavGroup,
} from './taxonomy'

export type ProductOwnerType = 'platform' | 'seller'
export type ProductKind = 'lifestyle' | 'fmcg'

export interface VariantGroup {
  label: string
  options: string[]
  outOfStock?: string[]
  secondary?: { label: string; options: string[] }
}

export interface Seller {
  id: string
  name: string
  city: string
  taxRegistrationStatus: 'unregistered' | 'registered' | 'pending'
  gstin: string | null
  speciality: string
  since: number
  story: string
}

export interface Product {
  id: string
  slug: string
  title: string
  kind: ProductKind
  ownerType: ProductOwnerType
  sellerId: string | null
  category: string
  subCategory?: string
  ceremony?: string
  occasions?: OccasionSlug[]
  art: ArtKind
  price: number
  mrp: number
  requiresVariant: boolean
  variant?: VariantGroup
  packSize?: string
  badge?: string
  rating?: number
  reviewCount?: number
  inStock: boolean
  /** Guards demo data from ever being treated as live inventory. */
  isDemo: boolean
  stock?: number
  variantStocks?: Record<string, number>
  status?: string
  image?: string
  description?: string
  material?: string
  care?: string
  /** Turban-specific attributes. */
  fabric?: string
  length?: string
  width?: string
  colour?: string
  /** Wedding-specific attributes. */
  includes?: string[]
  customisable?: boolean
  dimensions?: string
}

export const sellers: Seller[] = [
  {
    id: 's1', name: 'Sardar Pagri House', city: 'Amritsar',
    taxRegistrationStatus: 'pending', gstin: null,
    speciality: 'Turbans, patkas and dastaar accessories', since: 1998,
    story: 'A turban shop near Hall Bazar, run by the same family since 1998. They cut cloth to length by hand and know every shade by name.',
  },
  {
    id: 's2', name: 'Nazaqat Suits', city: 'Amritsar',
    taxRegistrationStatus: 'pending', gstin: null,
    speciality: 'Phulkari, suits and bridal wear', since: 2006,
    story: 'A suits and phulkari shop whose embroiderers work to patterns passed down through the family. Bridal orders still get measured in person.',
  },
  {
    id: 's3', name: 'Patiala Jutti Works', city: 'Patiala',
    taxRegistrationStatus: 'pending', gstin: null,
    speciality: 'Hand-stitched juttis and mojaris', since: 2011,
    story: 'Three generations of jutti makers working from a Patiala workshop. Every pair is lasted and stitched by hand, never glued.',
  },
  {
    id: 's4', name: 'Rasam Ceremony Co.', city: 'Ludhiana',
    taxRegistrationStatus: 'pending', gstin: null,
    speciality: 'Wedding trays, boxes and ceremony sets', since: 2016,
    story: 'A family workshop assembling ceremony sets to order — trays, boxes and covers for every rasam from Roka to Chura.',
  },
]

const SHADES = ['Royal Blue', 'Kesari', 'White', 'Maroon', 'Navy', 'Black', 'Firozi', 'Grey']
const LENGTHS = ['5 m', '5.5 m', '6 m', '6.5 m']
const JUTTI_SIZES = ['5', '6', '7', '8', '9', '10', '11']
const KP_SIZES = ['38', '40', '42', '44', '46']

let n = 0
type Seed = Partial<Product> & {
  slug: string; title: string; category: string; price: number; mrp: number
}

/** Compact factory so 75 SKUs stay readable and consistently shaped. */
function p(seed: Seed): Product {
  n += 1
  return {
    id: seed.id ?? `d${n}`,
    kind: seed.kind ?? 'lifestyle',
    ownerType: seed.ownerType ?? 'platform',
    sellerId: seed.sellerId ?? null,
    art: seed.art ?? 'home',
    requiresVariant: seed.requiresVariant ?? false,
    inStock: seed.inStock ?? true,
    isDemo: true,
    ...seed,
  } as Product
}

const turbanVariant = (oos?: string[]): VariantGroup => ({
  label: 'Select length', options: LENGTHS, outOfStock: oos,
  secondary: { label: 'Shade', options: SHADES },
})

export const products: Product[] = [
  // ══ TURBANS ══════════════════════════════════════════════════════════════
  p({ slug: 'full-voile-turban', title: 'Full voile turban, soft finish', category: 'turbans', subCategory: 'full-voile', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 420, mrp: 560, requiresVariant: true, variant: turbanVariant(['6.5 m']), badge: 'Bestseller', rating: 4.7, reviewCount: 312, fabric: 'Full voile', width: '1.2 m', occasions: ['everyday', 'traditional'], description: 'A light, breathable full voile that holds a clean larh and sits comfortably all day.', material: 'Cotton voile', care: 'Hand wash cold, line dry in shade' }),
  p({ slug: 'rubia-voile-turban', title: 'Heavy rubia voile turban, firm hold', category: 'turbans', subCategory: 'rubia-voile', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 610, mrp: 780, requiresVariant: true, variant: turbanVariant(), rating: 4.6, reviewCount: 148, fabric: 'Heavy rubia', width: '1.2 m', occasions: ['traditional'] }),
  p({ slug: 'dumala-cloth', title: 'Dumala cloth, extra length', category: 'turbans', subCategory: 'dumala', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 890, mrp: 1150, requiresVariant: true, variant: { label: 'Select length', options: ['8 m', '9 m', '10 m'], secondary: { label: 'Shade', options: ['Kesari', 'Navy', 'White'] } }, rating: 4.8, reviewCount: 96, fabric: 'Voile', occasions: ['traditional'] }),
  p({ slug: 'malmal-turban', title: 'Malmal turban, featherweight', category: 'turbans', subCategory: 'malmal', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 540, mrp: 700, requiresVariant: true, variant: turbanVariant(), rating: 4.5, reviewCount: 71, fabric: 'Malmal' }),
  p({ slug: 'f74-lightweight-turban', title: 'F-74 lightweight turban cloth', category: 'turbans', subCategory: 'f74', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 480, mrp: 620, requiresVariant: true, variant: turbanVariant(), rating: 4.4, reviewCount: 58, fabric: 'F-74' }),
  p({ slug: 'parna-cotton', title: 'Cotton parna, printed border', category: 'turbans', subCategory: 'parna', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 320, mrp: 420, rating: 4.3, reviewCount: 44, occasions: ['everyday'] }),
  p({ slug: 'keski-plain', title: 'Plain keski, everyday', category: 'turbans', subCategory: 'keski', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 260, mrp: 340, requiresVariant: true, variant: { label: 'Shade', options: SHADES }, rating: 4.6, reviewCount: 129, occasions: ['everyday'] }),
  p({ slug: 'ready-to-wear-turban', title: 'Ready-to-wear turban, pre-tied', category: 'turbans', subCategory: 'ready-to-wear', art: 'turbans', price: 1290, mrp: 1600, requiresVariant: true, variant: { label: 'Select size', options: ['S', 'M', 'L'] }, badge: 'New', rating: 4.2, reviewCount: 23 }),
  p({ slug: 'kids-turban-set', title: 'Kids turban, set of two', category: 'turbans', subCategory: 'kids-turban', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 340, mrp: 450, rating: 4.5, reviewCount: 67 }),

  // ══ PATKA ════════════════════════════════════════════════════════════════
  p({ slug: 'patka-2-tani', title: '2 Tani patka, cotton', category: 'patka', subCategory: '2-tani', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 180, mrp: 240, requiresVariant: true, variant: { label: 'Shade', options: SHADES }, rating: 4.5, reviewCount: 88 }),
  p({ slug: 'patka-4-tani', title: '4 Tani patka, full coverage', category: 'patka', subCategory: '4-tani', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 240, mrp: 320, requiresVariant: true, variant: { label: 'Shade', options: SHADES }, badge: 'Bestseller', rating: 4.7, reviewCount: 201 }),
  p({ slug: 'kids-patka-cotton', title: 'Cotton patka for kids, pack of three', category: 'patka', subCategory: 'kids-patka', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 260, mrp: 340, rating: 4.5, reviewCount: 74 }),
  p({ slug: 'printed-patka', title: 'Printed patka, geometric', category: 'patka', subCategory: 'printed-patka', art: 'turbans', price: 210, mrp: 280, rating: 4.2, reviewCount: 36 }),
  p({ slug: 'plain-patka-adult', title: 'Plain adult patka', category: 'patka', subCategory: 'plain-patka', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 190, mrp: 250, requiresVariant: true, variant: { label: 'Shade', options: SHADES }, rating: 4.4, reviewCount: 52 }),

  // ══ HEADWEAR ═════════════════════════════════════════════════════════════
  p({ slug: 'bandana-cotton', title: 'Cotton bandana', category: 'headwear', subCategory: 'bandana', art: 'turbans', price: 150, mrp: 200, rating: 4.1, reviewCount: 29 }),
  p({ slug: 'fifti-classic', title: 'Fifti, classic cut', category: 'headwear', subCategory: 'fifti', art: 'turbans', ownerType: 'seller', sellerId: 's1', price: 280, mrp: 360, rating: 4.4, reviewCount: 61 }),
  p({ slug: 'stocking-cap', title: 'Stocking cap, under-turban', category: 'headwear', subCategory: 'stocking-cap', art: 'turbans', price: 120, mrp: 160, rating: 4.3, reviewCount: 94 }),

  // ══ TURBAN ACCESSORIES ═══════════════════════════════════════════════════
  p({ slug: 'baaz-salayi-steel', title: 'Baaz / salayi, stainless steel', category: 'turban-accessories', subCategory: 'baaz-salayi', art: 'accessories', ownerType: 'seller', sellerId: 's1', price: 240, mrp: 320, badge: 'Bestseller', rating: 4.8, reviewCount: 176 }),
  p({ slug: 'pen-baaz', title: 'Pen baaz, slim profile', category: 'turban-accessories', subCategory: 'pen-baaz', art: 'accessories', price: 180, mrp: 240, rating: 4.5, reviewCount: 83 }),
  p({ slug: 'turban-brush', title: 'Turban brush, wooden handle', category: 'turban-accessories', subCategory: 'turban-brush', art: 'accessories', price: 210, mrp: 280, rating: 4.4, reviewCount: 47 }),
  p({ slug: 'pagg-pins-set', title: 'Pagg pins, set of six', category: 'turban-accessories', subCategory: 'pagg-pins', art: 'accessories', price: 160, mrp: 220, rating: 4.6, reviewCount: 112 }),
  p({ slug: 'thatha-band', title: 'Thatha band', category: 'turban-accessories', subCategory: 'thatha', art: 'accessories', ownerType: 'seller', sellerId: 's1', price: 140, mrp: 190, rating: 4.3, reviewCount: 38 }),
  p({ slug: 'turban-accessory-kit', title: 'Turban accessory kit', category: 'turban-accessories', subCategory: 'accessory-kit', art: 'accessories', price: 690, mrp: 900, badge: 'Gift-ready', rating: 4.7, reviewCount: 64, includes: ['Baaz', 'Six pagg pins', 'Turban brush', 'Storage pouch'] }),

  // ══ MEN'S CLOTHING ═══════════════════════════════════════════════════════
  p({ slug: 'cotton-kurta-pajama-white', title: 'Cotton kurta pajama set, white', category: 'kurta-pajama', subCategory: 'cotton', art: 'menswear', price: 1790, mrp: 2300, requiresVariant: true, variant: { label: 'Select size', options: KP_SIZES, outOfStock: ['46'] }, badge: 'Bestseller', rating: 4.6, reviewCount: 187, occasions: ['everyday', 'traditional'], material: 'Handloom cotton' }),
  p({ slug: 'linen-kurta-pajama-sand', title: 'Linen kurta pajama set, sand', category: 'kurta-pajama', subCategory: 'linen', art: 'menswear', price: 2490, mrp: 3100, requiresVariant: true, variant: { label: 'Select size', options: KP_SIZES }, rating: 4.5, reviewCount: 94, material: 'Pure linen' }),
  p({ slug: 'festive-kurta-pajama', title: 'Festive kurta pajama, tonal work', category: 'kurta-pajama', subCategory: 'festive', art: 'menswear', price: 3290, mrp: 4100, requiresVariant: true, variant: { label: 'Select size', options: KP_SIZES }, rating: 4.7, reviewCount: 71, occasions: ['festive'] }),
  p({ slug: 'wedding-kurta-pajama', title: 'Wedding kurta pajama, ivory', category: 'kurta-pajama', subCategory: 'wedding-kp', art: 'menswear', price: 4890, mrp: 6200, requiresVariant: true, variant: { label: 'Select size', options: KP_SIZES }, ceremony: 'wedding', occasions: ['wedding'], rating: 4.8, reviewCount: 52 }),
  p({ slug: 'embroidered-kurta-pajama', title: 'Embroidered kurta pajama', category: 'kurta-pajama', subCategory: 'embroidered', art: 'menswear', price: 3890, mrp: 4800, requiresVariant: true, variant: { label: 'Select size', options: KP_SIZES }, rating: 4.4, reviewCount: 38 }),
  p({ slug: 'ready-made-kurta', title: 'Ready-made kurta, mandarin collar', category: 'kurta', subCategory: 'ready-made', art: 'menswear', price: 1290, mrp: 1650, requiresVariant: true, variant: { label: 'Select size', options: KP_SIZES }, rating: 4.3, reviewCount: 66 }),
  p({ slug: 'unstitched-kurta-fabric', title: 'Unstitched kurta fabric, 2.5 m', category: 'kurta', subCategory: 'unstitched', art: 'menswear', price: 890, mrp: 1150, rating: 4.2, reviewCount: 31 }),
  p({ slug: 'punjabi-style-pajama', title: 'Punjabi-style pajama', category: 'pajama', subCategory: 'punjabi-style', art: 'menswear', price: 790, mrp: 990, requiresVariant: true, variant: { label: 'Select size', options: KP_SIZES }, rating: 4.4, reviewCount: 58 }),

  // ══ PHULKARI ═════════════════════════════════════════════════════════════
  p({ slug: 'phulkari-dupatta-maroon', title: 'Hand-embroidered Phulkari dupatta, deep maroon', category: 'phulkari', subCategory: 'dupatta', art: 'phulkari', ownerType: 'seller', sellerId: 's2', price: 2450, mrp: 3200, badge: 'Handmade', rating: 4.6, reviewCount: 128, occasions: ['festive', 'wedding'], material: 'Khaddar base, floss silk thread', care: 'Dry clean only' }),
  p({ slug: 'phulkari-bagh-stole', title: 'Phulkari bagh stole, ivory base', category: 'phulkari', subCategory: 'bagh', art: 'phulkari', ownerType: 'seller', sellerId: 's2', price: 1850, mrp: 2400, rating: 4.5, reviewCount: 41 }),
  p({ slug: 'phulkari-shawl-heavy', title: 'Phulkari shawl, dense work', category: 'phulkari', subCategory: 'shawl', art: 'phulkari', ownerType: 'seller', sellerId: 's2', price: 4200, mrp: 5400, badge: 'Heirloom', rating: 4.9, reviewCount: 34, occasions: ['wedding'] }),
  p({ slug: 'phulkari-stole-light', title: 'Phulkari stole, light work', category: 'phulkari', subCategory: 'stole', art: 'phulkari', ownerType: 'seller', sellerId: 's2', price: 1290, mrp: 1700, rating: 4.4, reviewCount: 73 }),
  p({ slug: 'phulkari-suit-material', title: 'Phulkari suit material, unstitched', category: 'phulkari', subCategory: 'suit-material', art: 'phulkari', ownerType: 'seller', sellerId: 's2', price: 2890, mrp: 3600, rating: 4.5, reviewCount: 47 }),
  p({ slug: 'phulkari-unstitched-fabric', title: 'Phulkari unstitched fabric, per metre', category: 'phulkari', subCategory: 'unstitched-fabric', art: 'phulkari', ownerType: 'seller', sellerId: 's2', price: 780, mrp: 990, rating: 4.3, reviewCount: 28 }),
  p({ slug: 'phulkari-potli-pair', title: 'Phulkari potli, pair', category: 'phulkari', subCategory: 'phulkari-potli', art: 'phulkari', ownerType: 'seller', sellerId: 's2', price: 749, mrp: 999, rating: 4.4, reviewCount: 56, occasions: ['wedding', 'gifting'] }),
  p({ slug: 'phulkari-tote-bag', title: 'Phulkari tote bag', category: 'phulkari', subCategory: 'phulkari-bags', art: 'phulkari', price: 990, mrp: 1300, rating: 4.2, reviewCount: 39 }),
  p({ slug: 'phulkari-cushion-cover', title: 'Phulkari cushion cover, set of two', category: 'phulkari', subCategory: 'phulkari-home', art: 'phulkari', price: 890, mrp: 1150, rating: 4.4, reviewCount: 37 }),

  // ══ JUTTI ════════════════════════════════════════════════════════════════
  p({ slug: 'punjabi-jutti-zari-cream', title: 'Punjabi jutti with zari work, cream', category: 'jutti', subCategory: 'women', art: 'juttis', ownerType: 'seller', sellerId: 's3', price: 1299, mrp: 1799, requiresVariant: true, variant: { label: 'Select size', options: JUTTI_SIZES, outOfStock: ['9'] }, badge: 'Only 2 left', rating: 4.4, reviewCount: 86, material: 'Leather with zari thread' }),
  p({ slug: 'mens-jutti-tilla', title: 'Men’s tilla jutti, oxblood', category: 'jutti', subCategory: 'men', art: 'juttis', ownerType: 'seller', sellerId: 's3', price: 1650, mrp: 2100, requiresVariant: true, variant: { label: 'Select size', options: JUTTI_SIZES, outOfStock: ['11'] }, rating: 4.5, reviewCount: 52 }),
  p({ slug: 'bridal-jutti-tilla-gold', title: 'Bridal jutti, heavy tilla gold', category: 'jutti', subCategory: 'bridal', art: 'juttis', ownerType: 'seller', sellerId: 's3', price: 3290, mrp: 4200, requiresVariant: true, variant: { label: 'Select size', options: JUTTI_SIZES }, ceremony: 'wedding', occasions: ['wedding'], badge: 'Bridal', rating: 4.8, reviewCount: 61 }),
  p({ slug: 'phulkari-jutti-women', title: 'Phulkari jutti, hand embroidered', category: 'jutti', subCategory: 'phulkari-jutti', art: 'juttis', ownerType: 'seller', sellerId: 's3', price: 1790, mrp: 2300, requiresVariant: true, variant: { label: 'Select size', options: JUTTI_SIZES }, rating: 4.6, reviewCount: 78 }),
  p({ slug: 'cotton-jutti-everyday', title: 'Cotton jutti, everyday', category: 'jutti', subCategory: 'cotton-jutti', art: 'juttis', ownerType: 'seller', sellerId: 's3', price: 690, mrp: 900, requiresVariant: true, variant: { label: 'Select size', options: JUTTI_SIZES }, rating: 4.2, reviewCount: 104, occasions: ['everyday'] }),
  p({ slug: 'leather-mojari-tan', title: 'Leather mojari, tan', category: 'jutti', subCategory: 'mojari', art: 'juttis', ownerType: 'seller', sellerId: 's3', price: 1490, mrp: 1900, requiresVariant: true, variant: { label: 'Select size', options: JUTTI_SIZES }, rating: 4.5, reviewCount: 67 }),
  p({ slug: 'khussa-embroidered', title: 'Khussa, embroidered vamp', category: 'jutti', subCategory: 'khussa', art: 'juttis', price: 1190, mrp: 1550, requiresVariant: true, variant: { label: 'Select size', options: JUTTI_SIZES }, rating: 4.3, reviewCount: 42 }),
  p({ slug: 'party-wear-jutti', title: 'Party wear jutti, sequinned', category: 'jutti', subCategory: 'party-wear', art: 'juttis', price: 1390, mrp: 1800, requiresVariant: true, variant: { label: 'Select size', options: JUTTI_SIZES }, occasions: ['festive'], rating: 4.1, reviewCount: 33 }),
  p({ slug: 'kids-jutti-pair', title: 'Kids jutti, embroidered', category: 'jutti', subCategory: 'kids-jutti', art: 'juttis', price: 590, mrp: 780, requiresVariant: true, variant: { label: 'Select size', options: ['1', '2', '3', '4'] }, rating: 4.4, reviewCount: 46 }),

  // ══ JEWELLERY ════════════════════════════════════════════════════════════
  p({ slug: 'oxidised-silver-jhumka', title: 'Oxidised silver jhumka, temple motif', category: 'jewellery', subCategory: 'jhumka', art: 'jewellery', price: 899, mrp: 1200, badge: 'Bestseller', rating: 4.8, reviewCount: 214, occasions: ['festive', 'gifting'] }),
  p({ slug: 'steel-kada-classic', title: 'Classic steel kada, polished', category: 'jewellery', subCategory: 'kada', art: 'jewellery', price: 540, mrp: 700, requiresVariant: true, variant: { label: 'Select size', options: ['Small', 'Medium', 'Large'] }, rating: 4.7, reviewCount: 189 }),
  p({ slug: 'kundan-necklace-set', title: 'Kundan necklace set, bridal', category: 'jewellery', subCategory: 'kundan', art: 'jewellery', price: 4890, mrp: 6400, ceremony: 'wedding', occasions: ['wedding'], badge: 'Bridal', rating: 4.7, reviewCount: 43 }),
  p({ slug: 'paranda-silk-tassel', title: 'Paranda, silk tassel', category: 'jewellery', subCategory: 'paranda', art: 'jewellery', ownerType: 'seller', sellerId: 's2', price: 390, mrp: 520, requiresVariant: true, variant: { label: 'Shade', options: ['Red', 'Maroon', 'Black', 'Gold'] }, rating: 4.6, reviewCount: 131, occasions: ['traditional'] }),
  p({ slug: 'kalire-pair-gold', title: 'Kalire, pair', category: 'jewellery', subCategory: 'kalire', art: 'jewellery', price: 2290, mrp: 2900, ceremony: 'chura', occasions: ['wedding'], rating: 4.6, reviewCount: 57 }),
  p({ slug: 'oxidised-bangles-set', title: 'Oxidised bangles, set of eight', category: 'jewellery', subCategory: 'bangles', art: 'jewellery', price: 690, mrp: 900, rating: 4.4, reviewCount: 88 }),
  p({ slug: 'traditional-necklace-silver', title: 'Traditional silver necklace', category: 'jewellery', subCategory: 'necklaces', art: 'jewellery', price: 2190, mrp: 2800, rating: 4.5, reviewCount: 49 }),
  p({ slug: 'hair-accessory-set', title: 'Hair accessory set, traditional', category: 'jewellery', subCategory: 'hair-accessories', art: 'jewellery', price: 450, mrp: 600, rating: 4.2, reviewCount: 36 }),

  // ══ BAGS & POTLI ═════════════════════════════════════════════════════════
  p({ slug: 'embroidered-potli-pair', title: 'Embroidered potli bag, set of two', category: 'bags', subCategory: 'potli', art: 'accessories', price: 749, mrp: 999, rating: 4.3, reviewCount: 29, occasions: ['wedding', 'gifting'] }),
  p({ slug: 'silk-clutch-bridal', title: 'Silk clutch, bridal', category: 'bags', subCategory: 'clutch', art: 'accessories', price: 1290, mrp: 1700, occasions: ['wedding'], rating: 4.4, reviewCount: 41 }),
  p({ slug: 'coin-bag-shagun', title: 'Coin bag for shagun, pack of ten', category: 'bags', subCategory: 'coin-bag', art: 'accessories', ownerType: 'seller', sellerId: 's4', price: 390, mrp: 520, ceremony: 'shagun', rating: 4.5, reviewCount: 74 }),
  p({ slug: 'traditional-jhola-bag', title: 'Traditional jhola bag', category: 'bags', subCategory: 'traditional-bags', art: 'accessories', price: 590, mrp: 780, rating: 4.1, reviewCount: 27 }),

  // ══ CEREMONY — TRAYS ═════════════════════════════════════════════════════
  p({ slug: 'roka-tray-brass', title: 'Roka tray, hand-finished brass', category: 'ceremony-trays', subCategory: 'roka-tray', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 2490, mrp: 3200, ceremony: 'roka', occasions: ['wedding'], badge: 'Ceremony', rating: 4.6, reviewCount: 52, dimensions: '35 cm diameter', customisable: true }),
  p({ slug: 'shagun-thaal-brass', title: 'Brass shagun thaal set', category: 'ceremony-trays', subCategory: 'shagun-thaal', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 3200, mrp: 3900, ceremony: 'shagun', occasions: ['wedding'], badge: 'Wedding season', rating: 4.7, reviewCount: 63, includes: ['Large thaal', 'Four small bowls'], dimensions: '40 cm diameter' }),
  p({ slug: 'tikka-thaal-haldi', title: 'Tikka thaal for haldi', category: 'ceremony-trays', subCategory: 'tikka-thaal', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 1690, mrp: 2200, ceremony: 'haldi', occasions: ['wedding'], rating: 4.5, reviewCount: 38 }),
  p({ slug: 'chura-thaal-decorated', title: 'Chura thaal, decorated', category: 'ceremony-trays', subCategory: 'chura-thaal', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 2190, mrp: 2800, ceremony: 'chura', occasions: ['wedding'], rating: 4.6, reviewCount: 44 }),
  p({ slug: 'decorative-tray-set', title: 'Decorative tray, set of three', category: 'ceremony-trays', subCategory: 'decorative-tray', art: 'wedding', price: 1890, mrp: 2400, occasions: ['wedding', 'gifting'], rating: 4.3, reviewCount: 31 }),

  // ══ CEREMONY — BOXES ═════════════════════════════════════════════════════
  p({ slug: 'shagun-envelopes-pack', title: 'Shagun envelopes, pack of twenty', category: 'ceremony-boxes', subCategory: 'shagun-envelope', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 340, mrp: 450, ceremony: 'shagun', badge: 'Bestseller', rating: 4.7, reviewCount: 218, customisable: true }),
  p({ slug: 'chura-box-velvet', title: 'Chura box, velvet lined', category: 'ceremony-boxes', subCategory: 'chura-box', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 1490, mrp: 1900, ceremony: 'chura', occasions: ['wedding'], rating: 4.7, reviewCount: 66, includes: ['Chura box', 'Velvet cover'] }),
  p({ slug: 'jewellery-presentation-box', title: 'Jewellery presentation box', category: 'ceremony-boxes', subCategory: 'jewellery-box', art: 'wedding', price: 890, mrp: 1150, occasions: ['wedding', 'gifting'], rating: 4.4, reviewCount: 57 }),
  p({ slug: 'kada-box-single', title: 'Kada box, single', category: 'ceremony-boxes', subCategory: 'kada-box', art: 'wedding', price: 390, mrp: 520, rating: 4.3, reviewCount: 48 }),
  p({ slug: 'ring-box-velvet', title: 'Ring box, velvet', category: 'ceremony-boxes', subCategory: 'ring-box', art: 'wedding', price: 290, mrp: 390, ceremony: 'roka', rating: 4.5, reviewCount: 92 }),
  p({ slug: 'bhaji-box-set', title: 'Ladoo / bhaji box, set of ten', category: 'ceremony-boxes', subCategory: 'bhaji-box', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 690, mrp: 900, ceremony: 'jaggo', rating: 4.5, reviewCount: 83, customisable: true }),
  p({ slug: 'cash-gift-box', title: 'Cash gift box, decorated', category: 'ceremony-boxes', subCategory: 'cash-box', art: 'wedding', price: 490, mrp: 650, ceremony: 'shagun', rating: 4.4, reviewCount: 61 }),

  // ══ CEREMONY SETS ════════════════════════════════════════════════════════
  p({ slug: 'roka-ceremony-set', title: 'Roka ceremony set, complete', category: 'ceremony-sets', subCategory: 'roka-set', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 5490, mrp: 6900, ceremony: 'roka', occasions: ['wedding'], badge: 'Complete set', rating: 4.8, reviewCount: 37, includes: ['Brass roka tray', 'Ring box', 'Twenty shagun envelopes', 'Two potli bags', 'Sweet box'], customisable: true }),
  p({ slug: 'sahe-chithi-set', title: 'Sahe Chithi ceremony set', category: 'ceremony-sets', subCategory: 'sahe-chithi-set', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 3890, mrp: 4900, ceremony: 'sahe-chithi', occasions: ['wedding'], rating: 4.7, reviewCount: 24, includes: ['Decorated tray', 'Chithi envelope', 'Presentation box'], customisable: true }),
  p({ slug: 'haldi-ceremony-set', title: 'Haldi ceremony set', category: 'ceremony-sets', subCategory: 'haldi-set', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 2890, mrp: 3700, ceremony: 'haldi', occasions: ['wedding'], rating: 4.6, reviewCount: 41, includes: ['Tikka thaal', 'Peedi cover', 'Two small bowls'] }),
  p({ slug: 'mehendi-ceremony-set', title: 'Mehendi ceremony accessories set', category: 'ceremony-sets', subCategory: 'mehendi-set', art: 'wedding', price: 2290, mrp: 2900, ceremony: 'mehendi', occasions: ['wedding'], rating: 4.5, reviewCount: 33 }),
  p({ slug: 'chura-ceremony-set', title: 'Chura ceremony set', category: 'ceremony-sets', subCategory: 'chura-set', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 4290, mrp: 5400, ceremony: 'chura', occasions: ['wedding'], rating: 4.8, reviewCount: 29, includes: ['Chura box', 'Chura bowl', 'Decorated thaal', 'Cover'] }),
  p({ slug: 'jaggo-set-complete', title: 'Jaggo set with chajj and stick', category: 'ceremony-sets', subCategory: 'jaggo-set', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 3490, mrp: 4400, ceremony: 'jaggo', occasions: ['wedding'], rating: 4.6, reviewCount: 26, includes: ['Decorated chajj', 'Jaggo stick', 'Bhaji boxes'] }),
  p({ slug: 'chajj-stick-pair', title: 'Chajj and stick, decorated', category: 'ceremony-sets', subCategory: 'chajj-stick', art: 'wedding', price: 1890, mrp: 2400, ceremony: 'jaggo', rating: 4.4, reviewCount: 22 }),
  p({ slug: 'peedi-fatti-set', title: 'Peedi and fatti, ceremony seating', category: 'ceremony-sets', subCategory: 'peedi-fatti', art: 'wedding', price: 2690, mrp: 3400, ceremony: 'haldi', rating: 4.5, reviewCount: 19 }),

  // ══ WEDDING GIFTING ══════════════════════════════════════════════════════
  p({ slug: 'trousseau-trunk-large', title: 'Trousseau trunk, hand-painted', category: 'wedding-gifting', subCategory: 'trousseau-trunk', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 8900, mrp: 11500, ceremony: 'wedding', occasions: ['wedding'], badge: 'Heirloom', rating: 4.9, reviewCount: 18, dimensions: '60 × 40 × 35 cm', customisable: true }),
  p({ slug: 'wedding-favours-pack', title: 'Wedding favours, pack of twenty-five', category: 'wedding-gifting', subCategory: 'wedding-favours', art: 'wedding', price: 2490, mrp: 3200, ceremony: 'wedding-favours', occasions: ['wedding'], rating: 4.5, reviewCount: 47, customisable: true }),
  p({ slug: 'suit-saree-covers-set', title: 'Suit and saree covers, set of six', category: 'wedding-gifting', subCategory: 'suit-saree-cover', art: 'wedding', price: 990, mrp: 1300, occasions: ['wedding'], rating: 4.4, reviewCount: 63 }),
  p({ slug: 'bridal-gift-basket', title: 'Bridal gift basket, assembled', category: 'wedding-gifting', subCategory: 'gift-basket', art: 'wedding', ownerType: 'seller', sellerId: 's4', price: 4490, mrp: 5600, ceremony: 'wedding', occasions: ['wedding', 'gifting'], rating: 4.6, reviewCount: 35, customisable: true }),

  // ══ SIKH RELIGIOUS — respectfully separated ══════════════════════════════
  p({ slug: 'rumala-sahib-set', title: 'Rumala Sahib, cotton set', category: 'sikh-religious', subCategory: 'rumala-sahib', art: 'wedding', ownerType: 'seller', sellerId: 's2', price: 2890, mrp: 3600, rating: 4.9, reviewCount: 88, description: 'Offered with reverence. Plain cotton set, finished by hand.' }),

  // ══ HOME & GIFTS ═════════════════════════════════════════════════════════
  p({ slug: 'car-hanging-ik-onkar', title: 'Brass car hanging, Ik Onkar', category: 'home-decor', subCategory: 'car-hangings', art: 'home', price: 299, mrp: 399, rating: 4.6, reviewCount: 143 }),
  p({ slug: 'punjabi-typography-print', title: 'Punjabi typography print, framed', category: 'home-decor', subCategory: 'typography', art: 'home', price: 890, mrp: 1150, occasions: ['gifting'], rating: 4.3, reviewCount: 52 }),
  p({ slug: 'phulkari-cushion-pair-home', title: 'Cushion covers, phulkari motif', category: 'home-decor', subCategory: 'cushions', art: 'home', price: 790, mrp: 1050, rating: 4.4, reviewCount: 44 }),
  p({ slug: 'punjabi-mug-pair', title: 'Punjabi typography mug, pair', category: 'gifts', subCategory: 'mugs', art: 'home', price: 549, mrp: 720, occasions: ['gifting'], rating: 4.2, reviewCount: 96 }),
  p({ slug: 'lohri-gift-hamper', title: 'Lohri gift hamper', category: 'gifts', subCategory: 'lohri-gifting', art: 'home', price: 1490, mrp: 1900, occasions: ['lohri', 'gifting'], badge: 'Seasonal', rating: 4.5, reviewCount: 38 }),
  p({ slug: 'punjabi-tshirt-graphic', title: 'Punjabi graphic T-shirt', category: 'gifts', subCategory: 'tshirts', art: 'home', price: 649, mrp: 850, requiresVariant: true, variant: { label: 'Select size', options: ['S', 'M', 'L', 'XL', 'XXL'] }, occasions: ['everyday'], rating: 4.1, reviewCount: 117 }),
  p({ slug: 'personalised-keychain', title: 'Personalised name keychain', category: 'gifts', subCategory: 'keychains', art: 'home', price: 249, mrp: 330, customisable: true, occasions: ['gifting'], rating: 4.3, reviewCount: 74 }),

  // ══ PANTRY (structure only) ══════════════════════════════════════════════
  p({ slug: 'desi-cow-ghee-500ml', title: 'Pure desi cow ghee', category: 'pantry', subCategory: 'ghee', art: 'pantry', kind: 'fmcg', price: 649, mrp: 750, packSize: '500 ml' }),
  p({ slug: 'mustard-oil-1l', title: 'Cold-pressed mustard oil', category: 'pantry', subCategory: 'oils', art: 'pantry', kind: 'fmcg', price: 320, mrp: 380, packSize: '1 L' }),
  p({ slug: 'mango-pickle-400g', title: 'Homemade mango pickle', category: 'pantry', subCategory: 'pickles', art: 'pantry', kind: 'fmcg', price: 249, mrp: 299, packSize: '400 g' }),
  p({ slug: 'amritsari-papad-250g', title: 'Amritsari papad', category: 'pantry', subCategory: 'papad', art: 'pantry', kind: 'fmcg', price: 149, mrp: 180, packSize: '250 g', inStock: false }),
  p({ slug: 'garam-masala-100g', title: 'Punjabi garam masala', category: 'pantry', subCategory: 'spices', art: 'pantry', kind: 'fmcg', price: 199, mrp: 250, packSize: '100 g' }),
  p({ slug: 'roasted-makhana-200g', title: 'Roasted makhana', category: 'pantry', subCategory: 'snacks', art: 'pantry', kind: 'fmcg', price: 229, mrp: 280, packSize: '200 g' }),
]

// ── Lookups ────────────────────────────────────────────────────────────────
export const getSeller = (id: string | null) => (id ? sellers.find((s) => s.id === id) ?? null : null)
export const getSellerById = (id: string) => sellers.find((s) => s.id === id) ?? null
export const getProduct = (slug: string) => products.find((p) => p.slug === slug) ?? null
export const productsByCategory = (slug: string) => products.filter((p) => p.category === slug)
export const productsBySeller = (id: string) => products.filter((p) => p.sellerId === id)
export const productsByCeremony = (slug: string) => products.filter((p) => p.ceremony === slug)
export const productsByGroup = (group: string, cats: Array<{ slug: string; group: string }>) => {
  const inGroup = new Set(cats.filter((c) => c.group === group).map((c) => c.slug))
  return products.filter((p) => inGroup.has(p.category))
}

export const attributionFor = (p: Product): string => {
  if (p.ownerType === 'platform') return 'PunjabiMarts'
  const s = getSeller(p.sellerId)
  return s ? `${s.name}, ${s.city}` : 'Unknown seller'
}

export const discountPercent = (p: Product) => Math.round(((p.mrp - p.price) / p.mrp) * 100)
export const formatINR = (v: number) => `₹${v.toLocaleString('en-IN')}`
