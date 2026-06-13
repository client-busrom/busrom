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

// Local cache for SEO matching to prevent DB overload during Next.js SSG build
const seoDataCache = new Map<string, { time: number; data: any[] }>()
const seoPromiseCache = new Map<string, Promise<any[]>>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function matchPathPattern(pattern: string, path: string): boolean {
  if (!pattern) return false
  const normalizedPattern = pattern.replace(/^\/|\/$/g, '')
  const normalizedPath = path.replace(/^\/|\/$/g, '')

  const regexPattern = normalizedPattern
    .split('/')
    .map(segment => {
      if (segment === '**') return '.*'
      if (segment === '*') return '[^/]+'
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')

  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(normalizedPath)
}

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
    create: ({ req }: { req: any }) => !!req.user,
    update: ({ req }: { req: any }) => !!req.user,
    delete: ({ req }: { req: any }) => !!req.user,
  },
  endpoints: [
    {
      path: '/match',
      method: 'get',
      handler: async (req: any) => {
        try {
          const path = (req.query.path as string) || '/'
          const pageType = req.query.pageType as string
          const locale = (req.query.locale as string) || 'en'

          const cacheKey = `${locale}`
          let allSettings: any[] = []
          const now = Date.now()

          // Check in-memory cache
          if (seoDataCache.has(cacheKey) && now - seoDataCache.get(cacheKey)!.time < CACHE_TTL) {
            allSettings = seoDataCache.get(cacheKey)!.data
          } else if (seoPromiseCache.has(cacheKey)) {
            allSettings = await seoPromiseCache.get(cacheKey)!
          } else {
            // Fetch all rules with depth 0 to avoid DB overhead
            const p = req.payload.find({
              collection: 'seo-settings',
              limit: 1000,
              depth: 0,
              locale: locale as any,
            }).then((result: any) => {
              const docs = result.docs
              seoDataCache.set(cacheKey, { time: Date.now(), data: docs })
              seoPromiseCache.delete(cacheKey)
              return docs
            })
            seoPromiseCache.set(cacheKey, p)
            allSettings = await p
          }

          // Strip locale prefixes
          const normalizedPath =
            path.replace(/^\/(en|zh|de|fr|es|pt|it|nl|pl|ru|ja|ko|ar|th|vi|id|ms|tr|hi|bn)/, '') || '/'

          const matches: { setting: any; priority: number }[] = []

          // Find matches
          for (const setting of allSettings) {
            let priority = 0
            let isMatch = false

            if (setting.scope === 'exact_path' && setting.exactPath === normalizedPath) {
              priority = 4
              isMatch = true
            } else if (
              setting.scope === 'path_pattern' &&
              setting.pathPattern &&
              matchPathPattern(setting.pathPattern, normalizedPath)
            ) {
              priority = 3
              isMatch = true
            } else if (setting.scope === 'page_type' && pageType && setting.pageType === pageType) {
              priority = 2
              isMatch = true
            } else if (setting.scope === 'global') {
              priority = 1
              isMatch = true
            }

            if (isMatch) {
              matches.push({ setting, priority })
            }
          }

          // If no matches, just fallback to global ones
          let allMatches = matches.length > 0 ? matches : allSettings.filter(s => s.scope === 'global').map(s => ({ setting: s, priority: 1 }))

          // Sort matches
          // 1. isMainSeo = true comes first
          // 2. priority (exact > pattern > type > global)
          // 3. createdAt
          allMatches.sort((a, b) => {
            if (a.setting.isMainSeo !== b.setting.isMainSeo) {
              return a.setting.isMainSeo ? -1 : 1
            }
            if (a.priority !== b.priority) {
              return b.priority - a.priority
            }
            const timeA = a.setting.createdAt ? new Date(a.setting.createdAt).getTime() : 0
            const timeB = b.setting.createdAt ? new Date(b.setting.createdAt).getTime() : 0
            return timeA - timeB
          })

          const highestPriority = allMatches.length > 0 ? { ...allMatches[0].setting } : null

          // Populate ogImage if needed, since depth=0 was used
          if (highestPriority && highestPriority.ogImage && typeof highestPriority.ogImage === 'number') {
            try {
              const media = await req.payload.findByID({
                collection: 'media',
                id: highestPriority.ogImage,
                depth: 0,
              })
              highestPriority.ogImage = media
            } catch (err) {
              // Ignore invalid media IDs
            }
          }

          // Extract text for distribution
          const textsForDistribution: string[] = []

          const extractText = (s: any) => {
            const texts: string[] = []
            if (s.metaTitle) texts.push(s.metaTitle)
            if (s.metaDescription) texts.push(s.metaDescription)
            if (s.metaKeywords) {
              const keywords = s.metaKeywords
                .split(/[,\n]/)
                .map((k: string) => k.trim())
                .filter((k: string) => k.length > 0)
              texts.push(...keywords)
            }
            return texts
          }

          if (allMatches.length > 0) {
            const first = allMatches[0].setting
            // For the main SEO, only take keywords for distribution to avoid duplicating title/desc in hidden fields
            if (first.metaKeywords) {
              const keywords = first.metaKeywords
                .split(/[,\n]/)
                .map((k: string) => k.trim())
                .filter((k: string) => k.length > 0)
              textsForDistribution.push(...keywords)
            }
            // For secondary matching records, take everything
            for (let i = 1; i < allMatches.length; i++) {
              textsForDistribution.push(...extractText(allMatches[i].setting))
            }
          }

          // Remove duplicates and shuffle
          const uniqueTexts = [...new Set(textsForDistribution)]
          const shuffled = [...uniqueTexts]
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
          }

          const total = shuffled.length

          // Distribution Logic - EXCLUDING VISIBLE INTERACTIVE ONES (imgTitles, linkTitles, placeholders)
          const distributedKeywords = {
            imgAlts: [] as string[],
            ariaLabels: [] as string[],
            ariaDescribedby: [] as string[],
            srOnlyLabels: [] as string[],
            dataAttributes: [] as string[],
            totalKeywords: total,
          }

            if (total > 0) {
              let currentIndex = 0
              // Distribute across strictly organic elements:
              // 42% imgAlts, 30% ariaLabels, 15% ariaDescribedby, 10% srOnlyLabels, 3% dataAttributes
              const imgAltsCount = Math.floor(total * 0.42)
              distributedKeywords.imgAlts = shuffled.slice(currentIndex, currentIndex + imgAltsCount)
              currentIndex += imgAltsCount

              const ariaLabelsCount = Math.floor(total * 0.30)
              distributedKeywords.ariaLabels = shuffled.slice(currentIndex, currentIndex + ariaLabelsCount)
              currentIndex += ariaLabelsCount

              const ariaDescribedbyCount = Math.floor(total * 0.15)
              distributedKeywords.ariaDescribedby = shuffled.slice(currentIndex, currentIndex + ariaDescribedbyCount)
              currentIndex += ariaDescribedbyCount

              const srOnlyLabelsCount = Math.floor(total * 0.10)
              distributedKeywords.srOnlyLabels = shuffled.slice(currentIndex, currentIndex + srOnlyLabelsCount)
              currentIndex += srOnlyLabelsCount

              const dataAttributesCount = Math.floor(total * 0.03)
              distributedKeywords.dataAttributes = shuffled.slice(currentIndex, currentIndex + dataAttributesCount)
              currentIndex += dataAttributesCount
              
              // If there are any remainders due to Math.floor, append them to imgAlts
              if (currentIndex < total) {
                distributedKeywords.imgAlts.push(...shuffled.slice(currentIndex))
              }
            }

          return Response.json({
            setting: highestPriority,
            distributedKeywords,
          }, { status: 200 })
        } catch (error) {
          console.error('[SEO Match Endpoint] Error:', error)
          return Response.json({ error: 'Internal Server Error' }, { status: 500 })
        }
      },
    },
  ],

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
      type: 'textarea',
      label: {
        en: 'Admin Label',
        zh: '内部管理标识',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'Internal label used to identify this SEO setting in the admin list (does not affect the frontend)',
          zh: '仅用于在后台列表中区分和查找，不会影响前台页面的实际展示。',
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
        condition: (data: any) => data.scope === 'page_type',
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
        condition: (data: any) => data.scope === 'exact_path',
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
        condition: (data: any) => data.scope === 'path_pattern',
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
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }: any) => {
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
              others.docs.map((doc: any) =>
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
