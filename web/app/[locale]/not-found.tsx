"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { defaultLocale, locales } from '@/i18n.config'

export default function NotFound() {
  const pathname = usePathname()
  
  // Simple locale detection from pathname
  const segments = pathname.split('/')
  const pathLocale = segments[1]
  const locale = locales.includes(pathLocale as any) ? pathLocale : defaultLocale

  // Fallback translations since we can't easily use the async getMessages in a synchronous render
  // and we want the 404 page to be extremely robust.
  const translations: Record<string, any> = {
    en: {
      title: "Page Not Found",
      description: "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.",
      backHome: "Back to Home",
      viewProducts: "View Products",
      home: "Home",
      about: "About Us",
      contact: "Contact"
    },
    zh: {
      title: "页面未找到",
      description: "您查找的页面可能已被删除、更名或暂时不可用。",
      backHome: "返回首页",
      viewProducts: "查看产品",
      home: "首页",
      about: "关于我们",
      contact: "联系我们"
    }
  }

  const t = translations[locale] || translations[defaultLocale]
  
  // Dynamic message loading state
  const [messages, setMessages] = useState<any>(null)

  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Dynamic import of localized messages
        const msg = (await import(`@/messages/${locale}.json`)).default
        setMessages(msg?.notFound)
      } catch (error) {
        console.error('Failed to load messages for 404 page:', error)
      }
    }
    loadMessages()
  }, [locale])

  // Get translated strings with safe fallbacks
  const title = messages?.title || t.title
  const description = messages?.description || t.description
  const backHome = messages?.backHome || t.backHome
  const viewProducts = messages?.viewProducts || t.viewProducts
  const homeLabel = messages?.home || t.home
  const aboutLabel = messages?.about || t.about
  const contactLabel = messages?.contact || t.contact

  return (
    <div className="min-h-screen bg-brand-main flex items-center justify-center px-6 pt-20 pb-12 overflow-hidden relative" data-header-theme="dark">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] bg-brand-secondary/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Large 404 Text */}
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-anaheim font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-brand-accent-gold to-brand-accent-gold/40 opacity-20 select-none">
            404
          </h1>
          <div className="h-1 w-20 bg-brand-accent-gold mx-auto -mt-6 md:-mt-10 mb-8" />
        </div>

        {/* Content */}
        <h2 className="text-3xl md:text-5xl font-anaheim font-extrabold text-brand-text-black mb-6 uppercase tracking-tighter">
          {title}
        </h2>
        
        <p className="text-brand-text-main text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href={`/${locale}`}
            className="w-full sm:w-auto px-10 py-4 bg-brand-text-black text-white font-anaheim font-bold text-sm uppercase tracking-wider hover:bg-brand-accent-gold transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            {backHome}
          </Link>
          
          <Link
            href={`/${locale}/products`}
            className="w-full sm:w-auto px-10 py-4 bg-transparent border-2 border-brand-text-black text-brand-text-black font-anaheim font-bold text-sm uppercase tracking-wider hover:bg-brand-text-black hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            {viewProducts}
          </Link>
        </div>

      </div>

      {/* Aesthetic Accents */}
      <div className="absolute bottom-10 left-10 hidden lg:block opacity-20">
        <div className="w-px h-20 bg-brand-accent-gold mb-4" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-brand-accent-gold [writing-mode:vertical-rl]">
          Premium Quality
        </span>
      </div>
      
      <div className="absolute top-10 right-10 hidden lg:block opacity-20">
        <span className="text-[10px] uppercase tracking-[0.3em] text-brand-accent-gold [writing-mode:vertical-rl] mb-4">
          Stainless Steel Hardware
        </span>
        <div className="w-px h-20 bg-brand-accent-gold" />
      </div>
    </div>
  )
}
