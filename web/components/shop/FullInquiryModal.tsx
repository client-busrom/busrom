"use client"

import { useState, useEffect, useRef } from "react"
import type { Locale } from "@/i18n.config"

interface FormField {
  label: string
  fieldName: string
  fieldType: "text" | "email" | "tel" | "textarea" | "checkbox" | "select"
  placeholder?: string
  required: boolean
  order: number
  options?: Array<{ label: string; value: string }>
}

interface FormConfig {
  id?: string
  label?: string
  data?: {
    id: string
    name: string
    location: string
    fields: {
      [locale: string]: FormField[]
    }
  }
}

interface FullInquiryModalProps {
  isOpen: boolean
  onClose: () => void
  formConfig: FormConfig
  locale: Locale
  productSeries?: string
  initialData?: Record<string, any>
}

// Auto-submit timeout (5 minutes)
const AUTO_SUBMIT_TIMEOUT = 5 * 60 * 1000

export function FullInquiryModal({
  isOpen,
  onClose,
  formConfig,
  locale,
  productSeries,
  initialData = {},
}: FullInquiryModalProps) {
  const configData = formConfig?.data || formConfig
  const allFields = configData?.fields?.[locale] || configData?.fields?.["en"] || []
  const sortedFields = [...allFields].sort((a, b) => a.order - b.order)

  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showCustomizeFields, setShowCustomizeFields] = useState<Record<string, boolean>>({})

  const inactivityTimerRef = useRef<NodeJS.Timeout>()
  const beforeUnloadHandlerRef = useRef<((e: BeforeUnloadEvent) => void) | null>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)

  // Prevent Lenis from capturing scroll events inside modal
  useEffect(() => {
    const modalContentEl = modalContentRef.current

    const stopPropagation = (event: WheelEvent | TouchEvent) => {
      event.stopPropagation()
    }

    if (isOpen && modalContentEl) {
      modalContentEl.addEventListener('wheel', stopPropagation)
      modalContentEl.addEventListener('touchmove', stopPropagation)
    }

    return () => {
      if (modalContentEl) {
        modalContentEl.removeEventListener('wheel', stopPropagation)
        modalContentEl.removeEventListener('touchmove', stopPropagation)
      }
    }
  }, [isOpen])

  // Sync form data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({
        ...initialData,
        ...prev, // Keep any additional data user might have entered
      }))
    }
  }, [initialData])

  // Initialize showCustomizeFields when modal opens
  useEffect(() => {
    if (!isOpen) return

    const customizeStates: Record<string, boolean> = {}

    sortedFields.forEach((field) => {
      if (field.fieldType === 'checkbox' && field.options) {
        field.options.forEach((option) => {
          const isCustomize = option.value.toLowerCase().includes('customize') ||
                             option.value.toLowerCase().includes('custom') ||
                             option.value.toLowerCase() === 'others' ||
                             option.value.toLowerCase() === 'other'
          if (isCustomize) {
            const currentValues = formData[field.fieldName] || []
            customizeStates[field.fieldName] = currentValues.includes(option.value)
          }
        })
      }
    })

    setShowCustomizeFields(customizeStates)
  }, [isOpen])

  // Set product series in form data
  useEffect(() => {
    if (productSeries) {
      setFormData((prev) => ({
        ...prev,
        InquiryProduct: prev.InquiryProduct || [productSeries],
      }))
    }
  }, [productSeries])

  // Track user activity
  const resetActivityTimer = () => {
    setLastActivity(Date.now())
  }

  // Auto-submit on inactivity
  useEffect(() => {
    if (!isOpen || submitSuccess) return

    const checkInactivity = () => {
      const now = Date.now()
      const timeSinceActivity = now - lastActivity

      if (timeSinceActivity >= AUTO_SUBMIT_TIMEOUT) {
        console.log("Auto-submitting form due to inactivity...")
        handleAutoSubmit()
      }
    }

    inactivityTimerRef.current = setInterval(checkInactivity, 10000) // Check every 10 seconds

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current)
      }
    }
  }, [isOpen, lastActivity, submitSuccess, formData])

  // Auto-submit on page unload
  useEffect(() => {
    if (!isOpen || submitSuccess) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Auto-submit if form has data
      if (Object.keys(formData).length > 0) {
        handleAutoSubmit()
      }
    }

    beforeUnloadHandlerRef.current = handleBeforeUnload
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      if (beforeUnloadHandlerRef.current) {
        window.removeEventListener("beforeunload", beforeUnloadHandlerRef.current)
      }
    }
  }, [isOpen, submitSuccess, formData])

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    resetActivityTimer()

    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (fieldName: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentValues = prev[fieldName] || []
      if (checked) {
        return { ...prev, [fieldName]: [...currentValues, value] }
      } else {
        return { ...prev, [fieldName]: currentValues.filter((v: string) => v !== value) }
      }
    })
    resetActivityTimer()

    // Handle "Customize" option - show/hide custom input field
    // Check for "customize", "custom", "others", or "other"
    const isCustomizeOption = value.toLowerCase().includes('customize') ||
                             value.toLowerCase().includes('custom') ||
                             value.toLowerCase() === 'others' ||
                             value.toLowerCase() === 'other'

    if (isCustomizeOption) {
      setShowCustomizeFields((prev) => ({ ...prev, [fieldName]: checked }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    sortedFields.forEach((field) => {
      if (field.required) {
        const value = formData[field.fieldName]
        if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === "string" && !value.trim())) {
          newErrors[field.fieldName] = `${field.label} is required`
        }
      }

      // Email validation
      if (field.fieldType === "email" && formData[field.fieldName]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[field.fieldName])) {
          newErrors[field.fieldName] = "Please enter a valid email address"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitFormData = async (isAuto = false) => {
    try {
      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: formConfig.id || configData?.id,
          formName: configData?.name,
          data: formData,
          locale,
          autoSubmitted: isAuto,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Form submission error:", error)
      return false
    }
  }

  const handleAutoSubmit = async () => {
    console.log("Auto-submitting form...")
    await submitFormData(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    const success = await submitFormData(false)

    if (success) {
      setSubmitSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } else {
      setErrors({ _form: "Failed to submit form. Please try again." })
    }

    setIsSubmitting(false)
  }

  const renderField = (field: FormField) => {
    const commonClasses =
      "w-full px-4 py-3 border-2 border-brand-accent-border rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-colors bg-white font-medium text-brand-text-black placeholder:text-gray-400"
    const errorClasses = errors[field.fieldName] ? "border-red-500" : ""
    const preFilledClasses = initialData[field.fieldName] ? "bg-brand-cream/30" : ""

    switch (field.fieldType) {
      case "textarea":
        return (
          <textarea
            id={field.fieldName}
            name={field.fieldName}
            value={formData[field.fieldName] || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={`${commonClasses} ${errorClasses} ${preFilledClasses}`}
          />
        )

      case "checkbox":
        return (
          <div className="space-y-3">
            {field.options?.map((option) => {
              const isCustomize = option.value.toLowerCase().includes('customize') ||
                                 option.value.toLowerCase().includes('custom') ||
                                 option.value.toLowerCase() === 'others' ||
                                 option.value.toLowerCase() === 'other'

              return (
                <div key={option.value}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name={field.fieldName}
                      value={option.value}
                      checked={formData[field.fieldName]?.includes(option.value) || false}
                      onChange={(e) => handleCheckboxChange(field.fieldName, option.value, e.target.checked)}
                      className="w-5 h-5 text-brand-secondary border-2 border-brand-accent-border rounded focus:ring-2 focus:ring-brand-secondary"
                    />
                    <span className="text-brand-text-black font-medium group-hover:text-brand-secondary transition-colors">{option.label}</span>
                  </label>

                  {/* Show custom input field when "Customize" is checked */}
                  {isCustomize && showCustomizeFields[field.fieldName] && (
                    <div className="mt-2 ml-8">
                      <input
                        type="text"
                        placeholder="Please specify your custom requirements..."
                        value={formData[`${field.fieldName}_custom`] || ''}
                        onChange={(e) => handleChange(`${field.fieldName}_custom`, e.target.value)}
                        className="w-full px-4 py-2 border-2 border-brand-secondary rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-colors bg-white font-medium text-brand-text-black placeholder:text-gray-400"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )

      case "select":
        return (
          <select
            id={field.fieldName}
            name={field.fieldName}
            value={formData[field.fieldName] || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            required={field.required}
            className={`${commonClasses} ${errorClasses} ${preFilledClasses}`}
          >
            <option value="">{field.placeholder || `Select ${field.label}`}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      default:
        return (
          <input
            type={field.fieldType}
            id={field.fieldName}
            name={field.fieldName}
            value={formData[field.fieldName] || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={`${commonClasses} ${errorClasses} ${preFilledClasses}`}
          />
        )
    }
  }

  if (!isOpen) return null

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-brand-main rounded-xl shadow-2xl max-w-md w-full p-8 text-center border-2 border-brand-accent-border">
          <div className="text-brand-secondary mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-anaheim font-extrabold text-brand-text-black mb-2">Thank You!</h3>
          <p className="text-brand-text-main">
            Your inquiry has been submitted successfully. We will get back to you as soon as possible.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={modalContentRef}
        className="bg-brand-main rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-brand-accent-border"
        onClick={resetActivityTimer}
      >
        <div className="sticky top-0 bg-brand-secondary border-b-2 border-brand-accent-border p-6 flex justify-between items-center z-10">
          <div>
            <h3 className="text-2xl md:text-3xl font-anaheim font-extrabold text-brand-cream">Complete Your Inquiry</h3>
            <p className="text-sm text-brand-cream/80 mt-1">
              {configData?.label || "Product Inquiry Form"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-brand-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors._form && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 text-sm font-medium">{errors._form}</div>
          )}

          {sortedFields.map((field) => {
            // Skip fields that already have values from simplified form (hide them)
            const isPreFilled = initialData[field.fieldName] !== undefined && initialData[field.fieldName] !== ''

            // Don't render pre-filled required fields
            if (isPreFilled && field.required) {
              return null
            }

            // Hide "Customize" field if "InquiryProduct" doesn't have "others" selected
            // This assumes the Customize field has fieldName="Customize"
            if (field.fieldName === 'Customize' && !showCustomizeFields['InquiryProduct']) {
              return null
            }

            return (
              <div key={field.fieldName}>
                <label htmlFor={field.fieldName} className="block text-sm font-anaheim font-bold text-brand-text-black mb-2">
                  {field.label}
                  {field.required && <span className="text-brand-accent-gold ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.fieldName] && <p className="mt-1 text-sm text-red-600 font-medium">{errors[field.fieldName]}</p>}
              </div>
            )
          })}

          <div className="flex gap-4 pt-4 border-t-2 border-brand-accent-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border-2 border-brand-secondary text-brand-secondary font-anaheim font-bold rounded-lg hover:bg-brand-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-brand-secondary text-white font-anaheim font-extrabold rounded-lg hover:bg-brand-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Inquiry"}
            </button>
          </div>

          <p className="text-xs text-brand-text-main/70 text-center">
            Your inquiry will be automatically saved if you leave this page inactive for 5 minutes
          </p>
        </form>
      </div>
    </div>
  )
}
