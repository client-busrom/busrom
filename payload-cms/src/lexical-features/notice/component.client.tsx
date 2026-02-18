// @ts-nocheck
/**
 * NoticeComponent - WYSIWYG Preview Component
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useTranslation } from '@payloadcms/ui'
import { Info as InfoIcon, CheckCircle as SuccessIcon, AlertTriangle as WarningIcon, XCircle as ErrorIcon } from 'lucide-react'
import type { NoticeData, NoticeType } from './node'
import { $createNoticeNode, NoticeNode } from './node'

interface NoticeComponentProps {
  nodeKey: string
  [key: string]: any
}

export const NoticeComponent: React.FC<NoticeComponentProps> = (props) => {
  const [editor] = useLexicalComposerContext()
  const [isEditing, setIsEditing] = useState(false)
  const { t, i18n } = useTranslation()

  const nodeData = (props as any).data || (props as any).node?.__data || (props as any).__data
  const nodeKey = props.nodeKey

  const [formData, setFormData] = useState<NoticeData>(
    nodeData || {
      type: 'info',
      title: '',
      content: '',
    },
  )

  const data = isEditing ? formData : nodeData || formData

  useEffect(() => {
    if (!isEditing && nodeData) {
      setFormData(nodeData)
    }
  }, [nodeData, isEditing])

  const handleSave = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node && node instanceof NoticeNode) {
        const newNode = $createNoticeNode(formData)
        node.replace(newNode)
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(nodeData || formData)
    setIsEditing(false)
  }

  const getTypeConfig = (type: NoticeType) => {
    const configs = {
      info: {
        color: '#3b82f6',
        bgColor: '#eff6ff',
        borderColor: '#3b82f6',
        icon: InfoIcon,
        iconText: 'ℹ️',
        label: i18n?.language === 'zh' ? '信息' : 'Info',
      },
      success: {
        color: '#10b981',
        bgColor: '#ecfdf5',
        borderColor: '#10b981',
        icon: SuccessIcon,
        iconText: '✓',
        label: i18n?.language === 'zh' ? '成功' : 'Success',
      },
      warning: {
        color: '#f59e0b',
        bgColor: '#fffbeb',
        borderColor: '#f59e0b',
        icon: WarningIcon,
        iconText: '⚠️',
        label: i18n?.language === 'zh' ? '警告' : 'Warning',
      },
      error: {
        color: '#ef4444',
        bgColor: '#fef2f2',
        borderColor: '#ef4444',
        icon: ErrorIcon,
        iconText: '✕',
        label: i18n?.language === 'zh' ? '错误' : 'Error',
      },
    }
    return configs[type]
  }

  const typeConfig = getTypeConfig(data.type)
  const Icon = typeConfig.icon

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '16px',
        margin: '16px 0',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon size={20} style={{ color: '#6b7280' }} />
          <strong style={{ color: '#374151', fontSize: '14px', fontWeight: 600 }}>
            {i18n?.language === 'zh' ? '提示框' : 'Notice'}
          </strong>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#A08745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                {i18n?.language === 'zh' ? '保存' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                {i18n?.language === 'zh' ? '取消' : 'Cancel'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                padding: '6px 14px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {i18n?.language === 'zh' ? '编辑' : 'Edit'}
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 提示类型 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '提示类型' : 'Notice Type'}
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as NoticeType })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="info">{getTypeConfig('info').label}</option>
              <option value="success">{getTypeConfig('success').label}</option>
              <option value="warning">{getTypeConfig('warning').label}</option>
              <option value="error">{getTypeConfig('error').label}</option>
            </select>
          </div>

          {/* 标题（可选） */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '标题（可选）' : 'Title (Optional)'}
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder={i18n?.language === 'zh' ? '输入标题' : 'Enter title'}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 内容 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '内容' : 'Content'}
              <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
            </label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder={i18n?.language === 'zh' ? '输入内容' : 'Enter content'}
              rows={4}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      ) : (
        <div style={{ padding: '8px 0' }}>
          {data.content ? (
            <div
              style={{
                position: 'relative',
                padding: '16px 16px 16px 48px',
                backgroundColor: typeConfig.bgColor,
                borderLeft: `4px solid ${typeConfig.borderColor}`,
                borderRadius: '6px',
              }}
            >
              {/* 图标 */}
              <div
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '16px',
                  fontSize: '20px',
                  lineHeight: '24px',
                }}
              >
                {typeConfig.iconText}
              </div>

              {/* 内容 */}
              <div>
                {data.title && (
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '15px',
                      color: typeConfig.color,
                      marginBottom: '8px',
                    }}
                  >
                    {data.title}
                  </div>
                )}
                <div
                  style={{
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {data.content}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#9ca3af',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '2px dashed #d1d5db',
              }}
            >
              <InfoIcon size={32} style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                {i18n?.language === 'zh' ? '未配置提示框' : 'Notice not configured'}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                {i18n?.language === 'zh' ? '请填写内容' : 'Please enter content'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
