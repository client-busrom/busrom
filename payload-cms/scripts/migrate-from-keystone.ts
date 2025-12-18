/**
 * Migrate Data from Keystone CMS to Payload CMS
 *
 * This script migrates:
 * 1. MediaCategories
 * 2. MediaTags
 * 3. Categories
 * 4. ProductSeries (basic data, without contentTranslations)
 * 5. NavigationMenus
 * 6. Homepage Globals (BrandAdvantages, ServiceFeatures, etc.)
 *
 * Usage:
 *   npx tsx scripts/migrate-from-keystone.ts
 *
 * Prerequisites:
 *   - Payload CMS dev server running (npm run dev)
 *   - Or run with payload local API
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Seed data path
const SEED_DATA_PATH = path.join(__dirname, '../../cms/scripts/seed-data')

async function main() {
  console.log('🚀 Starting Keystone to Payload migration...\n')

  // Initialize Payload
  const payload = await getPayload({ config })

  try {
    // 1. Migrate Media Categories
    await migrateMediaCategories(payload)

    // 2. Migrate Media Tags
    await migrateMediaTags(payload)

    // 3. Migrate Categories
    await migrateCategories(payload)

    // 4. Migrate Product Series
    await migrateProductSeries(payload)

    // 5. Migrate Navigation Menus
    await migrateNavigationMenus(payload)

    // 6. Migrate Homepage Globals
    await migrateHomepageGlobals(payload)

    console.log('\n🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

/**
 * 1. Migrate Media Categories
 *
 * MediaCategories collection uses:
 * - name: unique text (used as slug/identifier)
 * - displayName: localized text (for UI display)
 *
 * For localized fields, we create with English first, then update with Chinese
 */
async function migrateMediaCategories(payload: any) {
  console.log('📁 Migrating Media Categories...')

  const categories = [
    { displayName: { en: 'White Background', zh: '白底图' }, name: 'white', icon: 'image', order: 1 },
    { displayName: { en: 'Scene Image', zh: '场景图' }, name: 'scene', icon: 'image', order: 2 },
    { displayName: { en: 'Real Photo', zh: '实拍图' }, name: 'real', icon: 'camera', order: 3 },
    { displayName: { en: 'Size Image', zh: '尺寸图' }, name: 'size', icon: 'ruler', order: 4 },
    { displayName: { en: 'General Image', zh: '通用产品图' }, name: 'general', icon: 'package', order: 5 },
    { displayName: { en: 'Combo Image', zh: '组合展示图' }, name: 'combo', icon: 'grid', order: 6 },
    { displayName: { en: 'Multi-style Image', zh: '多款式图' }, name: 'multi-style', icon: 'layers', order: 7 },
    { displayName: { en: 'Showcase Image', zh: '橱窗展示图' }, name: 'showcase', icon: 'presentation', order: 8 },
    { displayName: { en: 'Effect Image', zh: '效果图' }, name: 'effect', icon: 'sparkles', order: 9 },
    { displayName: { en: 'Product Image', zh: '产品主图' }, name: 'product', icon: 'package', order: 10 },
    { displayName: { en: 'Craft Image', zh: '工艺图' }, name: 'craft', icon: 'wrench', order: 11 },
    { displayName: { en: 'Packaging Image', zh: '包装图' }, name: 'packaging', icon: 'box', order: 12 },
    { displayName: { en: 'Color Display', zh: '颜色展示图' }, name: 'color', icon: 'palette', order: 13 },
  ]

  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'media-categories',
      where: { name: { equals: cat.name } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      console.log(`  ⏭️  ${cat.displayName.en} - already exists`)
    } else {
      // Create with English locale
      const created = await payload.create({
        collection: 'media-categories',
        locale: 'en',
        data: {
          name: cat.name,
          displayName: cat.displayName.en,
          icon: cat.icon,
          order: cat.order,
        },
      })
      // Update with Chinese locale
      await payload.update({
        collection: 'media-categories',
        id: created.id,
        locale: 'zh',
        data: {
          displayName: cat.displayName.zh,
        },
      })
      console.log(`  ✓ ${cat.displayName.en}`)
    }
  }
  console.log('✅ Media Categories migrated!\n')
}

