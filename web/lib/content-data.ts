/**
 * Content Data Types
 *
 * This module defines TypeScript types for all content from Payload CMS.
 * These types match the REST API specification defined in HomeContentApiDocumentation.md
 *
 * @module lib/content-data
 */

/**
 * ===================================
 * Base Types
 * ===================================
 */

/**
 * ImageObject - 统一的图片格式，支持 SEO 和焦点裁剪
 *
 * 焦点裁剪说明：
 * - cropFocalPoint: 图片的焦点位置，用于任意比例裁剪时保持焦点可见
 *   - x: 横向位置 (0-100)，0=最左，50=居中，100=最右
 *   - y: 纵向位置 (0-100)，0=最上，50=居中，100=最下
 *
 * 使用方法：
 * ```tsx
 * <img
 *   src={image.url}
 *   alt={image.altText}
 *   style={{
 *     objectFit: 'cover',
 *     objectPosition: `${image.cropFocalPoint?.x || 50}% ${image.cropFocalPoint?.y || 50}%`
 *   }}
 * />
 * ```
 */
/**
 * Image variant info from Payload CMS sizes
 */
export interface ImageVariantInfo {
  url: string
  width?: number
  height?: number
  mimeType?: string
  filesize?: number
  filename?: string
}

export interface ImageObject {
  url: string
  altText?: string
  thumbnailUrl?: string
  cropFocalPoint?: { x: number; y: number }
  variants?: {
    // Home API format (string URLs)
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
    webp?: string
    // Product API format (Payload sizes as objects)
    card?: string | ImageVariantInfo
    tablet?: string | ImageVariantInfo
    desktop?: string | ImageVariantInfo
  }
}

/**
 * 图片裁剪数据 — 来自后台 ImageCropEditor
 */
export interface ImageCropData {
  variant: string
  variantWidth: number
  variantHeight: number
  cropWidth: number
  cropHeight: number
  scale: number
  cropPosition: { x: number; y: number }
  croppedArea: { x: number; y: number; width: number; height: number }
  croppedAreaPixels: { x: number; y: number; width: number; height: number }
}

/**
 * ===================================
 * Home Page Module Types (按照API文档定义)
 * ===================================
 */

/**
 * Module 1: Hero Banner Item
 */
export interface HeroBannerItem {
  title: string
  features: string[]
  images: ImageObject[]
  /** 裁剪数据列表 — 与 images 数组索引一一对应，null 表示未设置裁剪 */
  imageCropDataList?: (ImageCropData | null)[]
}

/**
 * Module 2: Product Series Carousel Item
 */
export interface ProductSeriesItem {
  key: string
  order: number
  name: string
  image: ImageObject
  sceneImage: ImageObject
  buttonText: string
  href: string
  /** 裁剪数据列表 — [0]: image, [1]: sceneImage */
  imageCropDataList?: (ImageCropData | null)[]
}

/**
 * Module 3: Service Features
 */
export interface ServiceFeature {
  title: string
  shortTitle: string
  description: string
  images: ImageObject[]
}

export interface ServiceFeaturesData {
  title: string
  subtitle: string
  features: ServiceFeature[]
}

/**
 * Module 5: Simple CTA
 */
export interface SimpleCtaData {
  title: string
  title2: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink?: string
  images: ImageObject[]
  marqueeContent?: any
}

/**
 * Module 4: Sphere 3D Globe
 */
export interface Sphere3dData {
  title: string
  description: string
}

/**
 * Module 6: Series Introduction
 */
export interface SeriesIntroItem {
  title: string
  description: string
  images: ImageObject[]
  href: string
  /** 裁剪数据列表 — 与 images 数组索引一一对应 */
  imageCropDataList?: (ImageCropData | null)[]
}

/**
 * Module 7: Featured Products
 */
export interface FeaturedProduct {
  slug: string
  image: ImageObject
  title: string
  features: string[]
}

export interface FeaturedProductSeries {
  seriesTitle: string
  products: FeaturedProduct[]
}

export interface FeaturedProductsData {
  title: string
  description: string
  viewAllButton: string
  categories: string
  series: FeaturedProductSeries[]
}

/**
 * Module 8: Brand Advantages
 */
export interface BrandAdvantagesData {
  advantages: string[]
  icons: string[] // Lucide React 图标名称
  image: ImageObject
}

/**
 * Module 9: OEM/ODM
 */
export interface OemOdmItem {
  title: string
  bgImage: ImageObject
  image: ImageObject
  description: string[]
}

export interface OemOdmData {
  oem: OemOdmItem
  odm: OemOdmItem
}

/**
 * Module 10: Quote Steps
 */
export interface QuoteStep {
  text: string
  image: ImageObject
}

export interface QuoteStepsData {
  headerTitle: string
  headerTitle2: string
  headerSubtitle: string
  headerDescription: string
  steps: QuoteStep[]
}

/**
 * Module 11: Main Form
 */
