/**
 * Form Email Utility
 *
 * Handles form notification and auto-reply emails
 * Uses SmtpConfigs collection to find the SMTP config associated with each form
 */

import type { Payload } from 'payload'
import {
  sendEmail,
  lexicalToHtml,
  replacePlaceholders,
  generateFormDataHtml,
  type EmailConfig,
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
 * Find the SmtpConfig that is associated with a given formConfig
 */
async function findSmtpConfigForForm(
  payload: Payload,
  formConfigId: string | number,
  locale: string,
): Promise<any | null> {
  try {
    const result = await payload.find({
      collection: 'smtp-configs' as any,
      where: {
        and: [
          { formConfigs: { in: [formConfigId] } },
          { status: { equals: 'enabled' } },
        ],
      },
      locale: (locale || 'en') as any,
      limit: 1,
    })

    if (result.totalDocs === 0) {
      return null
    }

    return result.docs[0]
  } catch (error) {
    console.error('Failed to find SMTP config for form:', error)
    return null
  }
}

/**
 * Build an EmailConfig object from a SmtpConfig document
 */
function buildEmailConfig(smtpConfig: any): EmailConfig {
  const port = Number(smtpConfig.smtpPort) || 587
  const secure = port === 465

  return {
    smtpHost: smtpConfig.smtpHost,
    smtpPort: port,
    smtpSecure: secure,
    smtpUser: smtpConfig.smtpUser,
    smtpPassword: smtpConfig.smtpPassword,
    emailFromAddress: smtpConfig.emailFromAddress || smtpConfig.smtpUser,
    emailFromName: smtpConfig.emailFromName || 'Busrom',
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

  if (!formConfigId) {
    return { success: false, error: 'No form config ID' }
  }

  // Find the SMTP config for this form
  const smtpConfig = await findSmtpConfigForForm(payload, formConfigId, locale)
  if (!smtpConfig) {
    return { success: false, error: 'No SMTP config found for this form' }
  }

  // Check if notifications are enabled
  if (!smtpConfig.notificationEnabled) {
    return { success: false, error: 'Form notifications disabled' }
  }

  // Check if there are notification emails configured
  if (!smtpConfig.notificationEmails) {
    return { success: false, error: 'No notification emails configured' }
  }

  // Parse notification emails (supports newline, comma, or semicolon)
  const emails = smtpConfig.notificationEmails
    .split(/[\n,;]+/)
    .map((e: string) => e.trim())
    .filter((e: string) => e)

  if (emails.length === 0) {
    return { success: false, error: 'No valid notification emails' }
  }

  // Build subject
  const subject = replacePlaceholders(
    smtpConfig.notificationSubject || 'New Form Submission: {formName}',
    { formName: submission.formName || 'Unknown Form' },
  )

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

  // Build email config and send
  const emailConfig = buildEmailConfig(smtpConfig)
  return sendEmail(emailConfig, {
    to: emails,
    subject,
    html,
    replyTo: submission.data?.email,
  })
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

  if (!formConfigId) {
    return { success: false, error: 'No form config ID' }
  }

  // Find the SMTP config for this form
  const smtpConfig = await findSmtpConfigForForm(payload, formConfigId, locale)
  if (!smtpConfig) {
    return { success: false, error: 'No SMTP config found for this form' }
  }

  // Get form-specific auto-reply settings
  let formConfig: any = null
  try {
    formConfig = await payload.findByID({
      collection: 'form-configs',
      id: formConfigId,
      locale: (locale || 'en') as any,
    })
  } catch {
    // Form config not found
  }

  // Determine if auto-reply is enabled and which template to use
  const formAutoReply = formConfig?.autoReplyEnabled || 'inherit'

  let autoReplyEnabled: boolean
  let autoReplySubject: string | undefined
  let autoReplyTemplate: any

  if (formAutoReply === 'disabled') {
    return { success: false, error: 'Auto-reply disabled' }
  } else if (formAutoReply === 'enabled') {
    autoReplyEnabled = true
    // Use form-level subject/template, falling back to SMTP config defaults
    autoReplySubject = formConfig?.autoReplySubject || smtpConfig.autoReplySubject
    autoReplyTemplate = formConfig?.autoReplyTemplate || smtpConfig.autoReplyTemplate
  } else {
    // 'inherit' — use SMTP config settings
    autoReplyEnabled = smtpConfig.autoReplyEnabled || false
    autoReplySubject = smtpConfig.autoReplySubject
    autoReplyTemplate = smtpConfig.autoReplyTemplate
  }

  if (!autoReplyEnabled) {
    return { success: false, error: 'Auto-reply disabled' }
  }

  if (!autoReplyTemplate) {
    return { success: false, error: 'No auto-reply template configured' }
  }

  // Build subject
  const subject = replacePlaceholders(autoReplySubject || 'Thank you for contacting us', {
    name: submission.data?.name || '',
    email: submitterEmail,
    formName: submission.formName || '',
  })

  // Convert rich text template to HTML
  let templateHtml = lexicalToHtml(autoReplyTemplate)

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

  // Build email config and send
  const emailConfig = buildEmailConfig(smtpConfig)
  return sendEmail(emailConfig, {
    to: submitterEmail,
    subject,
    html,
  })
}
