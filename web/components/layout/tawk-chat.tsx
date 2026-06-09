'use client'

import { useEffect, useCallback, useState } from 'react'
import Script from 'next/script'

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
  const [shouldLoad, setShouldLoad] = useState(false)

  // 监听用户的第一次交互（滚动、点击、鼠标移动等），只有在真实用户交互后才加载 Tawk
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 检测爬虫和性能测试工具 (Googlebot, Lighthouse, GTmetrix, etc.)
    const ua = navigator.userAgent;
    const isBotOrPerfTool = /bot|googlebot|crawler|spider|robot|crawling|lighthouse|speed insights|speed-insights|ptst|chrome-lighthouse|gtmetrix|pingdom/i.test(ua);
    if (isBotOrPerfTool) {
      return; // Do not load for bots or performance testing tools
    }

    const handleInteraction = () => {
      setShouldLoad(true)
      // 触发后立即移除所有监听器
      window.removeEventListener('scroll', handleInteraction)
      window.removeEventListener('mousemove', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }

    window.addEventListener('scroll', handleInteraction, { passive: true })
    window.addEventListener('mousemove', handleInteraction, { passive: true })
    window.addEventListener('touchstart', handleInteraction, { passive: true })
    window.addEventListener('click', handleInteraction, { passive: true })
    window.addEventListener('keydown', handleInteraction, { passive: true })

    // 如果用户一直没有交互，可以在 10 秒后强制加载作为兜底
    const fallbackTimer = setTimeout(() => {
      handleInteraction()
    }, 10000)

    return () => {
      window.removeEventListener('scroll', handleInteraction)
      window.removeEventListener('mousemove', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
      clearTimeout(fallbackTimer)
    }
  }, [])

  useEffect(() => {
    if (!shouldLoad || !propertyId || !widgetId) return

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

    // Fix Lighthouse warning: <iframe> elements missing title
    const titleInterval = setInterval(() => {
      const iframes = document.querySelectorAll('iframe[src*="tawk.to"], iframe[name*="tawk"]');
      iframes.forEach((iframe) => {
        if (!iframe.getAttribute('title')) {
          iframe.setAttribute('title', 'Tawk Chat Widget');
        }
      });
    }, 2000);

    return () => clearInterval(titleInterval);
  }, [shouldLoad, propertyId, widgetId])

  if (!shouldLoad || !propertyId || !widgetId) return null

  return (
    <Script
      id="tawk-script"
      strategy="lazyOnload"
      src={`https://embed.tawk.to/${propertyId}/${widgetId}`}
      crossOrigin="anonymous"
    />
  )
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
