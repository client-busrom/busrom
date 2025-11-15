"use client"

import { useState } from "react"
import type { Locale } from "@/i18n.config"

interface FormField {
  label: string
  fieldName: string
  fieldType: "text" | "email" | "tel" | "textarea" | "checkbox" | "select"
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
  // Debug logging
  console.log("FormBlock received:", { formConfig, locale })

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

  const sortedFields = [...fields].sort((a, b) => a.order - b.order)

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: formConfig.id || configData.id,
          formName: configData.name,
          data: formData,
          locale,
        }),
      })

      if (response.ok) {
        setSubmitSuccess(true)
        setFormData({})
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000)
      } else {
        throw new Error("Failed to submit form")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setErrors({ _form: "Failed to submit form. Please try again." })
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
            rows={4}
            className={`${commonClasses} ${errorClasses}`}
          />
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name={field.fieldName}
                  value={option.value}
                  checked={formData[field.fieldName]?.includes(option.value) || false}
                  onChange={(e) => handleCheckboxChange(field.fieldName, option.value, e.target.checked)}
                  className="w-4 h-4 text-brand-secondary border-gray-300 rounded focus:ring-brand-secondary"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
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
            className={`${commonClasses} ${errorClasses}`}
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
        <p className="text-gray-600">
          Your inquiry has been submitted successfully. We will get back to you as soon as possible.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-6 bg-brand-secondary text-white font-bold rounded-lg hover:bg-brand-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit Inquiry"}
      </button>
    </form>
  )
}
