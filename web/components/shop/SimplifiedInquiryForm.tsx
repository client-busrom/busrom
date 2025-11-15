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
  const configData = formConfig?.data || formConfig
  const allFields = configData?.fields?.[locale] || configData?.fields?.["en"] || []

  // Only show required fields
  const requiredFields = allFields
    .filter((field: FormField) => field.required)
    .sort((a: FormField, b: FormField) => a.order - b.order)

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

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
          <label htmlFor={field.fieldName} className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            <span className="text-red-500 ml-1">*</span>
          </label>
          {renderField(field)}
          {errors[field.fieldName] && (
            <p className="mt-1 text-xs text-red-500">{errors[field.fieldName]}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        className="w-full py-3 px-6 bg-brand-secondary text-white font-bold rounded-lg hover:bg-brand-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2"
      >
        Submit Inquiry
      </button>

      <p className="text-xs text-gray-500 text-center">
        Click submit to complete your inquiry with additional details
      </p>
    </form>
  )
}
