/**
 * VideoEmbedComponent - WYSIWYG Preview Component
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useTranslation } from '@payloadcms/ui'
import { Video as VideoIcon } from 'lucide-react'
import type { VideoEmbedData } from './node'
import { $createVideoEmbedNode, VideoEmbedNode } from './node'

interface VideoEmbedComponentProps {
  nodeKey: string
  [key: string]: any
}

// 解析视频 URL 并生成嵌入代码
const getEmbedUrl = (url: string): string | null => {
  if (!url) return null

  // YouTube
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  // Vimeo
  const vimeoRegex = /vimeo\.com\/(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // Bilibili
  const bilibiliRegex = /bilibili\.com\/video\/(BV[\w]+)/
  const bilibiliMatch = url.match(bilibiliRegex)
  if (bilibiliMatch) {
    return `https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}`
  }

  // 如果已经是 embed URL，直接返回
  if (url.includes('embed') || url.includes('player')) {
    return url
  }

  return null
}

export const VideoEmbedComponent: React.FC<VideoEmbedComponentProps> = (props) => {
  const [editor] = useLexicalComposerContext()
  const [isEditing, setIsEditing] = useState(false)
  const { t, i18n } = useTranslation()

  const nodeData = (props as any).data || (props as any).node?.__data || (props as any).__data
  const nodeKey = props.nodeKey

  const [formData, setFormData] = useState<VideoEmbedData>(
    nodeData || {
      url: '',
      caption: '',
      aspectRatio: '16:9',
    },
  )

  const data = isEditing ? formData : nodeData || formData

  useEffect(() => {
    if (!isEditing && nodeData) {
      setFormData(nodeData)
    }
  }, [nodeData, isEditing])

  const handleSave = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node && node instanceof VideoEmbedNode) {
        const newNode = $createVideoEmbedNode(formData)
        node.replace(newNode)
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(nodeData || formData)
    setIsEditing(false)
  }

  const getAspectRatioLabel = (ratio: string) => {
    const labels: Record<string, string> = {
      '16:9': i18n?.language === 'zh' ? '16:9 (宽屏)' : '16:9 (Widescreen)',
      '4:3': i18n?.language === 'zh' ? '4:3 (标准)' : '4:3 (Standard)',
      '1:1': i18n?.language === 'zh' ? '1:1 (正方形)' : '1:1 (Square)',
    }
    return labels[ratio] || ratio
  }

  const getAspectRatioPadding = (ratio: string) => {
    const ratios: Record<string, string> = {
      '16:9': '56.25%',
      '4:3': '75%',
      '1:1': '100%',
    }
    return ratios[ratio] || '56.25%'
  }

  const embedUrl = getEmbedUrl(data.url)

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '16px',
        margin: '16px 0',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <VideoIcon size={20} style={{ color: '#6b7280' }} />
          <strong style={{ color: '#374151', fontSize: '14px', fontWeight: 600 }}>
            {i18n?.language === 'zh' ? '视频嵌入' : 'Video Embed'}
          </strong>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#A08745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                {i18n?.language === 'zh' ? '保存' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                {i18n?.language === 'zh' ? '取消' : 'Cancel'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                padding: '6px 14px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {i18n?.language === 'zh' ? '编辑' : 'Edit'}
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 视频 URL */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '视频链接' : 'Video URL'}
            </label>
            <input
              type="text"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {i18n?.language === 'zh'
                ? '支持 YouTube、Vimeo、Bilibili 等视频平台'
                : 'Supports YouTube, Vimeo, Bilibili, and more'}
            </div>
          </div>

          {/* 说明 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '说明' : 'Caption'}
            </label>
            <input
              type="text"
              value={formData.caption || ''}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder={i18n?.language === 'zh' ? '输入视频说明（可选）' : 'Enter caption (optional)'}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 宽高比 */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {i18n?.language === 'zh' ? '宽高比' : 'Aspect Ratio'}
            </label>
            <select
              value={formData.aspectRatio}
              onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value as any })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              <option value="16:9">{getAspectRatioLabel('16:9')}</option>
              <option value="4:3">{getAspectRatioLabel('4:3')}</option>
              <option value="1:1">{getAspectRatioLabel('1:1')}</option>
            </select>
          </div>
        </div>
      ) : (
        <div>
          {data.url && embedUrl ? (
            <div>
              {/* 视频播放器 */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: getAspectRatioPadding(data.aspectRatio),
                  backgroundColor: '#000',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <iframe
                  src={embedUrl}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {/* 说明 */}
              {data.caption && (
                <p style={{
                  marginTop: '8px',
                  fontSize: '14px',
                  color: '#6b7280',
                  textAlign: 'center',
                  marginBottom: 0,
                }}>
                  {data.caption}
                </p>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#9ca3af',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '2px dashed #d1d5db',
              }}
            >
              <VideoIcon size={32} style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                {i18n?.language === 'zh' ? '未设置视频链接' : 'No video URL set'}
              </p>
              {data.url && (
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444' }}>
                  {i18n?.language === 'zh' ? '无法解析视频链接' : 'Unable to parse video URL'}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
