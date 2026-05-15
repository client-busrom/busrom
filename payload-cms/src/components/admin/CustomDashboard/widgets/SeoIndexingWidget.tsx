'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface IndexingLog {
  id: string
  targetUrl: string
  engine: 'google' | 'indexnow'
  action?: 'update' | 'delete'
  status: 'success' | 'failed_keys' | 'failed_network'
  createdAt: string
}

export const SeoIndexingWidget: React.FC = () => {
  const [logs, setLogs] = useState<IndexingLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/indexing-logs?limit=5&sort=-createdAt')
        if (response.ok) {
          const data = await response.json()
          setLogs(data.docs || [])
        } else {
          setError('Failed to fetch SEO logs')
        }
      } catch (err: any) {
        setError(err?.message || 'Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const getStatusBadge = (status: IndexingLog['status']) => {
    switch (status) {
      case 'success':
        return <span className="status-badge success">✅ 成功 (Success)</span>
      case 'failed_keys':
        return <span className="status-badge failed">❌ 密钥无效 (Invalid Keys)</span>
      case 'failed_network':
        return <span className="status-badge failed">❌ 网络失败 (Network Error)</span>
      default:
        return <span className="status-badge unknown">未知 (Unknown)</span>
    }
  }

  const getActionBadge = (action?: IndexingLog['action']) => {
    if (action === 'delete') {
      return <span className="action-badge delete">🗑️ 下线删链 (Delete)</span>
    }
    return <span className="action-badge update">🚀 发布推送 (Publish)</span>
  }

  return (
    <div className="dashboard-widget seo-indexing-widget">
      <div className="widget-header">
        <div className="header-left">
          <h3>📈 我的 SEO 收录动态 (SEO Indexing Status)</h3>
          <span className="widget-subtitle">搜索引擎自动化提交反馈</span>
        </div>
        <Link href="/admin/collections/indexing-logs" className="view-all-link">
          查看全部日志 →
        </Link>
      </div>

      <div className="widget-content">
        {loading ? (
          <div className="loading-placeholder">正在加载最新收录日志...</div>
        ) : error ? (
          <div className="error-placeholder">无法拉取日志: {error}</div>
        ) : logs.length === 0 ? (
          <div className="empty-placeholder">
            <p>暂无 SEO 收录日志记录。</p>
            <span className="empty-sub">发布或下线产品/文章后将自动在此生成推送反馈。</span>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map((log) => (
              <div className="log-item-card" key={log.id}>
                <div className="log-item-top">
                  <span className="log-engine">
                    {log.engine === 'google' ? '🌐 Google Indexing' : '⚡ IndexNow (Bing/Yandex)'}
                  </span>
                  <div className="log-badges">
                    {getActionBadge(log.action)}
                    {getStatusBadge(log.status)}
                  </div>
                </div>
                <div className="log-item-url" title={log.targetUrl}>
                  {log.targetUrl}
                </div>
                <div className="log-item-time">
                  推送时间: {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
