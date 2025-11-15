/**
 * Seed Navigation System - Initial Data Migration
 *
 * 导航系统初始化数据迁移
 *
 * This script creates:
 * 1. Navigation Menu items with hierarchical structure
 * 2. Links menu items with MediaTags for random image selection
 *
 * Menu Structure:
 * - Home
 * - Product（产品系列）- 10个子菜单
 * - Shop（产品）- 10个子菜单
 * - Service - 4个子菜单
 * - About Us - 5个子菜单
 * - Contact Us
 *
 * Usage:
 * This will be automatically executed via keystone.ts onConnect hook.
 */

import type { Context } from '.keystone/types'

/**
 * Main Seed Function
 *
 * 主种子函数
 */
export async function seedNavigationSystem(context: Context) {
  console.log('🌱 开始初始化导航系统...')
  console.log('🌱 Starting Navigation System Initialization...\n')

  try {
    // Create Navigation Menu
    console.log('🧭 创建导航菜单...')
    console.log('🧭 Creating Navigation Menu...')
    await createNavigationMenus(context)
    console.log('✅ 导航菜单创建完成！')
    console.log('✅ Navigation Menu Created!\n')

    console.log('🎉 导航系统初始化完成！')
    console.log('🎉 Navigation System Initialization Complete!')
    console.log('\n📊 Summary:')
    console.log('   - Navigation Menu: 6 top-level items')
    console.log('   - Product children: 10 series')
    console.log('   - Shop children: 10 series')
    console.log('   - Service children: 4 items')
    console.log('   - About Us children: 5 items')
  } catch (error) {
    console.error('❌ 初始化失败:', error)
    console.error('❌ Initialization Failed:', error)
    throw error
  }
}

/**
 * Create Navigation Menu Items
 *
 * 创建导航菜单项
 */
