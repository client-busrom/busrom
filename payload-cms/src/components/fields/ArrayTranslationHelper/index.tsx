'use client'

import React, { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import './styles.scss'

interface LocalizedValue {
  [key: string]: string // locale -> value
}

interface FlattenedField {
  itemIndex: number
  fieldName: string
  fieldLabel: string
  values: LocalizedValue
}

const ArrayTranslationHelper: React.FC = () => {
  const { docPermissions } = useDocumentInfo()
  const [isOpen, setIsOpen] = useState(false)
  const [flattenedFields, setFlattenedFields] = useState<FlattenedField[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // 使用 useFormFields 获取 items 数组的数据
  const itemsField = useFormFields(([fields]) => fields?.items)

  // 打开翻译中心并扁平化数据
  const openTranslationCenter = useCallback(async () => {
    if (!itemsField?.value || !Array.isArray(itemsField.value)) {
      alert('No items found. Please add items first.')
      return
    }

    // 获取所有语言的完整数据
    const globalSlug = window.location.pathname.split('/').filter(Boolean).pop()
    if (!globalSlug) return

    try {
      const response = await fetch(`/api/globals/${globalSlug}/all-locales`)
      if (!response.ok) throw new Error('Failed to fetch translations')

      const allLocalesData = await response.json()

      // 扁平化所有 items 的 localized 字段
      const flattened: FlattenedField[] = []

      itemsField.value.forEach((item: any, index: number) => {
        // customTitle
        if (item.customTitle !== undefined) {
          const values: LocalizedValue = {}
          SUPPORTED_LOCALES.forEach((locale) => {
            const localeData = allLocalesData[locale]
            const localeItems = localeData?.items || []
            values[locale] = localeItems[index]?.customTitle || ''
          })

          flattened.push({
            itemIndex: index,
            fieldName: 'customTitle',
            fieldLabel: `Item ${index + 1} - Custom Title`,
            values,
          })
        }

        // customDescription
        if (item.customDescription !== undefined) {
          const values: LocalizedValue = {}
          SUPPORTED_LOCALES.forEach((locale) => {
            const localeData = allLocalesData[locale]
            const localeItems = localeData?.items || []
            values[locale] = localeItems[index]?.customDescription || ''
          })

          flattened.push({
            itemIndex: index,
            fieldName: 'customDescription',
            fieldLabel: `Item ${index + 1} - Custom Description`,
            values,
          })
        }
      })

      setFlattenedFields(flattened)
      setIsOpen(true)
    } catch (error) {
      console.error('Error loading translations:', error)
      alert('Failed to load translations')
    }
  }, [itemsField])

  // 更新字段值
  const updateFieldValue = useCallback((index: number, locale: LocaleCode, newValue: string) => {
    setFlattenedFields((prev) =>
      prev.map((field, idx) => {
        if (idx === index) {
          return {
            ...field,
            values: {
              ...field.values,
              [locale]: newValue,
            },
          }
        }
        return field
      }),
    )
  }, [])

  // 保存所有翻译
  const saveTranslations = useCallback(async () => {
    setIsSaving(true)

    try {
      const globalSlug = window.location.pathname.split('/').filter(Boolean).pop()
      if (!globalSlug) throw new Error('Cannot determine global slug')

      // 重组数据：为每个 locale 构建完整的 items 数组
      const updatesByLocale: Record<string, any[]> = {}

      SUPPORTED_LOCALES.forEach((locale) => {
        // 获取当前 locale 的原始 items 数据
        updatesByLocale[locale] = itemsField?.value.map((item: any) => ({ ...item })) || []
      })

      // 将扁平化的翻译数据填回去
      flattenedFields.forEach((field) => {
        SUPPORTED_LOCALES.forEach((locale) => {
          if (updatesByLocale[locale][field.itemIndex]) {
            updatesByLocale[locale][field.itemIndex][field.fieldName] = field.values[locale] || ''
          }
        })
      })

      // 为每个语言发送更新请求
      for (const locale of SUPPORTED_LOCALES) {
        const response = await fetch(`/api/globals/${globalSlug}?locale=${locale}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            items: updatesByLocale[locale],
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to save ${locale} translation`)
        }
      }

      alert('✅ All translations saved successfully!')
      setIsOpen(false)
      // 刷新页面以显示更新后的数据
      window.location.reload()
    } catch (error) {
      console.error('Error saving translations:', error)
      alert('❌ Failed to save translations')
    } finally {
      setIsSaving(false)
    }
  }, [flattenedFields, itemsField])

  // 翻译功能（预留接口）
  const translateField = useCallback(
    async (fieldIndex: number, sourceLocale: LocaleCode) => {
      const field = flattenedFields[fieldIndex]
      const sourceText = field.values[sourceLocale]

      if (!sourceText || sourceText.trim() === '') {
        alert('Source text is empty')
        return
      }

      alert(
        `Translation API integration coming soon!\n\n将会使用第三方翻译 API 自动翻译:\n"${sourceText}"\n\n从 ${sourceLocale.toUpperCase()} 到其他所有语言。`,
      )
    },
    [flattenedFields],
  )

  if (!docPermissions?.update) {
    return null
  }

  const modalContent = isOpen ? (
    <div className="translation-center-overlay" onClick={() => setIsOpen(false)}>
      <div className="translation-center-modal array-translation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="translation-center-header">
          <h2>🌐 Carousel Items - Batch Translation</h2>
          <button className="translation-center-close" onClick={() => setIsOpen(false)}>
            ×
          </button>
        </div>

        <div className="translation-center-body">
          {flattenedFields.length === 0 ? (
            <div className="translation-center-empty">
              <p>No translatable fields found in items.</p>
            </div>
          ) : (
            <div className="translation-center-fields">
              {flattenedFields.map((field, fieldIndex) => (
                <div key={`${field.itemIndex}-${field.fieldName}`} className="translation-center-field-group">
                  <h3>{field.fieldLabel}</h3>

                  <div className="translation-center-locales">
                    {SUPPORTED_LOCALES.map((locale) => (
                      <div key={locale} className="translation-center-locale-row">
                        <div className="translation-center-locale-label">{locale.toUpperCase()}</div>
                        <div className="translation-center-locale-input">
                          {field.fieldName.includes('Description') ? (
                            <textarea
                              value={field.values[locale] || ''}
                              onChange={(e) => updateFieldValue(fieldIndex, locale, e.target.value)}
                              rows={3}
                              placeholder={`${locale.toUpperCase()} translation...`}
                            />
                          ) : (
                            <input
                              type="text"
                              value={field.values[locale] || ''}
                              onChange={(e) => updateFieldValue(fieldIndex, locale, e.target.value)}
                              placeholder={`${locale.toUpperCase()} translation...`}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="translation-center-actions">
                    <button
                      onClick={() => translateField(fieldIndex, 'en')}
                      className="translation-center-translate-btn"
                      type="button"
                    >
                      🌐 Translate from EN
                    </button>
                    <button
                      onClick={() => translateField(fieldIndex, 'zh')}
                      className="translation-center-translate-btn"
                      type="button"
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
          <button onClick={() => setIsOpen(false)} disabled={isSaving} type="button">
            Cancel
          </button>
          <button
            onClick={saveTranslations}
            className="translation-center-save-btn"
            disabled={isSaving}
            type="button"
          >
            {isSaving ? 'Saving...' : '💾 Save All Translations'}
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <div className="array-translation-helper">
        <button
          type="button"
          className="array-translation-button"
          onClick={openTranslationCenter}
          title="Open batch translation for all carousel items"
        >
          🌐 Batch Translate All Items ({itemsField?.value?.length || 0} items)
        </button>
        <p className="array-translation-hint">
          Click to translate customTitle and customDescription for all carousel items across all languages
        </p>
      </div>
      {modalContent && createPortal(modalContent, document.body)}
    </>
  )
}

export default ArrayTranslationHelper
