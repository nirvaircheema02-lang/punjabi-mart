/**
 * image-sizes — the `sizes` attribute for every image role, in one place.
 *
 * WHY THIS FILE EXISTS
 *
 * `sizes` is a promise to the browser about how wide an image will render.
 * The browser believes it absolutely: it picks a srcset candidate from `sizes`
 * alone, before any CSS has been applied, and it never revises that choice.
 * So a `sizes` that is 2x too large does not cost 2x the pixels — it costs
 * whatever the next rung up the ladder charges, which is usually far worse.
 *
 * Before this file, `sizes` was hand-written per call site and had drifted
 * badly from the CSS. Measured on the live site at devicePixelRatio 2:
 *
 *   product card     declared 33vw (338px) -> rendered  91px   4.55x over
 *   brand logo       declared none = 100vw -> rendered 260px   3.69x over
 *   shortcut tile    declared 48vw (187px) -> rendered  80px   2.34x over
 *
 * The 4.55x card was fetching w=828 (124KB) for a box that needed w=480
 * (51KB). Over a homepage that is ~700KB of waste, all of it on the mobile
 * connections this marketplace is actually for.
 *
 * HOW THESE VALUES WERE DERIVED
 *
 * Not from reading the CSS — the CSS lies, because grid column counts
 * collide across breakpoints (`.pm-home .pm-grid` overrides
 * `.pm-grid--spotlight` at >=1024, turning a 2-up into a 4-up). Every number
 * below is the measured `getBoundingClientRect().width` of the real element
 * on the deployed site, at 390 / 768 / 1024 / 1280 / 1512 CSS px, on both the
 * homepage and a category listing where a role appears on both.
 *
 *   role          390   768  1024  1280  1512
 *   logo          166   176   260   260   260   (footer 270 throughout)
 *   hero          358   396   528   669   713
 *   editorial     358   360   480   608   648   (collection intro matches)
 *   story         356   346   466   594   634
 *   card           171   352   304   390   416   (max of home + category)
 *   card fmcg      171   168   309   189   203
 *   card spotlight 155   153    91   126   135
 *   ceremony tile  171   230   177   228   244
 *   technique      138   129   177   228   244
 *   promo          112   112   200   200   200
 *   tile           110    91   125   161   173
 *   shortcut        80   108   146   109   116
 *
 * Note how several roles are NOT monotonic in viewport width. The card is
 * widest at 768 (2-up, 352px) and narrows at 1024 (4-up, 304px). A single vw
 * figure cannot express that, which is exactly how the old values went wrong.
 *
 * THE LADDER
 *
 * The browser rounds a `sizes` result UP to the next configured width, after
 * multiplying by devicePixelRatio. Rungs (see next.config.ts):
 *
 *   96  128  200  256  360  480  640  828  1080  1440  1920
 *
 * So each value below is chosen to land just at or above a rung after x2,
 * never just over one — declaring 420px (840 -> 1080) instead of 410px
 * (820 -> 828) costs 30% more bytes for 2% more pixels.
 *
 * MAINTENANCE
 *
 * If you change a grid's column count, a container max-width, or a tile
 * width, re-measure that role and update it here. `npm run images:audit`
 * prints declared-vs-rendered for every image on a running server and fails
 * on any role over 1.35x, so drift surfaces as a test failure rather than as
 * a slow homepage.
 */

/** Hero composition: priority, above the fold, the one image allowed to be large. */
export const SIZES_HERO = '(min-width: 1280px) 720px, (min-width: 768px) 52vw, 92vw'

/** 4:3 editorial figure — the journal block and the category/ceremony intro. */
export const SIZES_EDITORIAL = '(min-width: 1280px) 660px, (min-width: 768px) 48vw, 92vw'

/** 16:9 seller story media inside the story band. */
export const SIZES_STORY = '(min-width: 1280px) 640px, (min-width: 768px) 46vw, 92vw'

/**
 * Product card in a CATEGORY / SEARCH listing: 2-up on mobile, 3-up from
 * 1024, reaching 416px at 1512.
 *
 * The home page uses SIZES_CARD_HOME instead. The two are separate because
 * the home grid goes 4-up where the listing goes 3-up, so at 1024 a home card
 * is 222px against a listing card's 304px. A single string covering both has
 * to take the larger, which made every home card fetch w=640 for a box that
 * needed w=480 — a 1.44x over-fetch on the busiest page on the site.
 */
