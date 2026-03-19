'use client'

import React from 'react'
import { useField, useTranslation } from '@payloadcms/ui'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import * as Flags from 'country-flag-icons/react/3x2'

// i18n translations
const i18n = {
  noFormData: { en: 'No form data', zh: '无表单数据' },
  field: { en: 'Field', zh: '字段' },
  value: { en: 'Value', zh: '值' },
  // Field labels
  name: { en: 'Name', zh: '姓名' },
  email: { en: 'Email', zh: '邮箱' },
  phone: { en: 'Phone', zh: '电话' },
  whatsapp: { en: 'WhatsApp', zh: 'WhatsApp' },
  company: { en: 'Company', zh: '公司' },
  message: { en: 'Message', zh: '留言' },
  subject: { en: 'Subject', zh: '主题' },
  country: { en: 'Country', zh: '国家' },
  city: { en: 'City', zh: '城市' },
  address: { en: 'Address', zh: '地址' },
  product: { en: 'Product', zh: '产品' },
  quantity: { en: 'Quantity', zh: '数量' },
  budget: { en: 'Budget', zh: '预算' },
  timeline: { en: 'Timeline', zh: '时间' },
  source: { en: 'Source', zh: '来源' },
  notes: { en: 'Notes', zh: '备注' },
}

/**
 * FormDataDisplay Component
 *
 * Renders form submission data in a readable format instead of raw JSON
 */
export const FormDataDisplay: React.FC<{ path: string }> = () => {
  // Read from the actual 'data' field
  const { value } = useField<Record<string, any>>({ path: 'data' })
  const { i18n: { language } } = useTranslation()
  const t = (obj: { en: string; zh: string }) => language === 'zh' ? obj.zh : obj.en

  if (!value || typeof value !== 'object') {
    return (
      <div style={{ padding: '12px', color: '#666' }}>
        {t(i18n.noFormData)}
      </div>
    )
  }

  // Field label mapping for better display - now uses i18n
  const getFieldLabel = (key: string): string => {
    const labelMap: Record<string, { en: string; zh: string }> = {
      name: i18n.name,
      email: i18n.email,
      phone: i18n.phone,
      whatsapp: i18n.whatsapp,
      company: i18n.company,
      message: i18n.message,
      subject: i18n.subject,
      country: i18n.country,
      city: i18n.city,
      address: i18n.address,
      product: i18n.product,
      quantity: i18n.quantity,
      budget: i18n.budget,
      timeline: i18n.timeline,
      source: i18n.source,
      notes: i18n.notes,
    }
    return labelMap[key] ? t(labelMap[key]) : key
  }

  const entries = Object.entries(value).filter(([_, val]) => val !== '' && val !== null && val !== undefined)

  if (entries.length === 0) {
    return (
      <div style={{ padding: '12px', color: '#666' }}>
        {t(i18n.noFormData)}
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
              {t(i18n.field)}
            </th>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: 600,
              }}
            >
              {t(i18n.value)}
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
                {getFieldLabel(key)}
              </td>
               <td
                style={{
                  padding: '10px 12px',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {(() => {
                  if (typeof val !== 'string') return typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)
                  
                  const keyLower = key.toLowerCase()
                  if (keyLower === 'phone' || keyLower === 'whatsapp') {
                    try {
                      const phoneNumber = parsePhoneNumberFromString(val)
                      if (phoneNumber && phoneNumber.country) {
                        const FlagComponent = (Flags as any)[phoneNumber.country]
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {FlagComponent && (
                              <div style={{ width: '20px', borderRadius: '2px', overflow: 'hidden', border: '1px solid #ddd', display: 'flex' }}>
                                <FlagComponent />
                              </div>
                            )}
                            <span style={{ fontWeight: 600 }}>+{phoneNumber.countryCallingCode}</span>
                            <span>{phoneNumber.formatInternational().split(' ').slice(1).join(' ')}</span>
                          </div>
                        )
                      }
                    } catch (e) {
                      // Fallback to raw string if parsing fails
                    }
                  }
                  
                  return String(val)
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FormDataDisplay
