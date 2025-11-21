/**
 * Keystone Schema Entry Point
 *
 * This file aggregates all data models (Lists) for the Keystone CMS.
 * Each model is defined in a separate file in the schemas/ directory.
 */

import { list } from '@keystone-6/core'

// Import all schema definitions
import { User, Role } from './schemas/User'
import { Permission } from './schemas/Permission'
import { Media } from './schemas/Media'
import { MediaCategory } from './schemas/MediaCategory'
import { MediaTag } from './schemas/MediaTag'
import { Category } from './schemas/Category'
import { ProductSeries } from './schemas/ProductSeries'
import { ProductSeriesContentTranslation } from './schemas/ProductSeriesContentTranslation'
import { Product } from './schemas/Product'
import { ProductContentTranslation } from './schemas/ProductContentTranslation'
import { Blog } from './schemas/Blog'
import { BlogContentTranslation } from './schemas/BlogContentTranslation'
import { Application } from './schemas/Application'
import { ApplicationContentTranslation } from './schemas/ApplicationContentTranslation'
import { FaqItem } from './schemas/FaqItem'
import { FormConfig } from './schemas/FormConfig'
import { FormSubmission } from './schemas/FormSubmission'
import { TempFileUpload } from './schemas/TempFileUpload'
import { CustomScript } from './schemas/CustomScript'
import { SeoSetting } from './schemas/SeoSetting'
import { SiteConfig } from './schemas/SiteConfig'
import { NavigationMenu } from './schemas/NavigationMenu'
import { HomeContent } from './schemas/HomeContent'
import { Footer } from './schemas/Footer'
import { ActivityLog } from './schemas/ActivityLog'

// Document Components
import { DocumentTemplate } from './schemas/DocumentTemplate'
import { ReusableBlock } from './schemas/ReusableBlock'
import { ReusableBlockContentTranslation } from './schemas/ReusableBlockContentTranslation'

// Pages (Unified)
import { Page } from './schemas/Page'
import { PageContentTranslation } from './schemas/PageContentTranslation'

// Home Page Content Blocks (新架构 - 结构化字段)
import { HeroBannerItem } from './schemas/HeroBannerItem'
import { ServiceFeaturesConfig } from './schemas/ServiceFeaturesConfig'
import { SimpleCta } from './schemas/SimpleCta'
import { Sphere3d } from './schemas/Sphere3d'
import { BrandAnalysis } from './schemas/BrandAnalysis'
import { BrandAdvantages } from './schemas/BrandAdvantages'
import { OemOdm } from './schemas/OemOdm'
import { QuoteSteps } from './schemas/QuoteSteps'
import { MainForm } from './schemas/MainForm'
import { WhyChooseBusrom } from './schemas/WhyChooseBusrom'
import { BrandValue } from './schemas/BrandValue'
import { SeriesIntro } from './schemas/SeriesIntro'
import { ProductSeriesCarousel } from './schemas/ProductSeriesCarousel'
import { FeaturedProducts } from './schemas/FeaturedProducts'
import { CaseStudies } from './schemas/CaseStudies'

/**
 * Lists Object
 *
 * This object maps list names to their schema definitions.
 * The order here determines the order in the Keystone Admin UI sidebar.
 *
 * Architecture:
 * - User: Admin users and authentication
 * - Role: User roles for RBAC
 * - ActivityLog: Activity audit log
 * - SiteConfig: Site-wide configuration (singleton)
 * - HomeContent: Homepage section configurations (17 sections, 24 languages)
 * - Footer: Footer configuration (singleton, 24 languages)
 * - NavigationMenu: Site navigation management
 * - Media: AWS S3 image library with 24-language alt text
 * - MediaCategory: Tree-based media classification
 * - MediaTag: Flat multi-dimensional tag system
 * - Category: Reusable category system
 * - ProductSeries: Product series/collections
 * - ProductSeriesContentTranslation: Rich text translations for product series
 * - Product: Individual products/SKUs
 * - ProductContentTranslation: Rich text translations for products
 * - Blog: Blog posts/articles
 * - BlogContentTranslation: Rich text translations for blog content
 * - Application: Application cases/project showcases
 * - ApplicationContentTranslation: Rich text translations for application descriptions
 * - FaqItem: Frequently asked questions (JSON multilingual)
 * - FormConfig: Dynamic form configurations
 * - FormSubmission: Form submission records
 * - CustomScript: Custom code management (tracking scripts, etc.)
 * - SeoSetting: SEO configuration (global and per-page)
 * - DocumentTemplate: Pre-made content templates for Document Field
 * - ReusableBlock: Reusable content blocks (main table)
 * - ReusableBlockContentTranslation: Rich text translations for reusable blocks
 */
export const lists = {
  // Authentication & Users
  User,
  Role,
  Permission,
  ActivityLog,

  // Site Configuration
  SiteConfig,
  NavigationMenu,

  // Pages (统一页面管理)
  Page, // 统一页面模型 - 支持固定模板页和自由落地页
  PageContentTranslation,

  // Home Page Content (新架构 - 结构化字段)
  HeroBannerItem,
  ProductSeriesCarousel,
  ServiceFeaturesConfig,
  Sphere3d,
  SimpleCta,
  SeriesIntro,
  FeaturedProducts,
  BrandAdvantages,
  OemOdm,
  QuoteSteps,
  MainForm,
  WhyChooseBusrom,
  CaseStudies,
  BrandAnalysis,
  BrandValue,
  Footer,

  // Home Page Content (旧架构 - 待废弃)
  HomeContent, // 将在所有区块迁移完成后删除

  // Media Library (AWS S3)
  Media,
  MediaCategory,
  MediaTag,

  // Product Catalog
  Category,
  ProductSeries,
  ProductSeriesContentTranslation,
  Product,
  ProductContentTranslation,

  // Blog & Content
  Blog,
  BlogContentTranslation,
  Application,
  ApplicationContentTranslation,
  FaqItem,

  // Document Components
  DocumentTemplate,
  ReusableBlock,
  ReusableBlockContentTranslation,

  // Forms
  FormConfig,
  FormSubmission,
  TempFileUpload,

  // Advanced Features
  CustomScript,
  SeoSetting,
}
