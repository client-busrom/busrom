/**
 * Seed RBAC Permissions System
 *
 * This script initializes the permission system with:
 * 1. All system permissions
 * 2. Predefined roles
 * 3. Links permissions to roles
 *
 * Run this after database migration to set up the permission system.
 */

import type { Context } from '.keystone/types'

/**
 * Permission definitions
 *
 * Each permission is defined as {resource, action, name, category}
 * Categories are aligned with Navigation.tsx grouping
 */
const PERMISSIONS = [
  // ==================== 身份验证 & 用户 (Authentication & Users) ====================
  { resource: 'User', action: 'create', name: '创建用户', category: 'auth_and_users' },
  { resource: 'User', action: 'read', name: '查看用户', category: 'auth_and_users' },
  { resource: 'User', action: 'update', name: '更新用户', category: 'auth_and_users' },
  { resource: 'User', action: 'delete', name: '删除用户', category: 'auth_and_users' },
  { resource: 'User', action: 'manage_roles', name: '管理用户角色', category: 'auth_and_users' },

  { resource: 'Role', action: 'create', name: '创建角色', category: 'auth_and_users' },
  { resource: 'Role', action: 'read', name: '查看角色', category: 'auth_and_users' },
  { resource: 'Role', action: 'update', name: '更新角色', category: 'auth_and_users' },
  { resource: 'Role', action: 'delete', name: '删除角色', category: 'auth_and_users' },
  { resource: 'Role', action: 'manage_permissions', name: '管理角色权限', category: 'auth_and_users' },

  { resource: 'Permission', action: 'create', name: '创建权限', category: 'auth_and_users' },
  { resource: 'Permission', action: 'read', name: '查看权限', category: 'auth_and_users' },
  { resource: 'Permission', action: 'update', name: '更新权限', category: 'auth_and_users' },
  { resource: 'Permission', action: 'delete', name: '删除权限', category: 'auth_and_users' },

  { resource: 'ActivityLog', action: 'read', name: '查看操作日志', category: 'auth_and_users' },
  { resource: 'ActivityLog', action: 'view_logs', name: '查看审计日志', category: 'auth_and_users' },
  { resource: 'ActivityLog', action: 'delete', name: '删除操作日志', category: 'auth_and_users' },

  // ==================== 导航管理 (Navigation) ====================
  { resource: 'NavigationMenu', action: 'create', name: '创建导航菜单', category: 'navigation' },
  { resource: 'NavigationMenu', action: 'read', name: '查看导航菜单', category: 'navigation' },
  { resource: 'NavigationMenu', action: 'update', name: '更新导航菜单', category: 'navigation' },
  { resource: 'NavigationMenu', action: 'delete', name: '删除导航菜单', category: 'navigation' },

  // ==================== 首页内容 (Home Page) ====================
  // HeroBannerItem
  { resource: 'HeroBannerItem', action: 'create', name: '创建首页Banner', category: 'home_page' },
  { resource: 'HeroBannerItem', action: 'read', name: '查看首页Banner', category: 'home_page' },
  { resource: 'HeroBannerItem', action: 'update', name: '更新首页Banner', category: 'home_page' },
  { resource: 'HeroBannerItem', action: 'delete', name: '删除首页Banner', category: 'home_page' },

  // ProductSeriesCarousel
  { resource: 'ProductSeriesCarousel', action: 'create', name: '创建产品系列轮播', category: 'home_page' },
  { resource: 'ProductSeriesCarousel', action: 'read', name: '查看产品系列轮播', category: 'home_page' },
  { resource: 'ProductSeriesCarousel', action: 'update', name: '更新产品系列轮播', category: 'home_page' },
  { resource: 'ProductSeriesCarousel', action: 'delete', name: '删除产品系列轮播', category: 'home_page' },

  // ServiceFeaturesConfig
  { resource: 'ServiceFeaturesConfig', action: 'create', name: '创建服务特性配置', category: 'home_page' },
  { resource: 'ServiceFeaturesConfig', action: 'read', name: '查看服务特性配置', category: 'home_page' },
  { resource: 'ServiceFeaturesConfig', action: 'update', name: '更新服务特性配置', category: 'home_page' },
  { resource: 'ServiceFeaturesConfig', action: 'delete', name: '删除服务特性配置', category: 'home_page' },

  // Sphere3d
  { resource: 'Sphere3d', action: 'create', name: '创建3D球体', category: 'home_page' },
  { resource: 'Sphere3d', action: 'read', name: '查看3D球体', category: 'home_page' },
  { resource: 'Sphere3d', action: 'update', name: '更新3D球体', category: 'home_page' },
  { resource: 'Sphere3d', action: 'delete', name: '删除3D球体', category: 'home_page' },

  // SimpleCta
  { resource: 'SimpleCta', action: 'create', name: '创建简单CTA', category: 'home_page' },
  { resource: 'SimpleCta', action: 'read', name: '查看简单CTA', category: 'home_page' },
  { resource: 'SimpleCta', action: 'update', name: '更新简单CTA', category: 'home_page' },
  { resource: 'SimpleCta', action: 'delete', name: '删除简单CTA', category: 'home_page' },

  // SeriesIntro
  { resource: 'SeriesIntro', action: 'create', name: '创建系列介绍', category: 'home_page' },
  { resource: 'SeriesIntro', action: 'read', name: '查看系列介绍', category: 'home_page' },
  { resource: 'SeriesIntro', action: 'update', name: '更新系列介绍', category: 'home_page' },
  { resource: 'SeriesIntro', action: 'delete', name: '删除系列介绍', category: 'home_page' },

  // FeaturedProducts
  { resource: 'FeaturedProducts', action: 'create', name: '创建特色产品', category: 'home_page' },
  { resource: 'FeaturedProducts', action: 'read', name: '查看特色产品', category: 'home_page' },
  { resource: 'FeaturedProducts', action: 'update', name: '更新特色产品', category: 'home_page' },
  { resource: 'FeaturedProducts', action: 'delete', name: '删除特色产品', category: 'home_page' },

  // BrandAdvantages
  { resource: 'BrandAdvantages', action: 'create', name: '创建品牌优势', category: 'home_page' },
  { resource: 'BrandAdvantages', action: 'read', name: '查看品牌优势', category: 'home_page' },
  { resource: 'BrandAdvantages', action: 'update', name: '更新品牌优势', category: 'home_page' },
  { resource: 'BrandAdvantages', action: 'delete', name: '删除品牌优势', category: 'home_page' },

  // OemOdm
  { resource: 'OemOdm', action: 'create', name: '创建OEM/ODM', category: 'home_page' },
  { resource: 'OemOdm', action: 'read', name: '查看OEM/ODM', category: 'home_page' },
  { resource: 'OemOdm', action: 'update', name: '更新OEM/ODM', category: 'home_page' },
  { resource: 'OemOdm', action: 'delete', name: '删除OEM/ODM', category: 'home_page' },

  // QuoteSteps
  { resource: 'QuoteSteps', action: 'create', name: '创建报价步骤', category: 'home_page' },
  { resource: 'QuoteSteps', action: 'read', name: '查看报价步骤', category: 'home_page' },
  { resource: 'QuoteSteps', action: 'update', name: '更新报价步骤', category: 'home_page' },
  { resource: 'QuoteSteps', action: 'delete', name: '删除报价步骤', category: 'home_page' },

  // MainForm
  { resource: 'MainForm', action: 'create', name: '创建主表单', category: 'home_page' },
  { resource: 'MainForm', action: 'read', name: '查看主表单', category: 'home_page' },
  { resource: 'MainForm', action: 'update', name: '更新主表单', category: 'home_page' },
  { resource: 'MainForm', action: 'delete', name: '删除主表单', category: 'home_page' },

  // WhyChooseBusrom
  { resource: 'WhyChooseBusrom', action: 'create', name: '创建选择理由', category: 'home_page' },
  { resource: 'WhyChooseBusrom', action: 'read', name: '查看选择理由', category: 'home_page' },
  { resource: 'WhyChooseBusrom', action: 'update', name: '更新选择理由', category: 'home_page' },
  { resource: 'WhyChooseBusrom', action: 'delete', name: '删除选择理由', category: 'home_page' },

  // CaseStudies
  { resource: 'CaseStudies', action: 'create', name: '创建案例研究', category: 'home_page' },
  { resource: 'CaseStudies', action: 'read', name: '查看案例研究', category: 'home_page' },
  { resource: 'CaseStudies', action: 'update', name: '更新案例研究', category: 'home_page' },
  { resource: 'CaseStudies', action: 'delete', name: '删除案例研究', category: 'home_page' },

  // BrandAnalysis
  { resource: 'BrandAnalysis', action: 'create', name: '创建品牌分析', category: 'home_page' },
  { resource: 'BrandAnalysis', action: 'read', name: '查看品牌分析', category: 'home_page' },
  { resource: 'BrandAnalysis', action: 'update', name: '更新品牌分析', category: 'home_page' },
  { resource: 'BrandAnalysis', action: 'delete', name: '删除品牌分析', category: 'home_page' },

  // BrandValue
  { resource: 'BrandValue', action: 'create', name: '创建品牌价值', category: 'home_page' },
  { resource: 'BrandValue', action: 'read', name: '查看品牌价值', category: 'home_page' },
  { resource: 'BrandValue', action: 'update', name: '更新品牌价值', category: 'home_page' },
  { resource: 'BrandValue', action: 'delete', name: '删除品牌价值', category: 'home_page' },

  // Footer
  { resource: 'Footer', action: 'create', name: '创建页脚配置', category: 'home_page' },
  { resource: 'Footer', action: 'read', name: '查看页脚配置', category: 'home_page' },
  { resource: 'Footer', action: 'update', name: '更新页脚配置', category: 'home_page' },
  { resource: 'Footer', action: 'delete', name: '删除页脚配置', category: 'home_page' },

  // ==================== 媒体库 (Media Library) ====================
  { resource: 'Media', action: 'create', name: '上传媒体', category: 'media' },
  { resource: 'Media', action: 'read', name: '查看媒体', category: 'media' },
  { resource: 'Media', action: 'update', name: '更新媒体', category: 'media' },
  { resource: 'Media', action: 'delete', name: '删除媒体', category: 'media' },

  { resource: 'MediaCategory', action: 'create', name: '创建媒体分类', category: 'media' },
  { resource: 'MediaCategory', action: 'read', name: '查看媒体分类', category: 'media' },
  { resource: 'MediaCategory', action: 'update', name: '更新媒体分类', category: 'media' },
  { resource: 'MediaCategory', action: 'delete', name: '删除媒体分类', category: 'media' },

  { resource: 'MediaTag', action: 'create', name: '创建媒体标签', category: 'media' },
  { resource: 'MediaTag', action: 'read', name: '查看媒体标签', category: 'media' },
  { resource: 'MediaTag', action: 'update', name: '更新媒体标签', category: 'media' },
  { resource: 'MediaTag', action: 'delete', name: '删除媒体标签', category: 'media' },

  // ==================== 产品管理 (Products) ====================
  { resource: 'ProductSeries', action: 'create', name: '创建产品系列', category: 'products' },
  { resource: 'ProductSeries', action: 'read', name: '查看产品系列', category: 'products' },
  { resource: 'ProductSeries', action: 'update', name: '更新产品系列', category: 'products' },
  { resource: 'ProductSeries', action: 'delete', name: '删除产品系列', category: 'products' },

  { resource: 'Product', action: 'create', name: '创建产品', category: 'products' },
  { resource: 'Product', action: 'read', name: '查看产品', category: 'products' },
  { resource: 'Product', action: 'update', name: '更新产品', category: 'products' },
  { resource: 'Product', action: 'delete', name: '删除产品', category: 'products' },
  { resource: 'Product', action: 'publish', name: '发布产品', category: 'products' },

  // ==================== 内容管理 (Content) ====================
  { resource: 'Category', action: 'create', name: '创建分类', category: 'content' },
  { resource: 'Category', action: 'read', name: '查看分类', category: 'content' },
  { resource: 'Category', action: 'update', name: '更新分类', category: 'content' },
  { resource: 'Category', action: 'delete', name: '删除分类', category: 'content' },

  { resource: 'Blog', action: 'create', name: '创建博客', category: 'content' },
  { resource: 'Blog', action: 'read', name: '查看博客', category: 'content' },
  { resource: 'Blog', action: 'update', name: '更新博客', category: 'content' },
  { resource: 'Blog', action: 'delete', name: '删除博客', category: 'content' },
  { resource: 'Blog', action: 'publish', name: '发布博客', category: 'content' },

  { resource: 'Application', action: 'create', name: '创建应用案例', category: 'content' },
  { resource: 'Application', action: 'read', name: '查看应用案例', category: 'content' },
  { resource: 'Application', action: 'update', name: '更新应用案例', category: 'content' },
  { resource: 'Application', action: 'delete', name: '删除应用案例', category: 'content' },

  { resource: 'Page', action: 'create', name: '创建页面', category: 'content' },
  { resource: 'Page', action: 'read', name: '查看页面', category: 'content' },
  { resource: 'Page', action: 'update', name: '更新页面', category: 'content' },
  { resource: 'Page', action: 'delete', name: '删除页面', category: 'content' },

  { resource: 'FaqItem', action: 'create', name: '创建FAQ', category: 'content' },
  { resource: 'FaqItem', action: 'read', name: '查看FAQ', category: 'content' },
  { resource: 'FaqItem', action: 'update', name: '更新FAQ', category: 'content' },
  { resource: 'FaqItem', action: 'delete', name: '删除FAQ', category: 'content' },

  // ==================== 组件块管理 (Component Blocks) ====================
  // DocumentTemplate
  { resource: 'DocumentTemplate', action: 'create', name: '创建文档模板', category: 'component_blocks' },
  { resource: 'DocumentTemplate', action: 'read', name: '查看文档模板', category: 'component_blocks' },
  { resource: 'DocumentTemplate', action: 'update', name: '更新文档模板', category: 'component_blocks' },
  { resource: 'DocumentTemplate', action: 'delete', name: '删除文档模板', category: 'component_blocks' },

  // ReusableBlock
  { resource: 'ReusableBlock', action: 'create', name: '创建复用块', category: 'component_blocks' },
  { resource: 'ReusableBlock', action: 'read', name: '查看复用块', category: 'component_blocks' },
  { resource: 'ReusableBlock', action: 'update', name: '更新复用块', category: 'component_blocks' },
  { resource: 'ReusableBlock', action: 'delete', name: '删除复用块', category: 'component_blocks' },

  // ReusableBlockContentTranslation
  {
    resource: 'ReusableBlockContentTranslation',
    action: 'create',
    name: '创建复用块翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ReusableBlockContentTranslation',
    action: 'read',
    name: '查看复用块翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ReusableBlockContentTranslation',
    action: 'update',
    name: '更新复用块翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ReusableBlockContentTranslation',
    action: 'delete',
    name: '删除复用块翻译',
    category: 'component_blocks',
  },

  // ProductSeriesContentTranslation
  {
    resource: 'ProductSeriesContentTranslation',
    action: 'create',
    name: '创建产品系列内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ProductSeriesContentTranslation',
    action: 'read',
    name: '查看产品系列内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ProductSeriesContentTranslation',
    action: 'update',
    name: '更新产品系列内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ProductSeriesContentTranslation',
    action: 'delete',
    name: '删除产品系列内容翻译',
    category: 'component_blocks',
  },

  // ProductContentTranslation
  {
    resource: 'ProductContentTranslation',
    action: 'create',
    name: '创建产品内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ProductContentTranslation',
    action: 'read',
    name: '查看产品内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ProductContentTranslation',
    action: 'update',
    name: '更新产品内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ProductContentTranslation',
    action: 'delete',
    name: '删除产品内容翻译',
    category: 'component_blocks',
  },

  // ApplicationContentTranslation
  {
    resource: 'ApplicationContentTranslation',
    action: 'create',
    name: '创建应用案例内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ApplicationContentTranslation',
    action: 'read',
    name: '查看应用案例内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ApplicationContentTranslation',
    action: 'update',
    name: '更新应用案例内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'ApplicationContentTranslation',
    action: 'delete',
    name: '删除应用案例内容翻译',
    category: 'component_blocks',
  },

  // PageContentTranslation
  {
    resource: 'PageContentTranslation',
    action: 'create',
    name: '创建页面内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'PageContentTranslation',
    action: 'read',
    name: '查看页面内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'PageContentTranslation',
    action: 'update',
    name: '更新页面内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'PageContentTranslation',
    action: 'delete',
    name: '删除页面内容翻译',
    category: 'component_blocks',
  },

  // BlogContentTranslation (already defined in Blog section, but should be here)
  {
    resource: 'BlogContentTranslation',
    action: 'create',
    name: '创建博客内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'BlogContentTranslation',
    action: 'read',
    name: '查看博客内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'BlogContentTranslation',
    action: 'update',
    name: '更新博客内容翻译',
    category: 'component_blocks',
  },
  {
    resource: 'BlogContentTranslation',
    action: 'delete',
    name: '删除博客内容翻译',
    category: 'component_blocks',
  },

  // ==================== 表单 (Forms) ====================
  { resource: 'FormConfig', action: 'create', name: '创建表单配置', category: 'forms' },
  { resource: 'FormConfig', action: 'read', name: '查看表单配置', category: 'forms' },
  { resource: 'FormConfig', action: 'update', name: '更新表单配置', category: 'forms' },
  { resource: 'FormConfig', action: 'delete', name: '删除表单配置', category: 'forms' },

  { resource: 'FormSubmission', action: 'read', name: '查看表单提交', category: 'forms' },
  { resource: 'FormSubmission', action: 'update', name: '更新表单提交', category: 'forms' },
  { resource: 'FormSubmission', action: 'delete', name: '删除表单提交', category: 'forms' },
  { resource: 'FormSubmission', action: 'export', name: '导出表单提交', category: 'forms' },

  // ==================== 高级功能 (Advanced) ====================
  { resource: 'CustomScript', action: 'create', name: '创建自定义脚本', category: 'advanced' },
  { resource: 'CustomScript', action: 'read', name: '查看自定义脚本', category: 'advanced' },
  { resource: 'CustomScript', action: 'update', name: '更新自定义脚本', category: 'advanced' },
  { resource: 'CustomScript', action: 'delete', name: '删除自定义脚本', category: 'advanced' },
  { resource: 'CustomScript', action: 'inject_code', name: '注入自定义代码', category: 'advanced' },

  { resource: 'SeoSetting', action: 'create', name: '创建SEO设置', category: 'advanced' },
  { resource: 'SeoSetting', action: 'read', name: '查看SEO设置', category: 'advanced' },
  { resource: 'SeoSetting', action: 'update', name: '更新SEO设置', category: 'advanced' },
  { resource: 'SeoSetting', action: 'delete', name: '删除SEO设置', category: 'advanced' },

  // ==================== 站点配置 (Site Config) ====================
  { resource: 'SiteConfig', action: 'read', name: '查看站点配置', category: 'site_config' },
  { resource: 'SiteConfig', action: 'update', name: '更新站点配置', category: 'site_config' },
]

