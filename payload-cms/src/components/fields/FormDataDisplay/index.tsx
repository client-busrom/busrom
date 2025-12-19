'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'

/**
 * FormDataDisplay Component
 *
 * Renders form submission data in a readable format instead of raw JSON
 */
export const FormDataDisplay: React.FC<{ path: string }> = () => {
  // Read from the actual 'data' field
  const { value } = useField<Record<string, any>>({ path: 'data' })

  if (!value || typeof value !== 'object') {
    return (
      <div style={{ padding: '12px', color: '#666' }}>
        No form data
      </div>
    )
  }

  // Field label mapping for better display
  const fieldLabels: Record<string, string> = {
    name: 'Name / 姓名',
    email: 'Email / 邮箱',
    phone: 'Phone / 电话',
    whatsapp: 'WhatsApp',
    company: 'Company / 公司',
    message: 'Message / 留言',
    subject: 'Subject / 主题',
    country: 'Country / 国家',
    city: 'City / 城市',
    address: 'Address / 地址',
    product: 'Product / 产品',
    quantity: 'Quantity / 数量',
    budget: 'Budget / 预算',
    timeline: 'Timeline / 时间',
    source: 'Source / 来源',
    notes: 'Notes / 备注',
  }

  const entries = Object.entries(value).filter(([_, val]) => val !== '' && val !== null && val !== undefined)

  if (entries.length === 0) {
    return (
      <div style={{ padding: '12px', color: '#666' }}>
        No form data
      </div>
    )
  }

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--theme-elevation-50)',
              borderBottom: '1px solid var(--theme-elevation-150)',
            }}
          >
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: 600,
                width: '30%',
              }}
            >
              Field / 字段
            </th>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: 600,
              }}
            >
              Value / 值
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, val], index) => (
            <tr
              key={key}
              style={{
                borderBottom:
                  index < entries.length - 1
                    ? '1px solid var(--theme-elevation-100)'
                    : 'none',
              }}
            >
              <td
                style={{
                  padding: '10px 12px',
                  fontWeight: 500,
                  color: 'var(--theme-elevation-800)',
                  verticalAlign: 'top',
                }}
              >
                {fieldLabels[key] || key}
              </td>
              <td
                style={{
                  padding: '10px 12px',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FormDataDisplay
