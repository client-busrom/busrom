// @ts-nocheck
/**
 * FormBlock Component - Client Side
 */

'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import React, { useState, useEffect } from 'react'
import { useTranslation } from '@payloadcms/ui'
import { FormBlockData, FormBlockNode } from './node'
import { FileText } from 'lucide-react'

interface FormBlockComponentProps {
  nodeKey: string
  data: FormBlockData
}

interface FormField {
  fieldName?: string
  label?: string | { en?: string; zh?: string; [key: string]: any }
  fieldType?: string
  required?: boolean
}

interface FormConfig {
  id: string | number
  name: string
  displayName?: string | { en?: string; zh?: string; [key: string]: any }
  description?: string | { en?: string; zh?: string; [key: string]: any }
  fields?: FormField[]
}

export const FormBlockComponent: React.FC<FormBlockComponentProps> = ({ nodeKey, data }) => {
  const [editor] = useLexicalComposerContext()
  const { i18n } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [localData, setLocalData] = useState<FormBlockData>(data)
  const [formConfigs, setFormConfigs] = useState<FormConfig[]>([])
  const [selectedForm, setSelectedForm] = useState<FormConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load form configs
  useEffect(() => {
    const loadFormConfigs = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/form-configs?limit=100')
        if (response.ok) {
          const data = await response.json()
          setFormConfigs(data.docs || [])
        }
      } catch (error) {
        console.error('Failed to load form configs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFormConfigs()
  }, [])

  // Load selected form info with fields
  useEffect(() => {
    const loadSelectedForm = async () => {
      const formId = typeof localData.formConfig === 'object' ? localData.formConfig?.id : localData.formConfig
      if (!formId) {
        setSelectedForm(null)
        return
      }

      try {
        const response = await fetch(`/api/form-configs/${formId}`)
        if (response.ok) {
          const data = await response.json()
          setSelectedForm(data)
        }
      } catch (error) {
        console.error('Failed to load form config:', error)
      }
    }

    loadSelectedForm()
  }, [localData.formConfig])

  const handleSave = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as FormBlockNode
      if (node) {
        node.setData(localData)
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLocalData(data)
    setIsEditing(false)
  }

  const handleFormSelect = (formId: string) => {
    setLocalData({ ...localData, formConfig: { id: formId } })
  }

  if (isEditing) {
    return (
      <div
        style={{
          border: '2px solid #A08745',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px 0',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
            {i18n?.language === 'zh' ? '编辑表单块' : 'Edit Form Block'}
          </h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {i18n?.language === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#A08745',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {i18n?.language === 'zh' ? '保存' : 'Save'}
            </button>
          </div>
        </div>

        {/* Form selection */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 500 }}>
            {i18n?.language === 'zh' ? '选择表单' : 'Select Form'}
          </label>
          {isLoading ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
              {i18n?.language === 'zh' ? '加载中...' : 'Loading...'}
            </div>
          ) : (
            <select
              value={typeof localData.formConfig === 'object' ? localData.formConfig?.id || '' : localData.formConfig || ''}
              onChange={(e) => handleFormSelect(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="">-- {i18n?.language === 'zh' ? '请选择一个表单' : 'Please select a form'} --</option>
              {formConfigs.map((form) => {
                // Handle multilingual displayName or fallback to name
                const getTitle = () => {
                  if (form.displayName) {
                    if (typeof form.displayName === 'string') {
                      return form.displayName.trim() || form.name
                    }
                    // Multilingual: try zh first, then en, then any other language
                    return form.displayName.zh || form.displayName.en || Object.values(form.displayName)[0] || form.name
                  }
                  return form.name
                }
                return (
                  <option key={form.id} value={form.id}>
                    {getTitle()}
                  </option>
                )
              })}
            </select>
          )}
          {formConfigs.length === 0 && !isLoading && (
            <p style={{ marginTop: '4px', fontSize: '11px', color: '#ef4444' }}>
              {i18n?.language === 'zh' ? '没有可用的表单配置，请先创建表单配置' : 'No form configs available, please create one first'}
            </p>
          )}
        </div>

        {/* Display title option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="displayTitle"
            checked={localData.displayTitle}
            onChange={(e) => setLocalData({ ...localData, displayTitle: e.target.checked })}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="displayTitle" style={{ fontSize: '12px', cursor: 'pointer' }}>
            {i18n?.language === 'zh' ? '显示表单标题' : 'Display Form Title'}
          </label>
        </div>
      </div>
    )
  }

  // Preview mode
  const formId = typeof localData.formConfig === 'object' ? localData.formConfig?.id : localData.formConfig

  // Get display text for multilingual fields
  const getDisplayText = (field: string | { en?: string; zh?: string; [key: string]: any } | undefined): string => {
    if (!field) return ''
    if (typeof field === 'string') return field
    return field.zh || field.en || Object.values(field)[0] || ''
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px 0',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            backgroundColor: '#A08745',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FileText size={24} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
            {i18n?.language === 'zh' ? '表单块' : 'Form Block'}
          </div>
          {selectedForm ? (
            <>
              <div style={{ fontSize: '13px', color: '#3b82f6', marginBottom: '2px' }}>
                {getDisplayText(selectedForm.displayName) || selectedForm.name}
              </div>
              {getDisplayText(selectedForm.description) && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                  {getDisplayText(selectedForm.description)}
                </div>
              )}
              {selectedForm.fields && selectedForm.fields.length > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginBottom: '6px' }}>
                    {i18n?.language === 'zh' ? '表单字段' : 'Form Fields'} ({selectedForm.fields.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedForm.fields.map((field, index) => {
                      const fieldLabel = getDisplayText(field.label) || field.fieldName || (i18n?.language === 'zh' ? '未命名字段' : 'Unnamed Field')
                      const fieldType = field.fieldType || 'text'
                      const typeLabels: Record<string, string> = i18n?.language === 'zh' ? {
                        text: '文本',
                        email: '邮箱',
                        phone: '电话',
                        textarea: '多行文本',
                        select: '下拉选择',
                        checkbox: '复选框',
                        radio: '单选',
                        number: '数字',
                        date: '日期',
                        file: '文件',
                      } : {
                        text: 'Text',
                        email: 'Email',
                        phone: 'Phone',
                        textarea: 'Textarea',
                        select: 'Select',
                        checkbox: 'Checkbox',
                        radio: 'Radio',
                        number: 'Number',
                        date: 'Date',
                        file: 'File',
                      }
                      return (
                        <div
                          key={index}
                          style={{
                            fontSize: '11px',
                            padding: '4px 6px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '3px',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span style={{ color: '#1e293b', fontWeight: 500 }}>
                            {fieldLabel}
                          </span>
                          <span
                            style={{
                              fontSize: '9px',
                              padding: '1px 4px',
                              backgroundColor: '#f3f4f6',
                              color: '#6b7280',
                              borderRadius: '2px',
                            }}
                          >
                            {typeLabels[fieldType] || fieldType}
                          </span>
                          {field.required && (
                            <span
                              style={{
                                fontSize: '9px',
                                padding: '1px 4px',
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '2px',
                                fontWeight: 500,
                              }}
                            >
                              {i18n?.language === 'zh' ? '必填' : 'Required'}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
                {localData.displayTitle ? (i18n?.language === 'zh' ? '显示标题' : 'Display Title') : (i18n?.language === 'zh' ? '不显示标题' : 'Do Not Display Title')}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '12px', color: '#ef4444' }}>
              {formId ? (i18n?.language === 'zh' ? '表单配置未找到' : 'Form config not found') : (i18n?.language === 'zh' ? '未选择表单' : 'No form selected')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
