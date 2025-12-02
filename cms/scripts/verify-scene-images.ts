/**
 * Verify Scene Images Setup
 *
 * 验证场景图设置
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('✅ 验证场景图设置...\n')

  // 获取标签和分类
  const standoffTag = await prisma.mediaTag.findFirst({
    where: { slug: 'series-glass-standoff' }
  })

  const sceneCategory = await prisma.mediaCategory.findFirst({
    where: { slug: 'scene-image' }
  })

  if (!standoffTag || !sceneCategory) {
    console.log('❌ 缺少必要的标签或分类')
    return
  }

  // 查询：广告螺丝 + 场景图分类
  const count = await prisma.media.count({
    where: {
      AND: [
        { tags: { some: { id: standoffTag.id } } },
        { primaryCategoryId: sceneCategory.id }
      ]
    }
  })

  console.log('📊 筛选条件: 广告螺丝 + 场景图分类')
  console.log(`   标签: ${standoffTag.slug} (${standoffTag.id})`)
  console.log(`   分类: ${sceneCategory.slug} (${sceneCategory.id})`)
  console.log(`\n✅ 结果: ${count} 张场景图`)

  if (count === 146) {
    console.log('\n🎉 完美！所有146张场景图都有正确的标签和分类！')
  } else {
    console.log(`\n⚠️  预期146张，实际${count}张`)
  }

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
