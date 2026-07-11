/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
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
      {
        protocol: 'https',
        hostname: 'cdn.busromhouse.com',
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
  staticPageGenerationTimeout: 300,

  /**
   * Internationalization (i18n)
   *
   * Handled by dynamic [locale] routes
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
    // Ignore type errors during production build (unblock deployment)
    ignoreBuildErrors: true,
  },

  /**
   * ESLint Configuration
   */
  eslint: {
    // Ignore lint errors during production build (unblock deployment)
    ignoreDuringBuilds: true,
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
      '@iconify/react',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
    // 限制并发构建，防止压垮本地 CMS 导致 fetch ETIMEDOUT
    workerThreads: false,
    cpus: 1,
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
   * Source Maps - 生产环境调试和性能分析
   */
  productionBrowserSourceMaps: true,

  /**
   * Redirects - Handled from GSC 404s
   */
  async redirects() {
    try {
      const redirects = require('../redirects.json');
      return redirects;
    } catch (e) {
      return [];
    }
  },

  /**
   * Rewrites - Used for SEO and legacy URL handling
   */
  async rewrites() {
    return [
      // IndexNow verification key support
      // Allows any /{key}.txt request to be handled by our API
      {
        source: '/:key.txt',
        destination: '/api/indexnow/verify',
      },
    ]
  },

  /**
   * Security Headers
   *
   * - CSP: 防止 XSS 攻击
   * - HSTS: 强制 HTTPS
   * - COOP: 源隔离
   */
  async headers() {
    // 检测是否为开发环境
    const isDev = process.env.NODE_ENV !== 'production'

    // 第三方服务白名单 (Analytics, Chat, CDN, etc.)
    const thirdPartyScripts = [
      'https://challenges.cloudflare.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://analytics.google.com',
      'https://googleads.g.doubleclick.net',
      'https://www.googleadservices.com',
      'https://www.google.com',
      'https://pagead2.googlesyndication.com',
      'https://connect.facebook.net',
      'https://www.facebook.com',
      'https://analytics.tiktok.com',
      'https://s.tiktok.com',
      'https://*.clarity.ms',
      'https://www.clarity.ms',
      'https://bat.bing.com',
      'https://mc.yandex.ru',
      'https://metrika.yandex.ru',
      'https://*.hotjar.com',
      'https://cdn.segment.com',
      'https://cdn.amplitude.com',
      'https://cdn.mxpnl.com',
      'https://plausible.io',
      'https://js.hs-scripts.com',
      'https://js.hsforms.net',
      'https://snap.licdn.com',
      'https://static.ads-twitter.com',
      'https://www.redditstatic.com',
      'https://widget.intercom.io',
      'https://js.intercomcdn.com',
      'https://embed.tawk.to',
      'https://cdn.jsdelivr.net',
    ].join(' ')

    const thirdPartyConnects = [
      'https://*.amazonaws.com',
      'https://*.cloudfront.net',
      'https://cdn.busromhouse.com',
      'https://challenges.cloudflare.com',
      'https://cdn.jsdelivr.net',
      'https://api.iconify.design',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://analytics.google.com',
      'https://www.googleadservices.com',
      'https://www.google.com',
      'https://bid.g.doubleclick.net',
      'https://*.tawk.to',
      'wss://*.tawk.to',
      'https://va.tawk.to',
      'https://*.clarity.ms',
      'https://*.hotjar.com',
      'wss://*.hotjar.com',
      'https://*.hotjar.io',
      'wss://*.hotjar.io',
      'https://mc.yandex.ru',
      'https://analytics.tiktok.com',
      'https://www.facebook.com',
      'https://*.intercom.io',
      'wss://*.intercom.io',
      'https://api.segment.io',
      'https://api.amplitude.com',
      'https://api.mixpanel.com',
      'https://px.ads.linkedin.com',
    ].join(' ')

    const thirdPartyImages = [
      'https://*.amazonaws.com',
      'https://*.cloudfront.net',
      'https://cdn.busromhouse.com',
      'https://unpkg.com',
      'https://api.iconify.design',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://www.googleadservices.com',
      'https://www.google.com',
      'https://pagead2.googlesyndication.com',
      'https://*.tawk.to',
      'https://tawk.link',
      'https://cdn.jsdelivr.net',
      'https://*.clarity.ms',
      'https://c.clarity.ms',
      'https://c.bing.com',
      'https://www.facebook.com',
      'https://analytics.tiktok.com',
      'https://bat.bing.com',
      'https://c.bing.com',
      'https://mc.yandex.ru',
    ].join(' ')

    const thirdPartyFrames = [
      'https://challenges.cloudflare.com',
      'https://*.tawk.to',
      'https://www.googletagmanager.com',
      'https://www.facebook.com',
      'https://*.hotjar.com',
      'https://bid.g.doubleclick.net',
      'https://pagead2.googlesyndication.com',
      'https://tpc.googlesyndication.com',
      'https://www.google.com',
    ].join(' ')

    // CSP 配置
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: unsafe-inline 是 Next.js 必需的，通过限制其他来源来保护安全
      `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} ${thirdPartyScripts}`,
      // Styles: self + inline + Google Fonts + Tawk.to
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tawk.to",
      // Images: self + data + blob + CDNs + Trackers
      `img-src 'self' data: blob: http://localhost:* http://127.0.0.1:* ${thirdPartyImages}`,
      // Fonts: self + CDN + Google Fonts + Tawk.to
      "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com https://*.tawk.to https://*.hotjar.com",
      // Connect: self + APIs + CDNs + Websockets + Trackers
      `connect-src 'self' ${isDev ? "ws://localhost:* http://localhost:* http://127.0.0.1:*" : ""} ${thirdPartyConnects}`,
      // Media: self + CDN
      "media-src 'self' https://*.amazonaws.com https://*.cloudfront.net https://cdn.busromhouse.com http://localhost:* http://127.0.0.1:*",
      // Frame: Turnstile + Tawk + GTM + Hotjar
      `frame-src 'self' ${thirdPartyFrames}`,
      // Object: none
      "object-src 'none'",
      // Base URI: self
      "base-uri 'self'",
      // Form action: self
      "form-action 'self'",
      // Frame ancestors: allow framing by Payload CMS
      "frame-ancestors 'self' http://localhost:* http://127.0.0.1:* https://*.busromhouse.com",
      // Upgrade insecure requests
      ...(!isDev ? ["upgrade-insecure-requests"] : []),
    ].join('; ')

    // Security headers shared between dev and prod
    const commonHeaders = [
      // Content Security Policy
      {
        key: 'Content-Security-Policy',
        value: cspDirectives,
      },
      // Cross-Origin-Opener-Policy
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
      },
      // Cross-Origin-Embedder-Policy (配合 COOP)
      {
        key: 'Cross-Origin-Embedder-Policy',
        value: 'credentialless',
      },
      // Cross-Origin-Resource-Policy
      {
        key: 'Cross-Origin-Resource-Policy',
        value: 'same-origin',
      },
      // X-Content-Type-Options
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      // X-XSS-Protection (旧浏览器)
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      // Referrer-Policy
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      // Permissions-Policy (限制浏览器功能)
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      // Vary header - Critical for CDN to cache correctly based on Accept header
      // Prevents RSC payload from being served to HTML requests
      {
        key: 'Vary',
        value: 'Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch',
      },
    ]

    // HSTS: 仅在生产环境启用，防止开发时 Chrome 缓存 HSTS 策略
    // 导致 localhost HTTP 请求被强制升级为 HTTPS → ERR_SSL_PROTOCOL_ERROR
    if (!isDev) {
      commonHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      })
    }

    return [
      {
        source: '/:path*',
        headers: commonHeaders,
      },
      // Prevent Googlebot from directly indexing raw JSON API responses,
      // while still allowing it to fetch them to render the frontend pages.
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      // Favicon: allow cross-origin access for search engines (Bing, Google etc.)
      // Must come AFTER /:path* so cross-origin overrides same-origin
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/favicon-gold-b.svg',
        headers: [
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
