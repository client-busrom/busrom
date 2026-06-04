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
    // Translation Center UI component
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/fields/GlobalTranslationCenter',
        },
      },
    },
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
              type: 'collapsible',
              label: { en: 'Show \"All\" Tab', zh: '显示“全部”标签' },
              admin: { initCollapsed: false },
              fields: [
                {
                  type: 'row',
                  
              fields: [
                {
                  name: 'showAllTab',
                  type: 'checkbox',
                  defaultValue: true,
                  label: {
                    en: 'Show "All" Tab',
                    zh: '显示“全部 (All)”标签',
                  },
                },
                {
                  name: 'allTabLabel',
                  type: 'text',
                  localized: true,
                  defaultValue: 'All',
                  label: { en: 'All Tab Text', zh: '全部标签文案' },
                  admin: {
                    condition: (_, siblingData) => siblingData.showAllTab,
                  }
                },
                {
                  name: 'allProductsTitle',
                  type: 'text',
                  localized: true,
                  defaultValue: 'All Products',
                  label: { en: 'All Products Title', zh: '全部产品列表标题' },
                },
              ]
                }
              ]
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
        // ----------------------------------------------------------
        // Tab 3: Sorting
        // ----------------------------------------------------------
        {
          label: {
            en: 'Sorting',
            zh: '前台排序',
          },
          fields: [
            {
              name: 'sortSettings',
              type: 'group',
              label: { en: 'Sorting Settings', zh: '前台排序设置' },
              admin: {
                description: {
                  en: 'Configure the sorting options available to visitors. Flat fields for translation compatibility.',
                  zh: '配置供访客使用的排序选项（扁平化字段，完美兼容多语言翻译）。'
                }
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Sort By',
                  label: { en: 'Sort Group Title', zh: '排序分组标题' },
                },
                {
                  name: 'defaultSort',
                  type: 'select',
                  defaultValue: 'shopOrder',
                  label: { en: 'Default Sort', zh: '默认排序逻辑' },
                  options: [
                    { label: 'Recommended', value: 'shopOrder' },
                    { label: 'Newest Arrivals', value: 'createdAt' },
                    { label: 'Name (A to Z)', value: 'name_asc' },
                    { label: 'Name (Z to A)', value: 'name_desc' },
                  ],
                },
                // --- Recommended ---
                {
                  type: 'collapsible',
                  label: { en: 'Enable Recommended', zh: '开启推荐排序' },
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                  fields: [
                    { name: 'enableSortShopOrder', type: 'checkbox', defaultValue: true, label: { en: 'Enable Recommended', zh: '开启推荐排序' } },
                    { name: 'labelSortShopOrder', type: 'text', localized: true, defaultValue: 'Recommended', label: { en: 'Recommended Label', zh: '推荐排序文案' } },
                  ]
                    }
                  ]
                },
                // --- Newest ---
                {
                  type: 'collapsible',
                  label: { en: 'Enable Newest', zh: '开启最新上架排序' },
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                  fields: [
                    { name: 'enableSortCreatedAt', type: 'checkbox', defaultValue: true, label: { en: 'Enable Newest', zh: '开启最新上架排序' } },
                    { name: 'labelSortCreatedAt', type: 'text', localized: true, defaultValue: 'Newest Arrivals', label: { en: 'Newest Label', zh: '最新上架文案' } },
                  ]
                    }
                  ]
                },
                // --- Name A-Z ---
                {
                  type: 'collapsible',
                  label: { en: 'Enable Name A-Z', zh: '开启名称A-Z排序' },
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                  fields: [
                    { name: 'enableSortNameAsc', type: 'checkbox', defaultValue: true, label: { en: 'Enable Name A-Z', zh: '开启名称A-Z排序' } },
                    { name: 'labelSortNameAsc', type: 'text', localized: true, defaultValue: 'Name (A to Z)', label: { en: 'Name A-Z Label', zh: 'A-Z排序文案' } },
                  ]
                    }
                  ]
                },
                // --- Name Z-A ---
                {
                  type: 'collapsible',
                  label: { en: 'Enable Name Z-A', zh: '开启名称Z-A排序' },
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                  fields: [
                    { name: 'enableSortNameDesc', type: 'checkbox', defaultValue: true, label: { en: 'Enable Name Z-A', zh: '开启名称Z-A排序' } },
                    { name: 'labelSortNameDesc', type: 'text', localized: true, defaultValue: 'Name (Z to A)', label: { en: 'Z-A排序文案' } },
                  ]
                    }
                  ]
                },
              ],
            },
          ],
        },
        // ----------------------------------------------------------
        // Tab 4: Filtering
        // ----------------------------------------------------------
        {
          label: {
            en: 'Filtering',
            zh: '前台过滤',
          },
          fields: [
            {
              name: 'filterLabels',
              type: 'group',
              label: { en: 'Filter Bar Settings', zh: '侧边栏过滤设置' },
              admin: {
                description: {
                  en: 'Customize the text and availability of the filter sidebar.',
                  zh: '自定义左侧过滤选项的展示文案及开启状态。'
                }
              },
              fields: [
                {
                  name: 'applyFilterBtn',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Apply filter',
                  label: { en: 'Apply Filter Button', zh: '展开过滤按钮' },
                },
                {
                  name: 'searchPlaceholder',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Search products...',
                  label: { en: 'Search Placeholder', zh: '搜索框提示语' },
                },
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Product Status',
                  label: { en: 'Filter Group Title', zh: '过滤分组标题' },
                },
                {
                  type: 'collapsible',
                  label: { en: 'Enable Hot Filter', zh: '开启爆品过滤' },
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                  fields: [
                    { name: 'enableHotFilter', type: 'checkbox', defaultValue: true, label: { en: 'Enable Hot Filter', zh: '开启爆品过滤' } },
                    { name: 'hotLabel', type: 'text', localized: true, defaultValue: 'Hot Items', label: { en: 'Hot Items Label', zh: '爆品选项文案' } },
                  ]
                    }
                  ]
                },
                {
                  type: 'collapsible',
                  label: { en: 'Enable New Filter', zh: '开启新品过滤' },
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                  fields: [
                    { name: 'enableNewFilter', type: 'checkbox', defaultValue: true, label: { en: 'Enable New Filter', zh: '开启新品过滤' } },
                    { name: 'newLabel', type: 'text', localized: true, defaultValue: 'New Arrivals', label: { en: 'New Arrivals Label', zh: '新品选项文案' } },
                  ]
                    }
                  ]
                },
                {
                  type: 'collapsible',
                  label: { en: 'Enable Featured Filter', zh: '开启推荐过滤' },
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                  fields: [
                    { name: 'enableFeaturedFilter', type: 'checkbox', defaultValue: true, label: { en: 'Enable Featured Filter', zh: '开启推荐过滤' } },
                    { name: 'featuredLabel', type: 'text', localized: true, defaultValue: 'Featured', label: { en: 'Featured Label', zh: '推荐选项文案' } },
                  ]
                    }
                  ]
                },
              ]
            }
          ],
        },
        // ----------------------------------------------------------
        // Tab 5: Button Labels
        // ----------------------------------------------------------
        {
          label: {
            en: 'Button Labels',
            zh: '按钮文案',
          },
          fields: [
            {
              name: 'buttonLabels',
              type: 'group',
              label: { en: 'Button Labels', zh: '按钮文案设置' },
              fields: [
                {
                  name: 'viewDetails',
                  type: 'text',
                  localized: true,
                  defaultValue: 'View Details',
                  label: { en: 'View Details Button', zh: '查看详情按钮文案' },
                },
                {
                  name: 'sendInquiry',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Send Inquiry',
                  label: { en: 'Send Inquiry Button', zh: '发送询盘按钮文案' },
                },
              ]
            }
          ]
        }
      ],
    },
  ],
}
