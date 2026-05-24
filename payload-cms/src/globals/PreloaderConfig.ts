/**
 * PreloaderConfig Global
 *
 * Configuration for homepage preloader/loading animation
 * Allows CMS management of:
 * - Logo SVG for loading animation
 * - Image Wall images via relationship to ImageWallItems collection
 * - Animation timing and colors
 */

import type { GlobalConfig } from 'payload'

export const PreloaderConfig: GlobalConfig = {
  slug: 'preloader-config',
  label: {
    en: 'Preloader Config',
    zh: '加载动画配置',
  },
  admin: {
    group: {
      en: 'Website Settings',
      zh: '网站设置',
    },
  },
  // versions: true,
  access: {
    read: () => true,
    update: () => true,
  },
  hooks: {
    afterRead: [
      async ({ doc, req: { payload } }) => {
        const { getApplicationImage } = await import('@/utilities/getApplicationImage')

        // Resolve images for all related image wall items
        const items = doc.imageWallItems || []
        if (!Array.isArray(items) || items.length === 0) return doc

        const resolvedItems = await Promise.all(
          items.map(async (item: any) => {
            if (!item?.image) return item
            const resolved = await getApplicationImage(payload, item.image)
            return { ...item, imageResolved: resolved }
          })
        )

        return { ...doc, imageWallItems: resolvedItems }
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ----------------------------------------------------------
        // Tab 1: Loading Animation Settings
        // ----------------------------------------------------------
        {
          label: {
            en: 'Loading Animation',
            zh: '加载动画',
          },
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
              label: {
                en: 'Enable Preloader',
                zh: '启用加载动画',
              },
              admin: {
                description: {
                  en: 'Turn off to skip loading animation',
                  zh: '关闭后跳过加载动画',
                },
              },
            },
            {
              name: 'backgroundColor',
              type: 'text',
              defaultValue: '#EBE6D8',
              label: {
                en: 'Background Color',
                zh: '背景颜色',
              },
              admin: {
                description: {
                  en: 'Hex color code (e.g., #EBE6D8)',
                  zh: '十六进制颜色代码',
                },
              },
            },
            {
              name: 'textColor',
              type: 'text',
              defaultValue: '#EBE6D8',
              label: {
                en: 'Text Color',
                zh: '文字颜色',
              },
              admin: {
                description: {
                  en: 'Color for loading text',
                  zh: '加载文字颜色',
                },
              },
            },
            {
              name: 'highlightColor',
              type: 'text',
              defaultValue: '#000000',
              label: {
                en: 'Highlight Color',
                zh: '高亮颜色',
              },
              admin: {
                description: {
                  en: 'Color for shine effect',
                  zh: '闪光效果颜色',
                },
              },
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 2: Image Wall Settings
        // ----------------------------------------------------------
        {
          label: {
            en: 'Image Wall',
            zh: '图片墙',
          },
          fields: [
            {
              name: 'imageWallEnabled',
              type: 'checkbox',
              defaultValue: true,
              label: {
                en: 'Enable Image Wall',
                zh: '启用图片墙',
              },
              admin: {
                description: {
                  en: 'Show image wall after loading animation',
                  zh: '加载动画后显示图片墙',
                },
              },
            },
            {
              name: 'imageWallItems',
              type: 'relationship',
              relationTo: 'image-wall-items',
              hasMany: true,
              label: {
                en: 'Image Wall Items',
                zh: '图片墙项',
              },
              admin: {
                description: {
                  en: 'Select image wall items in display order. Create items in Image Wall Items collection first.',
                  zh: '按显示顺序选择图片墙项。请先在"图片墙项"集合中创建项目。',
                },
              },
            },
          ],
        },

        // ----------------------------------------------------------
        // Tab 3: Animation Timing
        // ----------------------------------------------------------
        {
          label: {
            en: 'Animation Timing',
            zh: '动画时长',
          },
          fields: [
            {
              name: 'loadingDuration',
              type: 'number',
              defaultValue: 2.5,
              min: 1,
              max: 5,
              label: {
                en: 'Loading Progress Duration (seconds)',
                zh: '加载进度时长（秒）',
              },
              admin: {
                description: {
                  en: 'How long the 0-100% progress takes',
                  zh: '0-100%进度条持续时间',
                },
                step: 0.5,
              },
            },
            {
              name: 'logoAnimationDuration',
              type: 'number',
              defaultValue: 2,
              min: 0.5,
              max: 4,
              label: {
                en: 'Logo Animation Duration (seconds)',
                zh: 'Logo动画时长（秒）',
              },
              admin: {
                description: {
                  en: 'Duration of logo reveal animation',
                  zh: 'Logo展示动画时长',
                },
                step: 0.5,
              },
            },
            {
              name: 'imageWallDuration',
              type: 'number',
              defaultValue: 0.8,
              min: 0.3,
              max: 2,
              label: {
                en: 'Image Wall Animation Duration (seconds)',
                zh: '图片墙动画时长（秒）',
              },
              admin: {
                description: {
                  en: 'Duration for each image to appear',
                  zh: '每张图片出现的动画时长',
                },
                step: 0.1,
              },
            },
            {
              name: 'imageWallStagger',
              type: 'number',
              defaultValue: 0.2,
              min: 0.1,
              max: 0.5,
              label: {
                en: 'Image Stagger Delay (seconds)',
                zh: '图片错开延迟（秒）',
              },
              admin: {
                description: {
                  en: 'Delay between each image appearing',
                  zh: '每张图片之间的延迟',
                },
                step: 0.05,
              },
            },
          ],
        },
      ],
    },
  ],
}
