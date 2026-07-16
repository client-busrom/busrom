"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Locale } from "@/i18n.config"
import { Turnstile } from "@/components/ui/turnstile"
import { trackUetConversion } from "@/lib/analytics/uet"

interface FormField {
  label: string
  fieldName: string
  fieldType: "text" | "email" | "tel" | "textarea" | "checkbox" | "select" | "radio"
  placeholder?: string
  required: boolean
  order: number
  options?: Array<{ label: string; value: string }>
  validation?: Record<string, any>
}

interface FormConfigData {
  id: string
  name: string
  location: string
  fields: {
    [locale: string]: FormField[]
  }
}

interface FormConfig {
  id?: string
  label?: string
  data?: FormConfigData
  // Support direct fields structure as well
  fields?: {
    [locale: string]: FormField[]
  }
  name?: string
  location?: string
}

interface FormBlockProps {
  formConfig: FormConfig
  locale: Locale
}

export function FormBlock({ formConfig, locale }: FormBlockProps) {
  // Handle different possible data structures
  const configData = formConfig?.data || formConfig

  if (!configData) {
    console.error("FormBlock: No config data available")
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">Form configuration error: No data</p>
      </div>
    )
  }

  const fields = configData.fields?.[locale] || configData.fields?.["en"] || []

  // Early return if no fields
  if (!fields || fields.length === 0) {
    console.warn("FormBlock: No fields found for locale", locale)
    console.warn("Available locales:", configData.fields ? Object.keys(configData.fields) : "none")
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700">Form fields not available for locale: {locale}</p>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm">Debug info</summary>
          <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded">
            {JSON.stringify({ configData, locale }, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  const sortedFields = [...fields]

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const STORAGE_KEY = 'busrom_privacy_consent'

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

  // Check global consent status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(STORAGE_KEY)
      if (consent === 'true') {
        setPrivacyAccepted(true)
      }
    }
  }, [])

  // Sync with global storage when accepted in this form
  const handlePrivacyToggle = (checked: boolean) => {
    setPrivacyAccepted(checked)
    if (checked && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true')
      // Trigger a storage event for other components to update
      window.dispatchEvent(new Event('storage'))
    }
  }

  // Listen for storage events from other components
  useEffect(() => {
    const handleStorageChange = () => {
      const consent = localStorage.getItem(STORAGE_KEY)
      if (consent === 'true') {
        setPrivacyAccepted(true)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
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

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    // Clear error when user starts typing
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    const processedData = { ...formData }
    sortedFields.forEach((field) => {
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

    try {
      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: formConfig.id || configData.id,
          formName: configData.name,
          data: processedData,
          locale,
          turnstileToken,
        }),
      })

      if (response.ok) {
        // GTM Tracking
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: 'form_submit_success',
            form_id: configData.name || "shop-form-block",
            form_name: configData.name || "shop-form-block"
          });
        }
        trackUetConversion('Submit', 'Request_Quote', 5, 'Lead')
        setSubmitSuccess(true)
        setFormData({})
        setTurnstileToken(null)
        setTurnstileKey(prev => prev + 1)
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000)
      } else {
        const data = await response.json()
        setTurnstileToken(null)
        setTurnstileKey(prev => prev + 1)
        throw new Error(data.error || "Failed to submit form")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setErrors({ _form: error instanceof Error ? error.message : "Failed to submit form. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const commonClasses =
      "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-colors"
    const errorClasses = errors[field.fieldName] ? "border-red-500" : ""

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
            spellCheck="false"
            rows={4}
            className={`${commonClasses} ${errorClasses}`}
          />
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option: any) => {
              const isChecked = formData[field.fieldName]?.includes(option.value) || false
              return (
                <div key={option.value} className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name={field.fieldName}
                      value={option.value}
                      checked={isChecked}
                      spellCheck="false"
                      onChange={(e) => handleCheckboxChange(field.fieldName, option.value, e.target.checked)}
                      className="w-4 h-4 text-brand-secondary border-gray-300 rounded focus:ring-brand-secondary"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                  {isChecked && option.hasCustomInput && (
                    <input
                      type="text"
                      className={`${commonClasses} ml-6 !w-[calc(100%-1.5rem)]`}
                      placeholder={locale === 'zh' ? "请详细说明..." : "Please specify..."}
                      value={formData[`${field.fieldName}_custom_${option.value}`] || ""}
                      spellCheck="false"
                      onChange={(e) => handleChange(`${field.fieldName}_custom_${option.value}`, e.target.value)}
                      required
                    />
                  )}
                </div>
              )
            })}
          </div>
        )

      case "select": {
        const selectedOption = field.options?.find(o => o.value === formData[field.fieldName])
        return (
          <div className="flex flex-col gap-2">
            <select
              id={field.fieldName}
              name={field.fieldName}
              value={formData[field.fieldName] || ""}
              onChange={(e) => handleChange(field.fieldName, e.target.value)}
              required={field.required}
              className={`${commonClasses} ${errorClasses}`}
            >
              <option value="">{field.placeholder || (locale === 'zh' ? `请选择 ${field.label}` : `Select ${field.label}`)}</option>
              {field.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedOption && (selectedOption as any).hasCustomInput && (
              <input
                type="text"
                className={`${commonClasses}`}
                placeholder={locale === 'zh' ? "请详细说明..." : "Please specify..."}
                value={formData[`${field.fieldName}_custom`] || ""}
                spellCheck="false"
                onChange={(e) => handleChange(`${field.fieldName}_custom`, e.target.value)}
                required
              />
            )}
          </div>
        )
      }

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option: any) => {
              const isChecked = formData[field.fieldName] === option.value
              return (
                <div key={option.value} className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={field.fieldName}
                      value={option.value}
                      checked={isChecked}
                      spellCheck="false"
                      onChange={(e) => handleChange(field.fieldName, e.target.value)}
                      className="w-4 h-4 text-brand-secondary border-gray-300 focus:ring-brand-secondary"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                  {isChecked && option.hasCustomInput && (
                    <input
                      type="text"
                      className={`${commonClasses} ml-6 !w-[calc(100%-1.5rem)]`}
                      placeholder={locale === 'zh' ? "请详细说明..." : "Please specify..."}
                      value={formData[`${field.fieldName}_custom`] || ""}
                      spellCheck="false"
                      onChange={(e) => handleChange(`${field.fieldName}_custom`, e.target.value)}
                      required
                    />
                  )}
                </div>
              )
            })}
          </div>
        )

      default:
        return (
          <input
            type={field.fieldType}
            id={field.fieldName}
            name={field.fieldName}
            value={formData[field.fieldName] || ""}
            spellCheck="false"
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={`${commonClasses} ${errorClasses}`}
          />
        )
    }
  }

  if (submitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="text-green-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600 whitespace-pre-line">
          {formMessages?.successMessage || 'Your inquiry has been submitted successfully. We will get back to you as soon as possible.'}
        </p>
      </div>
    )
  }

  return (
    <form id={configData.name || "shop-form-block"} onSubmit={handleSubmit} className="space-y-6">
      {errors._form && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">{errors._form}</div>
      )}

      {sortedFields.map((field) => (
        <div key={field.fieldName}>
          <label htmlFor={field.fieldName} className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.fieldName] && <p className="mt-1 text-sm text-red-500">{errors[field.fieldName]}</p>}
        </div>
      ))}

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
          {errors._captcha && <p className="mt-1 text-sm text-red-500">{errors._captcha}</p>}
        </div>
      )}

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
        disabled={isSubmitting || (!!formMessages?.privacyConsentText && !privacyAccepted)}
        className="w-full py-3 px-6 bg-brand-secondary text-white font-bold rounded-lg hover:bg-brand-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-pre-line"
      >
        {isSubmitting ? (formMessages?.submittingText || "Submitting...") : (formMessages?.submitButtonText || "Submit Inquiry")}
      </motion.button>

      {/* Privacy Consent Checkbox - Always show if text is present */}
      {formMessages?.privacyConsentText && (
        <div className="flex items-start gap-3 mt-4 cursor-pointer group" onClick={() => handlePrivacyToggle(!privacyAccepted)}>
          <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${
            privacyAccepted ? "bg-brand-secondary border-brand-secondary" : "border-gray-300 bg-transparent"
          }`}>
            {privacyAccepted && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <p className="text-xs md:text-[14px] leading-relaxed text-gray-500 whitespace-pre-line select-none text-left">
            {formMessages.privacyConsentText}
          </p>
        </div>
      )}
    </form>
  )
}
