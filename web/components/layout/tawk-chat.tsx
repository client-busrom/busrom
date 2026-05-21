'use client'

import { useEffect, useCallback, useState } from 'react'

interface TawkChatProps {
  propertyId?: string
  widgetId?: string
}

declare global {
  interface Window {
    Tawk_API: any
    Tawk_LoadStart: Date
  }
}

export function TawkChat({ propertyId, widgetId }: TawkChatProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    console.log('[TawkChat] Effect triggered:', { isClient, propertyId, widgetId })
    if (!isClient || !propertyId || !widgetId) {
      console.log('[TawkChat] Missing props, skipping')
      return
    }

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="${propertyId}"]`)
    if (existingScript) {
      console.log('[TawkChat] Script already exists')
      return
    }

    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()

    // Configure widget position (bottom-left)
    window.Tawk_API.customStyle = {
      visibility: {
        desktop: {
          position: 'bl',
          xOffset: '20px',
          yOffset: '20px'
        },
        mobile: {
          position: 'bl',
          xOffset: '10px',
          yOffset: '10px'
        }
      }
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')

    console.log('[TawkChat] Loading script:', script.src)

    const firstScript = document.getElementsByTagName('script')[0]
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    } else {
      document.head.appendChild(script)
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [isClient, propertyId, widgetId])

  return null
}

export function useTawkChat() {
  const openChat = useCallback(() => {
    if (typeof window !== 'undefined' && window.Tawk_API) {
      window.Tawk_API.maximize?.()
    }
  }, [])

  const closeChat = useCallback(() => {
    if (typeof window !== 'undefined' && window.Tawk_API) {
      window.Tawk_API.minimize?.()
    }
  }, [])

  return { openChat, closeChat }
}

export default TawkChat
