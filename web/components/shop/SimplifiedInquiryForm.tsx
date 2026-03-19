"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Locale } from "@/i18n.config"
import { PhoneInput } from "@/components/ui/PhoneInput"

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
    } | FormField[]
    privacyConsentText?: string
    submitButtonText?: string
  }
  privacyConsentText?: string
  submitButtonText?: string
}

interface SimplifiedInquiryFormProps {
  formConfig: FormConfig
  locale: Locale
  productSeries?: string
  onOpenFullForm: (initialData: Record<string, any>) => void
}

export function SimplifiedInquiryForm({
  formConfig,
  locale,
  productSeries,
  onOpenFullForm,
}: SimplifiedInquiryFormProps) {
  type ConfigData = FormConfig['data'] & Partial<FormConfig>
  const configData = (formConfig?.data || formConfig) as ConfigData

  // Handle both array format (Payload) and object format (legacy)
  let allFields: FormField[] = []
  if (Array.isArray(configData?.fields)) {
    // Payload format: fields is an array
    allFields = configData.fields as FormField[]
  } else if (configData?.fields) {
    // Legacy format: fields is an object with locale keys
    allFields = configData.fields[locale] || configData.fields["en"] || []
  }

  // Helper function to extract localized string if it's an object
  const getLocalizedString = (val: any) => {
    if (!val) return ""
    if (typeof val === "string") return val
    if (typeof val === "object") {
      return val[locale] || val["en"] || ""
    }
    return ""
  }

  const privacyText = getLocalizedString(configData?.privacyConsentText || configData?.data?.privacyConsentText || (formConfig as any)?.privacyConsentText)
  const submitText = getLocalizedString(configData?.submitButtonText || configData?.data?.submitButtonText || (formConfig as any)?.submitButtonText) || "Submit Inquiry"

  // Only show required fields, preserving the order from the CMS array
  const requiredFields = allFields.filter((field: FormField) => field.required)

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [isGloballyAccepted, setIsGloballyAccepted] = useState(false)
  const STORAGE_KEY = 'busrom_privacy_consent'

  // Debug log for privacy consent
  useEffect(() => {
    if (privacyText) {
      console.log(`[SimplifiedInquiryForm] Privacy text: "${privacyText.substring(0, 30)}...", accepted: ${privacyAccepted}, globally: ${isGloballyAccepted}`)
    } else {
      console.log(`[SimplifiedInquiryForm] No privacy text found in config`, configData)
    }
  }, [privacyText, privacyAccepted, isGloballyAccepted, configData])

  // Check global consent status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(STORAGE_KEY)
      if (consent === 'true') {
        setIsGloballyAccepted(true)
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
        setIsGloballyAccepted(true)
        setPrivacyAccepted(true)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    requiredFields.forEach((field: FormField) => {
      const value = formData[field.fieldName]
      if (!value || (typeof value === "string" && !value.trim())) {
        newErrors[field.fieldName] = `${field.label} is required`
      }

      // Email validation
      if (field.fieldType === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          newErrors[field.fieldName] = "Please enter a valid email address"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validate()) {
      // Pass form data to parent and open full form modal
      onOpenFullForm(formData)
    }
  }

  const renderField = (field: FormField) => {
    const commonClasses =
      "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-colors text-sm"
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
            rows={3}
            className={`${commonClasses} ${errorClasses}`}
          />
        )

      default:
        // Handle phone type by mapping it to tel
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
            className={`${commonClasses} ${errorClasses}`}
          />
        )
    }
  }

  if (requiredFields.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No required fields found
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {requiredFields.map((field: FormField) => (
        <div key={field.fieldName}>
          {renderField(field)}
          {errors[field.fieldName] && (
            <p className="mt-1 text-xs text-red-500">{errors[field.fieldName]}</p>
          )}
        </div>
      ))}

      {/* Privacy Consent Checkbox - Only show if not already globally accepted */}
      {privacyText && !isGloballyAccepted && (
        <div className="flex items-start gap-2 my-2 cursor-pointer group" onClick={() => handlePrivacyToggle(!privacyAccepted)}>
          <div className={cn(
            "mt-1 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all",
            privacyAccepted ? "bg-brand-secondary border-brand-secondary" : "border-gray-300 bg-transparent"
          )}>
            {privacyAccepted && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <p className="text-xs leading-relaxed text-gray-500 whitespace-pre-line select-none">
            {privacyText}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={(!!privacyText && !privacyAccepted)}
        className={cn(
          "w-full py-3 px-6 bg-brand-secondary text-white font-bold rounded-lg hover:bg-brand-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2",
          "h-auto whitespace-pre-line leading-tight",
          (!!privacyText && !privacyAccepted) && "opacity-50 grayscale cursor-not-allowed"
        )}
      >
        {submitText}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Click submit to complete your inquiry with additional details
      </p>
    </form>
  )
}
