/**
 * NavigationMenus Collection - Site Navigation Management
 *
 * 用途: 网站导航菜单管理
 * - 支持多级菜单 (parent/children)
 * - 支持不同菜单类型 (Standard/Product Cards/Submenu)
 * - 支持24语言
 */

import type { CollectionConfig } from 'payload'
function slugify(val: string): string {
  return val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const NavigationMenus: CollectionConfig = {
  slug: 'navigation-menus',
  labels: {
    singular: {
      en: 'Navigation Menu',
      zh: '导航菜单',
    },
    plural: {
      en: 'Navigation Menus',
      zh: '导航菜单',
    },
  },
  admin: {
    useAsTitle: 'adminLabel',
    defaultColumns: ['adminLabel', 'slug', 'type', 'parent', 'order', 'visible'],
    group: {
      en: 'Content',
      zh: '内容管理',
    },
    components: {
      beforeListTable: ['@/components/admin/NavigationManagerLink'],
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req, data }) => {
      // Prevent deletion of system menus
      if (data?.isSystem) return false
      return !!req.user
    },
  },

  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const isTranslation = req.context?.isTranslationSave || req.context?.isSyncing
        if (isTranslation) return data

        // Only generate slug from English name. Prevent other locales from overwriting it.
        if (data.name) {
          let nameToSlugify = '';
          
          if (typeof data.name === 'object' && data.name.en) {
            nameToSlugify = data.name.en;
          } else if (req.locale === 'en' || req.locale === 'all' || !req.locale) {
            // If saving in English locale, data.name is the English string
            nameToSlugify = typeof data.name === 'string' ? data.name : '';
          }

          if (nameToSlugify) {
            data.slug = slugify(nameToSlugify);
          }
        }
        return data
      },
    ],
    afterRead: [
      async ({ doc, req: { payload } }) => {
        if (!doc.cardImage) return doc
        const { getApplicationImage } = await import('@/utilities/getApplicationImage')
        const image = await getApplicationImage(payload, doc.cardImage)
        return {
          ...doc,
          cardImageResolved: image,
        }
      },
    ],
  },

  // 版本控制 - 保留修改历史
  // versions: {

  // maxPerDoc: 10,

  // },

  fields: [
    // Basic Information
    {
      name: 'adminLabel',
      type: 'text',
      label: {
        en: 'Admin Label',
        zh: '内部管理标识',
      },
      admin: {
        description: {
          en: 'Internal label for CMS management only, not shown on the site',
          zh: '仅用于 CMS 内部管理的标识，不会显示在网站上',
        },
      },
    },
    {
      name: 'name',
      type: 'textarea',
      label: {
        en: 'Menu Name',
        zh: '菜单名称',
      },
      localized: true,
      required: true,
      admin: {
        description: {
          en: 'Bilingual menu name',
          zh: '双语菜单名称',
        },
      },
    },
    // Menu Type
    {
      name: 'type',
      type: 'select',
      label: {
        en: 'Menu Type',
        zh: '菜单类型',
      },
      admin: {
        description: {
          en: 'Determines the layout of this menu\'s children. For child items themselves, always choose "Standard Link".',
          zh: '决定【该菜单的下级子菜单】如何展示。如果是子菜单本身，请一律选择“普通链接”！',
        },
      },
      required: true,
      defaultValue: 'standard',
      options: [
        { label: { en: 'Standard Link (Default for child items)', zh: '普通链接（子菜单请选此项）' }, value: 'standard' },
        { label: { en: 'Parent Only: Displays children as Image Cards', zh: '父级专用：将其子菜单显示为图文卡片' }, value: 'product_cards' },
        { label: { en: 'Parent Only: Displays children with Icons', zh: '父级专用：将其子菜单显示为Icon+文字' }, value: 'submenu' },
      ],
    },
    // Icon (for SUBMENU type)
    {
      name: 'icon',
      type: 'text',
      label: {
        en: 'Icon',
        zh: '图标',
      },
      admin: {
        components: {
          Field: '@/components/fields/IconPicker',
        },
        condition: (data) => Boolean(data?.parent),
      },
    },
    // Card Image (for menu items that need images)
    {
      name: 'cardImage',
      type: 'json',
      label: {
        en: 'Card Image',
        zh: '卡片图片',
      },
      admin: {
        components: {
          Field: '@/components/fields/ApplicationImagePicker',
        },
        description: {
          en: 'Menu card image. Choose manually from media or randomly from a case gallery (Application).',
          zh: '菜单卡片图片。可手动从媒体库选择，或从案例图集中随机选择。',
        },
        // 显示条件：仅子菜单才可以配置图片（父菜单不需要）
        condition: (data) => Boolean(data?.parent),
      },
    },
    // Grid Span (for product_cards children)
    {
      name: 'gridSpan',
      type: 'number',
      label: {
        en: 'Grid Span',
        zh: '网格跨度',
      },
      defaultValue: 1,
      min: 1,
      max: 4,
      admin: {
        description: {
          en: 'How many columns this card occupies in the dropdown grid (1-4). Only applies to PRODUCT_CARDS children.',
          zh: '该卡片在下拉网格中占据几列（1-4）。仅对 PRODUCT_CARDS 子菜单有效。',
        },
        condition: (data) => data?.parent != null,
      },
    },
    // Hierarchical Structure
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'navigation-menus',
      label: {
        en: 'Parent Menu',
        zh: '父级菜单',
      },
      admin: {
        description: {
          en: 'Leave empty for top-level menu',
          zh: '留空表示顶级菜单',
        },
      },
    },
    // Link Configuration
    {
      name: 'link',
      type: 'text',
      label: {
        en: 'Link',
        zh: '链接',
      },
      admin: {
        components: {
          Field: '@/components/fields/SmartLinkField#SmartLinkField',
        },
        description: {
          en: 'External URL https://... or internal path /product, /service. Click search icon to select internal items.',
          zh: '外链 https://... 或内部路径 /product, /service。点击搜索图标选择站内项。',
        },
      },
    },
    {
      name: 'linkLabel',
      type: 'text',
      localized: true,
      label: {
        en: 'Link Button Text',
        zh: '链接按钮文本',
      },
      admin: {
        description: {
          en: 'Custom text for the main link button (Only applies to children of Product Cards type). Leave empty to use default.',
          zh: '主链接按钮的自定义文本（仅在其父级菜单为"图文卡片"时有效并在前端显示）。留空则使用默认文本。',
        },
        condition: (data) => Boolean(data?.parent),
      },
    },
    {
      name: 'inquiryLink',
      type: 'text',
      label: {
        en: 'Inquiry Link',
        zh: '询单链接',
      },
      admin: {
        description: {
          en: 'Link for "Inquiry" button (Displayed on children of Product Cards type)',
          zh: '"询单"按钮的链接（仅在其父级菜单为"图文卡片"时有效并在前端显示）',
        },
        condition: (data) => Boolean(data?.parent),
      },
    },
    {
      name: 'inquiryLabel',
      type: 'text',
      localized: true,
      label: {
        en: 'Inquiry Button Text',
        zh: '询单按钮文本',
      },
      admin: {
        description: {
          en: 'Custom text for the inquiry button (Only applies to children of Product Cards type). Leave empty to use default.',
          zh: '询单按钮的自定义文本（仅在其父级菜单为"图文卡片"时有效并在前端显示）。留空则使用默认文本。',
        },
        condition: (data) => Boolean(data?.parent),
      },
    },
    // Display Options
    {
      name: 'order',
      type: 'number',
      label: {
        en: 'Order',
        zh: '排序',
      },
      defaultValue: 1,
      min: 1,
      max: 100,
      admin: {
        description: {
          en: 'Lower number appears first',
          zh: '数字越小越靠前',
        },
      },
    },
    {
      name: 'isSystem',
      type: 'checkbox',
      label: {
        en: 'System Menu',
        zh: '系统菜单',
      },
      defaultValue: false,
      admin: {
        description: {
          en: 'System default menu, cannot be deleted',
          zh: '系统默认菜单，不可删除',
        },
        readOnly: true,
      },
    },
    {
      name: 'visible',
      type: 'checkbox',
      label: {
        en: 'Visible',
        zh: '显示',
      },
      defaultValue: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: {
        en: 'Slug',
        zh: 'URL 标识',
      },
      admin: {
        readOnly: true,
        description: {
          en: 'Auto-generated from Menu Name. Cannot be manually edited.',
          zh: '从菜单名称自动生成，不可手动修改。',
        },
      },
    },
    {
      name: 'translationCenter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        components: {
          Field: '@/components/fields/TranslationCenter',
        },
      },
    },
  ],
}
