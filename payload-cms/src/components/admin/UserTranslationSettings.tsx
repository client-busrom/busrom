'use client'

/**
 * User Translation Settings Component
 *
 * Allows users to configure their personal translation API settings.
 * Settings are stored in localStorage (per-browser).
 * When making translation requests, settings are sent via headers.
 */

import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'busrom-translation-settings'

interface TranslationSettings {
  service: string
  apiKey: string
  apiEndpoint: string
  isEnabled: boolean
}

const defaultSettings: TranslationSettings = {
  service: 'google',
  apiKey: '',
  apiEndpoint: '',
  isEnabled: false,
}

// Helper to get settings from localStorage
export function getTranslationSettings(): TranslationSettings {
  if (typeof window === 'undefined') return defaultSettings

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to read translation settings:', e)
  }
  return defaultSettings
}

// Helper to get headers for translation requests
export function getTranslationHeaders(): Record<string, string> {
  const settings = getTranslationSettings()

  if (!settings.isEnabled || !settings.apiKey) {
    return {}
  }

  const headers: Record<string, string> = {
    'x-translation-api-key': settings.apiKey,
    'x-translation-service': settings.service,
  }

  if (settings.apiEndpoint) {
    headers['x-translation-endpoint'] = settings.apiEndpoint
  }

  return headers
}

export const UserTranslationSettings: React.FC = () => {
  const [settings, setSettings] = useState<TranslationSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saved, setSaved] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    setSettings(getTranslationSettings())
    setLoading(false)
  }, [])

  // Save settings to localStorage
  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  // Clear settings
  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY)
    setSettings(defaultSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Test connection
  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Add personal settings headers
      if (settings.apiKey) {
        headers['x-translation-api-key'] = settings.apiKey
        headers['x-translation-service'] = settings.service
        if (settings.apiEndpoint) {
          headers['x-translation-endpoint'] = settings.apiEndpoint
        }
      }

      const res = await fetch('/api/translate/test', {
        method: 'POST',
        headers,
      })

      const data = await res.json()

      setTestResult({
        success: data.success,
        message: data.success
          ? `Test successful! "${data.originalText}" -> "${data.translatedText}"`
          : data.error || 'Test failed',
      })
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Failed to test connection',
      })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          backgroundColor: 'transparent',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        ← Back
      </button>

      <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
        My Translation Settings
      </h2>

      <p style={{ marginBottom: '20px', color: '#666' }}>
        Configure your personal translation API settings. These settings are stored locally in your browser,
        so each team member can use their own API key to avoid rate limiting.
      </p>

      <div style={{
        padding: '12px 16px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #0066cc',
        borderRadius: '4px',
        marginBottom: '20px',
      }}>
        <strong>Note:</strong> Settings are stored in your browser's localStorage.
        If you clear browser data or use a different browser/device, you'll need to configure again.
      </div>

      {/* Service Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Translation Service
        </label>
        <select
          value={settings.service}
          onChange={(e) => setSettings({ ...settings, service: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="google">Google Translate</option>
          <option value="deepl">DeepL</option>
          <option value="azure">Azure Translator</option>
        </select>
      </div>

      {/* API Key */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          API Key
        </label>
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
          placeholder="Enter your API key"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
        <p style={{ marginTop: '4px', color: '#999', fontSize: '12px' }}>
          {settings.service === 'google' && 'Get your API key from Google Cloud Console'}
          {settings.service === 'deepl' && 'Get your API key from DeepL Pro account'}
          {settings.service === 'azure' && 'Get your API key from Azure Portal'}
        </p>
      </div>

      {/* Azure Endpoint (only for Azure) */}
      {settings.service === 'azure' && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Custom Endpoint (Optional)
          </label>
          <input
            type="text"
            value={settings.apiEndpoint}
            onChange={(e) => setSettings({ ...settings, apiEndpoint: e.target.value })}
            placeholder="https://api.cognitive.microsofttranslator.com"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>
      )}

      {/* Enable Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.isEnabled}
            onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
            style={{ marginRight: '8px', width: '18px', height: '18px' }}
          />
          <span style={{ fontWeight: '500' }}>Enable My Personal Settings</span>
        </label>
        <p style={{ marginTop: '4px', color: '#999', fontSize: '12px', marginLeft: '26px' }}>
          When enabled, your personal API key will be used instead of the global settings
        </p>
      </div>

      {/* Test Result */}
      {testResult && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginBottom: '20px',
          color: testResult.success ? '#155724' : '#721c24',
        }}>
          {testResult.message}
        </div>
      )}

      {/* Saved Message */}
      {saved && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '20px',
          color: '#155724',
        }}>
          Settings saved successfully!
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Save Settings
        </button>

        <button
          onClick={handleTest}
          disabled={testing || !settings.apiKey}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: (testing || !settings.apiKey) ? 'not-allowed' : 'pointer',
            opacity: (testing || !settings.apiKey) ? 0.7 : 1,
          }}
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>

        <button
          onClick={handleClear}
          style={{
            padding: '12px 24px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Clear Settings
        </button>
      </div>

      {!settings.apiKey && (
        <p style={{ marginTop: '12px', color: '#999', fontSize: '12px' }}>
          Enter your API key first to test the connection
        </p>
      )}
    </div>
  )
}

export default UserTranslationSettings
