'use client'

import React, { useCallback, useState } from 'react'
import { useField, useTranslation } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'
import { LocaleFlag } from '../../ui/LocaleFlag'
import { RelationshipPicker } from '../RelationshipPicker'
import './styles.scss'

// i18n translations for the component UI
const i18n = {
  title: { en: 'Knowledge Base Sections (Multilingual)', zh: '知识库板块（多语言）' },
  autoTranslate: { en: 'Auto-Translate', zh: '自动翻译' },
  hide: { en: 'Hide', zh: '隐藏' },
  autoTranslateSettings: { en: 'Auto-Translate Settings', zh: '自动翻译设置' },
  sourceLanguage: { en: 'Source Language', zh: '源语言' },
  overwriteExisting: { en: 'Overwrite existing translations', zh: '覆盖已有翻译' },
  targetLanguages: { en: 'Target Languages', zh: '目标语言' },
  selectAll: { en: 'Select All', zh: '全选' },
  deselectAll: { en: 'Deselect All', zh: '取消全选' },
  translating: { en: 'Translating...', zh: '翻译中...' },
  translate: { en: 'Start Translation', zh: '开始自动翻译' },
  noSections: { en: 'No sections configured.', zh: '尚未配置板块。' },
  section: { en: 'Section', zh: '板块' },
  template: { en: 'Section Template', zh: '板块渲染模板' },
  tagTitle: { en: 'Tag Label (e.g. Featured)', zh: '标签文案（如：精选）' },
  introTitle: { en: 'Introduction Title', zh: '介绍标题' },
  introDesc: { en: 'Introduction Description', zh: '介绍描述' },
  buttonText: { en: 'Button Text', zh: '按钮文字' },
  relatedTag: { en: 'Data Source (Tag)', zh: '数据来源（标签）' },
  addSection: { en: '+ Add Section (to all languages)', zh: '+ 添加板块（到所有语言）' },
  hint: { en: 'Sections are shared across languages, but content is unique per locale.', zh: '板块结构在所有语言间共享，但每个语言的内容可独立配置。' },
  translationCompleted: { en: 'Translation completed!', zh: '翻译完成！' },
  translationFailed: { en: 'Translation failed', zh: '翻译失败' },
}

interface KnowledgeSection {
  template: string
  tagTitle: string
  introTitle: string
  introDesc: string
  buttonText: string
  tag?: string | number | null
}

interface MultilingualSections {
  [key: string]: KnowledgeSection[] // locale -> sections array
}

const TEMPLATE_OPTIONS = [
  { label: 'Template 1 (Latest Articles)', value: 'template1' },
  { label: 'Template 2 (Dark Theme - Popular)', value: 'template2' },
  { label: 'Template 3 (Trending - Layout)', value: 'template3' },
  { label: 'Template 4 (Wave/Interactive)', value: 'template4' },
]

