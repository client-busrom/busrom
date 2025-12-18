/**
 * 批量生成测试页面
 * 用于测试 LinkJump 的链接选择功能
 */

import payload from 'payload'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '../payload.config.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const categories = ['关于我们', '产品介绍', '新闻资讯', '技术支持', '联系我们']
const subcategories = ['概览', '详情', '案例', '指南', 'FAQ']

async function generateTestPages() {
  console.log('开始初始化 Payload...')

  const config = await configPromise

  await payload.init({
    config,
    secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
    local: true,
  })

  console.log('开始生成测试页面...')

  let successCount = 0

  // 生成 50 个测试页面
  for (let i = 1; i <= 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const subcategory = subcategories[Math.floor(Math.random() * subcategories.length)]

    const title = `${category} - ${subcategory} ${i}`
    const slug = `test-page-${i}`

    try {
      await payload.create({
        collection: 'pages',
        data: {
          title,
          slug,
          path: `/${slug}`,
          status: 'published',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: `这是测试页面 ${i} 的内容。`,
                    },
                  ],
                },
              ],
            },
          },
        },
      })

      successCount++
      if (i % 10 === 0) {
        console.log(`进度: ${i}/50 页面已创建`)
      }
    } catch (error: any) {
      console.error(`创建页面 ${i} 失败:`, error.message)
    }
  }

  console.log(`\n✅ 成功创建 ${successCount} 个测试页面`)
  process.exit(0)
}

generateTestPages().catch((error) => {
  console.error('脚本执行失败:', error)
  process.exit(1)
})
