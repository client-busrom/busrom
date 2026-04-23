/**
 * Roles Collection - Role-Based Access Control
 *
 * Features:
 * - Multi-permission assignment
 * - Role hierarchy with parent role inheritance
 * - System role protection
 * - Localized display names
 */

import type { CollectionConfig } from 'payload'

export const Roles: CollectionConfig = {
  slug: 'roles',
  labels: {
    singular: {
      en: 'Role',
      zh: '角色',
    },
    plural: {
      en: 'Roles',
      zh: '角色',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'isSystem', 'updatedAt'],
    group: {
      en: 'Users & Access',
      zh: '用户与权限',
    },
    description: {
      en: 'User roles with permission assignments',
      zh: '具有权限分配的用户角色',
    },
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      return req.user.isAdmin === true
    },
    create: ({ req }) => req.user?.isAdmin === true,
    update: ({ req }) => req.user?.isAdmin === true,
    delete: ({ req }) => {
      // Only admins can delete, system roles protected in hook
      return req.user?.isAdmin === true
    },
  },

  // // versions: {

 // // maxPerDoc: 10,

 // // },

  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        // Prevent deletion of system roles
        const role = await req.payload.findByID({
          collection: 'roles',
          id,
        })
        if (role?.isSystem) {
          throw new Error('Cannot delete system role')
        }
      },
    ],
  },
  fields: [
    // ==================================================================
    // Basic Information
    // ==================================================================
    {
      name: 'name',
      type: 'textarea',
      label: {
        en: 'Role Name',
        zh: '角色名称',
      },
      required: true,
      localized: true,
      admin: {
        components: {
          Field: '@/components/fields/MultiLocaleField#MultiLocaleTextareaField',
        },
      },
    },
    {
      name: 'code',
      type: 'text',
      label: {
        en: 'Role Code',
        zh: '角色代码',
      },
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'Unique identifier, e.g., "content_editor", "product_manager"',
          zh: '唯一标识符，例如 "content_editor"、"product_manager"',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        en: 'Description',
        zh: '描述',
      },
      localized: true,
    },

    // ==================================================================
    // Permissions
    // ==================================================================
    {
      name: 'permissions',
      type: 'relationship',
      relationTo: 'permissions',
      hasMany: true,
      label: {
        en: 'Permissions',
        zh: '权限',
      },
      admin: {
        description: {
          en: 'Select permissions for this role',
          zh: '为此角色选择权限',
        },
        components: {
          Field: '@/components/admin/PermissionSelector',
        },
      },
    },

    // ==================================================================
    // Role Hierarchy
    // ==================================================================
    {
      name: 'parentRole',
      type: 'relationship',
      relationTo: 'roles',
      label: {
        en: 'Parent Role',
        zh: '父级角色',
      },
      admin: {
        description: {
          en: 'Inherit permissions from parent role',
          zh: '从父角色继承权限',
        },
      },
      filterOptions: ({ id }) => {
        // Prevent self-reference
        if (!id) return true
        return {
          id: {
            not_equals: id,
          },
        }
      },
    },

    // ==================================================================
    // Users with this Role
    // ==================================================================
    {
      name: 'users',
      type: 'join',
      collection: 'users',
      on: 'roles',
      label: {
        en: 'Users',
        zh: '用户',
      },
      admin: {
        description: {
          en: 'Users assigned to this role',
          zh: '分配到此角色的用户',
        },
      },
    },

    // ==================================================================
    // Priority (for conflict resolution)
    // ==================================================================
    {
      name: 'priority',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 10,
      label: {
        en: 'Priority',
        zh: '优先级',
      },
      admin: {
        description: {
          en: 'Priority for resolving permission conflicts (1-10, higher is better)',
          zh: '解决权限冲突的优先级(1-10,数值越大优先级越高)',
        },
        position: 'sidebar',
        disableListColumn: true,
      },
    },

    // ==================================================================
    // System Flags
    // ==================================================================
    {
      name: 'isSystem',
      type: 'checkbox',
      label: {
        en: 'System Role',
        zh: '系统角色',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        description: {
          en: 'System roles cannot be deleted',
          zh: '系统角色不能被删除',
        },
        readOnly: true,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: {
        en: 'Active',
        zh: '启用',
      },
      defaultValue: true,
      admin: {
        position: 'sidebar',
        disableListColumn: true,
      },
    },

    // ==================================================================
    // Translation Center
    // ==================================================================
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
  timestamps: true,
}
