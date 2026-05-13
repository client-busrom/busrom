'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useField, useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import { fetchAllLocaleData, getFieldFromCache } from '../localeDataCache'
import { IconPicker } from '../IconPicker'
import { getIconSvgUrl, normalizeIconName } from '../IconPicker/iconify-utils'
import { MediaPicker } from '../MediaPicker'
import { LocaleFlag } from '../../ui/LocaleFlag'
import { LinkPickerModal } from '../../../lexical-features/shared/LinkPickerModal'
import { Link as LinkIcon, Search } from 'lucide-react'
import './styles.scss'

interface VisualData {
  type: 'icon' | 'image'
  icon?: string
  image?: number | any
}

interface AttributeItem {
  id: string
  key: string
  value: string
  showOnFrontEnd: boolean
  visual?: VisualData
  link?: string
}

interface LocaleData {
  locale: LocaleCode
  items: AttributeItem[]
  isLoading: boolean
}

interface AttributesTableFieldProps {
  path: string
  field: {
    name: string
    label?: string | Record<string, string>
    admin?: {
      description?: string | Record<string, string>
    }
  }
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const AttributesTableField: React.FC<AttributesTableFieldProps> = ({ path, field }) => {
  const { value: rawValue, setValue } = useField<any | null>({ path })
  const currentLocale = useLocale()
  
  // Defensive: Handle case where value might be an object {en: [], zh: []} if localized logic is bypassed
  const value = React.useMemo(() => {
    if (Array.isArray(rawValue)) return rawValue
    if (rawValue && typeof rawValue === 'object') {
      return (rawValue as any)[currentLocale.code] || (rawValue as any).en || []
    }
    return []
  }, [rawValue, currentLocale.code])
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const { id, collectionSlug } = useDocumentInfo()

  const [activeLocale, setActiveLocale] = useState<LocaleCode>(currentLocale.code as LocaleCode)
  const [localeData, setLocaleData] = useState<LocaleData[]>(
    SUPPORTED_LOCALES.map(l => ({
      locale: l.code as LocaleCode,
      items: l.code === currentLocale.code ? (value || []) : [],
      isLoading: l.code !== currentLocale.code,
    }))
  )

  const [showTranslatePanel, setShowTranslatePanel] = useState(false)
  const [sourceLocale, setSourceLocale] = useState<LocaleCode>('en')
  const [targetLocales, setTargetLocales] = useState<LocaleCode[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [overwriteExisting, setOverwriteExisting] = useState(false)

  // Link Picker state
  const [linkPickerIndex, setLinkPickerIndex] = useState<number | null>(null)

  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    const loadData = async () => {
      if (!id) {
        setLocaleData(SUPPORTED_LOCALES.map(l => ({
          locale: l.code as LocaleCode,
          items: l.code === currentLocale.code ? (value || []) : [],
          isLoading: false
        })))
        return
      }

      await fetchAllLocaleData(collectionSlug, undefined, id)

      const newData = SUPPORTED_LOCALES.map(locale => {
        if (locale.code === currentLocale.code) {
          return { locale: locale.code as LocaleCode, items: value || [], isLoading: false }
        }
        const val = getFieldFromCache(collectionSlug, undefined, id, field.name, locale.code as LocaleCode)
        return {
          locale: locale.code as LocaleCode,
          items: Array.isArray(val) ? val : [],
          isLoading: false
        }
      })
      setLocaleData(newData)
    }

    loadData()
  }, [id, collectionSlug, field.name, currentLocale.code, value])

  useEffect(() => {
    setLocaleData(prev => prev.map(l => 
      l.locale === currentLocale.code ? { ...l, items: value || [] } : l
    ))
  }, [value, currentLocale.code])

  const activeData = localeData.find(l => l.locale === activeLocale)
  const items = Array.isArray(activeData?.items) ? activeData.items : []

  const updateLocaleItems = useCallback((locale: LocaleCode, newItems: AttributeItem[]) => {
    setLocaleData(prev => prev.map(l => l.locale === locale ? { ...l, items: newItems } : l))
    if (locale === currentLocale.code) {
      setValue(newItems)
    }
  }, [currentLocale.code, setValue])

