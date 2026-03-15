'use client'

import React, { useEffect, useState } from 'react'

export const GlobalAdminBanner: React.FC = () => {
  const [bannerConfig, setBannerConfig] = useState<{
    text: string
    type: string
    show: boolean
  } | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/globals/system-settings?depth=0')
        if (response.ok) {
          const data = await response.json()
          if (data.showBanner) {
            setBannerConfig({
              text: data.adminBannerText || '',
              type: data.adminBannerType || 'info',
              show: true,
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch system settings:', error)
      }
    }

    fetchConfig()
  }, [])

  if (!bannerConfig || !bannerConfig.show || !bannerConfig.text) {
    return null
  }

  // Define colors based on type
  let bgColor = 'var(--theme-info-100, #e6f7ff)'
  let textColor = 'var(--theme-info-700, #0050b3)'
  let borderColor = 'var(--theme-info-400, #91d5ff)'

  if (bannerConfig.type === 'warning') {
    bgColor = 'var(--theme-warning-100, #fffbe6)'
    textColor = 'var(--theme-warning-700, #ad8b00)'
    borderColor = 'var(--theme-warning-400, #ffe58f)'
  } else if (bannerConfig.type === 'error') {
    bgColor = 'var(--theme-error-100, #fff1f0)'
    textColor = 'var(--theme-error-700, #a8071a)'
    borderColor = 'var(--theme-error-400, #ffa39e)'
  } else if (bannerConfig.type === 'success') {
    bgColor = 'var(--theme-success-100, #f6ffed)'
    textColor = 'var(--theme-success-700, #237804)'
    borderColor = 'var(--theme-success-400, #b7eb8f)'
  }

  return (
    <div
      style={{
        width: '100%',
        padding: '10px 20px',
        backgroundColor: bgColor,
        color: textColor,
        borderBottom: `1px solid ${borderColor}`,
        fontSize: '14px',
        fontWeight: 600,
        textAlign: 'center',
        position: 'relative',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}
    >
      <span style={{ fontSize: '18px' }}>
        {bannerConfig.type === 'warning' ? '⚠️' : bannerConfig.type === 'error' ? '🚫' : '📢'}
      </span>
      {bannerConfig.text}
    </div>
  )
}
