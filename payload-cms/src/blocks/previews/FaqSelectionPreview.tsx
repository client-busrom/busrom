
/**
 * FaqSelection Block Preview (Stable Version)
 * 使用 "Pointer Events Tunneling" 技术
 */
'use client'

import React from 'react'
import { useTranslation, useFormFields } from '@payloadcms/ui'
import { getIconSvgUrl, normalizeIconName } from '../../components/fields/IconPicker/iconify-utils'
import { HelpCircle, List, ChevronRight } from 'lucide-react'

export const FaqSelectionPreview: React.FC<any> = (props) => {
  const { path } = props
  const { i18n } = useTranslation()
  const isZh = i18n?.language === 'zh'
  
  // 获取表单数据用于预览
  const fields = useFormFields(([fields]) => fields)
  
  const getBlockData = (): any => {
    try {
      const pathStr = path || ''
      const parts = pathStr.split('.')
      let current: any = fields
      for (const part of parts) {
        if (!current) break
        const match = part.match(/(\w+)\[(\d+)\]/)
        if (match) {
          const [, key, idx] = match
          current = current?.[key]?.[parseInt(idx)]
        } else {
          current = current?.[part]
        }
      }
      return current || {}
    } catch {
      return {}
    }
  }

  const data = getBlockData()
  const hasData = data && data.categories && data.categories.length > 0

  return (
    <div style={{ padding: '4px 0' }}>
      {/* 
         核心技巧：pointerEvents: 'none'
         这使得点击会直接穿透到 Lexical 节点，从而触发 Payload 官方的侧边栏抽屉。
         这是解决“侧边栏为空”和“点击没反应”的最稳定方案。
      */}
      <div
        style={{ 
          pointerEvents: 'none',
          border: '1px solid #A08745',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'white',
          userSelect: 'none'
        }}
      >
        <div style={{ 
          padding: '20px', 
          background: !hasData ? 'var(--theme-elevation-50, #f9fafb)' : 'white',
          minHeight: !hasData ? '100px' : 'auto'
        }}>
          {!hasData ? (
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <HelpCircle size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3, color: '#A08745' }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                {isZh ? '🔍 未配置 FAQ - 点击右侧或在此处点击打开抽屉' : '🔍 FAQ Not Configured - Click to open drawer'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '16px',
                borderBottom: '1px solid #f3f4f6',
                paddingBottom: '12px'
              }}>
                <div style={{ backgroundColor: '#A08745', color: 'white', padding: '6px', borderRadius: '6px' }}>
                  <List size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>
                  {isZh ? 'FAQ 智能选择器 (实时预览)' : 'FAQ Selection (Live Preview)'}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {data.categories.map((cat: any, idx: number) => {
                  const catName = typeof cat.category?.name === 'object' 
                    ? (isZh ? cat.category.name.zh : cat.category.name.en)
                    : (cat.category?.name || (isZh ? '未命名' : 'Untitled'))

                  const normalizedIcon = cat.icon ? normalizeIconName(cat.icon) : ''

                  return (
                    <div key={idx} style={{ 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '8px', 
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        {normalizedIcon && (
                          <img src={getIconSvgUrl(normalizedIcon, '#A08745')} style={{ width: '16px', height: '16px' }} alt="icon" />
                        )}
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{catName}</div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {isZh ? `已精选 ${cat.questions?.length || 0} 个问题` : `${cat.questions?.length || 0} questions selected`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* 辅助提示文案 */}
      <div style={{ 
        marginTop: '8px', 
        fontSize: '11px', 
        color: '#A08745', 
        textAlign: 'center', 
        fontWeight: 500,
        opacity: 0.8
      }}>
        {isZh ? '💡 提示：点击上方区域即可在侧边栏编辑 FAQ 数据' : '💡 Tip: Click above to edit FAQ data in the sidebar'}
      </div>
    </div>
  )
}
