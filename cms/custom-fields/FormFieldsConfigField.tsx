/**
 * Form Fields Config Field - Multilingual Form Field Configuration
 *
 * 表单字段配置 - 多语言表单字段配置
 *
 * Data structure (same as Product.specifications):
 * {
 *   en: [
 *     {
 *       fieldName: 'name',
 *       fieldType: 'text',
 *       label: 'Your Name',
 *       placeholder: 'Enter your name',
 *       required: true,
 *       order: 1,
 *       validation: { minLength: 2, maxLength: 50 },
 *       options: []
 *     },
 *     {
 *       fieldName: 'email',
 *       fieldType: 'email',
 *       label: 'Email',
 *       placeholder: 'your@email.com',
 *       required: true,
 *       order: 2
 *     }
 *   ],
 *   zh: [
 *     {
 *       fieldName: 'name',
 *       fieldType: 'text',
 *       label: '您的姓名',
 *       placeholder: '请输入您的姓名',
 *       required: true,
 *       order: 1,
 *       validation: { minLength: 2, maxLength: 50 },
 *       options: []
 *     },
 *     {
 *       fieldName: 'email',
 *       fieldType: 'email',
 *       label: '邮箱',
 *       placeholder: '请输入邮箱',
 *       required: true,
 *       order: 2
 *     }
 *   ],
 *   // ... 其他语言
 * }
 */

import React, { useState, useEffect } from 'react'
import { FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { FieldController, FieldProps } from '@keystone-6/core/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Language configuration (same as ProductSpecificationsField)
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'is', label: 'Íslenska', flag: '🇮🇸' },
  { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'sk', label: 'Slovenčina', flag: '🇸🇰' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ber', label: 'Tamazight', flag: '🏴' },
  { code: 'ku', label: 'Kurdî', flag: '🟡' },
]

// Field types
const FIELD_TYPES = [
  { value: 'text', label: 'Text (单行文本)' },
  { value: 'email', label: 'Email (邮箱)' },
  { value: 'tel', label: 'Tel (电话)' },
  { value: 'url', label: 'URL (网址)' },
  { value: 'textarea', label: 'Textarea (多行文本)' },
  { value: 'number', label: 'Number (数字)' },
  { value: 'select', label: 'Select (下拉选择)' },
  { value: 'radio', label: 'Radio (单选)' },
  { value: 'checkbox', label: 'Checkbox (复选框)' },
  { value: 'date', label: 'Date (日期)' },
  { value: 'file', label: 'File (文件上传)' },
]

/**
 * Form Field Structure (per language)
 */
interface FormField {
  fieldName: string
  fieldType: string
  label: string
  placeholder: string
  required: boolean
  order: number
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
    // File upload
    accept?: string
    maxSize?: number
    multiple?: boolean
    // Date
    minDate?: string
    maxDate?: string
  }
  options?: Array<{ value: string; label: string }>
}

/**
 * Full Fields Structure (multilingual)
 */
type FormFields = Record<string, FormField[]>

// Sortable Item Component
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '8px',
            background: '#f1f5f9',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
            userSelect: 'none',
          }}
        >
          ⋮⋮
        </div>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}

