'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDocumentInfo, useLocale, useTranslation, useAllFormFields } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import { LocaleFlag } from '../../ui/LocaleFlag'
import './styles.scss'

// 定义可翻译字段的配置
interface TranslatableFieldConfig {
  name: string
  labelKey: string // 使用 i18n key
  type: 'text' | 'textarea' | 'richText'
  // Array field support: field lives inside an array
  isArrayField?: boolean
  arrayFieldName?: string // e.g. 'sceneGallery'
  arraySubField?: string // e.g. 'sceneName'
  condition?: (doc: any) => boolean
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
  'series-templates': [
    { name: 'name', labelKey: 'custom:fields:name', type: 'textarea' },
  ],
  'product-templates': [
    { name: 'name', labelKey: 'custom:fields:name', type: 'textarea' },
  ],
  'product-reusable-blocks': [
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
  ],
  'series-reusable-blocks': [
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
  ],
  pages: [
    { name: 'title', labelKey: 'custom:fields:pageTitle', type: 'textarea' },
    { name: 'waterfallTitle', labelKey: 'custom:translationCenter:waterfallTitle', type: 'textarea' },
    { name: 'waterfallSubtitle', labelKey: 'custom:translationCenter:waterfallSubtitle', type: 'textarea' },
  ],
    blogs: [
      { name: 'title', labelKey: 'custom:fields:blogTitle', type: 'textarea' },
      { name: 'excerpt', labelKey: 'custom:translationCenter:excerpt', type: 'textarea' },
      { 
        name: 'kb_toc_title', 
        labelKey: '__inline:目录标题 (TOC Title)', 
        type: 'textarea',
        condition: (doc: any) => doc?.useCustomOverrides === true
      },
      { 
        name: 'kb_share_title', 
        labelKey: '__inline:分享标题 (Share Title)', 
        type: 'textarea',
        condition: (doc: any) => doc?.useCustomOverrides === true
      },
      { 
        name: 'kb_search_box_placeholder', 
        labelKey: '__inline:搜索框占位符 (Search Placeholder)', 
        type: 'textarea',
        condition: (doc: any) => doc?.useCustomOverrides === true
      },
      { 
        name: 'kb_category_list_title', 
        labelKey: '__inline:分类列表标题 (Category List Title)', 
        type: 'textarea',
        condition: (doc: any) => doc?.useCustomOverrides === true
      },
      { 
        name: 'kb_recommended_posts_title', 
        labelKey: '__inline:侧边推荐标题 (Sidebar Recommended Title)', 
        type: 'textarea',
        condition: (doc: any) => doc?.useCustomOverrides === true
      },
      { 
        name: 'kb_follow_us_title', 
        labelKey: '__inline:关注我们标题 (Follow Us Title)', 
        type: 'textarea',
        condition: (doc: any) => doc?.useCustomOverrides === true
      },
      { 
        name: 'kb_bottom_recommended_title', 
        labelKey: '__inline:底部推荐标题 (Bottom Recommended Title)', 
        type: 'textarea',
        condition: (doc: any) => doc?.useCustomOverrides === true
      },
    ],
  'faq-items': [
    { name: 'question', labelKey: 'custom:fields:question', type: 'textarea' },
  ],
  'reusable-blocks': [
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
    { name: 'subtitle', labelKey: 'custom:translationCenter:subtitle', type: 'textarea' },
  ],
  applications: [
    { name: 'name', labelKey: 'custom:fields:applicationName', type: 'textarea' },
    { name: 'shortDescription', labelKey: 'custom:fields:shortDescription', type: 'textarea' },
    { name: 'description', labelKey: 'custom:fields:description', type: 'textarea' },
    { name: 'sceneGallery.sceneName', labelKey: 'custom:fields:sceneName', type: 'textarea', isArrayField: true, arrayFieldName: 'sceneGallery', arraySubField: 'sceneName' },
  ],
  'hero-banner-items': [
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
    { name: 'feature1', labelKey: 'custom:translationCenter:feature1', type: 'textarea' },
    { name: 'feature2', labelKey: 'custom:translationCenter:feature2', type: 'textarea' },
    { name: 'feature3', labelKey: 'custom:translationCenter:feature3', type: 'textarea' },
    { name: 'feature4', labelKey: 'custom:translationCenter:feature4', type: 'textarea' },
    { name: 'feature5', labelKey: 'custom:translationCenter:feature5', type: 'textarea' },
    { name: 'ctaButton.text', labelKey: 'custom:translationCenter:ctaButtonText', type: 'textarea' },
  ],
  'blog-tags': [
    { name: 'name', labelKey: 'custom:fields:tagName', type: 'textarea' },
  ],
  'series-intro-items': [
    { name: 'title', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
    { name: 'description', labelKey: 'custom:translationCenter:description', type: 'textarea' },
  ],
  'form-configs': [
    { name: 'displayName', labelKey: 'custom:fields:displayName', type: 'textarea' },
    { name: 'description', labelKey: 'custom:fields:description', type: 'textarea' },
    { name: 'submitButtonText', labelKey: 'custom:fields:submitButtonText', type: 'textarea' },
    { name: 'submittingText', labelKey: 'custom:fields:submittingText', type: 'textarea' },
    { name: 'successMessage', labelKey: 'custom:fields:successMessage', type: 'textarea' },
    { name: 'errorRequiredFields', labelKey: 'custom:fields:errorRequiredFields', type: 'textarea' },
    { name: 'errorNetworkMessage', labelKey: 'custom:fields:errorNetworkMessage', type: 'textarea' },
    { name: 'errorCaptchaMessage', labelKey: 'custom:fields:errorCaptchaMessage', type: 'textarea', condition: (doc: any) => !!doc.captchaEnabled },
    { name: 'privacyConsentText', labelKey: '__inline:隐私同意文本 (Privacy Consent)', type: 'textarea' },
    { name: 'autoReplySubject', labelKey: 'custom:fields:autoReplySubject', type: 'textarea', condition: (doc: any) => doc.autoReplyEnabled === 'enabled' },
  ],
  'seo-settings': [
    { name: 'metaTitle', labelKey: 'custom:fields:metaTitle', type: 'textarea' },
    { name: 'metaDescription', labelKey: 'custom:fields:metaDescription', type: 'textarea' },
    { name: 'metaKeywords', labelKey: 'custom:fields:metaKeywords', type: 'textarea' },
    { name: 'ogTitle', labelKey: 'custom:fields:ogTitle', type: 'textarea' },
    { name: 'ogDescription', labelKey: 'custom:fields:ogDescription', type: 'textarea' },
  ],
  'template-categories': [
    { name: 'name', labelKey: 'custom:fields:name', type: 'textarea' },
  ],
  'not-found-pages': [
    { name: 'text', labelKey: 'custom:translationCenter:text', type: 'textarea' },
    { name: 'buttonText', labelKey: 'custom:translationCenter:ctaButtonText', type: 'textarea' },
  ],
  'document-templates': [
    { name: 'name', labelKey: 'custom:fields:name', type: 'textarea' },
    { name: 'description', labelKey: 'custom:fields:description', type: 'textarea' },
  ],
  categories: [
    { name: 'name', labelKey: 'custom:fields:name', type: 'textarea' },
    { name: 'description', labelKey: 'custom:fields:description', type: 'textarea' },
  ],
  'navigation-menus': [
    { name: 'name', labelKey: 'custom:fields:name', type: 'textarea' },
    { name: 'linkLabel', labelKey: '__inline:链接按钮文本 (Link Button Text)', type: 'textarea' },
    { name: 'inquiryLabel', labelKey: '__inline:询单按钮文本 (Inquiry Button Text)', type: 'textarea' },
  ],
  'media-categories': [
    { name: 'displayName', labelKey: 'custom:fields:name', type: 'textarea' },
    { name: 'description', labelKey: 'custom:fields:description', type: 'textarea' },
  ],
  'media-tags': [
    { name: 'description', labelKey: 'custom:fields:description', type: 'textarea' },
  ],
  media: [
    { name: 'alt', labelKey: 'custom:fields:altText', type: 'textarea' },
  ],
  'smtp-configs': [
    { name: 'emailFromName', labelKey: 'custom:fields:name', type: 'textarea' },
    { name: 'notificationSubject', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
    { name: 'autoReplySubject', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
  ],
  'knowledge-base-settings': [
    { name: 'heroTitle', labelKey: 'custom:translationCenter:heroText', type: 'textarea' },
    { name: 'navTitle', labelKey: 'custom:translationCenter:fieldTitle', type: 'textarea' },
    { name: 'shareConfig.title', labelKey: 'custom:fields:title', type: 'textarea' },
    { name: 'searchBox.placeholder', labelKey: 'custom:fields:placeholder', type: 'textarea' },
    { name: 'categoryList.title', labelKey: 'custom:fields:title', type: 'textarea' },
    { name: 'recommendedPosts.title', labelKey: 'custom:fields:title', type: 'textarea' },
    { name: 'followUs.title', labelKey: 'custom:fields:title', type: 'textarea' },
    { name: 'bottomCategories.title', labelKey: 'custom:fields:title', type: 'textarea' },
    { name: 'bottomRecommended.title', labelKey: 'custom:fields:title', type: 'textarea' },
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
    { name: 'copyrightText', labelKey: '__inline:版权文本 (Copyright Text)', type: 'textarea' },
    { 
      name: 'legalLinks.label', 
      labelKey: 'custom:fields:label', 
      type: 'textarea', 
      isArrayField: true, 
      arrayFieldName: 'legalLinks', 
      arraySubField: 'label' 
    },
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
  const { id, collectionSlug, globalSlug } = useDocumentInfo()
  const activeSlug = collectionSlug || globalSlug
  const isGlobal = !!globalSlug
  const currentLocale = useLocale()
  const { t, i18n } = useTranslation()

  const fieldConfigs = activeSlug ? TRANSLATABLE_FIELDS[activeSlug] : []
  const [formFields] = useAllFormFields()

  // 动态计算可翻译字段总数（展开数组字段为实际行数）
  const actualFieldCount = useMemo(() => {
    if (!fieldConfigs || fieldConfigs.length === 0) return 0
    let count = 0
    for (const config of fieldConfigs) {
      // 检查条件是否满足
      // 注意：这里使用 formFields 获取当前编辑状态的值，key 为字段名且包含 .value
      const conditionData: Record<string, any> = {}
      Object.keys(formFields || {}).forEach(key => {
        if (formFields[key]?.value !== undefined) {
          conditionData[key] = formFields[key].value
        }
      })
      
      if (config.condition && !config.condition(conditionData)) {
        continue
      }

      if (config.isArrayField && config.arrayFieldName && config.arraySubField) {
        // 从表单字段中统计数组行数：匹配 "arrayFieldName.N.subField" 的 key
        const pattern = new RegExp(`^${config.arrayFieldName}\\.(\\d+)\\.${config.arraySubField}$`)
        const arrayItemCount = Object.keys(formFields || {}).filter(key => pattern.test(key)).length
        count += arrayItemCount
      } else {
        count += 1
      }
    }
    return count
  }, [fieldConfigs, formFields])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fieldsData, setFieldsData] = useState<FieldData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sourceLocale, setSourceLocale] = useState<LocaleCode>('en')
  const [targetLocales, setTargetLocales] = useState<LocaleCode[]>([])
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
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
    if (!activeSlug || !fieldConfigs || fieldConfigs.length === 0 || (!isGlobal && !id)) return

    setIsModalOpen(true)
    setIsLoading(true)
    setStatusMessage(null)
    setModifiedLocales(new Set()) // 重置修改追踪
    const docId = String(id)
    try {
      // 使用自定义 endpoint 一次性获取所有语言数据
      const apiUrl = isGlobal 
        ? `/api/globals/${activeSlug}/all-locales`
        : `/api/${activeSlug}/${docId}/all-locales`
      const res = await fetch(apiUrl)

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
            arrayData.forEach((item, index) => {
              const fieldData = item[config.arraySubField!]
              newFieldsData.push({
                config: {
                  ...config,
                  // Use a unique name like "sceneGallery[0].sceneName" for identification
                  name: `${config.arrayFieldName}[${index}].${config.arraySubField}`,
                  // Display label like "Scene 1 - Scene Name"
                  labelKey: `__array__:Scene ${index + 1} - :${config.labelKey}`,
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
          // Regular field
          const fieldData = getNestedValue(doc, config.name)
          newFieldsData.push({
            config,
            values: SUPPORTED_LOCALES.map(locale => ({
              locale: locale.code as LocaleCode,
              value: typeof fieldData === 'object' && fieldData !== null
                ? ((fieldData as Record<string, string>)[locale.code] || '')
                : (fieldData as string || ''),
            })),
          })
        }
      }

      setFieldsData(newFieldsData)
      // 默认全选所有字段
      setSelectedFields(new Set(newFieldsData.map(f => f.config.name)))
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
      return !!sourceValue && (typeof sourceValue === 'string' ? sourceValue.trim().length > 0 : true)
    })

    if (validFieldsToTranslate.length === 0) {
      setStatusMessage({ type: 'error', key: 'custom:translationCenter:sourceEmpty' })
      return
    }

    setIsTranslating(true)
    setProgress({ current: 0, total: targetLocales.length })
    setStatusMessage(null)

    try {
      const { getTranslationHeaders } = await import('@/lib/translation-client')
      const personalHeaders = getTranslationHeaders()

      // 准备批量翻译的数据
      const textsToTranslate = validFieldsToTranslate.map(field => {
        const val = field.values.find(v => v.locale === sourceLocale)?.value
        return typeof val === 'object' ? JSON.stringify(val) : (val || '')
      })

      let translatedCount = 0
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
            isRichText: validFieldsToTranslate.some(f => f.config.type === 'richText' as any),
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
              let nextValue: any = translations[fieldIndex]
              // If it looks like JSON and field is richText, parse it
              if (typeof nextValue === 'string' && nextValue.startsWith('{')) {
                 try { nextValue = JSON.parse(nextValue) } catch(e) {}
              }
              
              return {
                ...f,
                values: f.values.map(v => 
                  v.locale === targetLang ? { ...v, value: nextValue } : v
                ),
              }
            }
            return f
          }))

          setModifiedLocales(prev => new Set(prev).add(targetLang))
        }
        
