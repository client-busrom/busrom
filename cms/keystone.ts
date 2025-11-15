/**
 * Keystone 6 Main Configuration
 *
 * This is the entry point for the Keystone CMS.
 * It configures database, authentication, GraphQL API, storage, and admin UI.
 *
 * AWS Integration:
 * - PostgreSQL: RDS for production, Docker for local dev
 * - S3: Media file storage
 * - CloudFront: CDN for serving images
 */

import { config } from '@keystone-6/core'
import { lists } from './schema'
import { withAuth, session } from './auth'
import { translateHandler } from './routes/translate'
import { regenerateVariantsHandler } from './routes/regenerate-variants'
import { fixBatchMediaHandler } from './routes/fix-batch-media'
import { exportFormSubmissionsHandler } from './routes/export-form-submissions'
import { updatePasswordHandler } from './routes/update-password'
import {
  setupTwoFactorHandler,
  enableTwoFactorHandler,
  disableTwoFactorHandler,
  regenerateBackupCodesHandler,
} from './routes/two-factor-auth'
import {
  verify2FALoginHandler,
  check2FARequiredHandler,
} from './routes/verify-2fa-login'
import { seedMediaSystem } from './migrations/seed-media-system'
import { seedProductSystem } from './migrations/seed-product-system'
import { seedNavigationSystem } from './migrations/seed-navigation-system'
import { seedPermissionsSystem } from './migrations/seed-permissions-system'
import { startActivityLogCleanup } from './lib/cleanup-activity-logs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * Keystone Configuration
 *
 * See: https://keystonejs.com/docs/apis/config
 */