/**
 * Role definitions
 *
 * Each role has a set of permission identifiers
 */
const ROLES = [
  {
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限',
    isSystem: true,
    priority: 10,
    permissions: '*', // All permissions
  },
  {
    name: '内容编辑',
    code: 'content_editor',
    description: '负责内容的创建和编辑',
    isSystem: true,
    priority: 7,
    permissions: [
      // Content - CRUD except delete
      'Product:create',
      'Product:read',
      'Product:update',
      'ProductSeries:read',
      'ProductSeries:update',
      'Blog:create',
      'Blog:read',
      'Blog:update',
      'Application:create',
      'Application:read',
      'Application:update',
      'FaqItem:create',
      'FaqItem:read',
      'FaqItem:update',
      // Media - Full access
      'Media:create',
      'Media:read',
      'Media:update',
      'Media:delete',
      'MediaCategory:read',
      'MediaTag:read',
      'Category:read',
      // Document Components - Full access
      'DocumentTemplate:create',
      'DocumentTemplate:read',
      'DocumentTemplate:update',
      'DocumentTemplate:delete',
      'ReusableBlock:create',
      'ReusableBlock:read',
      'ReusableBlock:update',
      'ReusableBlock:delete',
      'ReusableBlockVersion:read',
      'ReusableBlockVersion:delete',
    ],
  },
  {
    name: '内容审核',
    code: 'content_reviewer',
    description: '负责内容的审核和发布',
    isSystem: true,
    priority: 8,
    permissions: [
      'Product:read',
      'Product:update',
      'Product:publish',
      'ProductSeries:read',
      'Blog:read',
      'Blog:update',
      'Blog:publish',
      'Application:read',
      'Application:update',
      'FaqItem:read',
      'FaqItem:update',
      'Media:read',
    ],
  },
  {
    name: '客服专员',
    code: 'customer_support',
    description: '负责处理客户咨询',
    isSystem: true,
    priority: 5,
    permissions: [
      'FormSubmission:read',
      'FormSubmission:update',
      'FormSubmission:export',
      'Product:read',
      'ProductSeries:read',
      'FaqItem:read',
    ],
  },
  {
    name: 'SEO专员',
    code: 'seo_specialist',
    description: '负责网站SEO优化',
    isSystem: true,
    priority: 6,
    permissions: [
      'SeoSetting:create',
      'SeoSetting:read',
      'SeoSetting:update',
      'SeoSetting:delete',
      'CustomScript:create',
      'CustomScript:read',
      'CustomScript:update',
      'CustomScript:delete',
      'CustomScript:inject_code',
      'Product:read',
      'Blog:read',
      'Application:read',
    ],
  },
  {
    name: '媒体管理员',
    code: 'media_manager',
    description: '负责媒体资源管理',
    isSystem: true,
    priority: 6,
    permissions: [
      'Media:create',
      'Media:read',
      'Media:update',
      'Media:delete',
      'MediaCategory:create',
      'MediaCategory:read',
      'MediaCategory:update',
      'MediaCategory:delete',
      'MediaTag:create',
      'MediaTag:read',
      'MediaTag:update',
      'MediaTag:delete',
      'Category:create',
      'Category:read',
      'Category:update',
      'Category:delete',
    ],
  },
]

