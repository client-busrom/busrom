// @ts-nocheck
/**
 * Seed Homepage Data for Payload CMS
 *
 * This script migrates homepage data from Keystone CMS to Payload CMS
 * Includes all 16 homepage modules:
 *
 * Collections:
 * 1. HeroBannerItems (9 items)
 * 2. SeriesIntroItems (TODO: needs ProductSeries data first)
 *
 * Globals:
 * 3. ProductSeriesCarousel
 * 4. ServiceFeatures
 * 5. Sphere3d
 * 6. SimpleCta
 * 7. FeaturedProducts
 * 8. BrandAdvantages
 * 9. OemOdm
 * 10. QuoteSteps
 * 11. MainForm
 * 12. WhyChooseBusrom
 * 13. CaseStudies
 * 14. BrandAnalysis
 * 15. BrandValue
 * 16. Footer
 */

import type { Payload } from 'payload'

// ==================== HeroBannerItems Data ====================
const heroBannerItemsData = [
  {
    internalLabel: 'Banner 1 - Glass Standoff',
    order: 1,
    status: 'published',
    title: {
      en: 'Glass Standoff',
      zh: '玻璃支撑件',
    },
    feature1: {
      en: 'Customized Minimalist Modern Glass Standoff',
      zh: '定制极简现代玻璃支撑件',
    },
    feature2: {
      en: 'Redefining Transparency & Modern Design',
      zh: '重新定义透明度与现代设计',
    },
    feature3: {
      en: 'Invisible Strength',
      zh: '隐形强度',
    },
    feature4: {
      en: 'Adjustable Flexibility',
      zh: '可调灵活性',
    },
    feature5: {
      en: 'Superior Durability',
      zh: '卓越耐用性',
    },
  },
  {
    internalLabel: 'Banner 2 - Glass Connected Fitting',
    order: 2,
    status: 'published',
    title: {
      en: 'Glass Connected Fitting',
      zh: '玻璃连接件',
    },
    feature1: {
      en: 'Durable Built Tough Glass Connected Fitting',
      zh: '耐用坚固的玻璃连接件',
    },
    feature2: {
      en: 'For A Clear And Secure Structure',
      zh: '为了清晰且安全的结构',
    },
    feature3: {
      en: 'High Load-bearing',
      zh: '高承重能力',
    },
    feature4: {
      en: 'Durability',
      zh: '耐久性',
    },
    feature5: {
      en: 'Safety',
      zh: '安全性',
    },
  },
  {
    internalLabel: 'Banner 3 - Glass Fence Spigot',
    order: 3,
    status: 'published',
    title: {
      en: 'Glass Fence Spigot',
      zh: '玻璃围栏立柱',
    },
    feature1: {
      en: 'Architectural Glass Fence Spigot',
      zh: '建筑级玻璃围栏立柱',
    },
    feature2: {
      en: 'The Art of Invisible Support',
      zh: '隐形支撑的艺术',
    },
    feature3: {
      en: 'Salt-spray Resistant',
      zh: '耐盐雾',
    },
    feature4: {
      en: 'Effortless Installation',
      zh: '安装简便',
    },
    feature5: {
      en: 'Unmatched Stability',
      zh: '无与伦比的稳定性',
    },
  },
  {
    internalLabel: 'Banner 4 - Glass Clip (Railing)',
    order: 4,
    status: 'published',
    title: {
      en: 'Glass Clip (Railing)',
      zh: '玻璃栏杆夹',
    },
    feature1: {
      en: 'Luxury Invisible Glass Railing Clip',
      zh: '奢华隐形玻璃栏杆夹',
    },
    feature2: {
      en: 'Small Footprint & Strong Hold',
      zh: '占地小 & 牢固抓握',
    },
    feature3: {
      en: 'Anti-Impact',
      zh: '抗冲击',
    },
    feature4: {
      en: 'Easy Installation',
      zh: '易于安装',
    },
    feature5: {
      en: 'Full Vertical Manufacturing',
      zh: '全垂直化生产',
    },
  },
  {
    internalLabel: 'Banner 5 - Glass Clip (Bathroom)',
    order: 5,
    status: 'published',
    title: {
      en: 'Glass Clip (Bathroom)',
      zh: '浴室玻璃夹',
    },
    feature1: {
      en: 'Design-forward Waterproof Bathroom Glass Clip',
      zh: '设计前卫的防水浴室玻璃夹',
    },
    feature2: {
      en: 'Minimal Contact & Maximum Glass',
      zh: '最小接触面积 & 最大化玻璃视野',
    },
    feature3: {
      en: 'High Quality',
      zh: '高品质',
    },
    feature4: {
      en: 'Corrosion-resistant',
      zh: '耐腐蚀',
    },
    feature5: {
      en: 'Flexible Compatibility',
      zh: '灵活兼容性',
    },
  },
  {
    internalLabel: 'Banner 6 - Glass Hinge',
    order: 6,
    status: 'published',
    title: {
      en: 'Glass Hinge',
      zh: '玻璃合页',
    },
    feature1: {
      en: 'Curated Details Glass Hinge',
      zh: '精心打造细节的玻璃合页',
    },
    feature2: {
      en: 'Swing Open The Invisible',
      zh: '开启无形之门',
    },
    feature3: {
      en: 'Silent Operation',
      zh: '静音操作',
    },
    feature4: {
      en: 'Adjustable Design',
      zh: '可调节设计',
    },
    feature5: {
      en: 'Aviation-grade Material',
      zh: '航空级材料',
    },
  },
  {
    internalLabel: 'Banner 7 - Sliding Door Kit',
    order: 7,
    status: 'published',
    title: {
      en: 'Sliding Door Kit',
      zh: '移门套件',
    },
    feature1: {
      en: 'Silent Soft-Close Sliding Door Kit',
      zh: '静音缓关移门套件',
    },
    feature2: {
      en: 'For Silent Glide & Perfect Divide',
      zh: '实现静谧滑动与完美空间分隔',
    },
    feature3: {
      en: 'Space Saving',
      zh: '节省空间',
    },
    feature4: {
      en: 'Durable Pulley',
      zh: '耐用滑轮',
    },
    feature5: {
      en: 'Silent Slide',
      zh: '静音滑动',
    },
  },
  {
    internalLabel: 'Banner 8 - Bathroom & Door Handle',
    order: 8,
    status: 'published',
    title: {
      en: 'Bathroom & Door Handle',
      zh: '浴室及门拉手',
    },
    feature1: {
      en: 'Opulent Simplicity Bathroom & Door Handle',
      zh: '华丽简约的浴室及门拉手',
    },
    feature2: {
      en: 'Turn Every Touch Into Elegance',
      zh: '让每次触摸尽显优雅',
    },
    feature3: {
      en: 'All-Weather Design',
      zh: '全天候设计',
    },
    feature4: {
      en: 'High Strength & Hardness',
      zh: '高强度与硬度',
    },
    feature5: {
      en: 'Easy Maintenance',
      zh: '易于维护',
    },
  },
  {
    internalLabel: 'Banner 9 - Hidden Hook',
    order: 9,
    status: 'published',
    title: {
      en: 'Hidden Hook',
      zh: '隐藏式挂钩',
    },
    feature1: {
      en: 'Elegant Streamlined Hidden Hook',
      zh: '优雅流线型隐藏式挂钩',
    },
    feature2: {
      en: 'Hidden Mounting & Strong Load-Bearing',
      zh: '隐藏式安装 & 强大承重',
    },
    feature3: {
      en: 'Removable Design',
      zh: '可拆卸设计',
    },
    feature4: {
      en: 'Quick Setup',
      zh: '快速安装',
    },
    feature5: {
      en: 'Invisible Storage',
      zh: '隐形收纳',
    },
  },
]

