'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { TextFieldClientComponent } from 'payload'
import { useField } from '@payloadcms/ui'

interface PathOption {
  label: string
  value: string
  isPattern?: boolean
}

interface PathSelectorProps {
  path: string
  field: {
    name: string
    label?: string | { en?: string; zh?: string }
  }
}

export const PathSelectorField: TextFieldClientComponent = (props) => {
  const { path, field } = props
  const { value, setValue } = useField<string>({ path })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [options, setOptions] = useState<PathOption[]>([])
  const [loading, setLoading] = useState(false)

  // 根据字段名判断模式
  const isPatternMode = field.name === 'pathPattern'

  // 从 NavigationMenus 获取路径
  useEffect(() => {
    const fetchPaths = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/navigation-menus?limit=100&where[visible][equals]=true')
        const data = await response.json()

        if (data.docs) {
          const pathOptions: PathOption[] = []
          const seenPaths = new Set<string>()

          // 添加首页
          pathOptions.push({ label: '首页 | Home', value: '/' })
          seenPaths.add('/')

          data.docs.forEach((menu: any) => {
            const link = menu.link
            if (!link || seenPaths.has(link)) return

            // 跳过外链
            if (link.startsWith('http://') || link.startsWith('https://')) return

            seenPaths.add(link)

            // 获取菜单名称（中文优先）
            const name = menu.name || menu.slug
            const label = `${name} | ${menu.slug}`

            if (isPatternMode) {
              // 路径规则模式：转换为通配符格式
              // /products -> /products/*
              pathOptions.push({
                label: `${label} (子页面)`,
                value: `${link}/*`,
                isPattern: true,
              })
            } else {
              // 精确路径模式
              pathOptions.push({ label, value: link })
            }
          })

          setOptions(pathOptions)
        }
      } catch (error) {
        console.error('Failed to fetch navigation menus:', error)
        // 降级到静态选项
        setOptions(getFallbackOptions(isPatternMode))
      } finally {
        setLoading(false)
      }
    }

    fetchPaths()
  }, [isPatternMode])

  const handleSelect = useCallback((selectedValue: string) => {
    setValue(selectedValue)
    setIsDropdownOpen(false)
  }, [setValue])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }, [setValue])

  const getLabel = () => {
    if (!field.label) return field.name
    if (typeof field.label === 'string') return field.label
    return field.label.zh || field.label.en || field.name
  }

  return (
    <div className="field-type text" style={{ marginBottom: '1.5rem' }}>
      <label className="field-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
        {getLabel()}
      </label>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={value || ''}
            onChange={handleInputChange}
            placeholder={isPatternMode ? '/products/*' : '/contact-us'}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              background: 'var(--theme-input-bg)',
              color: 'var(--theme-text)',
              fontSize: '14px',
            }}
          />
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={loading}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-text)',
              cursor: loading ? 'wait' : 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '加载中...' : isDropdownOpen ? '收起' : '选择路径'}
          </button>
        </div>

        {isDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 100,
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {options.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--theme-elevation-500)', textAlign: 'center' }}>
                {loading ? '加载中...' : '暂无可用路径'}
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--theme-elevation-100)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--theme-elevation-50)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span style={{ color: 'var(--theme-text)' }}>{option.label}</span>
                  <code
                    style={{
                      fontSize: '12px',
                      padding: '2px 6px',
                      background: 'var(--theme-elevation-100)',
                      borderRadius: '3px',
                      color: 'var(--theme-elevation-800)',
                    }}
                  >
                    {option.value}
                  </code>
                </div>
              ))
            )}

            {/* 自定义输入提示 */}
            <div
              style={{
                padding: '0.75rem 1rem',
                color: 'var(--theme-elevation-500)',
                fontSize: '12px',
                background: 'var(--theme-elevation-50)',
              }}
            >
              {isPatternMode
                ? '💡 可使用通配符: * 匹配单层, ** 匹配多层'
                : '💡 也可以直接在输入框中输入自定义路径'
              }
            </div>
          </div>
        )}
      </div>

      {/* 描述信息 */}
      <div
        style={{
          marginTop: '0.5rem',
          fontSize: '12px',
          color: 'var(--theme-elevation-500)',
        }}
      >
        {isPatternMode
          ? '路径规则支持通配符: /products/* 或 /blog/**'
          : '输入精确的 URL 路径，如 /contact-us'
        }
      </div>
    </div>
  )
}

/**
 * 降级选项（API 失败时使用）
 */
function getFallbackOptions(isPattern: boolean): PathOption[] {
  if (isPattern) {
    return [
      { label: '所有产品详情', value: '/products/*', isPattern: true },
      { label: '所有商品详情', value: '/shop/*', isPattern: true },
      { label: '所有博客文章', value: '/blog/*', isPattern: true },
      { label: '所有服务页面', value: '/service/*', isPattern: true },
    ]
  }
  return [
    { label: '首页', value: '/' },
    { label: '产品列表', value: '/products' },
    { label: '商城', value: '/shop' },
    { label: '博客', value: '/blog' },
    { label: '联系我们', value: '/contact-us' },
  ]
}

export default PathSelectorField
