/**
 * TIER 2 — SEMANTIC TOKENS
 *
 * Roles, not values. Components should express intent ("this is the primary
 * action surface"), never a hue ("this is petrol-600"). Swapping the brand means
 * repointing this file — nothing downstream changes.
 */

import { color, space, radius, shadow, duration, easing } from './primitive'

export const semanticColor = {
  // Surfaces
  'surface-page': color.neutral[0],
  'surface-subtle': color.neutral[50],
  'surface-sunken': color.neutral[100],
  'surface-raised': color.neutral[0],
  'surface-inverse': color.neutral[900],
  'surface-brand-subtle': color.petrol[50],
  'surface-brand-muted': color.petrol[100],

  // Text — deep petrol-tinted ink, never pure black.
  'ink-primary': color.neutral[900],
  'ink-secondary': color.neutral[700],
  'ink-muted': color.neutral[600],
  'ink-disabled': color.neutral[400],
  'ink-inverse': color.neutral[0],
  'ink-brand': color.petrol[600],

  // Borders — the primary structuring device (border-first, not shadow-first)
  'border-subtle': color.neutral[200],
  'border-default': color.neutral[300],
  'border-strong': color.neutral[400],
  'border-brand': color.petrol[600],
  'border-focus': color.petrol[600],

  // Actions
  'action-primary': color.petrol[500],
  'action-primary-hover': color.petrol[600],
  'action-primary-active': color.petrol[800],
  'action-primary-ink': color.neutral[0],
  'action-secondary-border': color.neutral[300],
  'action-secondary-ink': color.neutral[900],
  'action-disabled': color.neutral[200],
  'action-disabled-ink': color.neutral[400],

  /**
   * Terracotta from the logo. Keep it focused on commerce accents.
   */
  'accent-fill': color.terracotta[500],
  'accent-fill-hover': color.terracotta[600],
  'accent-ink': color.terracotta[700],
  'accent-subtle': color.terracotta[50],

  // Semantic states
  'success-ink': color.green[600],
  'success-surface': color.green[50],
  'warning-ink': color.amber[600],
  'warning-surface': color.amber[50],
  'error-ink': color.red[600],
  'error-surface': color.red[50],
  'error-border': color.red[500],

  // Commerce-specific
  'price-ink': color.neutral[900],
  'price-strike-ink': color.neutral[500],
  'savings-ink': color.green[600],
  'rating-fill': color.amber[500],
  'stock-low-ink': color.amber[600],
  'stock-out-ink': color.neutral[500],
} as const

export const semanticSpace = {
  'space-compact': space[1],      // 4  — tight internal gaps
  'space-control': space[2],      // 8  — inside form controls
  'space-component': space[3],    // 12 — between related elements
  'space-card': space[4],         // 16 — card padding
  'space-group': space[6],        // 24 — between component groups
  'space-section': space[8],      // 32 — section rhythm (dense)
  'space-section-lg': space[16],  // 64 — section rhythm (storefront)
  'space-editorial': space[24],   // 96 — editorial variant only
} as const

export const semanticRadius = {
  'radius-control': radius.md,    // 12 — buttons, inputs (brief said 10-12; 10 is not a token)
  'radius-image': radius.md,      // 12 — product imagery
  'radius-card': radius.lg,       // 16 — product/content cards
  'radius-surface': radius.lg,    // 16 — banners
  'radius-overlay': radius.xl,    // 20 — modals, drawers
  'radius-dense': radius.sm,      //  8 — seller/admin surfaces, tables
  'radius-chip': radius.pill,
} as const

export const semanticShadow = {
  'shadow-raised': shadow.xs,
  'shadow-dropdown': shadow.sm,
  'shadow-overlay': shadow.md,
  'shadow-sticky': shadow.sm,
} as const

export const semanticMotion = {
  'motion-interaction': `${duration.fast} ${easing.out}`,
  'motion-transition': `${duration.standard} ${easing.inOut}`,
  'motion-overlay': `${duration.overlay} ${easing.out}`,
} as const
