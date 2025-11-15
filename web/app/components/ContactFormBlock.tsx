'use client'

/**
 * Contact Form Block Component
 *
 * Renders a contact form based on FormConfig from the CMS.
 * Simply receives a formConfig reference and renders the form.
 */

import React, { useState } from 'react'

interface FormField {
  fieldName: string
  fieldType: string
  label: string  // Language-specific label
  placeholder?: string  // Language-specific placeholder
  required: boolean
  order: number
}

interface FormConfig {
  id: string
  name: string
  formType: string
  targetEntity?: string
  targetEntityId?: string
  fields: Record<string, FormField[]>  // { en: [...], zh: [...] }
}

interface ContactFormBlockProps {
  formConfig?: {
    data?: FormConfig
  }
  // Context from page
  sourceEntity?: string
  sourceEntityId?: string
  locale?: string
}

export function ContactFormBlock({
  formConfig,
  sourceEntity,
  sourceEntityId,
  locale = 'en',
}: ContactFormBlockProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!formConfig?.data) {
    return (
      <div className="my-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">⚠️ Form configuration not found</p>
      </div>
    )
  }

  const config = formConfig.data

  // Get fields for current locale, fallback to 'en', then 'zh'
  const fields = config.fields[locale] || config.fields['en'] || config.fields['zh'] || []
  const sortedFields = [...fields].sort((a, b) => (a.order || 0) - (b.order || 0))

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (submitStatus === 'error') {
      setSubmitStatus('idle')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const submissionData = {
        formId: config.id,
        formName: config.name,
        data: {
          ...formData,
          // Include source information in the data object
          _source: sourceEntity && sourceEntityId
            ? `${sourceEntity}:${sourceEntityId}`
            : config.targetEntity && config.targetEntityId
            ? `${config.targetEntity}:${config.targetEntityId}`
            : 'unknown',
        },
        locale,
        autoSubmitted: false,
      }

      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit form')
      }

      setSubmitStatus('success')
      setFormData({})
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const isTextarea = field.fieldType === 'textarea' || field.fieldName === 'message'
    const fieldValue = formData[field.fieldName] || ''

    return (
      <div key={field.fieldName}>
        <label htmlFor={field.fieldName} className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {isTextarea ? (
          <textarea
            id={field.fieldName}
            name={field.fieldName}
            value={fieldValue}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isSubmitting}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        ) : (
          <input
            type={field.fieldType === 'email' ? 'email' : 'text'}
            id={field.fieldName}
            name={field.fieldName}
            value={fieldValue}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        )}
      </div>
    )
  }

  return (
    <div className="my-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.name}</h3>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✓ Thank you! Your message has been sent successfully.</p>
          <p className="text-green-700 text-sm mt-1">We'll get back to you as soon as possible.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">✗ Something went wrong.</p>
          <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {sortedFields.map((field) => renderField(field))}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}
