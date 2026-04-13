/**
 * Payload CMS Configuration
 *
 * Main configuration file for Busrom CMS
 * Migrated from Keystone.js
 */

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  lexicalEditor,
  BlocksFeature,
  // Text Formatting
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  InlineCodeFeature,
  // Structure
  ParagraphFeature,
  HeadingFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  // Lists
  UnorderedListFeature,
  OrderedListFeature,
  // Rich Content
  LinkFeature,
  UploadFeature,
  RelationshipFeature,
  // Toolbar
  FixedToolbarFeature,
  InlineToolbarFeature,
  // Layout
  AlignFeature,
  IndentFeature,
} from '@payloadcms/richtext-lexical'
// Custom Features
import { ImageGalleryFeature } from './src/lexical-features/image-gallery'
import { DemoHRFeature } from './src/lexical-features/demo-hr'
import { BlocksToolbarDropdownFeature } from './src/lexical-features/blocks-toolbar-dropdown'
import { SingleImageFeature } from './src/lexical-features/single-image'
import { VideoEmbedFeature } from './src/lexical-features/video-embed'
import { CtaButtonFeature } from './src/lexical-features/cta-button'
import { NoticeFeature } from './src/lexical-features/notice'
import { HeroFeature } from './src/lexical-features/hero'
import { LinkJumpFeature } from './src/lexical-features/link-jump'
import { CarouselFeature } from './src/lexical-features/carousel'
import { MarqueeLinksFeature } from './src/lexical-features/marquee-links'
import { FormBlockFeature } from './src/lexical-features/form-block'
import { ReusableBlockFeature } from './src/lexical-features/reusable-block'
import { DocumentTemplateFeature } from './src/lexical-features/document-template'
import { ApplicationCarouselFeature } from './src/lexical-features/application-carousel'
import { ProductCarouselFeature } from './src/lexical-features/product-carousel'
import { ProductReusableBlockFeature } from './src/lexical-features/product-reusable-block'
import { SeriesReusableBlockFeature } from './src/lexical-features/series-reusable-block'
import { IconListFeature } from './src/lexical-features/icon-list'
import { ChecklistFeature } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

import { auditorPlugin } from 'payload-auditor'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Jobs Queue Tasks
import { regenerateImageSizesTask } from './src/jobs/regenerateImageSizes'

// Admin UI Translations
import { en } from '@payloadcms/translations/languages/en'
import { zh } from '@payloadcms/translations/languages/zh'
import { customTranslationsEn, customTranslationsZh } from './src/i18n/custom-translations'

// Collections
import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { MediaCategories } from './src/collections/MediaCategories'
import { MediaTags } from './src/collections/MediaTags'
import { Products } from './src/collections/Products'
import { ProductSeries } from './src/collections/ProductSeries'
import { ProductAttributes } from './src/collections/ProductAttributes'
import { ProductTemplates } from './src/collections/ProductTemplates'
import { ProductReusableBlocks } from './src/collections/ProductReusableBlocks'
import { SeriesTemplates } from './src/collections/SeriesTemplates'
import { SeriesReusableBlocks } from './src/collections/SeriesReusableBlocks'
import { HeroBannerItems } from './src/collections/HeroBannerItems'
import { SeriesIntroItems } from './src/collections/SeriesIntroItems'
import { NavigationMenus } from './src/collections/NavigationMenus'
// Users & Access Control
import { Roles } from './src/collections/Roles'
import { Permissions } from './src/collections/Permissions'
// Content Collections
import { Pages } from './src/collections/Pages'
import { Blogs } from './src/collections/Blogs'
import { Applications } from './src/collections/Applications'
import { Categories } from './src/collections/Categories'
import { FaqItems } from './src/collections/FaqItems'
import { ReusableBlocks } from './src/collections/ReusableBlocks'
import { DocumentTemplates } from './src/collections/DocumentTemplates'
import { TemplateCategories } from './src/collections/TemplateCategories'
// Config Collections
import { CustomScripts } from './src/collections/CustomScripts'
import { SeoSettings } from './src/collections/SeoSettings'
import { FormConfigs } from './src/collections/FormConfigs'
import { FormSubmissions } from './src/collections/FormSubmissions'
import { SmtpConfigs } from './src/collections/SmtpConfigs'

// Content Blocks for Lexical Editor
import { contentBlocks } from './src/blocks'

// Custom Endpoints
import { exportFormSubmissionsHandler } from './src/endpoints/exportFormSubmissions'
import { translateHandler, testTranslationHandler, saveUserTranslationSettingsHandler, getUserTranslationSettingsHandler } from './src/endpoints/translate'
import {
  setup2FAHandler,
  enable2FAHandler,
  disable2FAHandler,
  verify2FAHandler,
  regenerateBackupCodesHandler,
  get2FAStatusHandler,
} from './src/endpoints/two-factor-auth'
import {
  authLoginHandler,
  authVerify2FAHandler,
  check2FARequiredHandler,
} from './src/endpoints/auth-login'
import { homeContentHandler } from './src/endpoints/home'
import { testSmtpHandler } from './src/endpoints/test-smtp'
import { mediaSearchHandler } from './src/endpoints/media-search'
import { invalidateCdnHandler, revalidateFrontendHandler } from './src/endpoints/maintenance'