/**
 * 2. Migrate Media Tags
 *
 * MediaTags collection uses:
 * - name: plain text (not localized)
 * - type: select (product_series, color, etc.)
 */
async function migrateMediaTags(payload: any) {
  console.log('🏷️  Migrating Media Tags...')

  // Product Series Tags - using English name as identifier
  const productSeries = [
    { name: 'Glass Standoff', type: 'product_series' },
    { name: 'Glass Connected Fitting', type: 'product_series' },
    { name: 'Glass Fence Spigot', type: 'product_series' },
    { name: 'Guardrail Glass Clip', type: 'product_series' },
    { name: 'Bathroom Glass Clip', type: 'product_series' },
    { name: 'Glass Hinge', type: 'product_series' },
    { name: 'Sliding Door Kit', type: 'product_series' },
    { name: 'Bathroom & Door Handle', type: 'product_series' },
    { name: 'Hidden Hook', type: 'product_series' },
  ]

  // Color Tags
  const colors = [
    { name: 'Silver', type: 'color' },
    { name: 'Black', type: 'color' },
    { name: 'Gold', type: 'color' },
    { name: 'Rose Gold', type: 'color' },
    { name: 'Brushed', type: 'color' },
    { name: 'Polished', type: 'color' },
  ]

  const allTags = [...productSeries, ...colors]

  for (const tag of allTags) {
    const existing = await payload.find({
      collection: 'media-tags',
      where: { name: { equals: tag.name } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      console.log(`  ⏭️  ${tag.name} - already exists`)
    } else {
      await payload.create({
        collection: 'media-tags',
        data: {
          name: tag.name,
          type: tag.type,
        },
      })
      console.log(`  ✓ ${tag.name}`)
    }
  }
  console.log('✅ Media Tags migrated!\n')
}

/**
 * 3. Migrate Categories
 *
 * Categories collection uses:
 * - name: localized text
 * - slug: unique text
 * - type: select with uppercase values (PAGE, PRODUCT, BLOG, APPLICATION, FAQ)
 */
async function migrateCategories(payload: any) {
  console.log('📂 Migrating Categories...')

  const categories = [
    { name: { en: 'Door Hardware', zh: '门类五金' }, slug: 'door-hardware', type: 'PRODUCT', order: 1 },
    { name: { en: 'Window Hardware', zh: '窗类五金' }, slug: 'window-hardware', type: 'PRODUCT', order: 2 },
    { name: { en: 'Glass Hardware', zh: '玻璃五金' }, slug: 'glass-hardware', type: 'PRODUCT', order: 3 },
    { name: { en: 'Bathroom Hardware', zh: '浴室五金' }, slug: 'bathroom-hardware', type: 'PRODUCT', order: 4 },
    { name: { en: 'Furniture Hardware', zh: '家具五金' }, slug: 'furniture-hardware', type: 'PRODUCT', order: 5 },
  ]

  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      console.log(`  ⏭️  ${cat.name.en} - already exists`)
    } else {
      // Create with English locale
      const created = await payload.create({
        collection: 'categories',
        locale: 'en',
        data: {
          name: cat.name.en,
          slug: cat.slug,
          type: cat.type,
          order: cat.order,
          status: 'published',
        },
      })
      // Update with Chinese locale
      await payload.update({
        collection: 'categories',
        id: created.id,
        locale: 'zh',
        data: {
          name: cat.name.zh,
        },
      })
      console.log(`  ✓ ${cat.name.en}`)
    }
  }
  console.log('✅ Categories migrated!\n')
}

/**
 * 4. Migrate Product Series
 *
 * ProductSeries has localized fields: name, description
 */
