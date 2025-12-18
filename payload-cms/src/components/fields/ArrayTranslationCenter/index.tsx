'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import './styles.scss'

// 定义数组项中可翻译字段的配置
interface TranslatableFieldConfig {
  name: string
  labelKey: string
  type: 'text' | 'textarea'
}

// Array 字段的翻译配置
const ARRAY_TRANSLATABLE_FIELDS: Record<string, TranslatableFieldConfig[]> = {
  'items': [ // ProductSeriesCarousel items
    { name: 'customTitle', labelKey: 'Custom Title', type: 'text' },
    { name: 'customDescription', labelKey: 'Custom Description', type: 'textarea' },
  ],
}

interface FieldValue {
  locale: LocaleCode
  value: string
}

interface ArrayItemFieldData {
  config: TranslatableFieldConfig
  values: FieldValue[]
}

interface ArrayTranslationCenterProps {
  path?: string
  field?: {
    name: string
    label?: string | Record<string, string>
  }
}

export const ArrayTranslationCenter: React.FC<ArrayTranslationCenterProps> = ({ path, field }) => {
  const { docPermissions } = useDocumentInfo()
  const locale = useLocale()
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [arrayItems, setArrayItems] = useState<any[]>([])
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [fieldsData, setFieldsData] = useState<ArrayItemFieldData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取数组字段名称
  const arrayFieldName = field?.name || 'items'

  // 获取可翻译字段配置
  const translatableFields = ARRAY_TRANSLATABLE_FIELDS[arrayFieldName] || []

  // 从 DOM 中读取数组数据
  const loadArrayData = useCallback(() => {
    try {
      // 查找数组字段的所有 row
      const arrayRows = document.querySelectorAll(`[id^="${arrayFieldName}."]`)
      const items: any[] = []

      arrayRows.forEach((row) => {
        const rowId = row.getAttribute('id')
        if (!rowId) return

        const match = rowId.match(new RegExp(`${arrayFieldName}\\.(\\d+)`))
        if (!match) return

        const index = parseInt(match[1])
        const itemData: any = { _index: index }

        // 读取每个可翻译字段的值
        translatableFields.forEach((fieldConfig) => {
          const fieldId = `${arrayFieldName}.${index}.${fieldConfig.name}`
          const input = document.querySelector(
            `input[id="${fieldId}"], textarea[id="${fieldId}"]`,
          ) as HTMLInputElement | HTMLTextAreaElement

          if (input) {
            itemData[fieldConfig.name] = input.value || ''
          }
        })

        items.push(itemData)
      })

      setArrayItems(items)
      if (items.length > 0 && selectedItemIndex === null) {
        setSelectedItemIndex(0)
      }
    } catch (err) {
      console.error('Error loading array data:', err)
    }
  }, [arrayFieldName, translatableFields, selectedItemIndex])

  // 加载所有语言的翻译
  const loadAllLocalesData = useCallback(async () => {
    if (selectedItemIndex === null || arrayItems.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      // 获取当前 global 的 slug
      const globalSlug = window.location.pathname.split('/').filter(Boolean).pop()
      if (!globalSlug) throw new Error('Cannot determine global slug')

      // 获取所有语言的数据
      const response = await fetch(`/api/globals/${globalSlug}/all-locales`)
      if (!response.ok) throw new Error('Failed to fetch translations')

      const data = await response.json()

      // 为每个可翻译字段构建数据
      const newFieldsData: ArrayItemFieldData[] = translatableFields.map((fieldConfig) => {
        const values: FieldValue[] = SUPPORTED_LOCALES.map((localeCode) => {
          const localeData = data[localeCode]
          const arrayData = localeData?.[arrayFieldName]
          const itemData = Array.isArray(arrayData) ? arrayData[selectedItemIndex] : null
          const value = itemData?.[fieldConfig.name] || ''

          return {
            locale: localeCode,
            value: value,
          }
        })

        return {
          config: fieldConfig,
          values,
        }
      })

      setFieldsData(newFieldsData)
    } catch (err) {
      console.error('Error loading translations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load translations')
    } finally {
      setIsLoading(false)
    }
  }, [arrayFieldName, arrayItems, selectedItemIndex, translatableFields])

  // 保存翻译
  const saveTranslations = useCallback(async () => {
    if (selectedItemIndex === null) return

    setIsSaving(true)
    setError(null)

    try {
      const globalSlug = window.location.pathname.split('/').filter(Boolean).pop()
      if (!globalSlug) throw new Error('Cannot determine global slug')

      // 为每个语言保存数据
      for (const localeCode of SUPPORTED_LOCALES) {
        const updates: any = {}

        fieldsData.forEach((fieldData) => {
          const localeValue = fieldData.values.find((v) => v.locale === localeCode)
          if (localeValue) {
            updates[fieldData.config.name] = localeValue.value
          }
        })

        // 更新该语言的数组项
        const response = await fetch(`/api/globals/${globalSlug}?locale=${localeCode}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            [arrayFieldName]: arrayItems.map((item, idx) => {
              if (idx === selectedItemIndex) {
                return { ...item, ...updates }
              }
              return item
            }),
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to save ${localeCode} translation`)
        }
      }

      alert('Translations saved successfully!')
      setIsOpen(false)
    } catch (err) {
      console.error('Error saving translations:', err)
      setError(err instanceof Error ? err.message : 'Failed to save translations')
    } finally {
      setIsSaving(false)
    }
  }, [arrayFieldName, arrayItems, selectedItemIndex, fieldsData])

  // 更新字段值
  const updateFieldValue = useCallback(
    (fieldName: string, locale: LocaleCode, newValue: string) => {
      setFieldsData((prev) =>
        prev.map((fieldData) => {
          if (fieldData.config.name === fieldName) {
            return {
              ...fieldData,
              values: fieldData.values.map((v) =>
                v.locale === locale ? { ...v, value: newValue } : v,
              ),
            }
          }
          return fieldData
        }),
      )
    },
    [],
  )

  // 翻译到其他语言
  const translateToLanguages = useCallback(
    async (fieldName: string, sourceLocale: LocaleCode) => {
      const fieldData = fieldsData.find((f) => f.config.name === fieldName)
      if (!fieldData) return

      const sourceValue = fieldData.values.find((v) => v.locale === sourceLocale)?.value
      if (!sourceValue) {
        alert('Source text is empty')
        return
      }

      // TODO: 调用翻译 API
      alert('Translation API integration coming soon!\n\n将会使用第三方翻译 API 自动翻译到其他语言。')
    },
    [fieldsData],
  )

  const openModal = useCallback(() => {
    loadArrayData()
    setIsOpen(true)
  }, [loadArrayData])

  useEffect(() => {
    if (isOpen && selectedItemIndex !== null) {
      loadAllLocalesData()
    }
  }, [isOpen, selectedItemIndex, loadAllLocalesData])

  if (!docPermissions?.update) {
    return null
  }

  if (translatableFields.length === 0) {
    return null
  }

  const modalContent = isOpen ? (
    <div className="translation-center-overlay" onClick={() => setIsOpen(false)}>
      <div className="translation-center-modal" onClick={(e) => e.stopPropagation()}>
        <div className="translation-center-header">
          <h2>Array Item Translation Center</h2>
          <button className="translation-center-close" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>

        {arrayItems.length === 0 ? (
          <div className="translation-center-body">
            <p>No items found in the array. Please add items first.</p>
          </div>
        ) : (
          <>
            {/* Item Selector */}
            <div className="translation-center-item-selector">
              <label>Select Item:</label>
              <select
                value={selectedItemIndex ?? ''}
                onChange={(e) => setSelectedItemIndex(parseInt(e.target.value))}
              >
                {arrayItems.map((item, idx) => (
                  <option key={idx} value={idx}>
                    Item {idx + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="translation-center-body">
              {isLoading ? (
                <div className="translation-center-loading">Loading translations...</div>
              ) : error ? (
                <div className="translation-center-error">{error}</div>
              ) : (
                <div className="translation-center-fields">
                  {fieldsData.map((fieldData) => (
                    <div key={fieldData.config.name} className="translation-center-field-group">
                      <h3>{fieldData.config.labelKey}</h3>

                      <div className="translation-center-locales">
                        {fieldData.values.map((fieldValue) => (
                          <div key={fieldValue.locale} className="translation-center-locale-row">
                            <div className="translation-center-locale-label">
                              {fieldValue.locale.toUpperCase()}
                            </div>
                            <div className="translation-center-locale-input">
                              {fieldData.config.type === 'textarea' ? (
                                <textarea
                                  value={fieldValue.value}
                                  onChange={(e) =>
                                    updateFieldValue(
                                      fieldData.config.name,
                                      fieldValue.locale,
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={fieldValue.value}
                                  onChange={(e) =>
                                    updateFieldValue(
                                      fieldData.config.name,
                                      fieldValue.locale,
                                      e.target.value,
                                    )
                                  }
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="translation-center-actions">
                        <button
                          onClick={() => translateToLanguages(fieldData.config.name, 'en')}
                          className="translation-center-translate-btn"
                        >
                          🌐 Translate from EN
                        </button>
                        <button
                          onClick={() => translateToLanguages(fieldData.config.name, 'zh')}
                          className="translation-center-translate-btn"
                        >
                          🌐 Translate from ZH
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="translation-center-footer">
              <button onClick={() => setIsOpen(false)} disabled={isSaving}>
                Cancel
              </button>
              <button
                onClick={saveTranslations}
                className="translation-center-save-btn"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save All Translations'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  ) : null

  return (
    <>
      <div className="translation-center-trigger">
        <button
          type="button"
          className="translation-center-button"
          onClick={openModal}
          title="Open Array Translation Center"
        >
          🌐 Translate Array Items
        </button>
      </div>
      {modalContent && createPortal(modalContent, document.body)}
    </>
  )
}