export const MultilingualKnowledgeSections: React.FC<any> = ({ path }) => {
  const { value, setValue } = useField<MultilingualSections>({ path })
  const { i18n: { language } } = useTranslation()
  const t = (obj: { en: string; zh: string }) => language === 'zh' ? obj.zh : obj.en
  
  const [activeLocale, setActiveLocale] = useState<LocaleCode>('en')
  const [showTranslationPanel, setShowTranslationPanel] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [sourceLanguage, setSourceLanguage] = useState<LocaleCode>('en')
  const [selectedLanguages, setSelectedLanguages] = useState<LocaleCode[]>([])
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const localeCodes = SUPPORTED_LOCALES.map(l => l.code)
  const items = (value?.[activeLocale] || []) as KnowledgeSection[]

  // Add a new section to all locales
  const addSection = useCallback(() => {
    const newValue = { ...value }
    localeCodes.forEach((locale) => {
      if (!newValue[locale]) newValue[locale] = []
      newValue[locale].push({
        template: 'template1',
        tagTitle: '',
        introTitle: '',
        introDesc: '',
        buttonText: 'View More',
        tag: null,
      })
    })
    setValue(newValue)
  }, [value, setValue, localeCodes])

  // Remove a section from all locales
  const removeSection = useCallback((index: number) => {
    if (!window.confirm('Delete this section from all languages?')) return
    const newValue = { ...value }
    localeCodes.forEach((locale) => {
      if (newValue[locale]) {
        newValue[locale] = newValue[locale].filter((_, i) => i !== index)
      }
    })
    setValue(newValue)
  }, [value, setValue, localeCodes])

  // Update field value
  const updateSection = useCallback((index: number, field: keyof KnowledgeSection, fieldValue: any) => {
    const newValue = { ...value }
    
    // Template and Tag are synced across all languages
    if (field === 'template' || field === 'tag') {
      localeCodes.forEach(locale => {
        if (!newValue[locale]) newValue[locale] = []
        const localeItems = [...newValue[locale]]
        if (localeItems[index]) {
          localeItems[index] = { ...localeItems[index], [field]: fieldValue }
          newValue[locale] = localeItems
        }
      })
    } else {
      // Content fields are locale-specific
      if (!newValue[activeLocale]) newValue[activeLocale] = []
      const localeItems = [...newValue[activeLocale]]
      if (localeItems[index]) {
        localeItems[index] = { ...localeItems[index], [field]: fieldValue }
        newValue[activeLocale] = localeItems
      }
    }
    
    setValue(newValue)
  }, [value, activeLocale, setValue, localeCodes])

  // Translation Panel logic
  const toggleLanguage = (lang: LocaleCode) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    )
  }

  const handleTranslate = useCallback(async () => {
    const sourceItems = value?.[sourceLanguage]
    if (!sourceItems || sourceItems.length === 0) {
      setError(`Source content (${sourceLanguage.toUpperCase()}) is empty.`)
      return
    }

    if (selectedLanguages.length === 0) {
      setError(t(i18n.translate))
      return
    }

    setIsTranslating(true)
    setError('')
    setStatus('Translating...')

    try {
      const { getTranslationHeaders } = await import('@/lib/translation-client')
      const headers = getTranslationHeaders()
      const newValue = { ...value }

      // Map unique text to translations to save API calls
      const uniqueTexts = new Map<string, Record<string, string>>()
      for (const item of sourceItems) {
        if (item.tagTitle?.trim()) uniqueTexts.set(item.tagTitle, {})
        if (item.introTitle?.trim()) uniqueTexts.set(item.introTitle, {})
        if (item.introDesc?.trim()) uniqueTexts.set(item.introDesc, {})
        if (item.buttonText?.trim()) uniqueTexts.set(item.buttonText, {})
      }

      await Promise.all(Array.from(uniqueTexts.keys()).map(async (text) => {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ text, sourceLang: sourceLanguage, targetLangs: selectedLanguages }),
        })
        if (res.ok) {
          const data = await res.json()
          uniqueTexts.set(text, data.translations || {})
        }
      }))

      for (const lang of selectedLanguages) {
        if (!newValue[lang]) newValue[lang] = []
        newValue[lang] = sourceItems.map((sourceItem, idx) => {
          const existing = newValue[lang][idx] || {}
          if (!overwriteExisting && existing.tagTitle) return existing
          
          return {
            ...sourceItem,
            tagTitle: uniqueTexts.get(sourceItem.tagTitle || '')?.[lang] || sourceItem.tagTitle,
            introTitle: uniqueTexts.get(sourceItem.introTitle || '')?.[lang] || sourceItem.introTitle,
            introDesc: uniqueTexts.get(sourceItem.introDesc || '')?.[lang] || sourceItem.introDesc,
            buttonText: uniqueTexts.get(sourceItem.buttonText || '')?.[lang] || sourceItem.buttonText,
          }
        })
      }

      setValue(newValue)
      setStatus(`✅ ${t(i18n.translationCompleted)}`)
      setTimeout(() => setStatus(''), 3000)
    } catch (err) {
      setError(t(i18n.translationFailed))
    } finally {
      setIsTranslating(false)
    }
  }, [value, sourceLanguage, selectedLanguages, overwriteExisting, setValue, t])

  return (
    <div className="multilingual-knowledge-sections">
      <div className="sections-header">
        <div className="header-top">
          <h3 className="title">{t(i18n.title)}</h3>
          <button
            type="button"
            className="translate-toggle-btn"
            onClick={() => setShowTranslationPanel(!showTranslationPanel)}
          >
            🌐 {showTranslationPanel ? t(i18n.hide) : t(i18n.autoTranslate)}
          </button>
        </div>

        <div className="locale-tabs">
          {SUPPORTED_LOCALES.map((locale) => {
            const hasContent = value?.[locale.code]?.some(item => 
              item.tagTitle?.trim() || item.introTitle?.trim()
            )
            return (
              <button
                key={locale.code}
                type="button"
                className={`locale-tab ${activeLocale === locale.code ? 'active' : ''} ${hasContent ? 'filled' : ''}`}
                onClick={() => setActiveLocale(locale.code)}
              >
                <LocaleFlag localeCode={locale.code} className="locale-flag" />
                <span className="locale-code">{locale.code.toUpperCase()}</span>
                {hasContent && <span className="locale-check">✓</span>}
              </button>
            )
          })}
        </div>

        {showTranslationPanel && (
          <div className="translation-panel">
            <div className="panel-row">
              <div className="panel-group">
                <label>{t(i18n.sourceLanguage)}</label>
                <select value={sourceLanguage} onChange={e => setSourceLanguage(e.target.value as LocaleCode)}>
                  {SUPPORTED_LOCALES.map(l => (<option key={l.code} value={l.code}>{l.label}</option>))}
                </select>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={overwriteExisting} onChange={e => setOverwriteExisting(e.target.checked)} />
                {t(i18n.overwriteExisting)}
              </label>
            </div>

            <div className="target-selection">
              <label>{t(i18n.targetLanguages)}</label>
              <div className="target-grid">
                {SUPPORTED_LOCALES.filter(l => l.code !== sourceLanguage).map(l => (
                  <label key={l.code} className={`target-chip ${selectedLanguages.includes(l.code) ? 'selected' : ''}`}>
                    <input type="checkbox" checked={selectedLanguages.includes(l.code)} onChange={() => toggleLanguage(l.code)} />
                    {l.code.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>

            <div className="panel-actions">
              <button 
                type="button" 
                className="start-translate-btn" 
                onClick={handleTranslate} 
                disabled={isTranslating || selectedLanguages.length === 0}
              >
                {isTranslating ? t(i18n.translating) : t(i18n.translate)}
              </button>
              {status && <span className="status-msg success">{status}</span>}
              {error && <span className="status-msg error">{error}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="sections-list">
        {items.length === 0 ? (
          <p className="empty-msg">{t(i18n.noSections)}</p>
        ) : (
          items.map((item, index) => (
            <div key={`section-${activeLocale}-${index}`} className="section-card">
              <div className="card-header">
                <h4>{t(i18n.section)} {index + 1}</h4>
                <button type="button" className="delete-btn" onClick={() => removeSection(index)}>×</button>
              </div>
              
              <div className="card-body">
                <div className="form-field">
                  <label>{t(i18n.template)}</label>
                  <select
                    value={item.template || 'template1'}
                    onChange={e => updateSection(index, 'template', e.target.value)}
                  >
                    {TEMPLATE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>{t(i18n.tagTitle)}</label>
                  <textarea rows={1} value={item.tagTitle || ''} onChange={e => updateSection(index, 'tagTitle', e.target.value)} />
                </div>

                <div className="form-field">
                  <label>{t(i18n.introTitle)}</label>
                  <textarea rows={1} value={item.introTitle || ''} onChange={e => updateSection(index, 'introTitle', e.target.value)} />
                </div>

                <div className="form-field">
                  <label>{t(i18n.introDesc)}</label>
                  <textarea rows={3} value={item.introDesc || ''} onChange={e => updateSection(index, 'introDesc', e.target.value)} />
                </div>

                <div className="form-field">
                  <label>{t(i18n.buttonText)}</label>
                  <textarea rows={1} value={item.buttonText || ''} onChange={e => updateSection(index, 'buttonText', e.target.value)} />
                </div>

                <div className="form-field">
                  <RelationshipPicker
                    label={t(i18n.relatedTag)}
                    relationTo="blog-tags"
                    value={item.tag}
                    onChange={val => updateSection(index, 'tag', val)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="footer-actions">
        <button type="button" className="add-btn" onClick={addSection}>{t(i18n.addSection)}</button>
        <p className="hint">{t(i18n.hint)}</p>
      </div>
    </div>
  )
}

export default MultilingualKnowledgeSections
