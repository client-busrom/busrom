'use client'

import React, { useState, useCallback } from 'react'
import { useDocumentInfo, useTranslation } from '@payloadcms/ui'
import './styles.scss'

export const GoogleIndexingButton: React.FC = () => {
  const { id, collectionSlug, docConfig } = useDocumentInfo()
  const { i18n } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const isZh = i18n?.language === 'zh'

  const handleNotify = useCallback(async () => {
    if (!id || !collectionSlug) return

    setStatus('loading')
    setMessage(isZh ? '正在通知 Google...' : 'Notifying Google...')

    try {
      const res = await fetch(`/api/${collectionSlug}/${id}/notify-google`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(isZh ? '已提交到 Google 实时收录' : 'Successfully notified Google')
      } else {
        setStatus('error')
        setMessage(data.error || (isZh ? '提交失败' : 'Failed to notify Google'))
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
  if (!collectionSlug || !['blogs', 'products', 'product-series', 'pages'].includes(collectionSlug as string) || !id) return null

  return (
    <div className="google-indexing-field">
      <button
        type="button"
        className={`google-indexing-btn status-${status}`}
        onClick={handleNotify}
        disabled={status === 'loading'}
      >
        <span className="icon">🚀</span>
        {status === 'loading' 
          ? (isZh ? '处理中...' : 'Processing...') 
          : (isZh ? '手动提交 Google 收录' : 'Manual Index to Google')}
      </button>
      {message && (
        <div className={`google-indexing-msg msg-${status}`}>
          {message}
        </div>
      )}
    </div>
  )
}

export default GoogleIndexingButton