// Globals - Website Settings
import { HomeContent } from './src/globals/HomeContent'
import { Footer } from './src/globals/Footer'
import { SiteConfig } from './src/globals/SiteConfig'
import { PreloaderConfig } from './src/globals/PreloaderConfig'
import { SocialConfig } from './src/globals/SocialConfig'
import { ShopPageConfig } from './src/globals/ShopPageConfig'
// Globals - Homepage Sections (ordered to match frontend)
import { ProductSeriesCarousel } from './src/globals/ProductSeriesCarousel'
import { ServiceFeatures } from './src/globals/ServiceFeatures'
import { Sphere3d } from './src/globals/Sphere3d'
import { SimpleCta } from './src/globals/SimpleCta'
import { FeaturedProducts } from './src/globals/FeaturedProducts'
import { BrandAdvantages } from './src/globals/BrandAdvantages'
import { OemOdm } from './src/globals/OemOdm'
import { QuoteSteps } from './src/globals/QuoteSteps'
import { MainForm } from './src/globals/MainForm'
import { WhyChooseBusrom } from './src/globals/WhyChooseBusrom'
import { CaseStudies } from './src/globals/CaseStudies'
import { BrandAnalysis } from './src/globals/BrandAnalysis'
import { BrandValue } from './src/globals/BrandValue'
// Globals - CMS Settings
import { TranslationConfig } from './src/globals/TranslationConfig'

// Seed functions
import { seedPermissionsSystem } from './src/seed/seed-permissions-system'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// S3 Configuration
const s3Config = {
  bucket: process.env.S3_BUCKET_NAME || 'busrom-media',
  config: {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    region: process.env.S3_REGION || 'us-east-1',
    ...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT }),
    ...(process.env.USE_MINIO === 'true' && !process.env.S3_ENDPOINT && { endpoint: 'http://localhost:9000' }),
    ...(process.env.USE_MINIO === 'true' && { forcePathStyle: true }),
  },
}