// ==================== ServiceFeatures Global Data ====================
const serviceFeaturesData = {
  status: 'published',
  title: {
    en: 'Premium Architectural Glass Hardware',
    zh: '高端建筑玻璃五金',
  },
  subtitle: {
    en: 'Fully Customized Glass Hardware by Busrom (Serving USA, CA, UK, AU, KSA, UAE, and clients worldwide to create the ideal indoor & outdoor space.)',
    zh: 'Busrom 提供全定制玻璃五金(服务美国、加拿大、英国、澳大利亚、沙特阿拉伯、阿联酋及全球客户,打造理想的室内外空间。)',
  },
  feature01Title: {
    en: 'Any Size, Any Structure, Any Shape',
    zh: '任意尺寸、任意结构、任意形状',
  },
  feature01ShortTitle: {
    en: 'Any Size',
    zh: '任意尺寸',
  },
  feature01Description: {
    en: 'Whether it\'s framed or frameless partitions, or even load-bearing curtain walls, we can customize glass hardware to match any size and structure.',
    zh: '无论是带框还是无框隔断,甚至是承重幕墙,我们都能定制匹配任意尺寸和结构的玻璃五金。',
  },
  feature02Title: {
    en: 'Flexible Installation',
    zh: '灵活安装',
  },
  feature02ShortTitle: {
    en: 'Flexible Installation',
    zh: '灵活安装',
  },
  feature02Description: {
    en: 'Whether it\'s frameless glass, tiled walls, metal frames, or renovation projects, Busrom\'s glass hardware adapts to every setting. From indoor bathrooms to poolside decks, our solutions install quickly and with minimal fuss.',
    zh: '无论是无框玻璃、瓷砖墙面、金属框架还是翻新项目,Busrom 的玻璃五金都能适应各种环境。从室内浴室到池畔露台,我们的解决方案安装快捷,麻烦最少。',
  },
  feature03Title: {
    en: 'A Color That\'s So You',
    zh: '专属色彩',
  },
  feature03ShortTitle: {
    en: 'A Color That\'s So You',
    zh: '专属色彩',
  },
  feature03Description: {
    en: 'From classic brushed stainless steel and matte black to any RAL color or custom PVD finish, Busrom\'s bespoke craftsmanship elevates projects into the crowning touch of any space. Durable coatings resist corrosion and wear, maintaining their aesthetic appeal for years to come.',
    zh: '从经典的拉丝不锈钢和哑光黑,到任意 RAL 颜色或定制 PVD 表面,Busrom 的定制工艺将项目提升为点睛之笔。耐用的涂层抗腐蚀和磨损,长久保持美观。',
  },
  feature04Title: {
    en: 'OEM / ODM & Project Customization',
    zh: 'OEM / ODM 及项目定制',
  },
  feature04ShortTitle: {
    en: 'OEM / ODM',
    zh: 'OEM / ODM',
  },
  feature04Description: {
    en: 'From prototype to mass production, we support drawing-based customization, small-batch runs, and full OEM/ODM services.',
    zh: '从原型到批量生产,我们支持来图定制、小批量试产以及完整的 OEM/ODM 服务。',
  },
  feature05Title: {
    en: 'Global Quality Standards & After-Sales Support',
    zh: '全球质量标准与售后支持',
  },
  feature05ShortTitle: {
    en: 'Global Quality Standards',
    zh: '全球质量标准',
  },
  feature05Description: {
    en: 'Strict QC, worldwide shipping, and responsive spare-part and technical support for project continuity.',
    zh: '严格的质量控制,全球配送,以及响应迅速的备件和技术支持,确保项目连续性。',
  },
}

