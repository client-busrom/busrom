/**
 * Create Application Items with Content Translations
 *
 * This script creates sample Application items for each APPLICATION category
 * with proper content translations in EN and ZH.
 *
 * Usage:
 *   node scripts/create-applications.js
 */

const fetch = require('node-fetch')

const KEYSTONE_URL = process.env.KEYSTONE_URL || 'http://localhost:3000'

async function graphqlRequest(query, variables = {}) {
  try {
    const response = await fetch(`${KEYSTONE_URL}/api/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
    const json = await response.json()
    if (json.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(json.errors, null, 2)}`)
    }
    return json.data
  } catch (error) {
    console.error('❌ GraphQL Request Failed:', error.message)
    throw error
  }
}

async function getPlaceholderMedia() {
  const query = `
    query {
      mediaFiles(take: 1) {
        id
        filename
      }
    }
  `
  const data = await graphqlRequest(query)
  if (!data.mediaFiles || data.mediaFiles.length === 0) {
    throw new Error('No media found! Please upload at least one media file first.')
  }
  return data.mediaFiles[0]
}

async function getApplicationCategories() {
  const query = `
    query {
      categories(where: { type: { equals: "APPLICATION" } }, orderBy: { order: asc }) {
        id
        slug
        name
      }
    }
  `
  const data = await graphqlRequest(query)
  return data.categories || []
}

