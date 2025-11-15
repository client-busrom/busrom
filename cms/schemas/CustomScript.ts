/**
 * CustomScript Model - Custom Code Management
 *
 * Features:
 * - Store tracking scripts (Google Analytics, TikTok Pixel, etc.)
 * - Flexible scope configuration (global, page type, exact path, etc.)
 * - Security validation for script content
 * - Priority-based loading order
 * - Enable/disable toggle for easy testing
 */

import { list } from '@keystone-6/core'
import {
  text,
  select,
  checkbox,
  timestamp,
  relationship,
  integer,
} from '@keystone-6/core/fields'

export const CustomScript = list({
  fields: {
    // ==================================================================
    // 📝 Basic Information
    // ==================================================================

    /**
     * Script Name (脚本名称)
     *
     * Examples: "Google Analytics", "TikTok Pixel", "Facebook Pixel"
     */
    name: text({
      validation: { isRequired: true },
      label: 'Script Name (脚本名称)',
      ui: {
        description: 'Script name (e.g., "Google Analytics", "TikTok Pixel") | 脚本名称(如: "Google Analytics", "TikTok Pixel")',
      },
    }),

    /**
     * Description (描述)
     */
    description: text({
      label: 'Description (描述)',
      ui: {
        displayMode: 'textarea',
        description: 'Optional notes about this script | 关于此脚本的可选备注',
      },
    }),

    // ==================================================================
    // 📄 Script Content
    // ==================================================================

    /**
     * Injection Position (注入位置)
     *
     * Where the script should be injected in the HTML
     */
    scriptPosition: select({
      type: 'enum',
      options: [
        { label: 'Header (before </head>) | 头部(在</head>前)', value: 'header' },
        { label: 'Footer (before </body>) | 底部(在</body>前)', value: 'footer' },
        { label: 'Body Start (after <body>) | Body开始(在<body>后)', value: 'body_start' },
      ],
      validation: { isRequired: true },
      defaultValue: 'header',
      label: 'Injection Position (注入位置)',
      ui: {
        displayMode: 'segmented-control',
      },
    }),

    /**
     * Script Content (脚本内容)
     *
     * The actual script code to inject
     */
    content: text({
      validation: { isRequired: true },
      label: 'Script Content (脚本内容)',
      ui: {
        displayMode: 'textarea',
        description: 'Enter complete <script> tag or other code | 请输入完整的<script>标签或其他代码',
      },
    }),

    // ==================================================================
    // 🎯 Scope Configuration
    // ==================================================================

    /**
     * Application Scope (应用范围)
     *
     * Determines where this script should be loaded
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
        description: 'Determines where this script will be loaded | 决定此脚本在哪些页面加载',
      },
    }),

    // ---------- Option 1: Page Type ----------

    /**
     * Page Type (页面类型)
     *
     * Used when scope is "page_type"
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
     *
     * Used when pageType is "custom"
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
     *
     * Used when scope is "exact_path"
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
     *
     * Used when scope is "path_pattern"
     */
    pathPattern: text({
      label: 'Path Pattern (路径规则)',
      ui: {
        description: 'E.g., "/shop/*", "/blog/*", "/product/glass-*" | 例如: "/shop/*", "/blog/*" (当应用范围为"路径规则"时生效)',
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
    // ⚙️ Advanced Options
    // ==================================================================

    /**
     * Enabled Status (启用状态)
     */
    enabled: checkbox({
      defaultValue: false,
      label: 'Enabled (启用)',
      ui: {
        description: 'Disabled scripts will not be loaded | 禁用的脚本不会被加载',
      },
    }),

    /**
     * Loading Priority (加载优先级)
     *
     * Lower numbers = higher priority (loaded first)
     */
    priority: integer({
      defaultValue: 5,
      validation: {
        min: 1,
        max: 10,
      },
      label: 'Priority (优先级)',
      ui: {
        description: 'Lower number = higher priority (1-10) | 数字越小优先级越高(1-10)',
      },
    }),

    /**
     * Async Loading (异步加载)
     */
    async: checkbox({
      defaultValue: false,
      label: 'Async (异步)',
      ui: {
        description: 'For scripts that don\'t need to execute immediately | 适用于不需要立即执行的脚本',
      },
    }),

    /**
     * Defer Loading (延迟加载)
     */
    defer: checkbox({
      defaultValue: false,
      label: 'Defer (延迟)',
      ui: {
        description: 'Script executes after page parsing completes | 脚本在页面解析完成后执行',
      },
    }),

    // ==================================================================
    // 📦 Version Management
    // ==================================================================

    /**
     * Version Number (版本号)
     */
    version: text({
      defaultValue: '1.0',
      label: 'Version (版本)',
      ui: {
        description: 'Script version for tracking changes | 脚本版本号',
      },
    }),

    // ==================================================================
    // 🕐 Timestamps
    // ==================================================================

    /**
     * Created At
     */
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    /**
     * Updated At
     */
    updatedAt: timestamp({
      db: { updatedAt: true },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    /**
     * Last Tested At
     */
    lastTestedAt: timestamp({
      ui: {
        description: 'Record when this script was last verified to work correctly',
      },
    }),
  },

  /**
   * Access Control
   */
  access: {
    operation: {
      query: () => true, // Frontend needs to read scripts
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
      initialColumns: ['name', 'scope', 'enabled', 'priority', 'updatedAt'],
      initialSort: { field: 'priority', direction: 'ASC' },
      pageSize: 50,
    },
    labelField: 'name',
  },

  /**
   * Hooks
   */
  hooks: {
    /**
     * ActivityLog - Record all operations
     */
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation as any, 'CustomScript', item, undefined, originalItem)
      }
    },

    /**
     * Validation - Ensure scope-specific fields are filled
     */
    validateInput: async ({ resolvedData, addValidationError }) => {
      // Validate scope-specific fields
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

      // Validate async and defer not both enabled
      if (resolvedData.async && resolvedData.defer) {
        addValidationError('Async and Defer cannot both be enabled | 异步和延迟不能同时启用')
      }
    },
  },
})
