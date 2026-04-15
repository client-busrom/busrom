
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useField, useDocumentInfo, useTranslation } from '@payloadcms/ui'
import '../CategoryProductManager/styles.scss'

interface BlogData {
  id: string
  title: string | Record<string, string>
  slug: string
  status: string
  coverImage?: any
  publishedAt?: string
}

export const CategoryBlogManager: React.FC<{ path: string }> = ({ path }) => {
  // Map UI field path to actual relationship field path
  // In Categories: blogPostsManager -> blogPosts
  // In BlogTags: blogsManager -> blogs
  const targetPath = path.endsWith('Manager') ? path.replace('Manager', '') : path
  const { value: blogIds, setValue } = useField<string[]>({ path: targetPath })
  const { i18n } = useTranslation()
  const locale = i18n.language
  
  const [blogs, setBlogs] = useState<BlogData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch full blog data for the linked IDs
  useEffect(() => {
    if (!blogIds || blogIds.length === 0) {
      setBlogs([])
      return
    }

    const fetchBlogs = async () => {
      setIsLoading(true)
      try {
        const query = blogIds.map((id, index) => `where[id][in][${index}]=${id}`).join('&')
        const response = await fetch(`/api/blogs?limit=${blogIds.length}&depth=1&${query}`)
        if (response.ok) {
          const data = await response.json()
          // Re-sort based on blogIds order to maintain user's manual sorting
          const sortedDocs = blogIds
            .map(id => data.docs.find((doc: any) => doc.id === id))
            .filter(Boolean)
          setBlogs(sortedDocs as BlogData[])
        }
      } catch (err) {
        console.error('Failed to fetch blog data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogs()
  }, [blogIds])

  const removeBlog = useCallback((blogId: string) => {
    const newVal = (blogIds || []).filter(id => id !== blogId)
    setValue(newVal)
  }, [blogIds, setValue])

  const moveBlog = useCallback((index: number, direction: 'up' | 'down') => {
    if (!blogIds) return
    const newIds = [...blogIds]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newIds.length) return
    
    const [moved] = newIds.splice(index, 1)
    newIds.splice(targetIndex, 0, moved)
    setValue(newIds)
  }, [blogIds, setValue])

  const getBlogTitle = (title: any) => {
    if (!title) return 'Untitled'
    if (typeof title === 'string') return title
    return title[locale] || title.en || title.zh || 'Untitled'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      published: i18n.language === 'zh' ? '已发布' : 'Published',
      draft: i18n.language === 'zh' ? '草稿' : 'Draft',
      archived: i18n.language === 'zh' ? '归档' : 'Archived',
    }
    return labels[status] || status
  }

  return (
    <div className="category-product-manager">
      <div className="category-product-manager__header">
        <h4>{i18n.language === 'zh' ? '知识库文章管理' : 'Blog Management'}</h4>
        {isLoading && <span className="loading-spinner">...</span>}
      </div>

      <div className="category-product-manager__content">
        {blogs.length === 0 ? (
          <div className="category-product-manager__empty">
            {i18n.language === 'zh' ? '暂无关联文章，请在上方选择文章' : 'No blogs linked. Select blogs above.'}
          </div>
        ) : (
          <table className="category-product-manager__table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>{i18n.language === 'zh' ? '排序' : 'Sort'}</th>
                <th>{i18n.language === 'zh' ? '文章信息' : 'Blog Post'}</th>
                <th style={{ width: '120px' }}>{i18n.language === 'zh' ? '状态' : 'Status'}</th>
                <th style={{ width: '150px' }}>{i18n.language === 'zh' ? '发布时间' : 'Published At'}</th>
                <th style={{ width: '100px' }}>{i18n.language === 'zh' ? '操作' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog, index) => (
                <tr key={blog.id}>
                  <td>
                    <div className="category-product-manager__actions-cell" style={{ textAlign: 'left', width: 'auto' }}>
                      <button type="button" className="action-btn" onClick={() => moveBlog(index, 'up')} disabled={index === 0}>▲</button>
                      <button type="button" className="action-btn" onClick={() => moveBlog(index, 'down')} disabled={index === blogs.length - 1}>▼</button>
                    </div>
                  </td>
                  <td>
                    <div className="category-product-manager__product-info">
                      {blog.coverImage?.url && <img src={blog.coverImage.url} alt="" />}
                      <div className="details">
                        <span className="name">{getBlogTitle(blog.title)}</span>
                        <span className="sku">{blog.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-tag status-${blog.status}`}>
                      {getStatusLabel(blog.status)}
                    </span>
                  </td>
                  <td>
                    {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="category-product-manager__actions-cell">
                    <a href={`/admin/collections/blogs/${blog.id}`} target="_blank" rel="noreferrer" className="action-btn" title="Edit Blog">↗</a>
                    <button type="button" className="action-btn action-btn--delete" onClick={() => removeBlog(blog.id)} title="Remove Link">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="save-hint">
        {i18n.language === 'zh' 
          ? '* 排序和增删需保存当前文档后生效。' 
          : '* Sorting and adding/removing require saving the current document to take effect.'}
      </div>
    </div>
  )
}

export default CategoryBlogManager
