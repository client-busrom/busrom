/**
 * SeoSettings Collection - SEO Configuration
 *
 * Features:
 * - Global SEO settings + per-page SEO overrides
 * - Open Graph (OG) meta tags for social sharing
 * - Schema.org structured data support
 * - Robots meta tag control
 * - Canonical URL management
 */

import type { CollectionConfig } from 'payload'

export const SeoSettings: CollectionConfig = {
  slug: 'seo-settings',
  labels: {
    singular: {
      en: 'SEO Setting',
      zh: 'SEO 配置',
    },
    plural: {
      en: 'SEO Settings',
      zh: 'SEO 配置',
    },
  },
  admin: {
    useAsTitle: 'identifier',
    defaultColumns: ['identifier', 'scope', 'pageType', 'updatedAt'],
    group: {
      en: 'Settings',
      zh: '系统设置',
    },
    description: {
      en: 'SEO configuration for pages',
      zh: '页面 SEO 配置',
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },

  // 版本控制 - 保留修改历史
  // versions: {

  // maxPerDoc: 10,

  // },

  fields: [
    // Auto Draft - 自动保存草稿到 localStorage
    {
      name: 'autoDraft',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        components: {
          Field: '@/components/fields/AutoDraft',
        },
      },
    },
    // Translation Center
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
      },
    },
    // ==================================================================
    // Identifier
    // ==================================================================
    {
      name: 'identifier',
      type: 'text',
      label: {
        en: 'Identifier',
        zh: '标识符',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'Unique identifier for this SEO setting',
          zh: '此 SEO 配置的唯一标识符',
        },
      },
    },

    // ==================================================================
    // Page Matching
    // ==================================================================
    {
      name: 'scope',
      type: 'select',
      label: {
        en: 'Application Scope',
        zh: '应用范围',
      },
      required: true,
      defaultValue: 'global',
      options: [
        { label: { en: 'Global (All Pages)', zh: '全局（所有页面）' }, value: 'global' },
        { label: { en: 'Page Type', zh: '页面类型' }, value: 'page_type' },
        { label: { en: 'Exact Path', zh: '精确路径' }, value: 'exact_path' },
        { label: { en: 'Path Pattern (Wildcard)', zh: '路径规则（通配符）' }, value: 'path_pattern' },
      ],
    },
    {
      name: 'pageType',
      type: 'select',
      label: {
        en: 'Page Type',
        zh: '页面类型',
      },
      options: [
        { label: { en: 'Home', zh: '首页' }, value: 'home' },
        { label: { en: 'Product Overview Page', zh: '产品概览页' }, value: 'product_series_list' },
        { label: { en: 'Product Detail Page', zh: '产品详解页' }, value: 'product_series_detail' },
        { label: { en: 'Shop List Page', zh: 'shop列表页' }, value: 'shop_list' },
        { label: { en: 'Product Link Integration Page', zh: '产品链接整合页' }, value: 'shop_detail' },
        { label: { en: 'Knowledge Base Overview', zh: '知识库概览页' }, value: 'blog' },
        { label: { en: 'Knowledge Base List', zh: '知识库列表页' }, value: 'blogs' },
        { label: { en: 'Knowledge Base Detail', zh: '知识库详情页' }, value: 'blog_detail' },

      ],
      admin: {
        condition: (data) => data.scope === 'page_type',
      },
    },
    {
      name: 'exactPath',
      type: 'text',
      label: {
        en: 'Exact Path',
        zh: '精确路径',
      },
      admin: {
        condition: (data) => data.scope === 'exact_path',
        components: {
          Field: '@/components/fields/PathSelector',
        },
      },
    },
    {
      name: 'pathPattern',
      type: 'text',
      label: {
        en: 'Path Pattern',
        zh: '路径规则',
      },
      admin: {
        condition: (data) => data.scope === 'path_pattern',
        description: {
          en: 'Supports wildcards: /products/* or /blog/**',
          zh: '支持使用通配符，例如 /products/* 或 /blog/**',
        },
      },
    },
    {
      name: 'conflictAnalysis',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/fields/SeoConflictAnalysis',
        },
      },
    },
    {
      name: 'isMainSeo',
      type: 'checkbox',
      label: {
        en: 'Set as Main SEO (Primary)',
        zh: '设为主 SEO (展示标题/描述)',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        description: {
          en: 'If checked, this item will provide the Meta Title and Description for the page. Other matching items will only be used for hidden long-tail keywords.',
          zh: '勾选后，该项将提供页面的主标题和描述。同路径下的其他配置将仅作为隐藏长尾词使用。',
        },
      },
    },

    // ==================================================================
    // SEO Fields
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Basic SEO',
        zh: '基础 SEO',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'textarea',
          label: {
            en: 'Meta Title',
            zh: 'Meta 标题',
          },
          localized: true,
          admin: {
            description: {
              en: 'Override page title for SEO (50-60 characters recommended)',
              zh: '覆盖页面的 SEO 标题（建议 50-60 个字符）',
            },
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: {
            en: 'Meta Description',
            zh: 'Meta 描述',
          },
          localized: true,
          admin: {
            description: {
              en: '150-160 characters recommended',
              zh: '建议 150-160 个字符',
            },
          },
        },
        {
          name: 'metaKeywords',
          type: 'textarea',
          label: {
            en: 'Meta Keywords',
            zh: 'Meta 关键词',
          },
          localized: true,
          admin: {
            description: {
              en: 'Comma-separated keywords',
              zh: '用逗号分隔的关键词',
            },
          },
        },
      ],
    },

    // ==================================================================
    // Open Graph
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Open Graph',
        zh: 'Open Graph 社交分享',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'ogTitle',
          type: 'textarea',
          label: {
            en: 'OG Title',
            zh: 'OG 标题',
          },
          localized: true,
          admin: {
            description: {
              en: 'Title displayed when shared on social media',
              zh: '在社交媒体分享时显示的标题',
            },
          },
        },
        {
          name: 'ogDescription',
          type: 'textarea',
          label: {
            en: 'OG Description',
            zh: 'OG 描述',
          },
          localized: true,
          admin: {
            description: {
              en: 'Description displayed when shared on social media',
              zh: '在社交媒体分享时显示的描述',
            },
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: {
            en: 'OG Image',
            zh: 'OG 图片',
          },
          admin: {
            description: {
              en: 'Image displayed when shared on social media (1200x630px recommended)',
              zh: '在社交媒体分享时显示的图片（建议 1200x630 像素）',
            },
            components: {
              Field: '@/components/fields/MediaPicker',
            },
          },
        },
        {
          name: 'ogType',
          type: 'select',
          label: {
            en: 'OG Type',
            zh: 'OG 类型',
          },
          defaultValue: 'website',
          options: [
            { label: { en: 'Website', zh: '网站' }, value: 'website' },
            { label: { en: 'Article', zh: '文章' }, value: 'article' },
            { label: { en: 'Product', zh: '产品' }, value: 'product' },
          ],
          admin: {
            description: {
              en: 'Type of content for social sharing',
              zh: '社交分享的内容类型',
            },
          },
        },
      ],
    },

    // ==================================================================
    // Robots & Canonical
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Robots & Canonical',
        zh: 'Robots 和 Canonical',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'robotsIndex',
          type: 'checkbox',
          label: {
            en: 'Allow Indexing',
            zh: '允许索引',
          },
          defaultValue: true,
          admin: {
            description: {
              en: 'Allow search engines to index this page',
              zh: '允许搜索引擎索引此页面',
            },
          },
        },
        {
          name: 'robotsFollow',
          type: 'checkbox',
          label: {
            en: 'Allow Following Links',
            zh: '允许跟踪链接',
          },
          defaultValue: true,
          admin: {
            description: {
              en: 'Allow search engines to follow links on this page',
              zh: '允许搜索引擎跟踪此页面上的链接',
            },
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          label: {
            en: 'Canonical URL',
            zh: '规范链接',
          },
          admin: {
            description: {
              en: 'Leave empty to use default page URL',
              zh: '留空则使用默认页面 URL',
            },
          },
        },
      ],
    },

    // ==================================================================
    // Sitemap Configuration
    // ==================================================================
    {
      type: 'collapsible',
      label: {
        en: 'Sitemap',
        zh: 'Sitemap 配置',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'includeInSitemap',
          type: 'checkbox',
          label: {
            en: 'Include in Sitemap',
            zh: '包含在 Sitemap 中',
          },
          defaultValue: true,
          admin: {
            description: {
              en: 'Include this page in the sitemap.xml',
              zh: '将此页面包含在 sitemap.xml 中',
            },
          },
        },
        {
          name: 'sitemapPriority',
          type: 'number',
          label: {
            en: 'Sitemap Priority',
            zh: 'Sitemap 优先级',
          },
          defaultValue: 0.5,
          min: 0,
          max: 1,
          admin: {
            step: 0.1,
            description: {
              en: '0.0 - 1.0 (higher = more important)',
              zh: '0.0 - 1.0（越高越重要）',
            },
          },
        },
        {
          name: 'sitemapChangefreq',
          type: 'select',
          label: {
            en: 'Change Frequency',
            zh: '更新频率',
          },
          defaultValue: 'weekly',
          options: [
            { label: { en: 'Always', zh: '始终' }, value: 'always' },
            { label: { en: 'Hourly', zh: '每小时' }, value: 'hourly' },
            { label: { en: 'Daily', zh: '每天' }, value: 'daily' },
            { label: { en: 'Weekly', zh: '每周' }, value: 'weekly' },
            { label: { en: 'Monthly', zh: '每月' }, value: 'monthly' },
            { label: { en: 'Yearly', zh: '每年' }, value: 'yearly' },
            { label: { en: 'Never', zh: '从不' }, value: 'never' },
          ],
          admin: {
            description: {
              en: 'How often this page is likely to change',
              zh: '此页面可能更新的频率',
            },
          },
        },
      ],
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        // If isMainSeo is being set to true
        if (data.isMainSeo === true && (originalDoc?.isMainSeo !== true)) {
          const { payload } = req
          const { scope, pageType, exactPath, pathPattern } = data

          // Define finding criteria for "items with same matching precision"
          const where: any = {
            id: { not_equals: originalDoc?.id || '' }, // Exclude self
            scope: { equals: scope },
            isMainSeo: { equals: true },
          }

          if (scope === 'page_type') where.pageType = { equals: pageType }
          if (scope === 'exact_path') where.exactPath = { equals: exactPath }
          if (scope === 'path_pattern') where.pathPattern = { equals: pathPattern }

          // Find other docs that are currently marked as Main SEO for the same target
          const others = await payload.find({
            collection: 'seo-settings',
            where,
            depth: 0,
            limit: 100,
          })

          // Uncheck them
          if (others.docs.length > 0) {
            await Promise.all(
              others.docs.map((doc) =>
                payload.update({
                  collection: 'seo-settings',
                  id: doc.id,
                  data: { isMainSeo: false } as any,
                })
              )
            )
          }
        }
        return data
      },
    ],
  },
}
