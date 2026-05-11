import type { GlobalConfig } from 'payload'

export const KnowledgeBaseSettings: GlobalConfig = {
  slug: 'knowledge-base-settings',
  label: {
    en: 'Knowledge Base Management',
    zh: '知识库全局管理',
  },
  admin: {
    group: {
      en: 'Content Management',
      zh: '内容管理',
    },
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'translationCenter',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/fields/GlobalTranslationCenter',
            },
          },
        },
        {
          name: 'spacer',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/ui/RowSpacer',
            },
          },
        },
        {
          name: 'status',
          type: 'select',
          label: {
            en: 'Global Status',
            zh: '全局发布状态',
          },
          defaultValue: 'draft',
          options: [
            { label: { en: 'Published', zh: '已发布' }, value: 'published' },
            { label: { en: 'Draft', zh: '草稿' }, value: 'draft' },
          ],
          admin: {
            width: '200px',
          },
        },

      ],
    },

    // ----------------------------------------------------------
    // Main Content
    // ----------------------------------------------------------
    {
      type: 'tabs',
      tabs: [
        // ----------------------------------------------------------
        // Tab 1: List Page Configuration
        // ----------------------------------------------------------
        {
          label: {
            en: 'List Page',
            zh: '列表页配置',
          },
          fields: [
            // 1. Hero Section
            {
              type: 'collapsible',
              label: { en: 'Hero Section', zh: '首屏渲染设置' },
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'heroTitle',
                  type: 'textarea',
                  localized: true,
                  label: { en: 'Hero Tag Title', zh: '板块标签标题' },
                },
                {
                  name: 'featuredPost',
                  type: 'relationship',
                  relationTo: 'blogs',
                  label: { en: 'Featured Post', zh: '选择展示的首推文章' },
                  admin: {
                    description: {
                      en: 'Left: Meta info, Right: Cover & Category',
                      zh: '展示在首屏：左侧显示元数据（时间、标题、作者、阅读量），右侧显示封面和分类。',
                    },
                  },
                },
              ],
            },
            // 2. Category Filter
            {
              type: 'collapsible',
              label: { en: 'Category Filter', zh: '分类导航设置' },
              fields: [
                {
                  name: 'navTitle',
                  type: 'textarea',
                  localized: true,
                  label: { en: 'Nav Tag Title', zh: '板块标签标题' },
                },
                {
                  name: 'showAll',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: 'Show "All" Tab', zh: '显示“全部 (All)”标签' },
                },
                {
                  name: 'kbCategoryTabs',
                  type: 'relationship',
                  relationTo: 'categories',
                  hasMany: true,
                  filterOptions: {
                    type: { equals: 'BLOG' },
                  },
                  label: { en: 'Category Tabs', zh: '显示的分类' },
                },
              ],
            },
            // 3. Dynamic Sections
            {
              name: 'sectionsData',
              type: 'json',
              label: { en: 'Page Sections (Multilingual)', zh: '内容板块（多语言）' },
              admin: {
                components: {
                  Field: '@/components/fields/MultilingualKnowledgeSections',
                },
                description: {
                  en: 'Configure content sections for all languages. Each language shares the same sections but has localized content.',
                  zh: '为所有语言配置内容区块。所有语言共享区块结构，但内容各自独立。',
                },
              },
            },
          ],
        },
        // ----------------------------------------------------------
        // Tab 2: Detail Page Sidebar
        // ----------------------------------------------------------
        {
          label: {
            en: 'Detail Sidebar',
            zh: '详情页侧边栏',
          },
          fields: [
                {
                  name: 'toc',
                  type: 'group',
                  label: { en: 'TOC (Table of Contents)', zh: '文章目录 (TOC)' },
                  fields: [
                    { name: 'enabled', type: 'checkbox', label: { en: 'Enable', zh: '开启' } },
                    {
                      name: 'templates',
                      type: 'select',
                      hasMany: true,
                      options: [
                        { label: 'Template 1', value: 'template1' },
                        { label: 'Template 2', value: 'template2' },
                        { label: 'Template 3', value: 'template3' },
                      ],
                      label: { en: 'Enabled on Templates', zh: '在以下详情页模板生效' },
                    },
                  ],
                },
                {
                  name: 'shareConfig',
                  type: 'group',
                  label: { en: 'Share Post', zh: '分享功能' },
                  fields: [
                    { name: 'enabled', type: 'checkbox', defaultValue: true, label: { en: 'Enable', zh: '开启' } },
                    {
                      name: 'templates',
                      type: 'select',
                      hasMany: true,
                      options: [
                        { label: 'Template 1', value: 'template1' },
                        { label: 'Template 2', value: 'template2' },
                        { label: 'Template 3', value: 'template3' },
                      ],
                      label: { en: 'Enabled on Templates', zh: '在以下详情页模板生效' },
                    },
                    { name: 'title', type: 'textarea', localized: true, label: { en: 'Title', zh: '标题' } },
                    {
                      name: 'networks',
                      type: 'array',
                      label: { en: 'Share Networks', zh: '分享平台配置' },
                      fields: [
                        {
                          name: 'icon',
                          type: 'text',
                          label: { en: 'Icon Class', zh: '图标类名' },
                          admin: {
                            components: {
                              Field: '@/components/fields/IconPicker',
                            },
                          },
                        },
                        {
                          name: 'url',
                          type: 'text',
                          label: { en: 'Link Template', zh: '链接模板' },
                          admin: {
                            description: {
                              en: 'Use {{URL}} and {{TITLE}} as placeholders. Example: https://twitter.com/intent/tweet?url={{URL}}&text={{TITLE}}',
                              zh: '使用 {{URL}} 和 {{TITLE}} 作为占位符。例如：https://twitter.com/intent/tweet?url={{URL}}&text={{TITLE}}',
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'searchBox',
                  type: 'group',
                  label: { en: 'Search Box', zh: '搜索框' },
                  fields: [
                    { name: 'enabled', type: 'checkbox', label: { en: 'Enable', zh: '开启' } },
                    {
                      name: 'templates',
                      type: 'select',
                      hasMany: true,
                      options: [
                        { label: 'Template 1', value: 'template1' },
                        { label: 'Template 2', value: 'template2' },
                        { label: 'Template 3', value: 'template3' },
                      ],
                      label: { en: 'Enabled on Templates', zh: '在以下详情页模板生效' },
                    },
                    { name: 'placeholder', type: 'text', localized: true, label: { en: 'Placeholder', zh: '搜索提示文案' } },
                  ],
                },
                {
                  name: 'categoryList',
                  type: 'group',
                  label: { en: 'Category List', zh: '博客分类展示' },
                  fields: [
                    { name: 'enabled', type: 'checkbox', label: { en: 'Enable', zh: '开启' } },
                    {
                      name: 'templates',
                      type: 'select',
                      hasMany: true,
                      options: [
                        { label: 'Template 1', value: 'template1' },
                        { label: 'Template 2', value: 'template2' },
                        { label: 'Template 3', value: 'template3' },
                      ],
                      label: { en: 'Enabled on Templates', zh: '在以下详情页模板生效' },
                    },
                    { name: 'title', type: 'textarea', localized: true, label: { en: 'Title', zh: '标题' } },
                    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true, filterOptions: { type: { equals: 'BLOG' } } },
                  ],
                },
                {
                  name: 'recommendedPosts',
                  type: 'group',
                  label: { en: 'Recommended Blogs', zh: '推荐博文' },
                  fields: [
                    { name: 'enabled', type: 'checkbox', label: { en: 'Enable', zh: '开启' } },
                    {
                      name: 'templates',
                      type: 'select',
                      hasMany: true,
                      options: [
                        { label: 'Template 1', value: 'template1' },
                        { label: 'Template 2', value: 'template2' },
                        { label: 'Template 3', value: 'template3' },
                      ],
                      label: { en: 'Enabled on Templates', zh: '在以下详情页模板生效' },
                    },
                    { name: 'title', type: 'textarea', localized: true, label: { en: 'Title', zh: '标题' } },
                    { name: 'posts', type: 'relationship', relationTo: 'blogs', hasMany: true },
                  ],
                },
                {
                  name: 'followUs',
                  type: 'group',
                  label: { en: 'Follow Us', zh: '关注我们' },
                  fields: [
                    { name: 'enabled', type: 'checkbox', label: { en: 'Enable', zh: '开启' } },
                    {
                      name: 'templates',
                      type: 'select',
                      hasMany: true,
                      options: [
                        { label: 'Template 1', value: 'template1' },
                        { label: 'Template 2', value: 'template2' },
                        { label: 'Template 3', value: 'template3' },
                      ],
                      label: { en: 'Enabled on Templates', zh: '在以下详情页模板生效' },
                    },
                    { name: 'title', type: 'textarea', localized: true, label: { en: 'Title', zh: '标题' } },
                    {
                      name: 'socials',
                      type: 'array',
                      label: { en: 'Social Links', zh: '社媒链接配置' },
                      fields: [
                        {
                          name: 'icon',
                          type: 'text',
                          label: { en: 'Icon', zh: '图标' },
                          admin: {
                            components: {
                              Field: '@/components/fields/IconPicker',
                            },
                          },
                        },
                        { name: 'url', type: 'text', label: { en: 'Link', zh: '链接' } },
                      ],
                    },
                  ],
                },
          ],
        },
        // ----------------------------------------------------------
        // Tab 3: Detail Page Footer
        // ----------------------------------------------------------
        {
          label: {
            en: 'Detail Footer',
            zh: '详情页底部栏',
          },
          fields: [
            {
              name: 'bottomCategories',
              type: 'group',
              label: { en: 'Bottom Categories', zh: '底部分类展示' },
              fields: [
                { name: 'enabled', type: 'checkbox', label: { en: 'Enable', zh: '开启' } },
                {
                  name: 'templates',
                  type: 'select',
                  hasMany: true,
                  options: [
                    { label: 'Template 1', value: 'template1' },
                    { label: 'Template 2', value: 'template2' },
                    { label: 'Template 3', value: 'template3' },
                  ],
                  label: { en: 'Enabled on Templates', zh: '在以下详情页模板生效' },
                },
                {
                  name: 'categories',
                  type: 'relationship',
                  relationTo: 'categories',
                  hasMany: true,
                  filterOptions: { type: { equals: 'BLOG' } },
                  label: { en: 'Categories', zh: '底部展示分类 (以 · 连接)' },
                },
              ],
            },
            {
              name: 'pagination',
              type: 'group',
              label: { en: 'Pagination', zh: '文章翻页跳转' },
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: true, label: { en: 'Enable', zh: '开启' } },
                {
                  name: 'templates',
                  type: 'select',
                  hasMany: true,
                  options: [
                    { label: 'Template 1', value: 'template1' },
                    { label: 'Template 2', value: 'template2' },
                    { label: 'Template 3', value: 'template3' },
                  ],
                  label: { en: 'Enabled on Templates', zh: '在以下详情页模板生效' },
                },
              ],
              admin: { description: { en: 'Ordered by publish date', zh: '自动按发布时间显示前后篇文章' } },
            },
            {
              name: 'bottomRecommended',
              type: 'group',
              label: { en: 'Recommended (3 Slots)', zh: '推荐博文 (3个展示位)' },
              fields: [
                { name: 'enabled', type: 'checkbox', label: { en: 'Enable', zh: '开启' } },
                {
                  name: 'templates',
                  type: 'select',
                  hasMany: true,
                  options: [
                    { label: 'Template 1', value: 'template1' },
                    { label: 'Template 2', value: 'template2' },
                    { label: 'Template 3', value: 'template3' },
                  ],
                  label: { en: 'Enabled on Templates', zh: '在以下详情页模板生效' },
                },
                { name: 'title', type: 'textarea', localized: true, label: { en: 'Title', zh: '板块标题' } },
                { name: 'posts', type: 'relationship', relationTo: 'blogs', hasMany: true, minRows: 0, maxRows: 3 },
              ],
            },
          ],
        },
      ],
    },
  ],
}
