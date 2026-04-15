import type { CollectionConfig } from 'payload'
import { syncM2M, cleanupM2M } from '../hooks/syncM2M'

export const BlogTags: CollectionConfig = {
  slug: 'blog-tags',
  hooks: {
    afterChange: [
      syncM2M('blogs', 'tags', 'blogs'),
    ],
    afterDelete: [
      cleanupM2M('blogs', 'tags', 'blogs'),
    ],
  },
  labels: {
    singular: {
      en: 'Blog Tag',
      zh: '知识库标签',
    },
    plural: {
      en: 'Blog Tags',
      zh: '知识库标签',
    },
  },
  admin: {
    useAsTitle: 'name',
    group: {
      en: 'Content',
      zh: '内容管理',
    },
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Tag Name',
        zh: '标签名称',
      },
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: {
        en: 'Slug',
        zh: 'URL标识',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'URL-friendly identifier (e.g., "installation-guide")',
          zh: 'URL友好标识符（例如："installation-guide"）',
        },
      },
    },
    {
      name: 'blogs',
      type: 'relationship',
      relationTo: 'blogs',
      hasMany: true,
      label: {
        en: 'Related Blogs',
        zh: '关联知识库文章',
      },
      admin: {
        description: {
          en: 'Assign blogs to this tag. This relationship is shared with the Blogs collection.',
          zh: '为此标签分配文章。此关联与知识库集合同步。',
        },
      },
    },
    {
      name: 'blogsManager',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/fields/CategoryBlogManager#CategoryBlogManager',
        },
      },
    },
  ],
  timestamps: true,
}
