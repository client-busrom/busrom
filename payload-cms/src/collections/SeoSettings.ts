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

  versions: {
    maxPerDoc: 10,
  },
  fields: [
    // Translation Center
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
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
        { label: { en: 'Product Series List', zh: '产品系列列表' }, value: 'product_series_list' },
        { label: { en: 'Product Series Detail', zh: '产品系列详情' }, value: 'product_series_detail' },
        { label: { en: 'Shop List', zh: '商城列表' }, value: 'shop_list' },
        { label: { en: 'Shop Product Detail', zh: '商品详情' }, value: 'shop_detail' },
        { label: { en: 'Blog List', zh: '博客列表' }, value: 'blog_list' },
        { label: { en: 'Blog Detail', zh: '博客详情' }, value: 'blog_detail' },
        { label: { en: 'Applications', zh: '应用场景' }, value: 'applications' },
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
        components: {
          Field: '@/components/fields/PathSelector',
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
            components: {
              Field: '@/components/fields/MultiLocaleField#MultiLocaleTextareaField',
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
            components: {
              Field: '@/components/fields/MultiLocaleField#MultiLocaleTextareaField',
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
            components: {
              Field: '@/components/fields/MultiLocaleField#MultiLocaleTextareaField',
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
}
