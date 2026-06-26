/**
 * CMS Admin Interface Labels (Centralized)
 *
 * All admin interface labels and descriptions should be defined here
 * to ensure consistency and ease of maintenance.
 *
 * Usage in collections:
 *   import { LABELS, DESCRIPTIONS, OPTIONS } from '@/i18n/admin-labels'
 *
 *   {
 *     name: 'status',
 *     label: LABELS.status,
 *     admin: { description: DESCRIPTIONS.status },
 *     options: OPTIONS.status,
 *   }
 */

// ============================================================================
// Common Labels (字段标签)
// ============================================================================
export const LABELS = {
  // Basic fields
  slug: { en: 'Slug', zh: 'URL标识' },
  sku: { en: 'SKU', zh: '产品型号' },
  name: { en: 'Name', zh: '名称' },
  title: { en: 'Title', zh: '标题' },
  subtitle: { en: 'Subtitle', zh: '副标题' },
  description: { en: 'Description', zh: '描述' },
  shortDescription: { en: 'Short Description', zh: '简短描述' },
  content: { en: 'Content', zh: '内容' },
  contentTranslation: { en: 'Content', zh: '富文本内容' },

  // Product specific
  productName: { en: 'Product Name', zh: '产品名称' },
  productSeries: { en: 'Product Series', zh: '产品系列' },
  seriesName: { en: 'Series Name', zh: '系列名称' },
  productAttributes: { en: 'Product Attributes', zh: '产品属性' },
  productSpecifications: { en: 'Product Specifications', zh: '产品规格' },

  // Page specific
  pageTitle: { en: 'Page Title', zh: '页面标题' },
  pageType: { en: 'Page Type', zh: '页面类型' },
  templateName: { en: 'Template Name', zh: '模板名称' },
  path: { en: 'Path (URL)', zh: 'URL路径' },

  // Blog specific
  blogTitle: { en: 'Blog Title', zh: '博客标题' },
  excerpt: { en: 'Excerpt', zh: '摘要' },
  author: { en: 'Author', zh: '作者' },
  coverImage: { en: 'Cover Image', zh: '封面图片' },

  // FAQ specific
  question: { en: 'Question', zh: '问题' },
  answer: { en: 'Answer', zh: '答案' },
  relatedFaqs: { en: 'Related FAQs', zh: '相关问题' },

  // Application specific
  applicationName: { en: 'Application Name', zh: '应用名称' },
  sceneName: { en: 'Scene Name', zh: '场景名称' },
  sceneGallery: { en: 'Scene Gallery', zh: '场景图集' },

  // Reusable block specific
  blockType: { en: 'Block Type', zh: '区块类型' },
  ctaText: { en: 'Button Text', zh: '按钮文字' },
  ctaLink: { en: 'Button Link', zh: '按钮链接' },
  ctaStyle: { en: 'Button Style', zh: '按钮样式' },

  // Media & Images
  image: { en: 'Image', zh: '图片' },
  images: { en: 'Images', zh: '图片' },
  showImage: { en: 'Show Image', zh: '展示图片' },
  mainImages: { en: 'Main Images', zh: '产品主图' },
  featuredImage: { en: 'Featured Image', zh: '特色图片' },
  galleryImages: { en: 'Gallery Images', zh: '图库' },
  caption: { en: 'Caption', zh: '说明文字' },

  // Hero section
  heroMediaTags: { en: 'Hero Media Tags', zh: '顶部图片标签' },
  heroText: { en: 'Hero Text Overlay', zh: '顶部叠加文字' },
  heroSubtitle: { en: 'Hero Subtitle', zh: '顶部副标题' },

  // System fields
  status: { en: 'Status', zh: '状态' },
  order: { en: 'Display Order', zh: '显示顺序' },
  isFeatured: { en: 'Is Featured', zh: '是否推荐' },
  isSystem: { en: 'System Page', zh: '系统页面' },
  publishedAt: { en: 'Published At', zh: '发布时间' },
  category: { en: 'Category', zh: '分类' },
  categories: { en: 'Categories', zh: '分类管理' },

  // Tabs
  tabBasicInfo: { en: 'Basic Info', zh: '基本信息' },
  tabContent: { en: 'Content', zh: '内容' },
  tabAttributes: { en: 'Attributes', zh: '属性' },
  tabImages: { en: 'Images', zh: '图片' },
  tabProducts: { en: 'Products', zh: '产品' },
  tabOrganization: { en: 'Organization', zh: '组织' },
  tabMediaCategories: { en: 'Media & Categories', zh: '媒体和分类' },
  tabHeroSection: { en: 'Hero Section', zh: '顶部配置' },
  tabQuestion: { en: 'Question', zh: '问题' },
  tabCtaConfig: { en: 'CTA Configuration', zh: 'CTA 配置' },
} as const