export default withAuth(
  config({
    /**
     * Data Models (Lists)
     */
    lists,

    /**
     * Database Configuration
     *
     * - provider: PostgreSQL (AWS RDS in production)
     * - url: Connection string from environment variable
     * - enableLogging: Log SQL queries in development
     * - idField: Use UUID instead of auto-increment integers
     */
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL!,
      enableLogging: process.env.NODE_ENV === 'development',
      idField: { kind: 'uuid' },
      prismaClientPath: 'node_modules/.prisma/client',

      /**
       * onConnect Hook - Seed Media System Data
       *
       * Automatically seeds MediaCategory and MediaTag data on first run.
       * Only runs if MediaCategory table is empty.
       */
      async onConnect(context) {
        try {
          console.log('\n🔍 Checking for seed data initialization...\n')

          // 1. Seed Media System (use sudo to bypass access control)
          const mediaCategoryCount = await context.query.MediaCategory.count()
          if (mediaCategoryCount === 0) {
            await seedMediaSystem(context.sudo())
          } else {
            console.log('✓ Media system already initialized')
          }

          // 2. Seed Product System (use sudo to bypass access control)
          const productSeriesCount = await context.query.ProductSeries.count()
          if (productSeriesCount === 0) {
            await seedProductSystem(context.sudo())
          } else {
            console.log('✓ Product system already initialized')
          }

          // 3. Seed Navigation System (use sudo to bypass access control)
          const navigationMenuCount = await context.query.NavigationMenu.count()
          if (navigationMenuCount === 0) {
            await seedNavigationSystem(context.sudo())
          } else {
            console.log('✓ Navigation system already initialized')
          }

          // 4. Seed RBAC Permissions System
          const permissionCount = await context.query.Permission.count()
          if (permissionCount === 0) {
            await seedPermissionsSystem(context.sudo())
          } else {
            console.log('✓ RBAC permissions system already initialized')
          }

          console.log('\n✅ All systems ready!\n')

          // 5. Start ActivityLog auto-cleanup
          startActivityLogCleanup(context.prisma)
        } catch (error) {
          console.error('\n❌ Failed to seed systems:', error)
        }
      },
    },

    /**
     * Session Configuration
     *
     * Imported from auth.ts
     */
    session,

    /**
     * Server Configuration
     *
     * - cors: Allow requests from Next.js frontend
     * - port: CMS runs on port 3000
     * - extendExpressApp: Add custom API routes
     */
    server: {
      cors: {
        origin: [
          process.env.WEB_URL || 'http://localhost:3001',
          'http://localhost:3001',
        ],
        credentials: true,
      },
      port: 3000,
      extendExpressApp: (app, commonContext) => {
        const express = require('express')
        const path = require('path')

        // Serve static files from public directory
        // Note: __dirname points to .keystone/ after compilation, so we need to go up one level
        app.use(express.static(path.join(__dirname, '..', 'public')))

        // Add JSON body parser for API routes
        app.use(express.json())

        // Inject Keystone context into request with session
        app.use(async (req, res, next) => {
          ;(req as any).context = await commonContext.withRequest(req, res)
          next()
        })

        // Translation API endpoint
        app.post('/api/translate', translateHandler)

        // Regenerate variants API endpoint
        app.post('/api/regenerate-variants', regenerateVariantsHandler)

        // Fix batch media API endpoint
        app.post('/api/fix-batch-media', fixBatchMediaHandler)

        // Export form submissions API endpoint
        app.post('/api/export-form-submissions', exportFormSubmissionsHandler)

        // Update password API endpoint
        app.post('/api/update-password', updatePasswordHandler)

        // Two-Factor Authentication API endpoints
        app.post('/api/2fa/setup', setupTwoFactorHandler)
        app.post('/api/2fa/enable', enableTwoFactorHandler)
        app.post('/api/2fa/disable', disableTwoFactorHandler)
        app.post('/api/2fa/regenerate-backup-codes', regenerateBackupCodesHandler)
        app.post('/api/2fa/verify', verify2FALoginHandler)
        app.post('/api/2fa/check-required', check2FARequiredHandler)

        console.log('✅ Static files served from public/')
        console.log('✅ Translation API registered at POST /api/translate')
        console.log('✅ Regenerate Variants API registered at POST /api/regenerate-variants')
        console.log('✅ Fix Batch Media API registered at POST /api/fix-batch-media')
        console.log('✅ Export Form Submissions API registered at POST /api/export-form-submissions')
        console.log('✅ Update Password API registered at POST /api/update-password')
        console.log('✅ 2FA API registered at POST /api/2fa/*')
      },
    },

    /**
     * Storage Configuration
     *
     * Automatic S3/MinIO switching based on environment:
     * - Development: MinIO (local S3-compatible storage, no AWS costs)
     * - Production: AWS S3 + CloudFront CDN
     *
     * Configuration:
     * - kind: s3 (AWS S3 or MinIO)
     * - type: image (image optimization with Sharp)
     * - bucketName: S3 bucket name
     * - region: AWS region
     * - signed: Presigned URLs for secure access (5000s expiry)
     */
    storage: {
      s3_images: {
        kind: 's3',
        type: 'image',
        bucketName: process.env.S3_BUCKET_NAME || 'busrom-media',
        region: process.env.S3_REGION || 'us-east-1',
        accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin123',

        // MinIO-specific configuration (local development)
        ...(process.env.USE_MINIO === 'true' && {
          endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
          forcePathStyle: true, // Required for MinIO
        }),

        signed: { expiry: 5000 },
      },
    },

    /**
     * GraphQL API Configuration
     *
     * GraphQL endpoint: http://localhost:3000/api/graphql
     */
    graphql: {
      // GraphQL Playground is enabled in development
      playground: process.env.NODE_ENV === 'development',
      path: '/api/graphql',
    },

    /**
     * Admin UI Configuration
     *
     * - isAccessAllowed: Only authenticated users can access
     * - Admin UI: http://localhost:3000
     * - pages: Custom admin pages
     * - navigation: Organize sidebar navigation into groups
     */
    ui: {
      isAccessAllowed: (context) => !!context.session,
      // Custom signin page
      pageMiddleware: async ({ wasAccessAllowed }) => {
        if (wasAccessAllowed) {
          return
        }
        return {
          kind: 'redirect',
          to: '/signin',
        }
      },
      // Custom admin pages
      pages: [
        {
          label: 'Sign In',
          path: 'signin',
          component: './admin/pages/signin',
        },
        {
          label: '📤 Batch Upload Media',
          path: 'batch-upload',
          component: './admin/pages/batch-media-upload',
        },
        {
          label: '📊 Export Form Submissions',
          path: 'export-form-submissions',
          component: './admin/pages/export-form-submissions',
        },
        {
          label: '🔐 Two-Factor Authentication',
          path: 'two-factor-auth',
          component: './admin/pages/two-factor-auth',
        },
      ],
      navigation: {
        // 身份验证 & 用户 (Admin only)
        'Users & Access': ['User', 'Role', 'Permission', 'ActivityLog'],

        // 导航管理
        'Navigation': ['NavigationMenu'],

        // 首页内容
        'Home Page': [
          'HeroBannerItem',
          'ProductSeriesCarousel',
          'ServiceFeaturesConfig',
          'Sphere3d',
          'SimpleCta',
          'SeriesIntro',
          'FeaturedProducts',
          'BrandAdvantages',
          'OemOdm',
          'QuoteSteps',
          'MainForm',
          'WhyChooseBusrom',
          'CaseStudies',
          'BrandAnalysis',
          'BrandValue',
          'Footer',
        ],

        // 媒体库 (AWS S3)
        'Media': ['Media', 'MediaCategory', 'MediaTag', { type: 'page', href: '/batch-upload', label: '📤 Batch Upload' }],

        // 产品管理
        'Products': ['ProductSeries', 'Product'],

        // 内容管理
        'Content': [
          'Category',
          'Blog',
          'BlogContentTranslation',
          'Application',
          'Page',
          'FaqItem',
        ],

        // 组件块管理
        'Component Blocks': [
          'ProductSeriesContentTranslation',
          'ProductContentTranslation',
          'ApplicationContentTranslation',
          'PageContentTranslation',
          'DocumentTemplate',
          'ReusableBlock',
          'ReusableBlockVersion',
        ],

        // 表单
        'Forms': ['FormConfig', 'FormSubmission'],

        // 高级功能
        'Advanced': ['CustomScript', 'SeoSetting'],

        // 站点配置
        'Site Config': ['SiteConfig'],
      },
      // Custom navigation component
      components: {
        Navigation: './admin/components/Navigation',
      },
    },

    /**
     * Telemetry
     *
     * You can disable telemetry if needed
     */
    telemetry: false,
  })
)
