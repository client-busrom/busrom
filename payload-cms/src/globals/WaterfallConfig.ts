import type { GlobalConfig } from 'payload'

export const WaterfallConfig: GlobalConfig = {
  slug: 'waterfall-config',
  label: {
    en: 'Waterfall Config',
    zh: '瀑布流配置',
  },
  admin: {
    group: {
      en: 'Website Settings',
      zh: '网站设置',
    },
  },
  access: {
    read: () => true,
    update: () => true,
  },
  fields: [
    {
      name: 'imageStaggerDelay',
      type: 'number',
      defaultValue: 0.2,
      label: {
        en: 'Image Stagger Delay (seconds)',
        zh: '图片出现间隔时间（秒）',
      },
    },
    {
      name: 'imageAnimationDuration',
      type: 'number',
      defaultValue: 0.8,
      label: {
        en: 'Image Animation Duration (seconds)',
        zh: '图片动画时长（秒）',
      },
    },
    {
      name: 'imageHoldDuration',
      type: 'number',
      defaultValue: 2.0,
      label: {
        en: 'Image Hold Duration (seconds)',
        zh: '图片停留时间（秒）',
      },
    },
    {
      name: 'textAnimationDuration',
      type: 'number',
      defaultValue: 0.8,
      label: {
        en: 'Text Animation Duration (seconds)',
        zh: '文字动画时长（秒）',
      },
    },
    {
      name: 'textHoldDuration',
      type: 'number',
      defaultValue: 3.0,
      label: {
        en: 'Text Hold Duration (seconds)',
        zh: '文字停留时间（秒）',
      },
    },
  ],
}