// ==================== BrandAdvantages Global Data ====================
const brandAdvantagesData = {
  status: 'published',
  title: {
    en: 'Why Choose Busrom',
    zh: '为什么选择Busrom',
  },
  subtitle: {
    en: 'Your Trusted Partner in Glass Hardware',
    zh: '您值得信赖的玻璃五金合作伙伴',
  },
}

// ==================== OemOdm Global Data ====================
const oemOdmData = {
  status: 'published',
  oemTitle: {
    en: 'OEM',
    zh: 'OEM代工',
  },
  oemDescription1: {
    en: 'At Busrom, we work closely with designers, retailers, and distributors to bring their custom glass hardware visions to life.',
    zh: '在Busrom，我们与设计师、零售商和经销商紧密合作，将他们的定制玻璃五金愿景变为现实。',
  },
  oemDescription2: {
    en: 'Ready to turn your concept into a producible product? Contact us today.',
    zh: '准备将您的概念转化为可生产的产品？立即联系我们。',
  },
  odmTitle: {
    en: 'ODM',
    zh: 'ODM设计',
  },
  odmDescription1: {
    en: 'Fully Customized Structure & Size & Color',
    zh: '完全定制的结构、尺寸和颜色',
  },
  odmDescription2: {
    en: 'Complete Solution - Just The Way You Want Them',
    zh: '完整解决方案 - 完全按您所需',
  },
}

