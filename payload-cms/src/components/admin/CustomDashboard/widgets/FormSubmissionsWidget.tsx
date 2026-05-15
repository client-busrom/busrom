'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface FormSubmission {
  id: string
  formName: string
  status: 'UNREAD' | 'READ' | 'ARCHIVED'
  country?: string
  city?: string
  chinaTime?: string
  submittedAt: string
}

export const FormSubmissionsWidget: React.FC = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/form-submissions?limit=5&sort=-submittedAt')
        if (response.ok) {
          const data = await response.json()
          setSubmissions(data.docs || [])
        } else {
          setError('Failed to fetch form submissions')
        }
      } catch (err: any) {
        setError(err?.message || 'Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [])

  return (
    <div className="dashboard-widget form-submissions-widget">
      <div className="widget-header">
        <div className="header-left">
          <h3>💼 最新客户询盘与表单 (Form Submissions)</h3>
          <span className="widget-subtitle">实时来自客户的业务咨询与留言</span>
        </div>
        <Link href="/admin/collections/form-submissions" className="view-all-link">
          查看全部询盘 →
        </Link>
      </div>

      <div className="widget-content">
        {loading ? (
          <div className="loading-placeholder">正在加载最新询盘数据...</div>
        ) : error ? (
          <div className="error-placeholder">无法拉取询盘: {error}</div>
        ) : submissions.length === 0 ? (
          <div className="empty-placeholder">
            <p>暂无客户表单留言记录。</p>
            <span className="empty-sub">新提交的客户留言和业务询盘将实时在此列出。</span>
          </div>
        ) : (
          <div className="submissions-list">
            {submissions.map((sub) => (
              <Link href={`/admin/collections/form-submissions/${sub.id}`} className="submission-item-card" key={sub.id}>
                <div className="sub-item-top">
                  <span className="sub-form-name">📋 {sub.formName || '通用表单'}</span>
                  <span className={`sub-status ${sub.status === 'UNREAD' ? 'unread' : 'read'}`}>
                    {sub.status === 'UNREAD' ? '🔴 未读 (Unread)' : '⚪ 已读 (Read)'}
                  </span>
                </div>
                <div className="sub-item-geo">
                  📍 来源地区: {sub.country || '未知国家'} {sub.city || ''}
                </div>
                <div className="sub-item-time">
                  ⏰ 提交时间: {sub.chinaTime || new Date(sub.submittedAt).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