export default buildConfig({
  // ==================================================================
  // Admin Configuration
  // ==================================================================
  admin: {
    user: Users.slug,
    // Disable Gravatar to avoid broken images (gravatar.com is blocked in China)
    avatar: 'default',
    meta: {
      titleSuffix: '- Busrom CMS',
      icons: [
        // Standard .ico for broad compatibility
        {
          rel: 'icon',
          type: 'image/x-icon',
          url: '/favicon.ico',
        },
        // SVG for modern browsers
        {
          rel: 'icon',
          type: 'image/svg+xml',
          url: '/favicon.svg',
        },
      ],
      // ogImage: '/og-image.png', // Not supported in this version
    },
    components: {
      // Custom Busrom logo
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Logo#Icon',
      },
      // Custom navigation - organized with collapsible groups
      Nav: '@/components/admin/CustomNav',
      // Admin styles provider - hides unnecessary actions on account page
      // CompressedUploadProvider - compresses images before upload (client-side)
      providers: [
        '@/components/admin/AdminStylesProvider',
        '@/components/uploads/CompressedUploadField#CompressedUploadProvider',
      ],
    },
    // Admin UI localization
    dateFormat: 'yyyy-MM-dd HH:mm:ss',
  },

  // ==================================================================
  // Collections
  // ==================================================================
  collections: [
    // Core
    Users,
    Media,
    MediaCategories,
    MediaTags,
    // Users & Access Control
    Roles,
    Permissions,
    // Products
    Products,
    ProductSeries,
    ProductAttributes,
    ProductTemplates,
    ProductReusableBlocks,
    SeriesTemplates,
    SeriesReusableBlocks,
    // Homepage Collections (ordered to match frontend display order)
    HeroBannerItems,
    SeriesIntroItems,
    // Site Structure
    NavigationMenus,
    // Content Management
    Pages,
    Blogs,
    Applications,
    Categories,
    FaqItems,
    ReusableBlocks,
    DocumentTemplates,
    TemplateCategories,
    // Config Collections
    CustomScripts,
    SeoSettings,
    FormConfigs,
    FormSubmissions,
    SmtpConfigs,
  ],

  // ==================================================================
  // Globals (Singleton configs)
  // ==================================================================
  globals: [
    // Website Settings (关于网站的配置)
    HomeContent,
    Footer,
    SiteConfig,
    PreloaderConfig,
    SocialConfig,
    ShopPageConfig,
    // Homepage Sections (ordered to match frontend HomePageClient.tsx)
    // Note: HeroBanner (1) and SeriesIntro (6) are Collections, not Globals
    ProductSeriesCarousel,  // 2
    ServiceFeatures,        // 3
    Sphere3d,               // 4
    SimpleCta,              // 5
    FeaturedProducts,       // 7
    BrandAdvantages,        // 8
    OemOdm,                 // 9
    QuoteSteps,             // 10
    MainForm,               // 11
    WhyChooseBusrom,        // 12
    CaseStudies,            // 13
    BrandAnalysis,          // 14
    BrandValue,             // 15
    // CMS Settings (CMS系统配置)
    TranslationConfig,
  ],

  // ==================================================================
  // Database (PostgreSQL via Drizzle)
  // ==================================================================
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || 'postgresql://busrom:busrom_dev_password@localhost:5432/busrom_payload',
      // For AWS RDS with self-signed certificates
      ...(process.env.NODE_ENV === 'production' && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    },
    // Push schema disabled in production - schema is already synced
    // Only enable temporarily when deploying schema changes
    // Manual Fix (2026-03-13): Removed NOT NULL constraints on 'name' columns in main
    // tables (product_templates, series_templates) to allow localized field saving.
    push: true, // Force sync for FormConfigs changes
  }),

  // ==================================================================
  // Editor (Lexical)
  // ==================================================================
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => {
      console.log('🔍 [Payload Config] Configuring Lexical editor...')
      console.log('🔍 [Payload Config] Content blocks count:', contentBlocks.length)
      console.log('🔍 [Payload Config] Block slugs:', contentBlocks.map(b => b.slug).join(', '))

      return [
        // ==========================================
        // 🎨 Text Formatting Features
        // ==========================================
        BoldFeature(),
        ItalicFeature(),
        UnderlineFeature(),
        StrikethroughFeature(),
        SubscriptFeature(),
        SuperscriptFeature(),
        InlineCodeFeature(),

        // ==========================================
        // 📝 Structure Features
        // ==========================================
        ParagraphFeature(),
        HeadingFeature({
          enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        }),
        BlockquoteFeature(),
        HorizontalRuleFeature(),

        // ==========================================
        // 📋 List Features
        // ==========================================
        UnorderedListFeature(),
        OrderedListFeature(),
        ChecklistFeature(), // 检查列表（任务列表）- 内置功能

        // ==========================================
        // 🔗 Rich Content Features
        // ==========================================
        LinkFeature({
          enabledCollections: ['pages', 'products', 'blogs'],
        }),
        UploadFeature({
          collections: {
            media: {
              fields: [
                {
                  name: 'caption',
                  type: 'text',
                  label: 'Caption',
                },
              ],
            },
          },
        }),
        RelationshipFeature({
          enabledCollections: ['products', 'product-series', 'blogs', 'pages', 'product-attributes', 'product-templates'],
        }),

        // ==========================================
        // 🛠️ Toolbar Features
        // ==========================================
        FixedToolbarFeature(),
        InlineToolbarFeature(),

        // ==========================================
        // 📐 Layout Features
        // ==========================================
        AlignFeature(),
        IndentFeature(),

        // ==========================================
        // 🧩 Custom Content Blocks
        // ==========================================
        BlocksFeature({
          blocks: contentBlocks,
        }),

        // ==========================================
        // 🎨 Custom WYSIWYG Features
        // ==========================================
        DemoHRFeature(), // 官方示例 - 测试 Custom Features 是否工作
        ImageGalleryFeature(), // Custom Feature 图片画廊 - WYSIWYG
        SingleImageFeature(), // Custom Feature 单张图片 - WYSIWYG
        VideoEmbedFeature(), // Custom Feature 视频嵌入 - WYSIWYG
        CtaButtonFeature(), // Custom Feature 行动按钮 - WYSIWYG
        NoticeFeature(), // Custom Feature 提示框 - WYSIWYG
        HeroFeature(), // Custom Feature 英雄横幅 - WYSIWYG
        LinkJumpFeature(), // Custom Feature 快速链接 - WYSIWYG
        CarouselFeature(), // Custom Feature 轮播图 - WYSIWYG
        MarqueeLinksFeature(), // Custom Feature 滚动链接 - WYSIWYG
        FormBlockFeature(), // Custom Feature 表单块 - WYSIWYG
        ReusableBlockFeature(), // Custom Feature 可复用块 - WYSIWYG
        ApplicationCarouselFeature(), // Custom Feature 应用轮播 - WYSIWYG
        ProductCarouselFeature(), // Custom Feature 产品轮播 - WYSIWYG
        ProductReusableBlockFeature(), // Custom Feature 产品详情块 - WYSIWYG
        SeriesReusableBlockFeature(), // Custom Feature 产品详解块 - WYSIWYG
        IconListFeature(), // Custom Feature 图标列表 - WYSIWYG
        DocumentTemplateFeature(), // Custom Feature 文档模板 - 工具栏按钮
        BlocksToolbarDropdownFeature(), // 工具栏右侧自定义块按钮
      ]
    },
  }),

  // ==================================================================
  // Plugins
  // ==================================================================
  plugins: [
    // S3 Storage
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
          disableLocalStorage: true,
          generateFileURL: ({ filename }) => {
            // Handle null/undefined filename
            if (!filename) {
              return ''
            }

            // MinIO local development - check first
            if (process.env.USE_MINIO === 'true') {
              const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'
              const bucket = s3Config.bucket
              return `${endpoint}/${bucket}/media/${filename}`
            }

            // CDN domain (production)
            const cdnDomain = process.env.CDN_DOMAIN
            // Use s3Config.config.region which has a fallback to 'us-east-1'
            const region = s3Config.config.region || 'us-east-1'
            const baseUrl = cdnDomain && cdnDomain !== 'NONE'
              ? `https://${cdnDomain}`
              : `https://${s3Config.bucket}.s3.${region}.amazonaws.com`

            // All media files (original and variants) are in /media/ directory
            return `${baseUrl}/media/${filename}`
          },
        },
      },
      bucket: s3Config.bucket,
      config: s3Config.config,
    }),



    // Auditor Plugin - 操作审计日志
    // 注意：不追踪 users/roles/permissions，会导致 User 字段验证错误
    // 注意：插件使用 payload.create() 不带 overrideAccess，所以 access.create 需要为 true
    // 这是通过修改 node_modules 或等待插件修复来解决
    auditorPlugin({
      collection: {
        // 自定义访问控制 - 使用 isAdmin 字段
        Accessibility: {
          customAccess: {
            read: ({ req }) => req.user?.isAdmin === true,
          },
        },
        trackCollections: [
          // ==================== 媒体库 ====================
          {
            slug: 'media',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'media-categories',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'media-tags',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          // ==================== 产品 ====================
          {
            slug: 'products',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'product-series',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'product-attributes',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'product-templates',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'product-reusable-blocks',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'series-templates',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'series-reusable-blocks',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          // ==================== 首页内容 ====================
          {
            slug: 'hero-banner-items',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'series-intro-items',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          // ==================== 导航 ====================
          {
            slug: 'navigation-menus',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          // ==================== 内容管理 ====================
          {
            slug: 'pages',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'blogs',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'applications',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'categories',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'faq-items',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'reusable-blocks',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'document-templates',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'template-categories',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          // ==================== 表单 ====================
          {
            slug: 'form-configs',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'form-submissions',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'smtp-configs',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          // ==================== 系统设置 ====================
          {
            slug: 'custom-scripts',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
          {
            slug: 'seo-settings',
            hooks: {
              afterChange: { update: { enabled: true }, create: { enabled: true } },
              afterDelete: { enabled: true },
            },
          },
        ],
      },
    }),
  ],

  // ==================================================================
  // Custom Endpoints
  // ==================================================================
  endpoints: [
    // Home Page Content API (REST)
    {
      path: '/home',
      method: 'get',
      handler: homeContentHandler,
    },
    // Media Search (supports JSONB specs filtering)
    {
      path: '/media-search',
      method: 'get',
      handler: mediaSearchHandler,
    },
    {
      path: '/export-form-submissions',
      method: 'post',
      handler: exportFormSubmissionsHandler,
    },
    {
      path: '/translate',
      method: 'post',
      handler: translateHandler,
    },
    {
      path: '/translate/test',
      method: 'post',
      handler: testTranslationHandler,
    },
    // User Translation Settings
    {
      path: '/translate/settings',
      method: 'get',
      handler: getUserTranslationSettingsHandler,
    },
    {
      path: '/translate/settings',
      method: 'post',
      handler: saveUserTranslationSettingsHandler,
    },
    // Email Test Endpoint
    {
      path: '/test-smtp',
      method: 'post',
      handler: testSmtpHandler,
    },
    // 2FA Endpoints
    {
      path: '/2fa/setup',
      method: 'post',
      handler: setup2FAHandler,
    },
    {
      path: '/2fa/enable',
      method: 'post',
      handler: enable2FAHandler,
    },
    {
      path: '/2fa/disable',
      method: 'post',
      handler: disable2FAHandler,
    },
    {
      path: '/2fa/verify',
      method: 'post',
      handler: verify2FAHandler,
    },
    {
      path: '/2fa/regenerate-backup-codes',
      method: 'post',
      handler: regenerateBackupCodesHandler,
    },
    {
      path: '/2fa/status',
      method: 'get',
      handler: get2FAStatusHandler,
    },
    // Custom Auth Endpoints (for 2FA login flow)
    {
      path: '/auth/login',
      method: 'post',
      handler: authLoginHandler,
    },
    {
      path: '/auth/verify-2fa',
      method: 'post',
      handler: authVerify2FAHandler,
    },
    {
      path: '/auth/check-2fa',
      method: 'get',
      handler: check2FARequiredHandler,
    },
    {
      path: '/maintenance/invalidate-cdn',
      method: 'post',
      handler: invalidateCdnHandler,
    },
    {
      path: '/maintenance/revalidate-frontend',
      method: 'post',
      handler: revalidateFrontendHandler,
    },
  ],

  // ==================================================================
  // Admin UI i18n (Interface language switching)
  // ==================================================================
  i18n: {
    supportedLanguages: { en, zh },
    fallbackLanguage: 'en',
    translations: {
      en: {
        ...en.translations,
        ...customTranslationsEn,
      },
      zh: {
        ...zh.translations,
        ...customTranslationsZh,
      },
    },
  },

  // ==================================================================
  // Localization (Multi-language content support)
  // ==================================================================
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: '中文', code: 'zh' },
      { label: 'Español', code: 'es' },
      { label: 'Français', code: 'fr' },
      { label: 'Deutsch', code: 'de' },
      { label: '日本語', code: 'ja' },
      { label: '한국어', code: 'ko' },
      { label: 'Português', code: 'pt' },
      { label: 'Italiano', code: 'it' },
      { label: 'Nederlands', code: 'nl' },
      { label: 'Polski', code: 'pl' },
      { label: 'Русский', code: 'ru' },
      { label: 'العربية', code: 'ar' },
      { label: 'ไทย', code: 'th' },
      { label: 'Tiếng Việt', code: 'vi' },
      { label: 'Bahasa Indonesia', code: 'id' },
      { label: 'Bahasa Melayu', code: 'ms' },
      { label: 'Türkçe', code: 'tr' },
      { label: 'हिन्दी', code: 'hi' },
      { label: 'বাংলা', code: 'bn' },
      { label: 'Svenska', code: 'sv' },
      { label: 'Dansk', code: 'da' },
      { label: 'Norsk', code: 'no' },
      { label: 'Suomi', code: 'fi' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },

  // ==================================================================
  // GraphQL Configuration
  // ==================================================================
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },

  // ==================================================================
  // TypeScript Configuration
  // ==================================================================
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // ==================================================================
  // Security
  // ==================================================================
  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME_IN_PRODUCTION',

  // ==================================================================
  // Sharp (Image Processing)
  // ==================================================================
  sharp,

  // ==================================================================
  // Jobs Queue - Background task processing
  // ==================================================================
  jobs: {
    // Register tasks
    tasks: [regenerateImageSizesTask],
    // Don't auto-run on schedule - jobs are queued manually via hooks
    autoRun: [],
    // Delete completed jobs after 7 days to keep database clean
    deleteJobOnComplete: false,
  },

  // ==================================================================
  // Initialization Hook - Seed data and create default admin
  // ==================================================================
  onInit: async (payload) => {
    // Skip initialization if database tables don't exist yet
    // This happens on first deployment when push:true hasn't run yet
    try {
      // Step 0: Ensure sphere_3d table exists with correct structure
      // This handles cases where the table is missing from synced databases
      try {
        const db = payload.db as any
        if (db?.drizzle) {
          // Check if sphere_3d table exists
          const checkTable = await db.drizzle.execute(`
            SELECT 1 FROM information_schema.tables WHERE table_name = 'sphere_3d'
          `)

          if (!checkTable.rows || checkTable.rows.length === 0) {
            // Table doesn't exist - create it
            payload.logger.info('🔧 Creating missing sphere_3d tables...')
            await db.drizzle.execute(`
              CREATE TABLE IF NOT EXISTS sphere_3d (
                id SERIAL PRIMARY KEY,
                status VARCHAR(255) DEFAULT 'draft',
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              )
            `)
            await db.drizzle.execute(`
              CREATE TABLE IF NOT EXISTS sphere_3d_locales (
                id SERIAL PRIMARY KEY,
                _parent_id INTEGER REFERENCES sphere_3d(id) ON DELETE CASCADE,
                _locale VARCHAR(255) NOT NULL,
                title TEXT,
                description TEXT,
                UNIQUE(_parent_id, _locale)
              )
            `)
            payload.logger.info('✅ sphere_3d tables created successfully.')
          } else {
            // Table exists - check if it has description column (for old schema fix)
            const result = await db.drizzle.execute(`
              SELECT column_name FROM information_schema.columns
              WHERE table_name = 'sphere_3d' AND column_name = 'description'
            `)

            // If sphere_3d exists in main table (old schema), drop and recreate with locales
            if (result.rows && result.rows.length > 0) {
              payload.logger.info('🔧 Fixing sphere_3d table structure (migrating to locales)...')
              await db.drizzle.execute(`DROP TABLE IF EXISTS sphere_3d_locales CASCADE`)
              await db.drizzle.execute(`DROP TABLE IF EXISTS sphere_3d CASCADE`)
              payload.logger.info('✅ sphere_3d tables dropped. Payload will recreate them.')
            }
          }
        }
      } catch (fixError: any) {
        payload.logger.warn(`⚠️ sphere_3d table check: ${fixError.message}`)
      }

      // Step 0.1: Ensure simple_cta table exists with correct structure
      try {
        const db = payload.db as any
        if (db?.drizzle) {
          const checkTable = await db.drizzle.execute(`
            SELECT 1 FROM information_schema.tables WHERE table_name = 'simple_cta'
          `)

          if (!checkTable.rows || checkTable.rows.length === 0) {
            payload.logger.info('🔧 Creating missing simple_cta tables...')
            await db.drizzle.execute(`
              CREATE TABLE IF NOT EXISTS simple_cta (
                id SERIAL PRIMARY KEY,
                status VARCHAR(255) DEFAULT 'draft',
                cta_link TEXT,
                image1_id INTEGER,
                image2_id INTEGER,
                image3_id INTEGER,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              )
            `)
            await db.drizzle.execute(`
              CREATE TABLE IF NOT EXISTS simple_cta_locales (
                id SERIAL PRIMARY KEY,
                _parent_id INTEGER NOT NULL REFERENCES simple_cta(id) ON DELETE CASCADE,
                _locale VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                subtitle VARCHAR(255),
                description TEXT,
                cta_text VARCHAR(255),
                UNIQUE(_locale, _parent_id)
              )
            `)
            payload.logger.info('✅ simple_cta tables created successfully.')
          }
        }
      } catch (fixError: any) {
        payload.logger.warn(`⚠️ simple_cta table check: ${fixError.message}`)
      }

      // Step 0.2: Ensure brand_analysis table exists with correct structure
      try {
        const db = payload.db as any
        if (db?.drizzle) {
          const checkTable = await db.drizzle.execute(`
            SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_analysis'
          `)

          if (!checkTable.rows || checkTable.rows.length === 0) {
            payload.logger.info('🔧 Creating missing brand_analysis tables...')
            await db.drizzle.execute(`
              CREATE TABLE IF NOT EXISTS brand_analysis (
                id SERIAL PRIMARY KEY,
                status VARCHAR(255) DEFAULT 'draft',
                background_image_id INTEGER,
                brand_center_large_image_id INTEGER,
                brand_center_small_image_id INTEGER,
                project_center_large_image_id INTEGER,
                project_center_small_image_id INTEGER,
                service_center_large_image_id INTEGER,
                service_center_small_image_id INTEGER,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              )
            `)
            await db.drizzle.execute(`
              CREATE TABLE IF NOT EXISTS brand_analysis_locales (
                id SERIAL PRIMARY KEY,
                _parent_id INTEGER NOT NULL REFERENCES brand_analysis(id) ON DELETE CASCADE,
                _locale VARCHAR(255) NOT NULL,
                brand_center_title VARCHAR(255),
                brand_center_description TEXT,
                project_center_title VARCHAR(255),
                project_center_description TEXT,
                service_center_title VARCHAR(255),
                service_center_description TEXT,
                UNIQUE(_locale, _parent_id)
              )
            `)
            payload.logger.info('✅ brand_analysis tables created successfully.')
          }
        }
      } catch (fixError: any) {
        payload.logger.warn(`⚠️ brand_analysis table check: ${fixError.message}`)
      }

      // Note: Version tables are created by Drizzle push:true via scripts/init-database.ts
      // which runs before next start in start-payload.sh

      // Step 0.3: Ensure Jobs Queue tables exist
      // These are needed for background job processing (focal point image regeneration, etc.)
      try {
        const db = payload.db as any
        if (db?.drizzle) {
          // Check if payload_jobs table exists
          const checkJobsTable = await db.drizzle.execute(`
            SELECT 1 FROM information_schema.tables WHERE table_name = 'payload_jobs'
          `)

          if (!checkJobsTable.rows || checkJobsTable.rows.length === 0) {
            payload.logger.info('🔧 Creating missing payload_jobs tables...')

            // Create payload_jobs table (main jobs queue) with all required columns
            await db.drizzle.execute(`
              CREATE TABLE IF NOT EXISTS payload_jobs (
                id SERIAL PRIMARY KEY,
                input JSONB,
                completed_at TIMESTAMP WITH TIME ZONE,
                total_tried INTEGER DEFAULT 0,
                processing BOOLEAN DEFAULT FALSE,
                has_error BOOLEAN DEFAULT FALSE,
                error JSONB,
                task_slug VARCHAR(255),
                queue VARCHAR(255) DEFAULT 'default',
                wait_until TIMESTAMP WITH TIME ZONE,
                meta JSONB,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
              )
            `)

            // Create indexes for efficient job querying
            await db.drizzle.execute(`
              CREATE INDEX IF NOT EXISTS payload_jobs_task_slug_idx ON payload_jobs(task_slug);
              CREATE INDEX IF NOT EXISTS payload_jobs_queue_idx ON payload_jobs(queue);
              CREATE INDEX IF NOT EXISTS payload_jobs_processing_idx ON payload_jobs(processing);
              CREATE INDEX IF NOT EXISTS payload_jobs_wait_until_idx ON payload_jobs(wait_until);
              CREATE INDEX IF NOT EXISTS payload_jobs_completed_at_idx ON payload_jobs(completed_at);
              CREATE INDEX IF NOT EXISTS payload_jobs_has_error_idx ON payload_jobs(has_error);
              CREATE INDEX IF NOT EXISTS payload_jobs_created_at_idx ON payload_jobs(created_at);
            `)

            payload.logger.info('✅ payload_jobs table created successfully.')
          } else {
            // Table exists but might be missing columns - add them if needed
            const checkTotalTried = await db.drizzle.execute(`
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'payload_jobs' AND column_name = 'total_tried'
            `)
            if (!checkTotalTried.rows || checkTotalTried.rows.length === 0) {
              await db.drizzle.execute(`ALTER TABLE payload_jobs ADD COLUMN IF NOT EXISTS total_tried INTEGER DEFAULT 0`)
            }
            const checkMeta = await db.drizzle.execute(`
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'payload_jobs' AND column_name = 'meta'
            `)
            if (!checkMeta.rows || checkMeta.rows.length === 0) {
              await db.drizzle.execute(`ALTER TABLE payload_jobs ADD COLUMN IF NOT EXISTS meta JSONB`)
            }
          }

          // Check if payload_jobs_log table exists (for job execution logs)
          const checkLogTable = await db.drizzle.execute(`
            SELECT 1 FROM information_schema.tables WHERE table_name = 'payload_jobs_log'
          `)

          if (!checkLogTable.rows || checkLogTable.rows.length === 0) {
            payload.logger.info('🔧 Creating missing payload_jobs_log table...')

            // Create payload_jobs_log table (logs for each job execution attempt)
            // Note: id is VARCHAR to accept MongoDB-style ObjectIds from Payload
            await db.drizzle.execute(`
              CREATE TABLE IF NOT EXISTS payload_jobs_log (
                id VARCHAR(255) PRIMARY KEY,
                _order INTEGER NOT NULL,
                _parent_id INTEGER NOT NULL REFERENCES payload_jobs(id) ON DELETE CASCADE,
                executed_at TIMESTAMP WITH TIME ZONE,
                completed_at TIMESTAMP WITH TIME ZONE,
                task_slug VARCHAR(255),
                task_i_d VARCHAR(255),
                input JSONB,
                output JSONB,
                state VARCHAR(255),
                error JSONB
              )
            `)

            await db.drizzle.execute(`
              CREATE INDEX IF NOT EXISTS payload_jobs_log_parent_id_idx ON payload_jobs_log(_parent_id);
              CREATE INDEX IF NOT EXISTS payload_jobs_log_order_idx ON payload_jobs_log(_order);
            `)

            payload.logger.info('✅ payload_jobs_log table created successfully.')
          } else {
            // Table exists - check if id column is SERIAL (wrong) and needs to be fixed to VARCHAR
            const checkIdType = await db.drizzle.execute(`
              SELECT data_type FROM information_schema.columns
              WHERE table_name = 'payload_jobs_log' AND column_name = 'id'
            `)
            if (checkIdType.rows && checkIdType.rows.length > 0) {
              const dataType = (checkIdType.rows[0] as any).data_type
              if (dataType === 'integer') {
                payload.logger.info('🔧 Fixing payload_jobs_log id column type from INTEGER to VARCHAR...')
                // Drop and recreate the table with correct schema
                await db.drizzle.execute(`DROP TABLE IF EXISTS payload_jobs_log CASCADE`)
                await db.drizzle.execute(`
                  CREATE TABLE payload_jobs_log (
                    id VARCHAR(255) PRIMARY KEY,
                    _order INTEGER NOT NULL,
                    _parent_id INTEGER NOT NULL REFERENCES payload_jobs(id) ON DELETE CASCADE,
                    executed_at TIMESTAMP WITH TIME ZONE,
                    completed_at TIMESTAMP WITH TIME ZONE,
                    task_slug VARCHAR(255),
                    task_i_d VARCHAR(255),
                    input JSONB,
                    output JSONB,
                    state VARCHAR(255),
                    error JSONB
                  )
                `)
                await db.drizzle.execute(`
                  CREATE INDEX IF NOT EXISTS payload_jobs_log_parent_id_idx ON payload_jobs_log(_parent_id);
                  CREATE INDEX IF NOT EXISTS payload_jobs_log_order_idx ON payload_jobs_log(_order);
                `)
                payload.logger.info('✅ payload_jobs_log table recreated with VARCHAR id.')
              }
            }
          }

          // Check if payload_jobs_stats table (global) exists
          const checkStatsTable = await db.drizzle.execute(`
            SELECT 1 FROM information_schema.tables WHERE table_name = 'payload_jobs_stats'
          `)

          if (!checkStatsTable.rows || checkStatsTable.rows.length === 0) {
            payload.logger.info('🔧 Creating missing payload_jobs_stats table...')

            // Create payload_jobs_stats table (global for job queue statistics)
            await db.drizzle.execute(`
              CREATE TABLE IF NOT EXISTS payload_jobs_stats (
                id SERIAL PRIMARY KEY,
                stats JSONB,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
              )
            `)

            payload.logger.info('✅ payload_jobs_stats table created successfully.')
          }
        }
      } catch (jobsError: any) {
        payload.logger.warn(`⚠️ Jobs tables check: ${jobsError.message}`)
      }

      // Step 0.x: Clean up stuck/failed jobs to prevent _rels error loop
      try {
        const db = payload.db as any
        if (db?.drizzle) {
          const checkJobsTable = await db.drizzle.execute(`
            SELECT 1 FROM information_schema.tables WHERE table_name = 'payload_jobs'
          `)
          if (checkJobsTable.rows && checkJobsTable.rows.length > 0) {
            // Delete all failed and stuck (processing for over 10 minutes) jobs
            const result = await db.drizzle.execute(`
              DELETE FROM payload_jobs
              WHERE task_slug = 'regenerateImageSizes'
              AND (
                processing = false
                OR updated_at < NOW() - INTERVAL '10 minutes'
              )
            `)
            const deletedCount = result.rowCount || 0
            if (deletedCount > 0) {
              payload.logger.info(`🧹 Cleaned up ${deletedCount} stuck/failed regenerateImageSizes job(s)`)
            }
          }
        }
      } catch (cleanupError: any) {
        payload.logger.warn(`⚠️ Jobs cleanup: ${cleanupError.message}`)
      }

      // Step 1: Seed permissions and roles (idempotent - only creates if not exists)
      await seedPermissionsSystem(payload)

      // Step 1.5: Seed default template categories (idempotent)
      const defaultTemplateCategories = [
        { name: { en: 'Product Introduction', zh: '产品介绍' }, slug: 'product-intro', order: 1 },
        { name: { en: 'Company Profile', zh: '公司简介' }, slug: 'company-profile', order: 2 },
        { name: { en: 'Service Description', zh: '服务说明' }, slug: 'service-description', order: 3 },
        { name: { en: 'FAQ', zh: '常见问题' }, slug: 'faq', order: 4 },
        { name: { en: 'News & Blog', zh: '新闻博客' }, slug: 'news-blog', order: 5 },
        { name: { en: 'Landing Page', zh: '落地页' }, slug: 'landing-page', order: 6 },
        { name: { en: 'Case Study', zh: '案例展示' }, slug: 'case-study', order: 7 },
        { name: { en: 'General', zh: '通用' }, slug: 'general', order: 0 },
      ]

      for (const cat of defaultTemplateCategories) {
        const existing = await payload.find({
          collection: 'template-categories',
          where: { slug: { equals: cat.slug } },
          limit: 1,
        })
        if (existing.totalDocs === 0) {
          // Create with en locale first
          const created = await payload.create({
            collection: 'template-categories',
            data: {
              name: cat.name.en,
              slug: cat.slug,
              order: cat.order,
            },
            locale: 'en',
          })
          // Set zh locale name (hook auto-generates bilingual label)
          await payload.update({
            collection: 'template-categories',
            id: created.id,
            data: { name: cat.name.zh },
            locale: 'zh',
          })
          payload.logger.info(`✅ Template category seeded: ${cat.name.zh} | ${cat.name.en}`)
        }
      }

      // Step 2: Create default admin user if no users exist
      const existingUsers = await payload.find({
        collection: 'users',
        limit: 1,
      })

      if (existingUsers.totalDocs === 0) {
        const defaultEmail = process.env.ADMIN_EMAIL || 'admin@busrom.com'
        const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin123456'
        const defaultName = process.env.ADMIN_NAME || 'Admin'

        // Find super_admin role
        const superAdminRole = await payload.find({
          collection: 'roles',
          where: { code: { equals: 'super_admin' } },
          limit: 1,
        })

        await payload.create({
          collection: 'users',
          data: {
            email: defaultEmail,
            password: defaultPassword,
            name: defaultName,
            isAdmin: true,
            status: 'active',
            roles: superAdminRole.docs.length > 0 ? [superAdminRole.docs[0].id] : [],
          },
        })
        payload.logger.info(`✅ Default admin user created: ${defaultEmail}`)
      }
    } catch (error: any) {
      // If error is "relation does not exist", tables haven't been created yet
      // This is expected on first run - Payload will create tables via push:true
      if (error?.cause?.code === '42P01' || error?.message?.includes('does not exist')) {
        payload.logger.warn('⚠️ Database tables not initialized yet. They will be created by Payload.')
      } else {
        payload.logger.error(`❌ Error in onInit: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  },
})
