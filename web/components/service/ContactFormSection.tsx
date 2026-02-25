"use client"

import React, { useState, useEffect, FormEvent, useCallback } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { Turnstile } from "@/components/ui/turnstile"
import type { Locale } from "@/i18n.config"
import Image from "next/image"
import Link from "next/link"

const DESIGN_WIDTH = 1920
const SCALE = 0.7

// Service type icon mapping - using SVG files from public/images/service-icons
const serviceTypeIcons: Record<string, string> = {
  "product-consultation": "/images/service-icons/product-consultation.svg",
  "customized-solution": "/images/service-icons/customized-solution.svg",
  "returns": "/images/service-icons/returns.svg",
  "exchange": "/images/service-icons/exchange.svg",
  "warranty": "/images/service-icons/warranty.svg",
  "replacement": "/images/service-icons/replacement.svg",
  "refund": "/images/service-icons/refund.svg",
}

interface MediaObject {
  id: string
  url: string
  alt?: string
  variants?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    xlarge?: string
  }
  cropFocalPoint?: { x: number; y: number } | null
  width?: number
  height?: number
  enableLink?: boolean
  linkUrl?: string
  openInNewTab?: boolean
}

interface FormField {
  fieldName: string
  fieldType: string
  label: string
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  order?: number
  allowMultiple?: boolean
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
    accept?: string
    maxSize?: number
    multiple?: boolean
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
  captchaEnabled: boolean
  captchaSiteKey: string
  captchaThreshold: number
  captchaTheme: "light" | "dark" | "auto"
  captchaSize: "normal" | "compact"
  maxTotalFileSize?: number
}

interface ContactFormSectionProps {
  locale: Locale
  formName?: string
  backgroundImage?: MediaObject | null
  title?: string
  subtitle?: string
  description?: string
  email?: string
  phone?: string
  footerNote?: string
}

// Helper to get submission count from sessionStorage
const getSubmissionCount = (formName: string): number => {
  if (typeof window === "undefined") return 0
  const key = `form_submissions_${formName}`
  return parseInt(sessionStorage.getItem(key) || "0", 10)
}

// Helper to increment submission count
const incrementSubmissionCount = (formName: string): void => {
  if (typeof window === "undefined") return
  const key = `form_submissions_${formName}`
  const current = getSubmissionCount(formName)
  sessionStorage.setItem(key, String(current + 1))
}

