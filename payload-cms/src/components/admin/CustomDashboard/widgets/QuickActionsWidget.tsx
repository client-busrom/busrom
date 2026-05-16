'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@payloadcms/ui'

interface UserQuickAction {
  route?: string
  customLabel?: string
  colorPreset?: 'success' | 'info' | 'warning' | 'error' | 'default'
}

export const QuickActionsWidget: React.FC = () => {
  const { user } = useAuth()
  const [userActions, setUserActions] = useState<UserQuickAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial load from useAuth hook
    if ((user as any)?.quickActions && Array.isArray((user as any).quickActions)) {
      setUserActions((user as any).quickActions)
    }

    // Fetch freshest data from /api/users/me to guarantee recent updates reflect immediately
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
          if (data?.user?.quickActions && Array.isArray(data.user.quickActions)) {
            setUserActions(data.user.quickActions)
          }
        }
      } catch (err) {
        console.error('Failed to fetch user quick actions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const routeMap: Record<string, { title: { en: string; zh: string }; description: { en: string; zh: string }; icon: string }> = {
    // Products
    '/admin/collections/products/create': { title: { en: 'Add New Product', zh: '发布新产品' }, description: { en: 'Create a new product integration page', zh: '创建全新的产品整合与详情页' }, icon: '📦' },
    '/admin/collections/products': { title: { en: 'Product List', zh: '产品列表管理' }, description: { en: 'Manage all existing products', zh: '管理和维护所有产品数据' }, icon: '📦' },
    '/admin/collections/product-series': { title: { en: 'Product Series', zh: '产品系列管理' }, description: { en: 'Manage product series categories', zh: '管理产品系列与分类关联' }, icon: '🏷️' },
    '/admin/collections/product-attributes': { title: { en: 'Product Attributes', zh: '产品规格属性' }, description: { en: 'Configure product attributes and specs', zh: '配置通用产品规格与属性参数' }, icon: '⚙️' },
    // Content
    '/admin/collections/blogs/create': { title: { en: 'Write Knowledge Base', zh: '撰写知识库文章' }, description: { en: 'Publish a new blog or technical article', zh: '发布新的技术文章或行业动态' }, icon: '✍️' },
    '/admin/collections/blogs': { title: { en: 'Knowledge Base List', zh: '知识库列表管理' }, description: { en: 'Manage all knowledge base articles', zh: '管理所有已发布的知识库文章' }, icon: '📚' },
    '/admin/collections/categories': { title: { en: 'Categories', zh: '分类目录管理' }, description: { en: 'Manage article categories', zh: '管理文章与博客分类目录' }, icon: '📂' },
    '/admin/collections/faq-items': { title: { en: 'FAQ Management', zh: '常见问题管理' }, description: { en: 'Manage frequently asked questions', zh: '管理客户常见问答与知识条目' }, icon: '❓' },
    '/admin/collections/document-templates': { title: { en: 'Document Templates', zh: '资料下载模板' }, description: { en: 'Manage downloadable files and brochures', zh: '管理网站供客户下载的文档与手册' }, icon: '📑' },
    // Media
    '/admin/collections/media': { title: { en: 'Media Library', zh: '素材库管理' }, description: { en: 'Upload and manage images, videos, documents', zh: '上传和管理网站图片、视频与文档' }, icon: '🖼️' },
    '/admin/collections/media-categories': { title: { en: 'Media Categories', zh: '素材分类' }, description: { en: 'Organize media by categories', zh: '为素材库文件建立分类目录' }, icon: '🗂️' },
    '/admin/collections/applications': { title: { en: 'Applications', zh: '应用领域素材' }, description: { en: 'Manage application area assets', zh: '管理不同应用场景与领域展示素材' }, icon: '📱' },
    // Forms & Inquiries
    '/admin/collections/form-submissions': { title: { en: 'Customer Inquiries', zh: '客户留言与表单询盘' }, description: { en: 'Check recent form submissions and leads', zh: '查看最新客户留言与表单询盘' }, icon: '💬' },
    '/admin/collections/form-configs': { title: { en: 'Form Configurations', zh: '表单字段配置' }, description: { en: 'Configure dynamic form fields', zh: '配置网站各类表单的收集字段' }, icon: '📋' },
    '/admin/collections/smtp-configs': { title: { en: 'SMTP Settings', zh: '邮件发件服务器' }, description: { en: 'Manage email sending server config', zh: '管理系统自动发送邮件的SMTP账号' }, icon: '📧' },
    // Website Pages
    '/admin/collections/hero-banner-items': { title: { en: 'Homepage Content', zh: '首页轮播与板块设置' }, description: { en: 'Manage homepage hero and sections', zh: '管理首页大图轮播与核心展示板块' }, icon: '🏠' },
    '/admin/collections/pages': { title: { en: 'Subpages Management', zh: '网站独立页面管理' }, description: { en: 'Manage independent website pages', zh: '管理关于我们、联系我们等独立单页' }, icon: '📄' },
    '/admin/globals/shop-page-config': { title: { en: 'Shop Page Config', zh: '选型中心配置' }, description: { en: 'Configure product selection center', zh: '配置选型中心页面头部与基础展示' }, icon: '🛍️' },
    '/admin/collections/navigation-menus': { title: { en: 'Navigation Menus', zh: '网站菜单导航' }, description: { en: 'Manage header and footer navigation links', zh: '管理网站主导航与底部链接栏目' }, icon: '🧭' },
    // Settings
    '/admin/globals/seo-setting': { title: { en: 'SEO Global Settings', zh: 'SEO 抓取与收录配置' }, description: { en: 'Manage sitemap, robots.txt and indexing', zh: '管理站点地图、抓取与收录规则' }, icon: '🔍' },
    '/admin/collections/indexing-logs': { title: { en: 'Indexing Logs', zh: '搜索引擎提交日志' }, description: { en: 'Check automated search engine indexing logs', zh: '查看自动化推送到Google/Bing的日志' }, icon: '⚡' },
    '/admin/globals/site-config': { title: { en: 'Site Config', zh: '网站全局基础设置' }, description: { en: 'Manage site name, logo and basic info', zh: '管理网站名称、Logo与全局基础参数' }, icon: '🌐' },
    '/admin/globals/footer': { title: { en: 'Footer Config', zh: '页脚与联系方式' }, description: { en: 'Configure footer info and contact details', zh: '配置网站底部栏目与公司联系方式' }, icon: '🏢' },
    '/admin/globals/translation-config': { title: { en: 'Translation Config', zh: '国际化与翻译配置' }, description: { en: 'Manage multilingual and translation settings', zh: '管理多语言语种开启与翻译API配置' }, icon: '🌍' },
    '/admin/collections/users': { title: { en: 'Users & Access', zh: '后台账号与权限管理' }, description: { en: 'Manage admin accounts, roles and permissions', zh: '管理后台登录账号、角色与操作权限' }, icon: '👥' },
  }

  const defaultActions: UserQuickAction[] = [
    { route: '/admin/collections/products/create', colorPreset: 'success' },
    { route: '/admin/collections/blogs/create', colorPreset: 'info' },
    { route: '/admin/collections/media', colorPreset: 'warning' },
    { route: '/admin/collections/form-submissions', colorPreset: 'error' },
    { route: '/admin/globals/seo-setting', colorPreset: 'default' },
  ]

  const getColorStyles = (preset?: string) => {
    switch (preset) {
      case 'success':
        return { bgColor: 'var(--theme-success-50, #f6ffed)', borderColor: 'var(--theme-success-200, #b7eb8f)' }
      case 'info':
        return { bgColor: 'var(--theme-info-50, #e6f7ff)', borderColor: 'var(--theme-info-200, #91d5ff)' }
      case 'warning':
        return { bgColor: 'var(--theme-warning-50, #fffbe6)', borderColor: 'var(--theme-warning-200, #ffe58f)' }
      case 'error':
        return { bgColor: 'var(--theme-error-50, #fff2f0)', borderColor: 'var(--theme-error-200, #ffccc7)' }
      default:
        return { bgColor: 'var(--theme-elevation-100, #f5f5f5)', borderColor: 'var(--theme-elevation-200, #e8e8e8)' }
    }
  }

  const currentActionsList = userActions.length > 0 ? userActions : defaultActions

  const activeActions = currentActionsList.map(item => {
    const matched = routeMap[item.route || ''] || {
      title: { en: item.customLabel || item.route || 'Action', zh: item.customLabel || item.route || '快捷操作' },
      description: { en: 'Custom navigation shortcut', zh: '自定义快捷访问入口' },
      icon: '🚀'
    }
    const colors = getColorStyles(item.colorPreset)

    return {
      title: { 
        zh: item.customLabel || matched.title.zh, 
        en: item.customLabel || matched.title.en 
      },
      description: matched.description,
      href: item.route || '#',
      icon: matched.icon,
      bgColor: colors.bgColor,
      borderColor: colors.borderColor,
    }
  })

  return (
    <div className="dashboard-widget quick-actions-widget">
      <div className="widget-header">
        <div className="header-left">
          <h3>🚀 {activeActions[0]?.title?.zh ? '我的专属快捷工作台 (My Quick Actions)' : 'My Quick Actions'}</h3>
          <span className="widget-subtitle">
            {userActions.length > 0 ? '您个人专属的常态化操作入口' : '默认常规操作直达 (可前往个人账号设置自由定制)'}
          </span>
        </div>
        <Link href="/admin/account" className="view-all-link">
          ⚙️ 定制我的工作台 →
        </Link>
      </div>
      {loading ? (
        <div className="loading-placeholder" style={{ padding: '20px 0' }}>正在加载您的工作台配置...</div>
      ) : (
        <div className="quick-actions-grid">
          {activeActions.map((action, index) => (
            <Link href={action.href} key={index} className="quick-action-card" style={{ backgroundColor: action.bgColor, borderColor: action.borderColor }}>
              <span className="action-icon">{action.icon}</span>
              <div className="action-info">
                <h4>{action.title.zh || action.title.en}</h4>
                {action.description.zh && <p>{action.description.zh}</p>}
              </div>
              <span className="action-arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
