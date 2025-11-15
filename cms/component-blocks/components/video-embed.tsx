/**
 * Video Embed Component Block
 *
 * Embeds YouTube or Vimeo videos with autoplay option.
 */

import React from 'react'
import { component, fields } from '@keystone-6/fields-document/component-blocks'

export const videoEmbed = component({
  label: '🎬 Video Embed',
  schema: {
    platform: fields.select({
      label: 'Platform',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
      ],
      defaultValue: 'youtube',
    }),
    videoId: fields.text({
      label: 'Video ID',
    }),
    text: fields.text({
      label: 'Caption',
      defaultValue: ''
    }),
    autoplay: fields.checkbox({
      label: 'Autoplay',
      defaultValue: false,
    }),
  },
  preview: (props) => {
    const platform = props.fields.platform.value
    const videoId = props.fields.videoId.value

    const embedUrl = platform === 'youtube'
      ? `https://www.youtube.com/embed/${videoId}${props.fields.autoplay.value ? '?autoplay=1' : ''}`
      : `https://player.vimeo.com/video/${videoId}${props.fields.autoplay.value ? '?autoplay=1' : ''}`

    return (
      <div>
        {videoId ? (
          <iframe
            width="100%"
            height="315"
            src={embedUrl}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: '8px' }}
          />
        ) : (
          <div style={{
            padding: '60px',
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            🎬 Enter Video ID
          </div>
        )}
        {props.fields.text.value && (
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            {props.fields.text.value}
          </p>
        )}
      </div>
    )
  },
  chromeless: false,
})