// Sample content for each category
const applicationData = {
  'application-glass-standoff': {
    en: {
      name: 'Modern Office Glass Wall Installation',
      shortDescription: 'Premium glass standoff system for corporate office environment',
      description: 'A sophisticated glass wall installation featuring our premium standoff systems, creating an open and modern workspace.',
      content: [
        { type: 'heading', children: [{ text: 'Project Overview' }] },
        { type: 'paragraph', children: [{ text: 'This project showcases the installation of a stunning glass wall system in a modern corporate office. Using our premium glass standoff hardware, we created a seamless partition that maintains visual connectivity while providing acoustic separation.' }] },
        { type: 'heading', children: [{ text: 'Technical Details' }] },
        { type: 'paragraph', children: [{ text: 'Materials: 12mm tempered glass panels' }] },
        { type: 'paragraph', children: [{ text: 'Hardware: Stainless steel standoffs with satin finish' }] },
        { type: 'paragraph', children: [{ text: 'Dimensions: 3m height x 8m length' }] },
        { type: 'heading', children: [{ text: 'Key Features' }] },
        { type: 'paragraph', children: [{ text: '• Clean, minimalist aesthetic' }] },
        { type: 'paragraph', children: [{ text: '• Easy maintenance and cleaning' }] },
        { type: 'paragraph', children: [{ text: '• Maximum light transmission' }] },
        { type: 'paragraph', children: [{ text: '• Durable stainless steel construction' }] },
      ]
    },
    zh: {
      name: '现代办公室玻璃墙安装',
      shortDescription: '企业办公环境的高端玻璃支撑系统',
      description: '采用我们高端支撑系统的精致玻璃墙安装，打造开放现代的工作空间。',
      content: [
        { type: 'heading', children: [{ text: '项目概述' }] },
        { type: 'paragraph', children: [{ text: '本项目展示了在现代企业办公室中安装的惊艳玻璃墙系统。使用我们的高端玻璃支撑五金件，我们创造了一个无缝隔断，既保持了视觉连通性，又提供了声学隔离。' }] },
        { type: 'heading', children: [{ text: '技术细节' }] },
        { type: 'paragraph', children: [{ text: '材料：12mm钢化玻璃板' }] },
        { type: 'paragraph', children: [{ text: '五金件：缎面不锈钢支撑件' }] },
        { type: 'paragraph', children: [{ text: '尺寸：3米高 x 8米长' }] },
        { type: 'heading', children: [{ text: '主要特点' }] },
        { type: 'paragraph', children: [{ text: '• 简洁、极简的美学设计' }] },
        { type: 'paragraph', children: [{ text: '• 易于维护和清洁' }] },
        { type: 'paragraph', children: [{ text: '• 最大光线透射率' }] },
        { type: 'paragraph', children: [{ text: '• 耐用的不锈钢结构' }] },
      ]
    }
  },
  'application-glass-connected-fitting': {
    en: {
      name: 'Luxury Hotel Staircase Railing',
      shortDescription: 'Elegant glass railing system with premium connection fittings',
      description: 'A stunning staircase railing installation featuring seamless glass connections for a high-end hotel lobby.',
      content: [
        { type: 'heading', children: [{ text: 'Project Overview' }] },
        { type: 'paragraph', children: [{ text: 'This luxury hotel staircase features our premium glass connection fittings, creating a floating effect that enhances the grand lobby atmosphere. The system combines safety with sophisticated design.' }] },
        { type: 'heading', children: [{ text: 'Installation Specs' }] },
        { type: 'paragraph', children: [{ text: 'Glass: 15mm laminated safety glass' }] },
        { type: 'paragraph', children: [{ text: 'Fittings: 316 stainless steel connection system' }] },
        { type: 'paragraph', children: [{ text: 'Length: 12 meters curved staircase' }] },
      ]
    },
    zh: {
      name: '豪华酒店楼梯扶手',
      shortDescription: '配备高端连接配件的优雅玻璃扶手系统',
      description: '高端酒店大堂的惊艳楼梯扶手安装，采用无缝玻璃连接技术。',
      content: [
        { type: 'heading', children: [{ text: '项目概述' }] },
        { type: 'paragraph', children: [{ text: '这个豪华酒店楼梯采用我们的高端玻璃连接配件，创造出漂浮效果，增强了大堂的宏伟氛围。该系统将安全性与精致设计完美结合。' }] },
        { type: 'heading', children: [{ text: '安装规格' }] },
        { type: 'paragraph', children: [{ text: '玻璃：15mm夹层安全玻璃' }] },
        { type: 'paragraph', children: [{ text: '配件：316不锈钢连接系统' }] },
        { type: 'paragraph', children: [{ text: '长度：12米弧形楼梯' }] },
      ]
    }
  },
  'application-glass-fence-spigot': {
    en: {
      name: 'Infinity Pool Glass Fence',
      shortDescription: 'Frameless pool fence using premium glass spigots',
      description: 'A stunning infinity pool fence installation providing unobstructed ocean views while ensuring safety.',
      content: [
        { type: 'heading', children: [{ text: 'Project Overview' }] },
        { type: 'paragraph', children: [{ text: 'This residential infinity pool features our premium glass fence spigot system, offering 360-degree unobstructed views while meeting strict pool safety regulations.' }] },
        { type: 'heading', children: [{ text: 'System Details' }] },
        { type: 'paragraph', children: [{ text: 'Glass: 12mm tempered safety glass' }] },
        { type: 'paragraph', children: [{ text: 'Spigots: Marine-grade stainless steel 316' }] },
        { type: 'paragraph', children: [{ text: 'Height: 1.2m safety standard' }] },
      ]
    },
    zh: {
      name: '无边泳池玻璃围栏',
      shortDescription: '使用高端玻璃支架底座的无框泳池围栏',
      description: '惊艳的无边泳池围栏安装，在确保安全的同时提供无遮挡的海景视野。',
      content: [
        { type: 'heading', children: [{ text: '项目概述' }] },
        { type: 'paragraph', children: [{ text: '这个住宅无边泳池采用我们的高端玻璃围栏支架系统，在满足严格泳池安全法规的同时，提供360度无遮挡视野。' }] },
        { type: 'heading', children: [{ text: '系统详情' }] },
        { type: 'paragraph', children: [{ text: '玻璃：12mm钢化安全玻璃' }] },
        { type: 'paragraph', children: [{ text: '支架：船用级316不锈钢' }] },
        { type: 'paragraph', children: [{ text: '高度：1.2米安全标准' }] },
      ]
    }
  },
  'application-guardrail-glass-clip': {
    en: {
      name: 'Commercial Balcony Guardrail',
      shortDescription: 'Modern glass guardrail system for commercial building',
      description: 'A sleek balcony guardrail installation for a commercial high-rise, combining safety and aesthetics.',
      content: [
        { type: 'heading', children: [{ text: 'Project Overview' }] },
        { type: 'paragraph', children: [{ text: 'This commercial building features our guardrail glass clip system across multiple floors, providing a consistent modern aesthetic while meeting all building code requirements.' }] },
        { type: 'paragraph', children: [{ text: 'Coverage: 15 floors, 200+ linear meters' }] },
      ]
    },
    zh: {
      name: '商业阳台护栏',
      shortDescription: '商业建筑的现代玻璃护栏系统',
      description: '商业高层的时尚阳台护栏安装，兼顾安全与美观。',
      content: [
        { type: 'heading', children: [{ text: '项目概述' }] },
        { type: 'paragraph', children: [{ text: '这栋商业建筑在多个楼层采用我们的护栏玻璃夹系统，在满足所有建筑规范要求的同时，提供一致的现代美学。' }] },
        { type: 'paragraph', children: [{ text: '覆盖范围：15层楼，200+米直线长度' }] },
      ]
    }
  },
  'application-bathroom-glass-clip': {
    en: {
      name: 'Luxury Spa Shower Enclosures',
      shortDescription: 'Premium frameless shower systems for high-end spa',
      description: 'Elegant frameless shower enclosures using our bathroom glass clip system.',
      content: [
        { type: 'heading', children: [{ text: 'Project Overview' }] },
        { type: 'paragraph', children: [{ text: 'This luxury spa features 20+ shower enclosures using our premium bathroom glass clip system, creating a seamless and elegant bathing experience.' }] },
        { type: 'paragraph', children: [{ text: 'Finish: Polished chrome' }] },
        { type: 'paragraph', children: [{ text: 'Glass: 10mm tempered clear glass' }] },
      ]
    },
    zh: {
      name: '豪华水疗淋浴房',
      shortDescription: '高端水疗中心的高级无框淋浴系统',
      description: '使用我们浴室玻璃夹系统的优雅无框淋浴房。',
      content: [
        { type: 'heading', children: [{ text: '项目概述' }] },
        { type: 'paragraph', children: [{ text: '这个豪华水疗中心采用我们的高级浴室玻璃夹系统，安装了20多个淋浴房，创造出无缝优雅的沐浴体验。' }] },
        { type: 'paragraph', children: [{ text: '表面处理：抛光铬' }] },
        { type: 'paragraph', children: [{ text: '玻璃：10mm钢化透明玻璃' }] },
      ]
    }
  },
  'application-glass-hinge': {
    en: {
      name: 'Restaurant Glass Door Entrance',
      shortDescription: 'Frameless glass door system with premium hinges',
      description: 'A welcoming restaurant entrance featuring seamless frameless glass doors.',
      content: [
        { type: 'heading', children: [{ text: 'Project Overview' }] },
        { type: 'paragraph', children: [{ text: 'This upscale restaurant entrance uses our premium glass hinge system to create an inviting, transparent facade that welcomes guests while maintaining weather protection.' }] },
        { type: 'paragraph', children: [{ text: 'Door dimensions: 2.4m height x 1.2m width' }] },
        { type: 'paragraph', children: [{ text: 'Hinges: Heavy-duty 180-degree opening' }] },
      ]
    },
    zh: {
      name: '餐厅玻璃门入口',
      shortDescription: '配备高级合页的无框玻璃门系统',
      description: '采用无缝无框玻璃门的温馨餐厅入口。',
      content: [
        { type: 'heading', children: [{ text: '项目概述' }] },
        { type: 'paragraph', children: [{ text: '这家高档餐厅入口采用我们的高级玻璃合页系统，创造出诱人的透明立面，在欢迎客人的同时保持防风雨保护。' }] },
        { type: 'paragraph', children: [{ text: '门尺寸：2.4米高 x 1.2米宽' }] },
        { type: 'paragraph', children: [{ text: '合页：重型180度开启' }] },
      ]
    }
  },
  'application-sliding-door-kit': {
    en: {
      name: 'Modern Home Patio Sliding Doors',
      shortDescription: 'Complete sliding door system for residential application',
      description: 'Wide-span sliding glass doors creating indoor-outdoor living space.',
      content: [
        { type: 'heading', children: [{ text: 'Project Overview' }] },
        { type: 'paragraph', children: [{ text: 'This modern residence features our complete sliding door kit, creating a 6-meter wide opening that seamlessly connects the interior living space with the outdoor patio area.' }] },
        { type: 'paragraph', children: [{ text: 'System: Multi-panel sliding configuration' }] },
        { type: 'paragraph', children: [{ text: 'Hardware: Soft-close rollers and track' }] },
      ]
    },
    zh: {
      name: '现代家居露台推拉门',
      shortDescription: '住宅应用的完整推拉门系统',
      description: '大跨度推拉玻璃门，创造室内外生活空间。',
      content: [
        { type: 'heading', children: [{ text: '项目概述' }] },
        { type: 'paragraph', children: [{ text: '这个现代住宅采用我们的完整推拉门套件，创造出6米宽的开口，无缝连接室内生活空间与户外露台区域。' }] },
        { type: 'paragraph', children: [{ text: '系统：多面板推拉配置' }] },
        { type: 'paragraph', children: [{ text: '五金件：缓冲滑轮和导轨' }] },
      ]
    }
  },
  'application-bathroom-handle': {
    en: {
      name: 'Hotel Bathroom Suite',
      shortDescription: 'Coordinated handle system for hotel bathrooms',
      description: 'Premium bathroom and entrance handles creating a cohesive design aesthetic.',
      content: [
        { type: 'heading', children: [{ text: 'Project Overview' }] },
        { type: 'paragraph', children: [{ text: 'This boutique hotel features our coordinated bathroom handle system across 50+ rooms, providing a consistent luxury experience for guests.' }] },
        { type: 'paragraph', children: [{ text: 'Finish: Brushed nickel' }] },
        { type: 'paragraph', children: [{ text: 'Style: Contemporary minimalist' }] },
      ]
    },
    zh: {
      name: '酒店浴室套房',
      shortDescription: '酒店浴室的协调拉手系统',
      description: '高级浴室和入口拉手，创造统一的设计美学。',
      content: [
        { type: 'heading', children: [{ text: '项目概述' }] },
        { type: 'paragraph', children: [{ text: '这家精品酒店在50多个房间中采用我们的协调浴室拉手系统，为客人提供一致的豪华体验。' }] },
        { type: 'paragraph', children: [{ text: '表面处理：拉丝镍' }] },
        { type: 'paragraph', children: [{ text: '风格：现代极简主义' }] },
      ]
    }
  },
  'application-door-handle': {
    en: {
      name: 'Corporate Office Main Entrance',
      shortDescription: 'Statement entrance handle for corporate headquarters',
      description: 'Large-scale door handles creating a powerful first impression.',
      content: [
        { type: 'heading', children: [{ text: 'Project Overview' }] },
        { type: 'paragraph', children: [{ text: 'This corporate headquarters features our premium large-format door handles at the main entrance, creating an impressive and welcoming entry point for visitors and employees.' }] },
        { type: 'paragraph', children: [{ text: 'Length: 1.8m vertical handles' }] },
        { type: 'paragraph', children: [{ text: 'Material: Solid stainless steel' }] },
      ]
    },
    zh: {
      name: '企业办公室主入口',
      shortDescription: '企业总部的标志性入口拉手',
      description: '大型门拉手，创造强大的第一印象。',
      content: [
        { type: 'heading', children: [{ text: '项目概述' }] },
        { type: 'paragraph', children: [{ text: '这个企业总部在主入口采用我们的高级大尺寸门拉手，为访客和员工创造令人印象深刻的欢迎入口点。' }] },
        { type: 'paragraph', children: [{ text: '长度：1.8米垂直拉手' }] },
        { type: 'paragraph', children: [{ text: '材料：实心不锈钢' }] },
      ]
    }
  },
  'application-hidden-hook': {
    en: {
      name: 'Retail Store Display System',
      shortDescription: 'Rotating hidden hooks for flexible merchandising',
      description: 'Innovative display system using hidden rotating hooks for retail environment.',
      content: [
        { type: 'heading', children: [{ text: 'Project Overview' }] },
        { type: 'paragraph', children: [{ text: 'This high-end retail store uses our rotating hidden hook system to create flexible display options that can be easily reconfigured for different merchandise and seasonal displays.' }] },
        { type: 'paragraph', children: [{ text: 'Installation: 200+ hook points' }] },
        { type: 'paragraph', children: [{ text: 'Rotation: 360-degree swivel' }] },
      ]
    },
    zh: {
      name: '零售店展示系统',
      shortDescription: '灵活陈列的旋转式隐藏挂钩',
      description: '零售环境中使用隐藏旋转挂钩的创新展示系统。',
      content: [
        { type: 'heading', children: [{ text: '项目概述' }] },
        { type: 'paragraph', children: [{ text: '这家高端零售店使用我们的旋转隐藏挂钩系统，创造灵活的展示选项，可以轻松重新配置不同商品和季节性展示。' }] },
        { type: 'paragraph', children: [{ text: '安装：200多个挂钩点' }] },
        { type: 'paragraph', children: [{ text: '旋转：360度旋转' }] },
      ]
    }
  }
}

