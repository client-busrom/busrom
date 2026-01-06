'use client'

/**
 * Script Debugger Component
 *
 * Shows which custom scripts are loaded on the current page.
 * Only visible when:
 * - URL contains ?_debug_scripts=true
 * - AND user has valid debug token (cookie set by CMS login)
 *
 * Security: Requires authentication via debug token to prevent
 * unauthorized access by regular visitors.
 *
 * Usage:
 * 1. Login to CMS first (sets the debug cookie)
 * 2. In CMS, click the "Preview URL" link in the script's sidebar
 * 3. The debugger panel will appear at bottom-right corner
 */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// Debug token secret - must match the one in CMS
// In production, this should be set via environment variable
const DEBUG_TOKEN_SECRET = process.env.NEXT_PUBLIC_DEBUG_TOKEN_SECRET || 'busrom-script-debug-2024'

interface LoadedScript {
  id: string
  name: string
  position: string
  scope: string
  status: 'loaded' | 'error' | 'blocked'
  template?: string
}

/**
 * Check if user has valid debug authorization
 * Options:
 * 1. Valid debug token in URL (?_debug_token=xxx)
 * 2. Debug cookie set (from CMS session)
 */
function hasDebugAuthorization(searchParams: URLSearchParams): boolean {
  // Option 1: Check URL token
  const urlToken = searchParams.get('_debug_token')
  if (urlToken === DEBUG_TOKEN_SECRET) {
    return true
  }

  // Option 2: Check cookie (set when logged into CMS)
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';')
    const debugCookie = cookies.find(c => c.trim().startsWith('_busrom_debug='))
    if (debugCookie) {
      const cookieValue = debugCookie.split('=')[1]?.trim()
      if (cookieValue === DEBUG_TOKEN_SECRET) {
        return true
      }
    }
  }

  return false
}

export function ScriptDebugger() {
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)
  const [scripts, setScripts] = useState<LoadedScript[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    const debugParam = searchParams.get('_debug_scripts')

    if (debugParam === 'true') {
      // Check authorization
      if (!hasDebugAuthorization(searchParams)) {
        setUnauthorized(true)
        // Hide unauthorized message after 3 seconds
        setTimeout(() => setUnauthorized(false), 3000)
        return
      }

      setIsVisible(true)

      // Fetch loaded scripts info from window object (set by GlobalScripts)
      const checkScripts = () => {
        const loadedScripts = (window as unknown as { __LOADED_SCRIPTS__?: LoadedScript[] }).__LOADED_SCRIPTS__ || []
        setScripts(loadedScripts)
      }

      // Check immediately and then periodically
      checkScripts()
      const interval = setInterval(checkScripts, 2000)

      return () => clearInterval(interval)
    }
  }, [searchParams])

  // Show brief unauthorized message
  if (unauthorized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99999,
          backgroundColor: 'rgba(244, 67, 54, 0.9)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          fontSize: '14px',
        }}
      >
        Debug mode requires authorization
      </div>
    )
  }

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: isMinimized ? '200px' : '400px',
        maxHeight: isMinimized ? '40px' : '300px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 15px',
          backgroundColor: '#333',
          borderBottom: '1px solid #444',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <span style={{ fontWeight: 'bold' }}>
          Script Debugger {scripts.length > 0 && `(${scripts.length})`}
        </span>
        <span>{isMinimized ? '+' : '-'}</span>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div style={{ padding: '10px 15px', overflowY: 'auto', maxHeight: '240px' }}>
          {scripts.length === 0 ? (
            <div style={{ color: '#888' }}>
              No custom scripts loaded on this page.
              <br />
              <br />
              <small>
                Tip: Add scripts in CMS &gt; Custom Scripts
              </small>
            </div>
          ) : (
            <div>
              {scripts.map((script, index) => (
                <div
                  key={script.id || index}
                  style={{
                    marginBottom: '10px',
                    padding: '8px',
                    backgroundColor: '#222',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${
                      script.status === 'loaded' ? '#4caf50' :
                      script.status === 'blocked' ? '#ff9800' :
                      '#f44336'
                    }`,
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {script.name || 'Unnamed Script'}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '11px' }}>
                    <div>Position: {script.position}</div>
                    <div>Scope: {script.scope}</div>
                    {script.template && <div>Template: {script.template}</div>}
                    <div style={{
                      color: script.status === 'loaded' ? '#4caf50' :
                             script.status === 'blocked' ? '#ff9800' :
                             '#f44336',
                      fontWeight: 'bold',
                      marginTop: '4px',
                    }}>
                      Status: {script.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Help text */}
          <div style={{
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid #333',
            color: '#666',
            fontSize: '10px',
          }}>
            Open browser DevTools &gt; Network to verify script loading.
            <br />
            Check Console for any script errors.
          </div>
        </div>
      )}
    </div>
  )
}
