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
    <div className="fixed right-6 top-1/2 mt-10 z-[60] flex flex-col gap-3">
      {whatsapp?.linkUrl && (
        <div className="relative group/tooltip">
          <a
            href={`https://wa.me/${whatsapp.linkUrl.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full',
              'bg-brand-secondary shadow-lg',
              'transition-all duration-300 ease-out',
              'hover:scale-110 hover:shadow-xl',
              'active:scale-95'
            )}
          >
            <IconifyIcon
              name="mdi:whatsapp"
              size={24}
              color="white"
              className="transition-transform duration-300 group-hover:rotate-12"
            />
          </a>
          {/* Tooltip */}
          <a
            href={`https://wa.me/${whatsapp.linkUrl.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2"
          >
            <div
              className={cn(
                'relative bg-gray-900 text-white text-base font-medium px-3 py-1.5 rounded-lg whitespace-nowrap',
                'opacity-0 invisible',
                'group-hover/tooltip:opacity-100 group-hover/tooltip:visible',
                'transition-all duration-200 ease-out',
                'shadow-lg',
                'translate-x-2 group-hover/tooltip:translate-x-0'
              )}
            >
              WhatsApp
              {/* Arrow */}
              <span className="absolute top-1/2 -right-[3px] -translate-y-1/2 w-[6px] h-[6px] bg-gray-900 rotate-45" />
            </div>
          </a>
        </div>
      )}

      {email?.linkUrl && (
        <div className="relative group/tooltip">
          <a
            href={email.linkUrl.startsWith('mailto:') ? email.linkUrl : `mailto:${email.linkUrl}`}
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full',
              'bg-brand-secondary shadow-lg',
              'transition-all duration-300 ease-out',
              'hover:scale-110 hover:shadow-xl',
              'active:scale-95'
            )}
          >
            <IconifyIcon
              name="mdi:email"
              size={24}
              color="white"
              className="transition-transform duration-300 group-hover:rotate-12"
            />
          </a>
          {/* Tooltip */}
          <a
            href={email.linkUrl.startsWith('mailto:') ? email.linkUrl : `mailto:${email.linkUrl}`}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2"
          >
            <div
              className={cn(
                'relative bg-gray-900 text-white text-base font-medium px-3 py-1.5 rounded-lg whitespace-nowrap',
                'opacity-0 invisible',
                'group-hover/tooltip:opacity-100 group-hover/tooltip:visible',
                'transition-all duration-200 ease-out',
                'shadow-lg',
                'translate-x-2 group-hover/tooltip:translate-x-0'
              )}
            >
              Email
              {/* Arrow */}
              <span className="absolute top-1/2 -right-[3px] -translate-y-1/2 w-[6px] h-[6px] bg-gray-900 rotate-45" />
            </div>
          </a>
        </div>
      )}
    </div>
  )
}

export default FloatingContactButtons
