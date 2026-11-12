/**
 * PunjabiMarts master taxonomy.
 *
 * Built out fully now, even where only a few SKUs are live, so navigation
 * never needs redesigning as the catalogue fills in. Three independent axes:
 *
 *   CATEGORY   what the thing is        (turban → dumala)
 *   CEREMONY   when it's used           (roka, chura, jaggo)
 *   OCCASION   broader shopping intent  (wedding, festive, everyday)
 *
 * Ceremony is deliberately a parallel spine rather than a sub-branch of a
 * category: a customer shopping for a Roka wants trays, envelopes, potlis and
 * sweet boxes together, which cut across four different product categories.
 */

export type ArtKind =
  | 'phulkari' | 'juttis' | 'jewellery' | 'turbans'
  | 'wedding' | 'home' | 'pantry' | 'menswear' | 'accessories'

export interface SubCategory {
  slug: string
  name: string
}

export interface Category {
  slug: string
  name: string
  /** Top-level nav group this sits under. */
  group: NavGroupSlug
  art: ArtKind
  kind: 'lifestyle' | 'fmcg'
  blurb?: string
  children: SubCategory[]
}

export type NavGroupSlug =
  | 'turban' | 'men' | 'craft' | 'jutti' | 'wedding'
  | 'gifting' | 'home' | 'pantry'

export const navGroups: Array<{ slug: NavGroupSlug; name: string }> = [
  { slug: 'turban', name: 'Turban & Sikh Essentials' },
  { slug: 'men', name: 'Men' },
  { slug: 'craft', name: 'Phulkari & Craft' },
  { slug: 'jutti', name: 'Jutti & Footwear' },
  { slug: 'wedding', name: 'Wedding & Ceremonies' },
  { slug: 'gifting', name: 'Jewellery & Gifting' },
  { slug: 'home', name: 'Home & Lifestyle' },
  { slug: 'pantry', name: 'Pantry' },
]

const sub = (...pairs: Array<[string, string]>): SubCategory[] =>
  pairs.map(([slug, name]) => ({ slug, name }))

