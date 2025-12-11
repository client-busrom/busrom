/**
 * Permission Model - RBAC Permission System
 *
 * This model defines all available permissions in the system.
 * Each permission represents a specific action on a specific resource.
 *
 * Example:
 * - Product:create - Permission to create products
 * - Blog:publish - Permission to publish blog posts
 * - CustomScript:inject_code - Permission to inject custom scripts
 */

import { list } from '@keystone-6/core'
import { text, select, checkbox, timestamp, relationship } from '@keystone-6/core/fields'

export const Permission = list({
  access: {
    operation: {
      // All authenticated users can query permissions (needed for permission selector UI)
      // But the Permission menu is still hidden from non-admins (see ui.isHidden below)
      query: ({ session }) => !!session,
      create: ({ session }) => {
        // Only super admins can create custom permissions
        return session?.data?.isAdmin === true
      },
      update: ({ session }) => {
        return session?.data?.isAdmin === true
      },
      delete: ({ session, item }) => {
        // Cannot delete system permissions
        if (item.isSystem) return false
        return session?.data?.isAdmin === true
      },
    },
  },

  fields: {
    // ==================================================================
    // 📋 Basic Information
    // ==================================================================

    /**
     * Resource Type
     *
     * The entity/model this permission applies to
     */
    resource: select({
      type: 'enum',
      options: [
        // Auth & Users
        { label: 'User (用户)', value: 'User' },
        { label: 'Role (角色)', value: 'Role' },
        { label: 'Permission (权限)', value: 'Permission' },
        { label: 'ActivityLog (操作日志)', value: 'ActivityLog' },

        // Navigation
        { label: 'NavigationMenu (导航菜单)', value: 'NavigationMenu' },

        // Home Page Content
        { label: 'HomeContent (首页内容-旧)', value: 'HomeContent' }, // 保留旧的，避免数据库迁移错误
        { label: 'HeroBannerItem (首页Banner)', value: 'HeroBannerItem' },
        { label: 'ProductSeriesCarousel (产品系列轮播)', value: 'ProductSeriesCarousel' },
        { label: 'ServiceFeaturesConfig (服务特性)', value: 'ServiceFeaturesConfig' },
        { label: 'Sphere3d (3D球体)', value: 'Sphere3d' },
        { label: 'SimpleCta (简单CTA)', value: 'SimpleCta' },
        { label: 'SeriesIntro (系列介绍)', value: 'SeriesIntro' },
        { label: 'FeaturedProducts (特色产品)', value: 'FeaturedProducts' },
        { label: 'BrandAdvantages (品牌优势)', value: 'BrandAdvantages' },
        { label: 'OemOdm (OEM/ODM)', value: 'OemOdm' },
        { label: 'QuoteSteps (报价步骤)', value: 'QuoteSteps' },
        { label: 'MainForm (主表单)', value: 'MainForm' },
        { label: 'WhyChooseBusrom (选择理由)', value: 'WhyChooseBusrom' },
        { label: 'CaseStudies (案例研究)', value: 'CaseStudies' },
        { label: 'BrandAnalysis (品牌分析)', value: 'BrandAnalysis' },
        { label: 'BrandValue (品牌价值)', value: 'BrandValue' },
        { label: 'Footer (页脚)', value: 'Footer' },

        // Media
        { label: 'Media (媒体资源)', value: 'Media' },
        { label: 'MediaCategory (媒体分类)', value: 'MediaCategory' },
        { label: 'MediaTag (媒体标签)', value: 'MediaTag' },

        // Products
        { label: 'ProductSeries (产品系列)', value: 'ProductSeries' },
        { label: 'Product (产品)', value: 'Product' },

        // Content
        { label: 'Category (分类)', value: 'Category' },
        { label: 'Blog (博客)', value: 'Blog' },
        { label: 'Application (应用案例)', value: 'Application' },
        { label: 'Page (页面)', value: 'Page' },
        { label: 'FaqItem (常见问题)', value: 'FaqItem' },

        // Component Blocks
        { label: 'DocumentTemplate (文档模板)', value: 'DocumentTemplate' },
        { label: 'ReusableBlock (复用块)', value: 'ReusableBlock' },
        { label: 'ReusableBlockVersion (复用块版本-旧)', value: 'ReusableBlockVersion' }, // 保留旧的，避免数据库迁移错误
        { label: 'ReusableBlockContentTranslation (复用块翻译)', value: 'ReusableBlockContentTranslation' },
        { label: 'ProductSeriesContentTranslation (产品系列翻译)', value: 'ProductSeriesContentTranslation' },
        { label: 'ProductContentTranslation (产品翻译)', value: 'ProductContentTranslation' },
        { label: 'ApplicationContentTranslation (应用案例翻译)', value: 'ApplicationContentTranslation' },
        { label: 'PageContentTranslation (页面翻译)', value: 'PageContentTranslation' },
        { label: 'BlogContentTranslation (博客翻译)', value: 'BlogContentTranslation' },

        // Forms
        { label: 'FormConfig (表单配置)', value: 'FormConfig' },
        { label: 'FormSubmission (表单提交)', value: 'FormSubmission' },

        // Advanced
        { label: 'CustomScript (自定义脚本)', value: 'CustomScript' },
        { label: 'SeoSetting (SEO设置)', value: 'SeoSetting' },

        // Site Config (拆分后)
        { label: 'SiteConfig (站点基础配置)', value: 'SiteConfig' },
        { label: 'ContactConfig (联系信息配置)', value: 'ContactConfig' },
        { label: 'SocialConfig (社交媒体配置)', value: 'SocialConfig' },
        { label: 'EmailConfig (邮件服务配置)', value: 'EmailConfig' },
        { label: 'SeoConfig (SEO配置)', value: 'SeoConfig' },
      ],
      validation: { isRequired: true },
      label: 'Resource | 资源类型',
      ui: {
        displayMode: 'select',
        description: 'The resource/entity this permission applies to | 此权限适用的资源/实体',
      },
    }),

    /**
     * Action Type
     *
     * The operation being permitted
     */
    action: select({
      type: 'enum',
      options: [
        // CRUD Operations
        { label: 'Create (创建)', value: 'create' },
        { label: 'Read (查看)', value: 'read' },
        { label: 'Update (更新)', value: 'update' },
        { label: 'Delete (删除)', value: 'delete' },

        // Special Operations
        { label: 'Publish (发布)', value: 'publish' },
        { label: 'Export (导出)', value: 'export' },
        { label: 'Import (导入)', value: 'import' },
        { label: 'ManageRoles (管理角色)', value: 'manage_roles' },
        { label: 'ManagePermissions (管理权限)', value: 'manage_permissions' },
        { label: 'InjectCode (注入代码)', value: 'inject_code' },
        { label: 'ViewLogs (查看日志)', value: 'view_logs' },
      ],
      validation: { isRequired: true },
      label: 'Action | 操作',
      ui: {
        displayMode: 'select',
        description: 'The action/operation being permitted | 被允许的操作',
      },
    }),

    /**
     * Unique Identifier
     *
     * Format: {resource}:{action}
     * Example: Product:create, Blog:publish
     *
     * Auto-generated from resource and action
     */
    identifier: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
      db: { isNullable: false },
      label: 'Identifier | 标识符',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        description: 'Auto-generated unique identifier (resource:action) | 自动生成的唯一标识符 (资源:操作)',
      },
    }),

    /**
     * Permission Name
     *
     * Human-readable name for this permission
     */
    name: text({
      validation: { isRequired: true },
      db: { isNullable: false },
      label: 'Permission Name | 权限名称',
      ui: {
        description: 'Human-readable permission name (e.g., "创建产品", "发布博客") | 易读的权限名称',
      },
    }),

    /**
     * Description
     *
     * Detailed explanation of what this permission allows
     */
    description: text({
      label: 'Description | 描述',
      ui: {
        displayMode: 'textarea',
        description: 'Detailed explanation of what this permission allows | 此权限允许的详细说明',
      },
    }),

    // ==================================================================
    // 🏷️ Categorization
    // ==================================================================

    /**
     * Permission Category
     *
     * Groups related permissions together for easier management
     * Aligned with Navigation.tsx grouping
     */
    category: select({
      type: 'string',
      options: [
        { label: '身份验证 & 用户', value: 'auth_and_users' },
        { label: '导航管理', value: 'navigation' },
        { label: '首页内容', value: 'home_page' },
        { label: '媒体库 (AWS S3)', value: 'media' },
        { label: '产品管理', value: 'products' },
        { label: '内容管理', value: 'content' },
        { label: '组件块管理', value: 'component_blocks' },
        { label: '表单', value: 'forms' },
        { label: '高级功能', value: 'advanced' },
        { label: '站点配置', value: 'site_config' },
      ],
      defaultValue: 'content',
      label: 'Category | 分类',
      ui: {
        displayMode: 'select',
        description: 'Category for organizing permissions in the UI (aligned with Navigation) | 用于在界面中组织权限的分类（与导航栏一致）',
      },
    }),

    // ==================================================================
    // 🔒 System Flags
    // ==================================================================

    /**
     * System Permission Flag
     *
     * System permissions are pre-defined and cannot be deleted
     */
    isSystem: checkbox({
      defaultValue: true,
      label: 'System Permission | 系统权限',
      ui: {
        description: 'System permissions cannot be deleted | 系统权限不可删除',
        itemView: { fieldMode: 'read' },
      },
    }),

    // ==================================================================
    // 🔗 Relationships
    // ==================================================================

    /**
     * Roles with this Permission
     *
     * Many-to-many relationship with Role
     */
    roles: relationship({
      ref: 'Role.permissions',
      many: true,
      label: 'Roles | 角色',
      ui: {
        displayMode: 'count',
        description: 'Roles that have been granted this permission | 已被授予此权限的角色',
      },
    }),

    /**
     * Users with Direct Permission
     *
     * Many-to-many relationship for directly assigned permissions
     */
    users: relationship({
      ref: 'User.directPermissions',
      many: true,
      label: 'Users | 用户',
      ui: {
        displayMode: 'count',
        description: 'Users who have been directly granted this permission | 已被直接授予此权限的用户',
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
     * Auto-generate identifier before create/update
     */
    resolveInput: async ({ resolvedData, operation }) => {
      if (
        operation === 'create' ||
        (operation === 'update' && (resolvedData.resource || resolvedData.action))
      ) {
        const resource = resolvedData.resource
        const action = resolvedData.action

        if (resource && action) {
          resolvedData.identifier = `${resource}:${action}`
        }
      }

      return resolvedData
    },

    /**
     * Validate deletion
     */
    validateDelete: async ({ item, addValidationError }) => {
      if (item.isSystem) {
        addValidationError('System permissions cannot be deleted | 系统权限不可删除')
      }
    },
  },

  ui: {
    listView: {
      initialColumns: ['name', 'resource', 'action', 'category', 'isSystem'],
      initialSort: { field: 'category', direction: 'ASC' },
      pageSize: 100,
    },
    labelField: 'name',
    label: 'Permissions | 权限',
    description: 'Manage system permissions for role-based access control | 管理系统权限以实现基于角色的访问控制',
    // Hide from non-admin users
    isHidden: ({ session }: any) => !session?.data?.isAdmin,
  },
})
