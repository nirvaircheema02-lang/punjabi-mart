import type { NextConfig } from 'next'

const exporting = process.env.STATIC_EXPORT === 'true'

/**
 * The /api and /media rewrites proxy to the Laravel backend. They are only
 * emitted when API_ORIGIN is set: the old default pointed at 127.0.0.1:8000,
 * which exists in local dev but not on Vercel, so every proxied request there
 * failed at runtime. With no backend deployed yet, emitting no rewrite is the
 * honest behaviour — the route 404s instead of hanging on a dead origin.
 */
const apiOrigin = process.env.API_ORIGIN

const nextConfig: NextConfig = {
  /**
   * Tells the client whether a backend exists at all. Without it the store
   * fires /api/session and /api/catalog on every load, both 404 on a
   * storefront-only deploy, and shows "The shop service is unavailable" —
   * an alarming message on a site that is working exactly as intended from
   * its seed catalogue.
   */
  env: { NEXT_PUBLIC_API_ENABLED: apiOrigin ? 'true' : 'false' },
  ...(exporting ? { output: 'export', trailingSlash: true } : {}),
  images: {
    unoptimized: exporting,
    /**
     * Catalogue sources top out around 1200px (1800 for landscape), so Next's
     * default ladder up to 3840 asks the optimizer for variants it can never
     * fill: w=3840 came back byte-identical to w=1920 (299KB both), just after
     * more work. Capping the ladder cuts redundant transcodes on a cold Vercel
     * cache and stops the browser pulling a 299KB file where 137KB will do.
     *
     * 384 was removed from imageSizes because it sat 6% away from the 360
     * deviceSize, and the two rungs are reached by different kinds of `sizes`
     * (fixed-px uses imageSizes, viewport-relative uses deviceSizes). The same
     * category artwork was therefore fetched TWICE per homepage — once at
     * w=360 and once at w=384 — for no visible difference. Measured on the
     * live site: 5 files duplicated, 123KB wasted. Every rung is now at least
     * 28% from its neighbour, so no two can be selected for one image.
     */
    deviceSizes: [360, 480, 640, 828, 1080, 1440, 1920],
    imageSizes: [96, 128, 200, 256],
    /**
     * AVIF is deliberately NOT enabled. It is the usual advice, and it is
     * wrong for this catalogue. Measured with the project's own sharp build,
     * at the quality Next actually passes through (75):
     *
     *   phulkari dupatta w=828   webp 124KB   avif 178KB   (+43%)
     *   voile turban     w=828   webp  95KB   avif 159KB   (+67%)
     *   hero composition w=828   webp  72KB   avif  98KB   (+36%)
     *
     * AVIF only undercuts webp here at around q65, where it merely draws
     * level (128KB vs 124KB) while costing 1.4-1.7s of encode per variant on
     * a cold cache. Dense embroidery is high-entropy detail, which is the
     * content type AVIF is weakest on. Revisit if the catalogue ever shifts
     * to flat packshots, where the result reverses.
     */
    localPatterns: [
      { pathname: '/images/**' },
      { pathname: '/brand/**' },
      { pathname: '/media/**' },
    ],
  },
  ...(exporting || !apiOrigin
    ? {}
    : {
        async rewrites() {
          return [
            { source: '/api/:path*', destination: `${apiOrigin}/api/:path*` },
            { source: '/media/:path*', destination: `${apiOrigin}/storage/:path*` },
          ]
        },
      }),
}

export default nextConfig