export const categories: Category[] = [
  // ── A. Turbans & Sikh essentials ─────────────────────────────────────────
  {
    slug: 'turbans', name: 'Turbans', group: 'turban', art: 'turbans', kind: 'lifestyle',
    blurb: 'Voile, rubia and malmal, cut to the length you tie.',
    children: sub(
      ['full-voile', 'Full Voile'], ['rubia-voile', 'Rubia Voile'], ['dumala', 'Dumala'],
      ['malmal', 'Malmal'], ['f74', 'F-74 Lightweight'], ['parna', 'Parna'],
      ['keski', 'Keski'], ['ready-to-wear', 'Ready to Wear'], ['kids-turban', 'Kids Turban'],
    ),
  },
  {
    slug: 'patka', name: 'Patka', group: 'turban', art: 'turbans', kind: 'lifestyle',
    blurb: 'Two tani, four tani, printed and plain.',
    children: sub(
      ['2-tani', '2 Tani'], ['4-tani', '4 Tani'], ['kids-patka', 'Kids Patka'],
      ['adult-patka', 'Adult Patka'], ['printed-patka', 'Printed Patka'], ['plain-patka', 'Plain Patka'],
    ),
  },
  {
    slug: 'headwear', name: 'Headwear', group: 'turban', art: 'turbans', kind: 'lifestyle',
    children: sub(
      ['bandana', 'Bandana'], ['fifti', 'Fifti'], ['stocking-cap', 'Stocking Cap'],
      ['tube-headwear', 'Tube Headwear'], ['keski-accessories', 'Keski Accessories'],
    ),
  },
  {
    slug: 'turban-accessories', name: 'Turban Accessories', group: 'turban', art: 'accessories', kind: 'lifestyle',
    blurb: 'Baaz, salayi, pins and everything that holds a pagg.',
    children: sub(
      ['baaz-salayi', 'Baaz / Salayi'], ['pen-baaz', 'Pen Baaz'], ['turban-brush', 'Turban Brush'],
      ['pagg-pins', 'Pagg Pins'], ['thatha', 'Thatha'], ['accessory-kit', 'Accessory Kit'],
      ['turban-storage', 'Storage'],
    ),
  },

  // ── B. Men's Punjabi clothing ────────────────────────────────────────────
  {
    slug: 'kurta-pajama', name: 'Kurta Pajama', group: 'men', art: 'menswear', kind: 'lifestyle',
    blurb: 'Cotton and linen sets, plain through to wedding.',
    children: sub(
      ['cotton', 'Cotton'], ['linen', 'Linen'], ['festive', 'Festive'], ['wedding-kp', 'Wedding'],
      ['casual', 'Casual'], ['plain', 'Plain'], ['embroidered', 'Embroidered'],
    ),
  },
  {
    slug: 'kurta', name: 'Kurta', group: 'men', art: 'menswear', kind: 'lifestyle',
    children: sub(['ready-made', 'Ready-made'], ['unstitched', 'Unstitched']),
  },
  {
    slug: 'pajama', name: 'Pajama', group: 'men', art: 'menswear', kind: 'lifestyle',
    children: sub(['standard', 'Standard'], ['punjabi-style', 'Punjabi Style']),
  },

  // ── C. Phulkari & craft ──────────────────────────────────────────────────
  {
    slug: 'phulkari', name: 'Phulkari', group: 'craft', art: 'phulkari', kind: 'lifestyle',
    blurb: 'Floss-silk darning embroidery from Punjab’s own clusters.',
    children: sub(
      ['dupatta', 'Dupatta'], ['stole', 'Stole'], ['shawl', 'Shawl'], ['bagh', 'Bagh Phulkari'],
      ['unstitched-fabric', 'Unstitched Fabric'], ['suit-material', 'Suit Material'],
      ['phulkari-home', 'Home Decor'], ['phulkari-bags', 'Bags'], ['phulkari-potli', 'Potli'],
      ['phulkari-accessories', 'Accessories'],
    ),
  },

  // ── D. Jutti & footwear ──────────────────────────────────────────────────
  {
    slug: 'jutti', name: 'Punjabi Jutti', group: 'jutti', art: 'juttis', kind: 'lifestyle',
    blurb: 'Hand-stitched, from everyday cotton to bridal tilla.',
    children: sub(
      ['women', 'Women'], ['men', 'Men'], ['bridal', 'Bridal'], ['party-wear', 'Party Wear'],
      ['cotton-jutti', 'Cotton'], ['leather', 'Leather'], ['embroidered-jutti', 'Embroidered'],
      ['phulkari-jutti', 'Phulkari Jutti'], ['mojari', 'Mojari'], ['khussa', 'Khussa'],
      ['loafers', 'Loafers'], ['kids-jutti', 'Kids'],
    ),
  },

  // ── E. Jewellery & accessories ───────────────────────────────────────────
  {
    slug: 'jewellery', name: 'Jewellery', group: 'gifting', art: 'jewellery', kind: 'lifestyle',
    blurb: 'Jhumkas, kundan, kadas and parandas.',
    children: sub(
      ['jhumka', 'Jhumka'], ['punjabi-jewellery', 'Punjabi Jewellery'], ['kundan', 'Kundan'],
      ['necklaces', 'Necklaces'], ['kada', 'Kada'], ['bangles', 'Bangles'],
      ['hair-accessories', 'Hair Accessories'], ['paranda', 'Paranda'], ['kalire', 'Kalire'],
    ),
  },
  {
    slug: 'bags', name: 'Bags & Potli', group: 'gifting', art: 'accessories', kind: 'lifestyle',
    children: sub(
      ['potli', 'Potli'], ['clutch', 'Clutch'], ['purse', 'Purse'],
      ['coin-bag', 'Coin Bag'], ['traditional-bags', 'Traditional Bags'],
    ),
  },

  // ── F. Wedding & ceremonies ──────────────────────────────────────────────
  {
    slug: 'ceremony-trays', name: 'Trays & Thaal', group: 'wedding', art: 'wedding', kind: 'lifestyle',
    blurb: 'Roka, shagun, tikka and chura thaals.',
    children: sub(
      ['roka-tray', 'Roka Tray'], ['shagun-thaal', 'Shagun Thaal'], ['tikka-thaal', 'Tikka Thaal'],
      ['chura-thaal', 'Chura Thaal'], ['decorative-tray', 'Decorative Tray'],
    ),
  },
  {
    slug: 'ceremony-boxes', name: 'Boxes & Envelopes', group: 'wedding', art: 'wedding', kind: 'lifestyle',
    children: sub(
      ['shagun-envelope', 'Shagun Envelopes'], ['jewellery-box', 'Jewellery Box'],
      ['kada-box', 'Kada Box'], ['chain-box', 'Chain Box'], ['ring-box', 'Ring Box'],
      ['chura-box', 'Chura Box'], ['bhaji-box', 'Ladoo / Bhaji Box'], ['cash-box', 'Cash Gift Box'],
    ),
  },
  {
    slug: 'ceremony-sets', name: 'Ceremony Sets', group: 'wedding', art: 'wedding', kind: 'lifestyle',
    blurb: 'Complete sets for each rasam.',
    children: sub(
      ['roka-set', 'Roka Set'], ['sahe-chithi-set', 'Sahe Chithi Set'], ['haldi-set', 'Haldi Set'],
      ['mehendi-set', 'Mehendi Set'], ['chura-set', 'Chura Set'], ['jaggo-set', 'Jaggo Set'],
      ['chajj-stick', 'Chajj & Stick'], ['peedi-fatti', 'Peedi & Fatti'],
    ),
  },
  {
    slug: 'wedding-gifting', name: 'Wedding Gifting', group: 'wedding', art: 'wedding', kind: 'lifestyle',
    children: sub(
      ['trousseau-trunk', 'Trousseau Trunk'], ['gift-basket', 'Gift Basket'],
      ['wedding-favours', 'Wedding Favours'], ['suit-saree-cover', 'Suit & Saree Covers'],
      ['bridal-gifting', 'Bridal Gifting'], ['gift-sets', 'Gift Sets'],
    ),
  },
  {
    slug: 'sikh-religious', name: 'Sikh Religious', group: 'wedding', art: 'wedding', kind: 'lifestyle',
    blurb: 'Presented with reverence — kept separate from novelty gifting.',
    children: sub(['rumala-sahib', 'Rumala Sahib'], ['religious-decor', 'Religious Decor']),
  },

  // ── G. Home, gifting & lifestyle ─────────────────────────────────────────
  {
    slug: 'home-decor', name: 'Home Decor', group: 'home', art: 'home', kind: 'lifestyle',
    children: sub(
      ['wall-decor', 'Wall Decor'], ['cushions', 'Cushions'], ['typography', 'Punjabi Typography'],
      ['car-hangings', 'Car Hangings'],
    ),
  },
  {
    slug: 'gifts', name: 'Gifts', group: 'home', art: 'home', kind: 'lifestyle',
    children: sub(
      ['mugs', 'Mugs'], ['keychains', 'Keychains'], ['personalised', 'Personalised'],
      ['festival-gifting', 'Festival Gifting'], ['lohri-gifting', 'Lohri Gifting'],
      ['tshirts', 'Punjabi T-Shirts'],
    ),
  },

  // ── H. Pantry (structure only — compliance activates later) ──────────────
  {
    slug: 'pantry', name: 'Pantry', group: 'pantry', art: 'pantry', kind: 'fmcg',
    blurb: 'Structure in place; launches once food compliance is activated.',
    children: sub(
      ['ghee', 'Ghee'], ['oils', 'Mustard Oil'], ['pickles', 'Pickles'],
      ['papad', 'Papad'], ['spices', 'Spices'], ['snacks', 'Dry Snacks'],
    ),
  },
]

