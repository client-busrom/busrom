import type { CollectionConfig } from 'payload'

export const IndexingLogs: CollectionConfig = {
  slug: 'indexing-logs',
  labels: {
    singular: {
      en: 'SEO Push Log',
      zh: 'SEO 收录日志',
    },
    plural: {
      en: 'SEO Push Logs',
      zh: 'SEO 收录日志',
    },
  },
  admin: {
    useAsTitle: 'targetUrl',
    defaultColumns: ['targetUrl', 'engine', 'action', 'status', 'createdAt'],
    group: {
      en: 'System Status',
      zh: '系统运行状态',
    },
  },
  access: {
    // Only system (hook) can create
    create: () => false,
    // Only system (hook) can update
    update: () => false,
    // Anyone who can log in can read
    read: ({ req: { user } }) => !!user,
    // Admins can delete old logs if they want
    delete: ({ req: { user } }) => user?.isAdmin === true,
  },
  fields: [
    {
      name: 'targetUrl',
      type: 'text',
      label: {
        en: 'Target URL',
        zh: '目标链接',
      },
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'engine',
      type: 'select',
      options: [
        { label: 'Google Indexing API', value: 'google' },
        { label: 'IndexNow (Bing/Yandex)', value: 'indexnow' },
      ],
      label: {
        en: 'Search Engine',
        zh: '推送渠道',
      },
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Update (Publish)', value: 'update' },
        { label: 'Delete (Draft/Archive)', value: 'delete' },
      ],
      label: {
        en: 'Action Type',
        zh: '推送类型',
      },
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: '✅ Success', value: 'success' },
        { label: '❌ Failed: Invalid Keys', value: 'failed_keys' },
        { label: '❌ Failed: Network/Other', value: 'failed_network' },
      ],
      label: {
        en: 'Status',
        zh: '推送状态',
      },
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'triggerUser',
      type: 'relationship',
      relationTo: 'users',
      label: {
        en: 'Triggered By',
        zh: '触发人',
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'rawResponse',
      type: 'json',
      label: {
        en: 'API Response / Error',
        zh: '接口返回或报错',
      },
      admin: {
        readOnly: true,
      },
    },
  ],
}
