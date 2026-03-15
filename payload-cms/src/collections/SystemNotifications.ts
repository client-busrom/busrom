import { CollectionConfig } from 'payload'

export const SystemNotifications: CollectionConfig = {
  slug: 'system-notifications',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'type', 'status', 'createdAt'],
    group: 'System',
    listSearchableFields: ['subject', 'content'],
  },
  access: {
    read: () => true, // System notifications are readable by all admins
    create: ({ req: { user } }) => (user as any)?.isAdmin,
    update: ({ req: { user } }) => (user as any)?.isAdmin,
    delete: ({ req: { user } }) => (user as any)?.isAdmin,
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      label: {
        en: 'Subject',
        zh: '主题',
      },
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: { en: 'Info', zh: '信息' }, value: 'info' },
        { label: { en: 'Warning', zh: '警告' }, value: 'warning' },
        { label: { en: 'Success', zh: '成功' }, value: 'success' },
        { label: { en: 'Critical', zh: '紧急' }, value: 'error' },
      ],
      label: {
        en: 'Type',
        zh: '类型',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'PUBLISHED',
      options: [
        { label: { en: 'Draft', zh: '草稿' }, value: 'DRAFT' },
        { label: { en: 'Published', zh: '已发布' }, value: 'PUBLISHED' },
        { label: { en: 'Archived', zh: '已归档' }, value: 'ARCHIVED' },
      ],
      label: {
        en: 'Status',
        zh: '状态',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: {
        en: 'Content',
        zh: '内容说明',
      },
    },
    {
      name: 'isGlobalBanner',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: 'Display as Global Banner',
        zh: '作为全局横幅显示',
      },
      admin: {
        description: {
          en: 'If checked, this notification will appear at the top of the admin panel for all users.',
          zh: '勾选后，此通知将显示在所有用户的管理后台顶部。',
        },
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: {
        en: 'Expiry Date',
        zh: '过期时间',
      },
      admin: {
        description: {
          en: 'Notifications will be automatically hidded after this date.',
          zh: '过此时间后通知将自动隐藏。',
        },
      },
    },
  ],
  timestamps: true,
}
