/**
 * Update Permission Categories
 * 
 * This migration updates all existing permissions to use the new category structure
 * aligned with Navigation.tsx grouping
 */

import type { Context } from '.keystone/types'

// Old category -> New category mapping
const CATEGORY_MAPPING: Record<string, string> = {
  content_management: 'content',
  media_management: 'media',
  site_configuration: 'site_config',
  seo_marketing: 'advanced',
  customer_service: 'forms',
  system_management: 'auth_and_users',
}

// Resource -> New category mapping (for more specific control)
const RESOURCE_CATEGORY_MAPPING: Record<string, string> = {
  // Auth & Users
  User: 'auth_and_users',
  Role: 'auth_and_users',
  Permission: 'auth_and_users',
  ActivityLog: 'auth_and_users',

  // Navigation
  NavigationMenu: 'navigation',

  // Home Page
  HeroBannerItem: 'home_page',
  ProductSeriesCarousel: 'home_page',
  ServiceFeaturesConfig: 'home_page',
  Sphere3d: 'home_page',
  SimpleCta: 'home_page',
  SeriesIntro: 'home_page',
  FeaturedProducts: 'home_page',
  BrandAdvantages: 'home_page',
  OemOdm: 'home_page',
  QuoteSteps: 'home_page',
  MainForm: 'home_page',
  WhyChooseBusrom: 'home_page',
  CaseStudies: 'home_page',
  BrandAnalysis: 'home_page',
  BrandValue: 'home_page',
  Footer: 'home_page',

  // Media
  Media: 'media',
  MediaCategory: 'media',
  MediaTag: 'media',

  // Products
  ProductSeries: 'products',
  Product: 'products',

  // Content
  Category: 'content',
  Blog: 'content',
  BlogContentTranslation: 'content',
  Application: 'content',
  Page: 'content',
  PageContentTranslation: 'content',
  FaqItem: 'content',

  // Component Blocks
  ProductSeriesContentTranslation: 'component_blocks',
  ProductContentTranslation: 'component_blocks',
  ApplicationContentTranslation: 'component_blocks',
  BlogContentTranslation: 'component_blocks',
  DocumentTemplate: 'component_blocks',
  ReusableBlock: 'component_blocks',
  ReusableBlockContentTranslation: 'component_blocks',

  // Forms
  ContactForm: 'forms',
  FormConfig: 'forms',

  // Advanced
  CustomScript: 'advanced',
  SeoSetting: 'advanced',

  // Site Config
  SiteConfig: 'site_config',
}

export async function updatePermissionCategories(context: Context) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 Updating Permission Categories')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Fetch all permissions
    const permissions = await context.sudo().query.Permission.findMany({
      query: 'id resource category',
    })

    console.log(`Found ${permissions.length} permissions to update\n`)

    let updatedCount = 0
    let unchangedCount = 0

    for (const permission of permissions) {
      const newCategory = RESOURCE_CATEGORY_MAPPING[permission.resource]

      if (newCategory && newCategory !== permission.category) {
        await context.sudo().query.Permission.updateOne({
          where: { id: permission.id },
          data: { category: newCategory },
        })
        console.log(
          `  ✓ Updated ${permission.resource}: ${permission.category} → ${newCategory}`
        )
        updatedCount++
      } else if (newCategory === permission.category) {
        unchangedCount++
      } else {
        console.warn(`  ⚠️  No category mapping for resource: ${permission.resource}`)
      }
    }

    console.log(`\n✅ Updated ${updatedCount} permissions`)
    console.log(`⊙ ${unchangedCount} permissions already correct`)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (error) {
    console.error('\n❌ Failed to update permission categories:', error)
    throw error
  }
}
