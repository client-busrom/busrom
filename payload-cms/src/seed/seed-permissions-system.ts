/**
 * Seed RBAC Permissions System for Payload CMS
 *
 * This script initializes the permission system with:
 * 1. All system permissions
 * 2. Predefined roles
 * 3. Links permissions to roles
 *
 * Run this during application initialization (onInit hook)
 */

import type { Payload } from 'payload'

/**
 * Permission definitions
 *
 * Each permission is defined as {resource, action, name, category}
 * Categories are aligned with Admin UI grouping
 */
const PERMISSIONS = [
  // ==================== 用户与权限 (Users & Access) ====================
  { resource: 'USER', action: 'CREATE', name: '创建用户', category: 'USER' },
  { resource: 'USER', action: 'READ', name: '查看用户', category: 'USER' },
  { resource: 'USER', action: 'UPDATE', name: '更新用户', category: 'USER' },
  { resource: 'USER', action: 'DELETE', name: '删除用户', category: 'USER' },
  { resource: 'USER', action: 'MANAGE', name: '管理用户角色', category: 'USER' },

  { resource: 'ROLE', action: 'CREATE', name: '创建角色', category: 'USER' },
  { resource: 'ROLE', action: 'READ', name: '查看角色', category: 'USER' },
  { resource: 'ROLE', action: 'UPDATE', name: '更新角色', category: 'USER' },
  { resource: 'ROLE', action: 'DELETE', name: '删除角色', category: 'USER' },
  { resource: 'ROLE', action: 'MANAGE', name: '管理角色权限', category: 'USER' },

  { resource: 'PERMISSION', action: 'CREATE', name: '创建权限', category: 'USER' },
  { resource: 'PERMISSION', action: 'READ', name: '查看权限', category: 'USER' },
  { resource: 'PERMISSION', action: 'UPDATE', name: '更新权限', category: 'USER' },
  { resource: 'PERMISSION', action: 'DELETE', name: '删除权限', category: 'USER' },

  { resource: 'ACTIVITY_LOG', action: 'READ', name: '查看操作日志', category: 'USER' },
  { resource: 'ACTIVITY_LOG', action: 'DELETE', name: '删除操作日志', category: 'USER' },

  // ==================== 内容管理 (Content) ====================
  // Products
  { resource: 'PRODUCT', action: 'CREATE', name: '创建产品', category: 'CONTENT' },
  { resource: 'PRODUCT', action: 'READ', name: '查看产品', category: 'CONTENT' },
  { resource: 'PRODUCT', action: 'UPDATE', name: '更新产品', category: 'CONTENT' },
  { resource: 'PRODUCT', action: 'DELETE', name: '删除产品', category: 'CONTENT' },
  { resource: 'PRODUCT', action: 'PUBLISH', name: '发布产品', category: 'CONTENT' },

  { resource: 'PRODUCT_SERIES', action: 'CREATE', name: '创建产品系列', category: 'CONTENT' },
  { resource: 'PRODUCT_SERIES', action: 'READ', name: '查看产品系列', category: 'CONTENT' },
  { resource: 'PRODUCT_SERIES', action: 'UPDATE', name: '更新产品系列', category: 'CONTENT' },
  { resource: 'PRODUCT_SERIES', action: 'DELETE', name: '删除产品系列', category: 'CONTENT' },

  // Pages
  { resource: 'PAGE', action: 'CREATE', name: '创建页面', category: 'CONTENT' },
  { resource: 'PAGE', action: 'READ', name: '查看页面', category: 'CONTENT' },
  { resource: 'PAGE', action: 'UPDATE', name: '更新页面', category: 'CONTENT' },
  { resource: 'PAGE', action: 'DELETE', name: '删除页面', category: 'CONTENT' },

  // Blogs
  { resource: 'BLOG', action: 'CREATE', name: '创建博客', category: 'CONTENT' },
  { resource: 'BLOG', action: 'READ', name: '查看博客', category: 'CONTENT' },
  { resource: 'BLOG', action: 'UPDATE', name: '更新博客', category: 'CONTENT' },
  { resource: 'BLOG', action: 'DELETE', name: '删除博客', category: 'CONTENT' },
  { resource: 'BLOG', action: 'PUBLISH', name: '发布博客', category: 'CONTENT' },

  // Applications
  { resource: 'APPLICATION', action: 'CREATE', name: '创建应用案例', category: 'CONTENT' },
  { resource: 'APPLICATION', action: 'READ', name: '查看应用案例', category: 'CONTENT' },
  { resource: 'APPLICATION', action: 'UPDATE', name: '更新应用案例', category: 'CONTENT' },
  { resource: 'APPLICATION', action: 'DELETE', name: '删除应用案例', category: 'CONTENT' },

  // Categories
  { resource: 'CATEGORY', action: 'CREATE', name: '创建分类', category: 'CONTENT' },
  { resource: 'CATEGORY', action: 'READ', name: '查看分类', category: 'CONTENT' },
  { resource: 'CATEGORY', action: 'UPDATE', name: '更新分类', category: 'CONTENT' },
  { resource: 'CATEGORY', action: 'DELETE', name: '删除分类', category: 'CONTENT' },

  // FAQ Items
  { resource: 'FAQ_ITEM', action: 'CREATE', name: '创建FAQ', category: 'CONTENT' },
  { resource: 'FAQ_ITEM', action: 'READ', name: '查看FAQ', category: 'CONTENT' },
  { resource: 'FAQ_ITEM', action: 'UPDATE', name: '更新FAQ', category: 'CONTENT' },
  { resource: 'FAQ_ITEM', action: 'DELETE', name: '删除FAQ', category: 'CONTENT' },

  // Reusable Blocks
  { resource: 'REUSABLE_BLOCK', action: 'CREATE', name: '创建复用块', category: 'CONTENT' },
  { resource: 'REUSABLE_BLOCK', action: 'READ', name: '查看复用块', category: 'CONTENT' },
  { resource: 'REUSABLE_BLOCK', action: 'UPDATE', name: '更新复用块', category: 'CONTENT' },
  { resource: 'REUSABLE_BLOCK', action: 'DELETE', name: '删除复用块', category: 'CONTENT' },

  // Document Templates
  { resource: 'DOCUMENT_TEMPLATE', action: 'CREATE', name: '创建文档模板', category: 'CONTENT' },
  { resource: 'DOCUMENT_TEMPLATE', action: 'READ', name: '查看文档模板', category: 'CONTENT' },
  { resource: 'DOCUMENT_TEMPLATE', action: 'UPDATE', name: '更新文档模板', category: 'CONTENT' },
  { resource: 'DOCUMENT_TEMPLATE', action: 'DELETE', name: '删除文档模板', category: 'CONTENT' },

  // Navigation Menus
  { resource: 'NAVIGATION_MENU', action: 'CREATE', name: '创建导航菜单', category: 'CONTENT' },
  { resource: 'NAVIGATION_MENU', action: 'READ', name: '查看导航菜单', category: 'CONTENT' },
  { resource: 'NAVIGATION_MENU', action: 'UPDATE', name: '更新导航菜单', category: 'CONTENT' },
  { resource: 'NAVIGATION_MENU', action: 'DELETE', name: '删除导航菜单', category: 'CONTENT' },

  // Hero Banner Items
  { resource: 'HERO_BANNER_ITEM', action: 'CREATE', name: '创建轮播图', category: 'CONTENT' },
  { resource: 'HERO_BANNER_ITEM', action: 'READ', name: '查看轮播图', category: 'CONTENT' },
  { resource: 'HERO_BANNER_ITEM', action: 'UPDATE', name: '更新轮播图', category: 'CONTENT' },
  { resource: 'HERO_BANNER_ITEM', action: 'DELETE', name: '删除轮播图', category: 'CONTENT' },

  // ==================== 媒体库 (Media Library) ====================
  { resource: 'MEDIA', action: 'CREATE', name: '上传媒体', category: 'MEDIA' },
  { resource: 'MEDIA', action: 'READ', name: '查看媒体', category: 'MEDIA' },
  { resource: 'MEDIA', action: 'UPDATE', name: '更新媒体', category: 'MEDIA' },
  { resource: 'MEDIA', action: 'DELETE', name: '删除媒体', category: 'MEDIA' },

  { resource: 'MEDIA_CATEGORY', action: 'CREATE', name: '创建媒体分类', category: 'MEDIA' },
  { resource: 'MEDIA_CATEGORY', action: 'READ', name: '查看媒体分类', category: 'MEDIA' },
  { resource: 'MEDIA_CATEGORY', action: 'UPDATE', name: '更新媒体分类', category: 'MEDIA' },
  { resource: 'MEDIA_CATEGORY', action: 'DELETE', name: '删除媒体分类', category: 'MEDIA' },

  { resource: 'MEDIA_TAG', action: 'CREATE', name: '创建媒体标签', category: 'MEDIA' },
  { resource: 'MEDIA_TAG', action: 'READ', name: '查看媒体标签', category: 'MEDIA' },
  { resource: 'MEDIA_TAG', action: 'UPDATE', name: '更新媒体标签', category: 'MEDIA' },
  { resource: 'MEDIA_TAG', action: 'DELETE', name: '删除媒体标签', category: 'MEDIA' },

  // ==================== 表单管理 (Forms) ====================
  { resource: 'FORM_CONFIG', action: 'CREATE', name: '创建表单配置', category: 'FORMS' },
  { resource: 'FORM_CONFIG', action: 'READ', name: '查看表单配置', category: 'FORMS' },
  { resource: 'FORM_CONFIG', action: 'UPDATE', name: '更新表单配置', category: 'FORMS' },
  { resource: 'FORM_CONFIG', action: 'DELETE', name: '删除表单配置', category: 'FORMS' },

  { resource: 'FORM_SUBMISSION', action: 'READ', name: '查看表单提交', category: 'FORMS' },
  { resource: 'FORM_SUBMISSION', action: 'UPDATE', name: '更新表单提交', category: 'FORMS' },
  { resource: 'FORM_SUBMISSION', action: 'DELETE', name: '删除表单提交', category: 'FORMS' },
  { resource: 'FORM_SUBMISSION', action: 'EXPORT', name: '导出表单提交', category: 'FORMS' },

  // ==================== 首页管理 (Homepage) ====================
  { resource: 'HOME_CONTENT', action: 'READ', name: '查看首页内容', category: 'HOMEPAGE' },
  { resource: 'HOME_CONTENT', action: 'UPDATE', name: '更新首页内容', category: 'HOMEPAGE' },

  { resource: 'FOOTER', action: 'READ', name: '查看页脚', category: 'HOMEPAGE' },
  { resource: 'FOOTER', action: 'UPDATE', name: '更新页脚', category: 'HOMEPAGE' },

  { resource: 'HOMEPAGE_GLOBAL', action: 'READ', name: '查看首页组件', category: 'HOMEPAGE' },
  { resource: 'HOMEPAGE_GLOBAL', action: 'UPDATE', name: '更新首页组件', category: 'HOMEPAGE' },

  // ==================== 系统设置 (System Settings) ====================
  { resource: 'SITE_CONFIG', action: 'READ', name: '查看站点配置', category: 'SYSTEM' },
  { resource: 'SITE_CONFIG', action: 'UPDATE', name: '更新站点配置', category: 'SYSTEM' },

  { resource: 'SEO_SETTING', action: 'CREATE', name: '创建SEO设置', category: 'SYSTEM' },
  { resource: 'SEO_SETTING', action: 'READ', name: '查看SEO设置', category: 'SYSTEM' },
  { resource: 'SEO_SETTING', action: 'UPDATE', name: '更新SEO设置', category: 'SYSTEM' },
  { resource: 'SEO_SETTING', action: 'DELETE', name: '删除SEO设置', category: 'SYSTEM' },

  { resource: 'CUSTOM_SCRIPT', action: 'CREATE', name: '创建自定义脚本', category: 'SYSTEM' },
  { resource: 'CUSTOM_SCRIPT', action: 'READ', name: '查看自定义脚本', category: 'SYSTEM' },
  { resource: 'CUSTOM_SCRIPT', action: 'UPDATE', name: '更新自定义脚本', category: 'SYSTEM' },
  { resource: 'CUSTOM_SCRIPT', action: 'DELETE', name: '删除自定义脚本', category: 'SYSTEM' },

  { resource: 'EMAIL_CONFIG', action: 'READ', name: '查看邮件配置', category: 'SYSTEM' },
  { resource: 'EMAIL_CONFIG', action: 'UPDATE', name: '更新邮件配置', category: 'SYSTEM' },

  { resource: 'CONTACT_CONFIG', action: 'READ', name: '查看联系配置', category: 'SYSTEM' },
  { resource: 'CONTACT_CONFIG', action: 'UPDATE', name: '更新联系配置', category: 'SYSTEM' },

  { resource: 'SOCIAL_CONFIG', action: 'READ', name: '查看社交配置', category: 'SYSTEM' },
  { resource: 'SOCIAL_CONFIG', action: 'UPDATE', name: '更新社交配置', category: 'SYSTEM' },

  { resource: 'TRANSLATION_CONFIG', action: 'READ', name: '查看翻译配置', category: 'SYSTEM' },
  { resource: 'TRANSLATION_CONFIG', action: 'UPDATE', name: '更新翻译配置', category: 'SYSTEM' },
]