// ============================================================================
// Common Descriptions (字段描述)
// ============================================================================
export const DESCRIPTIONS = {
  // Basic fields
  slug: {
    en: 'URL-friendly identifier',
    zh: 'URL友好标识符',
  },
  slugAutoGenerate: {
    en: 'URL-friendly identifier (auto-generated if empty)',
    zh: 'URL友好标识符（留空时自动生成）',
  },
  slugExample: {
    en: 'URL-friendly identifier (e.g., "elite-door-handle-series")',
    zh: 'URL友好标识符（如 "elite-door-handle-series"）',
  },
  sku: {
    en: 'Product model code (e.g., "GDH-001")',
    zh: '产品型号代码（如 "GDH-001"）',
  },
  shortDescription: {
    en: 'Brief product description for listings',
    zh: '用于列表展示的简短产品描述',
  },
  detailedDescription: {
    en: 'Detailed product description',
    zh: '详细的产品描述',
  },
  richTextContent: {
    en: 'Rich text content - use language tabs above to switch locales',
    zh: '富文本内容 - 使用上方的语言选项卡切换语言',
  },

  // Product specific
  series: {
    en: 'Series this product belongs to',
    zh: '该产品所属的系列',
  },
  seriesName: {
    en: 'Product series name (localized)',
    zh: '产品系列名称（多语言）',
  },
  seriesDescription: {
    en: 'Brief series description (localized)',
    zh: '简短的系列描述（多语言）',
  },
  productAttributes: {
    en: 'Product attributes (key-value pairs)',
    zh: '产品属性（键值对）',
  },
  productSpecifications: {
    en: 'Product variants (colors, sizes, etc.)',
    zh: '产品变体（颜色、尺寸等）',
  },

  // Images
  showImage: {
    en: 'Product list display image',
    zh: '产品列表展示图片',
  },
  mainImages: {
    en: 'Product detail page images (gallery with hover carousel)',
    zh: '产品链接页图片（图库轮播）',
  },
  featuredImage: {
    en: 'Main image for this series',
    zh: '该系列的主图',
  },
  productsInSeries: {
    en: 'Products in this series',
    zh: '该系列下的产品',
  },

  // Page specific
  pageSlug: {
    en: 'CMS internal identifier. e.g.: service-overview, faq, summer-promotion-2024',
    zh: 'CMS内部标识符。例如：service-overview, faq, summer-promotion-2024',
  },
  pagePath: {
    en: 'Full URL path for frontend routing. e.g.: /service/one-stop-shop, /about-us/story',
    zh: '前端路由的完整URL路径。例如：/service/one-stop-shop, /about-us/story',
  },
  pageType: {
    en: 'Template: fixed structure, only edit content | Freeform: fully customizable',
    zh: '模板页：固定结构，仅编辑内容 | 自由页：完全可自定义',
  },
  templateName: {
    en: 'Only for template pages. e.g.: SERVICE_OVERVIEW, FAQ, ABOUT_US, OEM_ODM',
    zh: '仅用于模板页。例如：SERVICE_OVERVIEW, FAQ, ABOUT_US, OEM_ODM',
  },
  heroMediaTags: {
    en: 'Select media tags for hero waterfall animation',
    zh: '选择顶部瀑布流动画的媒体标签',
  },

  // Blog specific
  blogSlug: {
    en: 'URL-friendly identifier (e.g., "how-to-install-glass-standoff")',
    zh: 'URL友好标识符（如 "how-to-install-glass-standoff"）',
  },
  excerpt: {
    en: 'Short summary for previews and SEO',
    zh: '用于预览和SEO的简短摘要',
  },
  blogCategories: {
    en: 'Select blog categories',
    zh: '选择博客分类',
  },

  // FAQ specific
  faqSlug: {
    en: 'Unique identifier (e.g., "shipping-policy")',
    zh: '唯一标识符（如 "shipping-policy"）',
  },
  faqCategory: {
    en: 'Select an FAQ category',
    zh: '选择FAQ分类',
  },
  relatedFaqs: {
    en: 'Link to related FAQ items',
    zh: '链接到相关FAQ条目',
  },

  // Application specific
  applicationSlug: {
    en: 'URL-friendly identifier (e.g., "commercial-building-glass-railing")',
    zh: 'URL友好标识符（如 "commercial-building-glass-railing"）',
  },
  sceneGallery: {
    en: 'Manage scene image groups. Each scene can contain multiple images.',
    zh: '管理场景图片组。每个场景可以包含多张图片。',
  },
  sceneImages: {
    en: 'Select multiple images for this scene',
    zh: '为此场景选择多张图片',
  },

  // Reusable block specific
  blockSlug: {
    en: 'Unique identifier (e.g., "cta-contact-us", "feature-quality")',
    zh: '唯一标识符（如 "cta-contact-us", "feature-quality"）',
  },

  // System fields
  order: {
    en: 'Lower number = higher priority',
    zh: '数字越小优先级越高',
  },
  isSystem: {
    en: 'System pages cannot be deleted',
    zh: '系统页面不可删除',
  },
  applicationCategory: {
    en: 'Select an application category',
    zh: '选择应用分类',
  },
} as const

