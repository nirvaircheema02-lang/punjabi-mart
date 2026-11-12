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
  ...(exporting ? { output: 'export', trailingSlash: true } : {}),
  images: {
    unoptimized: exporting,
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