/**
 * Role definitions
 *
 * Each role has a set of permission identifiers (RESOURCE_ACTION format)
 */
const ROLES = [
  {
    name: { en: 'Super Admin', zh: '超级管理员' },
    code: 'super_admin',
    description: { en: 'Full access to all system features', zh: '拥有系统所有权限' },
    isSystem: true,
    priority: 10,
    permissions: '*', // All permissions
  },
  {
    name: { en: 'Content Editor', zh: '内容编辑' },
    code: 'content_editor',
    description: { en: 'Create and edit content', zh: '负责内容的创建和编辑' },
    isSystem: true,
    priority: 7,
    permissions: [
      // Content - CRUD (no delete for most)
      'PRODUCT_CREATE', 'PRODUCT_READ', 'PRODUCT_UPDATE',
      'PRODUCT_SERIES_READ', 'PRODUCT_SERIES_UPDATE',
      'PAGE_CREATE', 'PAGE_READ', 'PAGE_UPDATE',
      'BLOG_CREATE', 'BLOG_READ', 'BLOG_UPDATE',
      'APPLICATION_CREATE', 'APPLICATION_READ', 'APPLICATION_UPDATE',
      'FAQ_ITEM_CREATE', 'FAQ_ITEM_READ', 'FAQ_ITEM_UPDATE',
      'REUSABLE_BLOCK_CREATE', 'REUSABLE_BLOCK_READ', 'REUSABLE_BLOCK_UPDATE', 'REUSABLE_BLOCK_DELETE',
      'DOCUMENT_TEMPLATE_CREATE', 'DOCUMENT_TEMPLATE_READ', 'DOCUMENT_TEMPLATE_UPDATE', 'DOCUMENT_TEMPLATE_DELETE',
      'NAVIGATION_MENU_READ', 'NAVIGATION_MENU_UPDATE',
      'HERO_BANNER_ITEM_CREATE', 'HERO_BANNER_ITEM_READ', 'HERO_BANNER_ITEM_UPDATE',
      // Media - Full access
      'MEDIA_CREATE', 'MEDIA_READ', 'MEDIA_UPDATE', 'MEDIA_DELETE',
      'MEDIA_CATEGORY_READ',
      'MEDIA_TAG_READ',
      // Categories - Read only
      'CATEGORY_READ',
      // Homepage - Read and Update
      'HOME_CONTENT_READ', 'HOME_CONTENT_UPDATE',
      'FOOTER_READ', 'FOOTER_UPDATE',
      'HOMEPAGE_GLOBAL_READ', 'HOMEPAGE_GLOBAL_UPDATE',
    ],
  },
  {
    name: { en: 'Content Reviewer', zh: '内容审核' },
    code: 'content_reviewer',
    description: { en: 'Review and publish content', zh: '负责内容的审核和发布' },
    isSystem: true,
    priority: 8,
    permissions: [
      'PRODUCT_READ', 'PRODUCT_UPDATE', 'PRODUCT_PUBLISH',
      'PRODUCT_SERIES_READ',
      'PAGE_READ', 'PAGE_UPDATE',
      'BLOG_READ', 'BLOG_UPDATE', 'BLOG_PUBLISH',
      'APPLICATION_READ', 'APPLICATION_UPDATE',
      'FAQ_ITEM_READ', 'FAQ_ITEM_UPDATE',
      'MEDIA_READ',
      'CATEGORY_READ',
    ],
  },
  {
    name: { en: 'Customer Support', zh: '客服专员' },
    code: 'customer_support',
    description: { en: 'Handle customer inquiries and form submissions', zh: '负责处理客户咨询和表单提交' },
    isSystem: true,
    priority: 5,
    permissions: [
      // Forms - Full access
      'FORM_SUBMISSION_READ', 'FORM_SUBMISSION_UPDATE', 'FORM_SUBMISSION_EXPORT',
      'FORM_CONFIG_READ',
      // Content - Read only
      'PRODUCT_READ',
      'PRODUCT_SERIES_READ',
      'FAQ_ITEM_READ',
      'PAGE_READ',
    ],
  },
  {
    name: { en: 'SEO Specialist', zh: 'SEO专员' },
    code: 'seo_specialist',
    description: { en: 'Manage SEO settings and scripts', zh: '负责网站SEO优化' },
    isSystem: true,
    priority: 6,
    permissions: [
      // SEO - Full access
      'SEO_SETTING_CREATE', 'SEO_SETTING_READ', 'SEO_SETTING_UPDATE', 'SEO_SETTING_DELETE',
      'CUSTOM_SCRIPT_CREATE', 'CUSTOM_SCRIPT_READ', 'CUSTOM_SCRIPT_UPDATE', 'CUSTOM_SCRIPT_DELETE',
      // Content - Read only (for SEO context)
      'PRODUCT_READ',
      'PRODUCT_SERIES_READ',
      'PAGE_READ',
      'BLOG_READ',
      'APPLICATION_READ',
    ],
  },
  {
    name: { en: 'Media Manager', zh: '媒体管理员' },
    code: 'media_manager',
    description: { en: 'Manage all media assets', zh: '负责媒体资源管理' },
    isSystem: true,
    priority: 6,
    permissions: [
      // Media - Full access
      'MEDIA_CREATE', 'MEDIA_READ', 'MEDIA_UPDATE', 'MEDIA_DELETE',
      'MEDIA_CATEGORY_CREATE', 'MEDIA_CATEGORY_READ', 'MEDIA_CATEGORY_UPDATE', 'MEDIA_CATEGORY_DELETE',
      'MEDIA_TAG_CREATE', 'MEDIA_TAG_READ', 'MEDIA_TAG_UPDATE', 'MEDIA_TAG_DELETE',
      // Categories - Full access (for media organization)
      'CATEGORY_CREATE', 'CATEGORY_READ', 'CATEGORY_UPDATE', 'CATEGORY_DELETE',
    ],
  },
]

