import type { NextConfig } from 'next'
import path from 'path'

// Allow CMS and Web origins for CORS.
const allowedOrigins = new Set([
  process.env.PAYLOAD_URL || 'https://cms.busromhouse.com',
  'https://www.busromhouse.com',
  'https://busromhouse.com',
  'http://localhost:3001',
  'http://localhost:3002',
])

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
            value: Array.from(allowedOrigins).join(' '),
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
