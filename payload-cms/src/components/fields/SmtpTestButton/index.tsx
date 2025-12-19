'use client'

import React, { useState } from 'react'
import { useFormFields } from '@payloadcms/ui'

/**
 * SmtpTestButton Component
 *
 * A button to test SMTP configuration by sending a test email
 */
export const SmtpTestButton: React.FC = () => {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Get SMTP fields from form
  const smtpHost = useFormFields(([fields]) => fields.smtpHost?.value as string)
  const smtpPort = useFormFields(([fields]) => fields.smtpPort?.value as number)
  const smtpUser = useFormFields(([fields]) => fields.smtpUser?.value as string)
  const smtpPassword = useFormFields(([fields]) => fields.smtpPassword?.value as string)
  const emailFromAddress = useFormFields(([fields]) => fields.emailFromAddress?.value as string)

  const handleTest = async () => {
    if (!smtpHost || !smtpUser || !smtpPassword) {
      setResult({ success: false, message: 'Please fill in SMTP host, user, and password first' })
      return
    }

    setTesting(true)
    setResult(null)

    const port = smtpPort || 587
    // Auto-detect SSL based on port: 465 = SSL, others = STARTTLS
    const secure = port === 465

    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          smtpHost,
          smtpPort: port,
          smtpUser,
          smtpPassword,
          smtpSecure: secure,
          emailFromAddress: emailFromAddress || smtpUser,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message || 'Test email sent successfully!' })
      } else {
        setResult({ success: false, message: data.error || 'Failed to send test email' })
      }
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : 'Network error' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <button
        type="button"
        onClick={handleTest}
        disabled={testing}
        style={{
          padding: '8px 16px',
          backgroundColor: testing ? '#666' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer',
          fontSize: '14px',
        }}
      >
        {testing ? 'Sending...' : 'Send Test Email'}
      </button>

      {result && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            color: result.success ? '#155724' : '#721c24',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          {result.success ? '✓ ' : '✗ '}
          {result.message}
        </div>
      )}
    </div>
  )
}

export default SmtpTestButton