/**
 * Seed permissions
 */
async function seedPermissions(payload: Payload): Promise<Map<string, string | number>> {
  payload.logger.info('🌱 Seeding permissions...')

  const permissionMap = new Map<string, string | number>() // identifier -> id

  // Fetch all existing permissions
  const existingPermissions = await payload.find({
    collection: 'permissions',
    limit: 1000,
    depth: 0,
  })

  // Create a map of existing permissions
  const existingMap = new Map<string, string | number>()
  for (const perm of existingPermissions.docs) {
    if (perm.identifier) {
      existingMap.set(perm.identifier, perm.id)
    }
  }

  let createdCount = 0
  let existingCount = 0

  for (const perm of PERMISSIONS) {
    const identifier = `${perm.resource}_${perm.action}`

    if (existingMap.has(identifier)) {
      // Permission already exists
      permissionMap.set(identifier, existingMap.get(identifier)!)
      existingCount++
    } else {
      // Create new permission
      try {
        const created = await payload.create({
          collection: 'permissions',
          data: {
            resource: perm.resource,
            action: perm.action,
            identifier,
            category: perm.category,
            description: perm.name,
            isSystem: true,
          },
        })
        permissionMap.set(identifier, created.id)
        createdCount++
      } catch (error) {
        payload.logger.error(`Failed to create permission ${identifier}:`, error)
      }
    }
  }

  if (createdCount > 0) {
    payload.logger.info(`  ✓ Created ${createdCount} new permissions`)
  }
  if (existingCount > 0) {
    payload.logger.info(`  ⊙ ${existingCount} permissions already exist`)
  }

  return permissionMap
}

