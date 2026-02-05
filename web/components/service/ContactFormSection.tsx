"use client"

import React, { useState, useEffect, FormEvent, useCallback } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { Turnstile } from "@/components/ui/turnstile"
import Image from "next/image"
import type { Locale } from "@/i18n.config"

const DESIGN_WIDTH = 1920
// No scale - using Figma values directly (1920px design)

// Service type SVG icon paths
const serviceTypeIconPaths: Record<string, string> = {
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
  // Convert Figma px to responsive vw (based on 1920px design, no scale)
  const vw = (px: number) => `${(px / DESIGN_WIDTH) * 100}vw`

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

      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: formConfig?.id,
          formName: formConfig?.name,
          data: formData,
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
  // Figma: Input 339×62, border-radius 15, font 20px
  const renderField = (field: FormField) => {
    const inputBaseStyle: React.CSSProperties = {
      width: "100%",
      height: vw(62),
      paddingLeft: vw(26),
      paddingRight: vw(26),
      borderRadius: vw(15),
      backgroundColor: "rgba(33, 28, 11, 0.18)",
      border: "1px solid rgba(255, 255, 255, 0.34)",
      color: "white",
      fontFamily: "var(--font-anaheim)",
      fontWeight: 600,
      fontSize: vw(20),
    }

    // Figma: Textarea 715×117
    const textareaStyle: React.CSSProperties = {
      width: "100%",
      height: vw(117),
      paddingLeft: vw(26),
      paddingRight: vw(26),
      paddingTop: vw(16),
      paddingBottom: vw(16),
      borderRadius: vw(15),
      backgroundColor: "rgba(33, 28, 11, 0.18)",
      border: "1px solid rgba(255, 255, 255, 0.34)",
      color: "white",
      fontFamily: "var(--font-anaheim)",
      fontWeight: 600,
      fontSize: vw(20),
      resize: "none" as const,
    }

    // Figma: Checkbox item 339×62
    const checkboxItemStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: vw(20),
      height: vw(62),
      paddingLeft: vw(26),
      paddingRight: vw(26),
      borderRadius: vw(15),
      backgroundColor: "rgba(33, 28, 11, 0.18)",
      border: "1px solid rgba(255, 255, 255, 0.34)",
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
          <div style={{ display: "flex", flexDirection: "column", gap: vw(13) }}>
            <label className="font-anaheim font-semibold text-white" style={{ fontSize: vw(24), lineHeight: vw(40) }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: vw(12) }}>
            <label className="font-anaheim font-semibold text-white" style={{ fontSize: vw(24) }}>
              {field.label}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: vw(14) }}>
              {field.options?.map((option) => {
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
          </div>
        )

      case "checkbox": {
        // Check if allowMultiple is false - behave like radio
        const isSingleSelect = field.allowMultiple === false

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: vw(12) }}>
            <label className="font-anaheim font-semibold text-white" style={{ fontSize: vw(24) }}>
              {field.label}
            </label>
            {/* Figma: column gap = 1264-888-339 = 37, row gap = 4788-4714-62 = 12 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: vw(37), rowGap: vw(12) }}>
              {field.options?.map((option) => {
                const isSelected = isSingleSelect
                  ? formData[field.fieldName] === option.value
                  : (formData[field.fieldName] || []).includes(option.value)

                // Get SVG icon path for this option
                const iconPath = serviceTypeIconPaths[option.value]

                return (
                  <label
                    key={option.value}
                    style={isSelected ? checkboxItemActiveStyle : checkboxItemStyle}
                    className="hover:bg-[#211C0B]/30"
                  >
                    {/* Icon instead of checkbox/radio indicator */}
                    <div style={{ width: vw(36), height: vw(36), display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {iconPath ? (
                        <Image
                          src={iconPath}
                          alt={option.label}
                          width={28}
                          height={28}
                          className={`transition-opacity ${isSelected ? "opacity-100" : "opacity-70"}`}
                          style={{ width: vw(28), height: vw(28) }}
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
                      className="font-anaheim font-semibold"
                      style={{
                        fontSize: vw(20),
                        color: isSelected ? "white" : "rgba(255, 255, 255, 0.7)",
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
                )
              })}
            </div>
          </div>
        )
      }

      case "file":
        return (
          <div>
            <label
              htmlFor={field.fieldName}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: vw(78),
                borderRadius: vw(15),
                backgroundColor: "rgba(33, 28, 11, 0.54)",
                border: "1px dashed rgba(255, 255, 255, 0.34)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              className="hover:bg-[#211C0B]/60"
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

                const iconPath = serviceTypeIconPaths[option.value]

                return (
                  <label
                    key={option.value}
                    className={isSelected ? checkboxItemActiveClass : checkboxItemClass}
                  >
                    <div className="w-[24px] h-[24px] flex items-center justify-center relative">
                      {iconPath ? (
                        <Image
                          src={iconPath}
                          alt={option.label}
                          width={20}
                          height={20}
                          className={`transition-opacity ${isSelected ? "opacity-100" : "opacity-70"}`}
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
            <OptimizedImage
              image={backgroundImage as any}
              alt="Contact form background"
              size="large"
              className="w-full h-full object-cover opacity-50"
            />
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
      {/* Figma: 1920×922 */}
      <div className="hidden lg:block relative w-full" style={{ height: vw(922) }}>
        {/* Background - 全宽 */}
        <div className="absolute inset-0 bg-[#6E6839]">
          {backgroundImage && (
            <OptimizedImage
              image={backgroundImage as any}
              alt="Contact form background"
              size="xlarge"
              className="w-full h-full object-cover opacity-50"
            />
          )}
          {/* Blur overlay - Figma: radius 7.5 */}
          <div className="absolute inset-0" style={{ backdropFilter: `blur(${vw(7.5)})` }} />
        </div>

        {/* 内容容器 - 全宽定位 */}
        <div className="relative w-full h-full">
          {/* Decorative Mask with gradient glow - 背景框 */}
          {/* 内容边界: x=307~1603, y=45~877, 加padding后居中 */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: vw(267),
              top: vw(5),
              width: vw(1376),
              height: vw(912),
              borderRadius: vw(52),
              backdropFilter: `blur(${vw(18.7)})`,
              background: "rgba(117, 111, 63, 0.36)",
            }}
          >
            {/* Radial gradient glow at bottom-left */}
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

          {/* Left Side - Title Section */}
          {/* x=327, y=45 */}
          <div className="absolute" style={{ left: vw(327), top: vw(45) }}>
              {/* Main Title - Need More Assistance? */}
              {/* Figma: font-size 60, line-height 68 */}
              <h2 className="font-anaheim font-extrabold" style={{ fontSize: vw(60), lineHeight: vw(68) }}>
                {/* Need - white fill with yellow stroke */}
                <span
                  className="text-white"
                  style={{
                    WebkitTextStroke: `1px #FFEF72`,
                    paintOrder: "stroke fill",
                  }}
                >
                  Need{" "}
                </span>
                {/* More - hollow outline text */}
                <span
                  className="font-paytone-one"
                  style={{
                    fontSize: vw(60),
                    WebkitTextStroke: `1px #FFEF72`,
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
                    WebkitTextStroke: `1px #FFEF72`,
                    paintOrder: "stroke fill",
                  }}
                >
                  Assistance?
                </span>
              </h2>

              {/* Subtitle - Manual Service Request */}
              {/* 与标题距离拉远 marginTop: 50 */}
              <p
                className="font-anaheim font-extrabold"
                style={{
                  marginTop: vw(50),
                  fontSize: vw(29),
                  lineHeight: vw(40),
                  color: "#FFF071",
                }}
              >
                {subtitle}
              </p>

              {/* Description */}
              {/* 与subtitle距离缩短 marginTop: 8 */}
              <p
                className="font-anaheim font-normal text-white"
                style={{
                  marginTop: vw(8),
                  width: vw(440),
                  fontSize: vw(20),
                  lineHeight: vw(40),
                }}
              >
                {description}
              </p>
          </div>

          {/* Left Side - Contact Info (Group 188) */}
          {/* Figma: x=307 → 右移20px → x=327, y=543 */}
          <div className="absolute" style={{ left: vw(327), top: vw(543) }}>
              {/* Email label - Figma: y=5059, font-size 20, line-height 54 */}
              <p
                className="font-anaheim font-semibold text-white/70"
                style={{ fontSize: vw(20), lineHeight: vw(54) }}
              >
                Email
              </p>
              {/* Email value - Figma: y=5099 (5099-5059-54=-14, 紧贴) font-size 24, line-height 54 */}
              <a
                href={`mailto:${email}`}
                className="font-anaheim font-semibold text-white underline hover:text-white/80 transition-colors block"
                style={{ fontSize: vw(24), lineHeight: vw(54), textUnderlineOffset: vw(6) }}
              >
                {email}
              </a>

              {/* Phone label - Figma: y=5166 (5166-5099-54=13) font-size 20, line-height 54 */}
              <p
                className="font-anaheim font-semibold text-white/70"
                style={{ fontSize: vw(20), lineHeight: vw(54), marginTop: vw(13) }}
              >
                Phone / WhatsApp
              </p>
              {/* Phone value - Figma: y=5199 (5199-5166-54=-21, 紧贴) font-size 24, line-height 54 */}
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="font-anaheim font-semibold text-white underline hover:text-white/80 transition-colors block"
                style={{ fontSize: vw(24), lineHeight: vw(54), letterSpacing: "0.07em", textUnderlineOffset: vw(6) }}
              >
                {phone}
              </a>

              {/* Footer Note - Figma: y=5296 (5296-5199-54=43) font-size 16, line-height 30 */}
              <p
                className="font-anaheim font-semibold text-white whitespace-pre-line"
                style={{
                  marginTop: vw(43),
                  width: vw(428),
                  fontSize: vw(16),
                  lineHeight: vw(30),
                }}
              >
                {footerNote}
            </p>
          </div>

          {/* Right Side - Form */}
          {/* Figma: x=888 → 左移20px → x=868, width=715 */}
          <div className="absolute" style={{ left: vw(868), top: vw(45), width: vw(715) }}>
              {/* Form Header - Figma: font-size 29, line-height 61 */}
              <h3
                className="font-anaheim font-semibold text-white"
                style={{
                  fontSize: vw(29),
                  lineHeight: vw(61),
                  marginBottom: vw(24),
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
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
                  {/* Name & Email Row - Figma: x=886/1262, y=113, gap 37px */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: vw(37) }}>
                    {fields.nameEmail.slice(0, 2).map((field) => (
                      <div key={field.fieldName}>{renderField(field)}</div>
                    ))}
                  </div>

                  {/* Service Type Checkboxes - Figma: y=187 (gap from input: 187-113-62=12) */}
                  <div style={{ marginTop: vw(12) }}>
                    {fields.serviceType && renderField(fields.serviceType)}
                  </div>

                  {/* Description Textarea - Figma: y=531 (gap from last checkbox: 531-460-62=9) */}
                  <div style={{ marginTop: vw(9) }}>
                    {fields.description && renderField(fields.description)}
                  </div>

                  {/* File Upload - Figma: y=720 (gap from textarea: 720-584-117=19) */}
                  <div style={{ marginTop: vw(19) }}>
                    {fields.file && renderField(fields.file)}
                  </div>

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
                      style={{ marginTop: vw(12), borderRadius: vw(15), padding: vw(16), fontSize: vw(14) }}
                    >
                      {error}
                    </div>
                  )}

                  {/* Submit Button - Figma: y=815, 715×62, border-radius 63, font-size 24 */}
                  {/* Gap from upload: 815-720-78=17 */}
                  <button
                    type="submit"
                    disabled={submitting || (shouldShowCaptcha && !turnstileToken)}
                    className="w-full bg-[#B2A224] text-white font-anaheim font-semibold hover:bg-[#9A8C1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      marginTop: vw(17),
                      height: vw(62),
                      borderRadius: vw(63),
                      fontSize: vw(24),
                    }}
                  >
                    {submitting ? "Sending..." : formConfig?.submitButtonText || "Send Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