export function ContactFormSection({
  locale,
  formName = "service-inquiry",
  backgroundImage,
  title = "Need More\nAssistance?",
  subtitle = "Manual Service Request",
  description = "Please complete the form for your service request. Providing detailed information helps us assist you efficiently and our support team will contact you within 24 business hours.",
  email = "info@busromhouse.com",
  phone = "+86 13426931306",
  footerNote = "We will get back to you within 24 working hours\n(except all major holidays)",
}: ContactFormSectionProps) {
  const vw = (px: number) => `${(px * SCALE / DESIGN_WIDTH) * 100}vw`
  // 全宽元素不缩放
  const vwFull = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

  const [formConfig, setFormConfig] = useState<FormConfig | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([])

  // Turnstile captcha state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [submissionCount, setSubmissionCount] = useState(0)

  const shouldShowCaptcha = !!(
    formConfig?.captchaEnabled &&
    formConfig.captchaSiteKey &&
    submissionCount >= (formConfig.captchaThreshold - 1)
  )

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
    setError(null)
  }, [])

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null)
    setError("Captcha verification failed. Please try again.")
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null)
  }, [])

  // Fetch form configuration
  useEffect(() => {
    const fetchFormConfig = async () => {
      try {
        const res = await fetch(`/api/form-config/${formName}?locale=${locale}`)
        if (res.ok) {
          const config = await res.json()
          setFormConfig(config)

          const initialData: Record<string, any> = {}
          config.fields.forEach((field: FormField) => {
            initialData[field.fieldName] = field.fieldType === "checkbox" ? [] : ""
          })
          setFormData(initialData)
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

    fetchFormConfig()
  }, [formName, locale])

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  const handleCheckboxChange = (fieldName: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentValues = Array.isArray(prev[fieldName]) ? prev[fieldName] : []
      if (checked) {
        return { ...prev, [fieldName]: [...currentValues, value] }
      } else {
        return { ...prev, [fieldName]: currentValues.filter((v: string) => v !== value) }
      }
    })
  }

  const handleFileUpload = async (fieldName: string, files: FileList | null, field: FormField) => {
    if (!files || files.length === 0) return

    setUploadingFiles((prev) => ({ ...prev, [fieldName]: true }))
    setError(null)

    try {
      const uploadedFiles: any[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)
        formDataUpload.append("formConfigId", formConfig?.id || "")
        formDataUpload.append("fieldName", fieldName)

        const response = await fetch("/api/form-file-upload", {
          method: "POST",
          body: formDataUpload,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Upload failed")
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

      setFormData((prev) => {
        if (field.validation?.multiple) {
          const existingUrls = Array.isArray(prev[fieldName]) ? prev[fieldName] : []
          return { ...prev, [fieldName]: [...existingUrls, ...uploadedFiles.map((f) => f.fileUrl)] }
        } else {
          return { ...prev, [fieldName]: uploadedFiles[0]?.fileUrl || "" }
        }
      })

      setUploadedAttachments((prev) => [...prev, ...uploadedFiles])
    } catch (err) {
      console.error("File upload error:", err)
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [fieldName]: false }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const missingFields: string[] = []
      formConfig?.fields.forEach((field) => {
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

      if (shouldShowCaptcha && !turnstileToken) {
        setError("Please complete the captcha verification")
        setSubmitting(false)
        return
      }

      const processedData = { ...formData }
      formConfig?.fields.forEach((field) => {
        const optionsWithCustom = field.options?.filter((o: any) => o.hasCustomInput) || []
        
        if (optionsWithCustom.length > 0) {
          if (field.fieldType === 'checkbox' && Array.isArray(processedData[field.fieldName])) {
            processedData[field.fieldName] = processedData[field.fieldName].map((val: string) => {
              const hasCustom = optionsWithCustom.some((o: any) => o.value === val)
              if (hasCustom) {
                const customVal = processedData[`${field.fieldName}_custom_${val}`]
                if (customVal) {
                  return `${val} (${customVal})`
                }
              }
              return val
            })
            
            optionsWithCustom.forEach((o: any) => {
              delete processedData[`${field.fieldName}_custom_${o.value}`]
            })
          } else if (['radio', 'select', 'checkbox'].includes(field.fieldType)) {
            const val = processedData[field.fieldName]
            const hasCustom = optionsWithCustom.some((o: any) => o.value === val)
            if (hasCustom) {
              const customVal = processedData[`${field.fieldName}_custom`]
              if (customVal) {
                processedData[field.fieldName] = `${val} (${customVal})`
              }
            }
            delete processedData[`${field.fieldName}_custom`]
          }
        }
      })

      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: formConfig?.id,
          formName: formConfig?.name,
          data: processedData,
          attachments: uploadedAttachments,
          locale,
          sourcePage: window.location.href,
          turnstileToken: shouldShowCaptcha ? turnstileToken : undefined,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        incrementSubmissionCount(formName)
        setSubmissionCount((prev) => prev + 1)

        setTimeout(() => {
          setSubmitted(false)
          const resetData: Record<string, any> = {}
          formConfig?.fields.forEach((field) => {
            resetData[field.fieldName] = field.fieldType === "checkbox" ? [] : ""
          })
          setFormData(resetData)
          setUploadedAttachments([])
          setTurnstileToken(null)
        }, 5000)
      } else {
        const errorData = await res.json()
        setError(errorData.error || formConfig?.errorMessage || "Failed to submit form")
        setTurnstileToken(null)
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError(formConfig?.errorMessage || "Failed to submit form")
      setTurnstileToken(null)
    } finally {
      setSubmitting(false)
    }
  }

  // Custom styled input field for desktop
  const renderField = (field: FormField) => {
    const inputBaseStyle: React.CSSProperties = {
      width: "100%",
      height: vw(72),
      paddingLeft: vw(20),
      paddingRight: vw(20),
      borderRadius: vw(15),
      backgroundColor: "rgba(33, 28, 11, 0.2)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      color: "white",
      fontFamily: "var(--font-anaheim)",
      fontWeight: 600,
      fontSize: vw(20),
    }

    const textareaStyle: React.CSSProperties = {
      width: "100%",
      height: vw(135),
      paddingLeft: vw(20),
      paddingRight: vw(20),
      paddingTop: vw(16),
      paddingBottom: vw(16),
      borderRadius: vw(15),
      backgroundColor: "rgba(33, 28, 11, 0.2)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      color: "white",
      fontFamily: "var(--font-anaheim)",
      fontWeight: 600,
      fontSize: vw(20),
      resize: "none" as const,
    }

    const checkboxItemStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: vw(16),
      height: vw(72),
      paddingLeft: vw(20),
      paddingRight: vw(20),
      borderRadius: vw(15),
      backgroundColor: "rgba(33, 28, 11, 0.2)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      cursor: "pointer",
      transition: "all 0.2s",
    }

    const checkboxItemActiveStyle: React.CSSProperties = {
      ...checkboxItemStyle,
      backgroundColor: "rgba(33, 28, 11, 0.5)",
    }

    switch (field.fieldType) {
      case "text":
      case "email":
      case "tel":
        return (
          <input
            type={field.fieldType}
            id={field.fieldName}
            name={field.fieldName}
            value={formData[field.fieldName] || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder || field.label}
            required={field.required}
            style={inputBaseStyle}
            className="placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors"
          />
        )

      case "textarea":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: vw(16) }}>
            <label className="font-anaheim font-semibold text-white" style={{ fontSize: vw(23) }}>
              {field.label}
            </label>
            <textarea
              id={field.fieldName}
              name={field.fieldName}
              value={formData[field.fieldName] || ""}
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              style={textareaStyle}
              className="placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors"
            />
          </div>
        )

      case "radio":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: vw(16) }}>
            <label className="font-anaheim font-semibold text-white" style={{ fontSize: vw(23) }}>
              {field.label}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: vw(14) }}>
              {field.options?.map((option: any) => {
                const isSelected = formData[field.fieldName] === option.value
                return (
                  <label
                    key={option.value}
                    style={isSelected ? checkboxItemActiveStyle : checkboxItemStyle}
                    className="hover:bg-[#211C0B]/30"
                  >
                    <div
                      style={{
                        width: vw(34),
                        height: vw(34),
                        borderRadius: "50%",
                        border: "2px solid",
                        borderColor: isSelected ? "white" : "rgba(255, 255, 255, 0.7)",
                        backgroundColor: isSelected ? "white" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            width: vw(16),
                            height: vw(16),
                            borderRadius: "50%",
                            backgroundColor: "#6E6839",
                          }}
                        />
                      )}
                    </div>
                    <span
                      className="font-anaheim font-semibold"
                      style={{
                        fontSize: vw(22),
                        color: isSelected ? "white" : "rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      {option.label}
                    </span>
                    <input
                      type="radio"
                      name={field.fieldName}
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => handleChange(field.fieldName, e.target.value)}
                      className="hidden"
                    />
                  </label>
                )
              })}
            </div>
            {field.options?.some((o: any) => formData[field.fieldName] === o.value && o.hasCustomInput) && (
              <input
                type="text"
                value={formData[`${field.fieldName}_custom`] || ""}
                onChange={(e) => handleChange(`${field.fieldName}_custom`, e.target.value)}
                placeholder={locale === 'zh' ? "请详细说明..." : "Please specify..."}
                style={inputBaseStyle}
                className="placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors mt-2 w-full"
                required
              />
            )}
          </div>
        )

      case "checkbox": {
        // Check if allowMultiple is false - behave like radio
        const isSingleSelect = field.allowMultiple === false

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: vw(16) }}>
            <label className="font-anaheim font-semibold text-white" style={{ fontSize: vw(23) }}>
              {field.label}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: vw(14) }}>
              {field.options?.map((option: any) => {
                const isSelected = isSingleSelect
                  ? formData[field.fieldName] === option.value
                  : (formData[field.fieldName] || []).includes(option.value)

                // Get icon for this option
                const iconSrc = serviceTypeIcons[option.value]

                return (
                  <div key={option.value} className="flex flex-col gap-2">
                    <label
                      style={isSelected ? checkboxItemActiveStyle : checkboxItemStyle}
                      className="hover:bg-[#211C0B]/30 h-full"
                    >
                      {/* Icon instead of checkbox/radio indicator */}
                      <div style={{ width: vw(36), height: vw(36), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {iconSrc ? (
                          <Image
                            src={iconSrc}
                            alt={option.label}
                            width={28}
                            height={28}
                            style={{
                              width: vw(28),
                              height: vw(28),
                              opacity: isSelected ? 1 : 0.7,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: vw(34),
                              height: vw(34),
                              borderRadius: isSingleSelect ? "50%" : vw(6),
                              border: "2px solid",
                              borderColor: isSelected ? "white" : "rgba(255, 255, 255, 0.7)",
                              backgroundColor: isSelected ? "white" : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s",
                            }}
                          >
                            {isSelected && isSingleSelect && (
                              <div
                                style={{
                                  width: vw(16),
                                  height: vw(16),
                                  borderRadius: "50%",
                                  backgroundColor: "#6E6839",
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <span
                        className="font-anaheim font-semibold relative"
                        style={{
                          fontSize: vw(22),
                          color: isSelected ? "white" : "rgba(255, 255, 255, 0.7)",
                          whiteSpace: 'normal',
                          display: 'block',
                          lineHeight: '1.2',
                          top: '1px'
                        }}
                      >
                        {option.label}
                      </span>
                      <input
                        type={isSingleSelect ? "radio" : "checkbox"}
                        name={field.fieldName}
                        value={option.value}
                        checked={isSelected}
                        onChange={(e) => {
                          if (isSingleSelect) {
                            handleChange(field.fieldName, e.target.value)
                          } else {
                            handleCheckboxChange(field.fieldName, option.value, e.target.checked)
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {isSelected && option.hasCustomInput && (
                      <input
                        type="text"
                        value={formData[`${field.fieldName}_custom_${option.value}`] || ""}
                        onChange={(e) => handleChange(`${field.fieldName}_custom_${option.value}`, e.target.value)}
                        placeholder={locale === 'zh' ? "请详细说明..." : "Please specify..."}
                        style={{...inputBaseStyle, height: vw(60)}}
                        className="placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors mt-2 ml-4 !w-[calc(100%-1rem)]"
                        required
                      />
                    )}
                  </div>
                )
              })}
            </div>
            {isSingleSelect && field.options?.some((o: any) => formData[field.fieldName] === o.value && o.hasCustomInput) && (
              <input
                type="text"
                value={formData[`${field.fieldName}_custom`] || ""}
                onChange={(e) => handleChange(`${field.fieldName}_custom`, e.target.value)}
                placeholder={locale === 'zh' ? "请详细说明..." : "Please specify..."}
                style={inputBaseStyle}
                className="placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors mt-2 w-full"
                required
              />
            )}
          </div>
        )
      }

      case "file":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: vw(16) }}>
            <label
              htmlFor={field.fieldName}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: vw(90),
                borderRadius: vw(15),
                cursor: "pointer",
              }}
              className="bg-[#211C0B]/50 border border-dashed border-white/30 transition-all duration-200 hover:bg-[#211C0B]/70 hover:border-white/60 hover:scale-[1.02]"
            >
              <span className="font-anaheim font-semibold text-white/50" style={{ fontSize: vw(20) }}>
                {uploadingFiles[field.fieldName]
                  ? "Uploading..."
                  : uploadedAttachments.filter((a) => a.fieldName === field.fieldName).length > 0
                  ? `${uploadedAttachments.filter((a) => a.fieldName === field.fieldName).length} file(s) uploaded`
                  : field.placeholder || "Upload File"}
              </span>
              <input
                type="file"
                id={field.fieldName}
                name={field.fieldName}
                onChange={(e) => handleFileUpload(field.fieldName, e.target.files, field)}
                accept={field.validation?.accept}
                multiple={field.validation?.multiple}
                disabled={uploadingFiles[field.fieldName]}
                className="hidden"
              />
            </label>
          </div>
        )

      default:
        return null
    }
  }

  // Group fields for layout
  const getFieldsByType = () => {
    if (!formConfig) return { nameEmail: [], serviceType: null, description: null, file: null }

    const sorted = [...formConfig.fields].sort((a, b) => (a.order || 0) - (b.order || 0))

    return {
      nameEmail: sorted.filter((f) => f.fieldType === "text" || f.fieldType === "email" || f.fieldType === "tel"),
      serviceType: sorted.find((f) => f.fieldType === "checkbox"),
      description: sorted.find((f) => f.fieldType === "textarea"),
      file: sorted.find((f) => f.fieldType === "file"),
    }
  }

  const fields = getFieldsByType()

  // Custom styled input field for mobile
  const renderMobileField = (field: FormField) => {
    const inputBaseClass =
      "w-full h-[52px] px-[16px] rounded-[12px] bg-[#211C0B]/20 border border-white/30 text-white font-anaheim font-semibold text-[16px] placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors"
    const textareaClass =
      "w-full h-[100px] px-[16px] py-[12px] rounded-[12px] bg-[#211C0B]/20 border border-white/30 text-white font-anaheim font-semibold text-[16px] placeholder:text-white/50 focus:outline-none focus:border-white/60 transition-colors resize-none"
    const checkboxItemClass =
      "flex items-center gap-[12px] h-[52px] px-[16px] rounded-[12px] bg-[#211C0B]/20 border border-white/30 cursor-pointer transition-all hover:bg-[#211C0B]/30"
    const checkboxItemActiveClass =
      "flex items-center gap-[12px] h-[52px] px-[16px] rounded-[12px] bg-[#211C0B]/50 border border-white/30 cursor-pointer"

    switch (field.fieldType) {
      case "text":
      case "email":
      case "tel":
        return (
          <input
            type={field.fieldType}
            id={`mobile-${field.fieldName}`}
            name={field.fieldName}
            value={formData[field.fieldName] || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder || field.label}
            required={field.required}
            className={inputBaseClass}
          />
        )

      case "textarea":
        return (
          <div className="space-y-[12px]">
            <label className="font-anaheim font-semibold text-[16px] text-white">
              {field.label}
            </label>
            <textarea
              id={`mobile-${field.fieldName}`}
              name={field.fieldName}
              value={formData[field.fieldName] || ""}
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={textareaClass}
            />
          </div>
        )

      case "radio":
        return (
          <div className="space-y-[12px]">
            <label className="font-anaheim font-semibold text-[16px] text-white">
              {field.label}
            </label>
            <div className="grid grid-cols-2 gap-[10px]">
              {field.options?.map((option) => {
                const isSelected = formData[field.fieldName] === option.value
                return (
                  <label
                    key={option.value}
                    className={isSelected ? checkboxItemActiveClass : checkboxItemClass}
                  >
                    <div
                      className={`w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? "bg-white border-white" : "border-white/70"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-[10px] h-[10px] rounded-full bg-[#6E6839]" />
                      )}
                    </div>
                    <span
                      className={`font-anaheim font-semibold text-[14px] ${
                        isSelected ? "text-white" : "text-white/70"
                      }`}
                    >
                      {option.label}
                    </span>
                    <input
                      type="radio"
                      name={field.fieldName}
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => handleChange(field.fieldName, e.target.value)}
                      className="hidden"
                    />
                  </label>
                )
              })}
            </div>
          </div>
        )

      case "checkbox": {
        const isSingleSelect = field.allowMultiple === false

        return (
          <div className="space-y-[12px]">
            <label className="font-anaheim font-semibold text-[16px] text-white">
              {field.label}
            </label>
            <div className="grid grid-cols-2 gap-[10px]">
              {field.options?.map((option) => {
                const isSelected = isSingleSelect
                  ? formData[field.fieldName] === option.value
                  : (formData[field.fieldName] || []).includes(option.value)

                const iconSrc = serviceTypeIcons[option.value]

                return (
                  <label
                    key={option.value}
                    className={isSelected ? checkboxItemActiveClass : checkboxItemClass}
                  >
                    <div className="w-[24px] h-[24px] flex items-center justify-center">
                      {iconSrc ? (
                        <Image
                          src={iconSrc}
                          alt={option.label}
                          width={20}
                          height={20}
                          className="w-[20px] h-[20px]"
                          style={{ opacity: isSelected ? 1 : 0.7 }}
                        />
                      ) : (
                        <div
                          className={`w-[24px] h-[24px] ${isSingleSelect ? "rounded-full" : "rounded-[4px]"} border-2 flex items-center justify-center transition-colors ${
                            isSelected ? "bg-white border-white" : "border-white/70"
                          }`}
                        >
                          {isSelected && isSingleSelect && (
                            <div className="w-[10px] h-[10px] rounded-full bg-[#6E6839]" />
                          )}
                        </div>
                      )}
                    </div>
                    <span
                      className={`font-anaheim font-semibold text-[14px] flex-1 ${
                        isSelected ? "text-white" : "text-white/70"
                      }`}
                    >
                      {option.label}
                    </span>
                    <input
                      type={isSingleSelect ? "radio" : "checkbox"}
                      name={field.fieldName}
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => {
                        if (isSingleSelect) {
                          handleChange(field.fieldName, e.target.value)
                        } else {
                          handleCheckboxChange(field.fieldName, option.value, e.target.checked)
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )
              })}
            </div>
          </div>
        )
      }

      case "file":
        return (
          <div className="space-y-[12px]">
            <label
              htmlFor={`mobile-${field.fieldName}`}
              className="flex items-center justify-center h-[60px] rounded-[12px] bg-[#211C0B]/50 border border-white/30 cursor-pointer hover:bg-[#211C0B]/60 transition-colors"
            >
              <span className="font-anaheim font-semibold text-[14px] text-white/50">
                {uploadingFiles[field.fieldName]
                  ? "Uploading..."
                  : uploadedAttachments.filter((a) => a.fieldName === field.fieldName).length > 0
                  ? `${uploadedAttachments.filter((a) => a.fieldName === field.fieldName).length} file(s) uploaded`
                  : field.placeholder || "Upload File"}
              </span>
              <input
                type="file"
                id={`mobile-${field.fieldName}`}
                name={field.fieldName}
                onChange={(e) => handleFileUpload(field.fieldName, e.target.files, field)}
                accept={field.validation?.accept}
                multiple={field.validation?.multiple}
                disabled={uploadingFiles[field.fieldName]}
                className="hidden"
              />
            </label>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section className="relative w-full bg-[#6E6839] mx-auto overflow-hidden" style={{ height: "auto" }}>
      {/* ==================== Mobile Layout ==================== */}
      <div className="lg:hidden px-6 py-6">
        {/* Background with blur */}
        <div className="absolute inset-0">
          {backgroundImage && (
            backgroundImage.enableLink && backgroundImage.linkUrl ? (
              <Link href={backgroundImage.linkUrl} target={backgroundImage.openInNewTab ? "_blank" : undefined} rel={backgroundImage.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                <OptimizedImage
                  image={backgroundImage as any}
                  alt="Contact form background"
                  size="large"
                  className="w-full h-full object-cover opacity-50"
                />
              </Link>
            ) : (
              <OptimizedImage
                image={backgroundImage as any}
                alt="Contact form background"
                size="large"
                className="w-full h-full object-cover opacity-50"
              />
            )
          )}
          <div className="absolute inset-0 backdrop-blur-[7.5px]" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Title */}
          <h2 className="font-anaheim font-extrabold text-[26px] leading-[34px] mb-2">
            <span className="text-white" style={{ WebkitTextStroke: "1px #FFEF72", paintOrder: "stroke fill" }}>
              Need{" "}
            </span>
            <span
              className="font-paytone-one"
              style={{ WebkitTextStroke: "0.5px #FFEF72", WebkitTextFillColor: "transparent" }}
            >
              More
            </span>
            <br />
            <span className="text-white" style={{ WebkitTextStroke: "1px #FFEF72", paintOrder: "stroke fill" }}>
              Assistance?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="font-anaheim font-extrabold text-[17px] text-[#FFF071] mb-2">
            {subtitle}
          </p>

          {/* Description */}
          <p className="font-anaheim font-normal text-[13px] leading-[20px] text-white mb-5">
            {description}
          </p>

          {/* Form */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : submitted ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-[12px] p-6 text-center">
              <svg className="w-12 h-12 text-[#FFF071] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-anaheim font-bold text-white mb-2">Success!</h3>
              <p className="text-white/80 text-sm">{formConfig?.successMessage || "Your message has been sent successfully!"}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-[12px]">
              {/* Name & Email Fields */}
              {fields.nameEmail.slice(0, 2).map((field) => (
                <div key={field.fieldName}>{renderMobileField(field)}</div>
              ))}

              {/* Service Type */}
              {fields.serviceType && renderMobileField(fields.serviceType)}

              {/* Description */}
              {fields.description && renderMobileField(fields.description)}

              {/* File Upload */}
              {fields.file && renderMobileField(fields.file)}

              {/* Captcha */}
              {shouldShowCaptcha && formConfig?.captchaSiteKey && (
                <div className="flex justify-center py-3">
                  <Turnstile
                    siteKey={formConfig.captchaSiteKey}
                    onVerify={handleTurnstileVerify}
                    onError={handleTurnstileError}
                    onExpire={handleTurnstileExpire}
                    theme={formConfig.captchaTheme}
                    size="compact"
                    language={locale === "zh" ? "zh-CN" : locale}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-[12px] p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || (shouldShowCaptcha && !turnstileToken)}
                className="w-full h-[52px] rounded-full bg-[#B2A224] text-white font-anaheim font-semibold text-[16px] hover:bg-[#9A8C1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending..." : formConfig?.submitButtonText || "Send Inquiry"}
              </button>
            </form>
          )}

          {/* Contact Info */}
          <div className="mt-6 pt-5 border-t border-white/20">
            <div className="mb-3">
              <p className="font-anaheim font-semibold text-[12px] text-white/70">Email</p>
              <p className="font-anaheim font-semibold text-[16px] text-white">{email}</p>
            </div>
            <div className="mb-3">
              <p className="font-anaheim font-semibold text-[12px] text-white/70">Phone / WhatsApp</p>
              <p className="font-anaheim font-semibold text-[17px] text-white">{phone}</p>
            </div>
            <p className="font-anaheim font-semibold text-[11px] leading-[18px] text-white/70 whitespace-pre-line">
              {footerNote}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== Desktop Layout ==================== */}
      <div className="hidden lg:block relative w-full" style={{ height: vwFull(922) }}>
        {/* Background - 全宽不缩放 */}
        <div className="absolute inset-0 bg-[#6E6839]">
          {backgroundImage && (
            backgroundImage.enableLink && backgroundImage.linkUrl ? (
              <Link href={backgroundImage.linkUrl} target={backgroundImage.openInNewTab ? "_blank" : undefined} rel={backgroundImage.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
                <OptimizedImage
                  image={backgroundImage as any}
                  alt="Contact form background"
                  size="xlarge"
                  className="w-full h-full object-cover opacity-50"
                />
              </Link>
            ) : (
              <OptimizedImage
                image={backgroundImage as any}
                alt="Contact form background"
                size="xlarge"
                className="w-full h-full object-cover opacity-50"
              />
            )
          )}
          {/* Blur overlay */}
          <div className="absolute inset-0" style={{ backdropFilter: `blur(${vwFull(7.5)})` }} />
        </div>

        {/* Content Wrapper - 居中容器 */}
        <div
          className="relative h-full mx-auto"
          style={{ width: vw(1920) }}
        >
          {/* Decorative Mask with gradient glow - 880px高度，垂直居中 */}
          <div
            className="absolute overflow-hidden left-1/2 top-1/2"
            style={{
              transform: "translate(-50%, -50%)",
              width: vw(1600),
              height: vwFull(800),
              borderRadius: vw(52),
              backdropFilter: `blur(${vw(18.7)})`,
              background: "rgba(117, 111, 63, 0.36)",
            }}
          >
            {/* Radial gradient glow at bottom-left - ellipse fading outward */}
            <svg
              className="absolute pointer-events-none"
              style={{
                left: vw(-1018),
                top: vw(260),
                width: vw(2173),
                height: vw(2257),
              }}
              viewBox="0 0 2173 2257"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <radialGradient id="contactGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#CFBE38" stopOpacity="0.93" />
                  <stop offset="100%" stopColor="#998D2D" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="1086.5" cy="1128.5" rx="1086.5" ry="1128.26" fill="url(#contactGlow)" />
            </svg>
          </div>

          {/* Content Container - 在800px框内居中 */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: "translate(-50%, -50%)",
              width: vw(1600),
              height: vwFull(800),
            }}
          >
            {/* Left Side - Contact Info */}
            <div className="absolute" style={{ left: vw(96), top: vwFull(55) }}>
              {/* Main Title - Need More Assistance? */}
              <h2 className="font-anaheim font-extrabold" style={{ fontSize: vw(85), lineHeight: vw(98) }}>
                {/* Need - white fill with yellow stroke */}
                <span
                  className="text-white"
                  style={{
                    WebkitTextStroke: `${vw(2)} #FFEF72`,
                    paintOrder: "stroke fill",
                  }}
                >
                  Need{" "}
                </span>
                {/* More - hollow outline text */}
                <span
                  className="font-paytone-one"
                  style={{
                    fontSize: vw(85),
                    lineHeight: vw(98),
                    WebkitTextStroke: `${vw(0.5)} #FFEF72`,
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  More
                </span>
                <br />
                {/* Assistance? - white fill with yellow stroke */}
                <span
                  className="text-white"
                  style={{
                    WebkitTextStroke: `${vw(2)} #FFEF72`,
                    paintOrder: "stroke fill",
                  }}
                >
                  Assistance?
                </span>
              </h2>
            </div>

            {/* Subtitle - Manual Service Request */}
            <p
              className="absolute font-anaheim font-extrabold"
              style={{
                left: vw(96),
                top: vwFull(200),
                fontSize: vw(40),
                lineHeight: vw(54),
                color: "#FFF071",
              }}
            >
              {subtitle}
            </p>

            {/* Description */}
            <p
              className="absolute font-anaheim font-normal text-white"
              style={{
                left: vw(96),
                top: vwFull(255),
                width: vw(475),
                fontSize: vw(24),
                lineHeight: vw(36),
              }}
            >
              {description}
            </p>

            {/* Email Label */}
            <p
              className="absolute font-anaheim font-semibold text-white/70"
              style={{
                left: vw(96),
                top: vwFull(495),
                fontSize: vw(24),
                lineHeight: vw(40),
              }}
            >
              Email
            </p>

            {/* Email Value */}
            <a
              href={`mailto:${email}`}
              className="absolute font-anaheim font-semibold text-white underline hover:text-white/80 transition-colors"
              style={{
                left: vw(96),
                top: vwFull(530),
                fontSize: vw(40),
                lineHeight: vw(48),
              }}
            >
              {email}
            </a>

            {/* Phone Label */}
            <p
              className="absolute font-anaheim font-semibold text-white/70"
              style={{
                left: vw(96),
                top: vwFull(600),
                fontSize: vw(24),
                lineHeight: vw(40),
              }}
            >
              Phone / WhatsApp
            </p>

            {/* Phone Value */}
            <a
              href={`tel:${phone?.replace(/\s/g, '')}`}
              className="absolute font-anaheim font-semibold text-white underline hover:text-white/80 transition-colors"
              style={{
                left: vw(96),
                top: vwFull(635),
                fontSize: vw(45),
                lineHeight: vw(48),
                letterSpacing: '0.07em',
              }}
            >
              {phone}
            </a>

            {/* Footer Note */}
            <p
              className="absolute font-anaheim font-semibold text-white whitespace-pre-line"
              style={{
                left: vw(96),
                top: vwFull(720),
                width: vw(428),
                fontSize: vw(16),
                lineHeight: vw(26),
              }}
            >
              {footerNote}
            </p>

            {/* Right Side - Form */}
            <div className="absolute" style={{ left: vw(787), top: vwFull(55), width: vw(715) }}>
          {/* Form Header */}
          <h3
            className="font-anaheim font-semibold text-white"
            style={{
              fontSize: vw(42),
              lineHeight: vw(61),
              marginBottom: vw(42),
            }}
          >
            Send us an inquiry via the following contact details
          </h3>

          {loading ? (
            <div className="flex items-center justify-center" style={{ paddingTop: vw(48), paddingBottom: vw(48) }}>
              <div
                className="border-2 border-white border-t-transparent rounded-full animate-spin"
                style={{ width: vw(32), height: vw(32) }}
              />
            </div>
          ) : submitted ? (
            <div
              className="bg-white/20 backdrop-blur-sm text-center"
              style={{ borderRadius: vw(15), padding: vw(32) }}
            >
              <svg
                className="text-[#FFF071] mx-auto"
                style={{ width: vw(64), height: vw(64), marginBottom: vw(16) }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3
                className="font-anaheim font-bold text-white"
                style={{ fontSize: vw(20), marginBottom: vw(8) }}
              >
                Success!
              </h3>
              <p className="text-white/80" style={{ fontSize: vw(16) }}>
                {formConfig?.successMessage || "Your message has been sent successfully!"}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: vw(14) }}>
              {/* Name & Email Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: vw(37) }}>
                {fields.nameEmail.slice(0, 2).map((field) => (
                  <div key={field.fieldName}>{renderField(field)}</div>
                ))}
              </div>

              {/* Service Type Checkboxes */}
              {fields.serviceType && renderField(fields.serviceType)}

              {/* Description Textarea */}
              {fields.description && renderField(fields.description)}

              {/* File Upload */}
              {fields.file && renderField(fields.file)}

              {/* Captcha */}
              {shouldShowCaptcha && formConfig?.captchaSiteKey && (
                <div className="flex justify-center" style={{ paddingTop: vw(16), paddingBottom: vw(16) }}>
                  <Turnstile
                    siteKey={formConfig.captchaSiteKey}
                    onVerify={handleTurnstileVerify}
                    onError={handleTurnstileError}
                    onExpire={handleTurnstileExpire}
                    theme={formConfig.captchaTheme}
                    size={formConfig.captchaSize}
                    language={locale === "zh" ? "zh-CN" : locale}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  className="bg-red-500/20 border border-red-500/50 text-red-200"
                  style={{ borderRadius: vw(15), padding: vw(16), fontSize: vw(14) }}
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || (shouldShowCaptcha && !turnstileToken)}
                className="w-full bg-[#B2A224] text-white font-anaheim font-semibold hover:bg-[#9A8C1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  height: vw(72),
                  borderRadius: vw(63),
                  fontSize: vw(23),
                }}
              >
                {submitting ? "Sending..." : formConfig?.submitButtonText || "Send Inquiry"}
              </button>
            </form>
          )}
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