// ==================== FeaturedProducts Global Data ====================
const featuredProductsData = {
  status: 'published',
  title: {
    en: 'Featured Products',
    zh: '精选产品',
  },
  description: {
    en: 'Explore our most popular glass hardware solutions',
    zh: '探索我们最受欢迎的玻璃五金解决方案',
  },
  viewAllButtonText: {
    en: 'View All Products',
    zh: '查看所有产品',
  },
}

// ==================== MainForm Global Data ====================
const mainFormData = {
  status: 'published',
  placeholderName: {
    en: 'Your Name',
    zh: '您的姓名',
  },
  placeholderEmail: {
    en: 'Your Email',
    zh: '您的邮箱',
  },
  placeholderWhatsapp: {
    en: 'WhatsApp Number',
    zh: 'WhatsApp号码',
  },
  placeholderCompany: {
    en: 'Company Name',
    zh: '公司名称',
  },
  placeholderMessage: {
    en: 'Your Message',
    zh: '您的留言',
  },
  placeholderVerify: {
    en: 'Verify Code',
    zh: '验证码',
  },
  buttonText: {
    en: 'Send',
    zh: '发送',
  },
  designTextLeft: {
    en: 'Premium Architectural Glass Hardware',
    zh: '高端建筑玻璃五金',
  },
  designTextRight: {
    en: 'Customized Structure and Color',
    zh: '定制化结构和颜色',
  },
}

// ==================== CaseStudies Global Data ====================
const caseStudiesData = {
  status: 'published',
  title: {
    en: 'Case Studies',
    zh: '应用案例',
  },
  description: {
    en: 'Real-world applications of our glass hardware solutions',
    zh: '我们玻璃五金解决方案的实际应用',
  },
}

// ==================== QuoteSteps Global Data ====================
const quoteStepsData = {
  status: 'published',
  headerTitle: {
    en: 'Get Your Quote',
    zh: '获取报价',
  },
  headerTitle2: {
    en: 'In 3 Simple Steps',
    zh: '三个简单步骤',
  },
  headerSubtitle: {
    en: 'Fast and Easy Process',
    zh: '快速简便的流程',
  },
  headerDescription: {
    en: 'Our streamlined quote process makes it easy to get started on your project',
    zh: '我们简化的报价流程让您轻松开始项目',
  },
}

// ==================== WhyChooseBusrom Global Data ====================
const whyChooseBusromData = {
  status: 'published',
  title: {
    en: 'Why Choose Busrom',
    zh: '为什么选择Busrom',
  },
  subtitle: {
    en: 'Your Trusted Partner in Glass Hardware Excellence',
    zh: '您值得信赖的玻璃五金卓越合作伙伴',
  },
}

// ==================== BrandAnalysis Global Data ====================
const brandAnalysisData = {
  status: 'published',
}

// ==================== BrandValue Global Data ====================
const brandValueData = {
  status: 'published',
  param1Title: {
    en: 'Years of Experience',
    zh: '年经验',
  },
  param1Description: {
    en: 'Serving the glass hardware industry since 2005',
    zh: '自2005年以来服务于玻璃五金行业',
  },
  param2Title: {
    en: 'Products Delivered',
    zh: '产品交付',
  },
  param2Description: {
    en: 'Successfully delivered to customers worldwide',
    zh: '成功交付给全球客户',
  },
  sloganTitle: {
    en: 'Innovation',
    zh: '创新',
  },
  sloganDescription: {
    en: 'Continuously pushing the boundaries of glass hardware design',
    zh: '不断突破玻璃五金设计的界限',
  },
  valueTitle: {
    en: 'Quality',
    zh: '质量',
  },
  valueDescription: {
    en: 'Uncompromising commitment to excellence in every product',
    zh: '对每一件产品都坚持卓越品质',
  },
  visionTitle: {
    en: 'Vision',
    zh: '愿景',
  },
  visionDescription: {
    en: 'To be the global leader in architectural glass hardware solutions',
    zh: '成为全球建筑玻璃五金解决方案的领导者',
  },
}

