// @ts-nocheck
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { useTranslation } from '@payloadcms/ui'
import {
  Images,
  Image,
  Video,
  MousePointerClick,
  Info,
  Sparkles,
  Zap,
  PlayCircle,
  Link2,
  FileText,
  PackageOpen,
  ChevronDown,
  LayoutGrid,
  Package,
  List,
  HelpCircle
} from 'lucide-react'
import { INSERT_IMAGE_GALLERY_COMMAND } from '../image-gallery/plugin'
import { INSERT_SINGLE_IMAGE_COMMAND } from '../single-image/plugin'
import { INSERT_VIDEO_EMBED_COMMAND } from '../video-embed/plugin'
import { INSERT_CTA_BUTTON_COMMAND } from '../cta-button/plugin'
import { INSERT_NOTICE_COMMAND } from '../notice/plugin'
import { INSERT_HERO_COMMAND } from '../hero/plugin'
import { INSERT_LINK_JUMP_COMMAND } from '../link-jump/plugin'
import { INSERT_CAROUSEL_COMMAND } from '../carousel/plugin'
import { INSERT_MARQUEE_LINKS_COMMAND } from '../marquee-links/plugin'
import { INSERT_FORM_BLOCK_COMMAND } from '../form-block/plugin'
import { INSERT_REUSABLE_BLOCK_COMMAND } from '../reusable-block/plugin'
import { INSERT_APPLICATION_CAROUSEL_COMMAND } from '../application-carousel/plugin'
import { INSERT_PRODUCT_CAROUSEL_COMMAND } from '../product-carousel/plugin'
import { INSERT_PRODUCT_REUSABLE_BLOCK_COMMAND } from '../product-reusable-block/plugin'
import { INSERT_SERIES_REUSABLE_BLOCK_COMMAND } from '../series-reusable-block/plugin'
import { INSERT_ICON_LIST_COMMAND } from '../icon-list/plugin'
import { INSERT_FAQ_SELECTION_COMMAND } from '../faq-selection/plugin'
import { INSERT_FAQ_CAROUSEL_COMMAND } from '../faq-carousel/plugin'
// import { INSERT_CHECK_LIST_COMMAND } from '@lexical/list' // 已使用内置 ChecklistFeature
import { INSERT_BLOCK_COMMAND } from '@payloadcms/richtext-lexical/client'

// 自定义块图标
const BlocksIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

// 通用块图标（用于 blockTypes）
const BlockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
)

// 块类型配置
interface BlockType {
  slug: string
  label: string
  icon?: React.FC
}

// 布局块现在通过 Payload 的 Blocks 功能插入（工具栏的 Blocks 按钮）
// 所有内容块已转换为 Custom Features，通过上面的按钮插入
const blockTypes: BlockType[] = [
  // { slug: 'twoColumns', label: '两栏布局' }, // 使用 Blocks 功能插入
  // { slug: 'threeColumns', label: '三栏布局' }, // 使用 Blocks 功能插入
  // { slug: 'sidebar', label: '侧边栏布局' }, // 使用 Blocks 功能插入
  // { slug: 'container', label: '容器' }, // 使用 Blocks 功能插入
  // { slug: 'singleImage', label: '单张图片' }, // 已转换为 Custom Feature
  // { slug: 'videoEmbed', label: '视频嵌入' }, // 已转换为 Custom Feature
  // { slug: 'ctaButton', label: '行动按钮' }, // 已转换为 Custom Feature
  // { slug: 'notice', label: '提示框' }, // 已转换为 Custom Feature
  // { slug: 'checklist', label: '检查列表' }, // 已转换为 Custom Feature
  // { slug: 'hero', label: '英雄横幅' }, // 已转换为 Custom Feature
  // { slug: 'linkJump', label: '快速链接' }, // 已转换为 Custom Feature
  // { slug: 'carousel', label: '轮播图' }, // 已转换为 Custom Feature
  // { slug: 'marqueeLinks', label: '滚动链接' }, // 已转换为 Custom Feature
  // { slug: 'formBlock', label: '表单' }, // 已转换为 Custom Feature
  // { slug: 'reusableBlockReference', label: '可重用块' }, // 已转换为 Custom Feature
]

