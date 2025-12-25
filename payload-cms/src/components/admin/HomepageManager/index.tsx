'use client'

/**
 * Homepage Manager - Custom Admin View
 *
 * 整合所有首页相关的板块管理入口
 * 使用卡片列表展示各个板块，点击跳转到对应编辑页面
 */

import React from 'react'
import { useTranslation } from '@payloadcms/ui'
import Link from 'next/link'

// 首页所有板块配置
const HOMEPAGE_SECTIONS = [
  // Collections
  {
    id: 'hero-banner',
    type: 'collection',
    slug: 'hero-banner-items',
    labelKey: 'heroBanner',
    descriptionEn: 'Manage hero banner carousel items',
    descriptionZh: '管理首页轮播图项目',
    icon: '🖼️',
  },
  {
    id: 'series-intro',
    type: 'collection',
    slug: 'series-intro-items',
    labelKey: 'seriesIntro',
    descriptionEn: 'Manage series introduction items',
    descriptionZh: '管理产品系列介绍项目',
    icon: '📋',
  },
  // Globals (按前端显示顺序)
  {
    id: 'product-series-carousel',
    type: 'global',
    slug: 'product-series-carousel',
    labelKey: 'productSeriesCarousel',
    descriptionEn: 'Product series carousel configuration',
    descriptionZh: '产品系列轮播配置',
    icon: '🎠',
  },
  {
    id: 'service-features',
    type: 'global',
    slug: 'service-features',
    labelKey: 'serviceFeatures',
    descriptionEn: 'Service features section configuration',
    descriptionZh: '服务特性区块配置',
    icon: '⭐',
  },
  {
    id: 'sphere-3d',
    type: 'global',
    slug: 'sphere-3d',
    labelKey: 'sphere3d',
    descriptionEn: '3D sphere display configuration',
    descriptionZh: '3D球体展示配置',
    icon: '🌐',
  },
  {
    id: 'simple-cta',
    type: 'global',
    slug: 'simple-cta',
    labelKey: 'simpleCta',
    descriptionEn: 'Simple call-to-action section',
    descriptionZh: '简易行动召唤区块',
    icon: '📢',
  },
  {
    id: 'featured-products',
    type: 'global',
    slug: 'featured-products',
    labelKey: 'featuredProducts',
    descriptionEn: 'Featured products selection',
    descriptionZh: '精选产品配置',
    icon: '🏆',
  },
  {
    id: 'brand-advantages',
    type: 'global',
    slug: 'brand-advantages',
    labelKey: 'brandAdvantages',
    descriptionEn: 'Brand advantages display',
    descriptionZh: '品牌优势展示',
    icon: '💪',
  },
  {
    id: 'oem-odm',
    type: 'global',
    slug: 'oem-odm',
    labelKey: 'oemOdm',
    descriptionEn: 'OEM/ODM services section',
    descriptionZh: 'OEM/ODM服务区块',
    icon: '🏭',
  },
  {
    id: 'quote-steps',
    type: 'global',
    slug: 'quote-steps',
    labelKey: 'quoteSteps',
    descriptionEn: 'Quote process steps',
    descriptionZh: '报价流程步骤',
    icon: '📝',
  },
  {
    id: 'main-form',
    type: 'global',
    slug: 'main-form',
    labelKey: 'mainForm',
    descriptionEn: 'Main contact form configuration',
    descriptionZh: '主表单配置',
    icon: '📬',
  },
  {
    id: 'why-choose-busrom',
    type: 'global',
    slug: 'why-choose-busrom',
    labelKey: 'whyChooseBusrom',
    descriptionEn: 'Why choose Busrom section',
    descriptionZh: '为何选择Busrom区块',
    icon: '❓',
  },
  {
    id: 'case-studies',
    type: 'global',
    slug: 'case-studies',
    labelKey: 'caseStudies',
    descriptionEn: 'Case studies and applications',
    descriptionZh: '案例研究与应用',
    icon: '📊',
  },
  {
    id: 'brand-analysis',
    type: 'global',
    slug: 'brand-analysis',
    labelKey: 'brandAnalysis',
    descriptionEn: 'Brand analysis section',
    descriptionZh: '品牌分析区块',
    icon: '🔍',
  },
  {
    id: 'brand-value',
    type: 'global',
    slug: 'brand-value',
    labelKey: 'brandValue',
    descriptionEn: 'Brand value proposition',
    descriptionZh: '品牌价值主张',
    icon: '💎',
  },
]

const HomepageManager: React.FC = () => {
  const { t, i18n } = useTranslation()
  const currentLocale = i18n.language

  // 获取标签名称
  const getLabel = (labelKey: string) => {
    const customLabel = t(`custom:nav:${labelKey}` as any)
    if (customLabel && !customLabel.startsWith('custom:')) {
      return customLabel
    }
    return labelKey
  }

  // 获取链接地址
  const getHref = (section: typeof HOMEPAGE_SECTIONS[0]) => {
    return section.type === 'collection'
      ? `/admin/collections/${section.slug}`
      : `/admin/globals/${section.slug}`
  }

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--theme-elevation-800)',
          }}
        >
          {currentLocale === 'zh' ? '首页管理' : 'Homepage Manager'}
        </h1>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: '14px',
            color: 'var(--theme-elevation-500)',
          }}
        >
          {currentLocale === 'zh'
            ? '管理首页各个板块的内容，点击卡片进入编辑'
            : 'Manage homepage sections. Click a card to edit.'}
        </p>
      </div>

      {/* 板块卡片网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {HOMEPAGE_SECTIONS.map((section) => (
          <Link
            key={section.id}
            href={getHref(section)}
            style={{
              display: 'block',
              padding: '20px',
              backgroundColor: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-elevation-100)',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--theme-elevation-300)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--theme-elevation-100)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '24px' }}>{section.icon}</span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--theme-elevation-800)',
                }}
              >
                {getLabel(section.labelKey)}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: 'var(--theme-elevation-500)',
                lineHeight: 1.5,
              }}
            >
              {currentLocale === 'zh' ? section.descriptionZh : section.descriptionEn}
            </p>
            <div
              style={{
                marginTop: '12px',
                fontSize: '12px',
                color: 'var(--theme-elevation-400)',
                textTransform: 'uppercase',
              }}
            >
              {section.type === 'collection' ? 'Collection' : 'Global'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomepageManager
