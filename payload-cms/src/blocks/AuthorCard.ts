import type { Block } from 'payload'

export const AuthorCard: Block = {
  slug: 'authorCard',
  labels: {
    singular: {
      en: 'Author Card',
      zh: '作者名片',
    },
    plural: {
      en: 'Author Cards',
      zh: '作者名片',
    },
  },
  admin: {
    group: 'Content Blocks',
  },
  fields: [
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
      label: {
        en: 'Select Author',
        zh: '选择作者',
      },
    },
    {
      name: 'displayFields',
      type: 'select',
      hasMany: true,
      label: {
        en: 'Visible Fields',
        zh: '显示字段',
      },
      defaultValue: ['avatar', 'name', 'role', 'bio'],
      options: [
        { label: 'Avatar', value: 'avatar' },
        { label: 'Name', value: 'name' },
        { label: 'Role', value: 'role' },
        { label: 'Bio / Quote', value: 'bio' },
        { label: 'Social Links', value: 'socialLinks' },
      ],
    },
    {
      name: 'customBio',
      type: 'textarea',
      label: {
        en: 'Custom Quote (Override)',
        zh: '自定义寄语 (覆盖)',
      },
      admin: {
        description: 'Leave empty to use the author\'s default bio',
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: {
        en: 'Background Color',
        zh: '背景颜色',
      },
      defaultValue: '#fbfcf4', // Default to Reland/Jules cream
    },
  ],
}
