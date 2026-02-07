'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useDocumentInfo, useFormFields, useTranslation, useLocale, useForm } from '@payloadcms/ui'
import './styles.scss'

interface AutoDraftProps {
  path?: string
  field?: {
    name: string
    label?: string | Record<string, string>
  }
}

// 草稿保存间隔（毫秒）- 输入停止后多久保存
const DEBOUNCE_DELAY = 2000

// 获取 localStorage key
// 新建条目使用 'new' 作为 docId
const getDraftKey = (collectionSlug: string, docId: string | number | undefined, locale: string) =>
  `payload_draft_${collectionSlug}_${docId || 'new'}_${locale}`

// 从表单字段中提取值
const extractFormValues = (fields: Record<string, any>): Record<string, any> => {
  const values: Record<string, any> = {}

  for (const [key, field] of Object.entries(fields)) {
    if (field && typeof field === 'object' && 'value' in field) {
      values[key] = field.value
    }
  }

  return values
}

export const AutoDraft: React.FC<AutoDraftProps> = () => {
  const { id, collectionSlug } = useDocumentInfo()
  const locale = useLocale()
  const { t } = useTranslation()
  const { setModified, dispatchFields } = useForm()

  // 获取所有表单字段
  const allFields = useFormFields(([fields]) => fields)

  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [showRestorePrompt, setShowRestorePrompt] = useState(false)
  const [draftTimestamp, setDraftTimestamp] = useState<Date | null>(null)
  const [draftData, setDraftData] = useState<Record<string, any> | null>(null)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastDataRef = useRef<string>('')
  const isInitialLoadRef = useRef(true)
  const localeCode = locale?.code || 'en'

  // 保存草稿到 localStorage
  const saveDraft = useCallback(() => {
    if (!collectionSlug || !allFields) return

    try {
      const formValues = extractFormValues(allFields)
      const dataToSave = {
        timestamp: new Date().toISOString(),
        locale: localeCode,
        data: formValues,
      }

      const dataString = JSON.stringify(dataToSave)

      // 只有数据变化时才保存
      if (dataString === lastDataRef.current) return

      localStorage.setItem(getDraftKey(collectionSlug, id, localeCode), dataString)
      lastDataRef.current = dataString
      setLastSavedTime(new Date())
      setHasDraft(true)

      console.log('[AutoDraft] Draft saved:', getDraftKey(collectionSlug, id, localeCode))
    } catch (error) {
      console.error('[AutoDraft] Failed to save draft:', error)
    }
  }, [collectionSlug, id, allFields, localeCode])

  // 检查是否有草稿
  const checkForDraft = useCallback(() => {
    if (!collectionSlug) return null

    try {
      const draftKey = getDraftKey(collectionSlug, id, localeCode)
      const savedDraft = localStorage.getItem(draftKey)

      if (savedDraft) {
        const { timestamp, data, locale: savedLocale } = JSON.parse(savedDraft)
        const savedTime = new Date(timestamp)
        const now = new Date()

        // 草稿超过 24 小时则删除
        const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60)
        if (hoursDiff > 24) {
          localStorage.removeItem(draftKey)
          return null
        }

        // 确保语言匹配
        if (savedLocale && savedLocale !== localeCode) {
          return null
        }

        return { timestamp: savedTime, data }
      }
    } catch (error) {
      console.error('[AutoDraft] Failed to check draft:', error)
    }

    return null
  }, [collectionSlug, id, localeCode])

  // 恢复草稿
  const restoreDraft = useCallback(() => {
    if (!draftData || !dispatchFields) return

    try {
      // 使用 dispatchFields 更新表单字段
      Object.entries(draftData).forEach(([fieldPath, value]) => {
        dispatchFields({
          type: 'UPDATE',
          path: fieldPath,
          value: value,
        })
      })

      // 标记表单已修改
      setModified(true)

      // 清除恢复提示
      setShowRestorePrompt(false)
      setDraftData(null)

      console.log('[AutoDraft] Draft restored successfully')
    } catch (error) {
      console.error('[AutoDraft] Failed to restore draft:', error)
    }
  }, [draftData, dispatchFields, setModified])

  // 忽略草稿
  const dismissDraft = useCallback(() => {
    if (collectionSlug) {
      localStorage.removeItem(getDraftKey(collectionSlug, id, localeCode))
    }
    setShowRestorePrompt(false)
    setHasDraft(false)
    setDraftTimestamp(null)
    setDraftData(null)
  }, [collectionSlug, id, localeCode])

  // 清除草稿（保存成功后调用）
  const clearDraft = useCallback(() => {
    if (collectionSlug) {
      localStorage.removeItem(getDraftKey(collectionSlug, id, localeCode))
      // 新建保存后也清除 'new' 的草稿
      localStorage.removeItem(getDraftKey(collectionSlug, 'new', localeCode))
      setHasDraft(false)
      setLastSavedTime(null)
      lastDataRef.current = ''
      console.log('[AutoDraft] Draft cleared after save')
    }
  }, [collectionSlug, id, localeCode])

  // 初始加载时检查草稿
  useEffect(() => {
    if (!collectionSlug) return

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      const draft = checkForDraft()
      if (draft) {
        setHasDraft(true)
        setShowRestorePrompt(true)
        setDraftTimestamp(draft.timestamp)
        setDraftData(draft.data) // 保存草稿数据用于恢复
        console.log('[AutoDraft] Found existing draft from:', draft.timestamp)
      }
    }
  }, [collectionSlug, id, checkForDraft])

  // 监听表单变化并防抖保存
  useEffect(() => {
    if (!collectionSlug) return

    // 监听输入事件进行防抖保存
    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement

      // 只监听表单区域内的输入
      if (!target.closest('.collection-edit') && !target.closest('.document-drawer__content')) {
        return
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        saveDraft()
      }, DEBOUNCE_DELAY)
    }

    // 监听失焦事件立即保存
    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement

      // 只监听表单区域内的输入元素
      if (!target.closest('.collection-edit') && !target.closest('.document-drawer__content')) {
        return
      }

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // 清除防抖定时器并立即保存
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        // 延迟一点保存，确保表单状态已更新
        setTimeout(() => {
          saveDraft()
        }, 100)
      }
    }

    document.addEventListener('input', handleInput, true)
    document.addEventListener('focusout', handleBlur, true)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      document.removeEventListener('input', handleInput, true)
      document.removeEventListener('focusout', handleBlur, true)
    }
  }, [collectionSlug, id, saveDraft])

  // 监听表单保存成功事件
  useEffect(() => {
    // 监听保存按钮点击后的成功响应
    // Payload 使用 toast 通知，我们可以监听 DOM 变化或使用其他方式
    const handleSaveSuccess = () => {
      clearDraft()
    }

    // 监听页面 URL 变化（保存后可能刷新或跳转）
    const handlePopState = () => {
      clearDraft()
    }

    // 监听表单提交
    const handleSubmit = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.closest('.collection-edit') || target.closest('.document-drawer__content')) {
        // 表单提交时，稍后清除草稿（等待保存完成）
        setTimeout(() => {
          clearDraft()
        }, 2000)
      }
    }

    window.addEventListener('popstate', handlePopState)
    document.addEventListener('submit', handleSubmit, true)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('submit', handleSubmit, true)
    }
  }, [clearDraft])

  // 页面卸载前保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      saveDraft()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [saveDraft])

  if (!collectionSlug) {
    return null
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="auto-draft">
      {/* 草稿恢复提示 */}
      {showRestorePrompt && draftTimestamp && (
        <div className="auto-draft__prompt">
          <div className="auto-draft__prompt-content">
            <span className="auto-draft__prompt-icon">💾</span>
            <div className="auto-draft__prompt-text">
              <strong>{t('custom:autoDraft:foundDraft' as any) || 'Unsaved draft found'}</strong>
              <br />
              <small>{formatDateTime(draftTimestamp)}</small>
            </div>
            <div className="auto-draft__prompt-actions">
              <button
                type="button"
                className="auto-draft__btn auto-draft__btn--restore"
                onClick={restoreDraft}
              >
                {t('custom:autoDraft:restore' as any) || 'Restore'}
              </button>
              <button
                type="button"
                className="auto-draft__btn auto-draft__btn--dismiss"
                onClick={dismissDraft}
              >
                {t('custom:autoDraft:dismiss' as any) || 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 自动保存状态指示器 */}
      {lastSavedTime && !showRestorePrompt && (
        <div className="auto-draft__status">
          <span className="auto-draft__status-icon">✓</span>
          <span className="auto-draft__status-text">
            {t('custom:autoDraft:savedAt' as any) || 'Draft saved at'} {formatTime(lastSavedTime)}
          </span>
        </div>
      )}
    </div>
  )
}

export default AutoDraft