/**
 * Seed permissions
 */
async function seedPermissions(context: Context): Promise<Map<string, string>> {
  console.log('\n🌱 Seeding permissions...')

  const permissionMap = new Map<string, string>() // identifier -> id

  // Fetch all existing permissions in a single query
  const existingPermissions = await context.sudo().query.Permission.findMany({
    query: 'id identifier',
  })

  // Create a map of existing permissions for fast lookup
  const existingMap = new Map<string, string>()
  for (const perm of existingPermissions) {
    existingMap.set(perm.identifier, perm.id)
  }

  // Determine which permissions need to be created
  const permissionsToCreate = []
  let existingCount = 0

  for (const perm of PERMISSIONS) {
    const identifier = `${perm.resource}:${perm.action}`

    if (existingMap.has(identifier)) {
      // Permission already exists
      permissionMap.set(identifier, existingMap.get(identifier)!)
      existingCount++
    } else {
      // Permission needs to be created
      permissionsToCreate.push({
        ...perm,
        identifier,
        isSystem: true,
      })
    }
  }

  // Batch create all missing permissions
  if (permissionsToCreate.length > 0) {
    console.log(`  ✓ Creating ${permissionsToCreate.length} new permissions...`)

    for (const permData of permissionsToCreate) {
      const created = await context.sudo().query.Permission.createOne({
        data: permData,
        query: 'id identifier',
      })
      permissionMap.set(created.identifier, created.id)
    }

    console.log(`  ✓ Created ${permissionsToCreate.length} permissions`)
  }

  if (existingCount > 0) {
    console.log(`  ⊙ ${existingCount} permissions already exist`)
  }

  console.log(`✅ ${PERMISSIONS.length} permissions initialized!`)
  return permissionMap
}

