/**
 * Check MinIO Files
 *
 * 检查 MinIO 中的文件
 */

import { PrismaClient } from '.prisma/client'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const prisma = new PrismaClient()

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: 'http://localhost:9000',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin123',
  },
  forcePathStyle: true,
})

const bucketName = 'busrom-media'

async function checkFileExists(fileKey: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    }))
    return true
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return false
    }
    throw error
  }
}

async function main() {
  console.log('🔍 检查新导入图片在 MinIO 中是否存在...\n')

  // 检查几个新导入的文件
  const testFiles = [
    '01-standoff-square-001.jpg',
    '01-standoff-square-022.jpg',
    '01-standoff-group01-common-001.jpg',
    '01-standoff-group01-scene01-001.jpg',
    '01-standoff-group02-scene01-001.jpg',
  ]

  console.log('📋 测试文件:\n')

  for (const filename of testFiles) {
    const media = await prisma.media.findFirst({
      where: { filename },
      select: { fileKey: true }
    })

    if (!media) {
      console.log(`❌ ${filename} - 数据库中未找到`)
      continue
    }

    if (!media.fileKey) {
      console.log(`❌ ${filename} - 没有 fileKey`)
      continue
    }

    const exists = await checkFileExists(media.fileKey)

    if (exists) {
      console.log(`✅ ${filename}`)
      console.log(`   fileKey: ${media.fileKey}`)
      console.log(`   MinIO: 文件存在`)
    } else {
      console.log(`❌ ${filename}`)
      console.log(`   fileKey: ${media.fileKey}`)
      console.log(`   MinIO: 文件不存在`)
    }
    console.log()
  }

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
