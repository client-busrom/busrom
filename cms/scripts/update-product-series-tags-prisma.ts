/**
 * Update Product Series MediaTag Chinese Names (Using Prisma)
 *
 * 更新产品系列 MediaTag 的中文名称（使用 Prisma）
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

const productSeriesUpdates = [
  { slug: 'series-glass-standoff', name: { en: 'Glass Standoff', zh: '广告螺丝' } },
  { slug: 'series-glass-connected-fitting', name: { en: 'Glass Connected Fitting', zh: '玻璃栏杆扶手连接件' } },
  { slug: 'series-glass-fence-spigot', name: { en: 'Glass Fence Spigot', zh: '玻璃护栏支架底座' } },
  { slug: 'series-guardrail-glass-clip', name: { en: 'Guardrail Glass Clip', zh: '护栏系列' } },
  { slug: 'series-bathroom-glass-clip', name: { en: 'Bathroom Glass Clip', zh: '浴室系列' } },
  { slug: 'series-glass-hinge', name: { en: 'Glass Hinge', zh: '浴室夹' } },
  { slug: 'series-sliding-door-kit', name: { en: 'Sliding Door Kit', zh: '移门滑轮套装' } },
  { slug: 'series-bathroom-door-handle', name: { en: 'Bathroom & Door Handle', zh: '浴室&大门拉手' } },
  { slug: 'series-hidden-hook', name: { en: 'Hidden Hook', zh: '挂钩' } },
]

async function main() {
  console.log('🔄 更新产品系列 MediaTag 中文名称...\n')

  for (const update of productSeriesUpdates) {
    try {
      // Update the tag
      const result = await prisma.mediaTag.updateMany({
        where: { slug: update.slug },
        data: { name: update.name as any },
      })

      if (result.count > 0) {
        console.log(`✅ ${update.slug}`)
        console.log(`   ${update.name.en} → ${update.name.zh}`)
      } else {
        console.log(`⚠️  未找到标签: ${update.slug}`)
      }
    } catch (error) {
      console.error(`❌ 更新失败: ${update.slug}`, error)
    }
  }

  console.log('\n🎉 更新完成！')

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
