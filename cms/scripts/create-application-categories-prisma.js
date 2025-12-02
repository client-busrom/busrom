/**
 * Create APPLICATION Categories using Prisma
 *
 * Usage:
 *   cd cms && node scripts/create-application-categories-prisma.js
 */

const { PrismaClient } = require('../node_modules/.prisma/client')

const prisma = new PrismaClient()

const categories = [
  {
    name: {"en": "Glass Standoff", "zh": "广告螺丝"},
    slug: "application-glass-standoff",
    type: "APPLICATION",
    order: 1,
    status: "PUBLISHED"
  },
  {
    name: {"en": "Glass Connected Fitting", "zh": "玻璃栏杆扶手连接件"},
    slug: "application-glass-connected-fitting",
    type: "APPLICATION",
    order: 2,
    status: "PUBLISHED"
  },
  {
    name: {"en": "Glass Fence Spigot", "zh": "玻璃护栏支架底座"},
    slug: "application-glass-fence-spigot",
    type: "APPLICATION",
    order: 3,
    status: "PUBLISHED"
  },
  {
    name: {"en": "Guardrail Glass Clip", "zh": "护栏系列"},
    slug: "application-guardrail-glass-clip",
    type: "APPLICATION",
    order: 4,
    status: "PUBLISHED"
  },
  {
    name: {"en": "Bathroom Glass Clip", "zh": "浴室系列"},
    slug: "application-bathroom-glass-clip",
    type: "APPLICATION",
    order: 5,
    status: "PUBLISHED"
  },
  {
    name: {"en": "Glass Hinge", "zh": "浴室夹"},
    slug: "application-glass-hinge",
    type: "APPLICATION",
    order: 6,
    status: "PUBLISHED"
  },
  {
    name: {"en": "Sliding Door Kit", "zh": "移门滑轮套装"},
    slug: "application-sliding-door-kit",
    type: "APPLICATION",
    order: 7,
    status: "PUBLISHED"
  },
  {
    name: {"en": "Bathroom Handle", "zh": "浴室&大门拉手"},
    slug: "application-bathroom-handle",
    type: "APPLICATION",
    order: 8,
    status: "PUBLISHED"
  },
  {
    name: {"en": "Door Handle", "zh": "大门拉手"},
    slug: "application-door-handle",
    type: "APPLICATION",
    order: 9,
    status: "PUBLISHED"
  },
  {
    name: {"en": "Hidden Hook", "zh": "挂钩"},
    slug: "application-hidden-hook",
    type: "APPLICATION",
    order: 10,
    status: "PUBLISHED"
  }
]

async function main() {
  console.log('🚀 Creating APPLICATION Categories using Prisma\n')

  let created = 0

  for (const category of categories) {
    try {
      const result = await prisma.category.create({
        data: category
      })
      created++
      console.log(`  ✅ ${created}/10: ${category.name.en} (${result.id})`)
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`  ⚠️  ${category.name.en} already exists (slug: ${category.slug})`)
      } else {
        console.error(`  ❌ Failed to create ${category.name.en}:`, error.message)
      }
    }
  }

  console.log(`\n✅ Created ${created} APPLICATION categories!`)
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
