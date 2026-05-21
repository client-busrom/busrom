'use client'

/**
 * HeroBannerImagePicker
 *
 * HeroBannerItems 专用的图片选择器包装组件。
 * 根据当前 order 值和图片字段名，自动选择对应的裁剪预设。
 *
 * 预设映射规则：
 * - order=1 (Banner1): image1→背景(通用), image2→Frame1, image3→Frame2
 * - order=2 (Banner2): image1→背景(通用), image2→大图, image3→小图
 * - order=3 (Banner3): image2→列图
 * - order=4 (Banner4): image2→列图
 * - order=5 (Banner5): image2→列图
 * - order=6 (Banner6): image1→背景(通用), image2→左侧, image3→右侧
 * - order=7 (Banner7): image1→背景(通用), image2→主图, image3→菱形Top, image4→菱形Mid
 * - order=8 (Banner8): image1→背景(通用), image2→主图, image3→小图
 * - order=9 (Banner9): image1→背景(通用), image2→主背景, image3→左下角
 */

import React from 'react'
import { useFormFields } from '@payloadcms/ui'
import { MediaPickerWithCrop } from '../MediaPickerWithCrop'

interface HeroBannerImagePickerProps {
  path?: string
  field: {
    name: string
    label?: string | Record<string, string>
    hasMany?: boolean
    relationTo?: string
    required?: boolean
  }
}

/**
 * 根据 order 和图片字段名获取对应的裁剪预设组名
 */
function getContextPreset(order: number, fieldName: string): string | undefined {
  switch (order) {
    case 1:
      if (fieldName === 'image2') return 'HeroBanner1'
      if (fieldName === 'image3') return 'HeroBanner1'
      return undefined
    case 2:
      if (fieldName === 'image2') return 'HeroBanner2'
      if (fieldName === 'image3') return 'HeroBanner2'
      return undefined
    case 3:
    case 4:
    case 5:
      if (fieldName === 'image2') return 'HeroBanner3'
      return undefined
    case 6:
      if (fieldName === 'image2') return 'HeroBanner6'
      if (fieldName === 'image3') return 'HeroBanner6'
      return undefined
    case 7:
      if (fieldName === 'image2') return 'HeroBanner7'
      if (fieldName === 'image3') return 'HeroBanner7'
      if (fieldName === 'image4') return 'HeroBanner7'
      return undefined
    case 8:
      if (fieldName === 'image2') return 'HeroBanner8'
      if (fieldName === 'image3') return 'HeroBanner8'
      return undefined
    case 9:
      if (fieldName === 'image2') return 'HeroBanner9'
      if (fieldName === 'image3') return 'HeroBanner9'
      return undefined
    default:
      return undefined
  }
}

export const HeroBannerImagePicker: React.FC<HeroBannerImagePickerProps> = (props) => {
  const { field } = props

  // 从表单中获取 order 字段的值
  const order = useFormFields(([fields]) => {
    const orderField = fields?.order
    return orderField?.value as number | undefined
  })

  const contextPreset = getContextPreset(order || 0, field.name)

  return (
    <MediaPickerWithCrop
      {...props}
      contextPreset={contextPreset}
    />
  )
}

export default HeroBannerImagePicker