export const SIZES_CARD = '(min-width: 1280px) 410px, (min-width: 1024px) 30vw, (min-width: 768px) 46vw, 44vw'

/**
 * Product card in the HOME page grids (4-up from 1024). Measured
 * 171 / 352 / 222 / 286 / 306.
 */
export const SIZES_CARD_HOME = '(min-width: 1280px) 310px, (min-width: 1024px) 22vw, (min-width: 768px) 46vw, 44vw'

/** FMCG card: denser grid, squarer crop, so narrower at every breakpoint. */
export const SIZES_CARD_FMCG = '(min-width: 1280px) 15vw, (min-width: 1024px) 31vw, (min-width: 768px) 22vw, 44vw'

/**
 * Spotlight card is horizontal — image is ~41% of the card, not the full
 * column. This is the role that was 4.55x over-declared.
 */
export const SIZES_CARD_SPOTLIGHT = '(min-width: 1280px) 128px, (min-width: 1024px) 95px, 160px'

/** Ceremony tile — the parallel navigation spine, given deliberate weight. */
export const SIZES_CEREMONY_TILE = '(min-width: 1280px) 240px, (min-width: 1024px) 180px, (min-width: 768px) 235px, 175px'

/** Craft-technique rail item. */
export const SIZES_TECHNIQUE = '(min-width: 1280px) 240px, (min-width: 1024px) 180px, (min-width: 768px) 128px, 140px'

/** Promo strip artwork — fixed 200x220 box from 1024 up. */
export const SIZES_PROMO = '(min-width: 1024px) 200px, 115px'

/** Category tile in the tile wall. */
export const SIZES_CATEGORY_TILE = '(min-width: 1280px) 180px, (min-width: 1024px) 128px, (min-width: 768px) 96px, 115px'

/** Shortcut card media — a 47% sliver inside an already small card. */
export const SIZES_SHORTCUT = '(min-width: 1280px) 120px, (min-width: 1024px) 150px, (min-width: 768px) 110px, 84px'

/**
 * PDP gallery. Measured 358 / 720 / 492 / 748 / 828 across the breakpoints —
 * non-monotonic, because the gallery is full-bleed at 768 and then shares the
 * row with the buy panel from 1024.
 *
 * One fixed 540px covers everything from 768 up, because the binding
 * constraint above that width is not the layout, it is the source: catalogue
 * images are 1122px wide. 540px resolves to the w=1080 rung, 4% under the
 * source and indistinguishable from it. The honest alternative — tracking the
 * layout with vw — resolves to w=1440 at the top of the 768 band, where the
 * optimizer would do the extra work and hand back the same 1122px of pixels
 * under a new cache key.
 *
 * Below 768 it stays viewport-relative because there the layout, not the
 * source, is the limit.
 */
export const SIZES_PDP = '(min-width: 768px) 540px, 92vw'

/** Shop avatar on a seller page — fixed box. */
export const SIZES_SELLER_AVATAR = '240px'

/** Cart line-item thumbnail — fixed box. */
export const SIZES_CART_THUMB = '96px'

/**
 * Brand wordmark. Renders at most 270px (the footer lockup); the header is
 * 260px desktop, 166-176px mobile. With no `sizes` at all this defaulted to
 * 100vw and pulled the 1920px variant into the header of every page.
 *
 * Deliberately ONE value rather than a responsive set, which makes it ~1.9x
 * over-declared for the mobile header. That is the cheaper choice here, and
 * the audit carries the exemption. Measured on the derived webp:
 *
 *   w=360  3.2KB      w=640  5.4KB
 *
 * Header and footer both appear on every page. One shared 270px declaration
 * means both read the same w=640 variant: one request, 5.4KB. Sizing the
 * header correctly would ask for w=360 while the footer still asked for
 * w=640 — two requests, 8.6KB, for a wordmark nobody inspects. Flat art at
 * 5KB is below the width where getting `sizes` "right" pays for itself.
 */
export const SIZES_LOGO = '270px'