export const ToolbarButton: React.FC = () => {
  const [editor] = useLexicalComposerContext()
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 200, // 200px is the minWidth of dropdown
      })
    }
  }, [isOpen])

  const insertImageGallery = () => {
    editor.dispatchCommand(INSERT_IMAGE_GALLERY_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertSingleImage = () => {
    editor.dispatchCommand(INSERT_SINGLE_IMAGE_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertVideoEmbed = () => {
    editor.dispatchCommand(INSERT_VIDEO_EMBED_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertCtaButton = () => {
    editor.dispatchCommand(INSERT_CTA_BUTTON_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertNotice = () => {
    editor.dispatchCommand(INSERT_NOTICE_COMMAND, undefined)
    setIsOpen(false)
  }

  // const insertChecklist = () => {
  //   editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
  //   setIsOpen(false)
  // } // 已使用内置 ChecklistFeature，在文本格式下拉菜单中

  const insertHero = () => {
    editor.dispatchCommand(INSERT_HERO_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertLinkJump = () => {
    editor.dispatchCommand(INSERT_LINK_JUMP_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertCarousel = () => {
    editor.dispatchCommand(INSERT_CAROUSEL_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertMarqueeLinks = () => {
    editor.dispatchCommand(INSERT_MARQUEE_LINKS_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertFormBlock = () => {
    editor.dispatchCommand(INSERT_FORM_BLOCK_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertReusableBlock = () => {
    editor.dispatchCommand(INSERT_REUSABLE_BLOCK_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertProductReusableBlock = () => {
    editor.dispatchCommand(INSERT_PRODUCT_REUSABLE_BLOCK_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertSeriesReusableBlock = () => {
    editor.dispatchCommand(INSERT_SERIES_REUSABLE_BLOCK_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertApplicationCarousel = () => {
    editor.dispatchCommand(INSERT_APPLICATION_CAROUSEL_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertProductCarousel = () => {
    console.log('🛒 ToolbarButton dispatching on editor:', editor._key)
    console.log('🛒 Command object ID:', INSERT_PRODUCT_CAROUSEL_COMMAND)
    editor.dispatchCommand(INSERT_PRODUCT_CAROUSEL_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertIconList = () => {
    editor.dispatchCommand(INSERT_ICON_LIST_COMMAND, undefined)
    setIsOpen(false)
  }

  const insertBlock = (blockSlug: string) => {
    editor.dispatchCommand(INSERT_BLOCK_COMMAND, {
      blockType: blockSlug,
      id: crypto.randomUUID(),
    })
    setIsOpen(false)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={i18n?.language === 'zh' ? '自定义块' : 'Custom Blocks'}
        style={{
          all: 'unset',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '6px 10px',
          height: '28px',
          cursor: 'pointer',
          borderRadius: '3px',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--theme-elevation-800, #1f2937)',
          backgroundColor: isOpen ? 'var(--theme-elevation-150, #f3f4f6)' : 'transparent',
          transition: 'background-color 0.15s ease',
          boxSizing: 'border-box',
          fontFamily: 'var(--font-body)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        <BlocksIcon />
        <span style={{ fontSize: '13px', lineHeight: '1' }}>
          {i18n?.language === 'zh' ? '自定义块' : 'Custom Blocks'}
        </span>
        <ChevronDown size={14} style={{ opacity: 0.5 }} />
      </button>

      {isOpen && dropdownPosition && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            minWidth: '200px',
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: 'var(--theme-input-bg, white)',
            border: '1px solid var(--theme-elevation-200, #e5e7eb)',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            zIndex: 999999,
          }}
        >
          {/* 图片画廊 - Custom Feature */}
          <button
            type="button"
            onClick={insertImageGallery}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Images size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '图片画廊' : 'Image Gallery'}</span>
          </button>

          {/* 单张图片 - Custom Feature */}
          <button
            type="button"
            onClick={insertSingleImage}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Image size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '单张图片' : 'Single Image'}</span>
          </button>

          {/* 视频嵌入 - Custom Feature */}
          <button
            type="button"
            onClick={insertVideoEmbed}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Video size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '视频嵌入' : 'Video Embed'}</span>
          </button>

          {/* 行动按钮 - Custom Feature */}
          <button
            type="button"
            onClick={insertCtaButton}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <MousePointerClick size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '行动按钮' : 'CTA Button'}</span>
          </button>

          {/* 提示框 - Custom Feature */}
          <button
            type="button"
            onClick={insertNotice}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Info size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '提示框' : 'Notice'}</span>
          </button>

          {/* 检查列表 - 已使用内置 ChecklistFeature，在文本格式下拉菜单中 */}

          {/* 分隔线 */}
          <div style={{
            height: '1px',
            backgroundColor: 'var(--theme-elevation-200, #e5e7eb)',
            margin: '4px 0'
          }} />

          {/* 英雄横幅 - Custom Feature */}
          <button
            type="button"
            onClick={insertHero}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Sparkles size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '英雄横幅' : 'Hero Banner'}</span>
          </button>

          {/* 快速链接 - Custom Feature */}
          <button
            type="button"
            onClick={insertLinkJump}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Zap size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '快速链接' : 'Quick Links'}</span>
          </button>

          {/* 轮播图 - Custom Feature */}
          <button
            type="button"
            onClick={insertCarousel}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <PlayCircle size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '轮播图' : 'Carousel'}</span>
          </button>

          {/* 应用轮播 - Custom Feature */}
          <button
            type="button"
            onClick={insertApplicationCarousel}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <LayoutGrid size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '应用轮播' : 'Application Carousel'}</span>
          </button>

          {/* 产品轮播 - Custom Feature */}
          <button
            type="button"
            onClick={insertProductCarousel}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Package size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '产品轮播' : 'Product Carousel'}</span>
          </button>

          {/* 滚动链接 - Custom Feature */}
          <button
            type="button"
            onClick={insertMarqueeLinks}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Link2 size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '滚动链接' : 'Marquee Links'}</span>
          </button>

          {/* 图标列表 - Custom Feature */}
          <button
            type="button"
            onClick={insertIconList}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <List size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '图标列表' : 'Icon List'}</span>
          </button>
          
          {/* FAQ 智能选择 - Content Block */}
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(INSERT_FAQ_SELECTION_COMMAND, undefined)
              setIsOpen(false)
            }}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <HelpCircle size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? 'FAQ 智能选择' : 'FAQ Selection'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(INSERT_FAQ_CAROUSEL_COMMAND, undefined)
              setIsOpen(false)
            }}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <HelpCircle size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? 'FAQ 轮播推荐' : 'FAQ Carousel'}</span>
          </button>

          {/* 表单块 - Custom Feature */}
          <button
            type="button"
            onClick={insertFormBlock}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <FileText size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '表单块' : 'Form Block'}</span>
          </button>

          {/* 可复用块 - Custom Feature */}
          <button
            type="button"
            onClick={insertReusableBlock}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <PackageOpen size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '可复用块' : 'Reusable Block'}</span>
          </button>

          {/* 产品链接块 - Custom Feature */}
          <button
            type="button"
            onClick={insertProductReusableBlock}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Package size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '产品链接页复用块' : 'Product Detail Block'}</span>
          </button>

          {/* 产品详解页复用块 - Custom Feature */}
          <button
            type="button"
            onClick={insertSeriesReusableBlock}
            style={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800, #1f2937)',
              backgroundColor: 'transparent',
              transition: 'background-color 0.15s ease',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <PackageOpen size={18} style={{ opacity: 0.7 }} />
            <span>{i18n?.language === 'zh' ? '产品详解页复用块' : 'Series Detail Block'}</span>
          </button>

          {/* 布局块已移除，用户应该使用 Blocks 功能插入（在工具栏的 Blocks 下拉菜单） */}
          {/* 分隔线 */}
          {blockTypes.length > 0 && (
            <div style={{
              height: '1px',
              backgroundColor: 'var(--theme-elevation-200, #e5e7eb)',
              margin: '4px 0'
            }} />
          )}

          {/* 所有 Block 类型（仅当有可用 blocks 时显示） */}
          {blockTypes.length > 0 && blockTypes.map((block) => (
            <button
              key={block.slug}
              type="button"
              onClick={() => insertBlock(block.slug)}
              style={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--theme-elevation-800, #1f2937)',
                backgroundColor: 'transparent',
                transition: 'background-color 0.15s ease',
                boxSizing: 'border-box',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100, #f9fafb)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {block.icon ? <block.icon /> : <BlockIcon />}
              <span>{block.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
