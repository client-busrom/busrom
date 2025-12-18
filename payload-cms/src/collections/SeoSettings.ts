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
    description: 'SEO configuration for pages',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
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
        description: 'Unique identifier for this SEO setting',
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
        { label: 'Global (All Pages) | 全局', value: 'global' },
        { label: 'Page Type | 页面类型', value: 'page_type' },
        { label: 'Exact Path | 精确路径', value: 'exact_path' },
        { label: 'Path Pattern (Wildcard) | 路径规则', value: 'path_pattern' },
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
        { label: 'Home | 首页', value: 'home' },
        { label: 'Product Series List', value: 'product_series_list' },
        { label: 'Product Series Detail', value: 'product_series_detail' },
        { label: 'Shop List', value: 'shop_list' },
        { label: 'Shop Product Detail', value: 'shop_detail' },
        { label: 'Blog List', value: 'blog_list' },
        { label: 'Blog Detail', value: 'blog_detail' },
        { label: 'Application List', value: 'application_list' },
        { label: 'Application Detail', value: 'application_detail' },
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
        description: 'e.g., /product/* or /blog/**',
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
          type: 'text',
          label: {
            en: 'Meta Title',
            zh: 'Meta 标题',
          },
          localized: true,
          admin: {
            description: 'Override page title for SEO',
            components: {
              Field: '@/components/fields/MultiLocaleField#MultiLocaleTextField',
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
            description: '150-160 characters recommended',
            components: {
              Field: '@/components/fields/MultiLocaleField#MultiLocaleTextareaField',
            },
          },
        },
        {
          name: 'metaKeywords',
          type: 'text',
          label: {
            en: 'Meta Keywords',
            zh: 'Meta 关键词',
          },
          localized: true,
          admin: {
            description: 'Comma-separated keywords',
            components: {
              Field: '@/components/fields/MultiLocaleField#MultiLocaleTextField',
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
      label: 'Open Graph',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'ogTitle',
          type: 'text',
          label: 'OG Title',
          localized: true,
          admin: {
            components: {
              Field: '@/components/fields/MultiLocaleField#MultiLocaleTextField',
            },
          },
        },
        {
          name: 'ogDescription',
          type: 'textarea',
          label: 'OG Description',
          localized: true,
          admin: {
            components: {
              Field: '@/components/fields/MultiLocaleField#MultiLocaleTextareaField',
            },
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'OG Image',
          admin: {
            components: {
              Field: '@/components/fields/MediaPicker',
            },
          },
        },
        {
          name: 'ogType',
          type: 'select',
          label: 'OG Type',
          defaultValue: 'website',
          options: [
            { label: 'Website', value: 'website' },
            { label: 'Article', value: 'article' },
            { label: 'Product', value: 'product' },
          ],
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
          label: 'Allow Indexing',
          defaultValue: true,
        },
        {
          name: 'robotsFollow',
          type: 'checkbox',
          label: 'Allow Following Links',
          defaultValue: true,
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          label: 'Canonical URL',
          admin: {
            description: 'Leave empty to use default page URL',
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
          label: 'Include in Sitemap',
          defaultValue: true,
        },
        {
          name: 'sitemapPriority',
          type: 'number',
          label: 'Sitemap Priority',
          defaultValue: 0.5,
          min: 0,
          max: 1,
          admin: {
            step: 0.1,
            description: '0.0 - 1.0',
          },
        },
        {
          name: 'sitemapChangefreq',
          type: 'select',
          label: 'Change Frequency',
          defaultValue: 'weekly',
          options: [
            { label: 'Always', value: 'always' },
            { label: 'Hourly', value: 'hourly' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' },
            { label: 'Never', value: 'never' },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
