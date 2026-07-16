'use client'

/**
 * CookieSettingsLink
 *
 * 用于 footer：点击后重新打开 Klaro 偏好面板。
 * GDPR 第 7(3) 条要求"撤回同意必须和给予同意一样简单"。
 */

import { reopenConsent } from '@/lib/consent/use-consent'

interface CookieSettingsLinkProps {
  /** 链接文案，默认英文 */
  label?: string
  className?: string
}

export function CookieSettingsLink({
  label = 'Cookie settings',
  className,
}: CookieSettingsLinkProps) {
  return (
    <button
      type="button"
      onClick={reopenConsent}
      className={className}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
      }}
    >
      {label}
    </button>
  )
}
