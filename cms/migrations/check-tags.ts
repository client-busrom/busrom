/**
 * Check Media tags
 */

import { PrismaClient } from '.prisma/client'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  const prisma = new PrismaClient()

  console.log('Checking Media tags...\n')

  const medias = await prisma.media.findMany({
    include: {
      tags: true,
      tagsFilter: true,
    },
    take: 5,
  })

  for (const media of medias) {
    console.log(`\n${media.filename}:`)
    console.log(`  tags: ${media.tags.length} tags`)
    console.log(`  tagsFilter: ${media.tagsFilter.length} tags`)
    if (media.tags.length > 0) {
      console.log(`  tag IDs:`, media.tags.map(t => t.id))
    }
  }

  await prisma.$disconnect()
}

main().catch(console.error)
