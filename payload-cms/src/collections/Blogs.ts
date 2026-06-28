/**
 * Blogs Collection - Blog Posts/Articles
 *
 * Features:
 * - 24-language support using Payload's native localization
 * - Rich text content with Lexical editor
 * - Category support
 * - Featured image
 * - Soft delete (status: published/draft/archived)
 * - Tabbed admin interface
 */

import type { CollectionConfig } from 'payload'
import { syncM2M, cleanupM2M } from '../hooks/syncM2M'
import { autoIndexHook } from '../hooks/autoIndex'
import { autoIndexDeleteHook } from '../hooks/autoIndexDelete'
import { createKBWidgetField, KB_WIDGET_SUBFIELDS } from '../fields/knowledgeBaseWidgets'
import { LABELS, OPTIONS } from '../i18n/admin-labels'

import { formatSlug } from '../hooks/formatSlug'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  labels: {
    singular: {
      en: 'Blog',
      zh: '知识库',
    },
    plural: {
      en: 'Blogs',
      zh: '知识库',
    },
  },
  admin: {
    useAsTitle: 'title',
    livePreview: {
      url: ({ data, req }) => {
        const secret = process.env.PAYLOAD_PUBLIC_DRAFT_SECRET || 'busrom-draft-secret-2026'

        // Dynamically get the host so it works across localhost and local IPs (e.g. 192.168.x.x)
        const host = req.headers?.get ? req.headers.get('host') : (req.headers as any)?.host
        const hostname = host ? host.split(':')[0] : 'localhost'
        const baseUrl = process.env.PAYLOAD_PUBLIC_SITE_URL || `http://${hostname}:3001`

        const locale = req.locale === 'all' || !req.locale ? 'en' : req.locale
        const prefix = locale === 'en' ? '' : `/${locale}`
        return `${baseUrl}/api/preview?url=${encodeURIComponent(`${prefix}/knowledge-base-blog/${data.slug}`)}&secret=${secret}`
      },
      breakpoints: [
        { label: 'Mobile (iPhone 14)', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet (iPad)', name: 'tablet', width: 768, height: 1024 },
        { label: 'Laptop (13")', name: 'laptop', width: 1280, height: 800 },
        { label: 'Desktop (1080p)', name: 'desktop', width: 1920, height: 1080 },
      ],
    },
    listSearchableFields: ['title', 'adminLabel', 'slug'],
    defaultColumns: ['title', 'adminLabel', 'slug', 'status', 'author', 'publishedAt', 'updatedAt'],
    group: {
      en: 'Content',
      zh: '内容管理',
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        const isTranslation = req.context?.isTranslationSave || req.context?.isSyncing

        // [DEBUG] Check context and user
        console.log(`🕵️ [Blogs Hook] Op: ${operation}, User: ${req.user?.email || 'N/A'}, IsTranslation: ${isTranslation}`)

        // [AUTO-PRESERVE STATUS] If status is missing from the update (e.g. background patches),
        // explicitly set it to the current value to prevent database resets.
        if (operation === 'update' && !data.status && originalDoc?.status) {
          data.status = originalDoc.status
        }

        // [AUTO SLUG] Only generate slug from English title. Prevent other locales or translations from overwriting it.
        if (!isTranslation) {
          let titleToSlugify = '';

          // If title is passed in this payload, use it. Otherwise, fallback to the original document's title.
          const titleObj = data.title || originalDoc?.title;

          if (typeof titleObj === 'object' && titleObj?.en) {
            titleToSlugify = titleObj.en;
          } else if (req.locale === 'en' || req.locale === 'all' || !req.locale) {
            titleToSlugify = typeof titleObj === 'string' ? titleObj : '';
          }

          if (titleToSlugify) {
            data.slug = titleToSlugify
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
          }
        }

        const status = data.status || originalDoc?.status;
        const prevStatus = originalDoc?.status;

        if (status === 'published' && !data.publishedAt && prevStatus !== 'published') {
          console.log('📡 [Blogs] Publishing: setting publishedAt')
          data.publishedAt = new Date().toISOString()
        } else if (!data.publishedAt && originalDoc?.publishedAt) {
          // Also preserve publishedAt if missing
          data.publishedAt = originalDoc.publishedAt
        }
        return data;
      }
    ],
    afterRead: [
      async ({ doc, req, query }) => {
        // Optimization: Skip heavy relational lookups during translation saves, syncs, or depth=0 queries
        const currentDepth = req?.query?.depth ?? query?.depth;

        if (req?.context?.isTranslationSave || req?.context?.isSyncing || String(currentDepth) === '0') {
          return doc
        }

        // Use publishedAt, fall back to createdAt
        const referenceDate = doc.publishedAt || doc.createdAt;
        const { payload, locale } = req;

        // 1. Fetch Basic Pagination (Prev/Next)
        if (referenceDate && doc.status === 'published') {
          try {
            const [prev, next] = await Promise.all([
              payload.find({
                collection: 'blogs',
                where: {
                  and: [
                    { publishedAt: { less_than: referenceDate } },
                    { status: { equals: 'published' } }
                  ]
                },
                sort: '-publishedAt',
                limit: 1,
                locale,
                depth: 0,
                select: { title: true, slug: true, coverImage: true }
              }),
              payload.find({
                collection: 'blogs',
                where: {
                  and: [
                    { publishedAt: { greater_than: referenceDate } },
                    { status: { equals: 'published' } }
                  ]
                },
                sort: 'publishedAt',
                limit: 1,
                locale,
                depth: 0,
                select: { title: true, slug: true, coverImage: true }
              })
            ]);

            doc.prevPost = prev.docs[0] || null;
            doc.nextPost = next.docs[0] || null;
          } catch (error) {
            console.error('Error fetching blog pagination:', error);
          }
        }

        // 2. Resolve Recommendation Logic (Sidebar & Footer)
        // This ensures the frontend 'posts' array is populated if empty and logic is set
        const urlId = req?.routeParams?.id
        const isMainDoc = urlId === String(doc.id) || urlId === doc.slug

        // Only resolve complex logic for the main document to save performance
        if (isMainDoc) {
          const resolveRecommendations = async (moduleName: string) => {
            const mode = doc[`kb_${moduleName}_mode`];

            if (mode === 'override') {
              const posts = doc[`kb_${moduleName}_posts`];
              const logic = doc[`kb_${moduleName}_logic`];

              if ((!posts || posts.length === 0) && logic) {
                try {
                  const where: any = {
                    id: { not_equals: doc.id },
                    status: { equals: 'published' }
                  };

                  if (logic === 'category' && doc.categories?.length > 0) {
                    const catIds = doc.categories.map((c: any) => typeof c === 'object' ? c.id : c);
                    where.categories = { in: catIds };
                  }

                  const recommendedDocs = await payload.find({
                    collection: 'blogs',
                    where,
                    sort: '-publishedAt',
                    limit: moduleName === 'bottom_recommended' ? 3 : 5,
                    locale,
                    depth: 0,
                    select: { title: true, slug: true, coverImage: true, publishedAt: true }
                  });

                  doc[`kb_${moduleName}_posts`] = recommendedDocs.docs;
                } catch (e) {
                  console.error(`Error resolving recommendations for ${moduleName}:`, e);
                }
              }
            }
          };

          await Promise.all([
            resolveRecommendations('recommended_posts'),
            resolveRecommendations('bottom_recommended')
          ]);

          // 3. Populate Manual Pagination (if selected)
          if (doc.useCustomOverrides && doc.kb_pagination_mode === 'override' && doc.kb_pagination_type === 'manual') {
            const populatePost = async (key: 'prev_post' | 'next_post') => {
              const fieldName = `kb_pagination_${key}`;
              const postId = doc[fieldName];
              if (postId && (typeof postId === 'string' || typeof postId === 'number')) {
                try {
                  const post = await payload.findByID({
                    collection: 'blogs',
                    id: postId,
                    locale,
                    depth: 0,
                    select: { title: true, slug: true, coverImage: true }
                  });
                  doc[fieldName] = post;
                } catch (e) {
                  console.error(`Error populating manual pagination ${key}:`, e);
                }
              }
            };
            await Promise.all([populatePost('prev_post'), populatePost('next_post')]);
          }
        }

        // 4. "减肥" 逻辑：如果不是文章页的主文章，剔除重度数据以节省 API 带宽
        // 重要：如果当前是后台管理人员（req.user 存在），或者是主文档请求，则不剔除数据
        // 注意：isMainDoc 在上方第 109 行已经定义过，这里直接使用并增强
        const finalIsMainDoc = isMainDoc || req?.query?.depth === '0'

        if (!req?.user && !finalIsMainDoc && !req?.query?.full) {
          delete doc.content
          // flattened fields (kb_*) are small enough to keep or we can delete them individually if needed
          // but usually they are just strings/numbers/ids.
        }

        return doc;
      }
    ],
    afterChange: [
      autoIndexHook('blogs')
    ],
    afterDelete: [
      autoIndexDeleteHook('blogs'),
    ],
  },
  endpoints: [
    {
      path: '/:id/notify-google',
      method: 'post',
      handler: async (req) => {
        const { payload, user, routeParams } = req
        if (!user) return new Response('Unauthorized', { status: 401 })

        const id = routeParams?.id
        if (!id) return new Response('Missing ID', { status: 400 })

        try {
          // 1. Fetch the doc to get slug
          const doc = await payload.findByID({
            collection: 'blogs',
            id: id as string,
            depth: 0,
          })

          if (!doc || doc.status !== 'published') {
            return new Response(JSON.stringify({ error: 'Only published posts can be indexed.' }), { status: 400 })
          }

          // 2. Import the indexing service from web (if possible) or re-implement
          // Since they share the same workspace, we can try to import or use a direct call
          // Actually, let's call the indexing logic.
          // Note: In a real deployment, web and cms might be on different servers, 
          // but they usually share the same environment variables.

          const { notifyGoogleOfUpdate } = await import('../lib/google-indexing')
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.busromhouse.com'

          // Only notify Google of the primary (en) URL to stay within the 200/day quota.
          const url = `${siteUrl}/knowledge-base-blog/${doc.slug}`
          const res = await notifyGoogleOfUpdate(url)

          try {
            await payload.create({
              collection: 'indexing-logs',
              req,
              overrideAccess: true,
              data: {
                targetUrl: url,
                engine: 'google',
                action: 'update',
                status: res?.success ? 'success' : (res?.message?.includes('Credentials') || res?.message?.includes('Key') ? 'failed_keys' : 'failed_network'),
                triggerUser: user.id,
                rawResponse: res,
              }
            })
          } catch (e) {
            console.error('Failed to write SEO log in notify-google:', e)
          }

          return new Response(JSON.stringify({ success: res?.success, result: res, url }), { status: res?.success ? 200 : 500 })
        } catch (e: any) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500 })
        }
      },
    },
  ],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'translationCenter',
          type: 'ui',
          admin: {
            width: '50%',
            disableListColumn: true,
            components: {
              Field: '@/components/fields/TranslationCenter',
            },
          },
        },
        {
          name: 'googleIndexing',
          type: 'ui',
          admin: {
            width: '50%',
            disableListColumn: true,
            components: {
              Field: '@/components/fields/GoogleIndexingButton',
            },
          },
        },
      ],
    },
    {
      name: 'adminLabel',
      type: 'textarea',
      label: {
        en: 'Admin Identification (Internal Use)',
        zh: '内部管理标识（不影响URL）',
      },
      admin: {
        description: {
          en: 'This identifier is for internal management and can contain spaces/caps. (e.g. "Blog - Glass Installation")',
          zh: '仅用于后台管理区分，可以包含空格和大小写（例如："博客 - 玻璃安装教程"）',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          label: LABELS.status,
          // localized: true, // REVERTED
          options: [...OPTIONS.status],
          admin: {
            width: '40%',
            position: 'sidebar',
          },
        },
        {
          name: 'publishedAt',
          type: 'date',
          label: {
            en: 'Published At',
            zh: '同步至网站前端可见的时间',
          },
          admin: {
            width: '60%',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        // ==================================================================
        // Tab 1: Basic Information
        // ==================================================================
        {
          label: {
            en: 'Basic Info',
            zh: '基本信息',
          },
          fields: [
            {
              name: 'title',
              type: 'textarea',
              label: {
                en: 'Blog Title',
                zh: '博客标题',
              },
              localized: true,
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: {
                en: 'Excerpt',
                zh: '摘要',
              },
              localized: true,
              admin: {
                description: {
                  en: 'Short summary for previews',
                  zh: '用于预览的简短摘要',
                },
              },
            },
            {
              name: 'author',
              type: 'relationship',
              relationTo: 'authors',
              label: {
                en: 'Author',
                zh: '作者',
              },
              admin: {
                description: {
                  en: 'Select the writer for this post',
                  zh: '选择这篇文章的作者',
                },
              },
            },
            {
              name: 'slug',
              type: 'text',
              label: {
                en: 'Slug (URL Anchor)',
                zh: 'URL (自动生成)',
              },
              unique: true,
              admin: {
                description: {
                  en: 'This slug is generated from the English Blog Title. Do not modify manually unless necessary.',
                  zh: '这个 slug 由博客标题的英文(en)自动生成，非必要请不要手动修改。',
                },
              },
            },
          ],
        },

        // ==================================================================
        // Tab 2: Content
        // ==================================================================
        {
          label: {
            en: 'Content',
            zh: '内容',
          },
          fields: [
            {
              name: 'contentTranslation',
              type: 'richText',
              label: {
                en: 'Content',
                zh: '富文本内容',
              },
              localized: true,
              admin: {
                description: {
                  en: 'Rich text content - use language tabs above to switch locales',
                  zh: '富文本内容 - 使用上方语言标签切换语言',
                },
                components: {
                  beforeInput: ['@/components/fields/MultiLocaleRichTextField'],
                },
              },
            },
          ],
        },

        // ==================================================================
        // Tab 3: Media & Categories
        // ==================================================================
        {
          label: {
            en: 'Media & Categories',
            zh: '媒体和分类',
          },
          fields: [
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Cover Image',
                zh: '封面图片',
              },
              admin: {
                components: {
                  Field: '@/components/fields/MediaPicker',
                },
              },
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              label: {
                en: 'Categories',
                zh: '分类',
              },
              filterOptions: {
                type: { equals: 'BLOG' },
              },
              admin: {
                description: {
                  en: 'Select blog categories',
                  zh: '选择博客分类',
                },
              },
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'blog-tags',
              hasMany: true,
              label: {
                en: 'Tags',
                zh: '标签',
              },
              admin: {
                description: {
                  en: 'Assign tags to this blog post',
                  zh: '为这篇文章分配标签',
                },
              },
            },
          ],
        },

        // ==================================================================
        // Tab 4: Layout & Overrides
        // ==================================================================
        {
          label: {
            en: 'Layout & Overrides',
            zh: '排版与覆盖设置',
          },
          fields: [
            {
              name: 'useCustomOverrides',
              type: 'checkbox',
              label: {
                en: 'Enable Custom Overrides',
                zh: '启用个性化覆盖设置',
              },
              defaultValue: false,
              admin: {
                description: {
                  en: 'When enabled, this page will use individual widget settings below instead of the global template defaults.',
                  zh: '勾选后，该页面将不再使用全局模板配置，而是使用下方定义的个性化设置。',
                },
              },
            },
            {
              name: 'templateType',
              type: 'radio',
              label: {
                en: 'Active Global Template',
                zh: '使用的全局模版类型',
              },
              admin: {
                layout: 'horizontal',
                description: {
                  en: 'Select the layout template for this blog post.',
                  zh: '选择该博文使用的视觉排版模版。',
                },
              },
              defaultValue: 'template1',
              options: [
                { label: { en: 'Template 1 (Standard Modern)', zh: '模版一 (标准现代多栏)' }, value: 'template1' },
                { label: { en: 'Template 2 (Minimal Review)', zh: '模版二 (极简测评风格)' }, value: 'template2' },
                { label: { en: 'Template 3 (Corporate View)', zh: '模版三 (重型图文品牌风)' }, value: 'template3' },
              ],
            },
            {
              type: 'collapsible',
              label: {
                en: 'Sidebar Widget Overrides',
                zh: '文章页侧边栏覆盖',
              },
              admin: {
                condition: (data) => data?.useCustomOverrides === true,
              },
              fields: [
                ...createKBWidgetField({
                  name: 'toc',
                  label: { en: 'Table of Contents (TOC)', zh: '目录导航' },
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.toc,
                }),
                ...createKBWidgetField({
                  name: 'share',
                  label: { en: 'Social Share', zh: '社交分享' },
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.share,
                }),
                ...createKBWidgetField({
                  name: 'search_box',
                  label: { en: 'Search Box', zh: '搜索框' },
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.search_box,
                }),
                ...createKBWidgetField({
                  name: 'category_list',
                  label: { en: 'Category List', zh: '博客分类展示' },
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.category_list,
                }),
                ...createKBWidgetField({
                  name: 'recommended_posts',
                  label: { en: 'Sidebar Recommended', zh: '侧边栏推荐博文' },
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.recommendations(),
                }),
                ...createKBWidgetField({
                  name: 'follow_us',
                  label: { en: 'Follow Us', zh: '关注我们' },
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.follow_us,
                }),
              ],
            },
            {
              type: 'collapsible',
              label: {
                en: 'Footer Widget Overrides',
                zh: '文章页底部栏覆盖',
              },
              admin: {
                condition: (data) => data?.useCustomOverrides === true,
              },
              fields: [
                ...createKBWidgetField({
                  name: 'bottom_categories',
                  label: { en: 'Bottom Categories', zh: '底部分类展示' },
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.bottom_categories,
                }),
                ...createKBWidgetField({
                  name: 'pagination',
                  label: { en: 'Pagination', zh: '翻页跳转' },
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.pagination(true),
                }),
                ...createKBWidgetField({
                  name: 'bottom_recommended',
                  label: { en: 'Bottom Recommended', zh: '底部推荐博文' },
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.bottom_recommended,
                }),
              ],
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
