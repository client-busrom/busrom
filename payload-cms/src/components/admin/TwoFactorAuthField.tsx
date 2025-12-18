'use client'

/**
 * Two-Factor Authentication Field Component
 *
 * A custom field component that allows users to manage their 2FA settings.
 * - Enable/disable 2FA
 * - View QR code for setup
 * - View and regenerate backup codes
 */

import React, { useEffect, useState, useCallback } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

interface TwoFactorAuthFieldProps {
  path: string
}

type Step = 'idle' | 'setup' | 'verify' | 'backup-codes' | 'disable'

export const TwoFactorAuthField: React.FC<TwoFactorAuthFieldProps> = () => {
  const { id } = useDocumentInfo()

  const [step, setStep] = useState<Step>('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 2FA Status
  const [isEnabled, setIsEnabled] = useState(false)
  const [backupCodesCount, setBackupCodesCount] = useState(0)

  // Setup data
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verifyToken, setVerifyToken] = useState('')

  // Backup codes
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  // Disable 2FA
  const [disableToken, setDisableToken] = useState('')
  const [disableBackupCode, setDisableBackupCode] = useState('')

  // Regenerate backup codes
  const [regenerateToken, setRegenerateToken] = useState('')

  // Fetch 2FA status on mount
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/2fa/status', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setIsEnabled(data.enabled)
        setBackupCodesCount(data.backupCodesCount)
      }
    } catch (err) {
      console.error('Failed to fetch 2FA status:', err)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchStatus()
    }
  }, [id, fetchStatus])

  // Start 2FA setup
  const startSetup = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/2fa/setup', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start 2FA setup')
      }

      setQrCode(data.qrCode)
      setSecret(data.secret)
      setStep('setup')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start 2FA setup')
    } finally {
      setLoading(false)
    }
  }

  // Verify and enable 2FA
  const enableTwoFactor = async () => {
    if (!verifyToken || !secret) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/2fa/enable', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, token: verifyToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable 2FA')
      }

      setBackupCodes(data.backupCodes)
      setIsEnabled(true)
      setBackupCodesCount(data.backupCodes.length)
      setStep('backup-codes')
      setSuccess('2FA has been enabled successfully!')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to enable 2FA')
    } finally {
      setLoading(false)
    }
  }

  // Disable 2FA
  const disableTwoFactor = async () => {
    if (!disableToken && !disableBackupCode) {
      setError('Please enter a token or backup code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: disableToken || undefined,
          backupCode: disableBackupCode || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA')
      }

      setIsEnabled(false)
      setBackupCodesCount(0)
      setStep('idle')
      setDisableToken('')
      setDisableBackupCode('')
      setSuccess('2FA has been disabled successfully!')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  // Regenerate backup codes
  const regenerateBackupCodes = async () => {
    if (!regenerateToken) {
      setError('Please enter your 2FA token')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/2fa/regenerate-backup-codes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: regenerateToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate backup codes')
      }

      setBackupCodes(data.backupCodes)
      setBackupCodesCount(data.backupCodes.length)
      setRegenerateToken('')
      setSuccess('New backup codes generated!')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate backup codes')
    } finally {
      setLoading(false)
    }
  }

  // Copy backup codes to clipboard
  const copyBackupCodes = () => {
    const text = backupCodes.join('\n')
    navigator.clipboard.writeText(text)
    setSuccess('Backup codes copied to clipboard!')
  }

  // Render based on current step
  const renderContent = () => {
    // Show backup codes after enabling
    if (step === 'backup-codes' && backupCodes.length > 0) {
      return (
        <div style={styles.section}>
          <h4 style={styles.heading}>Backup Codes | 备用恢复码</h4>
          <p style={styles.description}>
            Save these codes in a safe place. Each code can only be used once.
            <br />
            请将这些代码保存在安全的地方。每个代码只能使用一次。
          </p>
          <div style={styles.codesGrid}>
            {backupCodes.map((code, index) => (
              <code key={index} style={styles.code}>{code}</code>
            ))}
          </div>
          <div style={styles.buttonGroup}>
            <button type="button" onClick={copyBackupCodes} style={styles.secondaryButton}>
              Copy Codes | 复制代码
            </button>
            <button type="button" onClick={() => { setStep('idle'); setBackupCodes([]) }} style={styles.primaryButton}>
              Done | 完成
            </button>
          </div>
        </div>
      )
    }

    // Setup step - show QR code
    if (step === 'setup') {
      return (
        <div style={styles.section}>
          <h4 style={styles.heading}>Set Up 2FA | 设置双因素认证</h4>
          <p style={styles.description}>
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            <br />
            使用您的身份验证器应用扫描此二维码
          </p>

          {qrCode && (
            <div style={styles.qrContainer}>
              <img src={qrCode} alt="2FA QR Code" style={styles.qrCode} />
            </div>
          )}

          {secret && (
            <div style={styles.secretContainer}>
              <p style={styles.secretLabel}>Manual entry code | 手动输入代码:</p>
              <code style={styles.secretCode}>{secret}</code>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Enter 6-digit code | 输入6位验证码:
            </label>
            <input
              type="text"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              style={styles.input}
              maxLength={6}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => setStep('idle')} style={styles.secondaryButton}>
              Cancel | 取消
            </button>
            <button
              type="button"
              onClick={enableTwoFactor}
              disabled={loading || verifyToken.length !== 6}
              style={styles.primaryButton}
            >
              {loading ? 'Verifying...' : 'Enable 2FA | 启用'}
            </button>
          </div>
        </div>
      )
    }

    // Disable step
    if (step === 'disable') {
      return (
        <div style={styles.section}>
          <h4 style={styles.heading}>Disable 2FA | 禁用双因素认证</h4>
          <p style={styles.description}>
            Enter your current 2FA token or a backup code to disable 2FA.
            <br />
            输入您当前的2FA验证码或备用恢复码来禁用双因素认证。
          </p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>2FA Token | 验证码:</label>
            <input
              type="text"
              value={disableToken}
              onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              style={styles.input}
              maxLength={6}
            />
          </div>

          <p style={styles.orDivider}>— OR | 或者 —</p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Backup Code | 备用恢复码:</label>
            <input
              type="text"
              value={disableBackupCode}
              onChange={(e) => setDisableBackupCode(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
              style={styles.input}
              maxLength={8}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => setStep('idle')} style={styles.secondaryButton}>
              Cancel | 取消
            </button>
            <button
              type="button"
              onClick={disableTwoFactor}
              disabled={loading || (!disableToken && !disableBackupCode)}
              style={styles.dangerButton}
            >
              {loading ? 'Disabling...' : 'Disable 2FA | 禁用'}
            </button>
          </div>
        </div>
      )
    }

    // Idle state - show status and actions
    return (
      <div style={styles.section}>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>Status | 状态:</span>
          <span style={isEnabled ? styles.statusEnabled : styles.statusDisabled}>
            {isEnabled ? '✓ Enabled | 已启用' : '✗ Disabled | 未启用'}
          </span>
        </div>

        {isEnabled && (
          <div style={styles.statusRow}>
            <span style={styles.statusLabel}>Backup Codes | 备用恢复码:</span>
            <span style={styles.statusValue}>{backupCodesCount} remaining | 剩余</span>
          </div>
        )}

        <div style={styles.buttonGroup}>
          {!isEnabled ? (
            <button type="button" onClick={startSetup} disabled={loading} style={styles.primaryButton}>
              {loading ? 'Loading...' : 'Enable 2FA | 启用双因素认证'}
            </button>
          ) : (
            <>
              <button type="button" onClick={() => setStep('disable')} style={styles.dangerButton}>
                Disable 2FA | 禁用
              </button>
              <button
                type="button"
                onClick={() => {
                  setBackupCodes([])
                  setRegenerateToken('')
                }}
                style={styles.secondaryButton}
              >
                Regenerate Codes | 重新生成备用码
              </button>
            </>
          )}
        </div>

        {/* Regenerate backup codes inline */}
        {isEnabled && backupCodes.length === 0 && step === 'idle' && (
          <div style={styles.regenerateSection}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Enter 2FA token to regenerate backup codes | 输入验证码以重新生成备用码:
              </label>
              <input
                type="text"
                value={regenerateToken}
                onChange={(e) => setRegenerateToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                style={styles.input}
                maxLength={6}
              />
              <button
                type="button"
                onClick={regenerateBackupCodes}
                disabled={loading || regenerateToken.length !== 6}
                style={{ ...styles.primaryButton, marginTop: '8px' }}
              >
                {loading ? 'Generating...' : 'Generate | 生成'}
              </button>
            </div>
          </div>
        )}

        {/* Show regenerated backup codes */}
        {isEnabled && backupCodes.length > 0 && (
          <div style={styles.regenerateSection}>
            <h5 style={styles.subHeading}>New Backup Codes | 新的备用恢复码:</h5>
            <div style={styles.codesGrid}>
              {backupCodes.map((code, index) => (
                <code key={index} style={styles.code}>{code}</code>
              ))}
            </div>
            <button type="button" onClick={copyBackupCodes} style={styles.secondaryButton}>
              Copy Codes | 复制代码
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Two-Factor Authentication | 双因素认证</h3>
        <p style={styles.subtitle}>
          Add an extra layer of security to your account
          <br />
          为您的账户添加额外的安全保护
        </p>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {success && (
        <div style={styles.successMessage}>
          {success}
        </div>
      )}

      {renderContent()}
    </div>
  )
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    background: 'var(--theme-elevation-50)',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  header: {
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--theme-elevation-150)',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 600,
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: 'var(--theme-elevation-500)',
    lineHeight: 1.5,
  },
  section: {
    marginTop: '16px',
  },
  heading: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 500,
  },
  subHeading: {
    margin: '16px 0 8px 0',
    fontSize: '14px',
    fontWeight: 500,
  },
  description: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: 'var(--theme-elevation-500)',
    lineHeight: 1.5,
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    gap: '12px',
  },
  statusLabel: {
    fontSize: '14px',
    color: 'var(--theme-elevation-500)',
  },
  statusValue: {
    fontSize: '14px',
  },
  statusEnabled: {
    color: 'var(--theme-success-500)',
    fontWeight: 500,
  },
  statusDisabled: {
    color: 'var(--theme-elevation-400)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    flexWrap: 'wrap' as const,
  },
  primaryButton: {
    padding: '10px 20px',
    background: 'var(--theme-elevation-800)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  secondaryButton: {
    padding: '10px 20px',
    background: 'var(--theme-elevation-100)',
    color: 'var(--theme-elevation-800)',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  dangerButton: {
    padding: '10px 20px',
    background: 'var(--theme-error-500)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  qrContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  qrCode: {
    maxWidth: '200px',
  },
  secretContainer: {
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  secretLabel: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    marginBottom: '4px',
  },
  secretCode: {
    fontSize: '14px',
    padding: '8px 16px',
    background: 'var(--theme-elevation-100)',
    borderRadius: '4px',
    fontFamily: 'monospace',
    wordBreak: 'break-all' as const,
  },
  inputGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    maxWidth: '200px',
    padding: '10px 12px',
    fontSize: '16px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '4px',
    letterSpacing: '2px',
  },
  orDivider: {
    textAlign: 'center' as const,
    color: 'var(--theme-elevation-400)',
    margin: '16px 0',
    fontSize: '12px',
  },
  codesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '8px',
    marginBottom: '16px',
  },
  code: {
    padding: '8px 12px',
    background: 'var(--theme-elevation-100)',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '14px',
    textAlign: 'center' as const,
  },
  regenerateSection: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid var(--theme-elevation-150)',
  },
  errorMessage: {
    padding: '12px 16px',
    background: 'var(--theme-error-50)',
    border: '1px solid var(--theme-error-200)',
    borderRadius: '4px',
    color: 'var(--theme-error-600)',
    marginBottom: '16px',
    fontSize: '14px',
  },
  successMessage: {
    padding: '12px 16px',
    background: 'var(--theme-success-50)',
    border: '1px solid var(--theme-success-200)',
    borderRadius: '4px',
    color: 'var(--theme-success-600)',
    marginBottom: '16px',
    fontSize: '14px',
  },
}

export default TwoFactorAuthField
