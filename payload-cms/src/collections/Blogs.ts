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
import { pingSitemap } from '../hooks/pingSitemap'
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
      pingSitemap,
    ],
    afterDelete: [
      cleanupM2M('categories', 'blogPosts', 'categories'),
      cleanupM2M('blog-tags', 'blogs', 'tags'),
    ],
  },
  fields: [
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
              name: 'slug',
              type: 'text',
              label: {
                en: 'Technical Slug (URL Anchor)',
                zh: '技术标识 (自动生成)',
              },
              hooks: {
                beforeValidate: [formatSlug('title')],
              },
              required: true,
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
              required: true,
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
              required: true,
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
        // Tab 4: Template Configuration
        // ==================================================================
        {
          label: {
            en: 'Template Output',
            zh: '前台排版模板',
          },
          fields: [
            {
              name: 'templateType',
              type: 'radio',
              label: {
                en: 'Template Type',
                zh: '使用模版类型',
              },
              admin: {
                layout: 'horizontal',
                description: {
                  en: 'Select how the frontend will structurally render this blog post.',
                  zh: '选择在前端显示知识库文章时应该调用的具体开发模版。',
                },
              },
              required: true,
              defaultValue: 'template1',
              options: [
                { label: { en: 'Template 1 (Standard Modern)', zh: '模版一 (标准现代多栏)' }, value: 'template1' },
                { label: { en: 'Template 2 (Minimal Review)', zh: '模版二 (极简测评风格)' }, value: 'template2' },
                { label: { en: 'Template 3 (Corporate View)', zh: '模版三 (重型图文品牌风)' }, value: 'template3' },
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
        zh: '发布时间',
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
