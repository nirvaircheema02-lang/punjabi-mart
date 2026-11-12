import type { NextConfig } from 'next'
const exporting = process.env.STATIC_EXPORT === 'true'
const nextConfig: NextConfig = {
  ...(exporting ? { output: 'export', trailingSlash: true } : {}),
  images: { unoptimized: exporting, localPatterns: [{ pathname: '/images/**' }, { pathname: '/brand/**' }, { pathname: '/media/**' }] },
  ...(exporting ? {} : { async rewrites() { return [{ source: '/api/:path*', destination: `${process.env.API_ORIGIN || 'http://127.0.0.1:8000'}/api/:path*` }, { source: '/media/:path*', destination: `${process.env.API_ORIGIN || 'http://127.0.0.1:8000'}/storage/:path*` }] } }),
}
export default nextConfig
