'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useDocumentInfo, useAllFormFields, useTranslation } from '@payloadcms/ui'
import { SUPPORTED_LOCALES } from '../../../lib/locales'

interface SeoSettingRecord {
  id?: string
  identifier?: string
  scope?: 'global' | 'page_type' | 'exact_path' | 'path_pattern'
  pageType?: string
  exactPath?: string
  pathPattern?: string
  isMainSeo?: boolean
  metaTitle?: string
}

export const SeoConflictAnalysis: React.FC = () => {
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  
  const [others, setOthers] = useState<SeoSettingRecord[]>([])
  const [loading, setLoading] = useState(false)

  // Map fields to our record type
  const data = useMemo(() => {
    return {
      scope: fields.scope?.value as any,
      pageType: fields.pageType?.value as any,
      exactPath: fields.exactPath?.value as any,
      pathPattern: fields.pathPattern?.value as any,
    }
  }, [fields])

  const { scope, pageType, exactPath, pathPattern } = data

  useEffect(() => {
    const fetchOthers = async () => {
      setLoading(true)
      try {
        // Fetch all SEO settings to do local matching
        const res = await fetch('/api/seo-settings?limit=100&depth=0')
        const json = await res.json()
        if (json.docs) {
          // Filter out current document
          const filtered = json.docs.filter((doc: any) => doc.id !== id)
          setOthers(filtered)
        }
      } catch (err) {
        console.error('Failed to fetch related SEO settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOthers()
  }, [id])

  // Logic to determine if another record "matches" or "overlaps" with current focus
  const relevantSettings = useMemo(() => {
    return others.filter(other => {
      // 1. Same scope and same identifier (Direct Conflict)
      if (other.scope === scope) {
        if (scope === 'global') return true
        if (scope === 'page_type' && other.pageType === pageType) return true
        if (scope === 'exact_path' && other.exactPath === exactPath) return true
        if (scope === 'path_pattern' && other.pathPattern === pathPattern) return true
      }

      // 2. Overlapping scopes (Broader or narrower)
      if (scope === 'exact_path') {
        if (other.scope === 'global') return true
        // Simple pattern check: if pattern is prefix of path
        if (other.scope === 'path_pattern' && other.pathPattern && exactPath?.startsWith(other.pathPattern.replace('/*', ''))) return true
      }

      if (scope === 'page_type' && other.scope === 'global') return true

      return false
    })
  }, [others, scope, pageType, exactPath, pathPattern])

  const [isCollapsed, setIsCollapsed] = useState(false)

  if (loading) return <div style={{ padding: '10px', fontSize: '12px', color: '#999' }}>{isZh ? '分析竞争关系中...' : 'Analyzing conflicts...'}</div>

  return (
    <div className="seo-conflict-analysis" style={{
      marginTop: '20px',
      padding: '15px',
      border: '1px solid var(--theme-elevation-150)',
      borderRadius: '4px',
      background: 'var(--theme-elevation-50)',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: isCollapsed ? 0 : '12px' 
      }}>
        <h3 style={{ fontSize: '14px', margin: 0 }}>
          {isZh ? '🔍 策略分析 (冲突/关联)' : '🔍 Strategy Analysis (Conflicts)'}
        </h3>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--theme-text)',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline',
            padding: 0
          }}
        >
          {isCollapsed ? (isZh ? '展开' : 'Expand') : (isZh ? '收起' : 'Collapse')}
        </button>
      </div>
      
      {!isCollapsed && (
        <>
          {relevantSettings.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              {isZh ? '当前范围内无其他配置，本项将独占该页面的 SEO 权重。' : 'No other configurations in this scope. This item will have full SEO weight.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                {isZh ? '以下配置也涉及到当前目标，系统将自动进行“主从分发”：' : 'The following configurations also affect this target. Master-slave logic applies:'}
              </p>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                paddingRight: '5px' 
              }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {relevantSettings.map((setting, idx) => (
                    <li key={setting.id || idx} style={{
                      padding: '8px',
                      background: 'var(--theme-elevation-0)',
                      border: '1px solid var(--theme-elevation-100)',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      fontSize: '12px',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--theme-text)' }}>
                          {setting.identifier || (isZh ? `未命名` : `Untitled`) + ` (${setting.id?.slice(-4) || 'New'})`}
                        </strong>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          {setting.isMainSeo ? (
                            <span style={{ 
                              padding: '2px 6px', 
                              background: '#e6f4ea', 
                              color: '#1e8e3e', 
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}>
                              {isZh ? '主 SEO' : 'Main SEO'}
                            </span>
                          ) : (
                            <span style={{ 
                              padding: '2px 6px', 
                              background: '#f1f3f4', 
                              color: '#5f6368', 
                              borderRadius: '10px',
                              fontSize: '10px'
                            }}>
                              {isZh ? '埋藏词' : 'Secondary'}
                            </span>
                          )}
                          {setting.id && (
                            <a 
                              href={`/admin/collections/seo-settings/${setting.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '10px',
                                color: 'var(--theme-primary-500)',
                                textDecoration: 'none',
                                border: '1px solid var(--theme-primary-500)',
                                borderRadius: '4px',
                                padding: '1px 4px'
                              }}
                            >
                              {isZh ? '跳转 ↗' : 'View ↗'}
                            </a>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: '4px', color: '#888', fontSize: '11px' }}>
                        <span style={{ background: 'var(--theme-elevation-150)', padding: '1px 4px', borderRadius: '2px', marginRight: '5px' }}>
                          {setting.scope}
                        </span>
                        {setting.pageType || setting.exactPath || setting.pathPattern}
                      </div>
                      {setting.metaTitle && (
                        <div style={{ 
                          marginTop: '4px', 
                          padding: '4px',
                          background: 'var(--theme-elevation-50)',
                          borderRadius: '2px',
                          fontStyle: 'italic', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          color: '#555'
                        }}>
                          T: {setting.metaTitle}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: '12px', 
            paddingTop: '10px', 
            borderTop: '1px dashed var(--theme-elevation-200)',
            fontSize: '11px',
            color: '#999',
            lineHeight: '1.4'
          }}>
            {isZh 
              ? '💡 提示：如果多项被设为“主 SEO”，系统会优先选取匹配精度最高的一项作为页面展示标题。' 
              : '💡 Note: If multiple items are set as "Main SEO", the system prioritizes the one with the highest matching accuracy for page display.'
            }
          </div>
        </>
      )}
    </div>
  )
}

export default SeoConflictAnalysis