// ==================== SimpleCta Global Data ====================
const simpleCtaData = {
  status: 'published',
  title: {
    en: 'Ready to Start Your Project?',
    zh: '准备开始您的项目了吗？',
  },
  subtitle: {
    en: 'Get in touch with our team today',
    zh: '立即联系我们的团队',
  },
  ctaText: {
    en: 'Contact Us',
    zh: '联系我们',
  },
  ctaLink: '/contact',
}

// ==================== Sphere3d Global Data ====================
const sphere3dData = {
  status: 'published',
}

// ==================== ProductSeriesCarousel Global Data ====================
const productSeriesCarouselData = {
  status: 'published',
  title: {
    en: 'Our Product Series',
    zh: '我们的产品系列',
  },
  autoplay: true,
  autoplaySpeed: 5000,
}

// ==================== Footer Global Data ====================
const footerData = {
  formTitle: {
    en: 'Contact Us',
    zh: '联系我们',
  },
  formPlaceholderName: {
    en: 'Your Name',
    zh: '您的姓名',
  },
  formPlaceholderEmail: {
    en: 'Your Email',
    zh: '您的邮箱',
  },
  formPlaceholderMessage: {
    en: 'Your Message',
    zh: '您的留言',
  },
  submitButtonText: {
    en: 'Submit',
    zh: '提交',
  },
  contactTitle: {
    en: 'Get In Touch',
    zh: '联系方式',
  },
  email: 'info@busrom.com',
  phone: '+86 123 4567 8900',
  address: {
    en: 'Shenzhen, Guangdong, China',
    zh: '中国广东省深圳市',
  },
  workingHours: {
    en: 'Mon-Fri: 9:00-18:00',
    zh: '周一至周五：9:00-18:00',
  },
  officialNoticeTitle: {
    en: 'Official Notice',
    zh: '官方声明',
  },
  copyrightText: {
    en: '© 2024 Busrom. All rights reserved.',
    zh: '© 2024 Busrom. 保留所有权利。',
  },
}

/**
 * Helper function to create localized document
 */
async function createLocalizedDocument(
  payload: Payload,
  collection: string,
  data: any,
): Promise<string> {
  // Extract localized fields (those with {en, zh} structure)
  const localizedFields: Record<string, any> = {}
  const nonLocalizedFields: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'en' in value && 'zh' in value) {
      localizedFields[key] = value
    } else {
      nonLocalizedFields[key] = value
    }
  }

  // Create document with English (default locale)
  const enData = { ...nonLocalizedFields }
  for (const [key, value] of Object.entries(localizedFields)) {
    enData[key] = (value as any).en
  }

  const doc = await payload.create({
    collection,
    data: enData,
    locale: 'en',
  })

  // Update with Chinese translations
  const zhData: Record<string, any> = {}
  for (const [key, value] of Object.entries(localizedFields)) {
    zhData[key] = (value as any).zh
  }

  if (Object.keys(zhData).length > 0) {
    await payload.update({
      collection,
      id: doc.id,
      data: zhData,
      locale: 'zh',
    })
  }

  return doc.id
}

/**
 * Helper function to update localized global
 */
async function updateLocalizedGlobal(
  payload: Payload,
  slug: string,
  data: any,
): Promise<void> {
  // Extract localized fields (those with {en, zh} structure)
  const localizedFields: Record<string, any> = {}
  const nonLocalizedFields: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'en' in value && 'zh' in value) {
      localizedFields[key] = value
    } else {
      nonLocalizedFields[key] = value
    }
  }

  // Update global with English (default locale)
  const enData = { ...nonLocalizedFields }
  for (const [key, value] of Object.entries(localizedFields)) {
    enData[key] = (value as any).en
  }

  await payload.updateGlobal({
    slug,
    data: enData,
    locale: 'en',
  })

  // Update with Chinese translations
  const zhData: Record<string, any> = {}
  for (const [key, value] of Object.entries(localizedFields)) {
    zhData[key] = (value as any).zh
  }

  if (Object.keys(zhData).length > 0) {
    await payload.updateGlobal({
      slug,
      data: zhData,
      locale: 'zh',
    })
  }
}

/**
 * Seed homepage data
 */
