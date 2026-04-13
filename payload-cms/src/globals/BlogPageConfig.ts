/**
 * Blog Page Configuration
 * 
 * Manages the Blog list page independently, including:
 * - Top category tabs (order and selection)
 * - Page SEO
 * - Promotion/Hero banners
 */

import type { GlobalConfig } from 'payload'

export const BlogPageConfig: GlobalConfig = {
  slug: 'blog-page-config',
  label: {
    en: 'Blog Page Management',
    zh: '知识库列表页管理',
  },
  admin: {
    group: {
      en: 'Page Management',
      zh: '页面管理',
    },
    description: {
      en: 'Independent management of the Blog list page, including category tabs and hero display settings.',
      zh: '独立管理知识库列表页，包含顶部导航子标签及头部展示规则设置。',
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ----------------------------------------------------------
        // Tab 1: Navigation Tabs (Categories)
        // ----------------------------------------------------------
        {
          label: {
            en: 'Navigation Tabs',
            zh: '导航标签管理',
          },
          fields: [
            {
              name: 'categoryTabs',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              required: true,
              filterOptions: {
                type: {
                  equals: 'BLOG',
                },
              },
              label: {
                en: 'Category Tabs',
                zh: '显示的系列分类',
              },
              admin: {
                description: {
                  en: 'Select and order the blog categories to display in the Blog list. (Only "Blog" type categories are allowed)',
                  zh: '选择并排序要在知识库顶部展示的博客分类（仅限“博客/知识库”类型的分类）。',
                },
              },
            },
            {
              name: 'showAllTab',
              type: 'checkbox',
              defaultValue: true,
              label: {
                en: 'Show "All" Tab',
                zh: '显示“全部 (All)”标签',
              },
            },
          ],
        },
        // ----------------------------------------------------------
        // Tab 2: Page SEO & UI
        // ----------------------------------------------------------
        {
          label: {
            en: 'Page UI & Pagination',
            zh: '界面与分页设置',
          },
          fields: [
            {
              name: 'pageSize',
              type: 'number',
              defaultValue: 12,
              label: {
                en: 'Posts Per Page',
                zh: '每页显示文章数',
              },
            },
          ],
        },
      ],
    },
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
  ],
}
