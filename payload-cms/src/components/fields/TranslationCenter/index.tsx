'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import './styles.scss'

// 定义可翻译字段的配置
interface TranslatableFieldConfig {
  name: string
  labelKey: string // 使用 i18n key
  type: 'text' | 'textarea'
}

// 每个 collection 的可翻译字段配置
const TRANSLATABLE_FIELDS: Record<string, TranslatableFieldConfig[]> = {
  products: [
    { name: 'name', labelKey: 'custom:fields:productName', type: 'textarea' },
    { name: 'shortDescription', labelKey: 'custom:fields:shortDescription', type: 'textarea' },
    { name: 'description', labelKey: 'custom:fields:description', type: 'textarea' },
  ],
  'product-series': [
    { name: 'name', labelKey: 'custom:fields:seriesName', type: 'textarea' },
    { name: 'description', labelKey: 'custom:fields:description', type: 'textarea' },
  ],
  pages: [
    { name: 'title', labelKey: 'custom:fields:pageTitle', type: 'textarea' },
    { name: 'heroText', labelKey: 'custom:translationCenter:heroText', type: 'textarea' },
    { name: 'heroSubtitle', labelKey: 'custom:translationCenter:heroSubtitle', type: 'textarea' },
  ],
  blogs: [
    { name: 'title', labelKey: 'custom:fields:blogTitle', type: 'textarea' },
    { name: 'excerpt', labelKey: 'custom:translationCenter:excerpt', type: 'textarea' },
  ],
  'faq-items': [
    { name: 'question', labelKey: 'custom:fields:question', type: 'textarea' },
  ],
  'reusable-blocks': [
    { name: 'title', labelKey: 'custom:translationCenter:title', type: 'textarea' },
    { name: 'subtitle', labelKey: 'custom:translationCenter:subtitle', type: 'textarea' },
  ],
  applications: [
    { name: 'name', labelKey: 'custom:fields:applicationName', type: 'textarea' },
    { name: 'shortDescription', labelKey: 'custom:fields:shortDescription', type: 'textarea' },
    { name: 'description', labelKey: 'custom:fields:description', type: 'textarea' },
  ],
  'hero-banner-items': [
    { name: 'title', labelKey: 'custom:translationCenter:title', type: 'textarea' },
    { name: 'feature1', labelKey: 'custom:translationCenter:feature1', type: 'textarea' },
    { name: 'feature2', labelKey: 'custom:translationCenter:feature2', type: 'textarea' },
    { name: 'feature3', labelKey: 'custom:translationCenter:feature3', type: 'textarea' },
    { name: 'feature4', labelKey: 'custom:translationCenter:feature4', type: 'textarea' },
    { name: 'feature5', labelKey: 'custom:translationCenter:feature5', type: 'textarea' },
    { name: 'ctaButton.text', labelKey: 'custom:translationCenter:ctaButtonText', type: 'textarea' },
  ],
  'series-intro-items': [
    { name: 'title', labelKey: 'custom:translationCenter:title', type: 'textarea' },
    { name: 'description', labelKey: 'custom:translationCenter:description', type: 'textarea' },
  ],
  'form-configs': [
    { name: 'displayName', labelKey: 'custom:fields:displayName', type: 'textarea' },
    { name: 'description', labelKey: 'custom:fields:description', type: 'textarea' },
    { name: 'submitButtonText', labelKey: 'custom:fields:submitButtonText', type: 'textarea' },
    { name: 'successMessage', labelKey: 'custom:fields:successMessage', type: 'textarea' },
  ],
  'seo-settings': [
    { name: 'metaTitle', labelKey: 'custom:fields:metaTitle', type: 'textarea' },
    { name: 'metaDescription', labelKey: 'custom:fields:metaDescription', type: 'textarea' },
    { name: 'metaKeywords', labelKey: 'custom:fields:metaKeywords', type: 'textarea' },
    { name: 'ogTitle', labelKey: 'custom:fields:ogTitle', type: 'textarea' },
    { name: 'ogDescription', labelKey: 'custom:fields:ogDescription', type: 'textarea' },
  ],
}

interface FieldValue {
  locale: LocaleCode
  value: string
}

interface FieldData {
  config: TranslatableFieldConfig
  values: FieldValue[]
}

interface TranslationCenterProps {
  path?: string
  field?: {
    name: string
    label?: string | Record<string, string>
  }
}

