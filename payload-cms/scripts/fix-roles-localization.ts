/**
 * Fix Roles Localization Data
 *
 * This script fixes the roles data where:
 * - English locale has Chinese text
 * - Chinese locale is empty
 *
 * Run with: npx tsx scripts/fix-roles-localization.ts
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

// Role name mappings (code -> { en, zh })
const ROLE_NAMES: Record<string, { en: string; zh: string; descEn: string; descZh: string }> = {
  super_admin: {
    en: 'Super Admin',
    zh: '超级管理员',
    descEn: 'Full access to all system features',
    descZh: '拥有系统所有权限',
  },
  content_editor: {
    en: 'Content Editor',
    zh: '内容编辑',
    descEn: 'Create and edit content',
    descZh: '负责内容的创建和编辑',
  },
  content_reviewer: {
    en: 'Content Reviewer',
    zh: '内容审核',
    descEn: 'Review and publish content',
    descZh: '负责内容的审核和发布',
  },
  customer_support: {
    en: 'Customer Support',
    zh: '客服专员',
    descEn: 'Handle customer inquiries and form submissions',
    descZh: '负责处理客户咨询和表单提交',
  },
  seo_specialist: {
    en: 'SEO Specialist',
    zh: 'SEO专员',
    descEn: 'Manage SEO settings and scripts',
    descZh: '负责网站SEO优化',
  },
  media_manager: {
    en: 'Media Manager',
    zh: '媒体管理员',
    descEn: 'Manage all media assets',
    descZh: '负责媒体资源管理',
  },
}

async function fixRolesLocalization() {
  console.log('🔧 Fixing roles localization...\n')

  const payload = await getPayload({ config })

  try {
    // Get all roles
    const roles = await payload.find({
      collection: 'roles',
      limit: 100,
      depth: 0,
    })

    console.log(`Found ${roles.docs.length} roles to fix\n`)

    for (const role of roles.docs) {
      const mapping = ROLE_NAMES[role.code as string]

      if (!mapping) {
        console.log(`⚠️  No mapping for role code: ${role.code}, skipping`)
        continue
      }

      console.log(`Fixing role: ${role.code}`)

      // Update English locale
      await payload.update({
        collection: 'roles',
        id: role.id,
        locale: 'en',
        data: {
          name: mapping.en,
          description: mapping.descEn,
        },
      })
      console.log(`  ✓ EN: ${mapping.en}`)

      // Update Chinese locale
      await payload.update({
        collection: 'roles',
        id: role.id,
        locale: 'zh',
        data: {
          name: mapping.zh,
          description: mapping.descZh,
        },
      })
      console.log(`  ✓ ZH: ${mapping.zh}`)
    }

    console.log('\n✅ Roles localization fixed!')
  } catch (error) {
    console.error('❌ Error fixing roles:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

fixRolesLocalization()
