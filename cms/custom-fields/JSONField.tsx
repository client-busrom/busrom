/**
 * JSON Field - User-friendly Form Data Viewer
 *
 * Displays form submission data in a beautiful, easy-to-read card layout
 */

import React from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'

// 字段名称的中英文映射
const FIELD_LABELS: Record<string, string> = {
  Name: '姓名 / Name',
  Email: '邮箱 / Email',
  PhoneNumber: '电话 / Phone',
  Whatsapp: 'WhatsApp',
  Company: '公司 / Company',
  CompanyName: '公司名称 / Company Name',
  Message: '留言 / Message',
  InquiryProduct: '咨询产品系列 / Product Series',
  Customize: '定制需求 / Custom Requirements',
  ProjectName: '项目名称 / Project Name',
  Quantity: '数量 / Quantity',
  Budget: '预算 / Budget',
  Timeline: '时间线 / Timeline',
  Industry: '行业 / Industry',
  Purpose: '目的 / Purpose',
}

// 获取友好的字段标签
const getFieldLabel = (key: string): string => {
  return FIELD_LABELS[key] || key
}

// 渲染单个字段值
const renderValue = (val: any): React.ReactNode => {
  // 数组类型 - 显示为标签组
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>—</span>
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {val.map((item, idx) => (
          <span
            key={idx}
            style={{
              padding: '6px 12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {String(item)}
          </span>
        ))}
      </div>
    )
  }

  // 对象类型 - 显示为格式化 JSON
  if (typeof val === 'object' && val !== null) {
    return (
      <pre
        style={{
          margin: 0,
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          border: '1px solid #e9ecef',
          color: '#495057',
        }}
      >
        {JSON.stringify(val, null, 2)}
      </pre>
    )
  }

  // 空值
  if (val === null || val === undefined || val === '') {
    return <span style={{ color: '#999', fontStyle: 'italic' }}>—</span>
  }

  // 长文本 (超过 100 字符) - 显示为文本框
  const strVal = String(val)
  if (strVal.length > 100) {
    return (
      <div
        style={{
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#495057',
          border: '1px solid #e9ecef',
          whiteSpace: 'pre-wrap',
        }}
      >
        {strVal}
      </div>
    )
  }

  // 普通文本
  return (
    <span style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>
      {strVal}
    </span>
  )
}

export const Field = ({ field, value }: FieldProps<typeof controller>) => {
  let parsedValue: any = null
  let parseError = false

  try {
    parsedValue = value ? (typeof value === 'string' ? JSON.parse(value) : value) : null
  } catch (error) {
    parseError = true
  }

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>

      {parseError ? (
        <div
          style={{
            marginTop: '8px',
            padding: '16px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            color: '#856404',
            fontSize: '14px',
          }}
        >
          ⚠️ 无法解析表单数据
        </div>
      ) : !parsedValue || Object.keys(parsedValue).length === 0 ? (
        <div
          style={{
            marginTop: '8px',
            padding: '24px',
            background: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
          }}
        >
          📭 暂无数据
        </div>
      ) : (
        <div style={{ marginTop: '12px' }}>
          {/* 卡片式显示 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {Object.entries(parsedValue).map(([key, val]) => (
              <div
                key={key}
                style={{
                  padding: '16px',
                  background: '#fff',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                  e.currentTarget.style.borderColor = '#dee2e6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)'
                  e.currentTarget.style.borderColor = '#e9ecef'
                }}
              >
                {/* 字段标签 */}
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6c757d',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {getFieldLabel(key)}
                </div>

                {/* 字段值 */}
                <div>{renderValue(val)}</div>
              </div>
            ))}
          </div>

          {/* 原始 JSON (折叠) */}
          <details style={{ marginTop: '20px' }}>
            <summary
              style={{
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                color: '#6c757d',
                padding: '10px 14px',
                background: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #dee2e6',
                userSelect: 'none',
              }}
            >
              🔍 查看原始 JSON 数据
            </summary>
            <pre
              style={{
                marginTop: '12px',
                padding: '16px',
                background: '#282c34',
                color: '#abb2bf',
                borderRadius: '6px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '400px',
                border: '1px solid #3e4451',
                fontFamily: "'Fira Code', 'Consolas', monospace",
              }}
            >
              {JSON.stringify(parsedValue, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </FieldContainer>
  )
}

export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value) {
    return <span style={{ color: '#999', fontSize: '13px' }}>—</span>
  }

  let parsedValue: any = null
  try {
    parsedValue = typeof value === 'string' ? JSON.parse(value) : value
  } catch (error) {
    return <span style={{ color: '#d32f2f', fontSize: '13px' }}>Invalid JSON</span>
  }

  const fieldCount = Object.keys(parsedValue).length

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      <span style={{ fontWeight: 500 }}>{fieldCount} fields</span>
    </div>
  )
}

export const controller = (config: any): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: '{}',
    deserialize: (data) => {
      const value = data[config.path]

      if (value === null || value === undefined) {
        return '{}'
      }

      if (typeof value === 'object') {
        return JSON.stringify(value)
      }

      if (typeof value === 'string') {
        return value
      }

      return '{}'
    },
    serialize: (value) => {
      let jsonValue
      if (!value) {
        jsonValue = null
      } else if (typeof value === 'string') {
        try {
          jsonValue = JSON.parse(value)
        } catch {
          jsonValue = null
        }
      } else if (typeof value === 'object') {
        jsonValue = value
      } else {
        jsonValue = null
      }
      return { [config.path]: jsonValue }
    },
    validate: (value) => {
      if (!value) return true
      try {
        JSON.parse(typeof value === 'string' ? value : JSON.stringify(value))
        return true
      } catch {
        return false
      }
    },
  }
}
