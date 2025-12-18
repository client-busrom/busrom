import type { Field } from 'payload'

export const focalPointField: Field = {
  name: 'focalPointData',
  type: 'group',
  label: 'Focal Point | 焦点位置',
  admin: {
    description: 'Custom focal point for image cropping | 图片裁剪的自定义焦点',
    components: {
      Field: '/components/fields/FocalPointField/Component#FocalPointFieldComponent',
    },
  },
  fields: [
    {
      name: 'x',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 50,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'y',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 50,
      admin: {
        hidden: true,
      },
    },
  ],
}