async function createApplication(categoryId, categorySlug, placeholderMediaId) {
  const data = applicationData[categorySlug]
  if (!data) {
    console.log(`⚠️  No template data for ${categorySlug}, skipping...`)
    return false
  }

  console.log(`\n📝 Creating application for ${categorySlug}...`)

  // Create the application
  const createMutation = `
    mutation CreateApplication($data: ApplicationCreateInput!) {
      createApplication(data: $data) {
        id
        slug
        name
      }
    }
  `

  const applicationData_input = {
    slug: `${categorySlug}-application-${Date.now()}`,
    name: {
      en: data.en.name,
      zh: data.zh.name
    },
    shortDescription: {
      en: data.en.shortDescription,
      zh: data.zh.shortDescription
    },
    description: {
      en: data.en.description,
      zh: data.zh.description
    },
    mainImage: placeholderMediaId,
    images: [placeholderMediaId, placeholderMediaId, placeholderMediaId],
    category: { connect: { id: categoryId } },
    status: 'PUBLISHED'
  }

  try {
    const result = await graphqlRequest(createMutation, { data: applicationData_input })
    const applicationId = result.createApplication.id
    console.log(`  ✅ Created: ${data.en.name}`)

    // Create EN translation
    const createTranslationEN = `
      mutation CreateTranslation($data: ApplicationContentTranslationCreateInput!) {
        createApplicationContentTranslation(data: $data) {
          id
        }
      }
    `
    await graphqlRequest(createTranslationEN, {
      data: {
        locale: 'en',
        content: data.en.content,
        application: { connect: { id: applicationId } }
      }
    })
    console.log(`  ✅ Created EN translation`)

    // Create ZH translation
    await graphqlRequest(createTranslationEN, {
      data: {
        locale: 'zh',
        content: data.zh.content,
        application: { connect: { id: applicationId } }
      }
    })
    console.log(`  ✅ Created ZH translation`)

    return true
  } catch (error) {
    console.error(`  ❌ Failed to create application:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Creating Application Items with Translations\n')
  console.log(`🔗 Keystone URL: ${KEYSTONE_URL}\n`)

  try {
    // Get placeholder media
    const placeholderMedia = await getPlaceholderMedia()
    console.log(`📷 Placeholder media: ${placeholderMedia.filename}\n`)

    // Get APPLICATION categories
    const categories = await getApplicationCategories()
    console.log(`📋 Found ${categories.length} APPLICATION categories\n`)

    if (categories.length === 0) {
      console.log('⚠️  No APPLICATION categories found!')
      console.log('Please run: node scripts/seed-home-content.js --module applicationCategories')
      process.exit(1)
    }

    let created = 0
    for (const category of categories) {
      const success = await createApplication(category.id, category.slug, placeholderMedia.id)
      if (success) created++
    }

    console.log(`\n✅ Created ${created} application items with translations!`)
    console.log('⚠️  Remember to replace placeholder images in CMS Admin UI')
  } catch (error) {
    console.error('\n❌ Creation failed:', error.message)
    process.exit(1)
  }
}

main()
