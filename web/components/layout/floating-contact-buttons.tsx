'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { IconifyIcon } from '@/components/ui/IconifyIcon'
import type { ContactPopupData } from '@/lib/api/contact-popup'

interface FloatingContactButtonsProps {
  data: ContactPopupData | null
}

export function FloatingContactButtons({ data }: FloatingContactButtonsProps) {
  const getWhatsAppOption = useCallback(() => {
    return data?.options.find((opt) => opt.linkType === 'phone')
  }, [data])

  const getEmailOption = useCallback(() => {
    return data?.options.find((opt) => opt.linkType === 'email')
  }, [data])

  const whatsapp = getWhatsAppOption()
  const email = getEmailOption()

  if (!whatsapp && !email) return null

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-3">
      {whatsapp?.linkUrl && (
        <a
          href={`https://wa.me/${whatsapp.linkUrl.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group flex items-center justify-center w-12 h-12 rounded-full',
            'bg-brand-secondary shadow-lg',
            'transition-all duration-300 ease-out',
            'hover:scale-110 hover:shadow-xl',
            'active:scale-95'
          )}
          title={whatsapp.title || 'WhatsApp'}
        >
          <IconifyIcon
            name="mdi:whatsapp"
            size={24}
            color="white"
            className="transition-transform duration-300 group-hover:rotate-12"
          />
        </a>
      )}

      {email?.linkUrl && (
        <a
          href={email.linkUrl.startsWith('mailto:') ? email.linkUrl : `mailto:${email.linkUrl}`}
          className={cn(
            'group flex items-center justify-center w-12 h-12 rounded-full',
            'bg-brand-secondary shadow-lg',
            'transition-all duration-300 ease-out',
            'hover:scale-110 hover:shadow-xl',
            'active:scale-95'
          )}
          title={email.title || 'Email'}
        >
          <IconifyIcon
            name="mdi:email"
            size={24}
            color="white"
            className="transition-transform duration-300 group-hover:rotate-12"
          />
        </a>
      )}
    </div>
  )
}

export default FloatingContactButtons
