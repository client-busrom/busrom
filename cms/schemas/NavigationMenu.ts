/**
 * NavigationMenu Model - Site Navigation Management (导航菜单管理)
 *
 * Features:
 * - Visual configuration of header navigation with multi-level support
 * - Support for different menu display types (Standard/Product Cards/Submenu)
 * - Hierarchical menu structure (parent/child relationships)
 * - Multi-language support via JSON fields
 * - Customizable order
 * - Icon and image support for different menu types
 * - System menu protection
 *
 * Menu Types:
 * - STANDARD: Simple dropdown menu (e.g., Service submenu)
 * - PRODUCT_CARDS: Image card grid display (e.g., Product/Shop series)
 * - SUBMENU: Icon-based submenu items (e.g., About Us submenu)
 */

import { list, graphql } from '@keystone-6/core'
import {
  text,
  select,
  checkbox,
  relationship,
  integer,
  json,
  virtual,
} from '@keystone-6/core/fields'

export const NavigationMenu = list({
  fields: {
    // ==================================================================
    // 📝 Basic Information (基础信息)
    // ==================================================================

    /**
     * Slug (唯一标识)
     *
     * Simple identifier for internal use and admin display
     */
    slug: text({
      label: 'Slug (唯一标识)',
      validation: { isRequired: true },
      isIndexed: 'unique',
      ui: {
        description: 'Unique identifier (e.g., product, service, about-us) (唯一标识符，例如: product, service, about-us)',
      },
    }),

    /**
     * Menu Name (菜单名称)
     *
     * Multi-language support for menu display text
     */
    name: json({
      label: 'Menu Name (菜单名称)',
      defaultValue: {},
      ui: {
        views: './custom-fields/MultilingualJSONField',
        description: 'Navigation item display name (导航项显示名称)',
      },
    }),

    // ==================================================================
    // 🎯 Menu Type & Configuration (菜单类型与配置)
    // ==================================================================

    /**
     * Menu Type (菜单类型)
     *
     * Determines how submenu items are displayed
     */
    type: select({
      type: 'enum',
      options: [
        { label: 'Standard (普通链接)', value: 'STANDARD' },
        { label: 'Product Cards (图文卡片)', value: 'PRODUCT_CARDS' },
        { label: 'Submenu (Icon+文字子菜单)', value: 'SUBMENU' },
      ],
      validation: { isRequired: true },
      defaultValue: 'STANDARD',
      label: 'Menu Type (菜单类型)',
      ui: {
        displayMode: 'segmented-control',
        description: 'Determines submenu display style (决定子菜单的展示形式)',
      },
    }),

    /**
     * Icon (图标)
     *
     * Icon name for SUBMENU type (using Lucide icons)
     */
    icon: text({
      label: 'Icon (图标)',
      ui: {
        description: 'Lucide-react icon name (e.g., Home, Package, Wrench). Used for SUBMENU type (Lucide-react 图标名称，例如: Home, Package, Wrench。仅在 type 为 SUBMENU 时使用)',
      },
    }),

    /**
     * Media Tags (媒体标签)
     *
     * Select media tags to filter images for PRODUCT_CARDS type
     * A random image matching ALL selected tags will be used
     */
    mediaTags: relationship({
      ref: 'MediaTag',
      many: true,
      label: 'Media Tags (媒体标签)',
      ui: {
        displayMode: 'select',
        description: 'Select tags to filter images. A random image matching ALL tags will be chosen (选择标签筛选图片，将从符合所有标签的图片中随机选择)',
      },
    }),

    /**
     * Random Image (Virtual Field - 虚拟字段)
     *
     * Automatically fetches a random image matching the selected mediaTags
     * Used for PRODUCT_CARDS type display
     */
    randomImage: virtual({
      field: graphql.field({
        type: graphql.object<{ id: string; filename: string; url: string | null }>()({
          name: 'NavigationMenuRandomImage',
          fields: {
            id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
            filename: graphql.field({ type: graphql.nonNull(graphql.String) }),
            url: graphql.field({ type: graphql.String }),
          },
        }),
        async resolve(item: any, _args, context) {
          // Get the mediaTags for this navigation menu
          const menuWithTags = await context.query.NavigationMenu.findOne({
            where: { id: item.id },
            query: 'mediaTags { id }',
          })

          const tagIds = menuWithTags?.mediaTags?.map((tag: any) => tag.id) || []

          // If no tags selected, return null
          if (tagIds.length === 0) {
            return null
          }

          // Query media that has ALL selected tags
          const matchingMedia = await context.query.Media.findMany({
            where: {
              AND: [
                { status: { equals: 'ACTIVE' } },
                ...tagIds.map((tagId: string) => ({
                  tags: { some: { id: { equals: tagId } } },
                })),
              ],
            },
            query: 'id filename file { url }',
          })

          // If no matching media found, return null
          if (matchingMedia.length === 0) {
            return null
          }

          // Return a random image from the matching media
          const randomIndex = Math.floor(Math.random() * matchingMedia.length)
          const selectedMedia = matchingMedia[randomIndex]

          return {
            id: selectedMedia.id,
            filename: selectedMedia.filename,
            url: selectedMedia.file?.url || null,
          }
        },
      }),
      ui: {
        query: '{ id filename url }',
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Random image matching selected tags (auto-generated) (符合选中标签的随机图片，自动生成)',
      },
    }),

    // ==================================================================
    // 🌳 Hierarchical Structure (层级结构)
    // ==================================================================

    /**
     * Parent Menu (父级菜单)
     *
     * If set, this becomes a child menu item (sub-menu)
     */
    parent: relationship({
      ref: 'NavigationMenu.children',
      label: 'Parent Menu (父级菜单)',
      ui: {
        displayMode: 'select',
        labelField: 'slug',
        description: 'Leave empty for top-level menu (留空表示顶级菜单)',
      },
    }),

    /**
     * Child Menus (子菜单)
     *
     * Sub-menu items under this menu
     */
    children: relationship({
      ref: 'NavigationMenu.parent',
      many: true,
      label: 'Child Menus (子菜单)',
      ui: {
        displayMode: 'cards',
        cardFields: ['slug', 'type', 'order'],
        inlineCreate: { fields: ['slug', 'name', 'type', 'link', 'order'] },
        inlineEdit: { fields: ['slug', 'name', 'type', 'link', 'order'] },
        description: 'Sub-menu items (子菜单项)',
      },
    }),

    // ==================================================================
    // 🔗 Link Configuration (链接配置)
    // ==================================================================

    /**
     * Link (链接)
     *
     * URL for this menu item
     */
    link: text({
      label: 'Link (链接)',
      ui: {
        description: 'External link (https://...) or internal path (/product, /service). Top-level menus can be empty (外链 https://... 或内部路径 /product, /service。顶级菜单可留空)',
      },
    }),

    /**
     * Inquiry Link (询单链接)
     *
     * Custom link for "Inquiry" button on PRODUCT_CARDS type child menus
     * Defaults to /contact-us if not set
     */
    inquiryLink: text({
      label: 'Inquiry Link (询单链接)',
      ui: {
        description: 'Link for "Inquiry" button (PRODUCT_CARDS type only). Leave empty to use default /contact-us ("询单"按钮的链接，仅用于 PRODUCT_CARDS 类型。留空则使用默认的 /contact-us)',
      },
    }),

    // ==================================================================
    // 📊 Display Options (显示选项)
    // ==================================================================

    /**
     * Order (排序)
     *
     * Display order (lower numbers appear first)
     */
    order: integer({
      defaultValue: 1,
      validation: {
        min: 1,
        max: 100,
      },
      label: 'Order (排序)',
      ui: {
        description: 'Display order (lower numbers appear first). CMS supports drag-and-drop ordering (数字越小越靠前。CMS 支持拖拽排序)',
      },
    }),

    /**
     * System Menu (系统菜单)
     *
     * System default menu, cannot be deleted
     */
    isSystem: checkbox({
      defaultValue: false,
      label: 'System Menu (系统菜单)',
      ui: {
        description: 'System default menu, cannot be deleted (系统默认菜单，不可删除)',
        itemView: { fieldMode: 'read' },
      },
    }),

    /**
     * Visible (显示)
     *
     * Show/hide this menu item
     */
    visible: checkbox({
      defaultValue: true,
      label: 'Visible (显示)',
      ui: {
        description: 'Show/hide in navigation (是否在导航栏中展示)',
      },
    }),
  },

  /**
   * Hooks
   */
  hooks: {
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation as any, 'NavigationMenu', item, undefined, originalItem)
      }
    },
  },

  /**
   * Access Control
   */
  access: {
    operation: {
      query: () => true, // Frontend needs to read menu
      create: ({ session }) => !!session,
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session,
    },
    // Item-level access control for deletion
    item: {
      delete: ({ item }) => {
        // Prevent deletion of system menus
        return !item.isSystem
      },
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    listView: {
      initialColumns: ['slug', 'type', 'parent', 'order', 'visible'],
      initialSort: { field: 'order', direction: 'ASC' },
      pageSize: 50,
    },
    labelField: 'slug',
    label: 'Navigation Menus | 导航菜单',
    description: '🔀 Navigation Manager: reorder menu(重新排序菜单) ',
  },

})
