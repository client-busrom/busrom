"use client"

import { useState, useEffect, FormEvent } from "react"
import type { Locale } from "@/i18n.config"

interface FormField {
  fieldName: string
  fieldType: string
  label: string
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  order?: number
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
          formConfigId: formConfig?.id,
          formName: formConfig?.name,
          data: formData,
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
              className={baseInputClass}
            />
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