export interface MainFormData {
  placeholderName: string
  placeholderEmail: string
  placeholderWhatsapp: string
  placeholderCompany: string
  placeholderMessage: string
  placeholderVerify: string
  buttonText: string
  submittingText: string
  successMessage: string
  errorRequired: string
  errorNetwork: string
  errorCaptcha: string
  designTextLeft: string
  designTextRight: string
  image1: ImageObject | null
  image2: ImageObject | null
}

/**
 * Module 12: Why Choose Busrom
 */
export interface WhyChooseReason {
  title: string
  description: string
  icon?: string
  image: ImageObject
}

export interface WhyChooseBusromData {
  title: string
  title2: string
  viewMoreButtonText?: string
  viewMoreButtonUrl?: string
  reasons: WhyChooseReason[]
}

/**
 * Module 13: Case Studies
 */
export interface SceneGalleryItem {
  sceneName: string
  images: ImageObject[]
}

export interface CaseStudyApplication {
  id: number
  slug: string
  name: string
  shortDescription: string
  description: string
  category: {
    id: number
    name: string
    slug: string
  } | null
  /** Pre-selected display images (3 images) from backend */
  displayImages?: ImageObject[]
  /** Full scene gallery for backward compatibility */
  sceneGallery: SceneGalleryItem[]
}

export interface CaseStudiesData {
  title: string
  description: string
  applications: CaseStudyApplication[]
}

/**
 * Module 14: Brand Analysis
 */
export interface BrandCenter {
  title: string
  description: string
  backgroundImage?: ImageObject | null
  largeImage?: string | null
  smallImage?: string | null
}

export interface BrandAnalysisData {
  status?: string
  backgroundImage?: ImageObject | null
  centers: BrandCenter[]
}

/**
 * Module 15: Brand Value
 */
export interface BrandValueItem {
  title: string
  description: string
  image: ImageObject
}

export interface BrandValueData {
  title: string
  subtitle: string
  param1: BrandValueItem
  param2: BrandValueItem
  slogan: BrandValueItem
  value: BrandValueItem
  vision: BrandValueItem
}

/**
 * Module 16: Footer
 */
export interface FooterFormConfig {
  title: string
  placeholders: {
    name: string
    email: string
    message: string
  }
  buttonText: string
}

export interface FooterContactInfo {
  title: string
  emailLabel: string
  email: string
  afterSalesLabel: string
  afterSales: string
  whatsappLabel: string
  whatsapp: string
  addressLabel?: string
  address?: string
  workingHoursLabel?: string
  workingHours?: string
}

export interface FooterNotice {
  title: string
  lines: string[]
}

export interface FooterNavigationMenu {
  slug: string
  name: string
  link: string
}

export interface FooterSocialLink {
  platform: string
  url: string
}

export interface FooterData {
  form: FooterFormConfig
  contact: FooterContactInfo
  notice: FooterNotice
  navigationMenus?: FooterNavigationMenu[]
  socialLinks?: FooterSocialLink[]
}

/**
 * ===================================
 * Complete Home Page Content
 * ===================================
 */

/**
 * Home Page Content (All 16 modules)
 */
export interface HomeContent {
  locale: string
  heroBanner: HeroBannerItem[]
  productSeriesCarousel: ProductSeriesItem[]
  serviceFeatures: ServiceFeaturesData
  sphere3d: Sphere3dData | null
  simpleCta: SimpleCtaData
  seriesIntro: SeriesIntroItem[]
  featuredProducts: FeaturedProductsData
  brandAdvantages: BrandAdvantagesData
  oemOdm: OemOdmData
  quoteSteps: QuoteStepsData
  mainForm: MainFormData
  whyChooseBusrom: WhyChooseBusromData
  caseStudies: CaseStudiesData
  brandAnalysis: BrandAnalysisData
  brandValue: BrandValueData
  footer: FooterData
}

/**
 * ===================================
 * Helper Functions
 * ===================================
 */

/**
 * Type guard to check if content is loaded
 */
export function isContentLoaded(content: any): content is HomeContent {
  return content && typeof content === 'object' && 'heroBanner' in content
}

/**
 * Mock data generator (for development)
 *
 * @param locale - Language code (en or zh)
 * @returns Home page content for the specified locale
 */
export function getMockHomeContent(locale: string = 'en'): HomeContent {
  // Import mock data dynamically based on locale
  if (locale === 'zh') {
    // TODO: Import Chinese mock data when available
    const { homeContent_ZH } = require('@/mock/homeContent_ZH')
    return homeContent_ZH
  }

  // Default to English mock data
  const { homeContent_EN } = require('@/mock/homeContent_EN')
  return homeContent_EN
}

/**
 * Get home content by locale (for API compatibility)
 *
 * @param locale - Language code
 * @returns Home page content
 */
export function getHomeContent(locale: string): HomeContent {
  return getMockHomeContent(locale)
}
