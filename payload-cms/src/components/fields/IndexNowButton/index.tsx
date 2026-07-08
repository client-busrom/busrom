'use client'

import React, { useState, useCallback } from 'react'
import { useDocumentInfo, useTranslation } from '@payloadcms/ui'
import './styles.scss'

export const IndexNowButton: React.FC = () => {
  const { id, collectionSlug } = useDocumentInfo()
  const { i18n } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const isZh = i18n?.language === 'zh'

  const handleNotify = useCallback(async () => {
    if (!id || !collectionSlug) return

    setStatus('loading')
    setMessage(isZh ? '正在通知 IndexNow...' : 'Notifying IndexNow...')

    try {
      const res = await fetch(`/api/${collectionSlug}/${id}/notify-indexnow`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(isZh ? '已提交到 IndexNow 收录' : 'Successfully notified IndexNow')
      } else {
        setStatus('error')
        setMessage(data.error || (isZh ? '提交失败' : 'Failed to notify IndexNow'))
      }
    } catch (e: any) {
      setStatus('error')
      setMessage(e.message)
    } finally {
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    }
  }, [id, collectionSlug, isZh])

  // Only show for supported collections and when doc is saved
  if (
    !collectionSlug ||
    !['blogs', 'products', 'product-series', 'pages'].includes(collectionSlug as string) ||
    !id
  ) {
    return null
  }

  return (
    <div className="indexnow-field">
      <button
        type="button"
        className={`indexnow-btn status-${status}`}
        onClick={handleNotify}
        disabled={status === 'loading'}
      >
        <span className="icon">🔍</span>
        {status === 'loading'
          ? isZh
            ? '处理中...'
            : 'Processing...'
          : isZh
            ? '手动提交 IndexNow 收录'
            : 'Manual Index to IndexNow'}
      </button>
      {message && <div className={`indexnow-msg msg-${status}`}>{message}</div>}
    </div>
  )
}

export default IndexNowButton
