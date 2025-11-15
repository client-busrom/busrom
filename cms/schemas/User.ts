/**
 * User & Role Models - RBAC Authentication System
 *
 * This file contains both User and Role models for role-based access control.
 *
 * Features:
 * - Multi-role support: Users can have multiple roles
 * - Direct permissions: Users can have additional permissions beyond their roles
 * - Super admin flag: Bypass all permission checks
 * - Role inheritance: Roles can inherit permissions from parent roles
 */

import { list } from '@keystone-6/core'
import {
  text,
  password,
  relationship,
  timestamp,
  select,
  checkbox,
  integer,
  json,
} from '@keystone-6/core/fields'

/**
 * User Model - Admin Authentication & Authorization
 */
export const User = list({
  access: {
    operation: {
      // Allow all authenticated users to query (needed for authenticatedItem)
      // Item-level filter ensures users can only see themselves unless they're admin
      query: ({ session }) => !!session,
      // Only admins can create users
      create: ({ session }) => session?.data?.isAdmin === true,
      // Allow users to update themselves, admins can update anyone
      update: ({ session }) => !!session,
      // Only admins can delete users
      delete: ({ session }) => session?.data?.isAdmin === true,
    },
    // Item-level access control: users can only see/modify themselves, admins can see/modify all
    filter: {
      query: ({ session }) => {
        if (session?.data?.isAdmin) {
          return true; // Admins can see all users
        }
        // Non-admin users can only see themselves
        return {
          id: { equals: session?.itemId },
        };
      },
      update: ({ session }) => {
        if (session?.data?.isAdmin) {
          return true; // Admins can update all users
        }
        // Non-admin users can only update themselves
        return {
          id: { equals: session?.itemId },
        };
      },
    },
  },

  fields: {
    // ==================================================================
    // 📝 Basic Information
    // ==================================================================

    name: text({
      validation: { isRequired: true },
      label: 'Name | 姓名',
      ui: {
        description: 'User full name | 用户全名',
      },
      access: {
        // Users can update their own name
        update: ({ session, item }) => {
          if (session?.data?.isAdmin) return true
          return session?.itemId === item.id
        },
      },
    }),

    email: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
      isFilterable: true,
      label: 'Email | 邮箱',
      ui: {
        description: 'User email (used for login) | 用户邮箱(用于登录)',
      },
      access: {
        // Email is read-only for users (it's the login identifier)
        // Only admins can change user emails
        update: ({ session }) => session?.data?.isAdmin === true,
      },
    }),

    password: password({
      validation: { isRequired: true },
      label: 'Password | 密码',
      access: {
        // Users can update their own password
        update: ({ session, item }) => {
          if (session?.data?.isAdmin) return true
          return session?.itemId === item.id
        },
      },
    }),

    avatar: relationship({
      ref: 'Media',
      label: 'Avatar | 头像',
      ui: {
        displayMode: 'cards',
        cardFields: ['filename'],
        description: 'User profile picture | 用户头像',
      },
      access: {
        // Users can update their own avatar
        update: ({ session, item }) => {
          if (session?.data?.isAdmin) return true
          return session?.itemId === item.id
        },
      },
    }),

    // ==================================================================
    // 🔐 Roles & Permissions (RBAC)
    // ==================================================================

    /**
     * User Roles (Many-to-Many)
     *
     * Users can have multiple roles, and permissions are merged
     */
    roles: relationship({
      ref: 'Role.users',
      many: true,
      label: 'Roles | 角色',
      ui: {
        displayMode: 'select',
        labelField: 'name',
        description: 'Assign one or more roles to this user | 为用户分配一个或多个角色',
      },
      access: {
        // Only admins can modify roles
        update: ({ session }) => session?.data?.isAdmin === true,
      },
    }),

    /**
     * Direct Permissions (Many-to-Many)
     *
     * Additional permissions assigned directly to the user.
     * These are merged with role-based permissions.
     */
    directPermissions: relationship({
      ref: 'Permission.users',
      many: true,
      label: 'Direct Permissions | 直接权限',
      ui: {
        views: './custom-fields/permission-selector',
        // Changed from 'count' to 'select' to enable showing selected permissions
        displayMode: 'select',
        description: 'Grant additional permissions beyond role permissions | 授予超出角色权限的额外权限',
      },
      access: {
        // Only admins can modify permissions
        update: ({ session }) => session?.data?.isAdmin === true,
      },
    }),

    /**
     * Super Admin Flag
     *
     * Super admins bypass all permission checks and have full system access
     */
    isAdmin: checkbox({
      defaultValue: false,
      label: 'Super Admin | 超级管理员',
      ui: {
        description: 'Super admin has full access to all system features | 超级管理员拥有所有系统功能的完全访问权限',
      },
      access: {
        // Only admins can modify admin status
        update: ({ session }) => session?.data?.isAdmin === true,
      },
    }),

    // ==================================================================
    // 🔒 Account Status
    // ==================================================================

    status: select({
      options: [
        { label: 'Active | 激活', value: 'ACTIVE' },
        { label: 'Inactive | 未激活', value: 'INACTIVE' },
      ],
      defaultValue: 'ACTIVE',
      label: 'Status | 状态',
      ui: {
        displayMode: 'segmented-control',
        description: 'Active users can log in, inactive users cannot | 激活用户可以登录,未激活用户无法登录',
      },
      access: {
        // Only admins can modify user status
        update: ({ session }) => session?.data?.isAdmin === true,
      },
    }),

    // ==================================================================
    // 🔐 Security
    // ==================================================================

    twoFactorEnabled: checkbox({
      defaultValue: false,
      label: 'Two-Factor Auth | 双因素认证',
      ui: {
        itemView: { fieldMode: 'read' },
        createView: { fieldMode: 'hidden' },
        description: 'Enable two-factor authentication for enhanced security | 启用双因素认证以增强安全性 (只读 - 请使用 2FA 设置页面启用/禁用)',
      },
      access: {
        // Read-only field - modified only via 2FA API
        update: () => false,
        read: ({ session, item }) => {
          if (session?.data?.isAdmin) return true
          return session?.itemId === item.id
        },
      },
    }),

    twoFactorSecret: text({
      label: 'Two-Factor Secret | 双因素密钥',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        description: 'TOTP secret for 2FA (auto-generated) | 2FA的TOTP密钥(自动生成)',
      },
      access: {
        // Secret field - never visible in UI, modified only via 2FA API
        read: () => false,
        update: () => false,
      },
    }),

    backupCodes: json({
      defaultValue: [],
      label: 'Backup Recovery Codes | 备用恢复码',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        description: 'Hashed backup codes for account recovery | 用于账户恢复的加密备用码',
      },
      access: {
        // Secret field - never visible in UI, modified only via 2FA API
        read: () => false,
        update: () => false,
      },
    }),

    // ==================================================================
    // 📊 Login Tracking
    // ==================================================================

    lastLoginAt: timestamp({
      label: 'Last Login | 最后登录时间',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Last successful login timestamp | 最后一次成功登录时间',
      },
    }),

    lastLoginIp: text({
      label: 'Last Login IP | 最后登录IP',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'IP address of last login | 最后一次登录的IP地址',
      },
    }),

    loginAttempts: json({
      defaultValue: [],
      label: 'Login Attempts | 登录尝试',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Recent login attempts (for security auditing) | 最近的登录尝试记录(用于安全审计)',
      },
    }),

    // ==================================================================
    // 🕐 Timestamps
    // ==================================================================

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      label: 'Created At | 创建时间',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    updatedAt: timestamp({
      db: { updatedAt: true },
      label: 'Updated At | 更新时间',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  hooks: {
    /**
     * Log user changes to ActivityLog
     */
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && item) {
        const { logActivity } = await import('../lib/activity-logger')
        await logActivity(context, operation as any, 'User', item, undefined, originalItem)
      }
    },
  },

  ui: {
    listView: {
      initialColumns: ['name', 'email', 'roles', 'isAdmin', 'status', 'lastLoginAt'],
      initialSort: { field: 'createdAt', direction: 'DESC' },
      pageSize: 50,
    },
    labelField: 'name',
    label: 'Users | 用户',
    description: 'Manage admin users and their permissions | 管理管理员用户及其权限',
    // Hide from non-admin users
    isHidden: ({ session }: any) => !session?.data?.isAdmin,
  },
})

