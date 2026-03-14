'use client'

/**
 * Custom Navigation Component
 *
 * Organized navigation with custom ordering to match frontend display order
 * Uses Payload's built-in i18n for labels
 */

import React from 'react'
import { Logout, useAuth, useTranslation } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Helper hook to persist expansion state in local storage
const usePersistedExpansion = (labelKey: string, defaultOpen: boolean) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(`payload-nav-expanded:${labelKey}`)
      if (saved !== null) {
        setIsOpen(saved === 'true')
      }
    } catch (e) {
      // Quietly fail if localStorage is blocked
    }
  }, [labelKey])

  const toggle = () => {
    const nextState = !isOpen
    setIsOpen(nextState)
    try {
      localStorage.setItem(`payload-nav-expanded:${labelKey}`, String(nextState))
    } catch (e) {
      // Quietly fail
    }
  }

  return [isOpen, toggle] as const
}

// Navigation item component
const NavItem: React.FC<{ href: string; labelKey: string }> = ({ href, labelKey }) => {
  const pathname = usePathname()
  const { t } = useTranslation()
  const label = t(`custom:nav:${labelKey}` as any)
  const isActive = pathname === href || pathname?.startsWith(href + '/')

  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '8px 16px 8px 24px',
        color: isActive ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-600)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: isActive ? 500 : 400,
        backgroundColor: isActive ? 'var(--theme-elevation-100)' : 'transparent',
        borderRadius: '4px',
        margin: '2px 8px',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </Link>
  )
}

// Group header component
const GroupHeader: React.FC<{
  labelKey: string
  isOpen: boolean
  onClick: () => void
}> = ({ labelKey, isOpen, onClick }) => {
  const { t } = useTranslation()
  const label = t(`custom:nav:${labelKey}` as any)

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'none',
        border: 'none',
        borderTop: '1px solid var(--theme-elevation-100)',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: 'var(--theme-elevation-500)',
        marginTop: '8px',
      }}
    >
      <span>{label}</span>
      <span
        style={{
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}
      >
        ▸
      </span>
    </button>
  )
}

// Collapsible group component
const CollapsibleGroup: React.FC<{
  labelKey: string
  defaultOpen?: boolean
  children: React.ReactNode
}> = ({ labelKey, defaultOpen = true, children }) => {
  const [isOpen, toggle] = usePersistedExpansion(labelKey, defaultOpen)

  return (
    <div>
      <GroupHeader
        labelKey={labelKey}
        isOpen={isOpen}
        onClick={toggle}
      />
      <div
        style={{
          maxHeight: isOpen ? '2000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Sub-group header component (for nested groups - 3rd level)
const SubGroupHeader: React.FC<{
  labelKey: string
  isOpen: boolean
  onClick: () => void
  hasChildren?: boolean
}> = ({ labelKey, isOpen, onClick, hasChildren = true }) => {
  const { t } = useTranslation()
  const label = t(`custom:nav:${labelKey}` as any)

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px 8px 24px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--theme-elevation-600)',
        margin: '2px 8px',
        borderRadius: '4px',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--theme-elevation-50)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <span>{label}</span>
      {hasChildren && (
        <span
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            fontSize: '10px',
          }}
        >
          ▸
        </span>
      )}
    </button>
  )
}

// Sub-group link item (styled like SubGroupHeader but as a direct link)
const SubGroupLinkItem: React.FC<{ href: string; labelKey: string }> = ({ href, labelKey }) => {
  const pathname = usePathname()
  const { t } = useTranslation()
  const label = t(`custom:nav:${labelKey}` as any)
  const isActive = pathname === href || pathname?.startsWith(href + '/')

  return (
    <Link
      href={href}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px 8px 24px',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: isActive ? 600 : 500,
        color: isActive ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-600)',
        margin: '2px 8px',
        borderRadius: '4px',
        backgroundColor: isActive ? 'var(--theme-elevation-100)' : 'transparent',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--theme-elevation-50)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
    >
      <span>{label}</span>
    </Link>
  )
}

