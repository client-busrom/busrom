'use client'

import React, { useState } from 'react'
import { useFormFields, useTranslation } from '@payloadcms/ui'

const i18n = {
  maintenanceTitle: { en: 'Cache Management Actions', zh: '缓存管理操作' },
  maintenanceDesc: { en: 'Use these actions to clear caches after significant content updates.', zh: '在进行重大内容更新后，使用这些操作清除缓存。' },
  clearCdn: { en: 'Invalidate CloudFront CDN', zh: '刷新 CloudFront CDN 缓存' },
  revalidateFrontend: { en: 'Revalidate Frontend Pages', zh: '重新验证前端页面' },
  clearing: { en: 'Processing...', zh: '处理中...' },
  success: { en: 'Action successful!', zh: '操作成功！' },
  failed: { en: 'Action failed', zh: '操作失败' },
  missingConfig: { en: 'Please fill in the required configuration fields first.', zh: '请先填写必要的配置字段。' },
  confirmCdn: { en: 'Are you sure you want to invalidate ALL CloudFront cache? This may increase origin load temporarily.', zh: '确定要刷新所有 CloudFront 缓存吗？这可能会暂时增加源站负载。' },
}

export const MaintenancePanel: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const { i18n: { language } } = useTranslation()
  const t = (obj: { en: string; zh: string }) => language === 'zh' ? obj.zh : obj.en

  // Get field values from form
  const distributionId = useFormFields(([fields]) => fields.cloudfrontDistributionId?.value as string)
  const frontendUrl = useFormFields(([fields]) => fields.frontendUrl?.value as string)
  const revalidateSecret = useFormFields(([fields]) => fields.revalidateSecret?.value as string)

  const handleCdnInvalidation = async () => {
    if (!distributionId) {
      setResult({ success: false, message: t(i18n.missingConfig) })
      return
    }

    if (!confirm(t(i18n.confirmCdn))) return

    setLoading('cdn')
    setResult(null)

    try {
      const response = await fetch('/api/maintenance/invalidate-cdn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distributionId }),
      })

      const data = await response.json()
      if (response.ok) {
        setResult({ success: true, message: data.message || t(i18n.success) })
      } else {
        setResult({ success: false, message: data.error || t(i18n.failed) })
      }
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : 'Error' })
    } finally {
      setLoading(null)
    }
  }

  const handleFrontendRevalidation = async () => {
    if (!frontendUrl || !revalidateSecret) {
      setResult({ success: false, message: t(i18n.missingConfig) })
      return
    }

    setLoading('revalidate')
    setResult(null)

    try {
      const response = await fetch('/api/maintenance/revalidate-frontend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frontendUrl, revalidateSecret }),
      })

      const data = await response.json()
      if (response.ok) {
        setResult({ success: true, message: data.message || t(i18n.success) })
      } else {
        setResult({ success: false, message: data.error || t(i18n.failed) })
      }
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : 'Error' })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ 
      marginTop: '24px', 
      padding: '24px', 
      border: '1px solid var(--theme-elevation-150)', 
      borderRadius: '8px',
      backgroundColor: 'var(--theme-elevation-50)'
    }}>
      <h4 style={{ margin: '0 0 8px 0' }}>{t(i18n.maintenanceTitle)}</h4>
      <p style={{ fontSize: '14px', opacity: 0.7, margin: '0 0 20px 0' }}>{t(i18n.maintenanceDesc)}</p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleCdnInvalidation}
          disabled={!!loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading === 'cdn' ? '#666' : '#222',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !!loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {loading === 'cdn' ? t(i18n.clearing) : t(i18n.clearCdn)}
        </button>

        <button
          type="button"
          onClick={handleFrontendRevalidation}
          disabled={!!loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading === 'revalidate' ? '#666' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !!loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {loading === 'revalidate' ? t(i18n.clearing) : t(i18n.revalidateFrontend)}
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px 16px',
            borderRadius: '4px',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            color: result.success ? '#155724' : '#721c24',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: '14px'
          }}
        >
          {result.success ? '✓ ' : '✗ '}
          {result.message}
        </div>
      )}
    </div>
  )
}

export default MaintenancePanel
