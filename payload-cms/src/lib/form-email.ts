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
  console.log(`[Email Debug] Attempting to find SMTP config for Form ID: ${formConfigId}, Locale: ${locale}`)
  const smtpConfig = await findSmtpConfigForForm(payload, formConfigId, locale)
  
  if (!smtpConfig) {
    console.warn(`[Email Debug] No SMTP config found for Form ID: ${formConfigId}`)
    return { success: false, error: 'No SMTP config found for this form' }
  }

  console.log(`[Email Debug] Found SMTP config: "${smtpConfig.name}". Notification Enabled: ${smtpConfig.notificationEnabled}`)

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

  // Helper to find field value by multiple possible keys (case-insensitive)
  const getSmartValue = (keys: string[]) => {
    const data = submission.data || {}
    for (const key of keys) {
      if (data[key]) return String(data[key])
      const lowerKey = key.toLowerCase()
      const entry = Object.entries(data).find(([k]) => k.toLowerCase() === lowerKey)
      if (entry) return String(entry[1])
    }
    return ''
  }

  const name = getSmartValue(['name', 'fullName', 'firstName', 'userName', 'contactName'])
  const company = getSmartValue(['company', 'companyName', 'organization'])

  // Recipient display name (for To header and Greeting)
  // Priority: Personal Name > Company Name
  const recipientDisplayName = name || company

  // Build subject
  const subject = replacePlaceholders(autoReplySubject || 'Thank you for contacting us', {
    name: recipientDisplayName,
    email: submitterEmail,
    formName: submission.formName || '',
    company,
  })

  // Convert rich text template to HTML
  let templateHtml = lexicalToHtml(autoReplyTemplate)

  // Replace placeholders in template (keeping for backward compatibility)
  templateHtml = replacePlaceholders(templateHtml, {
    name: name || recipientDisplayName,
    email: submitterEmail,
    formName: submission.formName || '',
    company,
  })

  // Auto-generate Greeting (Modern Auto-reply pattern)
  // Mapping for all 24 supported website locales
  const greetingTemplates: Record<string, { withName: string; withoutName: string; font: string; dir?: 'rtl' | 'ltr' }> = {
    en: { withName: 'Dear <strong>{name}</strong>,', withoutName: 'Hello,', font: 'Arial, sans-serif' },
    zh: { withName: '尊敬的 <strong>{name}</strong>：', withoutName: '您好：', font: '"Microsoft YaHei", Arial, sans-serif' },
    es: { withName: 'Estimado/a <strong>{name}</strong>,', withoutName: 'Hola,', font: 'Arial, sans-serif' },
    fr: { withName: 'Cher/Chère <strong>{name}</strong>,', withoutName: 'Bonjour,', font: 'Arial, sans-serif' },
    de: { withName: 'Sehr geehrte/r <strong>{name}</strong>,', withoutName: 'Guten Tag,', font: 'Arial, sans-serif' },
    ja: { withName: '<strong>{name}</strong> 様', withoutName: 'こんにちは', font: '"Hiragino Kaku Gothic ProN", "MS PGothic", sans-serif' },
    ko: { withName: '<strong>{name}</strong> 님', withoutName: '안녕하세요', font: '"Malgun Gothic", dotum, sans-serif' },
    pt: { withName: 'Prezado/a <strong>{name}</strong>,', withoutName: 'Olá,', font: 'Arial, sans-serif' },
    it: { withName: 'Gentile <strong>{name}</strong>,', withoutName: 'Buongiorno,', font: 'Arial, sans-serif' },
    nl: { withName: 'Beste <strong>{name}</strong>,', withoutName: 'Hallo,', font: 'Arial, sans-serif' },
    pl: { withName: 'Szanowny Panie / Szanowna Pani <strong>{name}</strong>,', withoutName: 'Witaj,', font: 'Arial, sans-serif' },
    ru: { withName: 'Уважаемый/ая <strong>{name}</strong>,', withoutName: 'Здравствуйте,', font: 'Arial, sans-serif' },
    ar: { withName: 'عزيزي <strong>{name}</strong>،', withoutName: 'مرحباً،', font: 'Arial, sans-serif', dir: 'rtl' },
    th: { withName: 'เรียนคุณ <strong>{name}</strong>,', withoutName: 'สวัสดี,', font: '"Leelawadee UI", sans-serif' },
    vi: { withName: 'Thân gửi <strong>{name}</strong>,', withoutName: 'Xin chào,', font: 'Arial, sans-serif' },
    id: { withName: 'Halo <strong>{name}</strong>,', withoutName: 'Selamat siang,', font: 'Arial, sans-serif' },
    ms: { withName: 'Helo <strong>{name}</strong>,', withoutName: 'Selamat sejahtera,', font: 'Arial, sans-serif' },
    tr: { withName: 'Sayın <strong>{name}</strong>,', withoutName: 'Merhaba,', font: 'Arial, sans-serif' },
    hi: { withName: 'प्रिय <strong>{name}</strong>,', withoutName: 'नमस्ते,', font: '"Mangal", sans-serif' },
    bn: { withName: 'প্রিয় <strong>{name}</strong>,', withoutName: 'হ্যালো,', font: '"Vrinda", sans-serif' },
    sv: { withName: 'Hej <strong>{name}</strong>,', withoutName: 'Hallå,', font: 'Arial, sans-serif' },
    da: { withName: 'Hej <strong>{name}</strong>,', withoutName: 'Dav,', font: 'Arial, sans-serif' },
    no: { withName: 'Hei <strong>{name}</strong>,', withoutName: 'Hallo,', font: 'Arial, sans-serif' },
    fi: { withName: 'Hei <strong>{name}</strong>,', withoutName: 'Terve,', font: 'Arial, sans-serif' },
  }

  const currentLang = (locale.split('-')[0] || 'en').toLowerCase()
  const template = greetingTemplates[currentLang] || greetingTemplates.en
  
  const greetingHtml = recipientDisplayName 
    ? template.withName.replace('{name}', recipientDisplayName) 
    : template.withoutName

  // Build full HTML email with localized styling
  const html = `
    <!DOCTYPE html>
    <html${template.dir ? ` dir="${template.dir}"` : ''}>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: ${template.font}; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          ${template.dir === 'rtl' ? 'text-align: right;' : ''}
        }
        .content { padding: 20px; }
        .greeting { margin-bottom: 20px; font-size: 16px; }
        .body-text { margin-bottom: 30px; }
        a { color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="content">
        <div class="greeting">
          ${greetingHtml}
        </div>
        <div class="body-text">
          ${templateHtml}
        </div>
      </div>
    </body>
    </html>
  `

  // Build email config and send
  const emailConfig = buildEmailConfig(smtpConfig)
  return sendEmail(emailConfig, {
    to: recipientDisplayName ? `"${recipientDisplayName}" <${submitterEmail}>` : submitterEmail,
    subject,
    html,
  })
}
