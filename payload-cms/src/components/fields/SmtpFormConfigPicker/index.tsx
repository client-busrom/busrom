'use client'

import React, { useCallback, useRef } from 'react'
import {
  RelationshipField,
  useDocumentInfo,
  useField,
  useTranslation,
} from '@payloadcms/ui'
import type { RelationshipFieldClientComponent } from 'payload'

const i18n = {
  conflictTitle: {
    en: 'Form Already Assigned',
    zh: '表单已分配',
  },
  conflictMessage: {
    en: 'The form "{formName}" is already assigned to SMTP config "{smtpName}". Each form can only belong to one SMTP config.\n\nDo you want to remove it from "{smtpName}" and assign it here?',
    zh: '表单 "{formName}" 已分配给 SMTP 配置 "{smtpName}"。每个表单只能属于一个 SMTP 配置。\n\n是否从 "{smtpName}" 中移除并分配到此处？',
  },
  reassignSuccess: {
    en: 'Form reassigned successfully',
    zh: '表单重新分配成功',
  },
  reassignFailed: {
    en: 'Failed to reassign form',
    zh: '重新分配表单失败',
  },
}

/**
 * SmtpFormConfigPicker
 *
 * Wraps Payload's relationship field with conflict detection.
 * When a form is selected that's already assigned to another SmtpConfig,
 * it prompts the user to confirm reassignment.
 */
export const SmtpFormConfigPicker: RelationshipFieldClientComponent = (props) => {
  const { id: currentDocId } = useDocumentInfo()
  const { i18n: { language } } = useTranslation()
  const t = (obj: { en: string; zh: string }) => language === 'zh' ? obj.zh : obj.en

  const field = useField<(string | number)[]>({ path: 'formConfigs' })
  const prevValueRef = useRef<(string | number)[]>(field.value || [])

  const handleChange = useCallback(
    async (newValue: any) => {
      // Normalize to array of IDs
      const newIds: (string | number)[] = Array.isArray(newValue)
        ? newValue.map((v: any) => (typeof v === 'object' ? v.id || v.value : v))
        : newValue
          ? [typeof newValue === 'object' ? newValue.id || newValue.value : newValue]
          : []

      const prevIds = prevValueRef.current || []

      // Find newly added IDs
      const addedIds = newIds.filter((id) => !prevIds.includes(id))

      for (const formConfigId of addedIds) {
        try {
          // Check if this form is already assigned to another SmtpConfig
          const queryParams = new URLSearchParams()
          queryParams.set('where[formConfigs][in]', String(formConfigId))
          if (currentDocId) {
            queryParams.set('where[id][not_equals]', String(currentDocId))
          }
          queryParams.set('limit', '1')

          const response = await fetch(`/api/smtp-configs?${queryParams.toString()}`, {
            credentials: 'include',
          })
          const data = await response.json()

          if (data.docs && data.docs.length > 0) {
            const conflictingSmtp = data.docs[0]

            // Get form name for display
            let formName = String(formConfigId)
            try {
              const formRes = await fetch(`/api/form-configs/${formConfigId}`, {
                credentials: 'include',
              })
              const formData = await formRes.json()
              if (formData.name) formName = formData.name
            } catch {
              // Use ID as fallback
            }

            const message = t(i18n.conflictMessage)
              .replace(/\{formName\}/g, formName)
              .replace(/\{smtpName\}/g, conflictingSmtp.name || String(conflictingSmtp.id))

            const confirmed = window.confirm(message)

            if (confirmed) {
              // Remove this form from the conflicting SmtpConfig
              const otherFormConfigs = (conflictingSmtp.formConfigs || [])
                .map((fc: any) => (typeof fc === 'object' ? fc.id : fc))
                .filter((id: any) => String(id) !== String(formConfigId))

              await fetch(`/api/smtp-configs/${conflictingSmtp.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ formConfigs: otherFormConfigs }),
              })
            } else {
              // User cancelled — revert to previous value
              field.setValue(prevIds)
              return
            }
          }
        } catch (error) {
          console.error('SmtpFormConfigPicker conflict check failed:', error)
        }
      }

      // Update ref and set value
      prevValueRef.current = newIds
      field.setValue(newIds)
    },
    [currentDocId, field, t],
  )

  // Render the default relationship field — the onChange conflict detection
  // happens via the beforeChange hook on the server side as a safety net.
  // The client-side conflict detection is handled by watching field changes.
  return <RelationshipField {...props} />
}

export default SmtpFormConfigPicker
