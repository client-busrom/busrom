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
    <div className="fixed right-6 lg:right-[0.5vw] top-1/2 mt-10 lg:mt-[3vw] z-[60] flex flex-col gap-3 lg:gap-[0.625vw]">
      {whatsapp?.linkUrl && (
        <div className="relative group/tooltip">
          <a
            href={`https://wa.me/${whatsapp.linkUrl.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center justify-center w-12 h-12 lg:w-[2.5vw] lg:h-[2.5vw] rounded-full',
              'bg-brand-secondary shadow-lg',
              'transition-all duration-300 ease-out',
              'hover:scale-110 hover:shadow-xl',
              'active:scale-95'
            )}
            aria-label="WhatsApp"
          >
            <IconifyIcon
              name="mdi:whatsapp"
              size="50%"
              color="white"
              className="transition-transform duration-300 group-hover:rotate-12"
            />
          </a>
          {/* Tooltip */}
          <a
            href={`https://wa.me/${whatsapp.linkUrl.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-full mr-3 lg:mr-[0.625vw] top-1/2 -translate-y-1/2"
            aria-label="WhatsApp Tooltip"
          >
            <div
              className={cn(
                'relative bg-[#F6F4ED] text-black font-medium px-3 py-3 lg:px-[0.625vw] lg:py-[0.625vw] rounded-lg lg:rounded-[0.416vw] whitespace-nowrap',
                'text-base lg:text-[0.833vw]',
                'opacity-0 invisible',
                'group-hover/tooltip:opacity-100 group-hover/tooltip:visible',
                'transition-all duration-200 ease-out',
                'shadow-lg lg:shadow-[0_0.416vw_0.833vw_rgba(0,0,0,0.15)]',
                'translate-x-2 lg:translate-x-[0.416vw] group-hover/tooltip:translate-x-0'
              )}
            >
              WhatsApp
              {/* Arrow */}
              <span className="absolute top-1/2 -right-[3px] lg:-right-[0.156vw] -translate-y-1/2 w-[6px] h-[6px] lg:w-[0.3125vw] lg:h-[0.3125vw] bg-[#F6F4ED] rotate-45" />
            </div>
          </a>
        </div>
      )}

      {email?.linkUrl && (
        <div className="relative group/tooltip">
          <a
            href={email.linkUrl.startsWith('mailto:') ? email.linkUrl : `mailto:${email.linkUrl}`}
            className={cn(
              'flex items-center justify-center w-12 h-12 lg:w-[2.5vw] lg:h-[2.5vw] rounded-full',
              'bg-brand-secondary shadow-lg',
              'transition-all duration-300 ease-out',
              'hover:scale-110 hover:shadow-xl',
              'active:scale-95'
            )}
            aria-label="Email"
          >
            <IconifyIcon
              name="mdi:email"
              size="50%"
              color="white"
              className="transition-transform duration-300 group-hover:rotate-12"
            />
          </a>
          {/* Tooltip */}
          <a
            href={email.linkUrl.startsWith('mailto:') ? email.linkUrl : `mailto:${email.linkUrl}`}
            className="absolute right-full mr-3 lg:mr-[0.625vw] top-1/2 -translate-y-1/2"
            aria-label="Email Tooltip"
          >
            <div
              className={cn(
                'relative bg-[#F6F4ED] text-black font-medium px-3 py-3 lg:px-[0.625vw] lg:py-[0.625vw] rounded-lg lg:rounded-[0.416vw] whitespace-nowrap',
                'text-base lg:text-[0.833vw]',
                'opacity-0 invisible',
                'group-hover/tooltip:opacity-100 group-hover/tooltip:visible',
                'transition-all duration-200 ease-out',
                'shadow-lg lg:shadow-[0_0.416vw_0.833vw_rgba(0,0,0,0.15)]',
                'translate-x-2 lg:translate-x-[0.416vw] group-hover/tooltip:translate-x-0'
              )}
            >
              Email
              {/* Arrow */}
              <span className="absolute top-1/2 -right-[3px] lg:-right-[0.156vw] -translate-y-1/2 w-[6px] h-[6px] lg:w-[0.3125vw] lg:h-[0.3125vw] bg-[#F6F4ED] rotate-45" />
            </div>
          </a>
        </div>
      )}
    </div>
  )
}

export default FloatingContactButtons
