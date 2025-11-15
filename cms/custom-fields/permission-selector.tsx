/**
 * Permission Selector - Custom Field Component
 *
 * A custom field component for selecting permissions with a table-based UI.
 * Features:
 * - Grouped by resource (Product, Blog, etc.)
 * - Checkbox for each permission
 * - Bulk select by resource (all CRUD for Product)
 * - Bulk select by category
 * - Search and filter
 */

import React from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { controller as relationshipController } from '@keystone-6/core/fields/types/relationship/views'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'

// Permission categories - Aligned with Navigation.tsx grouping
const CATEGORIES = {
  auth_and_users: '身份验证 & 用户',
  navigation: '导航管理',
  home_page: '首页内容',
  media: '媒体库 (AWS S3)',
  products: '产品管理',
  content: '内容管理',
  component_blocks: '组件块管理',
  forms: '表单',
  advanced: '高级功能',
  site_config: '站点配置',
}

// Resources grouped by category - Aligned with Navigation.tsx
const RESOURCE_BY_CATEGORY = {
  auth_and_users: ['User', 'Role', 'Permission', 'ActivityLog'],
  navigation: ['NavigationMenu'],
  home_page: [
    'HeroBannerItem',
    'ProductSeriesCarousel',
    'ServiceFeaturesConfig',
    'Sphere3d',
    'SimpleCta',
    'SeriesIntro',
    'FeaturedProducts',
    'BrandAdvantages',
    'OemOdm',
    'QuoteSteps',
    'MainForm',
    'WhyChooseBusrom',
    'CaseStudies',
    'BrandAnalysis',
    'BrandValue',
    'Footer',
  ],
  media: ['Media', 'MediaCategory', 'MediaTag'],
  products: ['ProductSeries', 'Product'],
  content: ['Category', 'Blog', 'Application', 'Page', 'FaqItem'],
  component_blocks: [
    'ProductSeriesContentTranslation',
    'ProductContentTranslation',
    'ApplicationContentTranslation',
    'PageContentTranslation',
    'BlogContentTranslation',
    'DocumentTemplate',
    'ReusableBlock',
    'ReusableBlockContentTranslation',
  ],
  forms: ['FormConfig', 'FormSubmission'],
  advanced: ['CustomScript', 'SeoSetting'],
  site_config: ['SiteConfig'],
}

// Action labels
const ACTIONS = {
  create: '创建',
  read: '查看',
  update: '更新',
  delete: '删除',
  publish: '发布',
  export: '导出',
  import: '导入',
  manage_roles: '管理角色',
  manage_permissions: '管理权限',
  inject_code: '注入代码',
  view_logs: '查看日志',
}

type CategoryKey = keyof typeof CATEGORIES
type Permission = {
  id: string
  label: string
  data: {
    id: string
    identifier: string
    name: string
    resource: string
    action: string
    category: string
  }
}

interface CategorySectionProps {
  category: CategoryKey
  permissions: Permission[]
  selectedIds: Set<string>
  inheritedIds: Set<string>
  onToggle: (id: string) => void
  onBulkToggle: (ids: string[], selected: boolean) => void
}

