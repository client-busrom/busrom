/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Image Configuration
   *
   * Allow images from AWS S3 and CloudFront CDN
   */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  /**
   * AWS Deployment Configuration
   *
   * - output: 'standalone' for Docker/EC2 deployment
   * - compress: Enable gzip compression
   */
  output: 'standalone',
  compress: true,

  /**
   * Internationalization (i18n)
   *
   * Handled by next-intl with dynamic [locale] routes
   * See: app/[locale]/layout.tsx
   */

  /**
   * Environment Variables
   *
   * These will be available in the browser (NEXT_PUBLIC_*)
   */
  env: {
    CMS_GRAPHQL_URL: process.env.CMS_GRAPHQL_URL,
    AWS_CLOUDFRONT_DOMAIN: process.env.AWS_CLOUDFRONT_DOMAIN,
  },

  /**
   * TypeScript Configuration
   */
  typescript: {
    // Fail build on type errors in production
    ignoreBuildErrors: false,
  },

  /**
   * ESLint Configuration
   */
  eslint: {
    // Fail build on lint errors in production
    ignoreDuringBuilds: false,
  },

  /**
   * React Strict Mode
   *
   * Enable in development for better error detection
   */
  reactStrictMode: true,

  /**
   * Experimental Features
   */
  experimental: {
    // Enable optimizeFonts for better font loading
    optimizeFonts: true,
  },

  /**
   * Security Headers
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
