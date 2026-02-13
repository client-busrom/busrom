/**
 * NavigationMenus Collection - Site Navigation Management
 *
 * 用途: 网站导航菜单管理
 * - 支持多级菜单 (parent/children)
 * - 支持不同菜单类型 (Standard/Product Cards/Submenu)
 * - 支持24语言
 */

import type { CollectionConfig } from 'payload'

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
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'type', 'parent', 'order', 'visible'],
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

  // 版本控制 - 保留修改历史
  // versions: {

  // maxPerDoc: 10,

  // },

  fields: [
    // Basic Information
    {
      name: 'slug',
      type: 'text',
      label: {
        en: 'Slug',
        zh: '唯一标识',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'Unique identifier, e.g.: product, service, about-us',
          zh: '唯一标识符，例如: product, service, about-us',
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
        components: {
          Field: '@/components/fields/MultiLocaleField#MultiLocaleTextareaField',
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
      required: true,
      defaultValue: 'standard',
      options: [
        { label: 'Standard (普通链接)', value: 'standard' },
        { label: 'Product Cards (图文卡片)', value: 'product_cards' },
        { label: 'Submenu (Icon+文字子菜单)', value: 'submenu' },
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
        condition: (data) => data?.type === 'submenu',
      },
    },
    // Media Tags (for menu items that need images)
    {
      name: 'mediaTags',
      type: 'relationship',
      relationTo: 'media-tags',
      hasMany: true,
      label: {
        en: 'Media Tags',
        zh: '媒体标签',
      },
      admin: {
        description: {
          en: 'Select tags to filter images for menu card display',
          zh: '选择标签筛选图片，用于菜单卡片显示',
        },
        // 显示条件：自身是 product_cards 类型，或者有父级菜单（子菜单）
        condition: (data) => data?.type === 'product_cards' || data?.parent,
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
        description: {
          en: 'External URL https://... or internal path /product, /service',
          zh: '外链 https://... 或内部路径 /product, /service',
        },
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
          en: 'Link for "Inquiry" button, only for PRODUCT_CARDS type',
          zh: '"询单"按钮的链接，仅用于 PRODUCT_CARDS 类型',
        },
        condition: (data) => data?.type === 'product_cards',
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
  ],
}
