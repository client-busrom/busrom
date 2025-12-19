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
import { ChecklistFeature } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

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
import { HeroBannerItems } from './src/collections/HeroBannerItems'
import { SeriesIntroItems } from './src/collections/SeriesIntroItems'
import { NavigationMenus } from './src/collections/NavigationMenus'
// Users & Access Control
import { Roles } from './src/collections/Roles'
import { Permissions } from './src/collections/Permissions'
import { ActivityLogs } from './src/collections/ActivityLogs'
// Content Collections
import { Pages } from './src/collections/Pages'
import { Blogs } from './src/collections/Blogs'
import { Applications } from './src/collections/Applications'
import { Categories } from './src/collections/Categories'
import { FaqItems } from './src/collections/FaqItems'
import { ReusableBlocks } from './src/collections/ReusableBlocks'
import { DocumentTemplates } from './src/collections/DocumentTemplates'
// Config Collections
import { CustomScripts } from './src/collections/CustomScripts'
import { SeoSettings } from './src/collections/SeoSettings'
import { FormConfigs } from './src/collections/FormConfigs'
import { FormSubmissions } from './src/collections/FormSubmissions'

// Content Blocks for Lexical Editor
import { contentBlocks } from './src/blocks'

// Custom Endpoints
import { exportFormSubmissionsHandler } from './src/endpoints/exportFormSubmissions'
import { translateHandler, testTranslationHandler } from './src/endpoints/translate'
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

// Globals - Website Settings
import { HomeContent } from './src/globals/HomeContent'
import { Footer } from './src/globals/Footer'
import { SiteConfig } from './src/globals/SiteConfig'
import { PreloaderConfig } from './src/globals/PreloaderConfig'
import { ContactConfig } from './src/globals/ContactConfig'
import { SocialConfig } from './src/globals/SocialConfig'
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
import { EmailConfig } from './src/globals/EmailConfig'
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
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    region: process.env.S3_REGION || 'us-east-1',
    // MinIO local development
    ...(process.env.USE_MINIO === 'true' && {
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      forcePathStyle: true,
    }),
  },
}

export default buildConfig({
  // ==================================================================
  // Admin Configuration
  // ==================================================================
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Busrom CMS',
      // favicon: '/favicon.ico',
      // ogImage: '/og-image.png', // Not supported in this version
    },
    components: {
      // Custom Busrom logo
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Logo#Icon',
      },
      // Admin styles provider - hides unnecessary actions on account page
      providers: ['@/components/admin/AdminStylesProvider'],
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
    ActivityLogs,
    // Products
    Products,
    ProductSeries,
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
    // Config Collections
    CustomScripts,
    SeoSettings,
    FormConfigs,
    FormSubmissions,
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
    ContactConfig,
    SocialConfig,
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
    EmailConfig,
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
    // Push schema to database - always enabled for initial deployment
    // TODO: Set to false after tables are created in production
    push: true,
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
          enabledCollections: ['products', 'product-series', 'blogs', 'pages'],
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
          generateFileURL: ({ filename, size }) => {
            // Handle null/undefined filename
            if (!filename) {
              return ''
            }

            // MinIO local development
            if (process.env.USE_MINIO === 'true') {
              const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000'
              // For variants in MinIO
              if (size?.name) {
                const variantFolder = size.name === 'card' ? 'small' : size.name === 'tablet' ? 'medium' : size.name === 'desktop' ? 'large' : size.name
                return `${endpoint}/${s3Config.bucket}/variants/${variantFolder}/${filename}`
              }
              return `${endpoint}/${s3Config.bucket}/media/${filename}`
            }

            // Production: Map Payload size names to S3 variant folder names
            // Payload sizes: thumbnail, card, tablet, desktop
            // S3 folders: thumbnail, small, medium, large
            const sizeToFolderMap: Record<string, string> = {
              'thumbnail': 'thumbnail',
              'card': 'small',
              'tablet': 'medium',
              'desktop': 'large',
            }

            // CDN domain
            const cdnDomain = process.env.CDN_DOMAIN
            const baseUrl = cdnDomain && cdnDomain !== 'NONE'
              ? `https://${cdnDomain}`
              : `https://${s3Config.bucket}.s3.${process.env.S3_REGION}.amazonaws.com`

            // If this is a variant (size is provided), use variants folder
            if (size?.name && sizeToFolderMap[size.name]) {
              return `${baseUrl}/variants/${sizeToFolderMap[size.name]}/${filename}`
            }

            // Original image: Parse filename to determine S3 path
            // Filename format: {series}_{type}_{...}.jpg
            // S3 path: {series}/{type}/{filename}
            const seriesMapping: Record<string, string> = {
              'glass-standoff': 'glass-standoff',
              'glass-connected-fitting': 'glass-connected-fitting',
              'glass-fence-spigot': 'glass-fence-spigot',
              'guardrail-glass-clip': 'guardrail-glass-clip',
              'bathroom-glass-clip': 'bathroom-glass-clip',
              'glass-hinge': 'glass-hinge',
              'sliding-door-kit': 'sliding-door-kit',
              'bathroom-door-handle': 'bathroom-door-handle',
              'hidden-hook': 'hidden-hook',
              'common': 'common',
            }

            const typeMapping: Record<string, string> = {
              'white': 'white',
              'scene': 'scene',
              'real': 'real',
              'size': 'size',
              'general': 'general',
              'combo': 'combo',
              'multi-style': 'multi-style',
              'showcase': 'showcase',
              'effect': 'effect',
              'product': 'product',
              'craft': 'craft',
              'packaging': 'packaging',
              'color': 'color',
            }

            // Parse filename to extract series and type
            const parts = filename.replace(/\.[^.]+$/, '').split('_')
            let s3Path = `media/${filename}` // Default fallback

            if (parts.length >= 2) {
              const series = parts[0]
              const type = parts[1]

              if (seriesMapping[series] && typeMapping[type]) {
                s3Path = `${series}/${type}/${filename}`
              }
            }

            return `${baseUrl}/${s3Path}`
          },
        },
      },
      bucket: s3Config.bucket,
      config: s3Config.config,
    }),

    // SEO Plugin
    seoPlugin({
      collections: ['pages', 'blogs', 'products', 'applications'],
      generateTitle: ({ doc }) => `${doc?.title || 'Busrom'} | Busrom`,
      generateDescription: ({ doc }) => doc?.excerpt || doc?.description || doc?.shortDescription || '',
      tabbedUI: true,
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
  // Initialization Hook - Seed data and create default admin
  // ==================================================================
  onInit: async (payload) => {
    // Skip initialization if database tables don't exist yet
    // This happens on first deployment when push:true hasn't run yet
    try {
      // Step 1: Seed permissions and roles (idempotent - only creates if not exists)
      await seedPermissionsSystem(payload)

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