export const TranslationCenter: React.FC<TranslationCenterProps> = () => {
  const { id, collectionSlug } = useDocumentInfo()
  const currentLocale = useLocale()
  const { t } = useTranslation()

  const fieldConfigs = collectionSlug ? TRANSLATABLE_FIELDS[collectionSlug] : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fieldsData, setFieldsData] = useState<FieldData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sourceLocale, setSourceLocale] = useState<LocaleCode>('en')
  const [targetLocales, setTargetLocales] = useState<LocaleCode[]>([])
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warning'; key: string; params?: Record<string, string | number> } | null>(null)
  const [modifiedLocales, setModifiedLocales] = useState<Set<LocaleCode>>(new Set()) // 追踪修改过的语言

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // 防止背景滚动
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

  // 打开弹窗时加载数据
  const handleOpenModal = useCallback(async () => {
    if (!id || !collectionSlug || !fieldConfigs || fieldConfigs.length === 0) return

    setIsModalOpen(true)
    setIsLoading(true)
    setStatusMessage(null)
    setModifiedLocales(new Set()) // 重置修改追踪
    const docId = String(id)
    try {
      // 使用自定义 endpoint 一次性获取所有语言数据
      const res = await fetch(`/api/${collectionSlug}/${docId}/all-locales`)

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }

      const doc = await res.json()

      // Helper function to get nested field value using dot notation
      const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
        return path.split('.').reduce((current, key) => {
          return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined
        }, obj as unknown)
      }

      // locale: 'all' 返回的格式是每个字段都是 { en: '...', zh: '...', ... }
      const newFieldsData: FieldData[] = fieldConfigs.map(config => {
        const fieldData = getNestedValue(doc, config.name)
        return {
          config,
          values: SUPPORTED_LOCALES.map(locale => ({
            locale: locale.code as LocaleCode,
            value: typeof fieldData === 'object' && fieldData !== null
              ? ((fieldData as Record<string, string>)[locale.code] || '')
              : (fieldData as string || ''),
          })),
        }
      })

      setFieldsData(newFieldsData)
    } catch (error) {
      console.error('[TranslationCenter] Error:', error)
      setStatusMessage({ type: 'error', key: 'custom:translationCenter:loadFailed' })
    } finally {
      setIsLoading(false)
    }
  }, [id, collectionSlug, fieldConfigs])

  // 更新字段值
  const handleFieldValueChange = useCallback((fieldName: string, locale: LocaleCode, newValue: string) => {
    // 记录修改的语言
    setModifiedLocales(prev => new Set(prev).add(locale))

    setFieldsData(prev => prev.map(field => {
      if (field.config.name === fieldName) {
        return {
          ...field,
          values: field.values.map(v =>
            v.locale === locale ? { ...v, value: newValue } : v
          ),
        }
      }
      return field
    }))
  }, [])

  // 选择全部目标语言
  const handleSelectAllTargets = useCallback(() => {
    setTargetLocales(
      SUPPORTED_LOCALES
        .filter(l => l.code !== sourceLocale)
        .map(l => l.code as LocaleCode)
    )
  }, [sourceLocale])

  // 选择空的目标语言（至少一个字段为空）
  const handleSelectEmptyTargets = useCallback(() => {
    const emptyLocales: LocaleCode[] = []

    for (const locale of SUPPORTED_LOCALES) {
      if (locale.code === sourceLocale) continue

      // 检查该语言是否有任何字段为空
      const hasEmpty = fieldsData.some(field => {
        const value = field.values.find(v => v.locale === locale.code)?.value
        return !value
      })

      if (hasEmpty) {
        emptyLocales.push(locale.code as LocaleCode)
      }
    }

    setTargetLocales(emptyLocales)
  }, [sourceLocale, fieldsData])

  // 翻译
  const handleTranslate = useCallback(async () => {
    if (targetLocales.length === 0) {
      setStatusMessage({ type: 'warning', key: 'custom:translationCenter:selectTargetLanguages' })
      return
    }

    setIsTranslating(true)
    setStatusMessage(null)

    let totalTranslated = 0

    try {
      for (const field of fieldsData) {
        const sourceValue = field.values.find(v => v.locale === sourceLocale)?.value
        if (!sourceValue) continue

        // 确定要翻译的目标语言
        const localesToTranslate = targetLocales.filter(locale => {
          if (overwriteExisting) return true
          const existingValue = field.values.find(v => v.locale === locale)?.value
          return !existingValue
        })

        if (localesToTranslate.length === 0) continue

        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: sourceValue,
            sourceLang: sourceLocale,
            targetLangs: localesToTranslate,
          }),
        })
        const data = await res.json()

        // 更新本地状态
        setFieldsData(prev => prev.map(f => {
          if (f.config.name === field.config.name) {
            return {
              ...f,
              values: f.values.map(v => {
                if (localesToTranslate.includes(v.locale) && data.translations[v.locale]) {
                  return { ...v, value: data.translations[v.locale] }
                }
                return v
              }),
            }
          }
          return f
        }))

        // 记录被翻译的语言
        setModifiedLocales(prev => {
          const newSet = new Set(prev)
          localesToTranslate.forEach(locale => newSet.add(locale))
          return newSet
        })

        totalTranslated += localesToTranslate.length
      }

      setStatusMessage({ type: 'success', key: 'custom:translationCenter:translateSuccess', params: { count: totalTranslated } })
    } catch (error) {
      console.error('[TranslationCenter] Translation error:', error)
      setStatusMessage({ type: 'error', key: 'custom:translationCenter:translateFailed' })
    } finally {
      setIsTranslating(false)
    }
  }, [fieldsData, sourceLocale, targetLocales, overwriteExisting])

  // 保存
  const handleSave = useCallback(async () => {
    if (!id || !collectionSlug || !fieldConfigs) return

    setIsSaving(true)
    setStatusMessage(null)

    let successCount = 0
    let failCount = 0
    const docId = String(id)

    try {
      // 只保存修改过的语言
      const localesToSave = Array.from(modifiedLocales).filter(
        localeCode => localeCode !== currentLocale.code
      )

      if (localesToSave.length === 0) {
        setStatusMessage({ type: 'warning', key: 'custom:translationCenter:noChanges' })
        setIsSaving(false)
        return
      }

      for (const localeCode of localesToSave) {
        const locale = SUPPORTED_LOCALES.find(l => l.code === localeCode)
        if (!locale) continue

        // Helper function to set nested field value using dot notation
        const setNestedValue = (obj: Record<string, unknown>, path: string, value: string) => {
          const keys = path.split('.')
          let current = obj
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i]
            if (!current[key] || typeof current[key] !== 'object') {
              current[key] = {}
            }
            current = current[key] as Record<string, unknown>
          }
          current[keys[keys.length - 1]] = value
        }

        const dataToSave: Record<string, unknown> = {}
        for (const field of fieldsData) {
          const value = field.values.find(v => v.locale === locale.code)?.value
          if (value !== undefined) {
            setNestedValue(dataToSave, field.config.name, value)
          }
        }

        // 获取源语言数据用于填充必填字段
        const sourceRes = await fetch(
          `/api/${collectionSlug}/${docId}?locale=${sourceLocale}&depth=0`
        )
        const sourceData = await sourceRes.json()

        // 填充必填字段
        if (collectionSlug === 'products') {
          if (!dataToSave.name && sourceData.name) {
            dataToSave.name = sourceData.name
          }
          if (sourceData.slug) {
            dataToSave.slug = sourceData.slug
          }
        }

        const saveRes = await fetch(`/api/${collectionSlug}/${docId}?locale=${locale.code}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        })

        if (saveRes.ok) {
          successCount++
        } else {
          failCount++
        }
      }

      if (failCount === 0) {
        setStatusMessage({ type: 'success', key: 'custom:translationCenter:saveSuccess', params: { count: successCount } })
        setModifiedLocales(new Set()) // 保存成功后清空修改追踪
      } else {
        setStatusMessage({ type: 'warning', key: 'custom:translationCenter:partialSave', params: { success: successCount, fail: failCount } })
      }

      window.dispatchEvent(new Event('multilocale-refresh'))
    } catch (error) {
      console.error('[TranslationCenter] Save error:', error)
      setStatusMessage({ type: 'error', key: 'custom:translationCenter:saveFailed' })
    } finally {
      setIsSaving(false)
    }
  }, [id, collectionSlug, fieldConfigs, fieldsData, sourceLocale, currentLocale.code, modifiedLocales])

  // 获取字段填充状态
  const getFieldFillStatus = useCallback((field: FieldData) => {
    const filled = field.values.filter(v => v.value).length
    return { filled, total: SUPPORTED_LOCALES.length }
  }, [])

  // 格式化状态消息 - 直接使用简单的消息格式
  const getStatusMessage = useCallback((status: typeof statusMessage): string => {
    if (!status) return ''
    const icon = status.type === 'success' ? '✅' : status.type === 'error' ? '❌' : '⚠️'

    // 使用简单的消息映射，避免 t() 的参数替换问题
    const messages: Record<string, string> = {
      'custom:translationCenter:selectTargetLanguages': t('custom:translationCenter:selectTargetLanguages' as any) as string,
      'custom:translationCenter:translateFailed': t('custom:translationCenter:translateFailed' as any) as string,
      'custom:translationCenter:saveFailed': t('custom:translationCenter:saveFailed' as any) as string,
      'custom:translationCenter:loadFailed': t('custom:translationCenter:loadFailed' as any) as string,
    }

    // 对于带参数的消息，手动构建
    if (status.key === 'custom:translationCenter:translateSuccess') {
      return `${icon} ${t('custom:translationCenter:translateSuccess' as any)} ${status.params?.count || 0} ${t('custom:translationCenter:fieldLanguageCombinations' as any)}`
    }
    if (status.key === 'custom:translationCenter:saveSuccess') {
      return `${icon} ${t('custom:translationCenter:saveSuccess' as any)} ${status.params?.count || 0} ${t('custom:translationCenter:languages' as any)}`
    }
    if (status.key === 'custom:translationCenter:partialSave') {
      return `${icon} ${t('custom:translationCenter:partialSave' as any)}: ${status.params?.success || 0} ✓ / ${status.params?.fail || 0} ✗`
    }

    return `${icon} ${messages[status.key] || status.key}`
  }, [t])

  if (!collectionSlug || !fieldConfigs || fieldConfigs.length === 0 || !id) {
    return (
      <div className="tc-trigger tc-trigger--disabled">
        <button type="button" disabled>
          {t('custom:translationCenter:triggerButton' as any)}
        </button>
        <span className="tc-trigger__hint">
          {!id ? t('custom:translationCenter:saveFirst' as any) : t('custom:translationCenter:notAvailable' as any)}
        </span>
      </div>
    )
  }

  return (
    <>
      {/* 触发按钮 */}
      <div className="tc-trigger">
        <button
          type="button"
          className="tc-trigger__btn"
          onClick={handleOpenModal}
        >
          🌐 {t('custom:translationCenter:triggerButton' as any)}
        </button>
        <span className="tc-trigger__hint">
          {fieldConfigs.length} {t('custom:translationCenter:triggerHint' as any)}
        </span>
      </div>

      {/* 全屏弹窗 - 使用 Portal 渲染到 body */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="tc-modal-overlay">
          <div className="tc-modal">
            {/* Header */}
            <div className="tc-modal__header">
              <h2>{t('custom:translationCenter:title' as any)}</h2>
              <button
                type="button"
                className="tc-modal__close"
                onClick={() => setIsModalOpen(false)}
                title={t('custom:translationCenter:close' as any) as string}
              >
                ×
              </button>
            </div>

            {isLoading ? (
              <div className="tc-modal__loading">{t('custom:translationCenter:loading' as any)}</div>
            ) : (
              <>
                {/* 控制面板 */}
                <div className="tc-modal__controls">
                  <div className="tc-control-row">
                    <div className="tc-control-group">
                      <label>{t('custom:translationCenter:sourceLanguage' as any)}</label>
                      <select
                        value={sourceLocale}
                        onChange={(e) => setSourceLocale(e.target.value as LocaleCode)}
                      >
                        {SUPPORTED_LOCALES.map(l => (
                          <option key={l.code} value={l.code}>
                            {l.flag} {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="tc-control-row">
                    <label>
                      {t('custom:translationCenter:targetLanguages' as any)}
                      <span className="tc-control-actions">
                        <button type="button" onClick={handleSelectAllTargets}>
                          {t('custom:translationCenter:selectAll' as any)}
                        </button>
                        <button type="button" onClick={handleSelectEmptyTargets}>
                          {t('custom:translationCenter:selectEmpty' as any)}
                        </button>
                        <button type="button" onClick={() => setTargetLocales([])}>
                          {t('custom:translationCenter:clearSelection' as any)}
                        </button>
                      </span>
                    </label>
                    <div className="tc-targets-grid">
                      {SUPPORTED_LOCALES.filter(l => l.code !== sourceLocale).map(locale => {
                        const isSelected = targetLocales.includes(locale.code as LocaleCode)
                        const allFilled = fieldsData.every(f =>
                          f.values.find(v => v.locale === locale.code)?.value
                        )

                        return (
                          <label
                            key={locale.code}
                            className={`tc-target-item ${isSelected ? 'tc-target-item--selected' : ''} ${allFilled ? 'tc-target-item--filled' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTargetLocales([...targetLocales, locale.code as LocaleCode])
                                } else {
                                  setTargetLocales(targetLocales.filter(l => l !== locale.code))
                                }
                              }}
                            />
                            <span className="tc-target-item__flag">{locale.flag}</span>
                            <span className="tc-target-item__code">{locale.code.toUpperCase()}</span>
                            {allFilled && <span className="tc-target-item__check">✓</span>}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="tc-control-row tc-control-row--actions">
                    <label className="tc-checkbox">
                      <input
                        type="checkbox"
                        checked={overwriteExisting}
                        onChange={(e) => setOverwriteExisting(e.target.checked)}
                      />
                      {t('custom:translationCenter:overwriteExisting' as any)}
                    </label>
                    <div className="tc-action-buttons">
                      <button
                        type="button"
                        className="tc-btn tc-btn--primary"
                        onClick={handleTranslate}
                        disabled={isTranslating || isSaving || targetLocales.length === 0}
                      >
                        {isTranslating
                          ? t('custom:translationCenter:translating' as any)
                          : `${t('custom:translationCenter:translate' as any)} (${targetLocales.length})`
                        }
                      </button>
                      <button
                        type="button"
                        className="tc-btn tc-btn--secondary"
                        onClick={handleSave}
                        disabled={isTranslating || isSaving}
                      >
                        {isSaving ? t('custom:translationCenter:saving' as any) : t('custom:translationCenter:saveAll' as any)}
                      </button>
                    </div>
                  </div>

                  {statusMessage && (
                    <div className={`tc-status tc-status--${statusMessage.type}`}>
                      {getStatusMessage(statusMessage)}
                    </div>
                  )}
                </div>

                {/* 字段列表 */}
                <div className="tc-modal__fields">
                  {fieldsData.map(field => {
                    const { filled, total } = getFieldFillStatus(field)

                    return (
                      <div key={field.config.name} className="tc-field">
                        <div className="tc-field__header">
                          <span className="tc-field__name">
                            {t(field.config.labelKey as any)}
                          </span>
                          <span className={`tc-field__status ${filled === total ? 'tc-field__status--complete' : ''}`}>
                            {filled}/{total}
                          </span>
                        </div>

                        <div className="tc-field__grid">
                          {SUPPORTED_LOCALES.map(locale => {
                            const fieldValue = field.values.find(v => v.locale === locale.code)?.value || ''
                            const isEmpty = !fieldValue
                            const isSource = locale.code === sourceLocale
                            const isTarget = targetLocales.includes(locale.code as LocaleCode)

                            return (
                              <div
                                key={locale.code}
                                className={`tc-field__cell ${isEmpty ? 'tc-field__cell--empty' : ''} ${isSource ? 'tc-field__cell--source' : ''} ${isTarget ? 'tc-field__cell--target' : ''}`}
                              >
                                <div className="tc-field__cell-header">
                                  <span>{locale.flag}</span>
                                  <span className="tc-field__cell-code">{locale.code.toUpperCase()}</span>
                                  {isSource && <span className="tc-badge tc-badge--source">{t('custom:translationCenter:source' as any)}</span>}
                                </div>
                                {field.config.type === 'textarea' ? (
                                  <textarea
                                    value={fieldValue}
                                    onChange={(e) => handleFieldValueChange(field.config.name, locale.code as LocaleCode, e.target.value)}
                                    rows={2}
                                    placeholder={isEmpty ? t('custom:translationCenter:empty' as any) as string : ''}
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={fieldValue}
                                    onChange={(e) => handleFieldValueChange(field.config.name, locale.code as LocaleCode, e.target.value)}
                                    placeholder={isEmpty ? t('custom:translationCenter:empty' as any) as string : ''}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default TranslationCenter