async function createNavigationMenus(context: Context) {
  // Check if navigation menus already exist
  const existingCount = await context.query.NavigationMenu.count({})

  if (existingCount > 0) {
    console.log(`  ⚠️  已存在 ${existingCount} 个导航菜单，跳过创建`)
    console.log(`  ⚠️  ${existingCount} navigation menus exist, skipping...`)
    return
  }

  // Get MediaTags for product series (for PRODUCT_CARDS type)
  const productSeriesTags = await context.query.MediaTag.findMany({
    where: { type: { equals: 'PRODUCT_SERIES' } },
    query: 'id slug',
    orderBy: { order: 'asc' },
  })

  console.log(`  → Found ${productSeriesTags.length} product series tags`)

  // Product Series Data (10 series)
  const productSeriesData = [
    { slug: 'glass-standoff', name: { en: 'Glass Standoff', zh: '广告螺丝' } },
    { slug: 'glass-connected-fitting', name: { en: 'Glass Connected Fitting', zh: '玻璃栏杆扶手连接件' } },
    { slug: 'glass-fence-spigot', name: { en: 'Glass Fence Spigot', zh: '玻璃护栏支架底座' } },
    { slug: 'guardrail-glass-clip', name: { en: 'Guardrail Glass Clip', zh: '护栏系列' } },
    { slug: 'bathroom-glass-clip', name: { en: 'Bathroom Glass Clip', zh: '浴室系列' } },
    { slug: 'glass-hinge', name: { en: 'Glass Hinge', zh: '浴室夹' } },
    { slug: 'sliding-door-kit', name: { en: 'Sliding Door Kit', zh: '移门滑轮套装' } },
    { slug: 'bathroom-handle', name: { en: 'Bathroom Handle', zh: '浴室&大门拉手' } },
    { slug: 'door-handle', name: { en: 'Door Handle', zh: '大门拉手' } },
    { slug: 'hidden-hook', name: { en: 'Hidden Hook', zh: '挂钩' } },
  ]

  // ============================================================================
  // 1. Home
  // ============================================================================

  const homeMenu = await context.query.NavigationMenu.createOne({
    data: {
      slug: 'home',
      name: { en: 'Home', zh: '首页' },
      type: 'STANDARD',
      link: '/',
      order: 1,
      visible: true,
      isSystem: true,
    },
    query: 'id slug',
  })
  console.log(`  ✓ Home: ${homeMenu.id}`)

  // ============================================================================
  // 2. Product（产品系列）- PRODUCT_CARDS with 10 children
  // ============================================================================

  const productMenu = await context.query.NavigationMenu.createOne({
    data: {
      slug: 'product',
      name: { en: 'Product', zh: '产品系列' },
      type: 'PRODUCT_CARDS',
      link: '/products',
      order: 2,
      visible: true,
      isSystem: true,
    },
    query: 'id slug',
  })
  console.log(`  ✓ Product Menu: ${productMenu.id}`)

  // Create product series children (display controlled by parent's PRODUCT_CARDS type)
  for (let i = 0; i < productSeriesData.length; i++) {
    const series = productSeriesData[i]
    const matchingTag = productSeriesTags.find((tag: any) => tag.slug === series.slug)

    await context.query.NavigationMenu.createOne({
      data: {
        slug: `product-${series.slug}`,
        name: series.name,
        type: 'STANDARD', // Child items use STANDARD, display controlled by parent
        parent: { connect: { id: productMenu.id } },
        link: `/products/${series.slug}`,
        mediaTags: matchingTag ? { connect: [{ id: matchingTag.id }] } : undefined,
        order: i + 1,
        visible: true,
      },
      query: 'id slug',
    })
  }
  console.log(`    → Created ${productSeriesData.length} product series children`)

  // ============================================================================
  // 3. Shop（产品/SKU）- PRODUCT_CARDS with 10 children
  // ============================================================================

  const shopMenu = await context.query.NavigationMenu.createOne({
    data: {
      slug: 'shop',
      name: { en: 'Shop', zh: '商城' },
      type: 'PRODUCT_CARDS',
      link: '/shop',
      order: 3,
      visible: true,
      isSystem: true,
    },
    query: 'id slug',
  })
  console.log(`  ✓ Shop Menu: ${shopMenu.id}`)

  // Create shop series children (display controlled by parent's PRODUCT_CARDS type)
  for (let i = 0; i < productSeriesData.length; i++) {
    const series = productSeriesData[i]
    const matchingTag = productSeriesTags.find((tag: any) => tag.slug === series.slug)

    await context.query.NavigationMenu.createOne({
      data: {
        slug: `shop-${series.slug}`,
        name: series.name,
        type: 'STANDARD', // Child items use STANDARD, display controlled by parent
        parent: { connect: { id: shopMenu.id } },
        link: `/shop/${series.slug}`,
        mediaTags: matchingTag ? { connect: [{ id: matchingTag.id }] } : undefined,
        order: i + 1,
        visible: true,
      },
      query: 'id slug',
    })
  }
  console.log(`    → Created ${productSeriesData.length} shop series children`)

  // ============================================================================
  // 4. Service - SUBMENU with 4 children
  // ============================================================================

  const serviceMenu = await context.query.NavigationMenu.createOne({
    data: {
      slug: 'service',
      name: { en: 'Service', zh: '服务' },
      type: 'SUBMENU',
      order: 4,
      visible: true,
      isSystem: true,
    },
    query: 'id slug',
  })
  console.log(`  ✓ Service Menu: ${serviceMenu.id}`)

  const serviceChildren = [
    {
      slug: 'service-overview',
      name: { en: 'Service Overview', zh: '服务概览' },
      icon: 'LayoutDashboard',
      link: '/service/overview'
    },
    {
      slug: 'one-stop-shop',
      name: { en: 'One-Stop Shop', zh: '一站式服务' },
      icon: 'Package',
      link: '/service/one-stop'
    },
    {
      slug: 'oem-odm',
      name: { en: 'OEM/ODM', zh: 'OEM/ODM定制' },
      icon: 'Settings',
      link: '/service/oem-odm'
    },
    {
      slug: 'faq',
      name: { en: 'FAQ', zh: '常见问题' },
      icon: 'HelpCircle',
      link: '/service/faq'
    },
    {
      slug: 'application',
      name: { en: 'Application', zh: '应用案例' },
      icon: 'Lightbulb',
      link: '/applications'
    },
  ]

  for (let i = 0; i < serviceChildren.length; i++) {
    const child = serviceChildren[i]
    await context.query.NavigationMenu.createOne({
      data: {
        slug: child.slug,
        name: child.name,
        type: 'STANDARD', // Child items use STANDARD, display controlled by parent
        icon: child.icon,
        parent: { connect: { id: serviceMenu.id } },
        link: child.link,
        order: i + 1,
        visible: true,
      },
      query: 'id slug',
    })
  }
  console.log(`    → Created ${serviceChildren.length} service children`)

  // ============================================================================
  // 5. About Us - SUBMENU with 5 children
  // ============================================================================

  const aboutMenu = await context.query.NavigationMenu.createOne({
    data: {
      slug: 'about-us',
      name: { en: 'About Us', zh: '关于我们' },
      type: 'SUBMENU',
      order: 5,
      visible: true,
      isSystem: true,
    },
    query: 'id slug',
  })
  console.log(`  ✓ About Us Menu: ${aboutMenu.id}`)

  const aboutChildren = [
    {
      slug: 'our-story',
      name: { en: 'Our Story', zh: '我们的故事' },
      icon: 'BookOpen',
      link: '/about/story'
    },
    {
      slug: 'blog',
      name: { en: 'Blog', zh: '博客' },
      icon: 'FileText',
      link: '/blog'
    },
    {
      slug: 'support',
      name: { en: 'Support', zh: '技术支持' },
      icon: 'Headphones',
      link: '/support'
    },
    {
      slug: 'privacy-policy',
      name: { en: 'Privacy Policy', zh: '隐私政策' },
      icon: 'Shield',
      link: '/privacy-policy'
    },
    {
      slug: 'fraud-notice',
      name: { en: 'Fraud Notice', zh: '防诈骗声明' },
      icon: 'AlertTriangle',
      link: '/fraud-notice'
    },
  ]

  for (let i = 0; i < aboutChildren.length; i++) {
    const child = aboutChildren[i]
    await context.query.NavigationMenu.createOne({
      data: {
        slug: child.slug,
        name: child.name,
        type: 'STANDARD', // Child items use STANDARD, display controlled by parent
        icon: child.icon,
        parent: { connect: { id: aboutMenu.id } },
        link: child.link,
        order: i + 1,
        visible: true,
      },
      query: 'id slug',
    })
  }
  console.log(`    → Created ${aboutChildren.length} about us children`)

  // ============================================================================
  // 6. Contact Us
  // ============================================================================

  const contactMenu = await context.query.NavigationMenu.createOne({
    data: {
      slug: 'contact-us',
      name: { en: 'Contact Us', zh: '联系我们' },
      type: 'STANDARD',
      link: '/contact',
      order: 6,
      visible: true,
      isSystem: true,
    },
    query: 'id slug',
  })
  console.log(`  ✓ Contact Us: ${contactMenu.id}`)
}
