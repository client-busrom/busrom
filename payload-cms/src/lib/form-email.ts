/**
 * Form Email Utility
 *
 * Handles form notification and auto-reply emails
 * Respects global settings and per-form overrides
 */

import type { Payload } from 'payload'
import {
  sendEmail,
  lexicalToHtml,
  replacePlaceholders,
  generateFormDataHtml,
} from './email'

interface FormSubmission {
  id: string | number
  formName?: string
  formConfig?: string | number | { id: string | number; [key: string]: any }
  data?: Record<string, any>
  locale?: string
  [key: string]: any
}

interface EmailResult {
  success: boolean
  error?: string
}

/**
 * Get effective email configuration by merging global and per-form settings
 */
async function getEffectiveEmailConfig(
  payload: Payload,
  formConfigId: string | number | undefined,
  locale: string
) {
  // Get global email config
  const emailConfig = await payload.findGlobal({
    slug: 'email-config',
    locale: (locale || 'en') as 'en' | 'zh',
  }) as any

  // Get form-specific config if available
  let formConfig: any = null
  if (formConfigId) {
    try {
      formConfig = await payload.findByID({
        collection: 'form-configs',
        id: formConfigId,
        locale: (locale || 'en') as 'en' | 'zh',
      })
    } catch {
      // Form config not found, use global only
    }
  }

  // Determine notification emails (form override > global)
  const notificationEmails = formConfig?.notificationEmails || emailConfig.formNotificationEmails

  // Determine if auto-reply is enabled
  // Form setting: 'inherit' -> use global, 'enabled' -> true, 'disabled' -> false
  let autoReplyEnabled = emailConfig.enableAutoReply || false
  if (formConfig?.autoReplyEnabled === 'enabled') {
    autoReplyEnabled = true
  } else if (formConfig?.autoReplyEnabled === 'disabled') {
    autoReplyEnabled = false
  }
  // 'inherit' uses the global setting (already set above)

  // Get auto-reply subject (form override > global)
  const autoReplySubject = formConfig?.autoReplySubject || emailConfig.autoReplySubject

  // Get auto-reply template (form override > global)
  const autoReplyTemplate = formConfig?.autoReplyTemplate || emailConfig.autoReplyTemplate

  return {
    // Global settings
    formNotificationEnabled: emailConfig.formNotificationEnabled || false,
    notificationEmails,
    notificationSubject: emailConfig.notificationSubject || 'New Form Submission: {formName}',
    emailFromAddress: emailConfig.emailFromAddress,
    emailFromName: emailConfig.emailFromName,
    // Auto-reply (merged)
    autoReplyEnabled,
    autoReplySubject,
    autoReplyTemplate,
    // Form config
    formConfig,
  }
}

/**
 * Send notification email to admin(s) when a form is submitted
 */
export async function sendFormNotificationEmail(
  payload: Payload,
  submission: FormSubmission
): Promise<EmailResult> {
  const locale = submission.locale || 'en'

  // Get form config ID
  const formConfigId = typeof submission.formConfig === 'object'
    ? submission.formConfig?.id
    : submission.formConfig

  const config = await getEffectiveEmailConfig(payload, formConfigId, locale)

  // Check if notifications are enabled
  if (!config.formNotificationEnabled) {
    return { success: false, error: 'Form notifications disabled' }
  }

  // Check if there are notification emails configured
  if (!config.notificationEmails) {
    return { success: false, error: 'No notification emails configured' }
  }

  // Parse notification emails
  const emails = config.notificationEmails
    .split(',')
    .map((e: string) => e.trim())
    .filter((e: string) => e)

  if (emails.length === 0) {
    return { success: false, error: 'No valid notification emails' }
  }

  // Build subject
  const subject = replacePlaceholders(config.notificationSubject, {
    formName: submission.formName || 'Unknown Form',
  })

  // Build HTML content
  const formDataHtml = generateFormDataHtml(submission.data || {})
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #2563eb; color: white; padding: 20px; }
        .content { padding: 20px; }
        .meta { color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>New Form Submission: ${submission.formName || 'Unknown Form'}</h2>
      </div>
      <div class="content">
        <h3>Submitted Data:</h3>
        ${formDataHtml}
        <div class="meta">
          <p><strong>Submission ID:</strong> ${submission.id}</p>
          <p><strong>Submitted At:</strong> ${new Date().toISOString()}</p>
          <p><strong>Locale:</strong> ${locale}</p>
          ${submission.sourcePage ? `<p><strong>Source Page:</strong> ${submission.sourcePage}</p>` : ''}
          ${submission.ipAddress ? `<p><strong>IP Address:</strong> ${submission.ipAddress}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `

  // Send email
  return sendEmail(payload, {
    to: emails,
    subject,
    html,
    replyTo: submission.data?.email,
  }, locale)
}

/**
 * Send auto-reply email to the form submitter
 */
export async function sendAutoReplyEmail(
  payload: Payload,
  submission: FormSubmission
): Promise<EmailResult> {
  const locale = submission.locale || 'en'

  // Check if submitter has an email
  const submitterEmail = submission.data?.email
  if (!submitterEmail) {
    return { success: false, error: 'No submitter email found' }
  }

  // Get form config ID
  const formConfigId = typeof submission.formConfig === 'object'
    ? submission.formConfig?.id
    : submission.formConfig

  const config = await getEffectiveEmailConfig(payload, formConfigId, locale)

  // Check if auto-reply is enabled
  if (!config.autoReplyEnabled) {
    return { success: false, error: 'Auto-reply disabled' }
  }

  // Check if template exists
  if (!config.autoReplyTemplate) {
    return { success: false, error: 'No auto-reply template configured' }
  }

  // Build subject
  const subject = replacePlaceholders(config.autoReplySubject || 'Thank you for contacting us', {
    name: submission.data?.name || '',
    email: submitterEmail,
    formName: submission.formName || '',
  })

  // Convert rich text template to HTML
  let templateHtml = lexicalToHtml(config.autoReplyTemplate)

  // Replace placeholders in template
  templateHtml = replacePlaceholders(templateHtml, {
    name: submission.data?.name || '',
    email: submitterEmail,
    formName: submission.formName || '',
    company: submission.data?.company || '',
  })

  // Build full HTML email
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .content { padding: 20px; }
        a { color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="content">
        ${templateHtml}
      </div>
    </body>
    </html>
  `

  // Send email
  return sendEmail(payload, {
    to: submitterEmail,
    subject,
    html,
  }, locale)
}
