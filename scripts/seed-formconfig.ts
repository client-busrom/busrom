/**
 * Seed Script - FormConfig Test Data
 *
 * 创建多个表单配置用于测试
 * 数据结构类似 Product.specifications (多语言分开)
 *
 * Usage: npm run seed:formconfig
 */

import { PrismaClient } from '../cms/node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting FormConfig seeding...')

  const formConfigs = [
    // 1. 通用联系表单 - 用于 Footer
    {
      name: 'general-contact-form',
      displayName: {
        en: 'General Contact Form',
        zh: '通用联系表单',
      },
      description: {
        en: 'General contact form for footer or contact pages',
        zh: '通用联系表单，适用于页脚或联系页面',
      },
      location: 'FOOTER',
      fields: {
        en: [
          {
            fieldName: 'name',
            fieldType: 'text',
            label: 'Your Name',
            placeholder: 'Enter your name',
            required: true,
            order: 1,
          },
          {
            fieldName: 'email',
            fieldType: 'email',
            label: 'Email Address',
            placeholder: 'your.email@example.com',
            required: true,
            order: 2,
          },
          {
            fieldName: 'whatsapp',
            fieldType: 'text',
            label: 'WhatsApp',
            placeholder: '+1-555-0000',
            required: false,
            order: 3,
          },
          {
            fieldName: 'message',
            fieldType: 'textarea',
            label: 'Message',
            placeholder: 'How can we help you?',
            required: true,
            order: 4,
          },
        ],
        zh: [
          {
            fieldName: 'name',
            fieldType: 'text',
            label: '您的姓名',
            placeholder: '请输入您的姓名',
            required: true,
            order: 1,
          },
          {
            fieldName: 'email',
            fieldType: 'email',
            label: '电子邮箱',
            placeholder: 'your.email@example.com',
            required: true,
            order: 2,
          },
          {
            fieldName: 'whatsapp',
            fieldType: 'text',
            label: 'WhatsApp',
            placeholder: '+86-138-0000-0000',
            required: false,
            order: 3,
          },
          {
            fieldName: 'message',
            fieldType: 'textarea',
            label: '留言',
            placeholder: '我们如何帮助您？',
            required: true,
            order: 4,
          },
        ],
      },
      submitButtonText: {
        en: 'Submit',
        zh: '提交',
      },
      successMessage: {
        en: 'Thank you! Your message has been sent successfully.',
        zh: '感谢您！您的消息已成功发送。',
      },
      errorMessage: {
        en: 'Something went wrong. Please try again.',
        zh: '出错了，请重试。',
      },
      enableEmailNotification: true,
      status: 'PUBLISHED',
    },

    // 2. 产品咨询表单 - 用于产品详情页
    {
      name: 'product-inquiry-form',
      displayName: {
        en: 'Product Inquiry Form',
        zh: '产品咨询表单',
      },
      description: {
        en: 'Product inquiry form for product detail pages',
        zh: '产品咨询表单，用于产品详情页面',
      },
      location: 'CUSTOM',
      fields: {
        en: [
          {
            fieldName: 'name',
            fieldType: 'text',
            label: 'Your Name',
            placeholder: 'Enter your name',
            required: true,
            order: 1,
          },
          {
            fieldName: 'companyName',
            fieldType: 'text',
            label: 'Company Name',
            placeholder: 'Your company name',
            required: false,
            order: 2,
          },
          {
            fieldName: 'email',
            fieldType: 'email',
            label: 'Email Address',
            placeholder: 'your.email@example.com',
            required: true,
            order: 3,
          },
          {
            fieldName: 'whatsapp',
            fieldType: 'text',
            label: 'WhatsApp',
            placeholder: '+1-555-0000',
            required: false,
            order: 4,
          },
          {
            fieldName: 'message',
            fieldType: 'textarea',
            label: 'Your Inquiry',
            placeholder: 'Tell us about your requirements...',
            required: true,
            order: 5,
          },
        ],
        zh: [
          {
            fieldName: 'name',
            fieldType: 'text',
            label: '您的姓名',
            placeholder: '请输入您的姓名',
            required: true,
            order: 1,
          },
          {
            fieldName: 'companyName',
            fieldType: 'text',
            label: '公司名称',
            placeholder: '您的公司名称',
            required: false,
            order: 2,
          },
          {
            fieldName: 'email',
            fieldType: 'email',
            label: '电子邮箱',
            placeholder: 'your.email@example.com',
            required: true,
            order: 3,
          },
          {
            fieldName: 'whatsapp',
            fieldType: 'text',
            label: 'WhatsApp',
            placeholder: '+86-138-0000-0000',
            required: false,
            order: 4,
          },
          {
            fieldName: 'message',
            fieldType: 'textarea',
            label: '您的咨询',
            placeholder: '告诉我们您的需求...',
            required: true,
            order: 5,
          },
        ],
      },
      submitButtonText: {
        en: 'Send Inquiry',
        zh: '发送咨询',
      },
      successMessage: {
        en: 'Thank you for your inquiry! We will get back to you soon.',
        zh: '感谢您的咨询！我们会尽快回复您。',
      },
      errorMessage: {
        en: 'Failed to send inquiry. Please try again.',
        zh: '发送咨询失败，请重试。',
      },
      enableEmailNotification: true,
      status: 'PUBLISHED',
    },

    // 3. 简单订阅表单 - 用于 Home 页面
    {
      name: 'newsletter-subscription',
      displayName: {
        en: 'Newsletter Subscription',
        zh: '邮件订阅',
      },
      description: {
        en: 'Simple newsletter subscription form for home page or blog',
        zh: '简单的邮件订阅表单，用于首页或博客',
      },
      location: 'HOME_MAIN',
      fields: {
        en: [
          {
            fieldName: 'name',
            fieldType: 'text',
            label: 'Name',
            placeholder: 'Your name',
            required: true,
            order: 1,
          },
          {
            fieldName: 'email',
            fieldType: 'email',
            label: 'Email',
            placeholder: 'your.email@example.com',
            required: true,
            order: 2,
          },
        ],
        zh: [
          {
            fieldName: 'name',
            fieldType: 'text',
            label: '姓名',
            placeholder: '您的姓名',
            required: true,
            order: 1,
          },
          {
            fieldName: 'email',
            fieldType: 'email',
            label: '邮箱',
            placeholder: 'your.email@example.com',
            required: true,
            order: 2,
          },
        ],
      },
      submitButtonText: {
        en: 'Subscribe',
        zh: '订阅',
      },
      successMessage: {
        en: 'Thank you for subscribing!',
        zh: '感谢订阅！',
      },
      errorMessage: {
        en: 'Subscription failed. Please try again.',
        zh: '订阅失败，请重试。',
      },
      enableEmailNotification: true,
      status: 'PUBLISHED',
    },

    // 4. 完整询价表单 - 用于 Content Translations
    {
      name: 'complete-quote-request',
      displayName: {
        en: 'Complete Quote Request',
        zh: '完整询价表单',
      },
      description: {
        en: 'Complete quote request form with company information',
        zh: '完整的询价表单，包含公司信息',
      },
      location: 'CUSTOM',
      fields: {
        en: [
          {
            fieldName: 'name',
            fieldType: 'text',
            label: 'Contact Person',
            placeholder: 'Your name',
            required: true,
            order: 1,
          },
          {
            fieldName: 'companyName',
            fieldType: 'text',
            label: 'Company Name',
            placeholder: 'Your company',
            required: true,
            order: 2,
          },
          {
            fieldName: 'email',
            fieldType: 'email',
            label: 'Business Email',
            placeholder: 'business@company.com',
            required: true,
            order: 3,
          },
          {
            fieldName: 'whatsapp',
            fieldType: 'text',
            label: 'WhatsApp / Phone',
            placeholder: '+1-555-0000',
            required: true,
            order: 4,
          },
          {
            fieldName: 'message',
            fieldType: 'textarea',
            label: 'Quote Requirements',
            placeholder: 'Please describe your requirements, quantity, specifications, etc.',
            required: true,
            order: 5,
          },
        ],
        zh: [
          {
            fieldName: 'name',
            fieldType: 'text',
            label: '联系人',
            placeholder: '您的姓名',
            required: true,
            order: 1,
          },
          {
            fieldName: 'companyName',
            fieldType: 'text',
            label: '公司名称',
            placeholder: '您的公司',
            required: true,
            order: 2,
          },
          {
            fieldName: 'email',
            fieldType: 'email',
            label: '企业邮箱',
            placeholder: 'business@company.com',
            required: true,
            order: 3,
          },
          {
            fieldName: 'whatsapp',
            fieldType: 'text',
            label: 'WhatsApp / 电话',
            placeholder: '+86-138-0000-0000',
            required: true,
            order: 4,
          },
          {
            fieldName: 'message',
            fieldType: 'textarea',
            label: '询价需求',
            placeholder: '请描述您的需求、数量、规格等',
            required: true,
            order: 5,
          },
        ],
      },
      submitButtonText: {
        en: 'Request Quote',
        zh: '请求报价',
      },
      successMessage: {
        en: 'Thank you! We will send you a quote soon.',
        zh: '感谢您！我们会尽快向您发送报价。',
      },
      errorMessage: {
        en: 'Failed to send request. Please try again.',
        zh: '发送请求失败，请重试。',
      },
      enableEmailNotification: true,
      status: 'PUBLISHED',
    },

    // 5. 快速联系表单 - 简化版
    {
      name: 'quick-contact-form',
      displayName: {
        en: 'Quick Contact Form',
        zh: '快速联系表单',
      },
      description: {
        en: 'Quick contact form with only essential fields',
        zh: '快速联系表单，只包含必要信息',
      },
      location: 'QUICK_INQUIRY',
      fields: {
        en: [
          {
            fieldName: 'name',
            fieldType: 'text',
            label: 'Name',
            placeholder: 'Your name',
            required: true,
            order: 1,
          },
          {
            fieldName: 'email',
            fieldType: 'email',
            label: 'Email',
            placeholder: 'your.email@example.com',
            required: true,
            order: 2,
          },
          {
            fieldName: 'message',
            fieldType: 'textarea',
            label: 'Message',
            placeholder: 'Your message...',
            required: true,
            order: 3,
          },
        ],
        zh: [
          {
            fieldName: 'name',
            fieldType: 'text',
            label: '姓名',
            placeholder: '您的姓名',
            required: true,
            order: 1,
          },
          {
            fieldName: 'email',
            fieldType: 'email',
            label: '邮箱',
            placeholder: 'your.email@example.com',
            required: true,
            order: 2,
          },
          {
            fieldName: 'message',
            fieldType: 'textarea',
            label: '留言',
            placeholder: '您的留言...',
            required: true,
            order: 3,
          },
        ],
      },
      submitButtonText: {
        en: 'Send',
        zh: '发送',
      },
      successMessage: {
        en: 'Message sent successfully!',
        zh: '消息发送成功！',
      },
      errorMessage: {
        en: 'Failed to send message.',
        zh: '消息发送失败。',
      },
      enableEmailNotification: true,
      status: 'PUBLISHED',
    },
  ]

  // Delete old data first
  await prisma.formConfig.deleteMany({})
  console.log('🗑️  Cleared existing FormConfig data')

  for (const config of formConfigs) {
    try {
      const formConfig = await prisma.formConfig.create({
        data: config,
      })
      const enFieldsCount = config.fields.en?.length || 0
      console.log(`✅ Created FormConfig: ${config.name} (${enFieldsCount} fields)`)
    } catch (error: any) {
      console.error(`❌ Failed to create ${config.name}:`, error.message)
    }
  }

  console.log(`\n🎉 Successfully seeded FormConfig data!`)
  console.log('\n📊 Created forms:')
  console.log('   1. general-contact-form (4 fields) - 用于 Footer')
  console.log('   2. product-inquiry-form (5 fields) - 用于产品详情页')
  console.log('   3. newsletter-subscription (2 fields) - 用于 Home 页面')
  console.log('   4. complete-quote-request (5 fields) - 用于 Content Translations')
  console.log('   5. quick-contact-form (3 fields) - 简化版联系表单')
  console.log('\n💡 数据结构类似 Product.specifications (多语言分开):')
  console.log('   fields: { en: [...], zh: [...] }')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding FormConfig:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