function CategorySection({
  category,
  permissions,
  selectedIds,
  inheritedIds,
  onToggle,
  onBulkToggle,
}: CategorySectionProps) {
  const [collapsed, setCollapsed] = React.useState(false)

  // Filter permissions for this category
  const categoryPerms = permissions.filter((p) => p.data.category === category)
  if (categoryPerms.length === 0) return null

  // Group by resource
  const byResource = categoryPerms.reduce((acc, perm) => {
    const resource = perm.data.resource
    if (!acc[resource]) acc[resource] = []
    acc[resource].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  // Calculate selection stats
  const totalCount = categoryPerms.length
  const selectedCount = categoryPerms.filter((p) => selectedIds.has(p.id)).length
  const inheritedCount = categoryPerms.filter((p) => inheritedIds.has(p.id)).length
  const activeCount = selectedCount + inheritedCount
  const allSelected = selectedCount === totalCount
  const allInherited = inheritedCount === totalCount
  const allActive = activeCount === totalCount
  const someSelected = activeCount > 0 && activeCount < totalCount

  // Toggle all in category (only non-inherited)
  const toggleCategory = () => {
    // Only toggle non-inherited permissions
    const nonInheritedPerms = categoryPerms.filter((p) => !inheritedIds.has(p.id))
    const ids = nonInheritedPerms.map((p) => p.id)
    const shouldSelect = !allSelected || (allInherited && selectedCount === 0)
    onBulkToggle(ids, shouldSelect)
  }

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Category Header */}
      <div
        style={{
          background: allActive ? (allInherited ? '#fef3c7' : '#dbeafe') : '#f9fafb',
          borderBottom: collapsed ? 'none' : '1px solid #e5e7eb',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: allInherited ? 'default' : 'pointer',
          transition: 'all 0.2s',
          opacity: allInherited ? 0.9 : 1,
        }}
        onClick={() => !allInherited && setCollapsed(!collapsed)}
        onMouseEnter={(e) => {
          if (!allInherited) {
            e.currentTarget.style.background = allActive ? (allInherited ? '#fef3c7' : '#bfdbfe') : '#f3f4f6'
          }
        }}
        onMouseLeave={(e) => {
          if (!allInherited) {
            e.currentTarget.style.background = allActive ? (allInherited ? '#fef3c7' : '#dbeafe') : '#f9fafb'
          }
        }}
        title={allInherited ? '所有权限都从角色继承 (All inherited from roles)' : ''}
      >
        {/* Collapse Icon */}
        <span
          style={{
            fontSize: '16px',
            transition: 'transform 0.2s',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)',
            cursor: allInherited ? 'default' : 'pointer',
          }}
          onClick={(e) => {
            if (allInherited) e.stopPropagation()
            setCollapsed(!collapsed)
          }}
        >
          ▼
        </span>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={allActive}
          disabled={allInherited}
          ref={(el) => {
            if (el) el.indeterminate = someSelected
          }}
          onChange={(e) => {
            e.stopPropagation()
            toggleCategory()
          }}
          style={{
            width: '18px',
            height: '18px',
            cursor: allInherited ? 'not-allowed' : 'pointer',
          }}
        />

        {/* Category Name */}
        <div style={{ flex: 1 }}>
          <span style={{
            fontWeight: 600,
            fontSize: '15px',
            color: allActive ? (allInherited ? '#92400e' : '#1f2937') : '#1f2937'
          }}>
            {CATEGORIES[category]}
            {allInherited && ' 🔗'}
          </span>
          <span
            style={{
              marginLeft: '8px',
              fontSize: '13px',
              color: allActive ? (allInherited ? '#92400e' : '#1e40af') : '#6b7280',
              fontWeight: allActive ? 600 : 400,
            }}
          >
            {allInherited
              ? `(${inheritedCount} 继承)`
              : inheritedCount > 0
                ? `(${selectedCount}+${inheritedCount}/${totalCount})`
                : `(${selectedCount}/${totalCount})`
            }
          </span>
        </div>
      </div>

      {/* Resources Table */}
      {!collapsed && (
        <div style={{ padding: '8px' }}>
          {Object.entries(byResource).map(([resource, perms]) => {
            const resourceSelectedCount = perms.filter((p) => selectedIds.has(p.id)).length
            const resourceInheritedCount = perms.filter((p) => inheritedIds.has(p.id)).length
            const resourceActiveCount = resourceSelectedCount + resourceInheritedCount
            const resourceAllSelected = resourceSelectedCount === perms.length
            const resourceAllInherited = resourceInheritedCount === perms.length
            const resourceAllActive = resourceActiveCount === perms.length
            const resourceSomeSelected = resourceActiveCount > 0 && resourceActiveCount < perms.length

            return (
              <div
                key={resource}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  overflow: 'hidden',
                }}
              >
                {/* Resource Header */}
                <div
                  style={{
                    background: resourceAllActive ? (resourceAllInherited ? '#fef3c7' : '#eff6ff') : '#fafafa',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: '1px solid #e5e7eb',
                    opacity: resourceAllInherited ? 0.85 : 1,
                  }}
                  title={resourceAllInherited ? '所有权限都从角色继承 (All inherited from roles)' : ''}
                >
                  <input
                    type="checkbox"
                    checked={resourceAllActive}
                    disabled={resourceAllInherited}
                    ref={(el) => {
                      if (el) el.indeterminate = resourceSomeSelected
                    }}
                    onChange={() => {
                      // Only toggle non-inherited permissions
                      const nonInheritedPerms = perms.filter((p) => !inheritedIds.has(p.id))
                      const ids = nonInheritedPerms.map((p) => p.id)
                      const shouldSelect = !resourceAllSelected || (resourceAllInherited && resourceSelectedCount === 0)
                      onBulkToggle(ids, shouldSelect)
                    }}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: resourceAllInherited ? 'not-allowed' : 'pointer',
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '13px',
                      color: resourceAllActive ? (resourceAllInherited ? '#92400e' : '#374151') : '#374151',
                    }}
                  >
                    {resource}
                    {resourceAllInherited && ' 🔗'}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: resourceAllActive ? (resourceAllInherited ? '#92400e' : '#9ca3af') : '#9ca3af'
                  }}>
                    {resourceAllInherited
                      ? `(${resourceInheritedCount} 继承)`
                      : resourceInheritedCount > 0
                        ? `(${resourceSelectedCount}+${resourceInheritedCount}/${perms.length})`
                        : `(${resourceSelectedCount}/${perms.length})`
                    }
                  </span>
                </div>

                {/* Permissions Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '6px',
                    padding: '8px',
                  }}
                >
                  {perms.map((perm) => {
                    const isSelected = selectedIds.has(perm.id)
                    const isInherited = inheritedIds.has(perm.id)
                    const isActive = isSelected || isInherited

                    return (
                      <label
                        key={perm.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 8px',
                          background: isActive ? (isInherited ? '#fef3c7' : '#dbeafe') : '#f9fafb',
                          border: `1px solid ${isActive ? (isInherited ? '#fbbf24' : '#93c5fd') : '#e5e7eb'}`,
                          borderRadius: '4px',
                          cursor: isInherited ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.15s',
                          opacity: isInherited ? 0.8 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = '#f3f4f6'
                            e.currentTarget.style.borderColor = '#d1d5db'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = '#f9fafb'
                            e.currentTarget.style.borderColor = '#e5e7eb'
                          }
                        }}
                        title={isInherited ? '从角色继承 (Inherited from role)' : ''}
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => !isInherited && onToggle(perm.id)}
                          disabled={isInherited}
                          style={{
                            width: '14px',
                            height: '14px',
                            cursor: isInherited ? 'not-allowed' : 'pointer',
                          }}
                        />
                        <span
                          style={{
                            color: isActive ? (isInherited ? '#92400e' : '#1e40af') : '#4b5563',
                            fontWeight: isActive ? 500 : 400,
                          }}
                        >
                          {ACTIONS[perm.data.action as keyof typeof ACTIONS] || perm.data.action}
                          {isInherited && ' 🔗'}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// GraphQL query for fetching permissions
const GET_PERMISSIONS = gql`
  query GetPermissions {
    permissions(orderBy: { identifier: asc }) {
      id
      identifier
      name
      resource
      action
      category
    }
  }
`

export const Field = ({ field, value, onChange, forceValidation }: FieldProps<typeof relationshipController>) => {
  const [searchTerm, setSearchTerm] = React.useState('')

  // Debug: log props (can be removed in production)
  // console.log('🔧 Permission selector props:', { field, value, forceValidation })

  // WORKAROUND: If value is empty but we have an item ID, manually query the relationship
  // This fixes a Keystone bug where some relationship fields don't load initialValue
  const itemId = (value as any)?.id
  const hasEmptyValue = (value as any)?.kind === 'many' &&
                        Array.isArray((value as any)?.initialValue) &&
                        (value as any).initialValue.length === 0

  const shouldQueryRelationship = itemId && hasEmptyValue && field.listKey === 'User' && field.path === 'directPermissions'

  const GET_USER_PERMISSIONS = gql`
    query GetUserDirectPermissions($id: ID!) {
      user(where: { id: $id }) {
        id
        directPermissions {
          id
          name
        }
        roles(where: { isActive: { equals: true } }) {
          id
          name
          permissions {
            id
            name
          }
        }
      }
    }
  `

  const { data: userData } = useQuery(GET_USER_PERMISSIONS, {
    variables: { id: itemId },
    skip: !shouldQueryRelationship,
    fetchPolicy: 'network-only',
  })

  // If we fetched the relationship data, update the value
  const [hasInitialized, setHasInitialized] = React.useState(false)

  React.useEffect(() => {
    if (userData?.user?.directPermissions && shouldQueryRelationship && onChange && !hasInitialized) {
      const permissions = userData.user.directPermissions.map((p: any) => ({
        id: p.id,
        label: p.name,
      }))
      // console.log('🔧 Manually loaded directPermissions:', permissions)

      // Update the value to include the loaded permissions
      const updatedValue = {
        ...(value as any),
        initialValue: permissions,
        value: permissions,
      }
      onChange(updatedValue)
      setHasInitialized(true)
    }
  }, [userData, shouldQueryRelationship, onChange, hasInitialized])

  // Use Apollo Client to fetch permissions (automatically includes auth)
  // Use cache-first to avoid refetching on every render
  const { data, loading, error: queryError } = useQuery(GET_PERMISSIONS, {
    fetchPolicy: 'cache-first',
  })

  // Transform data to Permission format
  const allPermissions = React.useMemo(() => {
    if (!data?.permissions) {
      return []
    }
    return data.permissions.map((p: any) => ({
      id: p.id,
      label: p.name,
      data: p,
    }))
  }, [data])

  const error = queryError ? `无法加载权限列表: ${queryError.message}` : null

  // Get inherited permission IDs from roles (for User only)
  const inheritedPermissionIds = React.useMemo(() => {
    if (field.listKey !== 'User' || field.path !== 'directPermissions' || !userData?.user?.roles) {
      return new Set<string>()
    }

    const inherited = new Set<string>()
    for (const role of userData.user.roles) {
      if (role.permissions) {
        for (const perm of role.permissions) {
          inherited.add(perm.id)
        }
      }
    }

    // console.log('🔗 Inherited permissions from roles:', Array.from(inherited))
    return inherited
  }, [userData, field.listKey, field.path])

  // Get selected permission IDs
  const selectedIds = React.useMemo(() => {
    // Handle different value formats from Keystone relationship field
    // console.log('🔍 Permission selector value:', JSON.stringify(value, null, 2))

    // Format 1: Object with kind='many' and value array (most common for relationship fields)
    if (value && typeof value === 'object' && 'kind' in value) {
      const val = value as any

      // Many relationship format: {kind: 'many', value: [{id, label}, ...]}
      if (val.kind === 'many' && Array.isArray(val.value)) {
        return new Set(val.value.map((v: any) => v.id))
      }

      // Cards view format with initialIds
      if (val.kind === 'cards-view' && Array.isArray(val.initialIds)) {
        return new Set(val.initialIds)
      }

      // Count format - we can't show which items are selected
      if (val.kind === 'count') {
        console.warn('⚠️ Permission selector: displayMode should be "select" not "count"')
        return new Set()
      }
    }

    // Format 2: Array of {id, label} objects (fallback)
    if (Array.isArray(value)) {
      return new Set(value.map((v: any) => v.id))
    }

    // Format 3: Object with 'value' property containing the array (fallback)
    if (value && typeof value === 'object' && 'value' in value) {
      const val = (value as any).value
      if (Array.isArray(val)) {
        return new Set(val.map((v: any) => v.id))
      }
    }

    // console.log('⚠️ Permission selector: Unknown value format:', value)
    return new Set()
  }, [value])

  // Filter permissions
  const filteredPermissions = React.useMemo(() => {
    if (!searchTerm) return allPermissions
    const term = searchTerm.toLowerCase()
    return allPermissions.filter(
      (p: Permission) =>
        p.data.name.toLowerCase().includes(term) ||
        p.data.resource.toLowerCase().includes(term) ||
        p.data.action.toLowerCase().includes(term) ||
        p.data.identifier.toLowerCase().includes(term)
    )
  }, [allPermissions, searchTerm])

  // Helper to get current value array from the value object
  const getCurrentValueArray = React.useCallback(() => {
    // Handle {kind: 'many', value: [...]} format
    if (value && typeof value === 'object' && 'kind' in value) {
      const val = value as any
      if (val.kind === 'many' && Array.isArray(val.value)) {
        return val.value
      }
    }
    // Fallback to array format
    if (Array.isArray(value)) {
      return value
    }
    return []
  }, [value])

  // Helper to create new value in the same format as received
  const createNewValue = React.useCallback(
    (newArray: any[]) => {
      // Maintain the same format as received
      if (value && typeof value === 'object' && 'kind' in value) {
        const val = value as any
        if (val.kind === 'many') {
          return {
            ...val,
            value: newArray,
          }
        }
      }
      // Fallback to array format
      return newArray
    },
    [value]
  )

  // Toggle single permission
  const handleToggle = React.useCallback(
    (id: string) => {
      const currentValue = getCurrentValueArray()
      const newValue = selectedIds.has(id)
        ? currentValue.filter((v: any) => v.id !== id)
        : [...currentValue, { id }]
      onChange?.(createNewValue(newValue))
    },
    [getCurrentValueArray, createNewValue, onChange, selectedIds]
  )

  // Bulk toggle
  const handleBulkToggle = React.useCallback(
    (ids: string[], selected: boolean) => {
      const currentValue = getCurrentValueArray()
      if (selected) {
        // Add all ids
        const existingIds = new Set(currentValue.map((v: any) => v.id))
        const newIds = ids.filter((id) => !existingIds.has(id))
        const newValue = [...currentValue, ...newIds.map((id) => ({ id }))]
        onChange?.(createNewValue(newValue))
      } else {
        // Remove all ids
        const idsToRemove = new Set(ids)
        const newValue = currentValue.filter((v: any) => !idsToRemove.has(v.id))
        onChange?.(createNewValue(newValue))
      }
    },
    [getCurrentValueArray, createNewValue, onChange]
  )

  // Calculate stats
  const totalCount = allPermissions.length
  const selectedCount = getCurrentValueArray().length

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        加载权限列表中...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          background: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '8px',
          margin: '12px 0',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#991b1b', marginBottom: '12px' }}>
          无法加载权限列表
        </div>
        <div style={{ fontSize: '14px', color: '#dc2626', marginBottom: '16px' }}>
          {error}
        </div>
        <div
          style={{
            fontSize: '13px',
            color: '#7f1d1d',
            background: '#fee2e2',
            padding: '12px',
            borderRadius: '6px',
            textAlign: 'left',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <strong>解决方法:</strong>
          <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>停止当前的开发服务器 (Ctrl+C)</li>
            <li>运行 <code style={{ background: '#fecaca', padding: '2px 6px', borderRadius: '3px' }}>npm run dev:cms</code></li>
            <li>当提示 "Do you want to continue?" 时输入 <code style={{ background: '#fecaca', padding: '2px 6px', borderRadius: '3px' }}>y</code></li>
            <li>等待数据库迁移完成</li>
            <li>刷新此页面</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '12px' }}>
      {/* Header */}
      <div
        style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                权限选择器
              </span>
              <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>
                已选择 {selectedCount} / {totalCount} 个权限
              </span>
              {inheritedPermissionIds.size > 0 && (
                <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>
                  🔗 {inheritedPermissionIds.size} 个权限从角色继承 (不可修改)
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (selectedCount === totalCount) {
                onChange?.(createNewValue([]))
              } else {
                onChange?.(createNewValue(allPermissions.map((p: Permission) => ({ id: p.id }))))
              }
            }}
            style={{
              padding: '6px 12px',
              background: selectedCount === totalCount ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {selectedCount === totalCount ? '取消全选' : '全选'}
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="搜索权限 (资源名、操作、标识符...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
      </div>

      {/* Categories */}
      {(Object.keys(CATEGORIES) as CategoryKey[]).map((category) => (
        <CategorySection
          key={category}
          category={category}
          permissions={filteredPermissions}
          selectedIds={selectedIds}
          inheritedIds={inheritedPermissionIds}
          onToggle={handleToggle}
          onBulkToggle={handleBulkToggle}
        />
      ))}

      {/* Empty state */}
      {filteredPermissions.length === 0 && (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#374151' }}>
            未找到匹配的权限
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            请尝试其他搜索词
          </div>
        </div>
      )}
    </div>
  )
}

// Cell view for list (show count)
export const Cell = ({ item, field }: any) => {
  const count = item[field.path]?.length || 0
  return (
    <div style={{ fontSize: '13px', color: count > 0 ? '#10b981' : '#6b7280' }}>
      {count > 0 ? `✓ ${count} 个权限` : '无权限'}
    </div>
  )
}

// Export the default relationship controller
export const controller = relationshipController
