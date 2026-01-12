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
  type: 'textarea' | 'textarea'
}

// 每个 global 的可翻译字段配置
const TRANSLATABLE_FIELDS: Record<string, TranslatableFieldConfig[]> = {
  'service-features': [
    { name: 'title', labelKey: 'custom:translationCenter:title', type: 'textarea' },
    { name: 'subtitle', labelKey: 'custom:translationCenter:subtitle', type: 'textarea' },
    { name: 'feature01Title', labelKey: 'Feature 01 - Title', type: 'textarea' },
    { name: 'feature01ShortTitle', labelKey: 'Feature 01 - Short Title', type: 'textarea' },
    { name: 'feature01Description', labelKey: 'Feature 01 - Description', type: 'textarea' },
    { name: 'feature02Title', labelKey: 'Feature 02 - Title', type: 'textarea' },
    { name: 'feature02ShortTitle', labelKey: 'Feature 02 - Short Title', type: 'textarea' },
    { name: 'feature02Description', labelKey: 'Feature 02 - Description', type: 'textarea' },
    { name: 'feature03Title', labelKey: 'Feature 03 - Title', type: 'textarea' },
    { name: 'feature03ShortTitle', labelKey: 'Feature 03 - Short Title', type: 'textarea' },
    { name: 'feature03Description', labelKey: 'Feature 03 - Description', type: 'textarea' },
    { name: 'feature04Title', labelKey: 'Feature 04 - Title', type: 'textarea' },
    { name: 'feature04ShortTitle', labelKey: 'Feature 04 - Short Title', type: 'textarea' },
    { name: 'feature04Description', labelKey: 'Feature 04 - Description', type: 'textarea' },
    { name: 'feature05Title', labelKey: 'Feature 05 - Title', type: 'textarea' },
    { name: 'feature05ShortTitle', labelKey: 'Feature 05 - Short Title', type: 'textarea' },
    { name: 'feature05Description', labelKey: 'Feature 05 - Description', type: 'textarea' },
  ],
  'brand-advantages': [
    { name: 'advantage01Text', labelKey: 'Advantage 01 - Text', type: 'textarea' },
    { name: 'advantage02Text', labelKey: 'Advantage 02 - Text', type: 'textarea' },
    { name: 'advantage03Text', labelKey: 'Advantage 03 - Text', type: 'textarea' },
    { name: 'advantage04Text', labelKey: 'Advantage 04 - Text', type: 'textarea' },
    { name: 'advantage05Text', labelKey: 'Advantage 05 - Text', type: 'textarea' },
    { name: 'advantage06Text', labelKey: 'Advantage 06 - Text', type: 'textarea' },
    { name: 'advantage07Text', labelKey: 'Advantage 07 - Text', type: 'textarea' },
    { name: 'advantage08Text', labelKey: 'Advantage 08 - Text', type: 'textarea' },
    { name: 'advantage09Text', labelKey: 'Advantage 09 - Text', type: 'textarea' },
  ],
  'why-choose-busrom': [
    { name: 'title', labelKey: 'custom:translationCenter:title', type: 'textarea' },
    { name: 'title2', labelKey: 'Title 2', type: 'textarea' },
    { name: 'viewMoreButtonText', labelKey: 'View More Button Text', type: 'textarea' },
    { name: 'reason01Title', labelKey: 'Reason 01 - Title', type: 'textarea' },
    { name: 'reason01Description', labelKey: 'Reason 01 - Description', type: 'textarea' },
    { name: 'reason02Title', labelKey: 'Reason 02 - Title', type: 'textarea' },
    { name: 'reason02Description', labelKey: 'Reason 02 - Description', type: 'textarea' },
    { name: 'reason03Title', labelKey: 'Reason 03 - Title', type: 'textarea' },
    { name: 'reason03Description', labelKey: 'Reason 03 - Description', type: 'textarea' },
    { name: 'reason04Title', labelKey: 'Reason 04 - Title', type: 'textarea' },
    { name: 'reason04Description', labelKey: 'Reason 04 - Description', type: 'textarea' },
    { name: 'reason05Title', labelKey: 'Reason 05 - Title', type: 'textarea' },
    { name: 'reason05Description', labelKey: 'Reason 05 - Description', type: 'textarea' },
  ],
  'quote-steps': [
    { name: 'headerTitle', labelKey: 'Header - Title', type: 'textarea' },
    { name: 'headerTitle2', labelKey: 'Header - Title 2', type: 'textarea' },
    { name: 'headerSubtitle', labelKey: 'Header - Subtitle', type: 'textarea' },
    { name: 'headerDescription', labelKey: 'Header - Description', type: 'textarea' },
    { name: 'step01Text', labelKey: 'Step 01 - Text', type: 'textarea' },
    { name: 'step02Text', labelKey: 'Step 02 - Text', type: 'textarea' },
    { name: 'step03Text', labelKey: 'Step 03 - Text', type: 'textarea' },
    { name: 'step04Text', labelKey: 'Step 04 - Text', type: 'textarea' },
    { name: 'step05Text', labelKey: 'Step 05 - Text', type: 'textarea' },
  ],
  'brand-value': [
    { name: 'title', labelKey: 'custom:translationCenter:title', type: 'textarea' },
    { name: 'subtitle', labelKey: 'custom:translationCenter:subtitle', type: 'textarea' },
    { name: 'param1Title', labelKey: 'Param 1 - Title', type: 'textarea' },
    { name: 'param1Description', labelKey: 'Param 1 - Description', type: 'textarea' },
    { name: 'param2Title', labelKey: 'Param 2 - Title', type: 'textarea' },
    { name: 'param2Description', labelKey: 'Param 2 - Description', type: 'textarea' },
    { name: 'sloganTitle', labelKey: 'Slogan - Title', type: 'textarea' },
    { name: 'sloganDescription', labelKey: 'Slogan - Description', type: 'textarea' },
    { name: 'valueTitle', labelKey: 'Value - Title', type: 'textarea' },
    { name: 'valueDescription', labelKey: 'Value - Description', type: 'textarea' },
    { name: 'visionTitle', labelKey: 'Vision - Title', type: 'textarea' },
    { name: 'visionDescription', labelKey: 'Vision - Description', type: 'textarea' },
  ],
  'simple-cta': [
    { name: 'title', labelKey: 'custom:translationCenter:title', type: 'textarea' },
    { name: 'subtitle', labelKey: 'custom:translationCenter:subtitle', type: 'textarea' },
    { name: 'ctaText', labelKey: 'custom:translationCenter:ctaText', type: 'textarea' },
  ],
  'oem-odm': [
    { name: 'oemTitle', labelKey: 'OEM - Title', type: 'textarea' },
    { name: 'oemDescription1', labelKey: 'OEM - Description Line 1', type: 'textarea' },
    { name: 'oemDescription2', labelKey: 'OEM - Description Line 2', type: 'textarea' },
    { name: 'odmTitle', labelKey: 'ODM - Title', type: 'textarea' },
    { name: 'odmDescription1', labelKey: 'ODM - Description Line 1', type: 'textarea' },
    { name: 'odmDescription2', labelKey: 'ODM - Description Line 2', type: 'textarea' },
  ],
  'featured-products': [
    { name: 'title', labelKey: 'custom:translationCenter:title', type: 'textarea' },
    { name: 'description', labelKey: 'custom:translationCenter:description', type: 'textarea' },
    { name: 'viewAllButtonText', labelKey: 'View All Button Text', type: 'textarea' },
  ],
  'main-form': [
    { name: 'designTextLeft', labelKey: 'Design Text - Left', type: 'textarea' },
    { name: 'designTextRight', labelKey: 'Design Text - Right', type: 'textarea' },
  ],
  'case-studies': [
    { name: 'title', labelKey: 'custom:translationCenter:title', type: 'textarea' },
    { name: 'description', labelKey: 'custom:translationCenter:description', type: 'textarea' },
  ],
  footer: [
    { name: 'formTitle', labelKey: 'Form Title', type: 'textarea' },
    { name: 'formPlaceholderName', labelKey: 'Name Placeholder', type: 'textarea' },
    { name: 'formPlaceholderEmail', labelKey: 'Email Placeholder', type: 'textarea' },
    { name: 'formPlaceholderMessage', labelKey: 'Message Placeholder', type: 'textarea' },
    { name: 'submitButtonText', labelKey: 'Submit Button Text', type: 'textarea' },
    { name: 'contactTitle', labelKey: 'Contact Title', type: 'textarea' },
    { name: 'contactEmailLabel', labelKey: 'Contact Email Label', type: 'textarea' },
    { name: 'afterSalesLabel', labelKey: 'After Sales Label', type: 'textarea' },
    { name: 'whatsappLabel', labelKey: 'WhatsApp Label', type: 'textarea' },
    { name: 'address', labelKey: 'Address', type: 'textarea' },
    { name: 'workingHours', labelKey: 'Working Hours', type: 'textarea' },
    { name: 'officialNoticeTitle', labelKey: 'Official Notice Title', type: 'textarea' },
    { name: 'officialNoticeLine1', labelKey: 'Official Notice - Line 1', type: 'textarea' },
    { name: 'officialNoticeLine2', labelKey: 'Official Notice - Line 2', type: 'textarea' },
    { name: 'officialNoticeLine3', labelKey: 'Official Notice - Line 3', type: 'textarea' },
    { name: 'officialNoticeLine4', labelKey: 'Official Notice - Line 4', type: 'textarea' },
    { name: 'officialNoticeContent', labelKey: 'Official Notice Content', type: 'textarea' },
    { name: 'copyrightText', labelKey: 'Copyright Text', type: 'textarea' },
  ],
  'product-series-carousel': [
    { name: 'title', labelKey: 'custom:translationCenter:title', type: 'textarea' },
    // Note: items array fields are handled by ArrayTranslationHelper component above
  ],
  'brand-analysis': [
    { name: 'brandNameAnalysis.titlePart1', labelKey: 'Brand Name - Part 1', type: 'textarea' },
    { name: 'brandNameAnalysis.titlePart2', labelKey: 'Brand Name - Part 2', type: 'textarea' },
    { name: 'brandNameAnalysis.textPart1', labelKey: 'Brand Name - Text 1', type: 'textarea' },
    { name: 'brandNameAnalysis.textPart2', labelKey: 'Brand Name - Text 2', type: 'textarea' },
    { name: 'brandCenter.title', labelKey: 'Brand Center - Title', type: 'textarea' },
    { name: 'brandCenter.description', labelKey: 'Brand Center - Description', type: 'textarea' },
    { name: 'projectCenter.title', labelKey: 'Project Center - Title', type: 'textarea' },
    { name: 'projectCenter.description', labelKey: 'Project Center - Description', type: 'textarea' },
    { name: 'serviceCenter.title', labelKey: 'Service Center - Title', type: 'textarea' },
    { name: 'serviceCenter.description', labelKey: 'Service Center - Description', type: 'textarea' },
  ],
  'email-config': [
    { name: 'emailFromName', labelKey: 'Email From Name', type: 'textarea' },
    { name: 'autoReplySubject', labelKey: 'Auto Reply Subject', type: 'textarea' },
    { name: 'autoReplyTemplate', labelKey: 'Auto Reply Template', type: 'textarea' },
  ],
  'site-config': [
    { name: 'siteName', labelKey: 'Site Name', type: 'textarea' },
    { name: 'siteTagline', labelKey: 'Site Tagline', type: 'textarea' },
    { name: 'contactAddress', labelKey: 'Contact Address', type: 'textarea' },
    { name: 'defaultMetaTitle', labelKey: 'Default Meta Title', type: 'textarea' },
    { name: 'defaultMetaDescription', labelKey: 'Default Meta Description', type: 'textarea' },
  ],
  'sphere-3d': [
    { name: 'title', labelKey: 'custom:translationCenter:title', type: 'textarea' },
    { name: 'description', labelKey: 'custom:translationCenter:description', type: 'textarea' },
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

interface GlobalTranslationCenterProps {
  path?: string
  field?: {
    name: string
    label?: string | Record<string, string>
  }
}

export const GlobalTranslationCenter: React.FC<GlobalTranslationCenterProps> = () => {
  const { globalSlug } = useDocumentInfo()
  const currentLocale = useLocale()
  const { t } = useTranslation()

  const fieldConfigs = globalSlug ? TRANSLATABLE_FIELDS[globalSlug] : []

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
    if (!globalSlug || !fieldConfigs || fieldConfigs.length === 0) return

    setIsModalOpen(true)
    setIsLoading(true)
    setStatusMessage(null)
    setModifiedLocales(new Set()) // 重置修改追踪
    try {
      // 使用 Globals API endpoint 获取所有语言数据
      const res = await fetch(`/api/globals/${globalSlug}/all-locales`)

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }

      const doc = await res.json()

      // locale: 'all' 返回的格式是每个字段都是 { en: '...', zh: '...', ... }
      const newFieldsData: FieldData[] = fieldConfigs.map(config => {
        // Support nested fields like 'brandNameAnalysis.titlePart1'
        const fieldPath = config.name.split('.')
        let fieldData = doc
        for (const key of fieldPath) {
          fieldData = fieldData?.[key]
        }

        return {
          config,
          values: SUPPORTED_LOCALES.map(locale => ({
            locale: locale.code as LocaleCode,
            value: typeof fieldData === 'object' && fieldData !== null
              ? (fieldData[locale.code] || '')
              : (fieldData || ''),
          })),
        }
      })

      setFieldsData(newFieldsData)
    } catch (error) {
      console.error('[GlobalTranslationCenter] Error:', error)
      setStatusMessage({ type: 'error', key: 'custom:translationCenter:loadFailed' })
    } finally {
      setIsLoading(false)
    }
  }, [globalSlug, fieldConfigs])

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

        // Get user's personal translation settings
        const { getTranslationHeaders } = await import('@/lib/translation-client')
        const personalHeaders = getTranslationHeaders()

        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...personalHeaders },
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
    if (!globalSlug || !fieldConfigs) return

    setIsSaving(true)
    setStatusMessage(null)

    let successCount = 0
    let failCount = 0

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

        const dataToSave: Record<string, any> = {}
        for (const field of fieldsData) {
          const value = field.values.find(v => v.locale === locale.code)?.value
          if (value !== undefined) {
            // Support nested fields like 'brandNameAnalysis.titlePart1'
            const fieldPath = field.config.name.split('.')
            if (fieldPath.length === 1) {
              // Simple field
              dataToSave[field.config.name] = value
            } else {
              // Nested field
              let current = dataToSave
              for (let i = 0; i < fieldPath.length - 1; i++) {
                if (!current[fieldPath[i]]) {
                  current[fieldPath[i]] = {}
                }
                current = current[fieldPath[i]]
              }
              current[fieldPath[fieldPath.length - 1]] = value
            }
          }
        }

        // Globals 使用 POST 更新（Payload 不支持 PATCH）
        const saveRes = await fetch(`/api/globals/${globalSlug}?locale=${locale.code}`, {
          method: 'POST',
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
      console.error('[GlobalTranslationCenter] Save error:', error)
      setStatusMessage({ type: 'error', key: 'custom:translationCenter:saveFailed' })
    } finally {
      setIsSaving(false)
    }
  }, [globalSlug, fieldConfigs, fieldsData, currentLocale.code, modifiedLocales])

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

  if (!globalSlug || !fieldConfigs || fieldConfigs.length === 0) {
    return (
      <div className="tc-trigger tc-trigger--disabled">
        <button type="button" disabled>
          {t('custom:translationCenter:triggerButton' as any)}
        </button>
        <span className="tc-trigger__hint">
          {t('custom:translationCenter:notAvailable' as any)}
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
              <h2>{t('custom:translationCenter:triggerButton' as any)}</h2>
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

export default GlobalTranslationCenter
