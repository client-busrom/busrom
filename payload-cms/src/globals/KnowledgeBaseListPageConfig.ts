import type { GlobalConfig } from 'payload'

export const KnowledgeBaseListPageConfig: GlobalConfig = {
  slug: 'knowledge-base-list-page-config',
  label: {
    en: 'Knowledge Base List Page',
    zh: '知识库列表页管理',
  },
  admin: {
    group: {
      en: 'Page Management',
      zh: '页面管理',
    },
    description: {
      en: 'Independent management of the Knowledge Base list page, including category tabs and filter settings.',
      zh: '独立管理知识库列表页，包含顶部导航标签及文章筛选规则设置。',
    },
  },
  access: {
    read: () => true,
  },
  fields: [
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
                  equals: 'BLOG',
                },
              },
              label: {
                en: 'Category Tabs',
                zh: '显示的分类',
              },
              admin: {
                description: {
                  en: 'Select and order the blog categories to display in the Knowledge Base top navigation.',
                  zh: '选择并排序要在知识库列表页面顶部展示的博客分类。',
                },
              },
            },
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
                  defaultValue: 'All Articles',
                  label: { en: 'All Articles Title', zh: '全部文章列表标题' },
                },
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
              defaultValue: 12,
              label: {
                en: 'Articles Per Page',
                zh: '每页显示文章数',
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
                  defaultValue: 'publishedAt_desc',
                  label: { en: 'Default Sort', zh: '默认排序逻辑' },
                  options: [
                    { label: 'Newest', value: 'publishedAt_desc' },
                    { label: 'Oldest', value: 'publishedAt_asc' },
                    { label: 'Title (A to Z)', value: 'title_asc' },
                    { label: 'Title (Z to A)', value: 'title_desc' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'enableSortPublishedDesc', type: 'checkbox', defaultValue: true, label: { en: 'Enable Newest', zh: '开启最新发布排序' } },
                    { name: 'labelSortPublishedDesc', type: 'text', localized: true, defaultValue: 'Newest', label: { en: 'Newest Label', zh: '最新发布文案' } },
                  ]
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'enableSortPublishedAsc', type: 'checkbox', defaultValue: true, label: { en: 'Enable Oldest', zh: '开启最早发布排序' } },
                    { name: 'labelSortPublishedAsc', type: 'text', localized: true, defaultValue: 'Oldest', label: { en: 'Oldest Label', zh: '最早发布文案' } },
                  ]
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'enableSortTitleAsc', type: 'checkbox', defaultValue: true, label: { en: 'Enable Title A-Z', zh: '开启标题A-Z排序' } },
                    { name: 'labelSortTitleAsc', type: 'text', localized: true, defaultValue: 'Title (A to Z)', label: { en: 'Title A-Z Label', zh: 'A-Z排序文案' } },
                  ]
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'enableSortTitleDesc', type: 'checkbox', defaultValue: true, label: { en: 'Enable Title Z-A', zh: '开启标题Z-A排序' } },
                    { name: 'labelSortTitleDesc', type: 'text', localized: true, defaultValue: 'Title (Z to A)', label: { en: 'Z-A排序文案' } },
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
                  defaultValue: 'Search articles...',
                  label: { en: 'Search Placeholder', zh: '搜索框提示语' },
                },
                {
                  name: 'tagsTitle',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Filter by Tags',
                  label: { en: 'Tags Group Title', zh: '标签过滤分组标题' },
                },
                {
                  name: 'enableTagsFilter',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: 'Enable Tags Filter', zh: '开启标签过滤' },
                  admin: {
                    description: {
                      en: 'Dynamically fetches and displays all blog tags as filter options.',
                      zh: '动态获取并展示所有知识库标签作为筛选选项。'
                    }
                  }
                }
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
                  name: 'readMore',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Read More',
                  label: { en: 'Read More Button', zh: '阅读全文按钮文案' },
                },
              ]
            }
          ]
        }
      ],
    },
  ],
}