// ── Ceremony axis ──────────────────────────────────────────────────────────
export interface Ceremony {
  slug: string
  name: string
  blurb: string
}

export const ceremonies: Ceremony[] = [
  { slug: 'roka', name: 'Roka', blurb: 'Trays, envelopes and sweet boxes for the first rasam.' },
  { slug: 'shagun', name: 'Shagun', blurb: 'Thaals, cash boxes and presentation pieces.' },
  { slug: 'sahe-chithi', name: 'Sahe Chithi', blurb: 'The formal letter, and everything it arrives with.' },
  { slug: 'haldi', name: 'Haldi', blurb: 'Tikka thaals, peedi and ceremony props.' },
  { slug: 'mehendi', name: 'Mehendi', blurb: 'Baskets, potlis and decorative accessories.' },
  { slug: 'sangeet', name: 'Sangeet', blurb: 'Gifting and accessories for the night.' },
  { slug: 'jaggo', name: 'Jaggo', blurb: 'Chajj, stick and jaggo sets.' },
  { slug: 'chura', name: 'Chura', blurb: 'Chura boxes, bowls, covers and thaals.' },
  { slug: 'wedding', name: 'Wedding', blurb: 'Trunks, favours and bridal gifting.' },
  { slug: 'wedding-favours', name: 'Wedding Favours', blurb: 'Small gifts, given in quantity.' },
]

// ── Occasion axis ──────────────────────────────────────────────────────────
export const occasions = [
  { slug: 'wedding', name: 'Wedding' },
  { slug: 'festive', name: 'Festive' },
  { slug: 'gifting', name: 'Gifting' },
  { slug: 'everyday', name: 'Everyday' },
  { slug: 'lohri', name: 'Lohri' },
  { slug: 'traditional', name: 'Traditional' },
] as const

export type OccasionSlug = (typeof occasions)[number]['slug']

// ── Lookups ────────────────────────────────────────────────────────────────
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug) ?? null
export const getCeremony = (slug: string) => ceremonies.find((c) => c.slug === slug) ?? null
export const categoriesInGroup = (g: NavGroupSlug) => categories.filter((c) => c.group === g)
export const getNavGroup = (slug: string) => navGroups.find((g) => g.slug === slug) ?? null
