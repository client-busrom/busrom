/**
 * PreloaderConfig Global
 *
 * Configuration for homepage preloader/loading animation
 * Allows CMS management of:
 * - Logo SVG for loading animation
 * - Image Wall images with position/size settings
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
    update: ({ req: { user } }) => !!user,
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
              name: 'images',
              type: 'array',
              label: {
                en: 'Image Wall Images',
                zh: '图片墙图片',
              },
              labels: {
                singular: {
                  en: 'Image',
                  zh: '图片',
                },
                plural: {
                  en: 'Images',
                  zh: '图片',
                },
              },
              admin: {
                description: {
                  en: 'Add images for the image wall animation. Each image can have custom position and size.',
                  zh: '添加图片墙动画的图片，每张图片可以自定义位置和大小。',
                },
                initCollapsed: false,
                components: {
                  RowLabel: '@/components/fields/MediaArrayRowLabel',
                },
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: {
                    en: 'Image',
                    zh: '图片',
                  },
                  admin: {
                    description: {
                      en: 'Select an image from media library',
                      zh: '从媒体库选择图片',
                    },
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'positionTop',
                      type: 'number',
                      defaultValue: 50,
                      min: 0,
                      max: 100,
                      label: {
                        en: 'Position Top (%)',
                        zh: '顶部位置 (%)',
                      },
                      admin: {
                        width: '25%',
                        description: '0-100%',
                      },
                    },
                    {
                      name: 'positionLeft',
                      type: 'number',
                      defaultValue: 50,
                      min: 0,
                      max: 100,
                      label: {
                        en: 'Position Left (%)',
                        zh: '左侧位置 (%)',
                      },
                      admin: {
                        width: '25%',
                        description: '0-100%',
                      },
                    },
                    {
                      name: 'aspectRatio',
                      type: 'select',
                      defaultValue: '9 / 6',
                      options: [
                        { label: '9:16 (Vertical)', value: '9 / 16' },
                        { label: '9:12 (Tall)', value: '9 / 12' },
                        { label: '9:6 (Landscape)', value: '9 / 6' },
                        { label: '1:1 (Square)', value: '1 / 1' },
                        { label: '16:9 (Wide)', value: '16 / 9' },
                      ],
                      label: {
                        en: 'Aspect Ratio',
                        zh: '宽高比',
                      },
                      admin: {
                        width: '25%',
                      },
                    },
                    {
                      name: 'widthScale',
                      type: 'number',
                      defaultValue: 1.0,
                      min: 0.5,
                      max: 2.0,
                      label: {
                        en: 'Width Scale',
                        zh: '宽度缩放',
                      },
                      admin: {
                        width: '25%',
                        description: '0.5 - 2.0',
                        step: 0.1,
                      },
                    },
                  ],
                },
              ],
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
