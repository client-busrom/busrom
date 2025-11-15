/**
 * Notice Box Component for Document Renderer
 *
 * Renders notice boxes with different intents (info, success, warning, error)
 * using lucide-react icons.
 */

import React from 'react'
import { Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type NoticeIntent = 'info' | 'success' | 'warning' | 'error'

interface NoticeBoxProps {
  intent: NoticeIntent
  children: React.ReactNode
}

const noticeConfigs = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-900',
    iconColor: 'text-green-600',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-600',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    iconColor: 'text-red-600',
  },
}

export function NoticeBox({ intent, children }: NoticeBoxProps) {
  const config = noticeConfigs[intent]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex gap-4 p-4 rounded-lg border-2',
        config.bgColor,
        config.borderColor,
        config.textColor
      )}
    >
      <div className={cn('flex-shrink-0 pt-0.5', config.iconColor)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 prose prose-sm max-w-none">
        {children}
      </div>
    </div>
  )
}
