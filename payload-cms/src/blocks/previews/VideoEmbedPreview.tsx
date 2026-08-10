/**
 * Video Embed Block Preview Component
 */
'use client'

import React from 'react'

interface VideoEmbedPreviewProps {
  data: {
    url?: string
    title?: string
    aspectRatio?: '16:9' | '4:3' | '1:1'
  }
}

export const VideoEmbedPreview: React.FC<VideoEmbedPreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🎥 Loading...</p>
      </div>
    )
  }

  const { url, title, aspectRatio = '16:9' } = data

  if (!url) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#999', margin: 0 }}>🎥 No video URL provided</p>
      </div>
    )
  }

  const aspectRatioValues = {
    '16:9': '56.25%',
    '4:3': '75%',
    '1:1': '100%',
  }

  // Convert YouTube/Vimeo URLs to embed URLs
  const getEmbedUrl = (videoUrl: string): string => {
    // YouTube
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.includes('youtu.be')
        ? videoUrl.split('youtu.be/')[1]?.split('?')[0]
        : new URLSearchParams(new URL(videoUrl).search).get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl
    }
    // Vimeo
    if (videoUrl.includes('vimeo.com')) {
      const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : videoUrl
    }
    // Instagram
    const igMatch = videoUrl.match(/instagram\.com\/(p|reels?|tv)\/([\w-]+)/)
    if (igMatch) {
      const type = igMatch[1] === 'reels' ? 'reel' : igMatch[1]
      return `https://www.instagram.com/${type}/${igMatch[2]}/embed`
    }
    return videoUrl
  }

  const embedUrl = getEmbedUrl(url)

  return (
    <div style={{ margin: '1rem 0' }}>
      {title && (
        <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
      )}
      <div
        style={{
          position: 'relative',
          paddingBottom: aspectRatioValues[aspectRatio],
          height: 0,
          overflow: 'hidden',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
    </div>
  )
}