// Nested sub-group component (for 3rd level navigation)
const NestedSubGroup: React.FC<{
  labelKey: string
  defaultOpen?: boolean
  children: React.ReactNode
}> = ({ labelKey, defaultOpen = false, children }) => {
  const [isOpen, toggle] = usePersistedExpansion(labelKey, defaultOpen)

  return (
    <div>
      <SubGroupHeader
        labelKey={labelKey}
        isOpen={isOpen}
        onClick={toggle}
      />
      <div
        style={{
          maxHeight: isOpen ? '2000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          paddingLeft: '16px',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export const CustomNav: React.FC = () => {
  const { user } = useAuth()
  const isAdmin = (user as any)?.isAdmin === true

  return (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        {/* Dashboard */}
        <div style={{ padding: '16px 16px 8px' }}>
          <NavItem href="/admin" labelKey="dashboard" />
        </div>

        {/* Users & Access - Admin only */}
        {isAdmin && (
          <CollapsibleGroup labelKey="usersAccess">
            <NavItem href="/admin/collections/users" labelKey="users" />
            <NavItem href="/admin/collections/roles" labelKey="roles" />
            <NavItem href="/admin/collections/permissions" labelKey="permissions" />
            <NavItem href="/admin/collections/Audit-log" labelKey="auditLog" />
          </CollapsibleGroup>
        )}

        {/* Navigation */}
        <CollapsibleGroup labelKey="navigation">
          <NavItem href="/admin/collections/navigation-menus" labelKey="navigationMenus" />
          <NavItem href="/admin/navigation-manager" labelKey="navigationManager" />
        </CollapsibleGroup>

        {/* 网站页面管理 - 包含首页内容和其他子页 */}
        <CollapsibleGroup labelKey="websitePages">
          {/* 首页内容 - 嵌套的三级菜单 */}
          <NestedSubGroup labelKey="homepage">
            <NavItem href="/admin/collections/hero-banner-items" labelKey="heroBanner" />
            <NavItem href="/admin/collections/series-intro-items" labelKey="seriesIntro" />
            <NavItem href="/admin/globals/product-series-carousel" labelKey="productSeriesCarousel" />
            <NavItem href="/admin/globals/service-features" labelKey="serviceFeatures" />
            <NavItem href="/admin/globals/sphere-3d" labelKey="sphere3d" />
            <NavItem href="/admin/globals/simple-cta" labelKey="simpleCta" />
            <NavItem href="/admin/globals/featured-products" labelKey="featuredProducts" />
            <NavItem href="/admin/globals/brand-advantages" labelKey="brandAdvantages" />
            <NavItem href="/admin/globals/oem-odm" labelKey="oemOdm" />
            <NavItem href="/admin/globals/quote-steps" labelKey="quoteSteps" />
            <NavItem href="/admin/globals/main-form" labelKey="mainForm" />
            <NavItem href="/admin/globals/why-choose-busrom" labelKey="whyChooseBusrom" />
            <NavItem href="/admin/globals/case-studies" labelKey="caseStudies" />
            <NavItem href="/admin/globals/brand-analysis" labelKey="brandAnalysis" />
            <NavItem href="/admin/globals/brand-value" labelKey="brandValue" />
          </NestedSubGroup>
          {/* 其他子页 - 使用与首页内容相同的样式 */}
          <SubGroupLinkItem href="/admin/collections/pages" labelKey="subpages" />
        </CollapsibleGroup>

        {/* Media Library */}
        <CollapsibleGroup labelKey="mediaLibrary">
          <NavItem href="/admin/collections/media" labelKey="media" />
          <NavItem href="/admin/collections/media-categories" labelKey="mediaCategories" />
          <NavItem href="/admin/collections/media-tags" labelKey="mediaTags" />
          <NavItem href="/admin/collections/applications" labelKey="applications" />
        </CollapsibleGroup>

        {/* 产品管理 (顶层导航) */}
        <CollapsibleGroup labelKey="products">
          <NestedSubGroup labelKey="productSeriesManagement">
            <NavItem href="/admin/collections/product-series" labelKey="productSeries" />
            <NavItem href="/admin/collections/series-templates" labelKey="seriesTemplates" />
            <NavItem href="/admin/collections/series-reusable-blocks" labelKey="seriesReusableBlocks" />
          </NestedSubGroup>
          {/* 产品链接页管理 - 嵌套的三级菜单 */}
          <NestedSubGroup labelKey="productPageManagement">
            <NavItem href="/admin/collections/products" labelKey="productsItem" />
            <NavItem href="/admin/collections/product-attributes" labelKey="productAttributes" />
            <NavItem href="/admin/collections/product-templates" labelKey="productTemplates" />
            <NavItem href="/admin/collections/product-reusable-blocks" labelKey="productReusableBlocks" />
          </NestedSubGroup>
        </CollapsibleGroup>

        {/* Content */}
        <CollapsibleGroup labelKey="content">
          <NavItem href="/admin/collections/categories" labelKey="categories" />
          <NavItem href="/admin/collections/blogs" labelKey="blogs" />
          <NavItem href="/admin/collections/faq-items" labelKey="faqItems" />
          <NavItem href="/admin/collections/reusable-blocks" labelKey="reusableBlocks" />
          <NavItem href="/admin/collections/document-templates" labelKey="documentTemplates" />
          <NavItem href="/admin/collections/template-categories" labelKey="templateCategories" />
        </CollapsibleGroup>

        {/* Forms */}
        <CollapsibleGroup labelKey="forms">
          <NavItem href="/admin/collections/form-configs" labelKey="formConfigs" />
          <NavItem href="/admin/collections/form-submissions" labelKey="formSubmissions" />
          <NavItem href="/admin/collections/smtp-configs" labelKey="smtpConfigs" />
        </CollapsibleGroup>

        {/* Advanced */}
        <CollapsibleGroup labelKey="advanced" defaultOpen={false}>
          <NavItem href="/admin/collections/custom-scripts" labelKey="customScripts" />
          <NavItem href="/admin/collections/seo-settings" labelKey="seoSettings" />
        </CollapsibleGroup>

        {/* Website Settings - 网站设置 */}
        <CollapsibleGroup labelKey="websiteSettings" defaultOpen={false}>
          <NavItem href="/admin/globals/footer" labelKey="footer" />
          <NavItem href="/admin/globals/site-config" labelKey="siteConfigItem" />
          <NavItem href="/admin/globals/preloader-config" labelKey="preloaderConfig" />
          <NavItem href="/admin/globals/social-config" labelKey="socialConfig" />
        </CollapsibleGroup>

        {/* CMS Settings - CMS 配置 */}
        <CollapsibleGroup labelKey="cmsSettings" defaultOpen={false}>
          <NavItem href="/admin/globals/translation-config" labelKey="translationConfig" />
          <NavItem href="/admin/translation-settings" labelKey="myTranslationSettings" />
        </CollapsibleGroup>
      </div>

      {/* Logout button at bottom */}
      <div
        style={{
          borderTop: '1px solid var(--theme-elevation-100)',
          padding: '16px',
        }}
      >
        <Logout />
      </div>
    </nav>
  )
}

export default CustomNav