export async function seedHomepageData(payload: Payload): Promise<void> {
  console.log('🌱 Seeding Homepage Data...')

  try {
    // ==================== 1. Seed HeroBannerItems ====================
    console.log('  📦 Seeding HeroBannerItems...')
    for (const item of heroBannerItemsData) {
      await createLocalizedDocument(payload, 'hero-banner-items', item)
    }
    console.log(`  ✅ Created ${heroBannerItemsData.length} HeroBannerItems`)

    // ==================== 2. Seed ServiceFeatures ====================
    console.log('  📦 Seeding ServiceFeatures...')
    await updateLocalizedGlobal(payload, 'service-features', serviceFeaturesData)
    console.log('  ✅ Updated ServiceFeatures global')

    // ==================== 3. Seed BrandAdvantages ====================
    console.log('  📦 Seeding BrandAdvantages...')
    await updateLocalizedGlobal(payload, 'brand-advantages', brandAdvantagesData)
    console.log('  ✅ Updated BrandAdvantages global')

    // ==================== 4. Seed OemOdm ====================
    console.log('  📦 Seeding OemOdm...')
    await updateLocalizedGlobal(payload, 'oem-odm', oemOdmData)
    console.log('  ✅ Updated OemOdm global')

    // ==================== 5. Seed FeaturedProducts ====================
    console.log('  📦 Seeding FeaturedProducts...')
    await updateLocalizedGlobal(payload, 'featured-products', featuredProductsData)
    console.log('  ✅ Updated FeaturedProducts global')

    // ==================== 6. Seed MainForm ====================
    console.log('  📦 Seeding MainForm...')
    await updateLocalizedGlobal(payload, 'main-form', mainFormData)
    console.log('  ✅ Updated MainForm global')

    // ==================== 7. Seed CaseStudies ====================
    console.log('  📦 Seeding CaseStudies...')
    await updateLocalizedGlobal(payload, 'case-studies', caseStudiesData)
    console.log('  ✅ Updated CaseStudies global')

    // ==================== 8. Seed QuoteSteps ====================
    console.log('  📦 Seeding QuoteSteps...')
    await updateLocalizedGlobal(payload, 'quote-steps', quoteStepsData)
    console.log('  ✅ Updated QuoteSteps global')

    // ==================== 9. Seed WhyChooseBusrom ====================
    console.log('  📦 Seeding WhyChooseBusrom...')
    await updateLocalizedGlobal(payload, 'why-choose-busrom', whyChooseBusromData)
    console.log('  ✅ Updated WhyChooseBusrom global')

    // ==================== 10. Seed BrandAnalysis ====================
    console.log('  📦 Seeding BrandAnalysis...')
    await updateLocalizedGlobal(payload, 'brand-analysis', brandAnalysisData)
    console.log('  ✅ Updated BrandAnalysis global')

    // ==================== 11. Seed BrandValue ====================
    console.log('  📦 Seeding BrandValue...')
    await updateLocalizedGlobal(payload, 'brand-value', brandValueData)
    console.log('  ✅ Updated BrandValue global')

    // ==================== 12. Seed SimpleCta ====================
    console.log('  📦 Seeding SimpleCta...')
    await updateLocalizedGlobal(payload, 'simple-cta', simpleCtaData)
    console.log('  ✅ Updated SimpleCta global')

    // ==================== 13. Seed Sphere3d ====================
    console.log('  📦 Seeding Sphere3d...')
    await updateLocalizedGlobal(payload, 'sphere-3d', sphere3dData)
    console.log('  ✅ Updated Sphere3d global')

    // ==================== 14. Seed ProductSeriesCarousel ====================
    console.log('  📦 Seeding ProductSeriesCarousel...')
    await updateLocalizedGlobal(payload, 'product-series-carousel', productSeriesCarouselData)
    console.log('  ✅ Updated ProductSeriesCarousel global')

    // ==================== 15. Seed Footer ====================
    console.log('  📦 Seeding Footer...')
    await updateLocalizedGlobal(payload, 'footer', footerData)
    console.log('  ✅ Updated Footer global')

    console.log('\n✅ Homepage data seeding completed!')
    console.log('📊 Summary:')
    console.log(`   - ${heroBannerItemsData.length} HeroBannerItems created`)
    console.log('   - 14 Global configs updated')
    console.log('   - Total: 15 homepage modules seeded')
  } catch (error) {
    console.error('❌ Error seeding homepage data:', error)
    throw error
  }
}
