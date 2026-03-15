/**
 * Shop Page Configuration
 * 
 * Manages the Shop list page independently, including:
 * - Top category tabs (order and selection)
 * - Page SEO
 * - Promotion banners
 */

import type { GlobalConfig } from 'payload'

export const ShopPageConfig: GlobalConfig = {
  slug: 'shop-page-config',
  label: {
    en: 'Shop Page Management',
    zh: 'Shop 列表页管理',
  },
  admin: {
    group: {
      en: 'Page Management',
      zh: '页面管理',
    },
    description: {
      en: 'Independent management of the Shop gallery page, including category tabs and product display settings.',
      zh: '独立管理 Shop 列表页，包含顶部导航标签及产品展示规则设置。',
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
                  equals: 'PRODUCT',
                },
              },
              label: {
                en: 'Category Tabs',
                zh: '显示的系列分类',
              },
              admin: {
                description: {
                  en: 'Select and order the product categories to display in the Shop top navigation. (Only "Product" type categories are allowed)',
                  zh: '选择并排序要在 Shop 页面顶部展示的产品分类（仅限“产品”类型的分类）。',
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
              defaultValue: 24,
              label: {
                en: 'Products Per Page',
                zh: '每页显示产品数',
              },
            },
          ],
        },
      ],
    },
  ],
}
