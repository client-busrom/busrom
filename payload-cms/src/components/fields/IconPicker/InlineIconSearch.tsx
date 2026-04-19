'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { IconSearchGrid } from './IconSearchGrid'
import { getIconSvgUrl, normalizeIconName } from './iconify-utils'

interface InlineIconSearchProps {
  value: string
  onChange: (iconName: string) => void
  disabled?: boolean
  isZh: boolean
}

/**
 * 内联图标选择器 - 用于 Lexical 编辑器组件内部
 * 包含文本输入 + "搜索图标"按钮 + 弹窗搜索
 */
export const InlineIconSearch: React.FC<InlineIconSearchProps> = ({ value, onChange, disabled, isZh }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const normalizedValue = value ? normalizeIconName(value) : ''

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {normalizedValue && (
            <div style={{ padding: '4px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #f3f4f6' }}>
              <img
                src={getIconSvgUrl(normalizedValue, '#333')}
                alt={value}
                style={{ width: '20px', height: '20px', display: 'block' }}
              />
            </div>
          )}
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            onDragStart={(e) => e.stopPropagation()}
            placeholder="lucide:arrow-right..."
            disabled={disabled}
            style={{
              flex: 1,
              padding: '6px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              backgroundColor: disabled ? '#f3f4f6' : 'white',
              cursor: disabled ? 'not-allowed' : 'text',
              minWidth: 0
            }}
          />
          {normalizedValue && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onChange(''); }}
              style={{
                all: 'unset',
                cursor: 'pointer',
                color: '#ef4444',
                fontSize: '16px',
                padding: '0 4px'
              }}
              title={isZh ? '清除' : 'Clear'}
            >
              ×
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsSearchOpen(true); }}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#A08745',
            color: 'white',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            opacity: disabled ? 0.5 : 1,
            boxShadow: '0 2px 4px rgba(160, 135, 69, 0.1)'
          }}
        >
          {isZh ? '搜索图标' : 'Search Icons'}
        </button>
      </div>

      {/* 搜索弹窗 - 使用 Portal 渲染到 body，避免被 Lexical DecoratorNode 容器限制 */}
      {isSearchOpen && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
          }}
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '680px',
              width: '92%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                {isZh ? '搜索图标（200,000+）' : 'Search Icons (200,000+)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'none',
                  fontSize: '20px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              <IconSearchGrid
                onSelect={(iconName) => {
                  onChange(iconName)
                  setIsSearchOpen(false)
                }}
                selectedIcon={normalizedValue}
                isZh={isZh}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
