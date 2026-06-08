'use client'

import React, { useState } from 'react'
import { useSelection, useListQuery, Button, toast, useTranslation, useConfig } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

import './index.scss'

const TRANSLATIONS: Record<string, any> = {
  en: {
    label: 'Safe Bulk Status:',
    confirm: 'Are you sure you want to change the status of the selected items to',
    success: 'Successfully updated',
    itemsTo: 'items to',
    error: 'An error occurred during bulk update',
    networkError: 'Network error or server unreachable'
  },
  zh: {
    label: '安全批量状态:',
    confirm: '确定要将选中的项目状态更改为',
    success: '成功更新了',
    itemsTo: '个项目为',
    error: '批量更新时发生错误',
    networkError: '网络错误或无法连接到服务器'
  }
}

const findStatusField = (fields: any[]): any => {
  for (const field of fields) {
    if (field.name === 'status') return field
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const found = findStatusField(tab.fields)
        if (found) return found
      }
    }
    if (field.fields) {
      const found = findStatusField(field.fields)
      if (found) return found
    }
  }
  return null
}

const getTranslation = (label: any, lang: string) => {
  if (!label) return ''
  if (typeof label === 'string') return label
  return label[lang] || label.en || label.zh || ''
}

export const SafeBulkStatus: React.FC<{ collectionSlug: string }> = ({ collectionSlug }) => {
  const { selected, selectAll, toggleAll, count, getSelectedIds } = useSelection()
  const { query } = useListQuery()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { i18n } = useTranslation()
  const { config } = useConfig()
  const lang = i18n.language?.split('-')[0] === 'zh' ? 'zh' : 'en'
  const t = TRANSLATIONS[lang]

  const hasSelection = count > 0 || selectAll === 'allAvailable'
  
  const collection = config?.collections?.find((c: any) => c.slug === collectionSlug)
  const statusField = collection ? findStatusField(collection.fields) : null
  const options = statusField?.options || []

  if (!hasSelection || options.length === 0) return null

  const handleUpdate = async (statusValue: string, statusLabel: string) => {
    if (!window.confirm(`${t.confirm} ${statusLabel}?`)) {
      return
    }

    setLoading(true)

    try {
      let payloadData: any = {
        collectionSlug,
        status: statusValue,
        selectAll: selectAll === 'allAvailable',
      }

      if (selectAll === 'allAvailable') {
        payloadData.where = query.where
        
        const excludeIds: (string|number)[] = []
        selected.forEach((isSelected, id) => {
          if (!isSelected) excludeIds.push(id)
        })
        payloadData.excludeIds = excludeIds
      } else {
        payloadData.ids = getSelectedIds()
      }

      const res = await fetch('/api/safe-bulk-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadData),
      })

      const json = await res.json()

      if (res.ok && json.success) {
        toast.success(`${t.success} ${json.successCount} ${t.itemsTo} ${statusLabel}`)
        toggleAll(false) // clear selection
        router.refresh()
      } else {
        toast.error(json.error || t.error)
      }
    } catch (err: any) {
      toast.error(t.networkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="safe-bulk-status">
      <span className="safe-bulk-label">{t.label}</span>
      {options.map((option: any) => {
        const val = typeof option === 'string' ? option : option.value
        const labelObj = typeof option === 'string' ? option : option.label
        const label = getTranslation(labelObj, lang) || val
        return (
          <Button
            key={val}
            buttonStyle="secondary"
            size="small"
            onClick={() => handleUpdate(val, label)}
            disabled={loading}
          >
            {label}
          </Button>
        )
      })}
    </div>
  )
}