// ============================================================================
// Common Options (选项)
// ============================================================================
export const OPTIONS = {
  status: [
    { label: { en: 'Published', zh: '已发布' }, value: 'published' },
    { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
    { label: { en: 'Archived', zh: '已归档' }, value: 'archived' },
  ],
  pageType: [
    { label: { en: 'Template Page', zh: '固定模板页' }, value: 'TEMPLATE' },
    { label: { en: 'Freeform Page', zh: '自由落地页' }, value: 'FREEFORM' },
  ],
  blockType: [
    { label: { en: 'CTA', zh: '行动召唤' }, value: 'CTA' },
    { label: { en: 'Feature', zh: '特性' }, value: 'FEATURE' },
    { label: { en: 'Testimonial', zh: '客户评价' }, value: 'TESTIMONIAL' },
    { label: { en: 'Contact', zh: '联系信息' }, value: 'CONTACT' },
    { label: { en: 'Custom', zh: '自定义' }, value: 'CUSTOM' },
  ],
  ctaStyle: [
    { label: { en: 'Primary', zh: '主要' }, value: 'primary' },
    { label: { en: 'Secondary', zh: '次要' }, value: 'secondary' },
    { label: { en: 'Outline', zh: '轮廓' }, value: 'outline' },
  ],
} as const

// ============================================================================
// Admin Group Labels (管理组标签)
// ============================================================================
export const GROUPS = {
  content: { en: 'Content', zh: '内容管理' },
  settings: { en: 'Settings', zh: '设置' },
  system: { en: 'System', zh: '系统' },
  analytics: { en: 'Analytics', zh: '数据分析' },
} as const

// ============================================================================
// Admin Navigation Labels (CustomNav component)
// ============================================================================
export const NAV_LABELS = {
  cdpDashboard: { en: 'Analytics', zh: '数据分析' },
} as const

// ============================================================================
// Collection Labels (集合标签)
// ============================================================================
export const COLLECTION_LABELS = {
  products: {
    singular: { en: 'Product', zh: '产品' },
    plural: { en: 'Products', zh: '产品' },
  },
  productSeries: {
    singular: { en: 'Product Series', zh: '产品系列' },
    plural: { en: 'Product Series', zh: '产品系列' },
  },
  pages: {
    singular: { en: 'Page', zh: '页面' },
    plural: { en: 'Pages', zh: '页面' },
  },
  blogs: {
    singular: { en: 'Blog', zh: '博客' },
    plural: { en: 'Blogs', zh: '博客' },
  },
  faqItems: {
    singular: { en: 'FAQ', zh: '常见问题' },
    plural: { en: 'FAQs', zh: '常见问题' },
  },
  reusableBlocks: {
    singular: { en: 'Reusable Block', zh: '可复用区块' },
    plural: { en: 'Reusable Blocks', zh: '可复用区块' },
  },
  applications: {
    singular: { en: 'Application', zh: '应用案例' },
    plural: { en: 'Applications', zh: '应用案例' },
  },
  categories: {
    singular: { en: 'Category', zh: '分类管理' },
    plural: { en: 'Categories', zh: '分类管理' },
  },
  media: {
    singular: { en: 'Media', zh: '媒体' },
    plural: { en: 'Media', zh: '媒体' },
  },
  users: {
    singular: { en: 'User', zh: '用户' },
    plural: { en: 'Users', zh: '用户' },
  },
} as const

// ============================================================================
// Translation Center Labels (翻译中心标签)
// ============================================================================
export const TRANSLATION_CENTER = {
  title: { en: 'Translation Center', zh: '翻译中心' },
  triggerButton: { en: 'Translation Center', zh: '翻译中心' },
  triggerHint: { en: 'translatable fields', zh: '个可翻译字段' },
  saveFirst: { en: 'Save first', zh: '请先保存' },
  notAvailable: { en: 'Not available', zh: '不可用' },
  loading: { en: 'Loading...', zh: '加载中...' },

  // Controls
  sourceLanguage: { en: 'Source Language', zh: '源语言' },
  targetLanguages: { en: 'Target Languages', zh: '目标语言' },
  selectAll: { en: 'All', zh: '全选' },
  selectEmpty: { en: 'Has Empty', zh: '选择空白' },
  clearSelection: { en: 'Clear', zh: '清除' },
  overwriteExisting: { en: 'Overwrite existing content', zh: '覆盖已有内容' },

  // Buttons
  translate: { en: 'Translate', zh: '翻译' },
  translating: { en: 'Translating...', zh: '翻译中...' },
  saveAll: { en: 'Save All', zh: '保存全部' },
  saving: { en: 'Saving...', zh: '保存中...' },
  close: { en: 'Close', zh: '关闭' },

  // Status messages
  selectTargetLanguages: { en: 'Please select target languages', zh: '请选择目标语言' },
  translateSuccess: { en: 'Translated {count} field-language combinations', zh: '已翻译 {count} 个字段-语言组合' },
  translateFailed: { en: 'Translation failed', zh: '翻译失败' },
  saveSuccess: { en: 'Saved to {count} languages', zh: '已保存到 {count} 种语言' },
  saveFailed: { en: 'Save failed', zh: '保存失败' },
  loadFailed: { en: 'Failed to load data', zh: '加载数据失败' },
  partialSave: { en: '{success} saved, {fail} failed', zh: '{success} 个保存成功，{fail} 个失败' },

  // Field labels
  empty: { en: 'Empty', zh: '空' },
  source: { en: 'SRC', zh: '源' },
  langs: { en: 'langs', zh: '种语言' },
} as const

// Helper function to get translation
export function t(
  obj: { en: string; zh: string },
  locale: 'en' | 'zh' = 'en'
): string {
  return obj[locale] || obj.en
}

// Helper function to replace placeholders in translation
export function tFormat(
  obj: { en: string; zh: string },
  params: Record<string, string | number>,
  locale: 'en' | 'zh' = 'en'
): string {
  let text = obj[locale] || obj.en
  for (const [key, value] of Object.entries(params)) {
    text = text.replace(`{${key}}`, String(value))
  }
  return text
}