        translatedCount++
        setProgress({ current: translatedCount, total: targetLocales.length })
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
      console.error('[TranslationCenter] Translation error:', error)
      setStatusMessage({ type: 'error', key: 'custom:translationCenter:translateFailed' })
    } finally {
      setIsTranslating(false)
      setProgress(null)
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
    if (!activeSlug || !fieldConfigs || (!isGlobal && !id)) return

    setIsSaving(true)
    setProgress({ current: 0, total: 1 })
    setStatusMessage(null)

    let successCount = 0
    let failCount = 0
    const docId = id ? String(id) : ''

    try {
      const localesToSave = Array.from(modifiedLocales)

      if (localesToSave.length === 0) {
        setStatusMessage({ type: 'warning', key: 'custom:translationCenter:noChanges' })
        setIsSaving(false)
        setProgress(null)
        return
      }

      // Helper function to set nested field value using dot notation
      const setNestedValue = (obj: Record<string, unknown>, path: string, value: any) => {
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

      // Build per-locale data
      const localesPayload: Record<string, Record<string, unknown>> = {}

      // Fetch source data once (for array fields & required fields)
      let sourceData: any = null
      const hasArrayFields = fieldsData.some(f => f.config.name.match(/^(.+)\[(\d+)]\.(.+)$/))
      if (hasArrayFields || collectionSlug === 'products') {
        const dataUrl = isGlobal
          ? `/api/globals/${activeSlug}?locale=${sourceLocale}&depth=0`
          : `/api/${activeSlug}/${docId}?locale=${sourceLocale}&depth=0`
        const sourceRes = await fetch(dataUrl)
        sourceData = await sourceRes.json()
      }

      for (const localeCode of localesToSave) {
        const locale = SUPPORTED_LOCALES.find(l => l.code === localeCode)
        if (!locale) continue

        const dataToSave: Record<string, unknown> = {}
        const arrayFieldUpdates: Record<string, Record<number, Record<string, string>>> = {}

        for (const field of fieldsData) {
          const value = field.values.find(v => v.locale === locale.code)?.value
          if (value === undefined) continue

          const arrayMatch = field.config.name.match(/^(.+)\[(\d+)]\.(.+)$/)
          if (arrayMatch) {
            const [, arrName, idxStr, subField] = arrayMatch
            const idx = parseInt(idxStr, 10)
            if (!arrayFieldUpdates[arrName]) arrayFieldUpdates[arrName] = {}
            if (!arrayFieldUpdates[arrName][idx]) arrayFieldUpdates[arrName][idx] = {}
            arrayFieldUpdates[arrName][idx][subField] = value
          } else {
            setNestedValue(dataToSave, field.config.name, value)
          }
        }

        // Merge array field updates
        if (sourceData) {
          for (const [arrName, indexUpdates] of Object.entries(arrayFieldUpdates)) {
            const sourceArray = (sourceData[arrName] as Array<Record<string, unknown>>) || []
            const mergedArray = sourceArray.map((item, idx) => {
              const updates = indexUpdates[idx]
              return updates ? { ...item, ...updates } : { ...item }
            })
            dataToSave[arrName] = mergedArray
          }

          // Fill required fields to prevent hooks from regenerating them
          if (collectionSlug === 'products') {
            if (!dataToSave.name && sourceData.name) dataToSave.name = sourceData.name
            if (sourceData.slug) dataToSave.slug = sourceData.slug
          }
          if (collectionSlug === 'faq-items' && sourceData.slug) {
            dataToSave.slug = sourceData.slug
          }
        }

        // Recursive cleaning to remove illegal fields from all levels
        const cleanPayload = (obj: any): any => {
          if (!obj || typeof obj !== 'object' || obj === null) return obj
          if (Array.isArray(obj)) return obj.map(cleanPayload)

          const illegalFields = [
            'user', 'id', 'createdat', 'updatedat', '__v', 
            '_locale', '_parent_id', 'prevpost', 'nextpost', 
            'kb_recommended_posts_posts', 'kb_bottom_recommended_posts'
          ]
          // Also filter out any field ending with 'CropData' (image crop metadata)
          // These are internal technical fields that should never be translated
          const newObj: any = {}
          for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase()
            if (
              illegalFields.includes(lowerKey) || 
              (key.startsWith('_') && !['_id', 'id'].includes(key)) ||
              (lowerKey.startsWith('kb_') && (lowerKey.endsWith('_posts') || lowerKey.endsWith('_post'))) ||
              key.endsWith('CropData')
            ) {
              continue
            }
            newObj[key] = cleanPayload(value)
          }
          return newObj
        }

        const cleanData = cleanPayload(dataToSave)
        localesPayload[localeCode] = cleanData
      }

      if (isGlobal) {
        // Globals: save one by one (no syncM2M issues)
        setProgress({ current: 0, total: localesToSave.length })
        for (const [localeCode, data] of Object.entries(localesPayload)) {
          const saveUrl = `/api/globals/${activeSlug}?locale=${localeCode}`
          const saveRes = await fetch(saveUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (saveRes.ok) {
            successCount++
          } else {
            failCount++
            const errorBody = await saveRes.text().catch(() => '')
            console.error(`[TranslationCenter] ❌ Global save failed locale=${localeCode}:`, errorBody)
          }
          setProgress(prev => prev ? { ...prev, current: successCount + failCount } : null)
        }
      } else {
        // Collections: use bulk save-translations endpoint (bypasses syncM2M hooks)
        setProgress({ current: 0, total: 1 })
        console.log(`[TranslationCenter] Bulk saving ${Object.keys(localesPayload).length} locales via save-translations endpoint`)

        const saveRes = await fetch(`/api/${activeSlug}/${docId}/save-translations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locales: localesPayload, sourceLocale }),
        })

        const result = await saveRes.json()

        if (saveRes.ok && result.results) {
          const errors: string[] = []
          for (const [locale, r] of Object.entries(result.results as Record<string, { success: boolean, error?: string }>)) {
            if (r.success) {
              successCount++
            } else {
              failCount++
              if (r.error) errors.push(`${locale}: ${r.error}`)
            }
          }
          
          if (failCount > 0) {
            const firstError = errors[0] || 'Unknown error'
            setStatusMessage({ 
              type: 'error', 
              key: '__inline:部分保存失败', 
              params: { details: `${successCount} ✓ / ${failCount} ✗. 错误详情: ${firstError}` } 
            })
          }
        } else {
          failCount = localesToSave.length
          const errorMsg = result.error || 'Request failed'
          setStatusMessage({ type: 'error', key: `__inline:保存失败: ${errorMsg}` })
          console.error(`[TranslationCenter] ❌ Bulk save failed:`, result)
        }
        setProgress({ current: 1, total: 1 })
      }

      if (failCount === 0) {
        setStatusMessage({ type: 'success', key: 'custom:translationCenter:saveSuccess', params: { count: successCount } })
        setModifiedLocales(new Set())
      }

      window.dispatchEvent(new Event('multilocale-refresh'))
    } catch (error) {
      console.error('[TranslationCenter] Save error:', error)
      setStatusMessage({ type: 'error', key: 'custom:translationCenter:saveFailed' })
    } finally {
      setIsSaving(false)
      setProgress(null)
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
      'custom:translationCenter:selectTargetLanguages': t('custom:translationCenter:selectTargetLanguages' as any) === 'custom:translationCenter:selectTargetLanguages' ? (i18n.language === 'zh' ? '请选择目标语言' : 'Please select target languages') : t('custom:translationCenter:selectTargetLanguages' as any) as string,
      'custom:translationCenter:translateFailed': t('custom:translationCenter:translateFailed' as any) === 'custom:translationCenter:translateFailed' ? (i18n.language === 'zh' ? '翻译失败' : 'Translation failed') : t('custom:translationCenter:translateFailed' as any) as string,
      'custom:translationCenter:saveFailed': t('custom:translationCenter:saveFailed' as any) === 'custom:translationCenter:saveFailed' ? (i18n.language === 'zh' ? '保存失败' : 'Save failed') : t('custom:translationCenter:saveFailed' as any) as string,
      'custom:translationCenter:loadFailed': t('custom:translationCenter:loadFailed' as any) === 'custom:translationCenter:loadFailed' ? (i18n.language === 'zh' ? '加载数据失败' : 'Load failed') : t('custom:translationCenter:loadFailed' as any) as string,
      'custom:translationCenter:noChanges': t('custom:translationCenter:noChanges' as any) === 'custom:translationCenter:noChanges' ? (i18n.language === 'zh' ? '没有修改需要保存' : 'No changes to save') : t('custom:translationCenter:noChanges' as any) as string,
      'custom:translationCenter:sourceEmpty': t('custom:translationCenter:sourceEmpty' as any) === 'custom:translationCenter:sourceEmpty' ? (i18n.language === 'zh' ? '源语言内容为空' : 'The source language content is empty') : t('custom:translationCenter:sourceEmpty' as any) as string,
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

  // Check if button should be disabled
  const isTriggerDisabled = !activeSlug || !fieldConfigs || fieldConfigs.length === 0 || (!isGlobal && !id)

  

  if (isTriggerDisabled) {
    return (
      <div className="tc-trigger tc-trigger--disabled">
        <button type="button" disabled>
          {t('custom:translationCenter:triggerButton' as any)}
        </button>
        <span className="tc-trigger__hint">
          {(!isGlobal && !id) ? t('custom:translationCenter:saveFirst' as any) : t('custom:translationCenter:notAvailable' as any)}
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
          {actualFieldCount || fieldConfigs.length} {t('custom:translationCenter:triggerHint' as any)}
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
                          ? `${t('custom:translationCenter:translating' as any)} ${progress ? `(${progress.current}/${progress.total})` : ''}`
                          : `${t('custom:translationCenter:translate' as any)} (${targetLocales.length})`
                        }
                      </button>
                      <button
                        type="button"
                        className="tc-btn tc-btn--secondary"
                        onClick={handleSave}
                        disabled={isTranslating || isSaving}
                      >
                        {isSaving 
                          ? `${t('custom:translationCenter:saving' as any)} ${progress ? `(${progress.current}/${progress.total})` : ''}`
                          : t('custom:translationCenter:saveAll' as any)
                        }
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
                                  // Format: "__array__:Scene 1 - :custom:fields:sceneName"
                                  const rest = field.config.labelKey.slice('__array__:'.length)
                                  const colonIdx = rest.indexOf(':custom:')
                                  if (colonIdx >= 0) {
                                    const prefix = rest.slice(0, colonIdx)
                                    const key = rest.slice(colonIdx + 1)
                                    return `${prefix}${t(key as any)}`
                                  }
                                  return rest
                                })()
                              : field.config.labelKey.startsWith('__inline:')
                                ? field.config.labelKey.slice('__inline:'.length)
                                : t(field.config.labelKey as any)
                            }
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
                                {field.config.type === 'textarea' || field.config.type === 'richText' ? (
                                  <textarea
                                    value={typeof fieldValue === 'object' ? JSON.stringify(fieldValue, null, 2) : fieldValue}
                                    onChange={(e) => {
                                      let nextValue: any = e.target.value
                                      if (field.config.type === 'richText') {
                                        try {
                                          nextValue = JSON.parse(e.target.value)
                                        } catch (e) {
                                          // Keep as string if not valid JSON
                                        }
                                      }
                                      handleFieldValueChange(field.config.name, locale.code as LocaleCode, nextValue)
                                    }}
                                    rows={field.config.type === 'richText' ? 4 : 2}
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
