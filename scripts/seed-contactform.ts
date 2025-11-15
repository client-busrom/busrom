/**
 * Seed Script - ContactForm Test Data
 *
 * 添加测试用的联系表单数据，用于测试运营人员回复邮件功能
 *
 * Usage: node --loader tsx scripts/seed-contactform.ts
 */

import { PrismaClient } from '../cms/node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting ContactForm seeding...')

  // 获取一个产品作为关联（可选）
  const product = await prisma.product.findFirst({
    where: { sku: { contains: 'GDH' } }
  })

  const testData = [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      whatsapp: '+1-555-0101',
      companyName: 'ABC Manufacturing Inc.',
      message: 'Hello, I am interested in your hydraulic gate hinges for an industrial project. Could you provide more details about load capacity and pricing for bulk orders?',
      source: 'product-page',
      locale: 'en',
      status: 'UNREAD',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      relatedProductId: product?.id,
    },
    {
      name: '李明',
      email: 'liming@company.cn',
      whatsapp: '+86-138-0000-1234',
      companyName: '深圳建筑工程有限公司',
      message: '您好，我们正在寻找优质的门铰链产品用于商业地产项目。请问贵司是否提供定制服务？期待您的回复。',
      source: 'contact-page',
      locale: 'zh',
      status: 'UNREAD',
      ipAddress: '58.20.45.67',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@design-studio.com',
      whatsapp: '+1-555-0202',
      companyName: 'Modern Design Studio',
      message: 'Hi, we are working on a high-end residential project and need premium quality hinges. Do you have samples available? What is the lead time for custom finishes?',
      source: 'product-page',
      locale: 'en',
      status: 'UNREAD',
      ipAddress: '203.45.123.89',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
    {
      name: '王芳',
      email: 'wangfang@hotel.com',
      whatsapp: '+86-139-0000-5678',
      companyName: '星级酒店集团',
      message: '我们酒店集团正在进行装修升级，需要采购一批高质量的门窗五金配件。请提供产品目录和报价单，谢谢！',
      source: 'contact-page',
      locale: 'zh',
      status: 'READ',
      ipAddress: '112.80.248.75',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36',
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@construction.com',
      whatsapp: '+1-555-0303',
      companyName: 'Pacific Construction Group',
      message: 'Good day! We are a general contractor working on multiple commercial projects. Interested in establishing a long-term partnership for hardware supplies. Please contact me to discuss volume pricing.',
      source: 'contact-page',
      locale: 'en',
      status: 'READ',
      ipAddress: '104.28.15.200',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    },
  ]

  for (const data of testData) {
    const submission = await prisma.contactForm.create({
      data,
    })
    console.log(`✅ Created contact form submission: ${submission.name} (${submission.email})`)
  }

  console.log(`\n🎉 Successfully seeded ${testData.length} contact form submissions!`)
  console.log('\n📊 Status breakdown:')
  console.log(`   - UNREAD: 3 submissions`)
  console.log(`   - READ: 2 submissions`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding contact forms:', e)
    await prisma.$disconnect()
    process.exit(1)
  })