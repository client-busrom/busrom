/**
 * Users Collection
 *
 * Admin authentication & authorization
 * Migrated from Keystone User schema
 *
 * Features:
 * - Multi-role support (many-to-many with Roles)
 * - Direct permissions (many-to-many with Permissions)
 * - Super admin flag (bypasses all checks)
 * - First user auto becomes super admin
 */

import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: {
      en: 'User',
      zh: '用户',
    },
    plural: {
      en: 'Users',
      zh: '用户',
    },
  },
  auth: {
    tokenExpiration: 28800, // 8 hours
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles', 'isAdmin', 'status'],
    group: {
      en: 'Users & Access',
      zh: '用户与权限',
    },
  },
  access: {
    // All authenticated users can read (needed for authenticatedItem)
    read: ({ req: { user } }) => {
      if (user?.isAdmin) return true
      // Non-admin users can only see themselves
      return {
        id: { equals: user?.id },
      }
    },
    // Only admins can create users (except first user)
    create: ({ req: { user } }) => {
      // Allow first user creation (no user logged in yet)
      if (!user) return true
      return user?.isAdmin === true
    },
    // Users can update themselves, admins can update anyone
    update: ({ req: { user } }) => {
      if (user?.isAdmin) return true
      return {
        id: { equals: user?.id },
      }
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => user?.isAdmin === true,
  },
  // Temporarily disabled - requires migration to create _users_v table
  // // versions: {
 // //   maxPerDoc: 10,
 // // },

  fields: [
    // ==================================================================
    // 📝 Basic Information (always visible)
    // ==================================================================
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Name',
        zh: '姓名',
      },
    },

    // ==================================================================
    // 🔐 Roles & Permissions (RBAC)
    // ==================================================================
    {
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      label: {
        en: 'Roles',
        zh: '角色',
      },
      admin: {
        description: {
          en: 'Assign one or more roles to this user',
          zh: '为用户分配一个或多个角色',
        },
        // Hide on create-first-user
        condition: (data, siblingData, { user }) => !!user,
      },
      access: {
        // Only admins can modify roles
        update: ({ req: { user } }) => user?.isAdmin === true,
      },
    },
    {
      name: 'directPermissions',
      type: 'relationship',
      relationTo: 'permissions',
      hasMany: true,
      label: {
        en: 'Direct Permissions',
        zh: '直接权限',
      },
      admin: {
        description: {
          en: 'Grant additional permissions beyond role permissions',
          zh: '授予超出角色权限的额外权限',
        },
        // Hide on create-first-user
        condition: (data, siblingData, { user }) => !!user,
        components: {
          Field: '@/components/admin/PermissionSelector',
        },
      },
      access: {
        // Only admins can modify permissions
        update: ({ req: { user } }) => user?.isAdmin === true,
      },
    },
    {
      name: 'isAdmin',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: 'Super Admin',
        zh: '超级管理员',
      },
      admin: {
        description: {
          en: 'Super admin has full access to all system features',
          zh: '超级管理员拥有所有系统功能的完全访问权限',
        },
        position: 'sidebar',
        // Hide on create-first-user
        condition: (data, siblingData, { user }) => !!user,
      },
      access: {
        // Only super admins can change this
        update: ({ req: { user } }) => user?.isAdmin === true,
      },
    },

    // ==================================================================
    // 🚀 Personalized Quick Actions (User Dashboard)
    // ==================================================================
    {
      name: 'quickActions',
      type: 'array',
      label: {
        en: 'My Quick Actions (Dashboard)',
        zh: '我的专属快捷工作台入口',
      },
      admin: {
        description: {
          en: 'Customize the quick action buttons displayed on your personal dashboard.',
          zh: '在此自由定制您个人后台首页显示的快捷工作台按钮。',
        },
        condition: () => {
          if (typeof window !== 'undefined') {
            return window.location.pathname.includes('/admin/account')
          }
          return true
        },
      },
      access: {
        read: () => true,
        update: ({ req: { user }, id }) => user?.isAdmin === true || String(user?.id) === String(id),
      },
      fields: [
        {
          name: 'route',
          type: 'select',
          required: true,
          label: { en: 'Select Action / Route', zh: '选择功能模块' },
          options: [
            // Products
            { label: { en: '📦 Add New Product', zh: '📦 发布新产品' }, value: '/admin/collections/products/create' },
            { label: { en: '📦 Product List', zh: '📦 产品列表管理' }, value: '/admin/collections/products' },
            { label: { en: '🏷️ Product Series', zh: '🏷️ 产品系列管理' }, value: '/admin/collections/product-series' },
            { label: { en: '⚙️ Product Attributes', zh: '⚙️ 产品规格属性' }, value: '/admin/collections/product-attributes' },
            // Content
            { label: { en: '✍️ Write Knowledge Base', zh: '✍️ 撰写知识库文章' }, value: '/admin/collections/blogs/create' },
            { label: { en: '📚 Knowledge Base List', zh: '📚 知识库列表管理' }, value: '/admin/collections/blogs' },
            { label: { en: '📂 Categories', zh: '📂 分类目录管理' }, value: '/admin/collections/categories' },
            { label: { en: '❓ FAQ Management', zh: '❓ 常见问题管理' }, value: '/admin/collections/faq-items' },
            { label: { en: '📑 Document Templates', zh: '📑 资料下载模板' }, value: '/admin/collections/document-templates' },
            // Media
            { label: { en: '🖼️ Media Library', zh: '🖼️ 素材库管理' }, value: '/admin/collections/media' },
            { label: { en: '🗂️ Media Categories', zh: '🗂️ 素材分类' }, value: '/admin/collections/media-categories' },
            { label: { en: '📱 Applications', zh: '📱 应用领域素材' }, value: '/admin/collections/applications' },
            // Forms & Inquiries
            { label: { en: '💬 Customer Inquiries', zh: '💬 客户留言与表单询盘' }, value: '/admin/collections/form-submissions' },
            { label: { en: '📋 Form Configurations', zh: '📋 表单字段配置' }, value: '/admin/collections/form-configs' },
            { label: { en: '📧 SMTP Settings', zh: '📧 邮件发件服务器' }, value: '/admin/collections/smtp-configs' },
            // Website Pages
            { label: { en: '🏠 Homepage Content', zh: '🏠 首页轮播与板块设置' }, value: '/admin/collections/hero-banner-items' },
            { label: { en: '📄 Subpages Management', zh: '📄 网站独立页面管理' }, value: '/admin/collections/pages' },
            { label: { en: '🛍️ Shop Page Config', zh: '🛍️ 选型中心配置' }, value: '/admin/globals/shop-page-config' },
            { label: { en: '🧭 Navigation Menus', zh: '🧭 网站菜单导航' }, value: '/admin/collections/navigation-menus' },
            // Settings
            { label: { en: '🔍 SEO Global Settings', zh: '🔍 SEO 抓取与收录配置' }, value: '/admin/globals/seo-setting' },
            { label: { en: '⚡ Indexing Logs', zh: '⚡ 搜索引擎提交日志' }, value: '/admin/collections/indexing-logs' },
            { label: { en: '🌐 Site Config', zh: '🌐 网站全局基础设置' }, value: '/admin/globals/site-config' },
            { label: { en: '🎛️ System Settings', zh: '🎛️ 系统全局配置' }, value: '/admin/globals/system-settings' },
            { label: { en: '🚫 404 Pages Config', zh: '🚫 404 页面配置' }, value: '/admin/collections/not-found-pages' },
            { label: { en: '🖼️ Image Wall', zh: '🖼️ 图片墙配置' }, value: '/admin/collections/image-wall-items' },
            { label: { en: '🏢 Footer Config', zh: '🏢 页脚与联系方式' }, value: '/admin/globals/footer' },
            { label: { en: '🌍 Translation Config', zh: '🌍 国际化与翻译配置' }, value: '/admin/globals/translation-config' },
            { label: { en: '👥 Users & Access', zh: '👥 后台账号与权限管理' }, value: '/admin/collections/users' },
          ],
        },
        {
          name: 'customLabel',
          type: 'text',
          label: { en: 'Custom Title (Optional)', zh: '自定义显示标题 (选填)' },
          admin: {
            description: { en: 'Leave empty to use default module name', zh: '留空则默认使用上方选择的功能模块名称' }
          }
        },
        {
          name: 'colorPreset',
          type: 'select',
          defaultValue: 'success',
          label: { en: 'Color Theme Preset', zh: '卡片配色预设' },
          options: [
            { label: { en: 'Green (Success)', zh: '绿色预设' }, value: 'success' },
            { label: { en: 'Blue (Info)', zh: '蓝色预设' }, value: 'info' },
            { label: { en: 'Yellow (Warning)', zh: '黄色预设' }, value: 'warning' },
            { label: { en: 'Red (Error)', zh: '红色预设' }, value: 'error' },
            { label: { en: 'Gray (Default)', zh: '灰色常规' }, value: 'default' },
          ],
        },
      ],
    },

    // ==================================================================
    // 📊 Status & Activity (hidden on create-first-user)
    // ==================================================================
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: { en: 'Active', zh: '启用' }, value: 'active' },
        { label: { en: 'Inactive', zh: '禁用' }, value: 'inactive' },
        { label: { en: 'Suspended', zh: '暂停' }, value: 'suspended' },
      ],
      label: {
        en: 'Status',
        zh: '状态',
      },
      admin: {
        position: 'sidebar',
        // Hide on create-first-user
        condition: (data, siblingData, { user }) => !!user,
      },
      access: {
        // Only admins can change user status
        update: ({ req: { user } }) => user?.isAdmin === true,
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      label: {
        en: 'Last Login',
        zh: '最后登录',
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        // Hide on create-first-user
        condition: (data, siblingData, { user }) => !!user,
      },
    },

    // ==================================================================
    // 🔒 Two-Factor Authentication (hidden on create-first-user)
    // ==================================================================
    {
      name: 'twoFactorManagement',
      type: 'ui',
      label: {
        en: 'Two-Factor Authentication',
        zh: '双因素认证',
      },
      admin: {
        // Hide on create-first-user and only show on own account
        condition: (data, siblingData, { user }) => {
          if (!user) return false
          // Only show for the current user (account page) or admins editing others
          return true
        },
        components: {
          Field: '@/components/admin/TwoFactorAuthField',
        },
      },
    },
    {
      name: 'twoFactorEnabled',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: '2FA Enabled',
        zh: '双因素认证',
      },
      admin: {
        // Hide from admin UI - managed via custom component
        hidden: true,
      },
    },
    {
      name: 'twoFactorSecret',
      type: 'text',
      label: {
        en: '2FA Secret',
        zh: '2FA密钥',
      },
      admin: {
        hidden: true,
      },
      access: {
        read: () => false,
        update: ({ req: { user }, id }) => user?.id === id,
      },
    },
    {
      name: 'backupCodes',
      type: 'json',
      label: {
        en: 'Backup Codes',
        zh: '备用恢复码',
      },
      admin: {
        hidden: true,
      },
      access: {
        read: () => false,
        update: () => false, // Only updated via API
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // First user automatically becomes super admin
        if (operation === 'create') {
          const existingUsers = await req.payload.find({
            collection: 'users',
            limit: 1,
          })

          if (existingUsers.totalDocs === 0) {
            // This is the first user - make them super admin
            data.isAdmin = true
            data.status = 'active'
          }
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Prevent users from deleting themselves
        if (req.user && String(req.user.id) === String(id)) {
          throw new Error('You cannot delete your own account')
        }

        // Prevent deleting the last super admin
        const userToDelete = await req.payload.findByID({
          collection: 'users',
          id,
        })

        if (userToDelete?.isAdmin) {
          // Count remaining super admins
          const superAdmins = await req.payload.find({
            collection: 'users',
            where: {
              isAdmin: { equals: true },
            },
            limit: 2,
          })

          if (superAdmins.totalDocs <= 1) {
            throw new Error('Cannot delete the last super admin. Please create another super admin first.')
          }
        }
      },
    ],
    afterLogin: [
      async ({ user, req }) => {
        // Update last login time
        await req.payload.update({
          collection: 'users',
          id: user.id,
          data: {
            lastLogin: new Date().toISOString(),
          },
          req, // Crucial for Postgres transaction joining to prevent deadlocks
        })
      },
    ],
  },
}
