/**
 * Reset Navigation Menu Order
 *
 * This script resets the order of navigation menus to logical values:
 * - Top-level menus: ordered by importance
 * - Child menus: ordered within their parent group
 */

import { PrismaClient } from '../node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()

// Define the correct order for top-level menus
const topLevelOrder = [
  'home',           // 1
  'product',        // 2
  'shop',           // 3
  'service',        // 4
  'about-us',       // 5
  'contact-us',     // 6
]

// Define the correct order for child menus (within each parent)
const childOrder: Record<string, string[]> = {
  'product': [
    'product-glass-standoff',
    'product-glass-fence-spigot',
    'product-glass-connected-fitting',
    'product-guardrail-glass-clip',
    'product-bathroom-glass-clip',
    'product-glass-hinge',
    'product-door-handle',
    'product-bathroom-handle',
    'product-sliding-door-kit',
    'product-hidden-hook',
  ],
  'shop': [
    'shop-glass-standoff',
    'shop-glass-fence-spigot',
    'shop-glass-connected-fitting',
    'shop-guardrail-glass-clip',
    'shop-bathroom-glass-clip',
    'shop-glass-hinge',
    'shop-door-handle',
    'shop-bathroom-handle',
    'shop-sliding-door-kit',
    'shop-hidden-hook',
  ],
  'service': [
    'service-overview',
    'one-stop-shop',
    'application',
    'faq',
  ],
  'about-us': [
    'our-story',
    'blog',
    'support',
    'fraud-notice',
    'privacy-policy',
  ],
}

async function resetNavigationOrder() {
  console.log('🔄 Resetting navigation menu order...\n')

  try {
    // 1. Update top-level menus
    console.log('📌 Updating top-level menus:')
    for (let i = 0; i < topLevelOrder.length; i++) {
      const slug = topLevelOrder[i]
      const order = i + 1

      await prisma.navigationMenu.updateMany({
        where: {
          slug: slug,
          parentId: null,
        },
        data: {
          order: order,
        },
      })

      console.log(`   ✓ ${slug}: order = ${order}`)
    }

    console.log('\n📌 Updating child menus:')
    // 2. Update child menus
    for (const [parentSlug, children] of Object.entries(childOrder)) {
      console.log(`\n   Parent: ${parentSlug}`)

      // Get parent ID
      const parent = await prisma.navigationMenu.findFirst({
        where: { slug: parentSlug },
      })

      if (!parent) {
        console.log(`   ⚠️  Parent "${parentSlug}" not found, skipping...`)
        continue
      }

      // Update each child
      for (let i = 0; i < children.length; i++) {
        const childSlug = children[i]
        const order = i + 1

        const result = await prisma.navigationMenu.updateMany({
          where: {
            slug: childSlug,
            parentId: parent.id,
          },
          data: {
            order: order,
          },
        })

        if (result.count > 0) {
          console.log(`   ✓ ${childSlug}: order = ${order}`)
        } else {
          console.log(`   ⚠️  ${childSlug}: not found`)
        }
      }
    }

    console.log('\n✅ Navigation menu order reset successfully!')

    // Show final result
    console.log('\n📋 Final order:')
    const allMenus = await prisma.navigationMenu.findMany({
      orderBy: [
        { parentId: 'asc' },
        { order: 'asc' },
      ],
      include: {
        parent: {
          select: {
            slug: true,
          },
        },
      },
    })

    let currentParent: string | null = null
    for (const menu of allMenus) {
      const parentSlug = menu.parent?.slug || null

      if (parentSlug !== currentParent) {
        currentParent = parentSlug
        console.log(`\n${parentSlug ? `Parent: ${parentSlug}` : 'Top-Level Menus'}`)
      }

      console.log(`   ${menu.order}. ${menu.slug}`)
    }

  } catch (error) {
    console.error('❌ Error resetting navigation order:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetNavigationOrder()
