"use client"

import { useState, useEffect, FormEvent, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import type { Locale } from "@/i18n.config"
import { Info, ChevronDown } from "lucide-react"
import { Turnstile } from "@/components/ui/turnstile"
import { cn } from "@/lib/utils"
import { trackUetConversion } from "@/lib/analytics/uet"
import { Label } from "@/components/ui/label"
import { PhoneInput, defaultCountries, parseCountry } from 'react-international-phone'
// @ts-ignore
import 'react-international-phone/style.css'
import { uploadFileWithProgress } from "@/lib/upload"

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
  submittingText: string
  successMessage: string
  errorRequiredFields: string
  errorNetworkMessage: string
  errorCaptchaMessage: string
  errorMessage: string
  enableCaptcha: boolean
  maxSubmissionsPerDay: number
  maxTotalFileSize?: number // MB
  // Turnstile captcha settings
  captchaEnabled: boolean
  captchaSiteKey: string
  captchaThreshold: number
  captchaTheme: 'light' | 'dark' | 'auto'
  captchaSize: 'normal' | 'compact'
  // Privacy consent
  privacyConsentText?: string
}

interface DynamicFormProps {
  formConfig?: any
  formName?: string
  locale: Locale
  className?: string
  onSuccess?: () => void
  style?: React.CSSProperties
}

// Helper to get submission count from sessionStorage
const getSubmissionCount = (formName: string): number => {
  if (typeof window === 'undefined') return 0
  const key = `form_submissions_${formName}`
  return parseInt(sessionStorage.getItem(key) || '0', 10)
}

// Helper to increment submission count in sessionStorage
const incrementSubmissionCount = (formName: string): void => {
  if (typeof window === 'undefined') return
  const key = `form_submissions_${formName}`
  const current = getSubmissionCount(formName)
  sessionStorage.setItem(key, String(current + 1))
}

