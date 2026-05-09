import type { CollectionConfig } from 'payload'

export const BlogTags: CollectionConfig = {
  slug: 'blog-tags',
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
      type: 'join',
      collection: 'blogs',
      on: 'tags',
      label: {
        en: 'Related Blogs',
        zh: '关联知识库文章',
      },
      admin: {
        description: {
          en: 'Blogs associated with this tag. Assign tags to blogs from the Blogs collection.',
          zh: '自动显示包含此标签的知识库文章。如需新增关联，请前往“知识库”集合编辑对应的文章。',
        },
      },
    },
    // Removed obsolete custom blogsManager UI field
  ],
  timestamps: true,
}