// Field Editor Modal
function FieldEditorModal({
  isOpen,
  onClose,
  onSave,
  field,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (field: FormField) => void
  field: FormField | null
}) {
  const [editingField, setEditingField] = useState<FormField>(
    field || {
      fieldName: '',
      fieldType: 'text',
      label: '',
      placeholder: '',
      required: false,
      order: 0,
      validation: {},
      options: [],
    }
  )

  useEffect(() => {
    if (field) {
      setEditingField(field)
    }
  }, [field])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
          {field ? 'Edit Field' : 'Add New Field'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Field Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
              Field Name (字段名称) *
            </label>
            <input
              type="text"
              value={editingField.fieldName}
              onChange={(e) => setEditingField({ ...editingField, fieldName: e.target.value })}
              placeholder="e.g., name, email, message"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
              }}
            />
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              必须在所有语言中保持一致 (Must be consistent across all languages)
            </div>
          </div>

          {/* Field Type */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
              Field Type (字段类型) *
            </label>
            <select
              value={editingField.fieldType}
              onChange={(e) => setEditingField({ ...editingField, fieldType: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
              }}
            >
              {FIELD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              必须在所有语言中保持一致 (Must be consistent across all languages)
            </div>
          </div>

          {/* Label */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
              Label (标签) *
            </label>
            <input
              type="text"
              value={editingField.label}
              onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
              placeholder="e.g., Your Name / 您的姓名"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
              }}
            />
          </div>

          {/* Placeholder */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
              Placeholder (占位符)
            </label>
            <input
              type="text"
              value={editingField.placeholder}
              onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
              placeholder="e.g., Enter your name / 请输入您的姓名"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
              }}
            />
          </div>

          {/* Required */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={editingField.required}
              onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
              id="required-checkbox"
            />
            <label htmlFor="required-checkbox" style={{ fontSize: '14px', fontWeight: 500 }}>
              Required (必填)
            </label>
          </div>

          {/* Validation - Min/Max Length for text fields */}
          {['text', 'textarea', 'email', 'tel', 'url'].includes(editingField.fieldType) && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Validation (验证规则)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
                    Min Length
                  </label>
                  <input
                    type="number"
                    value={editingField.validation?.minLength || ''}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        validation: {
                          ...editingField.validation,
                          minLength: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="e.g., 2"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
                    Max Length
                  </label>
                  <input
                    type="number"
                    value={editingField.validation?.maxLength || ''}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        validation: {
                          ...editingField.validation,
                          maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="e.g., 100"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Validation - Min/Max for number fields */}
          {editingField.fieldType === 'number' && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Validation (验证规则)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
                    Min Value
                  </label>
                  <input
                    type="number"
                    value={editingField.validation?.min || ''}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        validation: {
                          ...editingField.validation,
                          min: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="e.g., 0"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
                    Max Value
                  </label>
                  <input
                    type="number"
                    value={editingField.validation?.max || ''}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        validation: {
                          ...editingField.validation,
                          max: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="e.g., 100"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Options - For select, radio, checkbox group fields */}
          {['select', 'radio', 'checkbox'].includes(editingField.fieldType) && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Options (选项) *
              </label>
              <div style={{
                background: '#f9fafb',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                {editingField.options && editingField.options.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {editingField.options.map((option, idx) => (
                      <div key={idx} style={{
                        display: 'grid',
                        gridTemplateColumns: '100px 1fr auto',
                        gap: '8px',
                        alignItems: 'center',
                        background: 'white',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <input
                          type="text"
                          value={option.value}
                          onChange={(e) => {
                            const newOptions = [...(editingField.options || [])]
                            newOptions[idx] = { ...newOptions[idx], value: e.target.value }
                            setEditingField({ ...editingField, options: newOptions })
                          }}
                          placeholder="value"
                          style={{
                            padding: '6px 8px',
                            fontSize: '13px',
                            border: '1px solid #cbd5e0',
                            borderRadius: '4px',
                          }}
                        />
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => {
                            const newOptions = [...(editingField.options || [])]
                            newOptions[idx] = { ...newOptions[idx], label: e.target.value }
                            setEditingField({ ...editingField, options: newOptions })
                          }}
                          placeholder="Label / 标签"
                          style={{
                            padding: '6px 8px',
                            fontSize: '13px',
                            border: '1px solid #cbd5e0',
                            borderRadius: '4px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = editingField.options?.filter((_, i) => i !== idx) || []
                            setEditingField({ ...editingField, options: newOptions })
                          }}
                          style={{
                            padding: '6px 10px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '13px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}>
                    No options yet. Click "Add Option" below.
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = [...(editingField.options || []), { value: '', label: '' }]
                    setEditingField({ ...editingField, options: newOptions })
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  ➕ Add Option
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {editingField.fieldType === 'checkbox' ? (
                  <>
                    <strong>Checkbox 说明:</strong> 如果添加选项,将创建复选框组(多选);如果不添加选项,将创建单个复选框(是/否)
                    <br />
                    <strong>Checkbox Note:</strong> If options are added, a checkbox group will be created; if no options, a single checkbox will be created
                  </>
                ) : (
                  <>
                    Value 必须在所有语言中保持一致，Label 可以不同 (Value must be consistent across languages, Label can differ)
                  </>
                )}
              </div>
            </div>
          )}

          {/* File Upload Options */}
          {editingField.fieldType === 'file' && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                File Upload Options (文件上传选项)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Accept File Types - Checkboxes */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#6b7280' }}>
                    Accept File Types (接受的文件类型)
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {[
                      { value: 'image/*', label: '🖼️ All Images (所有图片)', desc: 'jpg, png, gif, webp, bmp' },
                      { value: '.pdf', label: '📄 PDF Documents', desc: 'Portable Document Format' },
                      { value: '.doc,.docx', label: '📝 Word Documents', desc: 'Microsoft Word files' },
                      { value: '.xls,.xlsx', label: '📊 Excel Files', desc: 'Microsoft Excel files' },
                      { value: '.txt', label: '📃 Text Files', desc: 'Plain text documents' },
                      { value: '.md', label: '📋 Markdown Files', desc: 'Markdown documents' },
                    ].map((fileType) => {
                      const currentAccept = (editingField.validation as any)?.accept || ''
                      const acceptTypes = currentAccept.split(',').map((t: string) => t.trim()).filter(Boolean)
                      const isChecked = fileType.value.split(',').some((v: string) => acceptTypes.includes(v.trim()))

                      return (
                        <div
                          key={fileType.value}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '8px',
                            background: 'white',
                            borderRadius: '4px',
                            border: isChecked ? '2px solid #10b981' : '1px solid #e5e7eb',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => {
                            const currentAccept = (editingField.validation as any)?.accept || ''
                            let acceptTypes = currentAccept.split(',').map((t: string) => t.trim()).filter(Boolean)

                            const fileTypeValues = fileType.value.split(',').map((v: string) => v.trim())

                            if (isChecked) {
                              // Remove all values from this file type
                              acceptTypes = acceptTypes.filter((t: string) => !fileTypeValues.includes(t))
                            } else {
                              // Add all values from this file type
                              acceptTypes = [...acceptTypes, ...fileTypeValues]
                            }

                            setEditingField({
                              ...editingField,
                              validation: {
                                ...editingField.validation,
                                accept: acceptTypes.join(', ') || undefined,
                              } as any,
                            })
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Handled by parent div onClick
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>{fileType.label}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginLeft: '22px' }}>
                            {fileType.desc}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                    Selected: {(editingField.validation as any)?.accept || 'None'}
                  </div>
                </div>

                {/* Max File Size */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
                    Max File Size (最大文件大小, MB)
                  </label>
                  <input
                    type="number"
                    value={(editingField.validation as any)?.maxSize || ''}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        validation: {
                          ...editingField.validation,
                          maxSize: e.target.value ? parseInt(e.target.value) : undefined,
                        } as any,
                      })
                    }
                    placeholder="e.g., 5"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                    单位: MB (例如: 5 表示 5MB)
                  </div>
                </div>

                {/* Multiple Files */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={(editingField.validation as any)?.multiple || false}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        validation: {
                          ...editingField.validation,
                          multiple: e.target.checked,
                        } as any,
                      })
                    }
                    id="multiple-files-checkbox"
                  />
                  <label htmlFor="multiple-files-checkbox" style={{ fontSize: '13px', color: '#374151' }}>
                    Allow Multiple Files (允许上传多个文件)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Date Options */}
          {editingField.fieldType === 'date' && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Date Options (日期选项)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
                    Min Date (最小日期)
                  </label>
                  <input
                    type="date"
                    value={(editingField.validation as any)?.minDate || ''}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        validation: {
                          ...editingField.validation,
                          minDate: e.target.value || undefined,
                        } as any,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
                    Max Date (最大日期)
                  </label>
                  <input
                    type="date"
                    value={(editingField.validation as any)?.maxDate || ''}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        validation: {
                          ...editingField.validation,
                          maxDate: e.target.value || undefined,
                        } as any,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                留空表示不限制 (Leave empty for no restrictions)
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!editingField.fieldName) {
                alert('Field name is required')
                return
              }
              if (!editingField.label) {
                alert('Label is required')
                return
              }
              // Validate options for select/radio fields (checkbox is optional)
              if (['select', 'radio'].includes(editingField.fieldType)) {
                if (!editingField.options || editingField.options.length === 0) {
                  alert('At least one option is required for select/radio fields')
                  return
                }
                // Check if all options have value and label
                const invalidOptions = editingField.options.filter(opt => !opt.value || !opt.label)
                if (invalidOptions.length > 0) {
                  alert('All options must have both value and label')
                  return
                }
              }
              // For checkbox: if options exist, validate them
              if (editingField.fieldType === 'checkbox' && editingField.options && editingField.options.length > 0) {
                const invalidOptions = editingField.options.filter(opt => !opt.value || !opt.label)
                if (invalidOptions.length > 0) {
                  alert('All checkbox options must have both value and label')
                  return
                }
              }
              onSave(editingField)
              onClose()
            }}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export const Field = ({ field, value, onChange }: FieldProps<typeof controller>) => {
  const [activeTab, setActiveTab] = useState('en')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [showTranslationPanel, setShowTranslationPanel] = useState(false)
  const [translationService, setTranslationService] = useState<'google' | 'deepl' | 'azure'>('google')
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    LANGUAGES.filter(l => l.code !== 'en').map(l => l.code)
  )
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Parse JSON value
  const formFields: FormFields = value ? JSON.parse(value) : {}

  // Load saved translation settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem('keystoneTranslatorApiKey')
      const savedService = localStorage.getItem('keystoneTranslatorService')
      const savedLanguages = localStorage.getItem('keystoneTranslatorLanguages')
      const savedSourceLang = localStorage.getItem('keystoneTranslatorSourceLang')
      const savedOverwrite = localStorage.getItem('keystoneTranslatorOverwrite')

      if (savedApiKey) setApiKey(savedApiKey)
      if (savedService) setTranslationService(savedService as 'google' | 'deepl' | 'azure')
      if (savedSourceLang) setSourceLanguage(savedSourceLang)
      if (savedOverwrite) setOverwriteExisting(savedOverwrite === 'true')

      if (savedLanguages) {
        try {
          const parsedLanguages = JSON.parse(savedLanguages)
          if (Array.isArray(parsedLanguages) && parsedLanguages.length > 0) {
            setSelectedLanguages(parsedLanguages)
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [])

  // Save translation settings
  useEffect(() => {
    if (typeof window !== 'undefined' && apiKey) {
      localStorage.setItem('keystoneTranslatorApiKey', apiKey)
    }
  }, [apiKey])

  useEffect(() => {
    if (typeof window !== 'undefined' && translationService) {
      localStorage.setItem('keystoneTranslatorService', translationService)
    }
  }, [translationService])

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedLanguages.length > 0) {
      localStorage.setItem('keystoneTranslatorLanguages', JSON.stringify(selectedLanguages))
    }
  }, [selectedLanguages])

  useEffect(() => {
    if (typeof window !== 'undefined' && sourceLanguage) {
      localStorage.setItem('keystoneTranslatorSourceLang', sourceLanguage)
    }
  }, [sourceLanguage])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('keystoneTranslatorOverwrite', String(overwriteExisting))
    }
  }, [overwriteExisting])

  // Auto-deselect source language from targets
  useEffect(() => {
    setSelectedLanguages(prev => prev.filter(lang => lang !== sourceLanguage))
  }, [sourceLanguage])

  // Get current language's fields
  const currentFields = formFields[activeTab] || []

  // Update fields for current language
  const updateCurrentFields = (newFields: FormField[]) => {
    const newFormFields = { ...formFields, [activeTab]: newFields }
    onChange?.(JSON.stringify(newFormFields))
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = currentFields.findIndex((_, i) => `field-${i}` === active.id)
      const newIndex = currentFields.findIndex((_, i) => `field-${i}` === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(currentFields, oldIndex, newIndex)
        // Update order property
        newFields.forEach((f, idx) => {
          f.order = idx
        })
        updateCurrentFields(newFields)
      }
    }
  }

  // Add/Edit field
  const handleSaveField = (field: FormField) => {
    if (editingFieldIndex !== null) {
      // Edit existing
      const newFields = [...currentFields]
      newFields[editingFieldIndex] = { ...field, order: editingFieldIndex }
      updateCurrentFields(newFields)
    } else {
      // Add new
      updateCurrentFields([...currentFields, { ...field, order: currentFields.length }])
    }
    setEditingFieldIndex(null)
  }

  // Remove field
  const handleRemoveField = (index: number) => {
    const newFields = currentFields.filter((_, i) => i !== index)
    // Update order property
    newFields.forEach((f, idx) => {
      f.order = idx
    })
    updateCurrentFields(newFields)
  }

  // Toggle language selection
  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages(prev =>
      prev.includes(langCode) ? prev.filter(code => code !== langCode) : [...prev, langCode]
    )
  }

  // Toggle all languages
  const toggleAllLanguages = () => {
    const availableLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage).map(l => l.code)
    if (selectedLanguages.length === availableLanguages.length) {
      setSelectedLanguages([])
    } else {
      setSelectedLanguages(availableLanguages)
    }
  }

  // Handle auto-translate
  const handleTranslate = async () => {
    if (!apiKey) {
      setError('Please enter an API key')
      return
    }

    const sourceFields = formFields[sourceLanguage] || []
    if (sourceFields.length === 0) {
      setError(`Please add fields in ${LANGUAGES.find(l => l.code === sourceLanguage)?.label} first`)
      return
    }

    if (selectedLanguages.length === 0) {
      setError('Please select at least one target language')
      return
    }

    const validTargets = selectedLanguages.filter(lang => lang !== sourceLanguage)

    if (validTargets.length === 0) {
      setError('Cannot translate to the same language as source')
      return
    }

    const targetLangs = overwriteExisting
      ? validTargets
      : validTargets.filter(lang => !formFields[lang] || formFields[lang].length === 0)

    if (targetLangs.length === 0) {
      setError('All selected languages already have fields. Enable "Overwrite existing translations" to re-translate.')
      return
    }

    setIsTranslating(true)
    setError('')
    setStatus(`Translating fields from ${sourceLanguage.toUpperCase()} to ${targetLangs.length} language${targetLangs.length > 1 ? 's' : ''}...`)

    try {
      const newFormFields = { ...formFields }

      for (const targetLang of targetLangs) {
        const translatedFields: FormField[] = []

        // 逐个翻译字段
        for (const field of sourceFields) {
          // 翻译 label
          const labelResponse = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: field.label,
              sourceLang: sourceLanguage,
              service: translationService,
              apiKey,
              targetLangs: [targetLang],
            }),
          })

          if (!labelResponse.ok) {
            throw new Error('Failed to translate label')
          }

          const labelData = await labelResponse.json()
          const translatedLabel = labelData.translations[targetLang] || field.label

          // 翻译 placeholder
          let translatedPlaceholder = field.placeholder
          if (field.placeholder) {
            const placeholderResponse = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: field.placeholder,
                sourceLang: sourceLanguage,
                service: translationService,
                apiKey,
                targetLangs: [targetLang],
              }),
            })

            if (placeholderResponse.ok) {
              const placeholderData = await placeholderResponse.json()
              translatedPlaceholder = placeholderData.translations[targetLang] || field.placeholder
            }
          }

          // 翻译 options (如果有)
          let translatedOptions = field.options || []
          if (field.options && field.options.length > 0) {
            translatedOptions = []
            for (const option of field.options) {
              const optionResponse = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: option.label,
                  sourceLang: sourceLanguage,
                  service: translationService,
                  apiKey,
                  targetLangs: [targetLang],
                }),
              })

              if (optionResponse.ok) {
                const optionData = await optionResponse.json()
                translatedOptions.push({
                  value: option.value,
                  label: optionData.translations[targetLang] || option.label,
                })
              } else {
                translatedOptions.push(option)
              }
            }
          }

          translatedFields.push({
            ...field,
            label: translatedLabel,
            placeholder: translatedPlaceholder,
            options: translatedOptions,
          })
        }

        newFormFields[targetLang] = translatedFields
      }

      onChange?.(JSON.stringify(newFormFields))

      setStatus('✅ Translation completed!')
      setTimeout(() => {
        setStatus('')
        setShowTranslationPanel(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }

  // Calculate completion stats
  const completedCount = LANGUAGES.filter(lang => {
    const fields = formFields[lang.code]
    return fields && fields.length > 0
  }).length
  const totalCount = LANGUAGES.length
  const completionPercentage = Math.round((completedCount / totalCount) * 100)

  return (
    <FieldContainer>
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <FieldLabel>{field.label}</FieldLabel>
          <button
            type="button"
            onClick={() => setShowTranslationPanel(!showTranslationPanel)}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            🌐 {showTranslationPanel ? 'Hide' : 'Auto-Translate'}
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {completedCount} of {totalCount} languages ({completionPercentage}%)
            </span>
          </div>
          <div style={{
            background: '#e2e8f0',
            borderRadius: '4px',
            height: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#10b981',
              height: '100%',
              width: `${completionPercentage}%`,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Translation Panel */}
        {showTranslationPanel && (
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
              🌐 Auto-Translate Settings
            </h4>

            {/* Source Language Selector */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                Source Language
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                disabled={isTranslating}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13px',
                  background: 'white'
                }}
              >
                {LANGUAGES.map(lang => {
                  const hasContent = formFields[lang.code]?.length > 0
                  return (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label} {hasContent ? '✓' : '(empty)'}
                    </option>
                  )
                })}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Service
                </label>
                <select
                  value={translationService}
                  onChange={(e) => setTranslationService(e.target.value as 'google' | 'deepl' | 'azure')}
                  disabled={isTranslating}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '13px',
                    background: 'white'
                  }}
                >
                  <option value="google">Google Translate</option>
                  <option value="deepl">DeepL API</option>
                  <option value="azure">Azure Translator</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isTranslating}
                  placeholder="Enter your API key"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* Overwrite Option */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isTranslating ? 'not-allowed' : 'pointer',
                fontSize: '13px'
              }}>
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  disabled={isTranslating}
                  style={{ cursor: isTranslating ? 'not-allowed' : 'pointer' }}
                />
                <span>Overwrite existing translations</span>
              </label>
            </div>

            {/* Language Selector */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500 }}>
                  Target Languages ({selectedLanguages.length} selected)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={toggleAllLanguages}
                    disabled={isTranslating}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: 'white',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      cursor: isTranslating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {selectedLanguages.length === LANGUAGES.filter(l => l.code !== sourceLanguage).length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    disabled={isTranslating}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isTranslating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {showLanguageSelector ? 'Hide' : 'Show'} Languages
                  </button>
                </div>
              </div>

              {showLanguageSelector && (
                <div style={{
                  background: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '8px'
                  }}>
                    {LANGUAGES.map(lang => {
                      const isSourceLang = lang.code === sourceLanguage
                      const isDisabled = isTranslating || isSourceLang

                      return (
                        <label
                          key={lang.code}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            background: selectedLanguages.includes(lang.code) ? '#d1fae5' : 'transparent',
                            opacity: isSourceLang ? 0.5 : 1
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLanguages.includes(lang.code)}
                            onChange={() => toggleLanguage(lang.code)}
                            disabled={isDisabled}
                            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                          />
                          <span style={{ fontSize: '12px' }}>
                            {lang.flag} {lang.code.toUpperCase()}
                            {isSourceLang && ' (source)'}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating || !apiKey || (formFields[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0}
              style={{
                width: '100%',
                padding: '10px',
                background: isTranslating || !apiKey || (formFields[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0 ? '#cbd5e1' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isTranslating || !apiKey || (formFields[sourceLanguage]?.length || 0) === 0 || selectedLanguages.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              {isTranslating ? 'Translating...' : `Translate from ${sourceLanguage.toUpperCase()} to ${selectedLanguages.length} Language${selectedLanguages.length > 1 ? 's' : ''}`}
            </button>

            {(status || error) && (
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: error ? '#fee2e2' : '#d1fae5',
                color: error ? '#991b1b' : '#065f46',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                {error || status}
              </div>
            )}
          </div>
        )}

        {/* Language Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '8px'
        }}>
          {LANGUAGES.map(lang => {
            const isCompleted = formFields[lang.code]?.length > 0
            const isActive = activeTab === lang.code

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveTab(lang.code)}
                style={{
                  background: isActive ? '#10b981' : '#f1f5f9',
                  color: isActive ? 'white' : '#475569',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.code.toUpperCase()}</span>
                {isCompleted && <span>✓</span>}
              </button>
            )
          })}
        </div>

        {/* Fields Editor for Active Language with Drag & Drop */}
        <div style={{ marginTop: '16px' }}>
          {currentFields.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#999',
              background: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '12px',
            }}>
              No fields for {LANGUAGES.find(l => l.code === activeTab)?.label}. Click "Add Field" to start.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={currentFields.map((_, i) => `field-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {currentFields.map((formField, idx) => (
                    <SortableItem key={`field-${idx}`} id={`field-${idx}`}>
                      <div
                        style={{
                          background: '#f9fafb',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937', marginBottom: '4px' }}>
                              {formField.label}
                              {formField.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              Name: {formField.fieldName} | Type: {formField.fieldType}
                            </div>
                            {formField.placeholder && (
                              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                Placeholder: {formField.placeholder}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingField(formField)
                                setEditingFieldIndex(idx)
                                setEditorOpen(true)
                              }}
                              style={{
                                padding: '6px 12px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveField(idx)}
                              style={{
                                padding: '6px 12px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Add Button */}
          <button
            type="button"
            onClick={() => {
              setEditingField(null)
              setEditingFieldIndex(null)
              setEditorOpen(true)
            }}
            style={{
              padding: '10px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              width: '100%',
            }}
          >
            ➕ Add Field ({currentFields.length} fields)
          </button>

          {/* Info */}
          {currentFields.length > 0 && (
            <div style={{
              marginTop: '12px',
              fontSize: '12px',
              color: '#6b7280',
              padding: '8px',
              background: '#f3f4f6',
              borderRadius: '4px',
            }}>
              💡 Drag the ⋮⋮ handle to reorder fields. Order will be preserved in the form.
            </div>
          )}
        </div>

        {/* JSON Preview */}
        {Object.keys(formFields).length > 0 && (
          <details style={{ marginTop: '16px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#666' }}>
              📋 View JSON Data
            </summary>
            <pre style={{
              marginTop: '8px',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
              fontSize: '11px',
              overflow: 'auto',
              maxHeight: '300px',
            }}>
              {JSON.stringify(formFields, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Editor Modal */}
      <FieldEditorModal
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          setEditingField(null)
          setEditingFieldIndex(null)
        }}
        onSave={handleSaveField}
        field={editingField}
      />
    </FieldContainer>
  )
}

export const Cell = ({ item, field }: any) => {
  const value = item[field.path]

  if (!value || typeof value !== 'object') {
    return <div style={{ color: '#999', fontSize: '13px' }}>No fields</div>
  }

  const formFields = value as FormFields
  const languages = Object.keys(formFields)

  if (languages.length === 0) {
    return <div style={{ color: '#999', fontSize: '13px' }}>No fields</div>
  }

  const totalFields = languages.reduce((sum, lang) => sum + formFields[lang].length, 0)

  return (
    <div style={{ fontSize: '13px', color: '#4a5568' }}>
      <span style={{ fontWeight: 500 }}>{totalFields} fields</span>
      <span style={{ color: '#999', marginLeft: '4px' }}>
        ({languages.length} languages)
      </span>
    </div>
  )
}

export const controller = (config: any): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: '{}',
    deserialize: (data) => {
      const value = data[config.path]

      if (value === null || value === undefined) {
        return '{}'
      }

      if (typeof value === 'object') {
        return JSON.stringify(value)
      }

      if (typeof value === 'string') {
        return value
      }

      return '{}'
    },
    serialize: (value) => {
      let jsonValue
      if (!value) {
        jsonValue = null
      } else if (typeof value === 'string') {
        try {
          jsonValue = JSON.parse(value)
        } catch {
          jsonValue = null
        }
      } else if (typeof value === 'object') {
        jsonValue = value
      } else {
        jsonValue = null
      }
      return { [config.path]: jsonValue }
    },
    validate: (value) => {
      if (!value) return true
      try {
        JSON.parse(typeof value === 'string' ? value : JSON.stringify(value))
        return true
      } catch {
        return false
      }
    },
  }
}