  const saveToLocale = useCallback(async (locale: LocaleCode, newItems: AttributeItem[]) => {
    if (!id || locale === currentLocale.code) return
    try {
      await fetch(`/api/${collectionSlug}/${id}?locale=${locale}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field.name]: newItems })
      })
    } catch (e) {
      console.error(`Failed to save ${locale}:`, e)
    }
  }, [id, collectionSlug, currentLocale.code, field.name])

  const handleBlur = useCallback(() => {
    if (activeLocale !== currentLocale.code) {
      saveToLocale(activeLocale, items)
    }
  }, [activeLocale, currentLocale.code, items, saveToLocale])

  const updateItem = useCallback((index: number, updates: Partial<AttributeItem>) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], ...updates }
    updateLocaleItems(activeLocale, newItems)
  }, [items, activeLocale, updateLocaleItems])

  const addItem = useCallback(() => {
    const newItem: AttributeItem = {
      id: generateId(),
      key: '',
      value: '',
      showOnFrontEnd: true,
      visual: { type: 'icon', icon: '' },
      link: ''
    }
    updateLocaleItems(activeLocale, [...items, newItem])
  }, [items, activeLocale, updateLocaleItems])

  const removeItem = useCallback((index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    updateLocaleItems(activeLocale, newItems)
  }, [items, activeLocale, updateLocaleItems])

  const moveItem = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= items.length) return
    const newItems = [...items]
    const [moved] = newItems.splice(index, 1)
    newItems.splice(newIndex, 0, moved)
    updateLocaleItems(activeLocale, newItems)
  }, [items, activeLocale, updateLocaleItems])

  const handleTranslate = async () => {
    const sourceData = localeData.find(l => l.locale === sourceLocale)
    const sourceItems = sourceData?.items || []
    if (sourceItems.length === 0 || targetLocales.length === 0) return

    setIsTranslating(true)
    try {
      const textsToTranslate: string[] = []
      sourceItems.forEach(item => {
        textsToTranslate.push(item.key)
        textsToTranslate.push(item.value)
      })

      const { getTranslationHeaders } = await import('@/lib/translation-client')
      const headers = getTranslationHeaders()

      // 用于一次性打包所有翻译结果的对象
      const localesToSave: Record<string, any> = {}

      for (const targetLang of targetLocales) {
        const targetData = localeData.find(l => l.locale === targetLang)
        if (!overwriteExisting && targetData && targetData.items.length > 0) continue

        console.log(`[AttributesTableField] Translating to ${targetLang}...`)
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ texts: textsToTranslate, sourceLang: sourceLocale, targetLang })
        })

        const data = await res.json()
        const translatedTexts = data.translations || textsToTranslate
        
        const translatedItems: AttributeItem[] = sourceItems.map((item, idx) => ({
          ...item,
          key: translatedTexts[idx * 2] || item.key,
          value: translatedTexts[idx * 2 + 1] || item.value
        }))

        // 更新本地 UI 状态（让用户看到打勾）
        updateLocaleItems(targetLang, translatedItems)
        
        // 打包到待保存对象中
        localesToSave[targetLang] = {
          [field.name]: translatedItems
        }
      }

      // --- 关键优化：一次性批量保存 ---
      if (Object.keys(localesToSave).length > 0) {
        console.log(`📡 [AttributesTableField] Bulk saving ${Object.keys(localesToSave).length} languages...`)
        const saveRes = await fetch(`/api/${collectionSlug}/${id}/save-translations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locales: localesToSave })
        })

