/**
 * Video Embed Block
 *
 * Embeds videos from YouTube, Vimeo, or other platforms
 * Migrated from Keystone component-blocks/components/video-embed.tsx
 */

import type { Block } from 'payload'

export const VideoEmbed: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  labels: {
    singular: {
      en: '🎥 Video Embed',
      zh: '🎥 视频嵌入',
    },
    plural: {
      en: 'Video Embeds',
      zh: '视频嵌入',
    },
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: {
        en: 'Video URL',
        zh: '视频链接',
      },
      admin: {
        placeholder: 'https://www.youtube.com/watch?v=...',
        description: 'YouTube, Vimeo, or other video platform URL',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: {
        en: 'Caption',
        zh: '说明',
      },
    },
    {
      name: 'aspectRatio',
      type: 'select',
      label: {
        en: 'Aspect Ratio',
        zh: '宽高比',
      },
      defaultValue: '16:9',
      options: [
        { label: '16:9 (Widescreen)', value: '16:9' },
        { label: '4:3 (Standard)', value: '4:3' },
        { label: '1:1 (Square)', value: '1:1' },
      ],
    },
  ],
}
