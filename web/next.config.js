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
   *
   * Note: optimizeFonts was removed from experimental in Next.js 15
   * Font optimization is now enabled by default
   */
  experimental: {
    // 优化包大小 - 移除重复模块
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
  },

  /**
   * Webpack Configuration
   *
   * 优化 chunk 分割，避免 framer-motion 等大型库被重复打包
   */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // 将 framer-motion 提取到独立 chunk，所有组件共享
          'framer-motion': {
            name: 'framer-motion',
            test: /[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils|motion)[\\/]/,
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // 将 Three.js 相关库提取到独立 chunk
          'three': {
            name: 'three',
            test: /[\\/]node_modules[\\/](three|@react-three|react-globe\.gl|globe\.gl)[\\/]/,
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // 将 GSAP 提取到独立 chunk
          'gsap': {
            name: 'gsap',
            test: /[\\/]node_modules[\\/]gsap[\\/]/,
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // 将 Embla Carousel 提取到独立 chunk
          'embla': {
            name: 'embla',
            test: /[\\/]node_modules[\\/]embla-carousel[\\/]/,
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // 将 Payload Lexical 提取到独立 chunk
          'lexical': {
            name: 'lexical',
            test: /[\\/]node_modules[\\/](@payloadcms[\\/]richtext-lexical|lexical)[\\/]/,
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // 将 Radix UI 提取到独立 chunk
          'radix': {
            name: 'radix',
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // 将 SWR 提取到独立 chunk
          'swr': {
            name: 'swr',
            test: /[\\/]node_modules[\\/]swr[\\/]/,
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // 将 next-intl 提取到独立 chunk
          'intl': {
            name: 'intl',
            test: /[\\/]node_modules[\\/](next-intl|intl-messageformat|@formatjs)[\\/]/,
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // 将 Lenis 提取到独立 chunk
          'lenis': {
            name: 'lenis',
            test: /[\\/]node_modules[\\/]lenis[\\/]/,
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // 将 Lucide 图标提取到独立 chunk（只包含实际使用的图标）
          'icons': {
            name: 'icons',
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // 其他大型库
          'vendors': {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },

  /**
   * Compiler Options - 减少 JS 体积
   */
  compiler: {
    // 移除 console.log (生产环境)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
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
