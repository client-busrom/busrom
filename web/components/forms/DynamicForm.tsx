"use client"

import { useState, useEffect, FormEvent, useRef } from "react"
import type { Locale } from "@/i18n.config"
import { Info } from "lucide-react"

interface FormField {
  fieldName: string
  fieldType: string
  label: string
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  order?: number
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
    accept?: string
    maxSize?: number
    multiple?: boolean
    minDate?: string
    maxDate?: string
  }
}

interface FormConfig {
  id: string
  name: string
  displayName: string
  description: string
  fields: FormField[]
  submitButtonText: string
  successMessage: string
  errorMessage: string
  enableCaptcha: boolean
  maxSubmissionsPerDay: number
  maxTotalFileSize?: number // MB
}

interface DynamicFormProps {
  formName: string
  locale: Locale
  className?: string
  onSuccess?: () => void
}

export function DynamicForm({ formName, locale, className, onSuccess }: DynamicFormProps) {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([])
  const [showFileHelp, setShowFileHelp] = useState<string | null>(null) // Track which field's help is shown
  const fileHelpRef = useRef<HTMLDivElement>(null)

  // Fetch form configuration
  useEffect(() => {
    const fetchFormConfig = async () => {
      try {
        const res = await fetch(`/api/form-config/${formName}?locale=${locale}`)
        if (res.ok) {
          const config = await res.json()
          setFormConfig(config)

          // Initialize form data with empty values
          const initialData: Record<string, any> = {}
          config.fields.forEach((field: FormField) => {
            initialData[field.fieldName] = field.fieldType === 'checkbox' ? [] : ''
          })
          setFormData(initialData)
        } else {
          setError("Failed to load form configuration")
        }
      } catch (err) {
        console.error("Error fetching form config:", err)
        setError("Failed to load form")
      } finally {
        setLoading(false)
      }
    }

    fetchFormConfig()
  }, [formName, locale])

  // Close file help popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fileHelpRef.current && !fileHelpRef.current.contains(event.target as Node)) {
        setShowFileHelp(null)
      }
    }

    if (showFileHelp) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showFileHelp])

  // Handle input change
  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  // Handle checkbox change
  const handleCheckboxChange = (fieldName: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = Array.isArray(prev[fieldName]) ? prev[fieldName] : []
      if (checked) {
        return {
          ...prev,
          [fieldName]: [...currentValues, value]
        }
      } else {
        return {
          ...prev,
          [fieldName]: currentValues.filter((v: string) => v !== value)
        }
      }
    })
  }

  // Validate file
  const validateFile = (file: File, field: FormField): string | null => {
    // Check file size
    const maxSize = field.validation?.maxSize || 5
    const maxSizeBytes = maxSize * 1024 * 1024

    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size: ${maxSize}MB`
    }

    // Check file type
    if (field.validation?.accept) {
      const acceptTypes = field.validation.accept.split(',').map(t => t.trim())
      const fileType = file.type
      const fileName = file.name.toLowerCase()

      const isValid = acceptTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type)
        }
        if (type.includes('*')) {
          const baseType = type.split('/')[0]
          return fileType.startsWith(baseType)
        }
        return fileType === type
      })

      if (!isValid) {
        return `Invalid file type. Accepted: ${field.validation.accept}`
      }
    }

    // Check filename safety - allow Unicode characters (including Chinese)
    // Only block dangerous characters: / \ : * ? " < > |
    if (/[\/\\:*?"<>|]/.test(file.name)) {
      return 'Invalid file name. Cannot contain: / \\ : * ? " < > |'
    }

    // Check for null bytes and control characters
    if (/[\x00-\x1F\x7F]/.test(file.name)) {
      return 'Invalid file name. Cannot contain control characters'
    }

    return null
  }

  // Handle file upload
  const handleFileUpload = async (fieldName: string, files: FileList | null, field: FormField) => {
    if (!files || files.length === 0) return

    const maxFiles = field.validation?.multiple ? 3 : 1
    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} file(s) allowed`)
      return
    }

    // Check total file size limit (if configured)
    if (formConfig?.maxTotalFileSize && formConfig.maxTotalFileSize > 0) {
      // Calculate current total size of already uploaded files
      const currentTotalSize = uploadedAttachments.reduce((sum, att) => sum + (att.fileSize || 0), 0)

      // Calculate new files total size
      const newFilesSize = Array.from(files).reduce((sum, file) => sum + file.size, 0)

      // Check if adding new files would exceed limit
      const totalSizeBytes = currentTotalSize + newFilesSize
      const maxTotalSizeBytes = formConfig.maxTotalFileSize * 1024 * 1024

      if (totalSizeBytes > maxTotalSizeBytes) {
        const currentMB = (currentTotalSize / 1024 / 1024).toFixed(2)
        const newMB = (newFilesSize / 1024 / 1024).toFixed(2)
        const maxMB = formConfig.maxTotalFileSize
        setError(`Total file size limit exceeded. Current: ${currentMB}MB, Adding: ${newMB}MB, Maximum: ${maxMB}MB`)
        return
      }
    }

    setUploadingFiles(prev => ({ ...prev, [fieldName]: true }))
    setError(null)

    try {
      const uploadedFiles: any[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file
        const validationError = validateFile(file, field)
        if (validationError) {
          setError(validationError)
          setUploadingFiles(prev => ({ ...prev, [fieldName]: false }))
          return
        }

        // Upload file
        const formData = new FormData()
        formData.append('file', file)
        formData.append('formConfigId', formConfig?.id || '')
        formData.append('fieldName', fieldName)

        const response = await fetch('/api/form-file-upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        uploadedFiles.push({
          fieldName,
          fileName: result.fileName,
          fileUrl: result.fileUrl,
          fileSize: result.fileSize,
          fileType: result.fileType,
          uploadedAt: result.uploadedAt,
        })
      }

      // Update form data with file URLs
      setFormData(prev => {
        if (field.validation?.multiple) {
          // Multiple files: append new URLs to existing array
          const existingUrls = Array.isArray(prev[fieldName]) ? prev[fieldName] : []
          return {
            ...prev,
            [fieldName]: [...existingUrls, ...uploadedFiles.map(f => f.fileUrl)]
          }
        } else {
          // Single file: replace with new URL
          return {
            ...prev,
            [fieldName]: uploadedFiles[0]?.fileUrl || ''
          }
        }
      })

      // Store attachment metadata
      setUploadedAttachments(prev => [...prev, ...uploadedFiles])

      // Clear the file input to reset the "X files selected" message
      const fileInput = document.getElementById(fieldName) as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

    } catch (err) {
      console.error('File upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      const missingFields: string[] = []
      formConfig?.fields.forEach(field => {
        if (field.required) {
          const value = formData[field.fieldName]
          if (!value || (Array.isArray(value) && value.length === 0)) {
            missingFields.push(field.label)
          }
        }
      })

      if (missingFields.length > 0) {
        setError(`Please fill in required fields: ${missingFields.join(", ")}`)
        setSubmitting(false)
        return
      }

      // Submit form
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: formConfig?.id, // Changed from formConfigId to formId
          formName: formConfig?.name,
          data: formData,
          attachments: uploadedAttachments,
          locale,
          sourcePage: window.location.href,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        onSuccess?.()

        // Reset form after 5 seconds
        setTimeout(() => {
          setSubmitted(false)
          const resetData: Record<string, any> = {}
          formConfig?.fields.forEach(field => {
            resetData[field.fieldName] = field.fieldType === 'checkbox' ? [] : ''
          })
          setFormData(resetData)
          setUploadedAttachments([]) // Clear uploaded attachments
        }, 5000)
      } else {
        const errorData = await res.json()
        setError(errorData.error || formConfig?.errorMessage || "Failed to submit form")
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError(formConfig?.errorMessage || "Failed to submit form")
    } finally {
      setSubmitting(false)
    }
  }

  // Render field based on type
  const renderField = (field: FormField) => {
    const baseInputClass = "w-full px-4 py-3 border border-brand-accent-border rounded-none focus:outline-none focus:border-brand-text-black transition-colors font-anaheim"
    const labelClass = "block text-sm font-anaheim font-bold text-brand-text-black mb-2"

    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        return (
          <div key={field.fieldName}>
            <label htmlFor={field.fieldName} className={labelClass}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.fieldType}
              id={field.fieldName}
              name={field.fieldName}
              value={formData[field.fieldName] || ''}
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={baseInputClass}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.fieldName}>
            <label htmlFor={field.fieldName} className={labelClass}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={field.fieldName}
              name={field.fieldName}
              value={formData[field.fieldName] || ''}
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={4}
              className={baseInputClass}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.fieldName}>
            <label htmlFor={field.fieldName} className={labelClass}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={field.fieldName}
              name={field.fieldName}
              value={formData[field.fieldName] || ''}
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              required={field.required}
              className={baseInputClass}
            >
              <option value="">Select...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'radio':
        return (
          <div key={field.fieldName}>
            <label className={labelClass}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.fieldName}
                    value={option.value}
                    checked={formData[field.fieldName] === option.value}
                    onChange={(e) => handleChange(field.fieldName, e.target.value)}
                    required={field.required}
                    className="w-4 h-4 text-brand-text-black border-brand-accent-border focus:ring-brand-text-black"
                  />
                  <span className="text-brand-accent-gold">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.fieldName}>
            <label className={labelClass}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={(formData[field.fieldName] || []).includes(option.value)}
                    onChange={(e) => handleCheckboxChange(field.fieldName, option.value, e.target.checked)}
                    className="w-4 h-4 text-brand-text-black border-brand-accent-border rounded focus:ring-brand-text-black"
                  />
                  <span className="text-brand-accent-gold">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'number':
        return (
          <div key={field.fieldName}>
            <label htmlFor={field.fieldName} className={labelClass}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              id={field.fieldName}
              name={field.fieldName}
              value={formData[field.fieldName] || ''}
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.validation?.min}
              max={field.validation?.max}
              className={baseInputClass}
            />
          </div>
        )

      case 'date':
        return (
          <div key={field.fieldName}>
            <label htmlFor={field.fieldName} className={labelClass}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              id={field.fieldName}
              name={field.fieldName}
              value={formData[field.fieldName] || ''}
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              required={field.required}
              min={field.validation?.minDate}
              max={field.validation?.maxDate}
              className={baseInputClass}
            />
          </div>
        )

      case 'file':
        return (
          <div key={field.fieldName} className="relative">
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor={field.fieldName} className={labelClass + " mb-0"}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <button
                type="button"
                onClick={() => setShowFileHelp(showFileHelp === field.fieldName ? null : field.fieldName)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="File upload help"
              >
                <Info size={18} />
              </button>
            </div>

            {/* Help Popup */}
            {showFileHelp === field.fieldName && (
              <div
                ref={fileHelpRef}
                className="absolute left-0 top-full mt-1 z-50 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900 mb-2">File Upload Guidelines</div>
                      <div className="space-y-1.5 text-gray-600">
                        {field.validation?.accept && (
                          <div className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>Accepted types:</strong> {field.validation.accept}</span>
                          </div>
                        )}
                        {field.validation?.maxSize && (
                          <div className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>Maximum file size:</strong> {field.validation.maxSize}MB per file</span>
                          </div>
                        )}
                        {field.validation?.multiple && (
                          <div className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>Multiple files:</strong> You can upload up to 3 files at once</span>
                          </div>
                        )}
                        {formConfig?.maxTotalFileSize && formConfig.maxTotalFileSize > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>Total size limit:</strong> {formConfig.maxTotalFileSize}MB for all files combined</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <input
              type="file"
              id={field.fieldName}
              name={field.fieldName}
              onChange={(e) => handleFileUpload(field.fieldName, e.target.files, field)}
              required={field.required}
              accept={field.validation?.accept}
              multiple={field.validation?.multiple}
              disabled={uploadingFiles[field.fieldName]}
              className={baseInputClass}
            />
            {uploadingFiles[field.fieldName] && (
              <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </div>
            )}
            {/* Display uploaded files for this field */}
            {uploadedAttachments.filter(att => att.fieldName === field.fieldName).length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  Uploaded files ({uploadedAttachments.filter(att => att.fieldName === field.fieldName).length} total):
                </div>
                {uploadedAttachments
                  .filter(att => att.fieldName === field.fieldName)
                  .map((attachment, idx) => {
                    const isImage = attachment.fileType?.startsWith('image/')
                    const formatFileSize = (bytes: number): string => {
                      if (bytes === 0) return '0 Bytes'
                      const k = 1024
                      const sizes = ['Bytes', 'KB', 'MB', 'GB']
                      const i = Math.floor(Math.log(bytes) / Math.log(k))
                      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
                    }
                    const getFileIcon = (fileType: string): string => {
                      if (fileType?.startsWith('image/')) return '🖼️'
                      if (fileType === 'application/pdf') return '📄'
                      if (fileType?.includes('word') || fileType?.includes('document')) return '📝'
                      if (fileType?.includes('sheet') || fileType?.includes('excel')) return '📊'
                      if (fileType?.startsWith('text/')) return '📃'
                      return '📎'
                    }

                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        {/* Thumbnail or Icon */}
                        {isImage ? (
                          <img
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center text-3xl bg-white rounded border border-gray-200">
                            {getFileIcon(attachment.fileType)}
                          </div>
                        )}

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {attachment.fileName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(attachment.fileSize)}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => {
                            // Remove from uploadedAttachments and update formData
                            setUploadedAttachments(prev => {
                              const updated = prev.filter(
                                att => !(att.fieldName === attachment.fieldName &&
                                         att.fileName === attachment.fileName &&
                                         att.uploadedAt === attachment.uploadedAt)
                              )

                              // Update formData with remaining files for this field
                              const remainingFilesForField = updated.filter(
                                att => att.fieldName === field.fieldName
                              )

                              setFormData(prevData => ({
                                ...prevData,
                                [field.fieldName]: field.validation?.multiple
                                  ? remainingFilesForField.map(f => f.fileUrl)
                                  : remainingFilesForField[0]?.fileUrl || ''
                              }))

                              return updated
                            })
                          }}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )
                  })}
              </div>
            )}

            {/* Current upload status */}
            {uploadedAttachments.filter(att => att.fieldName === field.fieldName).length > 0 && formConfig?.maxTotalFileSize && formConfig.maxTotalFileSize > 0 && (
              <div className="mt-2">
                <div className="text-xs">
                  {(() => {
                    const totalSize = uploadedAttachments
                      .filter(att => att.fieldName === field.fieldName)
                      .reduce((sum, att) => sum + (att.fileSize || 0), 0)
                    const totalMB = (totalSize / 1024 / 1024).toFixed(2)
                    const maxMB = formConfig.maxTotalFileSize
                    const percentage = Math.round((totalSize / (maxMB * 1024 * 1024)) * 100)
                    const isNearLimit = percentage > 80

                    return (
                      <div className={`flex items-center gap-2 ${isNearLimit ? 'text-orange-600' : 'text-blue-600'}`}>
                        <span>Current total: {totalMB}MB / {maxMB}MB ({percentage}%)</span>
                        {isNearLimit && <span className="text-orange-600">⚠️ Near limit</span>}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!formConfig) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || "Form configuration not found"}</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-anaheim font-bold text-green-700 mb-2">
          Success!
        </h3>
        <p className="text-green-600">
          {formConfig.successMessage || "Your message has been sent successfully!"}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Render all fields */}
      {formConfig.fields
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(field => renderField(field))}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-6 bg-brand-text-black text-white font-anaheim font-bold uppercase tracking-wider hover:bg-brand-accent-gold hover:text-brand-text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending..." : (formConfig.submitButtonText || "Submit")}
      </button>
    </form>
  )
}