/**
 * Seed roles
 */
async function seedRoles(context: Context, permissionMap: Map<string, string>): Promise<void> {
  console.log('\n🌱 Seeding roles...')

  // Fetch all existing roles in a single query
  const existingRoles = await context.sudo().query.Role.findMany({
    query: 'id code name',
  })

  // Create a set of existing role codes for fast lookup
  const existingCodes = new Set(existingRoles.map((r) => r.code))

  // Determine which roles need to be created
  const rolesToCreate = []
  let existingCount = 0

  for (const roleData of ROLES) {
    if (existingCodes.has(roleData.code)) {
      existingCount++
    } else {
      rolesToCreate.push(roleData)
    }
  }

  // Batch create missing roles
  if (rolesToCreate.length > 0) {
    console.log(`  ✓ Creating ${rolesToCreate.length} new roles...`)

    for (const roleData of rolesToCreate) {
      // Get permission IDs
      let permissionIds: string[] = []

      if (roleData.permissions === '*') {
        // Super admin: all permissions
        permissionIds = Array.from(permissionMap.values())
      } else {
        // Regular role: specific permissions
        for (const identifier of roleData.permissions as string[]) {
          const permId = permissionMap.get(identifier)
          if (permId) {
            permissionIds.push(permId)
          } else {
            console.warn(`  ⚠️  Permission not found: ${identifier}`)
          }
        }
      }

      // Create role
      await context.sudo().query.Role.createOne({
        data: {
          name: roleData.name,
          code: roleData.code,
          description: roleData.description,
          isSystem: roleData.isSystem,
          priority: roleData.priority,
          isActive: true,
          permissions: {
            connect: permissionIds.map((id) => ({ id })),
          },
        },
      })

      console.log(`  ✓ Created role: ${roleData.name} (${permissionIds.length} permissions)`)
    }
  }

  if (existingCount > 0) {
    console.log(`  ⊙ ${existingCount} roles already exist`)
  }

  console.log(`✅ ${ROLES.length} roles initialized!`)
}

/**
 * Main seeding function
 */
export async function seedPermissionsSystem(context: Context): Promise<void> {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔐 Initializing RBAC Permissions System')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Step 1: Seed permissions
    const permissionMap = await seedPermissions(context)

    // Step 2: Seed roles
    await seedRoles(context, permissionMap)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ RBAC Permissions System Initialized!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (error) {
    console.error('\n❌ Failed to seed permissions system:', error)
    throw error
  }
}
