/**
 * SeoSetting Model - SEO Configuration (SEO配置)
 *
 * Features:
 * - Global SEO settings + per-page SEO overrides
 * - Unified page matching logic (same as CustomScript)
 * - Open Graph (OG) meta tags for social sharing
 * - Schema.org structured data support
 * - Robots meta tag control
 * - Canonical URL management
 * - Multilingual hreflang support
 */

import { list } from '@keystone-6/core'
import {
  text,
  select,
  checkbox,
  timestamp,
  relationship,
  json,
} from '@keystone-6/core/fields'

export const SeoSetting = list({
  fields: {
    // ==================================================================
    // 🔑 Identifier (标识符)
    // ==================================================================

    /**
     * Identifier (标识符)
     *
     * Unique identifier for this SEO setting
     * Auto-generated based on scope/pageType or manually entered
     */
    identifier: text({
      isIndexed: 'unique',
      label: 'Identifier (标识符)',
      ui: {
        description: `Unique identifier for this SEO setting.

- Leave empty to auto-generate based on scope/pageType (recommended)
- Or manually enter a custom identifier

唯一标识符:
- 留空则根据scope/pageType自动生成(推荐)
- 或手动输入自定义标识符`,
      },
    }),

    // ==================================================================
    // 🎯 Page Matching (页面匹配) - Same as CustomScript!
    // ==================================================================

    /**
     * Application Scope (应用范围)
     */
    scope: select({
      type: 'enum',
      options: [
        { label: 'Global (All Pages) | 全局(所有页面)', value: 'global' },
        { label: 'Page Type | 页面类型', value: 'page_type' },
        { label: 'Exact Path | 精确路径', value: 'exact_path' },
        { label: 'Path Pattern (Wildcard) | 路径规则(通配符)', value: 'path_pattern' },
        { label: 'Related Content | 关联内容', value: 'related_content' },
      ],
      validation: { isRequired: true },
      defaultValue: 'global',
      label: 'Application Scope (应用范围)',
      ui: {
        displayMode: 'segmented-control',
        description: 'Determines which pages this SEO setting applies to | 决定此SEO配置应用于哪些页面',
      },
    }),

    // ---------- Option 1: Page Type ----------

    /**
     * Page Type (页面类型)
     */
    pageType: select({
      type: 'enum',
      options: [
        { label: 'Home | 首页', value: 'home' },

        // Product related
        { label: 'Product Series List (/product) | 产品系列列表页', value: 'product_series_list' },
        { label: 'Product Series Detail (/product/[series]) | 产品系列详情页', value: 'product_series_detail' },

        // Shop related
        { label: 'Shop List (/shop) | 商店列表页', value: 'shop_list' },
        { label: 'Shop Product Detail (/shop/[sku]) | 商店产品详情页', value: 'shop_detail' },

        // Blog related
        { label: 'Blog List (/about-us/blog) | 博客列表页', value: 'blog_list' },
        { label: 'Blog Detail (/about-us/blog/[slug]) | 博客详情页', value: 'blog_detail' },

        // Application related
        { label: 'Application List (/service/application) | 案例列表页', value: 'application_list' },
        { label: 'Application Detail (/service/application/[id]) | 案例详情页', value: 'application_detail' },

        // Service related
        { label: 'Service Overview (/service) | 服务概览页', value: 'service_overview' },
        { label: 'One-Stop Service (/service/one-stop-shop) | 一站式服务页', value: 'service_one_stop' },
        { label: 'FAQ Page (/service/faq) | FAQ页面', value: 'service_faq' },

        // About Us related
        { label: 'Our Story (/about-us/story) | 我们的故事', value: 'about_story' },
        { label: 'Support Page (/about-us/support) | 支持页面', value: 'about_support' },

        // Other pages
        { label: 'Contact Us (/contact-us) | 联系我们', value: 'contact' },
        { label: 'Privacy Policy (/privacy-policy) | 隐私政策', value: 'privacy_policy' },
        { label: 'Fraud Notice (/fraud-notice) | 欺诈提醒', value: 'fraud_notice' },

        // Custom page
        { label: '🔧 Custom Page (自定义页面)', value: 'custom' },
      ],
      label: 'Page Type (页面类型)',
      ui: {
        description: 'Active when scope is "Page Type" | 当应用范围为"页面类型"时生效',
      },
    }),

    /**
     * Custom Page Rule (自定义规则)
     */
    customPageRule: text({
      label: 'Custom Page Rule (自定义规则)',
      ui: {
        description: `Active when Page Type is "Custom". Supports:
- Exact path: /promo/summer-2024
- Wildcard: /promo/*
- Custom identifier: my-landing-page

当Page Type选择"Custom"时填写。支持:
- 精确路径: /promo/summer-2024
- 通配符: /promo/*
- 自定义标识符: my-landing-page`,
      },
    }),

    // ---------- Option 2: Exact Path ----------

    /**
     * Exact Path (精确路径)
     */
    exactPath: text({
      label: 'Exact Path (精确路径)',
      ui: {
        description: 'E.g., "/about-us/story", "/service/faq" | 例如: "/about-us/story", "/service/faq" (当应用范围为"精确路径"时生效)',
      },
    }),

    // ---------- Option 3: Path Pattern ----------

    /**
     * Path Pattern (路径规则)
     */
    pathPattern: text({
      label: 'Path Pattern (路径规则)',
      ui: {
        description: 'E.g., "/shop/*", "/blog/*" | 例如: "/shop/*", "/blog/*" (当应用范围为"路径规则"时生效)',
      },
    }),

    // ---------- Option 4: Related Content ----------

    /**
     * Related Page (关联页面) ⭐ NEW
     */
    relatedPage: relationship({
      ref: 'Page',
      label: 'Related Page (关联页面)',
      ui: {
        displayMode: 'select',
        labelField: 'path',
        description: 'Active when scope is "Related Content". Select a specific Page. | 当应用范围为"关联内容"时生效。选择特定页面。',
      },
    }),

    /**
     * Related Product (关联产品)
     */
    relatedProduct: relationship({
      ref: 'Product',
      label: 'Related Product (关联产品)',
      ui: {
        displayMode: 'select',
        description: 'Active when scope is "Related Content" | 当应用范围为"关联内容"时生效',
      },
    }),

    /**
     * Related Blog (关联博客)
     */
    relatedBlog: relationship({
      ref: 'Blog',
      label: 'Related Blog (关联博客)',
      ui: {
        displayMode: 'select',
        description: 'Active when scope is "Related Content" | 当应用范围为"关联内容"时生效',
      },
    }),

    /**
     * Related Application (关联案例)
     */
    relatedApplication: relationship({
      ref: 'Application',
      label: 'Related Application (关联案例)',
      ui: {
        displayMode: 'select',
        description: 'Active when scope is "Related Content" | 当应用范围为"关联内容"时生效',
      },
    }),

    /**
     * Related Product Series (关联产品系列)
     */
    relatedProductSeries: relationship({
      ref: 'ProductSeries',
      label: 'Related Product Series (关联产品系列)',
      ui: {
        displayMode: 'select',
        description: 'Active when scope is "Related Content" | 当应用范围为"关联内容"时生效',
      },
    }),

    // ==================================================================
    // 📝 Basic SEO Fields (基础SEO字段)
    // ==================================================================

    /**
     * SEO Title (SEO标题)
     */
    title: json({
      label: 'SEO Title (SEO标题)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Recommended less than 60 characters | 建议少于60个字符',
      },
    }),

    /**
     * SEO Description (SEO描述)
     */
    description: json({
      label: 'SEO Description (SEO描述)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Recommended less then 160 characters | 建议少于160个字符',
      },
    }),

    /**
     * SEO Keywords (SEO关键词)
     */
    keywords: json({
      label: 'Keywords (关键词)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Comma-separated keywords | 多个关键词用逗号分隔',
      },
    }),

    // ==================================================================
    // 📱 Open Graph (Social Sharing) (社交分享)
    // ==================================================================

    /**
     * OG Title (OG标题)
     */
    ogTitle: text({
      label: 'OG Title (OG标题)',
      ui: {
        description: 'Social sharing title. Leave empty to use SEO title | 社交分享标题,留空则使用SEO标题',
      },
    }),

    /**
     * OG Description (OG描述)
     */
    ogDescription: text({
      label: 'OG Description (OG描述)',
      ui: {
        displayMode: 'textarea',
        description: 'Social sharing description | 社交分享描述',
      },
    }),

    /**
     * OG Image (OG图片)
     */
    ogImage: relationship({
      ref: 'Media',
      label: 'OG Image (OG图片)',
      ui: {
        displayMode: 'cards',
        cardFields: ['filename'],
        description: 'Recommended size: 1200x630px | 推荐尺寸: 1200x630px',
      },
    }),

    // ==================================================================
    // 🏗️ Structured Data (Schema.org) (结构化数据)
    // ==================================================================

    /**
     * Schema Type (Schema类型)
     */
    schemaType: select({
      type: 'string',
      options: [
        { label: 'Organization | 组织', value: 'Organization' },
        { label: 'Product | 产品', value: 'Product' },
        { label: 'Article | 文章', value: 'Article' },
        { label: 'WebPage | 网页', value: 'WebPage' },
        { label: 'FAQPage | FAQ页面', value: 'FAQPage' },
      ],
      label: 'Schema Type (Schema类型)',
      ui: {
        description: 'Schema.org type for structured data | Schema.org结构化数据类型',
      },
    }),

    /**
     * Schema Data (Schema数据)
     */
    schemaData: text({
      label: 'Schema Data (Schema数据)',
      ui: {
        displayMode: 'textarea',
        description: 'Custom JSON-LD structured data | 自定义JSON-LD结构化数据',
      },
    }),

    // ==================================================================
    // 🌐 Multilingual Support (多语言支持)
    // ==================================================================

    /**
     * Hreflang Links Info (Hreflang链接说明)
     *
     * Note: This is a read-only informational field.
     * Hreflang links are automatically generated by the frontend based on:
     * - Available language versions of the current page
     * - URL structure and routing configuration
     *
     * 注意：这是一个只读的信息字段。
     * Hreflang链接由前端自动生成，基于：
     * - 当前页面的可用语言版本
     * - URL结构和路由配置
     */
    hreflangInfo: text({
      defaultValue: '✅ Hreflang links are auto-generated by frontend | Hreflang链接由前端自动生成',
      label: 'Hreflang Links (Hreflang链接)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        listView: { fieldMode: 'hidden' },
        description: `Read-only field. Hreflang links are automatically generated by the frontend.
只读字段。Hreflang链接由前端根据页面的可用语言版本自动生成。`,
      },
    }),

    // ==================================================================
    // 🤖 Robots Control (Robots控制)
    // ==================================================================

    /**
     * Allow Indexing (允许索引)
     */
    robotsIndex: checkbox({
      defaultValue: true,
      label: 'Allow Indexing (允许索引)',
      ui: {
        description: 'Allow search engines to index this page | 允许搜索引擎索引此页面',
      },
    }),

    /**
     * Allow Following Links (允许跟踪链接)
     */
    robotsFollow: checkbox({
      defaultValue: true,
      label: 'Allow Following Links (允许跟踪链接)',
      ui: {
        description: 'Allow search engines to follow links | 允许搜索引擎跟踪链接',
      },
    }),

    // ==================================================================
    // 🗺️ Sitemap Configuration (站点地图配置)
    // ==================================================================

    /**
     * Show in Sitemap (显示在站点地图)
     */
    showInSitemap: checkbox({
      defaultValue: true,
      label: 'Show in Sitemap (显示在站点地图)',
      ui: {
        description: 'Include this page in sitemap.xml | 是否在sitemap.xml中包含此页面',
      },
    }),

    /**
     * Sitemap Priority (站点地图优先级)
     */
    sitemapPriority: select({
      type: 'string',
      options: [
        { label: '1.0 (最高 - 首页)', value: '1.0' },
        { label: '0.8 (高 - 重要产品/服务页)', value: '0.8' },
        { label: '0.6 (中 - 一般内容页)', value: '0.6' },
        { label: '0.4 (低 - 博客文章/旧内容)', value: '0.4' },
        { label: '0.2 (很低)', value: '0.2' },
      ],
      defaultValue: '0.6',
      label: 'Sitemap Priority (站点地图优先级)',
      ui: {
        displayMode: 'select',
        description: 'Page priority in sitemap (0.0-1.0). Helps search engines understand relative importance | 页面在站点地图中的优先级(0.0-1.0),帮助搜索引擎了解页面相对重要性',
      },
    }),

    /**
     * Sitemap Change Frequency (更新频率)
     */
    sitemapChangeFreq: select({
      type: 'string',
      options: [
        { label: 'Always (总是)', value: 'always' },
        { label: 'Hourly (每小时)', value: 'hourly' },
        { label: 'Daily (每天)', value: 'daily' },
        { label: 'Weekly (每周)', value: 'weekly' },
        { label: 'Monthly (每月)', value: 'monthly' },
        { label: 'Yearly (每年)', value: 'yearly' },
        { label: 'Never (从不)', value: 'never' },
      ],
      defaultValue: 'monthly',
      label: 'Change Frequency (更新频率)',
      ui: {
        displayMode: 'select',
        description: 'How frequently the page content changes | 页面内容的更新频率',
      },
    }),

    // ==================================================================
    // 🔗 Canonical URL (规范URL)
    // ==================================================================

    /**
     * Canonical URL (规范URL)
     */
    canonicalUrl: text({
      label: 'Canonical URL (规范URL)',
      ui: {
        description: 'Canonical URL for this page | 此页面的规范URL',
      },
    }),

    // ==================================================================
    // 🕐 Timestamps (时间戳)
    // ==================================================================

    /**
     * Updated At (更新时间)
     */
    updatedAt: timestamp({
      db: { updatedAt: true },
      label: 'Updated At (更新时间)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  /**
   * Access Control
   */
  access: {
    operation: {
      query: () => true, // Frontend needs to read SEO settings
      create: ({ session }) => !!session,
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session,
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['identifier', 'scope', 'pageType', 'title', 'robotsIndex', 'updatedAt'],
      initialSort: { field: 'identifier', direction: 'ASC' },
      pageSize: 50,
    },
    labelField: 'identifier',
    label: 'SEO Settings | SEO设置',
    singular: 'SEO Setting | SEO设置',
    plural: 'SEO Settings | SEO设置',
  },

  /**
   * Hooks
   */
  hooks: {
    // Auto-generate identifier if empty
    resolveInput: async ({ resolvedData, operation, context }) => {
      // Auto-generate identifier for new items
      if (operation === 'create' && !resolvedData.identifier) {
        resolvedData.identifier = await generateIdentifier(resolvedData, context)
      }

      return resolvedData
    },

    // Validation logic
    validateInput: async ({ resolvedData, addValidationError }) => {
      if (resolvedData.scope) {
        switch (resolvedData.scope) {
          case 'page_type':
            if (!resolvedData.pageType) {
              addValidationError('Page Type is required when scope is "Page Type" | 当应用范围为"页面类型"时,页面类型为必填')
            }

            if (resolvedData.pageType === 'custom' && !resolvedData.customPageRule) {
              addValidationError('Custom Page Rule is required when Page Type is "Custom" | 当页面类型为"自定义"时,自定义规则为必填')
            }
            break

          case 'exact_path':
            if (!resolvedData.exactPath) {
              addValidationError('Exact Path is required when scope is "Exact Path" | 当应用范围为"精确路径"时,精确路径为必填')
            }
            break

          case 'path_pattern':
            if (!resolvedData.pathPattern) {
              addValidationError('Path Pattern is required when scope is "Path Pattern" | 当应用范围为"路径规则"时,路径规则为必填')
            }
            break

          case 'related_content':
            const hasRelated =
              resolvedData.relatedPage ||
              resolvedData.relatedProduct ||
              resolvedData.relatedBlog ||
              resolvedData.relatedApplication ||
              resolvedData.relatedProductSeries
            if (!hasRelated) {
              addValidationError('At least one related content item is required when scope is "Related Content" | 当应用范围为"关联内容"时,至少需要关联一个内容')
            }
            break
        }
      }
    },

    // ActivityLog: Log all operations
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation as any, 'SeoSetting', item, undefined, originalItem)
      }
    },
  },
})