        if (!saveRes.ok) {
          throw new Error(`Bulk save failed: ${saveRes.statusText}`)
        }
        console.log('✅ [AttributesTableField] Bulk save successful')
      }

      setShowTranslatePanel(false)
    } catch (error) {
      console.error('Translation or Save failed:', error)
      alert(isZh ? '翻译或保存失败，请检查网络日志' : 'Translation or Save failed, please check logs')
    } finally {
      setIsTranslating(false)
    }
  }

  const getLabelText = () => {
    if (!field.label) return field.name
    if (typeof field.label === 'string') return field.label
    return field.label[i18n.language] || field.label.en || field.name
  }

  const VisualCell = ({ item, index }: { item: AttributeItem; index: number }) => {
    const [isPickingIcon, setIsPickingIcon] = useState(false)
    const visual = item.visual || { type: 'icon', icon: '' }
    
    return (
      <div className="attributes-table-field__visual-cell">
        <select 
          className="attributes-table-field__visual-type"
          value={visual.type}
          onChange={(e) => updateItem(index, { visual: { ...visual, type: e.target.value as 'icon' | 'image' } })}
        >
          <option value="icon">{isZh ? '图标' : 'Icon'}</option>
          <option value="image">{isZh ? '图片' : 'Image'}</option>
        </select>

        {visual.type === 'icon' ? (
          <div className="attributes-table-field__visual-content" onClick={() => setIsPickingIcon(true)}>
            {visual.icon ? (
              <>
                <img src={getIconSvgUrl(normalizeIconName(visual.icon), '#333')} className="attributes-table-field__icon-preview" alt="" />
                <span className="attributes-table-field__icon-name">{visual.icon}</span>
              </>
            ) : (
              <span className="attributes-table-field__placeholder">{isZh ? '选择图标...' : 'Pick Icon...'}</span>
            )}
            
            {isPickingIcon && (
              <div className="attributes-table-field__icon-popover" onClick={e => e.stopPropagation()}>
                <IconPicker 
                  field={{ name: 'icon' }} 
                  value={visual.icon}
                  onChange={(val) => {
                    updateItem(index, { visual: { ...visual, icon: val } })
                    setIsPickingIcon(false)
                  }}
                />
                <button type="button" className="close-popover" onClick={() => setIsPickingIcon(false)}>✕</button>
              </div>
            )}
          </div>
        ) : (
          <div className="attributes-table-field__visual-content">
             <MediaPicker 
                field={{ name: 'image' }}
                value={visual.image}
                onChange={(val) => updateItem(index, { visual: { ...visual, image: val } })}
             />
          </div>
        )}
      </div>
    )
  }

  const completedCount = localeData.filter(l => l.items && l.items.length > 0).length
  const completionPercentage = Math.round((completedCount / SUPPORTED_LOCALES.length) * 100)

  return (
    <div className="attributes-table-field">
      <div className="attributes-table-field__header">
        <label className="attributes-table-field__label">{getLabelText()}</label>
        <button
          type="button"
          className="psf-btn psf-btn--translate"
          onClick={() => setShowTranslatePanel(!showTranslatePanel)}
        >
          {showTranslatePanel ? (isZh ? '隐藏翻译' : 'Hide Translate') : (isZh ? '自动翻译' : 'Auto-Translate')}
        </button>
      </div>

      {field.admin?.description && (
        <p className="attributes-table-field__description">
          {typeof field.admin.description === 'string' 
            ? field.admin.description 
            : field.admin.description[i18n.language] || field.admin.description.en}
        </p>
      )}

      <div className="attributes-table-field__progress">
        <div className="progress-info">
          <span>{isZh ? `已完成 ${completedCount} / ${SUPPORTED_LOCALES.length} 种语言 (${completionPercentage}%)` : `${completedCount} of ${SUPPORTED_LOCALES.length} languages (${completionPercentage}%)`}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>

      {showTranslatePanel && (
        <div className="attributes-table-field__translate-panel">
          <h4>{isZh ? '自动翻译设置' : 'Auto-Translate Settings'}</h4>
          <div className="translate-row">
            <div className="translate-col">
              <label>{isZh ? '源语言' : 'Source Language'}</label>
              <select value={sourceLocale} onChange={(e) => setSourceLocale(e.target.value as LocaleCode)} disabled={isTranslating}>
                {SUPPORTED_LOCALES.map(lang => {
                  const data = localeData.find(l => l.locale === lang.code)
                  return <option key={lang.code} value={lang.code}>{lang.label} {data?.items?.length ? '✓' : ''}</option>
                })}
              </select>
            </div>
          </div>
          <div className="translate-row">
            <div className="translate-col">
              <div className="target-header">
                <label>{isZh ? `目标语言 (${targetLocales.length})` : `Targets (${targetLocales.length})`}</label>
                <div className="target-actions">
                  <button type="button" onClick={() => setTargetLocales(SUPPORTED_LOCALES.filter(l => l.code !== sourceLocale).map(l => l.code as LocaleCode))}>All</button>
                </div>
              </div>
              <div className="target-locales">
                {SUPPORTED_LOCALES.filter(l => l.code !== sourceLocale).map(lang => (
                  <label key={lang.code} className="target-locale-checkbox">
                    <input type="checkbox" checked={targetLocales.includes(lang.code as LocaleCode)} onChange={e => e.target.checked ? setTargetLocales([...targetLocales, lang.code as LocaleCode]) : setTargetLocales(targetLocales.filter(l => l !== lang.code))} />
                    <LocaleFlag localeCode={lang.code} className="target-locale-flag" /> {lang.code.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="translate-actions">
            <label className="overwrite-checkbox">
              <input type="checkbox" checked={overwriteExisting} onChange={e => setOverwriteExisting(e.target.checked)} /> {isZh ? '覆盖已有' : 'Overwrite'}
            </label>
            <button type="button" className="psf-btn psf-btn--primary" onClick={handleTranslate} disabled={isTranslating || !targetLocales.length}>{isTranslating ? '...' : (isZh ? '执行翻译' : 'Translate')}</button>
          </div>
        </div>
      )}

      <div className="attributes-table-field__locale-tabs">
        {SUPPORTED_LOCALES.map(lang => {
          const data = localeData.find(l => l.locale === lang.code)
          const isCompleted = data?.items && data.items.length > 0
          const isActive = activeLocale === lang.code
          const isCurrent = lang.code === currentLocale.code
          return (
            <button key={lang.code} type="button" className={`locale-tab ${isActive ? 'locale-tab--active' : ''} ${isCompleted ? 'locale-tab--completed' : ''} ${isCurrent ? 'locale-tab--current' : ''}`} onClick={() => setActiveLocale(lang.code as LocaleCode)}>
              <LocaleFlag localeCode={lang.code} className="locale-tab__flag" />
              <span className="locale-tab__code">{lang.code.toUpperCase()}</span>
              {isCompleted && <span className="locale-tab__check">✓</span>}
              {isCurrent && <span className="locale-tab__current">●</span>}
            </button>
          )
        })}
      </div>

      <div className="attributes-table-field__editor-header">
        <span className="editor-header__locale">
          <LocaleFlag localeCode={activeLocale} className="editor-header__flag" />{' '}
          {SUPPORTED_LOCALES.find(l => l.code === activeLocale)?.label}
          {activeLocale === currentLocale.code && <span className="current-badge">{isZh ? '当前语言' : 'Current'}</span>}
        </span>
      </div>

      <div className="attributes-table-field__container">
        <table className="attributes-table-field__table">
          <thead>
            <tr>
              <th className="attributes-table-field__col-drag"></th>
              <th className="attributes-table-field__col-key">{isZh ? '属性名称' : 'Name'}</th>
              <th className="attributes-table-field__col-val">{isZh ? '属性内容' : 'Value'}</th>
              <th className="attributes-table-field__col-show">{isZh ? '展示' : 'Show'}</th>
              <th className="attributes-table-field__col-visual">{isZh ? '视觉展示' : 'Visual'}</th>
              <th className="attributes-table-field__col-link">{isZh ? '超链接' : 'Link'}</th>
              <th className="attributes-table-field__col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td className="attributes-table-field__col-drag">
                  <div className="attributes-table-field__drag-controls">
                    <button type="button" onClick={() => moveItem(index, 'up')}>▲</button>
                    <button type="button" onClick={() => moveItem(index, 'down')}>▼</button>
                  </div>
                </td>
                <td><input className="attributes-table-field__input" value={item.key || ''} onChange={e => updateItem(index, { key: e.target.value })} onBlur={handleBlur} /></td>
                <td><textarea className="attributes-table-field__input attributes-table-field__textarea" value={item.value || ''} onChange={e => updateItem(index, { value: e.target.value })} onBlur={handleBlur} /></td>
                <td className="attributes-table-field__col-show"><input type="checkbox" className="attributes-table-field__checkbox" checked={item.showOnFrontEnd !== false} onChange={e => { updateItem(index, { showOnFrontEnd: e.target.checked }); setTimeout(handleBlur, 0); }} /></td>
                <td className="attributes-table-field__col-visual"><VisualCell item={item} index={index} /></td>
                <td className="attributes-table-field__col-link">
                  <div className="attributes-table-field__link-box">
                    <input 
                      className="attributes-table-field__input" 
                      value={item.link || ''} 
                      onChange={e => updateItem(index, { link: e.target.value })} 
                      onBlur={handleBlur} 
                      placeholder="https://..."
                    />
                    <button 
                      type="button" 
                      className="attributes-table-field__btn-link-picker"
                      onClick={() => setLinkPickerIndex(index)}
                      title={isZh ? '选择站内链接' : 'Select Internal Link'}
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </td>
                <td className="attributes-table-field__col-actions"><button type="button" className="attributes-table-field__btn-delete" onClick={() => removeItem(index)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="attributes-table-field__footer">
          <button type="button" className="attributes-table-field__btn-add" onClick={addItem}>+ {isZh ? '添加属性' : 'Add'}</button>
        </div>
      </div>

      <LinkPickerModal 
        isOpen={linkPickerIndex !== null}
        onClose={() => setLinkPickerIndex(null)}
        onSelect={(path) => {
          if (linkPickerIndex !== null) {
            updateItem(linkPickerIndex, { link: path })
            // Trigger blur-save logic manually since we are in a modal
            if (activeLocale !== currentLocale.code) {
              const newItems = [...items]
              newItems[linkPickerIndex] = { ...newItems[linkPickerIndex], link: path }
              saveToLocale(activeLocale, newItems)
            }
          }
          setLinkPickerIndex(null)
        }}
      />
    </div>
  )
}

export default AttributesTableField
