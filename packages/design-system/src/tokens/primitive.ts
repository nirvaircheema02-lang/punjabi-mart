/**
 * TIER 1 — PRIMITIVE TOKENS
 *
 * Raw values only. Nothing in the application may import from this file
 * directly; components bind to component tokens, which resolve through
 * semantic tokens to these. That indirection is what makes a rebrand
 * (new logo / primary colour / typeface) a token edit rather than a redesign.
 *
 * Petrol and terracotta identity, selected for the PunjabiMarts PM mark.
 */

export const color = {
  // Deep blue-green from the approved logo; 600 is the primary action colour.
  petrol: {
    50: '#F1F8F7',
    100: '#E8F3F2',
    200: '#D2E7E5',
    300: '#ACD0CE',
    400: '#79AAA9',
    500: '#0F5962',
    600: '#173F48',
    700: '#12343D',
    800: '#0D2A31',
    900: '#082127',
  },

  /**
   * Terracotta from the logo diamond, used sparingly for commerce accents.
   * 700 is used for text on light surfaces; 500 supports white text on buttons.
   */
  terracotta: {
    50: '#FCF3EF',
    100: '#F9E7DF',
    200: '#F1CCBD',
    300: '#E5A88E',
    400: '#CB7859',
    500: '#B4573B',
    600: '#A24931',
    700: '#873823',
    800: '#6A2C1D',
    900: '#4C2118',
  },

  // Warm ivory surfaces with deep blue-green ink.
  neutral: {
    0: '#FFFFFF',
    50: '#FAF8F2',
    100: '#F4F0E8',
    200: '#E6E1D8',
    300: '#D0C9BE',
    400: '#AFA89D',
    500: '#857E76',
    600: '#5B6668',
    700: '#424E50',
    800: '#273238',
    900: '#172127',
  },

  green: { 50: '#EDF7F0', 100: '#D3ECDB', 500: '#2A9354', 600: '#1E7A3E', 700: '#186331' },
  amber: { 50: '#FDF6E9', 100: '#F9E8C4', 500: '#D69520', 600: '#B4791E', 700: '#8F5F17' },
  red:   { 50: '#FDF0EF', 100: '#F9D5D2', 500: '#D43128', 600: '#B3261E', 700: '#8F1E18' },
} as const

export const fontFamily = {
  /**
   * Local-first system stack shared across product surfaces. Hierarchy comes
   * from weight, size, tracking and whitespace.
   */
  sans: "'Avenir Next', Avenir, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
} as const

export const fontWeight = {
  regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800,
} as const

/**
 * Type scale. Every step carries a mobile value — the brief's original scale
 * had no mobile ramp and a 48px display overflows a 375px viewport.
 */
export const fontSize = {
  display: { mobile: ['32px', '40px'], desktop: ['48px', '56px'] },
  h1:      { mobile: ['28px', '36px'], desktop: ['40px', '48px'] },
  h2:      { mobile: ['24px', '32px'], desktop: ['32px', '40px'] },
  h3:      { mobile: ['20px', '28px'], desktop: ['24px', '32px'] },
  h4:      { mobile: ['18px', '26px'], desktop: ['20px', '28px'] },
  bodyLg:  { mobile: ['16px', '24px'], desktop: ['16px', '24px'] },
  body:    { mobile: ['14px', '20px'], desktop: ['14px', '20px'] },
  small:   { mobile: ['13px', '18px'], desktop: ['13px', '18px'] },
  caption: { mobile: ['12px', '16px'], desktop: ['12px', '16px'] },
} as const

/**
 * Price typography — its own scale, not reused body styles. Price is the most
 * scanned element in commerce and the three-tier price row depends on these
 * being visually distinct.
 */
export const priceSize = {
  lg:       ['20px', '28px'],
  md:       ['16px', '24px'],
  sm:       ['14px', '20px'],
  strike:   ['13px', '18px'],
  discount: ['13px', '18px'],
} as const

/** 4px base. No arbitrary values — additions require a documented reason. */
export const space = {
  0: '0px', 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px',
  6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px', 20: '80px', 24: '96px',
} as const

/** Nesting rule: inner radius = outer − padding. A 16px card with 4px padding takes a 12px image. */
export const radius = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px', pill: '999px',
} as const

/** Border-first system: cards do not float by default. Shadows are for overlays. */
export const shadow = {
  xs: '0 1px 2px rgba(26, 21, 28, 0.05)',
  sm: '0 2px 8px rgba(26, 21, 28, 0.06)',
  md: '0 8px 24px rgba(26, 21, 28, 0.08)',
} as const

export const breakpoint = {
  sm: '480px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1440px',
} as const

export const duration = { fast: '120ms', standard: '200ms', overlay: '260ms' } as const
export const easing = { out: 'cubic-bezier(0.16, 1, 0.3, 1)', inOut: 'cubic-bezier(0.4, 0, 0.2, 1)' } as const

export const zIndex = {
  base: 0, raised: 10, sticky: 100, overlay: 200, modal: 300, toast: 400,
} as const