/**
 * Role Model - RBAC Role Management
 *
 * Roles group permissions together for easier management.
 * Supports role inheritance for hierarchical permission structures.
 */
export const Role = list({
  access: {
    operation: {
      // All authenticated users can query roles (needed for role selector and permission UI)
      // But the Role menu is still hidden from non-admins (see ui.isHidden below)
      query: ({ session }) => !!session,
      create: ({ session }) => session?.data?.isAdmin === true,
      update: ({ session }) => session?.data?.isAdmin === true,
      delete: ({ session }) => session?.data?.isAdmin === true,
    },
  },

  fields: {
    // ==================================================================
    // 📋 Basic Information
    // ==================================================================

    /**
     * Role Name
     *
     * Human-readable name displayed in the UI
     */
    name: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
      db: { isNullable: false },
      label: 'Role Name | 角色名称',
      ui: {
        description: 'Role name (e.g., "产品管理员", "SEO专员") | 角色名称',
      },
    }),

    /**
     * Role Code
     *
     * Machine-readable identifier for programmatic access
     */
    code: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
      db: { isNullable: false },
      label: 'Role Code | 角色代码',
      ui: {
        description: 'Unique code (e.g., "product_admin", "seo_specialist") | 唯一代码',
      },
    }),

    /**
     * Description
     */
    description: text({
      label: 'Description | 描述',
      ui: {
        displayMode: 'textarea',
        description: 'Describe the responsibilities and scope of this role | 描述此角色的职责和范围',
      },
    }),

    // ==================================================================
    // 🔗 Permissions
    // ==================================================================

    /**
     * Permissions (Many-to-Many)
     *
     * The set of permissions granted to users with this role
     */
    permissions: relationship({
      ref: 'Permission.roles',
      many: true,
      label: 'Permissions | 权限',
      ui: {
        views: './custom-fields/permission-selector',
        // Changed from 'count' to 'select' to enable showing selected permissions
        displayMode: 'select',
        description: 'Select permissions for this role | 为此角色选择权限',
      },
    }),

    /**
     * Parent Role (Inheritance)
     *
     * This role inherits all permissions from the parent role
     */
    parentRole: relationship({
      ref: 'Role.childRoles',
      label: 'Parent Role | 父角色',
      ui: {
        displayMode: 'select',
        labelField: 'name',
        description: 'Inherit permissions from a parent role | 从父角色继承权限',
      },
    }),

    /**
     * Child Roles
     *
     * Roles that inherit from this role
     */
    childRoles: relationship({
      ref: 'Role.parentRole',
      many: true,
      label: 'Child Roles | 子角色',
      ui: {
        displayMode: 'count',
        description: 'Roles that inherit permissions from this role | 继承此角色权限的子角色',
      },
    }),

    // ==================================================================
    // 👥 Users
    // ==================================================================

    /**
     * Users with this Role
     */
    users: relationship({
      ref: 'User.roles',
      many: true,
      label: 'Users | 用户',
      ui: {
        displayMode: 'count',
        description: 'Users assigned to this role | 分配到此角色的用户',
      },
    }),

    // ==================================================================
    // ⚙️ Role Settings
    // ==================================================================

    /**
     * System Role Flag
     *
     * System roles are pre-defined and cannot be deleted
     */
    isSystem: checkbox({
      defaultValue: false,
      label: 'System Role | 系统角色',
      ui: {
        description: 'System roles cannot be deleted | 系统角色不可删除',
        itemView: { fieldMode: 'read' },
      },
    }),

    /**
     * Active Status
     *
     * Inactive roles do not grant any permissions
     */
    isActive: checkbox({
      defaultValue: true,
      label: 'Active | 启用',
      ui: {
        description: 'Inactive roles do not grant permissions to users | 未启用的角色不会授予用户权限',
      },
    }),

    /**
     * Priority
     *
     * Higher priority roles take precedence in conflict resolution
     */
    priority: integer({
      defaultValue: 5,
      validation: { min: 1, max: 10 },
      label: 'Priority | 优先级',
      ui: {
        description: 'Priority for resolving permission conflicts (1-10, higher is better) | 解决权限冲突的优先级(1-10,数值越大优先级越高)',
      },
    }),

    // ==================================================================
    // 📝 Metadata
    // ==================================================================

    createdBy: relationship({
      ref: 'User',
      label: 'Created By | 创建者',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'User who created this role | 创建此角色的用户',
      },
    }),

    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      label: 'Created At | 创建时间',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    updatedAt: timestamp({
      db: { updatedAt: true },
      label: 'Updated At | 更新时间',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  hooks: {
    /**
     * Validate deletion
     */
    validateDelete: async ({ item, addValidationError }) => {
      if (item.isSystem) {
        addValidationError('System roles cannot be deleted | 系统角色不可删除')
      }
    },

    /**
     * Log role changes
     */
    afterOperation: async ({ operation, item, context }) => {
      if (['create', 'update', 'delete'].includes(operation) && context.session && item) {
        try {
          await context.query.ActivityLog.createOne({
            data: {
              user: { connect: { id: context.session.itemId } },
              action: operation,
              entity: 'Role',
              entityId: item.id,
              changes: JSON.stringify({
                name: item.name,
                code: item.code,
              }),
              ipAddress: (context as any).req?.ip,
              userAgent: (context as any).req?.headers?.['user-agent'],
            },
          })
        } catch (error) {
          console.error('Failed to log role activity:', error)
        }
      }

      // Clear permission cache when role is modified
      if (['update', 'delete'].includes(operation)) {
        // TODO: Clear user permission cache for all users with this role
        // This will be implemented in Phase 2
      }
    },
  },

  ui: {
    listView: {
      initialColumns: ['name', 'code', 'isSystem', 'isActive', 'users', 'priority'],
      initialSort: { field: 'priority', direction: 'DESC' },
      pageSize: 50,
    },
    labelField: 'name',
    label: 'Roles | 角色',
    description: 'Manage user roles and their permissions | 管理用户角色及其权限',
    // Hide from non-admin users
    isHidden: ({ session }: any) => !session?.data?.isAdmin,
  },
})