async function migrateProductSeries(payload: any) {
  console.log('📦 Migrating Product Series...')

  const series = [
    { name: { en: 'Glass Standoff', zh: '广告螺丝' }, slug: 'glass-standoff', description: { en: 'Premium glass standoff hardware', zh: '高端广告螺丝五金' }, order: 1 },
    { name: { en: 'Glass Connected Fitting', zh: '玻璃栏杆扶手连接件' }, slug: 'glass-connected-fitting', description: { en: 'Glass railing handrail connectors', zh: '玻璃栏杆扶手连接件' }, order: 2 },
    { name: { en: 'Glass Fence Spigot', zh: '玻璃护栏支架底座' }, slug: 'glass-fence-spigot', description: { en: 'Glass fence spigot base', zh: '玻璃护栏支架底座' }, order: 3 },
    { name: { en: 'Guardrail Glass Clip', zh: '护栏系列' }, slug: 'guardrail-glass-clip', description: { en: 'Guardrail glass clip series', zh: '护栏玻璃夹系列' }, order: 4 },
    { name: { en: 'Bathroom Glass Clip', zh: '浴室系列' }, slug: 'bathroom-glass-clip', description: { en: 'Bathroom glass clip series', zh: '浴室玻璃夹系列' }, order: 5 },
    { name: { en: 'Glass Hinge', zh: '浴室夹' }, slug: 'glass-hinge', description: { en: 'Glass hinge series', zh: '玻璃铰链系列' }, order: 6 },
    { name: { en: 'Sliding Door Kit', zh: '移门滑轮套装' }, slug: 'sliding-door-kit', description: { en: 'Sliding door hardware kit', zh: '移门滑轮套装' }, order: 7 },
    { name: { en: 'Bathroom & Door Handle', zh: '浴室&大门拉手' }, slug: 'bathroom-door-handle', description: { en: 'Bathroom and door handle series', zh: '浴室及大门拉手系列' }, order: 8 },
    { name: { en: 'Hidden Hook', zh: '挂钩' }, slug: 'hidden-hook', description: { en: 'Hidden hook series', zh: '隐藏式挂钩系列' }, order: 9 },
  ]

  for (const s of series) {
    const existing = await payload.find({
      collection: 'product-series',
      where: { slug: { equals: s.slug } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      console.log(`  ⏭️  ${s.name.en} - already exists`)
    } else {
      // Create with English locale
      const created = await payload.create({
        collection: 'product-series',
        locale: 'en',
        data: {
          name: s.name.en,
          slug: s.slug,
          description: s.description.en,
          order: s.order,
          status: 'published',
        },
      })
      // Update with Chinese locale
      await payload.update({
        collection: 'product-series',
        id: created.id,
        locale: 'zh',
        data: {
          name: s.name.zh,
          description: s.description.zh,
        },
      })
      console.log(`  ✓ ${s.name.en}`)
    }
  }
  console.log('✅ Product Series migrated!\n')
}

/**
 * Helper function to create navigation menu with localized name
 */
async function createNavMenu(
  payload: any,
  data: {
    slug: string
    name: { en: string; zh: string }
    type: string
    link?: string
    icon?: string
    order: number
    visible: boolean
    isSystem?: boolean
    parent?: string
  }
) {
  // Create with English locale
  const created = await payload.create({
    collection: 'navigation-menus',
    locale: 'en',
    data: {
      slug: data.slug,
      name: data.name.en,
      type: data.type,
      link: data.link,
      icon: data.icon,
      order: data.order,
      visible: data.visible,
      isSystem: data.isSystem,
      parent: data.parent,
    },
  })
  // Update with Chinese locale
  await payload.update({
    collection: 'navigation-menus',
    id: created.id,
    locale: 'zh',
    data: {
      name: data.name.zh,
    },
  })
  return created
}

/**
 * 5. Migrate Navigation Menus
 *
 * NavigationMenus has localized field: name
 */
async function migrateNavigationMenus(payload: any) {
  console.log('🧭 Migrating Navigation Menus...')

  // Check if navigation menus already exist
  const existingCount = await payload.count({ collection: 'navigation-menus' })

  if (existingCount.totalDocs > 0) {
    console.log(`  ⚠️  ${existingCount.totalDocs} navigation menus exist, skipping...`)
    console.log('✅ Navigation Menus skipped!\n')
    return
  }

  // Product Series Data
  const productSeriesData = [
    { slug: 'glass-standoff', name: { en: 'Glass Standoff', zh: '广告螺丝' } },
    { slug: 'glass-connected-fitting', name: { en: 'Glass Connected Fitting', zh: '玻璃栏杆扶手连接件' } },
    { slug: 'glass-fence-spigot', name: { en: 'Glass Fence Spigot', zh: '玻璃护栏支架底座' } },
    { slug: 'guardrail-glass-clip', name: { en: 'Guardrail Glass Clip', zh: '护栏系列' } },
    { slug: 'bathroom-glass-clip', name: { en: 'Bathroom Glass Clip', zh: '浴室系列' } },
    { slug: 'glass-hinge', name: { en: 'Glass Hinge', zh: '浴室夹' } },
    { slug: 'sliding-door-kit', name: { en: 'Sliding Door Kit', zh: '移门滑轮套装' } },
    { slug: 'bathroom-door-handle', name: { en: 'Bathroom & Door Handle', zh: '浴室&大门拉手' } },
    { slug: 'hidden-hook', name: { en: 'Hidden Hook', zh: '挂钩' } },
  ]

  // 1. Home
  const homeMenu = await createNavMenu(payload, {
    slug: 'home',
    name: { en: 'Home', zh: '首页' },
    type: 'standard',
    link: '/',
    order: 1,
    visible: true,
    isSystem: true,
  })
  console.log(`  ✓ Home: ${homeMenu.id}`)

  // 2. Product
  const productMenu = await createNavMenu(payload, {
    slug: 'product',
    name: { en: 'Product', zh: '产品系列' },
    type: 'product_cards',
    link: '/products',
    order: 2,
    visible: true,
    isSystem: true,
  })
  console.log(`  ✓ Product: ${productMenu.id}`)

  // Create product children
  for (let i = 0; i < productSeriesData.length; i++) {
    const series = productSeriesData[i]
    await createNavMenu(payload, {
      slug: `product-${series.slug}`,
      name: series.name,
      type: 'standard',
      parent: productMenu.id,
      link: `/products/${series.slug}`,
      order: i + 1,
      visible: true,
    })
  }
  console.log(`    → Created ${productSeriesData.length} product children`)

  // 3. Shop
  const shopMenu = await createNavMenu(payload, {
    slug: 'shop',
    name: { en: 'Shop', zh: '商城' },
    type: 'product_cards',
    link: '/shop',
    order: 3,
    visible: true,
    isSystem: true,
  })
  console.log(`  ✓ Shop: ${shopMenu.id}`)

  // Create shop children
  for (let i = 0; i < productSeriesData.length; i++) {
    const series = productSeriesData[i]
    await createNavMenu(payload, {
      slug: `shop-${series.slug}`,
      name: series.name,
      type: 'standard',
      parent: shopMenu.id,
      link: `/shop/${series.slug}`,
      order: i + 1,
      visible: true,
    })
  }
  console.log(`    → Created ${productSeriesData.length} shop children`)

  // 4. Service
  const serviceMenu = await createNavMenu(payload, {
    slug: 'service',
    name: { en: 'Service', zh: '服务' },
    type: 'submenu',
    order: 4,
    visible: true,
    isSystem: true,
  })
  console.log(`  ✓ Service: ${serviceMenu.id}`)

  const serviceChildren = [
    { slug: 'service-overview', name: { en: 'Service Overview', zh: '服务概览' }, icon: 'LayoutDashboard', link: '/service/overview' },
    { slug: 'one-stop-shop', name: { en: 'One-Stop Shop', zh: '一站式服务' }, icon: 'Package', link: '/service/one-stop' },
    { slug: 'oem-odm', name: { en: 'OEM/ODM', zh: 'OEM/ODM定制' }, icon: 'Settings', link: '/service/oem-odm' },
    { slug: 'faq', name: { en: 'FAQ', zh: '常见问题' }, icon: 'HelpCircle', link: '/service/faq' },
    { slug: 'application', name: { en: 'Application', zh: '应用案例' }, icon: 'Lightbulb', link: '/applications' },
  ]

  for (let i = 0; i < serviceChildren.length; i++) {
    const child = serviceChildren[i]
    await createNavMenu(payload, {
      slug: child.slug,
      name: child.name,
      type: 'standard',
      icon: child.icon,
      parent: serviceMenu.id,
      link: child.link,
      order: i + 1,
      visible: true,
    })
  }
  console.log(`    → Created ${serviceChildren.length} service children`)

  // 5. About Us
  const aboutMenu = await createNavMenu(payload, {
    slug: 'about-us',
    name: { en: 'About Us', zh: '关于我们' },
    type: 'submenu',
    order: 5,
    visible: true,
    isSystem: true,
  })
  console.log(`  ✓ About Us: ${aboutMenu.id}`)

  const aboutChildren = [
    { slug: 'our-story', name: { en: 'Our Story', zh: '我们的故事' }, icon: 'BookOpen', link: '/about/story' },
    { slug: 'blog', name: { en: 'Blog', zh: '博客' }, icon: 'FileText', link: '/blog' },
    { slug: 'support', name: { en: 'Support', zh: '技术支持' }, icon: 'Headphones', link: '/support' },
    { slug: 'privacy-policy', name: { en: 'Privacy Policy', zh: '隐私政策' }, icon: 'Shield', link: '/privacy-policy' },
    { slug: 'fraud-notice', name: { en: 'Fraud Notice', zh: '防诈骗声明' }, icon: 'AlertTriangle', link: '/fraud-notice' },
  ]

  for (let i = 0; i < aboutChildren.length; i++) {
    const child = aboutChildren[i]
    await createNavMenu(payload, {
      slug: child.slug,
      name: child.name,
      type: 'standard',
      icon: child.icon,
      parent: aboutMenu.id,
      link: child.link,
      order: i + 1,
      visible: true,
    })
  }
  console.log(`    → Created ${aboutChildren.length} about us children`)

  // 6. Contact Us
  const contactMenu = await createNavMenu(payload, {
    slug: 'contact-us',
    name: { en: 'Contact Us', zh: '联系我们' },
    type: 'standard',
    link: '/contact',
    order: 6,
    visible: true,
    isSystem: true,
  })
  console.log(`  ✓ Contact Us: ${contactMenu.id}`)

  console.log('✅ Navigation Menus migrated!\n')
}

/**
 * 6. Migrate Homepage Globals
 */
async function migrateHomepageGlobals(payload: any) {
  console.log('🏠 Migrating Homepage Globals...')

  // Read seed data files
  const seedFiles = [
    { file: 'brand-advantages-data.json', global: 'brand-advantages' },
    { file: 'service-features-data.json', global: 'service-features' },
    { file: 'quote-steps-data.json', global: 'quote-steps' },
    { file: 'why-choose-busrom-data.json', global: 'why-choose-busrom' },
    { file: 'oem-odm-data.json', global: 'oem-odm' },
    { file: 'brand-analysis-data.json', global: 'brand-analysis' },
    { file: 'brand-value-data.json', global: 'brand-value' },
    { file: 'series-intro-data.json', global: 'series-intro' },
    { file: 'simple-cta-data.json', global: 'simple-cta' },
    { file: 'main-form-data.json', global: 'main-form' },
  ]

  for (const { file, global } of seedFiles) {
    try {
      const filePath = path.join(SEED_DATA_PATH, file)
      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  ${file} not found, skipping...`)
        continue
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

      // Transform status from PUBLISHED to published
      if (data.status === 'PUBLISHED') {
        data.status = 'published'
      }

      await payload.updateGlobal({
        slug: global,
        data,
      })
      console.log(`  ✓ ${global}`)
    } catch (error: any) {
      console.log(`  ⚠️  ${global} - ${error.message}`)
    }
  }

  console.log('✅ Homepage Globals migrated!\n')
}

// Run migration
main()