export function DynamicForm({ formConfig: initialFormConfig, formName, locale, className, onSuccess, style }: DynamicFormProps) {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(initialFormConfig || null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(!initialFormConfig)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([])
  const [pendingFiles, setPendingFiles] = useState<Record<string, File[]>>({})
  const [showFileHelp, setShowFileHelp] = useState<string | null>(null)
  const fileHelpRef = useRef<HTMLDivElement>(null)

  // Turnstile captcha state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [submissionCount, setSubmissionCount] = useState(0)

  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false)
  const STORAGE_KEY = 'busrom_privacy_consent'

  // Check global consent status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accepted = localStorage.getItem(STORAGE_KEY) === 'true';
      if (accepted) {
        setPrivacyAccepted(true);
        setIsGloballyAccepted(true);
      }
    }
  }, []);

  const handlePrivacyToggle = (val: boolean) => {
    setPrivacyAccepted(val);
    if (val) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsGloballyAccepted(true);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setIsGloballyAccepted(false);
    }
  };

  // Check if captcha should be shown
  const shouldShowCaptcha = !!(formConfig?.captchaEnabled &&
    formConfig.captchaSiteKey &&
    submissionCount >= (formConfig.captchaThreshold - 1))

  // Turnstile callbacks
  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
    setError(null)
  }, [])

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null)
    setError('Captcha verification failed. Please try again.')
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null)
  }, [])

  // Initialize form data if config is already available
  useEffect(() => {
    if (initialFormConfig && initialFormConfig.fields) {
      const initialData: Record<string, any> = {}
      initialFormConfig.fields.forEach((field: FormField) => {
        initialData[field.fieldName] = field.fieldType === 'checkbox' ? [] : ''
      })
      setFormData(initialData)
      setSubmissionCount(getSubmissionCount(formName || initialFormConfig.name || 'default'))
    }
  }, [initialFormConfig, formName])

  // Fetch form configuration ONLY if not provided via props
  useEffect(() => {
    if (initialFormConfig) return

    const fetchFormConfigData = async () => {
      if (!formName) return
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

          // Load submission count from sessionStorage
          setSubmissionCount(getSubmissionCount(formName))
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

    fetchFormConfigData()
  }, [formName, locale, initialFormConfig])

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


  // Handle file selection
  const handleFileUpload = (fieldName: string, files: FileList | null, field: FormField) => {
    if (!files || files.length === 0) return

    // Pre-validation for required fields
    const missingFields: string[] = []
    formConfig?.fields.forEach((f) => {
      if (f.required && f.fieldType !== "file") {
        const value = formData[f.fieldName]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          missingFields.push(f.label)
        }
      }
    })

    if (missingFields.length > 0) {
      setError(`Please fill in required fields (${missingFields.join(", ")}) before selecting files.`)
      return
    }

    // 1. Calculate current total size of all pending files
    let currentTotalSize = 0
    Object.values(pendingFiles).forEach(fileList => {
      fileList.forEach(file => { currentTotalSize += file.size })
    })

    if (formConfig?.maxTotalFileSize) {
      const newFilesSize = Array.from(files).reduce((sum, file) => sum + file.size, 0)
      const totalSizeBytes = currentTotalSize + newFilesSize
      const maxTotalSizeBytes = formConfig.maxTotalFileSize * 1024 * 1024

      if (totalSizeBytes > maxTotalSizeBytes) {
        setError(`Total file size limit exceeded. Limit: ${formConfig.maxTotalFileSize}MB`)
        return
      }
    }

    // 2. Validate individual files
    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const validationError = validateFile(file, field)
      if (validationError) {
        setError(validationError)
        return
      }
      validFiles.push(file)
    }

    // 3. Store files locally for later upload
    setPendingFiles(prev => ({
      ...prev,
      [fieldName]: field.validation?.multiple 
        ? [...(prev[fieldName] || []), ...validFiles]
        : [validFiles[0]]
    }))
    setError(null)
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
        setError(formConfig?.errorRequiredFields || `Please fill in required fields: ${missingFields.join(", ")}`)
        setSubmitting(false)
        return
      }

      // Check captcha if required
      if (shouldShowCaptcha && !turnstileToken) {
        setError(formConfig?.errorCaptchaMessage || 'Please complete the captcha verification')
        setSubmitting(false)
        return
      }

      // 1. Upload pending files first
      const currentAttachments = [...uploadedAttachments]
      const allFilesToUpload: Array<{ fieldName: string, file: File }> = []
      
      Object.entries(pendingFiles).forEach(([fieldName, files]) => {
        files.forEach(file => allFilesToUpload.push({ fieldName, file }))
      })

      if (allFilesToUpload.length > 0) {
        // Mark all fields as uploading for UI feedback
        const uniqueFieldNames = Array.from(new Set(allFilesToUpload.map(f => f.fieldName)))
        setUploadingFiles(Object.fromEntries(uniqueFieldNames.map(name => [name, true])))

        try {
          const uploadPromises = allFilesToUpload.map(({ fieldName, file }, index) => {
            return uploadFileWithProgress({
              url: '/api/form-file-upload',
              file: file,
              fieldName: 'file',
              additionalData: {
                formConfigId: formConfig?.id || '',
                fieldName: fieldName
              },
              onProgress: (event) => {
                setUploadProgress(prev => ({
                  ...prev,
                  [`upload-${index}`]: event.percent
                }))
              }
            })
          })

          const uploadResults = await Promise.all(uploadPromises)
          currentAttachments.push(...uploadResults.map((res, idx) => ({
            fieldName: allFilesToUpload[idx].fieldName,
            fileName: res.fileName,
            fileUrl: res.fileUrl,
            fileSize: res.fileSize,
            fileType: res.fileType,
            uploadedAt: res.uploadedAt
          })))
        } catch (uploadErr) {
          console.error('File upload during submission failed:', uploadErr)
          setError('Failed to upload files. Please try again.')
          setSubmitting(false)
          setUploadingFiles({})
          return
        } finally {
          setUploadingFiles({})
          setUploadProgress({})
        }
      }

      // Submit form
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: formConfig?.id,
          formName: formConfig?.name,
          data: formData,
          attachments: currentAttachments,
          locale,
          sourcePage: window.location.href,
          // Include turnstile token if captcha is enabled
          turnstileToken: shouldShowCaptcha ? turnstileToken : undefined,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        onSuccess?.()

        // Push success event to Google Tag Manager
        if (typeof window !== "undefined") {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: "form_submit_success",
            form_id: formConfig?.name || formName || "dynamic-form",
            form_name: formConfig?.name || formName || "Dynamic Form",
          });
        }
        trackUetConversion("Submit", "Request_Quote", 5, "Lead")

        // 提交成功后也强制记录同意（双重保障）
        if (formConfig?.privacyConsentText) {
          localStorage.setItem(STORAGE_KEY, 'true');
          setIsGloballyAccepted(true);
          setPrivacyAccepted(true);
        }

        // Increment submission count for next time
        const finalFormName = formName || formConfig?.name || 'default-form';
        incrementSubmissionCount(finalFormName)
        setSubmissionCount(prev => prev + 1)

        // Reset form after 5 seconds
        setTimeout(() => {
          setSubmitted(false)
          const resetData: Record<string, any> = {}
          formConfig?.fields.forEach(field => {
            resetData[field.fieldName] = field.fieldType === 'checkbox' ? [] : ''
          })
          setFormData(resetData)
          setUploadedAttachments([])
          setTurnstileToken(null) // Reset captcha token
        }, 5000)
      } else {
        const errorData = await res.json()
        setError(errorData.error || formConfig?.errorNetworkMessage || formConfig?.errorMessage || "Failed to submit form")
        setTurnstileToken(null) // Reset captcha on error
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError(formConfig?.errorNetworkMessage || formConfig?.errorMessage || "Failed to submit form")
      setTurnstileToken(null) // Reset captcha on error
    } finally {
      setSubmitting(false)
    }
  }

  // Render field based on type
  const renderField = (field: FormField) => {
    const baseInputClass = "w-full px-4 py-3 border border-brand-accent-border rounded-none focus:outline-none focus:border-brand-text-black transition-colors font-anaheim text-base"
    const labelClass = "block text-sm font-anaheim font-bold text-brand-text-black mb-2"

    switch (field.fieldType) {
      case 'text':
      case 'email':
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
              spellCheck="false"
              className={baseInputClass}
            />
          </div>
        )

      case 'phone':
        return (
          <div key={field.fieldName} className="dynamic-phone-input">
            <label htmlFor={field.fieldName} className={labelClass}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <PhoneInput
              defaultCountry="us"
              value={formData[field.fieldName] || ''}
              onChange={(phone) => handleChange(field.fieldName, phone)}
              placeholder={field.placeholder}
              inputClassName="!flex-1 !h-auto !w-full !px-4 !py-3 !border-none !rounded-none !focus:outline-none !font-anaheim !text-base"
              className="!flex !w-full !border !border-brand-accent-border !rounded-none !focus-within:border-brand-text-black !transition-colors"
              countrySelectorStyleProps={{
                buttonClassName: "!h-full !px-2 !border-r !border-brand-accent-border !bg-transparent !rounded-none hover:!bg-gray-50",
                buttonContentWrapperClassName: "!flex !items-center !gap-1",
                dropdownArrowClassName: "!hidden"
              }}
            />
          </div>
        )

      case 'country':
        return (
          <div key={field.fieldName}>
            <label htmlFor={field.fieldName} className={labelClass}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <select
                id={field.fieldName}
                name={field.fieldName}
                value={formData[field.fieldName] || ''}
                onChange={(e) => handleChange(field.fieldName, e.target.value)}
                required={field.required}
                className={cn(baseInputClass, "appearance-none pr-10")}
              >
                <option value="">Select Country/Region...</option>
                {defaultCountries.map(c => {
                  const country = parseCountry(c);
                  return (
                    <option key={country.iso2} value={country.name}>
                      {country.name} (+{country.dialCode})
                    </option>
                  )
                })}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <ChevronDown size={18} />
              </div>
            </div>
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
              spellCheck="false"
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
                    spellCheck="false"
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
                    spellCheck="false"
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
              spellCheck="false"
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
              spellCheck="false"
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
            {!uploadingFiles[field.fieldName] && (
              <div className="mt-2 text-sm text-gray-500">
                {((pendingFiles[field.fieldName]?.length || 0) + uploadedAttachments.filter(a => a.fieldName === field.fieldName).length) > 0 ? (
                  <span className="text-green-600 font-medium">
                    {(pendingFiles[field.fieldName]?.length || 0) + uploadedAttachments.filter(a => a.fieldName === field.fieldName).length} file(s) selected
                  </span>
                ) : (
                  <span>No file selected</span>
                )}
              </div>
            )}
            {uploadingFiles[field.fieldName] && (
              <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                {(() => {
                  const fieldProgressKeys = Object.keys(uploadProgress).filter(k => k.startsWith(`${field.fieldName}-`));
                  if (fieldProgressKeys.length === 0) return "Uploading...";
                  const total = fieldProgressKeys.reduce((acc, k) => acc + uploadProgress[k], 0);
                  const avg = Math.round(total / fieldProgressKeys.length);
                  return `Uploading ${avg}%...`;
                })()}
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
        <p className="text-green-600 whitespace-pre-line">
          {formConfig.successMessage || "Your message has been sent successfully!"}
        </p>
      </div>
    )
  }

  return (
    <form
      id={formConfig?.name || formName || "dynamic-form"}
      onSubmit={handleSubmit}
      className={className}
    >
      {/* Render all fields */}
      {formConfig.fields
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(field => renderField(field))}

      {/* Turnstile captcha widget */}
      {shouldShowCaptcha && formConfig.captchaSiteKey && (
        <div className="flex justify-center my-4">
          <Turnstile
            siteKey={formConfig.captchaSiteKey}
            onVerify={handleTurnstileVerify}
            onError={handleTurnstileError}
            onExpire={handleTurnstileExpire}
            theme={formConfig.captchaTheme}
            size={formConfig.captchaSize}
            language={locale === 'zh' ? 'zh-CN' : locale}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Privacy Consent Checkbox - Only show if not already globally accepted */}
      {formConfig.privacyConsentText && (
        <div className="flex items-start gap-2 my-4 group cursor-pointer" onClick={() => handlePrivacyToggle(!privacyAccepted)}>
          <div className={cn(
            "mt-1 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all",
            privacyAccepted ? "bg-brand-text-black border-brand-text-black" : "border-gray-300 bg-transparent"
          )}>
            {privacyAccepted && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <p className="text-[10px] md:text-[16px] leading-relaxed text-gray-500 text-left whitespace-pre-line select-none">
            {formConfig.privacyConsentText}
          </p>
        </div>
      )}

      {/* Submit button */}
      <motion.button
        type="submit"
        style={{ transformOrigin: "center" }}
        initial={{ rotate: 0, scale: 1 }}
        animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
        whileHover={{
          rotate: 0,
          scale: 1.05,
          transition: { scale: { duration: 0.3, ease: "easeOut" } },
        }}
        transition={{
          rotate: {
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "linear",
          },
        }}
        disabled={submitting || (shouldShowCaptcha && !turnstileToken) || (!!formConfig.privacyConsentText && !privacyAccepted)}
        className={cn(
          "w-full py-4 px-6 bg-brand-text-black text-white font-anaheim font-bold uppercase tracking-wider hover:bg-brand-accent-gold hover:text-brand-text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-pre-line leading-tight h-auto",
          (!!formConfig.privacyConsentText && !privacyAccepted) && "grayscale opacity-80"
        )}
      >
        {submitting ? (formConfig.submittingText || "Sending...") : (formConfig.submitButtonText || "Submit")}
      </motion.button>
    </form>
  )
}
