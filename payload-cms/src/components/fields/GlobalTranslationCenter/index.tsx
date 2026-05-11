'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import { LocaleFlag } from '../../ui/LocaleFlag'
import './styles.scss'

// 定义可翻译字段的配置
interface TranslatableFieldConfig {
  name: string
  labelKey: string // 使用 i18n key
  type: 'text' | 'textarea' | 'richText'
  // Array field support
  isArrayField?: boolean
  arrayFieldName?: string
  arraySubField?: string
  itemLabel?: string // 自定义数组项标签，例如 "法律链接"
  condition?: (doc: any) => boolean
}

// 每个 global 的可翻译字段配置
const TRANSLATABLE_FIELDS: Record<string, TranslatableFieldConfig[]> = {
  'service-features': [
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
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
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
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
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
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
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
    { name: 'subtitle', labelKey: 'custom:translationCenter:subtitle', type: 'textarea' },
    { name: 'description', labelKey: 'custom:translationCenter:description', type: 'textarea' },
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
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
    { name: 'description', labelKey: 'custom:translationCenter:description', type: 'textarea' },
    { name: 'viewAllButtonText', labelKey: 'View All Button Text', type: 'textarea' },
  ],
  'main-form': [
    { name: 'designTextLeft', labelKey: 'Design Text - Left', type: 'textarea' },
    { name: 'designTextRight', labelKey: 'Design Text - Right', type: 'textarea' },
  ],
  'case-studies': [
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
    { name: 'description', labelKey: 'custom:translationCenter:description', type: 'textarea' },
  ],
  footer: [
    { name: 'contactInfoGroup.contactTitle', labelKey: 'custom:fields:title', type: 'textarea' },
    { name: 'contactInfoGroup.contactEmailLabel', labelKey: '__inline:邮箱标签 (Email Label)', type: 'textarea' },
    { name: 'contactInfoGroup.afterSalesLabel', labelKey: '__inline:售后标签 (After Sales Label)', type: 'textarea' },
    { name: 'contactInfoGroup.whatsappLabel', labelKey: '__inline:WhatsApp 标签', type: 'textarea' },
    { name: 'contactInfoGroup.addressLabel', labelKey: '__inline:地址标签 (Address Label)', type: 'textarea' },
    { name: 'contactInfoGroup.address', labelKey: 'custom:fields:address', type: 'textarea' },
    { name: 'contactInfoGroup.workingHoursLabel', labelKey: '__inline:工作时间标签', type: 'textarea' },
    { name: 'contactInfoGroup.workingHours', labelKey: '__inline:工作时间 (Working Hours)', type: 'textarea' },
    { name: 'officialNoticeGroup.officialNoticeTitle', labelKey: '__inline:官方声明标题 (Notice Title)', type: 'textarea' },
    { name: 'officialNoticeGroup.officialNoticeLine1', labelKey: '__inline:声明第1行 (Notice Line 1)', type: 'textarea' },
    { name: 'officialNoticeGroup.officialNoticeLine2', labelKey: '__inline:声明第2行 (Notice Line 2)', type: 'textarea' },
    { name: 'officialNoticeGroup.officialNoticeLine3', labelKey: '__inline:声明第3行 (Notice Line 3)', type: 'textarea' },
    { name: 'officialNoticeGroup.officialNoticeLine4', labelKey: '__inline:声明第4行 (Notice Line 4)', type: 'textarea' },
    { name: 'copyrightText', labelKey: 'custom:fields:copyrightText', type: 'textarea' },
    { 
      name: 'legalLinks.label', 
      labelKey: 'custom:fields:label', 
      type: 'textarea', 
      isArrayField: true, 
      arrayFieldName: 'legalLinks', 
      arraySubField: 'label',
      itemLabel: '法律链接 (Legal Link)'
    },
  ],
  'product-series-carousel': [
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
    // Note: items array fields are handled by ArrayTranslationHelper component above
  ],
  'brand-analysis': [
    { name: 'brandCenter.title', labelKey: 'Brand Center - Title', type: 'textarea' },
    { name: 'brandCenter.description', labelKey: 'Brand Center - Description', type: 'textarea' },
    { name: 'projectCenter.title', labelKey: 'Project Center - Title', type: 'textarea' },
    { name: 'projectCenter.description', labelKey: 'Project Center - Description', type: 'textarea' },
    { name: 'serviceCenter.title', labelKey: 'Service Center - Title', type: 'textarea' },
    { name: 'serviceCenter.description', labelKey: 'Service Center - Description', type: 'textarea' },
  ],
  'site-config': [
    { name: 'siteName', labelKey: 'Site Name', type: 'textarea' },
    { name: 'siteTagline', labelKey: 'Site Tagline', type: 'textarea' },
    { name: 'contactAddress', labelKey: 'Contact Address', type: 'textarea' },
    { name: 'defaultMetaTitle', labelKey: 'Default Meta Title', type: 'textarea' },
    { name: 'defaultMetaDescription', labelKey: 'Default Meta Description', type: 'textarea' },
  ],
  'sphere-3d': [
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
    { name: 'description', labelKey: 'custom:translationCenter:description', type: 'textarea' },
  ],
  'knowledge-base-settings': [
    { name: 'heroTitle', labelKey: 'custom:translationCenter:heroTagTitle', type: 'textarea' },
    { name: 'navTitle', labelKey: 'custom:translationCenter:navTagTitle', type: 'textarea' },
    { name: 'shareConfig.title', labelKey: 'custom:translationCenter:shareTitle', type: 'textarea' },
    { name: 'searchBox.placeholder', labelKey: 'custom:translationCenter:searchPlaceholder', type: 'textarea' },
    { name: 'categoryList.title', labelKey: 'custom:translationCenter:categoryListTitle', type: 'textarea' },
    { name: 'recommendedPosts.title', labelKey: 'custom:translationCenter:recommendedBlogsTitle', type: 'textarea' },
    { name: 'followUs.title', labelKey: 'custom:translationCenter:followUsTitle', type: 'textarea' },
    { name: 'bottomRecommended.title', labelKey: 'custom:translationCenter:bottomRecommendedTitle', type: 'textarea' },
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
  const { t, i18n } = useTranslation()

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
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set()) // 选中参与翻译的字段

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
      // 使用自定义 API endpoint 获取所有语言数据，支持 locale: 'all'
      const res = await fetch(`/api/custom-globals/${globalSlug}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }

      const doc = await res.json()

      // locale: 'all' 返回的格式是每个字段都是 { en: '...', zh: '...', ... }
      const newFieldsData: FieldData[] = []

      for (const config of fieldConfigs) {
        // Check condition if present
        if (config.condition && !config.condition(doc)) {
          continue
        }

        if (config.isArrayField && config.arrayFieldName && config.arraySubField) {
          // Array field: expand each array item into a separate FieldData entry
          const arrayData = doc[config.arrayFieldName] as Array<Record<string, unknown>> | undefined
          if (Array.isArray(arrayData)) {
            const itemLabel = config.itemLabel || 'Item'
            arrayData.forEach((item, index) => {
              const fieldData = item[config.arraySubField!]
              newFieldsData.push({
                config: {
                  ...config,
                  name: `${config.arrayFieldName}[${index}].${config.arraySubField}`,
                  labelKey: `__array__:${itemLabel} ${index + 1} - :${config.labelKey}`,
                },
                values: SUPPORTED_LOCALES.map(locale => ({
                  locale: locale.code as LocaleCode,
                  value: typeof fieldData === 'object' && fieldData !== null
                    ? ((fieldData as Record<string, string>)[locale.code] || '')
                    : (fieldData as string || ''),
                })),
              })
            })
          }
        } else {
          // Support nested fields like 'brandNameAnalysis.titlePart1'
          const fieldPath = config.name.split('.')
          let fieldData = doc
          for (const key of fieldPath) {
            fieldData = fieldData?.[key]
          }

          newFieldsData.push({
            config,
            values: SUPPORTED_LOCALES.map(locale => ({
              locale: locale.code as LocaleCode,
              value: typeof fieldData === 'object' && fieldData !== null
                ? (fieldData[locale.code] || '')
                : (fieldData || ''),
            })),
          })
        }
      }

      setFieldsData(newFieldsData)
      setSelectedFields(new Set(newFieldsData.map(f => f.config.name)))
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

    // 只处理选中的字段
    const fieldsToTranslate = fieldsData.filter(f => selectedFields.has(f.config.name))

    if (fieldsToTranslate.length === 0) {
      const isZh = i18n?.language === 'zh'
      setStatusMessage({ type: 'warning', key: isZh ? '__inline:请至少选择一个字段' : '__inline:Please select at least one field' })
      return
    }

    // 检查源语言内容是否为空
    const validFieldsToTranslate = fieldsToTranslate.filter(field => {
      const sourceValue = field.values.find(v => v.locale === sourceLocale)?.value
      return !!sourceValue && sourceValue.trim().length > 0
    })

    if (validFieldsToTranslate.length === 0) {
      setStatusMessage({ type: 'error', key: 'custom:translationCenter:sourceEmpty' })
      return
    }

    setIsTranslating(true)
    setStatusMessage(null)

    try {
      const { getTranslationHeaders } = await import('@/lib/translation-client')
      const personalHeaders = getTranslationHeaders()

      // 准备批量翻译的数据
      const textsToTranslate = validFieldsToTranslate.map(field => 
        field.values.find(v => v.locale === sourceLocale)?.value || ''
      )

      for (const targetLang of targetLocales) {
        // 如果不覆盖且目标语言已有内容，则跳过
        const shouldTranslate = overwriteExisting ? true : validFieldsToTranslate.some(field => {
          const existingValue = field.values.find(v => v.locale === targetLang)?.value
          return !existingValue
        })

        if (!shouldTranslate) continue

        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...personalHeaders },
          body: JSON.stringify({
            texts: textsToTranslate,
            sourceLang: sourceLocale,
            targetLang: targetLang,
            isRichText: false, // Global fields are mostly text/textarea
          }),
        })

        if (!res.ok) throw new Error(`Translation to ${targetLang} failed`)
        
        const data = await res.json()
        const translations = data.translations as string[]

        if (translations && Array.isArray(translations)) {
          // 更新本地状态
          setFieldsData(prev => prev.map(f => {
            const fieldIndex = validFieldsToTranslate.findIndex(vf => vf.config.name === f.config.name)
            if (fieldIndex !== -1 && translations[fieldIndex]) {
              return {
                ...f,
                values: f.values.map(v => 
                  v.locale === targetLang ? { ...v, value: translations[fieldIndex] } : v
                ),
              }
            }
            return f
          }))

          setModifiedLocales(prev => new Set(prev).add(targetLang))
        }
      }

      setStatusMessage({ 
        type: 'success', 
        key: 'custom:translationCenter:translateSuccess', 
        params: { 
          fields: validFieldsToTranslate.length, 
          languages: targetLocales.length 
        } 
      })
    } catch (error) {
      console.error('[GlobalTranslationCenter] Translation error:', error)
      setStatusMessage({ type: 'error', key: 'custom:translationCenter:translateFailed' })
    } finally {
      setIsTranslating(false)
    }
  }, [fieldsData, selectedFields, sourceLocale, targetLocales, overwriteExisting, t, i18n])

  // 字段选择辅助方法
  const handleToggleField = useCallback((fieldName: string) => {
    setSelectedFields(prev => {
      const next = new Set(prev)
      if (next.has(fieldName)) {
        next.delete(fieldName)
      } else {
        next.add(fieldName)
      }
      return next
    })
  }, [])

  const handleSelectAllFields = useCallback(() => {
    setSelectedFields(new Set(fieldsData.map(f => f.config.name)))
  }, [fieldsData])

  const handleDeselectAllFields = useCallback(() => {
    setSelectedFields(new Set())
  }, [])

  // 保存
  const handleSave = useCallback(async () => {
    if (!globalSlug || !fieldConfigs) return

    setIsSaving(true)
    setStatusMessage(null)

    let successCount = 0
    let failCount = 0

    try {
      // 保存所有修改过的语言，包括当前语言
      const localesToSave = Array.from(modifiedLocales)

      if (localesToSave.length === 0) {
        setStatusMessage({ type: 'warning', key: 'custom:translationCenter:noChanges' })
        setIsSaving(false)
        return
      }

      // Build per-locale data
      const localesPayload: Record<string, Record<string, any>> = {}

      // Fetch source data once for array fields
      let sourceData: any = null
      const hasArrayFields = fieldsData.some(f => f.config.name.match(/^(.+)\[(\d+)]\.(.+)$/))
      if (hasArrayFields) {
        const sourceRes = await fetch(`/api/globals/${globalSlug}?locale=${sourceLocale}&depth=0`)
        sourceData = await sourceRes.json()
      }

      for (const localeCode of localesToSave) {
        const dataToSave: Record<string, any> = {}
        const arrayFieldUpdates: Record<string, Record<number, Record<string, string>>> = {}

        for (const field of fieldsData) {
          const value = field.values.find(v => v.locale === localeCode)?.value
          if (value === undefined) continue

          const arrayMatch = field.config.name.match(/^(.+)\[(\d+)]\.(.+)$/)
          if (arrayMatch) {
            const [, arrName, idxStr, subField] = arrayMatch
            const idx = parseInt(idxStr, 10)
            if (!arrayFieldUpdates[arrName]) arrayFieldUpdates[arrName] = {}
            if (!arrayFieldUpdates[arrName][idx]) arrayFieldUpdates[arrName][idx] = {}
            arrayFieldUpdates[arrName][idx][subField] = value
          } else {
            const fieldPath = field.config.name.split('.')
            if (fieldPath.length === 1) {
              dataToSave[field.config.name] = value
            } else {
              let current = dataToSave
              for (let i = 0; i < fieldPath.length - 1; i++) {
                if (!current[fieldPath[i]]) current[fieldPath[i]] = {}
                current = current[fieldPath[i]]
              }
              current[fieldPath[fieldPath.length - 1]] = value
            }
          }
        }

        // Merge array field updates back to dataToSave using sourceData to preserve other fields
        if (sourceData) {
          for (const [arrName, indexUpdates] of Object.entries(arrayFieldUpdates)) {
            const sourceArray = (sourceData[arrName] as Array<Record<string, any>>) || []
            const mergedArray = sourceArray.map((item, idx) => {
              const updates = indexUpdates[idx]
              return updates ? { ...item, ...updates } : { ...item }
            })
            dataToSave[arrName] = mergedArray
          }
        } else {
          // If no sourceData, just use indexUpdates as is (fallback)
          Object.keys(arrayFieldUpdates).forEach(arrName => {
            dataToSave[arrName] = arrayFieldUpdates[arrName]
          })
        }

        localesPayload[localeCode] = dataToSave
      }

      const saveRes = await fetch(`/api/custom-globals/${globalSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localesData: localesPayload }),
      })

      if (saveRes.ok) {
        successCount = localesToSave.length
      } else {
        throw new Error('Bulk save failed')
      }

      setStatusMessage({ type: 'success', key: 'custom:translationCenter:saveSuccess', params: { count: successCount } })
      setModifiedLocales(new Set()) // 保存成功后清空修改追踪
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
      const isZh = i18n?.language === 'zh'
      const fields = status.params?.fields || 0
      const languages = status.params?.languages || 0
      return isZh
        ? `${icon} 已翻译 ${fields} 个字段到 ${languages} 种语言`
        : `${icon} Translated ${fields} field(s) to ${languages} language(s)`
    }
    if (status.key === 'custom:translationCenter:saveSuccess') {
      return `${icon} ${t('custom:translationCenter:saveSuccess' as any)} ${status.params?.count || 0} ${t('custom:translationCenter:languages' as any)}`
    }
    if (status.key === 'custom:translationCenter:partialSave') {
      return `${icon} ${t('custom:translationCenter:partialSave' as any)}: ${status.params?.success || 0} ✓ / ${status.params?.fail || 0} ✗`
    }

    // 内联消息（不走 i18n）
    if (status.key.startsWith('__inline:')) {
      return `${icon} ${status.key.slice('__inline:'.length)}`
    }

    return `${icon} ${messages[status.key] || status.key}`
  }, [t, i18n])

  if (!globalSlug || !fieldConfigs || fieldConfigs.length === 0) {
    return (
      <div className="gtc-trigger gtc-trigger--disabled">
        <button type="button" disabled>
          {t('custom:translationCenter:triggerButton' as any)}
        </button>
        <span className="gtc-trigger__hint">
          {t('custom:translationCenter:notAvailable' as any)}
        </span>
      </div>
    )
  }

  return (
    <>
      {/* 触发按钮 */}
      <div className="gtc-trigger">
        <button
          type="button"
          className="gtc-trigger__btn"
          onClick={handleOpenModal}
        >
          🌐 {t('custom:translationCenter:triggerButton' as any)}
        </button>
        <div className="gtc-trigger__info">
          <span className="gtc-trigger__hint">
            {fieldConfigs.length} {t('custom:translationCenter:triggerHint' as any)}
          </span>
        </div>
      </div>

      {/* 全屏弹窗 - 使用 Portal 渲染到 body */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="gtc-modal-overlay">
          <div className="gtc-modal">
            {/* Header */}
            <div className="gtc-modal__header">
              <h2>{t('custom:translationCenter:triggerButton' as any)}</h2>
              <button
                type="button"
                className="gtc-modal__close"
                onClick={() => setIsModalOpen(false)}
                title={t('custom:translationCenter:close' as any) as string}
              >
                ×
              </button>
            </div>

            {isLoading ? (
              <div className="gtc-modal__loading">{t('custom:translationCenter:loading' as any)}</div>
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
                            {l.label}
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
                            <LocaleFlag localeCode={locale.code} className="tc-target-item__flag" />
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
                  <div className="tc-fields-select-bar">
                    <label className="tc-fields-select-bar__label">
                      <input
                        type="checkbox"
                        checked={selectedFields.size === fieldsData.length}
                        ref={(el) => {
                          if (el) el.indeterminate = selectedFields.size > 0 && selectedFields.size < fieldsData.length
                        }}
                        onChange={() => {
                          if (selectedFields.size === fieldsData.length) {
                            handleDeselectAllFields()
                          } else {
                            handleSelectAllFields()
                          }
                        }}
                      />
                      {i18n?.language === 'zh'
                        ? `已选 ${selectedFields.size}/${fieldsData.length} 个字段参与翻译`
                        : `${selectedFields.size}/${fieldsData.length} field(s) selected for translation`}
                    </label>
                  </div>
                  {fieldsData.map(field => {
                    const { filled, total } = getFieldFillStatus(field)
                    const isFieldSelected = selectedFields.has(field.config.name)

                    return (
                      <div key={field.config.name} className={`tc-field ${!isFieldSelected ? 'tc-field--excluded' : ''}`}>
                        <div className="tc-field__header">
                          <label className="tc-field__select">
                            <input
                              type="checkbox"
                              checked={isFieldSelected}
                              onChange={() => handleToggleField(field.config.name)}
                            />
                          </label>
                          <span className="tc-field__name">
                            {field.config.labelKey.startsWith('__array__:')
                              ? (() => {
                                  // Format: "__array__:Item 1 - :custom:fields:label"
                                  const rest = field.config.labelKey.slice('__array__:'.length)
                                  const parts = rest.split(':')
                                  const prefix = parts[0]
                                  const key = parts.slice(1).join(':')
                                  return (
                                    <>
                                      <span style={{ opacity: 0.6, fontSize: '0.9em', marginRight: '4px' }}>{prefix}</span>
                                      {t(key as any)}
                                    </>
                                  )
                                })()
                              : field.config.labelKey.startsWith('__inline:')
                                ? field.config.labelKey.slice('__inline:'.length)
                                : t(field.config.labelKey as any)}
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
                                  <LocaleFlag localeCode={locale.code} className="tc-field__cell-flag" />
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
