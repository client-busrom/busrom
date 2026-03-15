import { GlobalConfig } from 'payload'

export const SystemSettings: GlobalConfig = {
  slug: 'system-settings',
  label: {
    en: 'System Settings',
    zh: '系统全局配置',
  },
  admin: {
    group: 'System',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => (user as any)?.isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Admin UI',
            zh: '管理后台界面',
          },
          fields: [
            {
              name: 'adminBannerText',
              type: 'text',
              localized: true,
              label: {
                en: 'Admin Panel Global Announcement',
                zh: '后台全站公告栏文字',
              },
              admin: {
                description: {
                  en: 'This text will appear at the very top of the admin panel for all users.',
                  zh: '此文字将显示在管理后台的最顶部，对所有用户可见。',
                },
              },
            },
            {
              name: 'adminBannerType',
              type: 'select',
              defaultValue: 'info',
              options: [
                { label: { en: 'Info (Blue)', zh: '常规 (蓝色)' }, value: 'info' },
                { label: { en: 'Warning (Yellow)', zh: '警告 (黄色)' }, value: 'warning' },
                { label: { en: 'Success (Green)', zh: '成功 (绿色)' }, value: 'success' },
                { label: { en: 'Critical (Red)', zh: '紧急 (红色)' }, value: 'error' },
              ],
              label: {
                en: 'Banner Style',
                zh: '公告栏样式',
              },
            },
            {
              name: 'showBanner',
              type: 'checkbox',
              defaultValue: false,
              label: {
                en: 'Show Announcement Bar',
                zh: '启用公告栏',
              },
            },
          ],
        },
      ],
    },
  ],
}
