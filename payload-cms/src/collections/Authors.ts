import type { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'updatedAt'],
    group: {
      en: 'Blogs',
      zh: '博客/资讯',
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: {
            en: 'Full Name',
            zh: '姓名',
          },
        },
        {
          name: 'role',
          type: 'text',
          label: {
            en: 'Role / Title',
            zh: '职位/头衔',
          },
          admin: {
            placeholder: 'e.g. Writer, Editor, Interior Expert',
          },
        },
      ],
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: {
        en: 'Avatar',
        zh: '头像',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: {
        en: 'Short Bio',
        zh: '简介/寄语',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: {
        en: 'Social Links',
        zh: '社交媒体链接',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              options: [
                { label: 'Instagram', value: 'instagram' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Twitter (X)', value: 'twitter' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'Pinterest', value: 'pinterest' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'Website', value: 'website' },
              ],
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'URL',
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      label: 'Slug',
      admin: {
        position: 'sidebar',
        description: 'Used for author profile pages',
      },
    },
  ],
}