/**
 * Helper function: Auto-generate identifier
 */
async function generateIdentifier(data: any, context: any): Promise<string> {
  if (data.scope === 'global') {
    return 'global'
  }

  if (data.scope === 'page_type' && data.pageType && data.pageType !== 'custom') {
    return data.pageType // "home", "blog_list", etc.
  }

  if (data.scope === 'page_type' && data.pageType === 'custom' && data.customPageRule) {
    // Generate identifier from customPageRule
    if (data.customPageRule.startsWith('/')) {
      return data.customPageRule.replace(/^\//, '').replace(/\//g, '-').replace(/\*/g, 'wildcard')
    }
    return data.customPageRule
  }

  if (data.scope === 'exact_path' && data.exactPath) {
    return data.exactPath.replace(/^\//, '').replace(/\//g, '-')
  }

  if (data.scope === 'path_pattern' && data.pathPattern) {
    return data.pathPattern.replace(/^\//, '').replace(/\//g, '-').replace(/\*/g, 'wildcard')
  }

  if (data.scope === 'related_content') {
    if (data.relatedPage?.connect?.id) {
      const page = await context.query.Page.findOne({
        where: { id: data.relatedPage.connect.id },
        query: 'slug path',
      })
      return `page-${page.slug}`
    }

    if (data.relatedBlog?.connect?.id) {
      const blog = await context.query.Blog.findOne({
        where: { id: data.relatedBlog.connect.id },
        query: 'slug',
      })
      return `blog-${blog.slug}`
    }

    if (data.relatedProduct?.connect?.id) {
      const product = await context.query.Product.findOne({
        where: { id: data.relatedProduct.connect.id },
        query: 'sku',
      })
      return `product-${product.sku}`
    }

    if (data.relatedApplication?.connect?.id) {
      const app = await context.query.Application.findOne({
        where: { id: data.relatedApplication.connect.id },
        query: 'id',
      })
      return `application-${app.id}`
    }

    if (data.relatedProductSeries?.connect?.id) {
      const series = await context.query.ProductSeries.findOne({
        where: { id: data.relatedProductSeries.connect.id },
        query: 'slug',
      })
      return `series-${series.slug}`
    }
  }

  // Fallback: generate random identifier
  return `seo-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}
