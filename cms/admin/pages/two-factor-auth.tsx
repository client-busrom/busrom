/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Heading, Box, Stack, Text } from '@keystone-ui/core'
import { Button } from '@keystone-ui/button'
import { PageContainer } from '@keystone-6/core/admin-ui/components'
import { useState } from 'react'

export default function TwoFactorAuthPage() {
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [token, setToken] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  // Check 2FA status on load
  useState(() => {
    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            authenticatedItem {
              ... on User {
                twoFactorEnabled
              }
            }
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.authenticatedItem?.twoFactorEnabled) {
          setIs2FAEnabled(true)
        }
      })
      .catch((err) => console.error('Failed to check 2FA status:', err))
  })

  const setupTwoFactor = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to set up 2FA (设置2FA失败)' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error (网络错误)' })
    } finally {
      setLoading(false)
    }
  }

  const enableTwoFactor = async () => {
    if (!secret || !token) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit code (请输入6位数字代码)' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ secret, token }),
      })

      const data = await response.json()

      if (response.ok) {
        setBackupCodes(data.backupCodes)
        setMessage({ type: 'success', text: data.message })
        setIs2FAEnabled(true)
        setQrCode(null)
        setSecret(null)
        setToken('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to enable 2FA (启用2FA失败)' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error (网络错误)' })
    } finally {
      setLoading(false)
    }
  }

  const disableTwoFactor = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will reduce your account security.\n\n确定要禁用双因素认证吗？这将降低您的账户安全性。')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: 'placeholder' }), // TODO: Implement proper password verification
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setIs2FAEnabled(false)
        setBackupCodes(null)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to disable 2FA (禁用2FA失败)' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error (网络错误)' })
    } finally {
      setLoading(false)
    }
  }

  const regenerateBackupCodes = async () => {
    const token = prompt('Enter your current 2FA code to regenerate backup codes:\n输入您当前的2FA代码以重新生成备份码：')
    if (!token) return

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/2fa/regenerate-backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setBackupCodes(data.backupCodes)
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to regenerate backup codes (重新生成备份码失败)' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error (网络错误)' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer header={<Heading type="h3">Two-Factor Authentication (双因素认证)</Heading>}>
      <Stack gap="large">
        {message && (
          <Box
            padding="medium"
            rounding="medium"
            css={{
              backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            }}
          >
            {message.text}
          </Box>
        )}

        {!is2FAEnabled && !qrCode && (
          <Box>
            <Text>
              <strong>Two-factor authentication (双因素认证)</strong> adds an extra layer of security to your account.
              When enabled, you'll need to enter a code from your authenticator app in addition to your password when logging in.
            </Text>
            <Text css={{ marginTop: '12px', color: '#666' }}>
              启用后，登录时除了密码外，您还需要输入来自身份验证器应用的代码，为您的账户增加额外的安全保护层。
            </Text>
            <Box marginTop="medium">
              <Button isLoading={loading} onClick={setupTwoFactor}>
                Set up 2FA (设置双因素认证)
              </Button>
            </Box>
          </Box>
        )}

        {qrCode && (
          <Box>
            <Heading type="h4">Scan this QR code (扫描此二维码)</Heading>
            <Text>Use Google Authenticator, Authy, or any other TOTP-compatible app.</Text>
            <Text css={{ color: '#666', fontSize: '14px' }}>使用 Google Authenticator、Authy 或任何其他 TOTP 兼容应用。</Text>
            <Box marginTop="medium">
              <img src={qrCode} alt="2FA QR Code" style={{ maxWidth: '300px' }} />
            </Box>

            {secret && (
              <Box marginTop="medium">
                <Text weight="bold">Or enter this code manually (或手动输入此代码):</Text>
                <Text
                  css={{
                    fontFamily: 'monospace',
                    backgroundColor: '#f5f5f5',
                    padding: '8px',
                    marginTop: '8px',
                    borderRadius: '4px',
                  }}
                >
                  {secret}
                </Text>
              </Box>
            )}

            <Box marginTop="large">
              <Heading type="h5">Verify your setup (验证设置)</Heading>
              <Text>Enter the 6-digit code from your authenticator app (输入验证器应用中的6位数字代码):</Text>
              <Box marginTop="small">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  style={{
                    padding: '8px',
                    fontSize: '16px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    width: '150px',
                  }}
                />
              </Box>
              <Box marginTop="medium">
                <Button isLoading={loading} onClick={enableTwoFactor} tone="active">
                  Enable 2FA (启用双因素认证)
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {is2FAEnabled && (
          <Box>
            <Box
              padding="medium"
              rounding="medium"
              css={{
                backgroundColor: '#d4edda',
                color: '#155724',
                border: '1px solid #c3e6cb',
              }}
            >
              <Text weight="bold">✓ Two-Factor Authentication is enabled (双因素认证已启用)</Text>
            </Box>

            <Box marginTop="large">
              <Button onClick={regenerateBackupCodes} isLoading={loading}>
                Regenerate Backup Codes (重新生成备份码)
              </Button>
              <Box marginTop="small">
                <Button onClick={disableTwoFactor} isLoading={loading} tone="negative">
                  Disable 2FA (禁用双因素认证)
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {backupCodes && backupCodes.length > 0 && (
          <Box
            padding="medium"
            rounding="medium"
            css={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
            }}
          >
            <Heading type="h5">⚠️ Save These Backup Codes (保存这些备份码)</Heading>
            <Text>
              <strong>Store these codes in a safe place.</strong> Each code can only be used once to log in if you lose access to your
              authenticator app.
            </Text>
            <Text css={{ marginTop: '8px', color: '#856404', fontSize: '14px' }}>
              请将这些代码保存在安全的地方。如果您无法访问身份验证器应用，每个代码只能使用一次来登录。
            </Text>
            <Box
              marginTop="medium"
              css={{
                fontFamily: 'monospace',
                backgroundColor: '#ffffff',
                padding: '16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              {backupCodes.map((code, index) => (
                <div key={index}>{code}</div>
              ))}
            </Box>
            <Box marginTop="medium">
              <Button
                onClick={() => {
                  const text = backupCodes.join('\n')
                  navigator.clipboard.writeText(text)
                  setMessage({ type: 'success', text: 'Backup codes copied to clipboard (备份码已复制到剪贴板)' })
                }}
              >
                Copy to Clipboard (复制到剪贴板)
              </Button>
            </Box>
          </Box>
        )}
      </Stack>
    </PageContainer>
  )
}
