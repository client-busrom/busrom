'use client'

import React, { useState } from 'react'
import { useForm, Button, useTranslation } from '@payloadcms/ui'
import { LinkPickerModal } from './LinkPickerModal'

export const LinkPickerUIField: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { dispatchFields } = useForm()
  const { i18n: { language } } = useTranslation()
  
  const handleSelect = (path: string) => {
    // 强制切换到“自定义 URL”模式
    dispatchFields({
      type: 'UPDATE',
      path: 'linkType',
      value: 'custom',
    })
    // 填充选中的路径
    dispatchFields({
      type: 'UPDATE',
      path: 'url',
      value: path,
    })
    // 关闭 Modal
    setIsOpen(false)
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        buttonStyle="secondary"
      >
        {language === 'en' 
          ? 'Use Advanced Search (LinkPicker) for Internal Links'
          : '使用高级搜索 (LinkPicker) 选取内部链接'}
      </Button>
      
      <LinkPickerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  )
}
