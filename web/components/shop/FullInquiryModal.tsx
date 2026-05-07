"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import type { Locale } from "@/i18n.config"
import { Turnstile } from "@/components/ui/turnstile"
import { PhoneInput } from "@/components/ui/PhoneInput"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface FormField {
  label: string
  fieldName: string
  fieldType: "text" | "email" | "tel" | "textarea" | "checkbox" | "radio" | "select"
  placeholder?: string
  required: boolean
  order: number
  options?: Array<{ label: string; value: string }>
  allowMultiple?: boolean // For checkbox: true = multiple selections, false/undefined = single selection (acts like radio)
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
    } | FormField[]
    privacyConsentText?: string
    submitButtonText?: string
  }
  privacyConsentText?: string
  submitButtonText?: string
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
  type ConfigData = FormConfig['data'] & Partial<FormConfig>
  const configData = (formConfig?.data || formConfig) as ConfigData

  // Handle both array format (Payload) and object format (legacy)
  // Use useMemo to avoid re-creating the array on every render
  const sortedFields = useMemo(() => {
    let allFields: any[] = []
    if (Array.isArray(configData?.fields)) {
      // Payload format: fields is an array
      allFields = configData.fields
    } else if (configData?.fields) {
      // Legacy format: fields is an object with locale keys
      allFields = configData.fields[locale] || configData.fields["en"] || []
    }
    return [...allFields]
  }, [configData?.fields, locale])

  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)
  
  // Form config messages from form-config API
  const [formMessages, setFormMessages] = useState<{
    submitButtonText?: string
    submittingText?: string
    successMessage?: string
    errorRequiredFields?: string
    errorNetworkMessage?: string
    errorCaptchaMessage?: string
    privacyConsentText?: string
  } | null>(null)
  
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

  const inactivityTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const beforeUnloadHandlerRef = useRef<((e: BeforeUnloadEvent) => void) | null>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const formDataRef = useRef(formData)

  // Keep formDataRef in sync with formData
  useEffect(() => {
    formDataRef.current = formData
  }, [formData])

  // Fetch Turnstile site key from SiteConfig
  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const res = await fetch('/api/site-config')
        if (res.ok) {
          const data = await res.json()
          if (data.turnstileSiteKey) {
            setTurnstileSiteKey(data.turnstileSiteKey)
          }
        }
      } catch (error) {
        console.error('Failed to fetch Turnstile site key:', error)
      }
    }
    fetchSiteKey()
  }, [])

  // Fetch form config messages (submitButtonText, privacyConsentText, etc.)
  useEffect(() => {
    if (!configData?.name) return
    const fetchFormMessages = async () => {
      try {
        const res = await fetch(`/api/form-config/${configData.name}?locale=${locale}`)
        if (res.ok) {
          const data = await res.json()
          setFormMessages({
            submitButtonText: data.submitButtonText,
            submittingText: data.submittingText,
            successMessage: data.successMessage,
            errorRequiredFields: data.errorRequiredFields,
            errorNetworkMessage: data.errorNetworkMessage,
            errorCaptchaMessage: data.errorCaptchaMessage,
            privacyConsentText: data.privacyConsentText,
          })
        }
      } catch (error) {
        console.error('Failed to fetch form messages:', error)
      }
    }
    fetchFormMessages()
  }, [configData?.name, locale])

  // Get effective privacy text (prioritize fetched messages, fallback to props config)
  const getLocalizedString = (val: any) => {
    if (!val) return ""
    if (typeof val === "string") return val
    if (typeof val === "object") {
      return val[locale] || val["en"] || ""
    }
    return ""
  }

  const effectivePrivacyText = formMessages?.privacyConsentText || getLocalizedString(configData?.privacyConsentText || configData?.data?.privacyConsentText || (formConfig as any)?.privacyConsentText)
  const effectiveSubmitText = formMessages?.submitButtonText || getLocalizedString(configData?.submitButtonText || configData?.data?.submitButtonText || (formConfig as any)?.submitButtonText) || "Submit Inquiry"

  // Debug log
  useEffect(() => {
    if (effectivePrivacyText && isOpen) {
      console.log(`[FullInquiryModal] Privacy text found: "${effectivePrivacyText.substring(0, 20)}...", globally accepted: ${isGloballyAccepted}`)
    }
  }, [effectivePrivacyText, isGloballyAccepted, isOpen])

  // Handle Turnstile success - clear error if captcha error was showing
  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token)
    // Clear captcha-related error
    if (errors._captcha) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors._captcha
        return newErrors
      })
    }
  }

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

  // Helper function to check if a customize field should be shown
  const shouldShowCustomizeField = (fieldName: string): boolean => {
    // Find the field that controls this customize field (e.g., InquiryProduct)
    const controllingFieldName = 'InquiryProduct' // Hard-coded for now, could be made dynamic
    const controllingField = sortedFields.find(f => f.fieldName === controllingFieldName)

    if (!controllingField || !controllingField.options) {
      return false
    }

    const fieldValue = formData[controllingFieldName]

    // Check if any "Others"/"Customize" option is selected
    const hasCustomizeSelected = controllingField.options.some((option: any) => {
      const isCustomize = option.value.toLowerCase().includes('customize') ||
                         option.value.toLowerCase().includes('custom') ||
                         option.value.toLowerCase() === 'others' ||
                         option.value.toLowerCase() === 'other'

      if (!isCustomize) return false

      // Check if this option is selected
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(option.value)
      } else {
        return fieldValue === option.value
      }
    })

    return hasCustomizeSelected
  }

  // Set product series in form data
  useEffect(() => {
    if (productSeries) {
      // Check if InquiryProduct field is radio or single-select checkbox
      const inquiryField = sortedFields.find(f => f.fieldName === 'InquiryProduct')
      const isRadioOrSingleCheckbox = inquiryField?.fieldType === 'radio' ||
                                      (inquiryField?.fieldType === 'checkbox' && inquiryField?.allowMultiple === false)

      setFormData((prev) => ({
        ...prev,
        // For radio or single-select checkbox: use string value
        // For multi-select checkbox: use array with single value
        InquiryProduct: prev.InquiryProduct || (isRadioOrSingleCheckbox ? productSeries : [productSeries]),
      }))
    }
  }, [productSeries, sortedFields])

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
        handleAutoSubmit()
      }
    }

    inactivityTimerRef.current = setInterval(checkInactivity, 10000) // Check every 10 seconds

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current)
      }
    }
  }, [isOpen, lastActivity, submitSuccess])

  // Auto-submit on page unload
  useEffect(() => {
    if (!isOpen || submitSuccess) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Auto-submit if form has data (use ref to get latest value)
      if (Object.keys(formDataRef.current).length > 0) {
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
  }, [isOpen, submitSuccess])

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

  const handleCheckboxChange = (fieldName: string, value: string, checked: boolean, allowMultiple: boolean = true) => {
    setFormData((prev) => {
      if (!allowMultiple) {
        // Single selection mode (like radio)
        return { ...prev, [fieldName]: checked ? [value] : [] }
      } else {
        // Multiple selection mode
        const currentValues = prev[fieldName] || []
        if (checked) {
          return { ...prev, [fieldName]: [...currentValues, value] }
        } else {
          return { ...prev, [fieldName]: currentValues.filter((v: string) => v !== value) }
        }
      }
    })

    resetActivityTimer()
  }

  const handleRadioChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    resetActivityTimer()
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

    // Validate Turnstile if enabled
    if (turnstileSiteKey && !turnstileToken) {
      newErrors._captcha = locale === 'zh' ? '请完成人机验证' : 'Please complete the captcha verification'
    }

    // Validate Privacy Consent
    if (effectivePrivacyText && !privacyAccepted) {
      newErrors._privacy = locale === 'zh' ? '请阅读并同意隐私条款' : 'Please read and agree to the privacy policy'
    }

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
          privacyAccepted,
          turnstileToken: isAuto ? undefined : turnstileToken, // Don't require token for auto-submit
        }),
      })

      if (response.ok) {
        setTurnstileToken(null)
        setTurnstileKey(prev => prev + 1)
      }

      return response.ok
    } catch (error) {
      console.error("Form submission error:", error)
      setTurnstileToken(null)
      setTurnstileKey(prev => prev + 1)
      return false
    }
  }

  const handleAutoSubmit = async () => {
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
      // GTM Tracking
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'form_submit_success',
          form_id: configData?.name || "full-inquiry-modal-form",
          form_name: configData?.name || "full-inquiry-modal-form"
        });
      }
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
      "w-full px-4 py-3 border-2 border-brand-accent-border rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-colors bg-white font-medium text-brand-text-black placeholder:text-gray-400 text-base"
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
            spellCheck="false"
            className={`${commonClasses} ${errorClasses} ${preFilledClasses}`}
          />
        )

      case "checkbox":
        const allowMultiple = field.allowMultiple !== false // Default to true if not specified
        return (
          <div className="space-y-3">
            {field.options?.map((option) => {
              return (
                <div key={option.value}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name={field.fieldName}
                      value={option.value}
                      checked={formData[field.fieldName]?.includes(option.value) || false}
                      onChange={(e) => handleCheckboxChange(field.fieldName, option.value, e.target.checked, allowMultiple)}
                      className="w-5 h-5 text-brand-secondary border-2 border-brand-accent-border rounded focus:ring-2 focus:ring-brand-secondary"
                    />
                    <span className="text-brand-text-black font-medium group-hover:text-brand-secondary transition-colors">{option.label}</span>
                  </label>
                </div>
              )
            })}
          </div>
        )

      case "radio":
        return (
          <div className="space-y-3">
            {field.options?.map((option) => {
              return (
                <div key={option.value}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name={field.fieldName}
                      value={option.value}
                      checked={formData[field.fieldName] === option.value}
                      onChange={(e) => handleRadioChange(field.fieldName, e.target.value)}
                      className="w-5 h-5 text-brand-secondary border-2 border-brand-accent-border focus:ring-2 focus:ring-brand-secondary"
                    />
                    <span className="text-brand-text-black font-medium group-hover:text-brand-secondary transition-colors">{option.label}</span>
                  </label>
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
        const isPhone = (field.fieldType as string) === 'phone' || (field.fieldType as string) === 'tel'
        
        if (isPhone) {
          return (
            <PhoneInput
              id={field.fieldName}
              name={field.fieldName}
              value={formData[field.fieldName] || ""}
              onChange={(phone) => handleChange(field.fieldName, phone)}
              placeholder={field.placeholder}
              required={field.required}
              error={!!errors[field.fieldName]}
              disabled={isSubmitting}
              inputStyle={{ fontSize: "16px" }}
              dialCodeStyle={{ fontSize: "16px" }}
              inputClassName="!text-base"
              dialCodeClassName="!text-base"
            />
          )
        }

        return (
          <input
            type={field.fieldType}
            id={field.fieldName}
            name={field.fieldName}
            value={formData[field.fieldName] || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            spellCheck="false"
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
          <p className="text-brand-text-main whitespace-pre-line">
            {formMessages?.successMessage || "Your inquiry has been submitted successfully. We will get back to you as soon as possible."}
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

        <form id={configData?.name || "full-inquiry-modal-form"} onSubmit={handleSubmit} className="p-6 space-y-6">
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

            // Hide "customize" field if "InquiryProduct" doesn't have "others" selected
            // This assumes the Customize field has fieldName="customize" (lowercase)
            if (field.fieldName === 'customize') {
              if (!shouldShowCustomizeField(field.fieldName)) {
                return null
              }
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

          {/* Turnstile Captcha */}
          {turnstileSiteKey && (
            <div className="mt-4">
              <Turnstile
                key={turnstileKey}
                siteKey={turnstileSiteKey}
                onVerify={handleTurnstileSuccess}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                theme="light"
                language={locale === 'zh' ? 'zh-CN' : locale}
              />
              {errors._captcha && <p className="mt-1 text-sm text-red-600 font-medium">{errors._captcha}</p>}
            </div>
          )}

          {/* Privacy Consent Checkbox - Only show if not already globally accepted */}
          {effectivePrivacyText && (
            <div className="flex items-start gap-2 group cursor-pointer" onClick={() => handlePrivacyToggle(!privacyAccepted)}>
              <div className={cn(
                "mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all",
                privacyAccepted ? "bg-brand-secondary border-brand-secondary" : "border-gray-300 bg-transparent"
              )}>
                {privacyAccepted && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className="text-xs leading-relaxed text-gray-500 text-left whitespace-pre-line select-none">
                {effectivePrivacyText}
              </p>
            </div>
          )}
          {errors._privacy && <p className="mt-1 text-sm text-red-600 font-medium">{errors._privacy}</p>}

          <div className="flex gap-4 pt-4 border-t-2 border-brand-accent-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border-2 border-brand-secondary text-brand-secondary font-anaheim font-bold rounded-lg hover:bg-brand-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
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
              disabled={isSubmitting || (!!effectivePrivacyText && !privacyAccepted)}
              className={cn(
                "flex-1 py-3 px-6 bg-brand-secondary text-white font-anaheim font-extrabold rounded-lg hover:bg-brand-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg whitespace-pre-line h-auto leading-tight",
                (!!effectivePrivacyText && !privacyAccepted) && "grayscale opacity-80"
              )}
            >
              {isSubmitting ? (formMessages?.submittingText || "Submitting...") : effectiveSubmitText}
            </motion.button>
          </div>

          {/* Removed passive text in favor of checkbox above */}

          <p className="text-xs text-brand-text-main/70 text-center">
            Your inquiry will be automatically saved if you leave this page inactive for 5 minutes
          </p>
        </form>
      </div>
    </div>
  )
}