/**
 * Seed roles
 */
async function seedRoles(payload: Payload, permissionMap: Map<string, string | number>): Promise<void> {
  payload.logger.info('🌱 Seeding roles...')

  // Fetch existing roles
  const existingRoles = await payload.find({
    collection: 'roles',
    limit: 100,
    depth: 0,
  })

  const existingCodes = new Set(existingRoles.docs.map((r) => r.code))

  let createdCount = 0
  let existingCount = 0

  for (const roleData of ROLES) {
    if (existingCodes.has(roleData.code)) {
      existingCount++
      continue
    }

    // Get permission IDs
    let permissionIds: (string | number)[] = []

    if (roleData.permissions === '*') {
      // Super admin: all permissions
      permissionIds = Array.from(permissionMap.values())
    } else {
      // Regular role: specific permissions
      for (const identifier of roleData.permissions as string[]) {
        const permId = permissionMap.get(identifier)
        if (permId) {
          permissionIds.push(permId)
        } else {
          payload.logger.warn(`  ⚠️  Permission not found: ${identifier}`)
        }
      }
    }

    try {
      // Create role with English locale first
      const created = await payload.create({
        collection: 'roles',
        locale: 'en',
        data: {
          name: roleData.name.en,
          code: roleData.code,
          description: roleData.description.en,
          isSystem: roleData.isSystem,
          isActive: true,
          priority: roleData.priority,
          permissions: permissionIds,
        },
      })

      // Update with Chinese locale
      await payload.update({
        collection: 'roles',
        id: created.id,
        locale: 'zh',
        data: {
          name: roleData.name.zh,
          description: roleData.description.zh,
        },
      })

      createdCount++
      payload.logger.info(`  ✓ Created role: ${roleData.name.en} / ${roleData.name.zh} (${permissionIds.length} permissions)`)
    } catch (error) {
      payload.logger.error(`Failed to create role ${roleData.code}:`, error)
    }
  }

  if (existingCount > 0) {
    payload.logger.info(`  ⊙ ${existingCount} roles already exist`)
  }
}

/**
 * Main seeding function
 */
export async function seedPermissionsSystem(payload: Payload): Promise<void> {
  payload.logger.info('')
  payload.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  payload.logger.info('🔐 Initializing RBAC Permissions System')
  payload.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // Step 1: Seed permissions
    const permissionMap = await seedPermissions(payload)

    // Step 2: Seed roles
    await seedRoles(payload, permissionMap)

    payload.logger.info('')
    payload.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    payload.logger.info('✅ RBAC Permissions System Initialized!')
    payload.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    payload.logger.info('')
  } catch (error) {
    payload.logger.error('❌ Failed to seed permissions system:', error)
    throw error
  }
}
