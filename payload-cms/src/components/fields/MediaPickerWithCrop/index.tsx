'use client'

/**
 * MediaPickerWithCrop
 * 
 * 包装 MediaPicker 组件，添加裁剪功能。
 * 自动管理对应的 cropData JSON 字段。
 * 
 * 使用方式：
 * 在 collection 的 image 字段旁添加一个同名 + 'CropData' 后缀的 JSON 字段，
 * 然后在 image 字段的 admin.components.Field 中使用此组件。
 * 
 * 例如：
 * - image1 (upload) → image1CropData (json)
 * - image2 (upload) → image2CropData (json)
 */

import React, { useCallback } from 'react'
import { useField } from '@payloadcms/ui'
import { MediaPicker } from '../MediaPicker'
import type { ImageCropData } from '../ImageCropEditor'

interface MediaPickerWithCropProps {
  path?: string
  field: {
    name: string
    label?: string | Record<string, string>
    hasMany?: boolean
    relationTo?: string
    required?: boolean
  }
  /** 裁剪预设上下文（如 'HeroBanner1'），用于智能选择默认预设 */
  contextPreset?: string
}

export const MediaPickerWithCrop: React.FC<MediaPickerWithCropProps> = (props) => {
  const { path, field } = props

  // 裁剪数据字段名 = image 字段名 + 'CropData'
  const cropDataFieldName = `${field.name}CropData`
  const cropDataField = useField<ImageCropData | null>({ path: cropDataFieldName })

  const handleCropDataChange = useCallback(
    (data: ImageCropData | null) => {
      cropDataField.setValue(data)
    },
    [cropDataField],
  )

  return (
    <MediaPicker
      {...props}
      showCropButton={true}
      cropData={cropDataField.value}
      onCropDataChange={handleCropDataChange}
      contextPreset={props.contextPreset}
    />
  )
}

export default MediaPickerWithCrop
