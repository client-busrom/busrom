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
import { createKBWidgetField, KB_WIDGET_SUBFIELDS } from '../fields/knowledgeBaseWidgets'

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
    useAsTitle: 'adminLabel',
    listSearchableFields: ['adminLabel', 'slug', 'title'],
    defaultColumns: ['adminLabel', 'slug', 'status', 'author', 'publishedAt', 'updatedAt'],
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
      ({ data, originalDoc }) => {
        // If status is becoming 'published' and there's no publishedAt date set yet, set it to now
        if (data.status === 'published' && !data.publishedAt && (!originalDoc || !originalDoc.publishedAt)) {
          return {
            ...data,
            publishedAt: new Date().toISOString(),
          }
        }
        return data;
      }
    ],
    afterRead: [
      async ({ doc, req, query }) => {
        // Use publishedAt, fall back to createdAt
        const referenceDate = doc.publishedAt || doc.createdAt;
        if (!referenceDate || doc.status !== 'published') return doc;

        const { payload, locale } = req;
        
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

        return doc;
      }
    ],
    afterChange: [
      syncM2M('categories', 'blogPosts', 'categories'),
      syncM2M('blog-tags', 'blogs', 'tags'),
    ],
    afterDelete: [
      cleanupM2M('categories', 'blogPosts', 'categories'),
      cleanupM2M('blog-tags', 'blogs', 'tags'),
    ],
  },
  fields: [
    {
      name: 'adminLabel',
      type: 'text',
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
              name: 'slug',
              type: 'text',
              label: {
                en: 'Technical Slug (URL Anchor)',
                zh: '技术标识 (自动生成)',
              },
              hooks: {
                beforeValidate: [formatSlug('adminLabel')],
              },
              unique: true,
              admin: {
                readOnly: true,
                description: {
                  en: 'This is automatically generated from Admin Identification and used for URLs.',
                  zh: '此字段自动由内部管理标识生成，用于前台URL，不可手动修改。',
                },
              },
            },
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
                condition: (data) => !data?.useCustomOverrides,
                description: {
                  en: 'Select the template to use when "Custom Overrides" is disabled.',
                  zh: '选择在未开启“个性化覆盖”时调用的具体开发模版。',
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
                zh: '详情页侧边栏覆盖 (Sidebar Overrides)',
              },
              admin: {
                condition: (data) => data?.useCustomOverrides === true,
              },
              fields: [
                createKBWidgetField({
                  name: 'toc',
                  label: '目录导航 (TOC)',
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.toc,
                }),
                createKBWidgetField({
                  name: 'share',
                  label: '社交分享 (Share)',
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.share,
                }),
                createKBWidgetField({
                  name: 'search_box',
                  label: '搜索框 (Search Box)',
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.search_box,
                }),
                createKBWidgetField({
                  name: 'category_list',
                  label: '博客分类展示 (Category List)',
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.category_list,
                }),
                createKBWidgetField({
                  name: 'recommended_posts',
                  label: '侧边栏推荐博文 (Recommended Blogs)',
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.recommendations(),
                }),
                createKBWidgetField({
                  name: 'follow_us',
                  label: '关注我们 (Follow Us)',
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.follow_us,
                }),
              ],
            },
            {
              type: 'collapsible',
              label: {
                en: 'Footer Widget Overrides',
                zh: '详情页底部栏覆盖 (Footer Overrides)',
              },
              admin: {
                condition: (data) => data?.useCustomOverrides === true,
              },
              fields: [
                createKBWidgetField({
                  name: 'bottom_categories',
                  label: '底部分类展示 (Bottom Categories)',
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.bottom_categories,
                }),
                createKBWidgetField({
                  name: 'pagination',
                  label: '翻页跳转 (Pagination)',
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.pagination(true),
                }),
                createKBWidgetField({
                  name: 'bottom_recommended',
                  label: '底部推荐博文 (Bottom Recommended)',
                  isOverride: true,
                  subFields: KB_WIDGET_SUBFIELDS.recommendations(3),
                }),
              ],
            },
          ],
        },
      ],
    },

    // ==================================================================
    // Sidebar Fields
    // ==================================================================
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
        // We can pass custom properties if the Translation Center supports it 
        // to restrict logic to specific fields. 
        // In the requirement context: "把seo插件移除，然后翻译中心去除无用字段，现在seo统一在seo settings里设置"
        // This is done by just skipping unnecessary hidden meta.
      },
    },
    {
      name: 'status',
      type: 'select',
      label: {
        en: 'Status',
        zh: '状态',
      },
      defaultValue: 'draft',
      options: [
        { label: { en: 'Published', zh: '已发布' }, value: 'published' },
        { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
        { label: { en: 'Archived', zh: '归档' }, value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        disableListColumn: true,
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
        position: 'sidebar',
        disableListColumn: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  timestamps: true,
}
