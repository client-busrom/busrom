'use client'

/**
 * Permission Selector Component
 *
 * A custom field component that displays permissions grouped by category
 * with the ability to select entire categories at once.
 *
 * For Users: Shows role-inherited permissions as read-only (checked + disabled)
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useField, useAllFormFields, useDocumentInfo, useTranslation } from '@payloadcms/ui'

// Category labels mapping
const CATEGORY_LABELS: Record<string, { en: string; zh: string }> = {
  USER: { en: 'User Management', zh: '用户与权限' },
  CONTENT: { en: 'Content Management', zh: '内容管理' },
  MEDIA: { en: 'Media Management', zh: '媒体库' },
  FORMS: { en: 'Form Management', zh: '表单管理' },
  HOMEPAGE: { en: 'Homepage Management', zh: '首页管理' },
  SYSTEM: { en: 'System Configuration', zh: '系统设置' },
}

// Resource labels mapping
const RESOURCE_LABELS: Record<string, { en: string; zh: string }> = {
  USER: { en: 'Users', zh: '用户' },
  ROLE: { en: 'Roles', zh: '角色' },
  PERMISSION: { en: 'Permissions', zh: '权限' },
  AUDIT_LOG: { en: 'Audit Log', zh: '审计日志' },
  PRODUCT: { en: 'Products', zh: '产品' },
  PRODUCT_SERIES: { en: 'Product Series', zh: '产品系列' },
  PAGE: { en: 'Pages', zh: '页面' },
  BLOG: { en: 'Blogs', zh: '博客' },
  APPLICATION: { en: 'Applications', zh: '应用案例' },
  CATEGORY: { en: 'Categories', zh: '分类' },
  FAQ_ITEM: { en: 'FAQ Items', zh: '常见问题' },
  REUSABLE_BLOCK: { en: 'Reusable Blocks', zh: '可复用内容块' },
  DOCUMENT_TEMPLATE: { en: 'Document Templates', zh: '文档模版' },
  NAVIGATION_MENU: { en: 'Navigation Menus', zh: '导航菜单' },
  HERO_BANNER_ITEM: { en: 'Hero Banner Items', zh: '轮播图' },
  MEDIA: { en: 'Media', zh: '媒体' },
  MEDIA_CATEGORY: { en: 'Media Categories', zh: '媒体分类' },
  MEDIA_TAG: { en: 'Media Tags', zh: '媒体标签' },
  FORM_CONFIG: { en: 'Form Configs', zh: '表单配置' },
  FORM_SUBMISSION: { en: 'Form Submissions', zh: '表单提交' },
  HOME_CONTENT: { en: 'Home Content', zh: '首页内容' },
  FOOTER: { en: 'Footer', zh: '页脚' },
  HOMEPAGE_GLOBAL: { en: 'Homepage Globals', zh: '首页组件' },
  SITE_CONFIG: { en: 'Site Config', zh: '站点配置' },
  SEO_SETTING: { en: 'SEO Settings', zh: 'SEO 设置' },
  CUSTOM_SCRIPT: { en: 'Custom Scripts', zh: '自定义脚本' },
  EMAIL_CONFIG: { en: 'Email Config', zh: '邮件配置' },
  CONTACT_CONFIG: { en: 'Contact Config', zh: '联系配置' },
  SOCIAL_CONFIG: { en: 'Social Config', zh: '社交配置' },
  TRANSLATION_CONFIG: { en: 'Translation Config', zh: '翻译配置' },
}

// Action labels mapping
const ACTION_LABELS: Record<string, { en: string; zh: string }> = {
  CREATE: { en: 'Create', zh: '创建' },
  READ: { en: 'Read', zh: '读取' },
  UPDATE: { en: 'Update', zh: '更新' },
  DELETE: { en: 'Delete', zh: '删除' },
  PUBLISH: { en: 'Publish', zh: '发布' },
  EXPORT: { en: 'Export', zh: '导出' },
  IMPORT: { en: 'Import', zh: '导入' },
  MANAGE: { en: 'Manage', zh: '管理' },
}

// Category order for display
const CATEGORY_ORDER = ['USER', 'CONTENT', 'MEDIA', 'FORMS', 'HOMEPAGE', 'SYSTEM']

interface Permission {
  id: string
  identifier: string
  resource: string
  action: string
  category: string
  description?: string
}

interface PermissionsByCategory {
  [category: string]: Permission[]
}

interface PermissionSelectorProps {
  path: string
  field: {
    name: string
    label?: string | Record<string, string>
    admin?: {
      description?: string | Record<string, string>
    }
  }
}

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({ path, field }) => {
  const { value, setValue } = useField<string[]>({ path })
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORY_ORDER))
  const [rolePermissionIds, setRolePermissionIds] = useState<Set<string>>(new Set())
  const [loadingRoles, setLoadingRoles] = useState(false)
  const { i18n: { language } } = useTranslation()

  // Get localized text helper
  const t = (obj: { en: string; zh: string }) => {
    return language === 'zh' ? obj.zh : obj.en
  }

  // Get the document info to determine if we're editing a user or role
  const { collectionSlug } = useDocumentInfo()
  const isUserCollection = collectionSlug === 'users'

  // Get all form fields to watch the roles field
  const [fields] = useAllFormFields()

  // Extract roles value from form fields
  const rolesValue = useMemo(() => {
    if (!isUserCollection) return []
    if (!fields?.roles) return []
    const rolesFieldValue = fields.roles?.value
    if (!rolesFieldValue) return []
    if (Array.isArray(rolesFieldValue)) {
      return rolesFieldValue.map(r => {
        if (typeof r === 'object' && r !== null && 'id' in r) {
          return (r as { id: string }).id
        }
        return r
      }).filter(Boolean) as string[]
    }
    if (typeof rolesFieldValue === 'object' && rolesFieldValue !== null && 'id' in rolesFieldValue) {
      return [(rolesFieldValue as { id: string }).id].filter(Boolean)
    }
    return [rolesFieldValue as string].filter(Boolean)
  }, [isUserCollection, fields?.roles?.value])

  // Fetch all permissions on mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/permissions?limit=500&depth=0', {
          credentials: 'include', // Include cookies for authentication
        })
        const data = await response.json()
        if (data.docs) {
          setPermissions(data.docs)
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPermissions()
  }, [])

  // Fetch role permissions when roles change (for users collection)
  useEffect(() => {
    if (!isUserCollection) {
      setRolePermissionIds(new Set())
      return
    }

    if (rolesValue.length === 0) {
      setRolePermissionIds(new Set())
      return
    }

    const fetchRolePermissions = async () => {
      setLoadingRoles(true)
      try {
        const allPermIds = new Set<string>()

        for (const roleId of rolesValue) {
          if (!roleId) continue
          const response = await fetch(`/api/roles/${roleId}?depth=1`, {
            credentials: 'include', // Include cookies for authentication
          })
          const role = await response.json()

          if (role.permissions && Array.isArray(role.permissions)) {
            for (const perm of role.permissions) {
              const permId = typeof perm === 'object' ? perm.id : perm
              if (permId) allPermIds.add(String(permId))
            }
          }
        }

        setRolePermissionIds(allPermIds)
      } catch (error) {
        console.error('Failed to fetch role permissions:', error)
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRolePermissions()
  }, [isUserCollection, rolesValue.join(',')])

  // Group permissions by category
  const permissionsByCategory: PermissionsByCategory = useMemo(() => {
    const grouped: PermissionsByCategory = {}
    for (const perm of permissions) {
      const category = perm.category || 'OTHER'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(perm)
    }
    // Sort permissions within each category by resource then action
    for (const category of Object.keys(grouped)) {
      grouped[category].sort((a, b) => {
        if (a.resource !== b.resource) {
          return a.resource.localeCompare(b.resource)
        }
        return a.action.localeCompare(b.action)
      })
    }
    return grouped
  }, [permissions])

  // Get current selected permission IDs (direct permissions only)
  const selectedIds = useMemo(() => {
    return new Set((value || []).map(String))
  }, [value])

  // Check if a permission is from role
  const isFromRole = useCallback((permId: string) => {
    return rolePermissionIds.has(String(permId))
  }, [rolePermissionIds])

  // Check if permission is effectively selected (either direct or from role)
  const isEffectivelySelected = useCallback((permId: string) => {
    return selectedIds.has(String(permId)) || rolePermissionIds.has(String(permId))
  }, [selectedIds, rolePermissionIds])

  // Count for display
  const totalEffectivePermissions = useMemo(() => {
    const combined = new Set([...selectedIds, ...rolePermissionIds])
    return combined.size
  }, [selectedIds, rolePermissionIds])

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = useCallback(
    (category: string) => {
      const categoryPerms = permissionsByCategory[category] || []
      if (categoryPerms.length === 0) return false
      return categoryPerms.every((p) => isEffectivelySelected(p.id))
    },
    [permissionsByCategory, isEffectivelySelected]
  )

  // Check if some (but not all) permissions in a category are selected
  const isCategoryPartiallySelected = useCallback(
    (category: string) => {
      const categoryPerms = permissionsByCategory[category] || []
      if (categoryPerms.length === 0) return false
      const selectedCount = categoryPerms.filter((p) => isEffectivelySelected(p.id)).length
      return selectedCount > 0 && selectedCount < categoryPerms.length
    },
    [permissionsByCategory, isEffectivelySelected]
  )

  // Toggle a single permission
  const togglePermission = useCallback(
    (permId: string) => {
      // Can't toggle permissions that come from roles
      if (isUserCollection && rolePermissionIds.has(String(permId))) {
        return
      }

      const newValue = [...(value || [])]
      const permIdStr = String(permId)
      const index = newValue.findIndex(id => String(id) === permIdStr)

      if (index === -1) {
        newValue.push(permId)
      } else {
        newValue.splice(index, 1)
      }
      setValue(newValue)
    },
    [value, setValue, isUserCollection, rolePermissionIds]
  )

  // Toggle all permissions in a category
  const toggleCategory = useCallback(
    (category: string) => {
      const categoryPerms = permissionsByCategory[category] || []

      // For users, only toggle permissions not from roles
      const toggleablePerms = isUserCollection
        ? categoryPerms.filter(p => !rolePermissionIds.has(String(p.id)))
        : categoryPerms

      if (toggleablePerms.length === 0) return

      const toggleableIds = toggleablePerms.map((p) => p.id)
      const allToggleableSelected = toggleablePerms.every(p => selectedIds.has(String(p.id)))

      let newValue: string[]
      if (allToggleableSelected) {
        // Deselect all toggleable in category
        newValue = (value || []).filter((id) => !toggleableIds.map(String).includes(String(id)))
      } else {
        // Select all toggleable in category
        const currentSet = new Set((value || []).map(String))
        toggleableIds.forEach((id) => currentSet.add(String(id)))
        newValue = Array.from(currentSet)
      }
      setValue(newValue)
    },
    [value, setValue, permissionsByCategory, isUserCollection, rolePermissionIds, selectedIds]
  )

  // Toggle category expansion
  const toggleExpand = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }, [])

  // Select all permissions (only non-role ones for users)
  const selectAll = useCallback(() => {
    if (isUserCollection) {
      const nonRolePerms = permissions.filter(p => !rolePermissionIds.has(String(p.id)))
      setValue(nonRolePerms.map(p => p.id))
    } else {
      setValue(permissions.map((p) => p.id))
    }
  }, [permissions, setValue, isUserCollection, rolePermissionIds])

  // Deselect all direct permissions
  const deselectAll = useCallback(() => {
    setValue([])
  }, [setValue])

  // Get label text
  const labelText = useMemo(() => {
    if (!field.label) return ''
    if (typeof field.label === 'string') return field.label
    return t(field.label as { en: string; zh: string })
  }, [field.label, language])

  // Get description text
  const descriptionText = useMemo(() => {
    if (!field.admin?.description) return ''
    if (typeof field.admin.description === 'string') return field.admin.description
    return t(field.admin.description as { en: string; zh: string })
  }, [field.admin?.description, language])

  // i18n messages
  const messages = {
    loading: { en: 'Loading permissions...', zh: '加载权限中...' },
    loadingRoles: { en: 'Loading role permissions...', zh: '加载角色权限中...' },
    roleGranted: { en: 'Role has granted', zh: '角色已授予' },
    permissions: { en: 'permissions', zh: '个权限' },
    cannotCancel: { en: '(blue marked, cannot cancel)', zh: '（蓝色标记，不可取消）' },
    canAdd: { en: 'Can add', zh: '还可添加' },
    additionalPerms: { en: 'additional permissions', zh: '个额外权限' },
    allIncluded: { en: 'Role includes all permissions, no need to add more.', zh: '角色已包含所有权限，无需添加额外权限。' },
    totalPerms: { en: 'Total permissions', zh: '总权限' },
    fromRole: { en: 'from role', zh: '角色' },
    additional: { en: 'additional', zh: '额外' },
    selected: { en: 'Selected', zh: '已选择' },
    selectAll: { en: 'Select All', zh: '全选' },
    selectAllExtra: { en: 'Select All Extra', zh: '全选额外权限' },
    deselectAll: { en: 'Deselect All', zh: '取消全选' },
    clearExtra: { en: 'Clear Extra', zh: '清除额外权限' },
    allFromRole: { en: 'All from role', zh: '全部来自角色' },
    fromRoleLabel: { en: 'From role', zh: '角色' },
    cannotCancelTitle: { en: 'This permission is from role, cannot cancel', zh: '此权限来自角色，不可取消' },
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>
        {t(messages.loading)}
      </div>
    )
  }

  // Sort categories by defined order
  const sortedCategories = Object.keys(permissionsByCategory).sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a)
    const indexB = CATEGORY_ORDER.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  // Calculate how many permissions can still be added
  const additionalAvailable = isUserCollection
    ? permissions.filter(p => !rolePermissionIds.has(String(p.id))).length
    : 0

  return (
    <div className="permission-selector" style={{ marginBottom: '20px' }}>
      {/* Field Label */}
      {labelText && (
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontWeight: 500, fontSize: '14px' }}>
            {labelText}
          </label>
          {descriptionText && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--theme-elevation-400)' }}>
              {descriptionText}
            </p>
          )}
        </div>
      )}

      {/* Loading roles indicator */}
      {loadingRoles && (
        <div style={{ padding: '8px', color: '#666', fontSize: '13px' }}>
          {t(messages.loadingRoles)}
        </div>
      )}

      {/* Role permissions notice for users */}
      {isUserCollection && rolePermissionIds.size > 0 && (
        <div
          style={{
            padding: '12px',
            marginBottom: '12px',
            background: 'var(--theme-info-50)',
            border: '1px solid var(--theme-info-200)',
            borderRadius: '4px',
            fontSize: '13px',
          }}
        >
          <strong>{t(messages.roleGranted)} {rolePermissionIds.size} {t(messages.permissions)}</strong>{t(messages.cannotCancel)}
          {additionalAvailable > 0 ? (
            <span>。{t(messages.canAdd)} {additionalAvailable} {t(messages.additionalPerms)}。</span>
          ) : (
            <span>。{t(messages.allIncluded)}</span>
          )}
        </div>
      )}

      {/* Header with stats and actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '12px',
          background: 'var(--theme-elevation-50)',
          borderRadius: '4px',
        }}
      >
        <span style={{ fontWeight: 500 }}>
          {isUserCollection ? (
            <>
              {t(messages.totalPerms)}: {totalEffectivePermissions} / {permissions.length}
              {rolePermissionIds.size > 0 && (
                <span style={{ color: 'var(--theme-elevation-400)', marginLeft: '8px', fontSize: '13px' }}>
                  ({t(messages.fromRole)}: {rolePermissionIds.size}, {t(messages.additional)}: {selectedIds.size})
                </span>
              )}
            </>
          ) : (
            <>{t(messages.selected)} {selectedIds.size} / {permissions.length} {t(messages.permissions)}</>
          )}
        </span>

        {/* Only show buttons if there are permissions to toggle */}
        {(!isUserCollection || additionalAvailable > 0) && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={selectAll}
              style={{
                padding: '6px 12px',
                background: 'var(--theme-elevation-100)',
                border: '1px solid var(--theme-elevation-200)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {isUserCollection ? t(messages.selectAllExtra) : t(messages.selectAll)}
            </button>
            <button
              type="button"
              onClick={deselectAll}
              style={{
                padding: '6px 12px',
                background: 'var(--theme-elevation-100)',
                border: '1px solid var(--theme-elevation-200)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {isUserCollection ? t(messages.clearExtra) : t(messages.deselectAll)}
            </button>
          </div>
        )}
      </div>

      {/* Categories */}
      {sortedCategories.map((category) => {
        const categoryPerms = permissionsByCategory[category]
        const isExpanded = expandedCategories.has(category)
        const isFullySelected = isCategoryFullySelected(category)
        const isPartiallySelected = isCategoryPartiallySelected(category)
        const categoryLabel = CATEGORY_LABELS[category] || { en: category, zh: category }

        const selectedInCategory = categoryPerms.filter((p) => isEffectivelySelected(p.id)).length
        const roleInCategory = isUserCollection
          ? categoryPerms.filter(p => rolePermissionIds.has(String(p.id))).length
          : 0
        const directInCategory = categoryPerms.filter(p => selectedIds.has(String(p.id)) && !rolePermissionIds.has(String(p.id))).length

        // Check if all permissions in category are from role (no toggleable ones)
        const allFromRole = isUserCollection && roleInCategory === categoryPerms.length

        // Group permissions by resource within category
        const permsByResource: Record<string, Permission[]> = {}
        for (const perm of categoryPerms) {
          if (!permsByResource[perm.resource]) {
            permsByResource[perm.resource] = []
          }
          permsByResource[perm.resource].push(perm)
        }

        return (
          <div
            key={category}
            style={{
              marginBottom: '8px',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            {/* Category header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                background: allFromRole ? 'var(--theme-info-50)' : 'var(--theme-elevation-50)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => toggleExpand(category)}
            >
              {/* Expand/collapse icon */}
              <span
                style={{
                  marginRight: '12px',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  fontSize: '12px',
                }}
              >
                ▶
              </span>

              {/* Category checkbox - disabled if all from role */}
              <input
                type="checkbox"
                checked={isFullySelected}
                ref={(el) => {
                  if (el) el.indeterminate = isPartiallySelected && !allFromRole
                }}
                onChange={(e) => {
                  e.stopPropagation()
                  if (!allFromRole) {
                    toggleCategory(category)
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                disabled={allFromRole}
                style={{
                  marginRight: '12px',
                  width: '16px',
                  height: '16px',
                  cursor: allFromRole ? 'not-allowed' : 'pointer',
                  accentColor: allFromRole ? 'var(--theme-info-500)' : undefined,
                }}
              />

              {/* Category label */}
              <span style={{ fontWeight: 600, flex: 1 }}>
                {t(categoryLabel)}
                <span style={{ color: 'var(--theme-elevation-400)', fontWeight: 400, marginLeft: '8px' }}>
                  ({selectedInCategory}/{categoryPerms.length})
                </span>
                {isUserCollection && roleInCategory > 0 && (
                  <span style={{
                    color: 'var(--theme-info-600)',
                    fontWeight: 400,
                    marginLeft: '8px',
                    fontSize: '12px',
                  }}>
                    {allFromRole ? `✓ ${t(messages.allFromRole)}` : `${t(messages.fromRoleLabel)}: ${roleInCategory}`}
                  </span>
                )}
              </span>
            </div>

            {/* Permissions list */}
            {isExpanded && (
              <div style={{ padding: '12px 16px', background: 'var(--theme-elevation-0)' }}>
                {Object.entries(permsByResource).map(([resource, perms]) => (
                  <div key={resource} style={{ marginBottom: '12px' }}>
                    {/* Resource label */}
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--theme-elevation-600)',
                        marginBottom: '8px',
                        paddingBottom: '4px',
                        borderBottom: '1px solid var(--theme-elevation-100)',
                      }}
                    >
                      {RESOURCE_LABELS[resource] ? t(RESOURCE_LABELS[resource]) : resource.replace(/_/g, ' ')}
                    </div>

                    {/* Permission checkboxes in a row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {perms.map((perm) => {
                        const isRolePermission = isUserCollection && rolePermissionIds.has(String(perm.id))
                        const isDirectPermission = selectedIds.has(String(perm.id))
                        const isChecked = isRolePermission || isDirectPermission
                        const isDisabled = isRolePermission

                        return (
                          <label
                            key={perm.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              background: isRolePermission
                                ? 'var(--theme-info-100)'
                                : isDirectPermission
                                  ? 'var(--theme-success-100)'
                                  : 'var(--theme-elevation-50)',
                              border: `1px solid ${
                                isRolePermission
                                  ? 'var(--theme-info-300)'
                                  : isDirectPermission
                                    ? 'var(--theme-success-200)'
                                    : 'var(--theme-elevation-150)'
                              }`,
                              borderRadius: '4px',
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              transition: 'all 0.15s',
                            }}
                            title={isRolePermission ? t(messages.cannotCancelTitle) : ''}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                              disabled={isDisabled}
                              style={{
                                marginRight: '6px',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                accentColor: isRolePermission ? 'var(--theme-info-500)' : undefined,
                              }}
                            />
                            <span style={{ color: isRolePermission ? 'var(--theme-info-700)' : undefined }}>
                              {ACTION_LABELS[perm.action] ? t(ACTION_LABELS[perm.action]) : perm.action}
                            </span>
                            {isRolePermission && (
                              <span
                                style={{
                                  marginLeft: '4px',
                                  fontSize: '10px',
                                  color: 'var(--theme-info-500)',
                                }}
                              >
                                ★
                              </span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default PermissionSelector
