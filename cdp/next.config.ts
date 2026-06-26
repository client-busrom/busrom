import type { NextConfig } from 'next'
import path from 'path'

// Allow CMS origin for CORS. In production this should be set to the canonical
// Payload CMS URL (e.g. https://cms.busromhouse.com).
const cmsOrigin = process.env.PAYLOAD_URL || 'https://cms.busromhouse.com'

const nextConfig: NextConfig = {
  // CDP runs on port 3003
  // Allow requests from CMS (3002) and Web (3001)
  outputFileTracingRoot: path.resolve(__dirname),
  outputFileTracingIncludes: {
    '/api/analytics/track': ['./node_modules/geoip-lite/data/**/*'],
    '/': ['./node_modules/geoip-lite/data/**/*'],
  },
  serverExternalPackages: ['geoip-lite'],
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: cmsOrigin,
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

export default nextConfig
