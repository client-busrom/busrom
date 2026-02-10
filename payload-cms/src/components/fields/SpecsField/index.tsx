'use client'

import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import './styles.scss'

// 预定义的常用 key 选项
const PRESET_KEYS = [
  { label: 'Color | 颜色', value: 'color' },
  { label: 'Material | 材质', value: 'material' },
  { label: 'Size | 尺寸', value: 'size' },
  { label: 'Finish | 表面处理', value: 'finish' },
  { label: 'Model | 型号', value: 'model' },
  { label: 'Series | 系列', value: 'series' },
  { label: 'Style | 款式', value: 'style' },
]

interface SpecItem {
  key: string
  value: string
  isCustomKey?: boolean
  customKeyName?: string
}

// 将 JSON 对象转换为 SpecItem 数组
const jsonToSpecs = (json: Record<string, string> | null | undefined): SpecItem[] => {
  if (!json || typeof json !== 'object') return []

  return Object.entries(json).map(([key, value]) => {
    const isPreset = PRESET_KEYS.some(preset => preset.value === key)
    return {
      key: isPreset ? key : 'custom',
      value: String(value),
      isCustomKey: !isPreset,
      ...(isPreset ? {} : { customKeyName: key }),
    }
  })
}

// 将 SpecItem 数组转换为 JSON 对象
const specsToJson = (specs: SpecItem[]): Record<string, string> => {
  const result: Record<string, string> = {}

  specs.forEach(spec => {
    if (spec.key && spec.value) {
      const actualKey = spec.isCustomKey ? spec.customKeyName || spec.key : spec.key
      if (actualKey && actualKey !== 'custom') {
        result[actualKey] = spec.value
      }
    }
  })

  return result
}

export const SpecsField: JSONFieldClientComponent = (props) => {
  const { path, field } = props
  const { value, setValue } = useField<Record<string, string>>({ path })

  // 使用 ref 跟踪是否是内部更新
  const isInternalUpdate = useRef(false)

  // 内部状态：规格列表
  const [specs, setSpecs] = useState<SpecItem[]>(() => jsonToSpecs(value))

  // 当外部 value 变化时同步到内部状态（仅当不是内部更新时）
  useEffect(() => {
    // 跳过内部更新触发的 effect
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    const newSpecs = jsonToSpecs(value)
    setSpecs(newSpecs)
  }, [value])

  // 更新规格并同步到 Payload
  const updateSpecs = useCallback((newSpecs: SpecItem[]) => {
    isInternalUpdate.current = true
    setSpecs(newSpecs)
    const json = specsToJson(newSpecs)
    setValue(Object.keys(json).length > 0 ? json : null)
  }, [setValue])

  // 添加新规格
  const addSpec = useCallback(() => {
    updateSpecs([...specs, { key: '', value: '', isCustomKey: false }])
  }, [specs, updateSpecs])

  // 删除规格
  const removeSpec = useCallback((index: number) => {
    const newSpecs = specs.filter((_, i) => i !== index)
    updateSpecs(newSpecs)
  }, [specs, updateSpecs])

  // 更新单个规格
  const updateSpec = useCallback((index: number, fieldName: keyof SpecItem, newValue: string | boolean) => {
    const newSpecs = [...specs]
    const spec = { ...newSpecs[index] }

    if (fieldName === 'key') {
      spec.key = newValue as string
      spec.isCustomKey = newValue === 'custom'
      if (!spec.isCustomKey) {
        spec.customKeyName = undefined
      }
    } else if (fieldName === 'customKeyName') {
      spec.customKeyName = newValue as string
    } else if (fieldName === 'value') {
      spec.value = newValue as string
    }

    newSpecs[index] = spec
    updateSpecs(newSpecs)
  }, [specs, updateSpecs])

  return (
    <div className="specs-field">
      <div className="specs-field__header">
        <label className="specs-field__label">
          {typeof field.label === 'string' ? field.label : 'Specifications | 规格信息'}
        </label>
        <p className="specs-field__description">
          {typeof field.admin?.description === 'string'
            ? field.admin.description
            : 'Add key-value specifications for this image | 为此图片添加键值对规格信息'}
        </p>
      </div>

      <div className="specs-field__items">
        {specs.map((spec, index) => (
          <div key={index} className="specs-field__item">
            <div className="specs-field__row">
              {/* Key 选择器 */}
              <select
                className="specs-field__select"
                value={spec.isCustomKey ? 'custom' : spec.key}
                onChange={(e) => updateSpec(index, 'key', e.target.value)}
              >
                <option value="">-- Select Key | 选择属性 --</option>
                {PRESET_KEYS.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
                <option value="custom">Custom | 自定义</option>
              </select>

              {/* 自定义 Key 输入框 */}
              {spec.isCustomKey && (
                <input
                  type="text"
                  className="specs-field__input specs-field__input--custom-key"
                  placeholder="Custom key name | 自定义属性名"
                  value={spec.customKeyName || ''}
                  onChange={(e) => updateSpec(index, 'customKeyName', e.target.value)}
                />
              )}

              {/* Value 输入框 */}
              <input
                type="text"
                className="specs-field__input specs-field__input--value"
                placeholder="Value | 值"
                value={spec.value}
                onChange={(e) => updateSpec(index, 'value', e.target.value)}
              />

              {/* 删除按钮 */}
              <button
                type="button"
                className="specs-field__remove"
                onClick={() => removeSpec(index)}
                title="Remove | 删除"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 添加按钮 */}
      <button
        type="button"
        className="specs-field__add"
        onClick={addSpec}
      >
        + Add Specification | 添加规格
      </button>

      {/* 调试信息 - 开发时可以打开 */}
      {/* <pre className="specs-field__debug">{JSON.stringify(value, null, 2)}</pre> */}
    </div>
  )
}

export default SpecsField
