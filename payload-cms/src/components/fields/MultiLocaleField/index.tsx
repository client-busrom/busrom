'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useField, useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, getLocaleLabel, type LocaleCode } from '../../../lib/locales'
import './styles.scss'

type FieldType = 'text' | 'textarea'

interface MultiLocaleFieldProps {
  path: string
  field: {
    name: string
    label?: string | Record<string, string>
    required?: boolean
    admin?: {
      description?: string | Record<string, string>
      placeholder?: string
    }
  }
  fieldType?: FieldType
}

interface LocaleValue {
  locale: LocaleCode
  value: string
  isLoading?: boolean
}

export const MultiLocaleField: React.FC<MultiLocaleFieldProps> = ({
  path,
  field,
  fieldType = 'text',
}) => {
  const { value, setValue } = useField<string>({ path })
  const currentLocale = useLocale()
  const { i18n } = useTranslation()
  const adminLang = i18n.language // Admin UI language (from account settings)
  const { id, collectionSlug, globalSlug } = useDocumentInfo()

  // 当前选中的编辑语言
  const [activeLocale, setActiveLocale] = useState<LocaleCode>(currentLocale.code as LocaleCode)

  // 所有语言的值
  const [localeValues, setLocaleValues] = useState<LocaleValue[]>(
    SUPPORTED_LOCALES.map(l => ({
      locale: l.code as LocaleCode,
      value: l.code === currentLocale.code ? (value || '') : '',
      isLoading: l.code !== currentLocale.code,
    }))
  )

  // 翻译相关状态
  const [sourceLocale, setSourceLocale] = useState<LocaleCode>('en')
  const [targetLocales, setTargetLocales] = useState<LocaleCode[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [showTranslatePanel, setShowTranslatePanel] = useState(false)
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [translateStatus, setTranslateStatus] = useState<string>('')
  const [isSavingLocale, setIsSavingLocale] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string>('')

  // Track if we've loaded data
  const hasLoadedRef = React.useRef(false)
  const lastIdRef = React.useRef<string | number | undefined>(undefined)

  // 加载所有语言的值
  const fetchAllLocales = useCallback(async () => {
    if (!id) return

    const endpoint = collectionSlug
      ? `/api/${collectionSlug}/${id}`
      : `/api/globals/${globalSlug}`

    const newValues = await Promise.all(
      SUPPORTED_LOCALES.map(async (locale) => {
        try {
          // 禁用 fallback，只获取该语言的实际值（不要用默认语言的值填充）
          const res = await fetch(`${endpoint}?locale=${locale.code}&depth=0&fallback-locale=none`)
          const data = await res.json()
          const fieldValue = path.split('.').reduce((obj, key) => obj?.[key], data) || ''
          return {
            locale: locale.code as LocaleCode,
            value: fieldValue,
            isLoading: false,
          }
        } catch {
          return {
            locale: locale.code as LocaleCode,
            value: '',
            isLoading: false,
          }
        }
      })
    )

    setLocaleValues(newValues)
  }, [id, collectionSlug, globalSlug, path])

  // 初始加载 - 只在 id 变化时加载
  useEffect(() => {
    if (!id) return

    // 如果 id 没变且已加载过，跳过
    if (hasLoadedRef.current && lastIdRef.current === id) return

    hasLoadedRef.current = true
    lastIdRef.current = id
    fetchAllLocales()
  }, [id, fetchAllLocales])

  // 监听翻译保存完成事件，重新获取数据
  useEffect(() => {
    const handleRefresh = () => {
      console.log('[MultiLocaleField] Received refresh event, refetching data...')
      fetchAllLocales()
    }

    window.addEventListener('multilocale-refresh', handleRefresh)
    return () => window.removeEventListener('multilocale-refresh', handleRefresh)
  }, [fetchAllLocales])

  // 保存单个语言的值（获取该语言现有数据，合并后保存）
  const saveLocaleWithFallback = useCallback(async (
    locale: LocaleCode,
    fieldValue: string,
    sourceLocale: LocaleCode
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('[SaveLocale] Starting save for locale:', locale, 'fieldValue:', fieldValue)
    console.log('[SaveLocale] id:', id, 'currentLocale.code:', currentLocale.code)

    if (!id) {
      console.log('[SaveLocale] Skipped: no id')
      return { success: false, error: 'No document id' }
    }

    if (locale === currentLocale.code) {
      console.log('[SaveLocale] Skipped: same as current locale (will be saved via form submit)')
      return { success: true }
    }

    const endpoint = collectionSlug
      ? `/api/${collectionSlug}/${id}?locale=${locale}`
      : `/api/globals/${globalSlug}?locale=${locale}`

    try {
      // 先获取该语言的现有数据
      const getEndpoint = collectionSlug
        ? `/api/${collectionSlug}/${id}?locale=${locale}&depth=0&fallback-locale=none`
        : `/api/globals/${globalSlug}?locale=${locale}&depth=0&fallback-locale=none`

      const existingRes = await fetch(getEndpoint)
      const existingData = await existingRes.json()

      // 获取源语言的数据（用于填充空的必填字段）
      const sourceEndpoint = collectionSlug
        ? `/api/${collectionSlug}/${id}?locale=${sourceLocale}&depth=0`
        : `/api/globals/${globalSlug}?locale=${sourceLocale}&depth=0`

      const sourceRes = await fetch(sourceEndpoint)
      const sourceData = await sourceRes.json()

      // 构建要保存的数据：当前字段 + 用源语言填充空的必填字段
      const dataToSave: Record<string, any> = {
        [field.name]: fieldValue,
      }

      console.log('[SaveLocale] existingData:', existingData)
      console.log('[SaveLocale] sourceData:', sourceData)

      // 如果是 products collection，检查并填充必填字段
      if (collectionSlug === 'products') {
        // name 是必填字段，如果为空则用源语言的值填充
        if (!existingData.name && sourceData.name) {
          dataToSave.name = sourceData.name
          console.log('[SaveLocale] Filling name with source value:', sourceData.name)
        }
        // slug 是必填字段，如果为空则用源语言的值填充
        if (!existingData.slug && sourceData.slug) {
          dataToSave.slug = sourceData.slug
          console.log('[SaveLocale] Filling slug with source value:', sourceData.slug)
        }
      }

      console.log('[SaveLocale] dataToSave:', dataToSave)

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      })

      console.log('[SaveLocale] Response status:', res.status)

      if (!res.ok) {
        const errorData = await res.json()
        console.log('[SaveLocale] Error response:', errorData)
        return {
          success: false,
          error: errorData.errors?.[0]?.message || 'Save failed'
        }
      }

      console.log('[SaveLocale] Save successful for locale:', locale)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Save failed'
      }
    }
  }, [id, collectionSlug, globalSlug, currentLocale.code, field.name])

  // 更新单个语言的值
  const handleLocaleValueChange = useCallback((locale: LocaleCode, newValue: string) => {
    // 更新本地状态
    setLocaleValues(prev =>
      prev.map(l => (l.locale === locale ? { ...l, value: newValue } : l))
    )

    // 如果是当前语言，同步到 Payload 表单状态（这样保存时才能获取到值）
    // 注意：这只是更新表单状态，不会触发自动保存
    if (locale === currentLocale.code) {
      setValue(newValue)
    }
  }, [currentLocale.code, setValue])



  // 翻译功能
  const handleTranslate = useCallback(async () => {
    const sourceValue = localeValues.find(l => l.locale === sourceLocale)?.value
    console.log('[Translate] sourceLocale:', sourceLocale, 'sourceValue:', sourceValue)
    console.log('[Translate] targetLocales:', targetLocales)

    if (!sourceValue || targetLocales.length === 0) {
      console.log('[Translate] Aborted: no source value or no target locales')
      return
    }

    setIsTranslating(true)
    setTranslateStatus('正在翻译...')

    try {
      // Get user's personal translation settings from localStorage
      const { getTranslationHeaders } = await import('@/lib/translation-client')
      const personalHeaders = getTranslationHeaders()

      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...personalHeaders },
        body: JSON.stringify({
          text: sourceValue,
          sourceLang: sourceLocale,
          targetLangs: targetLocales,
        }),
      })

      const responseData = await res.json()
      console.log('[Translate] API response:', responseData)
      const { translations } = responseData

      // 更新翻译结果到本地状态
      const translatedLocales: { locale: LocaleCode; value: string }[] = []

      // 注意：setLocaleValues 是异步的，我们需要在外部收集数据
      const currentLocaleValues = localeValues

      for (const l of currentLocaleValues) {
        if (targetLocales.includes(l.locale)) {
          const existingValue = l.value
          console.log('[Translate] Processing locale:', l.locale, 'existingValue:', existingValue, 'overwriteExisting:', overwriteExisting)

          // 如果不允许覆盖且已有内容，跳过
          if (!overwriteExisting && existingValue) {
            console.log('[Translate] Skipping locale (has existing value):', l.locale)
            continue
          }

          const translatedValue = translations[l.locale]
          console.log('[Translate] translatedValue for', l.locale, ':', translatedValue)

          if (translatedValue) {
            translatedLocales.push({ locale: l.locale, value: translatedValue })
          }
        }
      }

      console.log('[Translate] translatedLocales to save:', translatedLocales)

      // 更新本地状态
      setLocaleValues(prev =>
        prev.map(l => {
          if (targetLocales.includes(l.locale)) {
            const existingValue = l.value
            if (!overwriteExisting && existingValue) {
              return l
            }
            const translatedValue = translations[l.locale] || l.value
            return { ...l, value: translatedValue }
          }
          return l
        })
      )

      // 批量保存翻译结果
      setTranslateStatus(`正在保存 ${translatedLocales.length} 种语言...`)

      let successCount = 0
      let failCount = 0
      const errors: string[] = []

      for (const { locale, value } of translatedLocales) {
        const result = await saveLocaleWithFallback(locale, value, sourceLocale)
        if (result.success) {
          successCount++
        } else {
          failCount++
          errors.push(`${locale}: ${result.error}`)
        }
      }

      if (failCount === 0) {
        setTranslateStatus(`✅ 翻译并保存完成！成功保存 ${successCount} 种语言。`)
      } else {
        setTranslateStatus(`⚠️ 翻译完成，${successCount} 成功，${failCount} 失败。${errors.join('; ')}`)
      }

      // 触发刷新事件，让所有 MultiLocaleField 组件重新获取数据
      if (successCount > 0) {
        console.log('[Translate] Dispatching refresh event...')
        window.dispatchEvent(new Event('multilocale-refresh'))
      }

      setTimeout(() => setTranslateStatus(''), 8000)
    } catch (error) {
      console.error('Translation failed:', error)
      setTranslateStatus(`❌ 翻译失败: ${error}`)
    } finally {
      setIsTranslating(false)
    }
  }, [sourceLocale, targetLocales, localeValues, overwriteExisting, saveLocaleWithFallback])

  // 选择所有目标语言
  const handleSelectAllTargets = useCallback(() => {
    const allExceptSource = SUPPORTED_LOCALES
      .filter(l => l.code !== sourceLocale)
      .map(l => l.code as LocaleCode)
    setTargetLocales(allExceptSource)
  }, [sourceLocale])

  // 选择空的目标语言
  const handleSelectEmptyTargets = useCallback(() => {
    const emptyLocales = localeValues
      .filter(l => l.locale !== sourceLocale && !l.value)
      .map(l => l.locale)
    setTargetLocales(emptyLocales)
  }, [sourceLocale, localeValues])

  const label = typeof field.label === 'string'
    ? field.label
    : field.label?.[adminLang] || field.label?.en || field.label?.zh || field.name

  const description = typeof field.admin?.description === 'string'
    ? field.admin.description
    : field.admin?.description?.[adminLang] || field.admin?.description?.en || field.admin?.description?.zh || ''

  // 获取当前选中语言的值
  const activeLocaleData = localeValues.find(l => l.locale === activeLocale)
  const activeLocaleInfo = SUPPORTED_LOCALES.find(l => l.code === activeLocale)

  return (
    <div className="multi-locale-field">
      <div className="multi-locale-field__header">
        <label className="multi-locale-field__label">
          {label}
          {field.required && <span className="required">*</span>}
        </label>
        <button
          type="button"
          className="ml-btn ml-btn--secondary"
          onClick={() => setShowTranslatePanel(!showTranslatePanel)}
        >
          {showTranslatePanel ? 'Hide Translate' : 'Translate'}
        </button>
      </div>

      {description && (
        <p className="multi-locale-field__description">{description}</p>
      )}

      {/* 语言选择按钮 */}
      <div className="multi-locale-field__locale-tabs">
        {SUPPORTED_LOCALES.map(locale => {
          const localeData = localeValues.find(l => l.locale === locale.code)
          const hasContent = !!localeData?.value
          const isActive = activeLocale === locale.code
          const isPayloadCurrent = locale.code === currentLocale.code

          return (
            <button
              key={locale.code}
              type="button"
              className={`locale-tab ${isActive ? 'locale-tab--active' : ''} ${hasContent ? 'locale-tab--has-content' : ''} ${isPayloadCurrent ? 'locale-tab--current' : ''}`}
              onClick={() => setActiveLocale(locale.code as LocaleCode)}
              title={`${locale.label}${hasContent ? ' (has content)' : ' (empty)'}${isPayloadCurrent ? ' - Current locale' : ''}`}
            >
              <span className="locale-tab__flag">{locale.flag}</span>
              <span className="locale-tab__code">{locale.code.toUpperCase()}</span>
              {hasContent && <span className="locale-tab__indicator">●</span>}
            </button>
          )
        })}
      </div>

      {/* 翻译面板 */}
      {showTranslatePanel && (
        <div className="multi-locale-field__translate-panel">
          <div className="translate-row">
            <div className="translate-col">
              <label>Source Language</label>
              <select
                className="ml-select"
                value={sourceLocale}
                onChange={(e) => setSourceLocale(e.target.value as LocaleCode)}
              >
                {SUPPORTED_LOCALES.map(l => (
                  <option key={l.code} value={l.code}>
                    {getLocaleLabel(l.code)}
                  </option>
                ))}
              </select>
            </div>
            <div className="translate-col translate-col--targets">
              <label>
                Target Languages
                <button type="button" className="ml-btn ml-btn--text" onClick={handleSelectAllTargets}>
                  Select All
                </button>
                <button type="button" className="ml-btn ml-btn--text" onClick={handleSelectEmptyTargets}>
                  Select Empty
                </button>
              </label>
              <div className="target-locales">
                {SUPPORTED_LOCALES.filter(l => l.code !== sourceLocale).map(locale => (
                  <label key={locale.code} className="target-locale-checkbox">
                    <input
                      type="checkbox"
                      checked={targetLocales.includes(locale.code as LocaleCode)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetLocales([...targetLocales, locale.code as LocaleCode])
                        } else {
                          setTargetLocales(targetLocales.filter(l => l !== locale.code))
                        }
                      }}
                    />
                    {locale.flag} {locale.code.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="translate-actions">
            <label className="overwrite-checkbox">
              <input
                type="checkbox"
                checked={overwriteExisting}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
              />
              Overwrite existing content
            </label>
            <button
              type="button"
              className="ml-btn ml-btn--primary"
              onClick={handleTranslate}
              disabled={isTranslating || targetLocales.length === 0}
            >
              {isTranslating ? 'Translating...' : `Translate to ${targetLocales.length} languages`}
            </button>
          </div>
          {translateStatus && (
            <div className="translate-status" style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: translateStatus.startsWith('✅') ? '#d4edda' : '#f8d7da',
              color: translateStatus.startsWith('✅') ? '#155724' : '#721c24',
              borderRadius: '4px',
              fontSize: '13px',
            }}>
              {translateStatus}
            </div>
          )}
        </div>
      )}

      {/* 当前选中语言的输入框 */}
      <div className="multi-locale-field__input-wrapper">
        <div className="input-header">
          <span className="input-header__locale">
            {activeLocaleInfo?.flag} {activeLocaleInfo?.label} ({activeLocale.toUpperCase()})
          </span>
          {activeLocale === currentLocale.code && (
            <span className="input-header__badge">Current Locale</span>
          )}
        </div>
        {activeLocaleData?.isLoading ? (
          <div className="locale-input__loading">Loading...</div>
        ) : fieldType === 'textarea' ? (
          <textarea
            className="ml-textarea"
            value={activeLocaleData?.value || ''}
            onChange={(e) => handleLocaleValueChange(activeLocale, e.target.value)}
            placeholder={field.admin?.placeholder}
            rows={4}
          />
        ) : (
          <input
            type="text"
            className="ml-input"
            value={activeLocaleData?.value || ''}
            onChange={(e) => handleLocaleValueChange(activeLocale, e.target.value)}
            placeholder={field.admin?.placeholder}
          />
        )}
      </div>
    </div>
  )
}

// 导出文本字段版本
export const MultiLocaleTextField: React.FC<Omit<MultiLocaleFieldProps, 'fieldType'>> = (props) => (
  <MultiLocaleField {...props} fieldType="text" />
)

// 导出多行文本版本
export const MultiLocaleTextareaField: React.FC<Omit<MultiLocaleFieldProps, 'fieldType'>> = (props) => (
  <MultiLocaleField {...props} fieldType="textarea" />
)

export default MultiLocaleField
