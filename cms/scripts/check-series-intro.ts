/**
 * Check Series Intro Data
 *
 * 检查 Series Intro 数据
 */

import { PrismaClient } from '.prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 检查 SeriesIntro 数据...\n')

  const seriesIntros = await prisma.seriesIntro.findMany({
    select: {
      id: true,
      internalLabel: true,
      title: true,
      description: true,
      images: true,
      status: true,
      productSeries: {
        select: {
          id: true,
          slug: true,
        }
      }
    },
    orderBy: {
      updatedAt: 'asc'
    }
  })

  console.log(`📊 找到 ${seriesIntros.length} 个 SeriesIntro:\n`)

  for (const intro of seriesIntros) {
    console.log(`\n📝 ${intro.internalLabel}`)
    console.log(`   ID: ${intro.id}`)
    console.log(`   Status: ${intro.status}`)
    console.log(`   Product Series: ${intro.productSeries?.slug || 'None'}`)
    console.log(`   Title: ${JSON.stringify(intro.title)}`)
    console.log(`   Description: ${JSON.stringify(intro.description)}`)

    const imagesData = intro.images as any
    if (imagesData) {
      console.log(`   Images Data:`)
      console.log(`     - tags: ${imagesData.tags?.length || 0}`)
      console.log(`     - category: ${imagesData.category || 'None'}`)
      console.log(`     - images: ${imagesData.images?.length || 0}`)

      if (imagesData.images?.length > 0) {
        console.log(`     First 3 image IDs:`)
        imagesData.images.slice(0, 3).forEach((id: string, idx: number) => {
          console.log(`       ${idx + 1}. ${id}`)
        })
      } else {
        console.log(`     ⚠️  No images!`)
      }
    } else {
      console.log(`   ❌ No images data!`)
    }
  }

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
