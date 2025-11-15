/**
 * Email Sender
 *
 * This module provides email sending functionality for:
 * - Contact form notifications to admins
 * - Auto-reply to customers
 * - Other transactional emails
 *
 * Dependencies:
 * - nodemailer: Email sending
 *
 * Configuration:
 * - SMTP settings are fetched from SiteConfig in CMS
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

/**
 * Site Config Interface (subset)
 */
interface SiteConfig {
  smtpHost?: string | null
  smtpPort?: string | null
  smtpUser?: string | null
  smtpPassword?: string | null
  emailFromAddress?: string | null
  emailFromName?: any // JSON object with { en, zh } or string
  formNotificationEmails?: string | null
  enableAutoReply?: boolean | null
  autoReplyTemplate?: any // JSON object with { en, zh } or string
}

/**
 * Helper function to extract text from multilingual field
 */
function getMultilingualText(field: any, language: 'en' | 'zh' = 'en'): string {
  if (!field) return ''

  // If it's already a string, return it
  if (typeof field === 'string') return field

  // If it's a JSON object with language keys
  if (typeof field === 'object' && field !== null) {
    // Try to get the requested language, fallback to English, then any available
    return field[language] || field.en || field.zh || JSON.stringify(field)
  }

  return String(field)
}

/**
 * Contact Form Interface
 */
export interface ContactFormData {
  id: string
  name: string
  email: string
  whatsapp?: string | null
  companyName?: string | null
  message: string
  relatedProduct?: {
    id: string
    name?: string
  } | null
  submittedAt: string
  ipAddress?: string | null
  locale?: string | null // User's preferred language
}

/**
 * Form Submission Interface
 */
export interface FormSubmissionData {
  id: string
  formName: string
  formConfigId?: string | null // FormConfig ID for fetching custom settings
  data: Record<string, any> // JSON form data
  submittedAt: string
  locale?: string | null
  sourcePage?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}

/**
 * Fetch Site Config from Database
 */
async function getSiteConfig(context: any): Promise<SiteConfig | null> {
  try {
    const siteConfig = await context.db.SiteConfig.findMany({
      take: 1,
    })

    return siteConfig[0] || null
  } catch (error) {
    console.error('Error fetching site config:', error)
    return null
  }
}

/**
 * Create SMTP Transporter
 */
function createTransporter(config: SiteConfig): Transporter | null {
  try {
    if (!config.smtpHost || !config.smtpUser || !config.smtpPassword) {
      console.warn('⚠️  SMTP configuration incomplete. Email sending disabled.')
      return null
    }

    const port = config.smtpPort ? parseInt(config.smtpPort) : 587

    const transportConfig = {
      host: config.smtpHost,
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
      // Add timeout and connection limits
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,
      socketTimeout: 10000,
      // Enable debug logging
      logger: true,
      debug: process.env.NODE_ENV === 'development',
    }

    console.log(`📧 SMTP Config: ${config.smtpHost}:${port} (secure: ${port === 465})`)
    console.log(`📧 SMTP User: ${config.smtpUser}`)

    return nodemailer.createTransport(transportConfig)
  } catch (error) {
    console.error('Error creating SMTP transporter:', error)
    return null
  }
}

/**
 * Send Contact Form Notification to Admins
 *
 * This function sends an email notification to admin emails when a new contact form is submitted
 */
export async function sendContactFormNotification(
  form: ContactFormData,
  context: any
): Promise<boolean> {
  try {
    console.log(`📧 Sending contact form notification for: ${form.name}`)

    // Fetch site config
    const config = await getSiteConfig(context)
    if (!config) {
      console.warn('⚠️  Site config not found. Email sending skipped.')
      return false
    }

    // Create transporter
    const transporter = createTransporter(config)
    if (!transporter) {
      return false
    }

    // Parse notification emails
    const notificationEmails = config.formNotificationEmails?.split(',').map((e) => e.trim()) || []
    if (notificationEmails.length === 0) {
      console.warn('⚠️  No notification emails configured. Email sending skipped.')
      return false
    }

    // Get admin URL
    const adminUrl = process.env.ADMIN_URL || 'https://admin.busrom.com'

    // Prepare email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      font-size: 24px;
      margin-bottom: 20px;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    .field {
      margin-bottom: 15px;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    .field strong {
      color: #2c3e50;
      display: inline-block;
      width: 120px;
    }
    .message {
      background: white;
      padding: 15px;
      border-left: 4px solid #3498db;
      margin: 20px 0;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #3498db;
      color: white !important;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🆕 New Contact Form Submission</h1>

    <div class="field">
      <strong>Name:</strong> ${form.name}
    </div>

    <div class="field">
      <strong>Email:</strong> <a href="mailto:${form.email}">${form.email}</a>
    </div>

    ${form.whatsapp ? `<div class="field"><strong>WhatsApp:</strong> ${form.whatsapp}</div>` : ''}

    ${form.companyName ? `<div class="field"><strong>Company:</strong> ${form.companyName}</div>` : ''}

    ${
      form.relatedProduct
        ? `<div class="field"><strong>Related Product:</strong> ${form.relatedProduct.name || form.relatedProduct.id}</div>`
        : ''
    }

    <div class="field">
      <strong>Submitted At:</strong> ${new Date(form.submittedAt).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      })}
    </div>

    ${form.ipAddress ? `<div class="field"><strong>IP Address:</strong> ${form.ipAddress}</div>` : ''}

    <h3>Message:</h3>
    <div class="message">${form.message}</div>

    <a href="${adminUrl}/contact-forms/${form.id}" class="button">View in Admin Panel</a>

    <div class="footer">
      <p>This is an automated notification from Busrom Contact Form System.</p>
      <p>Please reply to the customer at <a href="mailto:${form.email}">${form.email}</a></p>
    </div>
  </div>
</body>
</html>
`

    // Get sender name (prefer English for admin notifications)
    const fromName = getMultilingualText(config.emailFromName, 'en') || 'Busrom'
    const fromAddress = config.emailFromAddress || 'noreply@busrom.com'

    console.log(`📧 From: "${fromName}" <${fromAddress}>`)

    // Send email to admins
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: notificationEmails.join(', '),
      subject: `New Inquiry from ${form.name} - ${form.companyName || 'Individual'}`,
      html: emailHtml,
      // Plain text fallback
      text: `
New Contact Form Submission

Name: ${form.name}
Email: ${form.email}
${form.whatsapp ? `WhatsApp: ${form.whatsapp}` : ''}
${form.companyName ? `Company: ${form.companyName}` : ''}
${form.relatedProduct ? `Related Product: ${form.relatedProduct.name || form.relatedProduct.id}` : ''}

Message:
${form.message}

Submitted At: ${new Date(form.submittedAt).toLocaleString()}
${form.ipAddress ? `IP Address: ${form.ipAddress}` : ''}

View details: ${adminUrl}/contact-forms/${form.id}
`,
    })

    console.log(`✅ Admin notification sent successfully to: ${notificationEmails.join(', ')}`)

    // Send auto-reply to customer if enabled
    if (config.enableAutoReply && config.autoReplyTemplate) {
      // Determine language from form locale (default to English)
      const language = (form.locale === 'zh' || form.locale === 'zh-CN') ? 'zh' : 'en'
      await sendAutoReply(form, config, transporter, language)
    }

    return true
  } catch (error) {
    console.error('❌ Error sending contact form notification:', error)
    return false
  }
}

/**
 * Send Auto-Reply to Customer
 */
async function sendAutoReply(
  form: ContactFormData,
  config: SiteConfig,
  transporter: Transporter,
  language: 'en' | 'zh' = 'en'
): Promise<boolean> {
  try {
    console.log(`📧 Sending auto-reply to: ${form.email} (language: ${language})`)

    // Get template text based on language
    const template = getMultilingualText(config.autoReplyTemplate, language)

    if (!template) {
      console.warn('⚠️  Auto-reply template is empty, skipping auto-reply')
      return false
    }

    // Replace placeholders in template
    const message = template
      .replace(/{name}/g, form.name)
      .replace(/{email}/g, form.email)
      .replace(/{company}/g, form.companyName || '')

    // Get sender info
    const fromName = getMultilingualText(config.emailFromName, language) || 'Busrom'
    const fromAddress = config.emailFromAddress || 'noreply@busrom.com'

    // Subject based on language
    const subject = language === 'zh'
      ? '感谢您联系 Busrom'
      : 'Thank you for contacting Busrom'

    console.log(`📧 Auto-reply from: "${fromName}" <${fromAddress}>`)

    // Send auto-reply
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: form.email,
      subject: subject,
      text: message,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .message {
      white-space: pre-wrap;
      background: white;
      padding: 20px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="message">${message.replace(/\n/g, '<br>')}</div>
  </div>
</body>
</html>
`,
    })

    console.log(`✅ Auto-reply sent successfully to: ${form.email}`)
    return true
  } catch (error) {
    console.error('❌ Error sending auto-reply:', error)
    return false
  }
}

/**
 * Send Form Submission Notification to Admins
 *
 * This function sends an email notification for dynamic form submissions
 */
export async function sendFormSubmissionNotification(
  form: FormSubmissionData,
  context: any
): Promise<boolean> {
  try {
    console.log(`📧 Sending form submission notification for: ${form.formName}`)

    // Fetch site config
    const config = await getSiteConfig(context)
    if (!config) {
      console.warn('⚠️  Site config not found. Email sending skipped.')
      return false
    }

    // Create transporter
    const transporter = createTransporter(config)
    if (!transporter) {
      return false
    }

    // Fetch FormConfig to check for custom settings (覆盖逻辑)
    let notificationEmailsString = config.formNotificationEmails
    let formConfig: any = null

    if (form.formConfigId) {
      try {
        formConfig = await context.sudo().query.FormConfig.findOne({
          where: { id: form.formConfigId },
          query: 'notificationEmail enableEmailNotification enableAutoReply autoReplySubject autoReplyContent',
        })

        // Check if email notification is disabled for this form
        if (formConfig?.enableEmailNotification === false) {
          console.log('⚠️  Email notification disabled for this form. Skipping.')
          return false
        }

        // Use FormConfig's notification email if provided (覆盖 SiteConfig)
        if (formConfig?.notificationEmail) {
          notificationEmailsString = formConfig.notificationEmail
          console.log(`✓ Using FormConfig notification emails: ${notificationEmailsString}`)
        } else {
          console.log(`✓ Using SiteConfig global notification emails: ${notificationEmailsString}`)
        }
      } catch (error) {
        console.warn('⚠️  Failed to fetch FormConfig, using SiteConfig defaults:', error)
      }
    }

    // Parse notification emails
    const notificationEmails = notificationEmailsString?.split(',').map((e) => e.trim()) || []
    if (notificationEmails.length === 0) {
      console.warn('⚠️  No notification emails configured. Email sending skipped.')
      return false
    }

    // Get admin URL
    const adminUrl = process.env.ADMIN_URL || 'https://admin.busrom.com'

    // Format form data as HTML table
    const formDataRows = Object.entries(form.data)
      .map(([key, value]) => {
        let displayValue = value
        if (Array.isArray(value)) {
          displayValue = value.join(', ')
        } else if (typeof value === 'object' && value !== null) {
          displayValue = JSON.stringify(value, null, 2)
        }

        return `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold; width: 150px;">${key}</td>
      <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${displayValue || '-'}</td>
    </tr>`
      })
      .join('')

    // Prepare email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      font-size: 24px;
      margin-bottom: 20px;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    .metadata {
      margin-bottom: 20px;
      padding: 15px;
      background: white;
      border-radius: 4px;
      font-size: 14px;
      color: #666;
    }
    .metadata strong {
      color: #2c3e50;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: white;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #3498db;
      color: white !important;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📝 New Form Submission: ${form.formName}</h1>

    <div class="metadata">
      <strong>Submitted At:</strong> ${new Date(form.submittedAt).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      })}<br>
      ${form.locale ? `<strong>Language:</strong> ${form.locale}<br>` : ''}
      ${form.sourcePage ? `<strong>Source Page:</strong> ${form.sourcePage}<br>` : ''}
      ${form.ipAddress ? `<strong>IP Address:</strong> ${form.ipAddress}<br>` : ''}
    </div>

    <h3>Form Data:</h3>
    <table>
      <tbody>
        ${formDataRows}
      </tbody>
    </table>

    <a href="${adminUrl}/form-submissions/${form.id}" class="button">View in Admin Panel</a>

    <div class="footer">
      <p>This is an automated notification from Busrom Form System.</p>
    </div>
  </div>
</body>
</html>
`

    // Plain text version
    const formDataText = Object.entries(form.data)
      .map(([key, value]) => {
        let displayValue = value
        if (Array.isArray(value)) {
          displayValue = value.join(', ')
        } else if (typeof value === 'object' && value !== null) {
          displayValue = JSON.stringify(value)
        }
        return `${key}: ${displayValue || '-'}`
      })
      .join('\n')

    // Get sender name
    const fromName = getMultilingualText(config.emailFromName, 'en') || 'Busrom'
    const fromAddress = config.emailFromAddress || 'noreply@busrom.com'

    console.log(`📧 From: "${fromName}" <${fromAddress}>`)

    // Send email to admins
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: notificationEmails.join(', '),
      subject: `New Form Submission: ${form.formName}`,
      html: emailHtml,
      text: `
New Form Submission: ${form.formName}

Submitted At: ${new Date(form.submittedAt).toLocaleString()}
${form.locale ? `Language: ${form.locale}` : ''}
${form.sourcePage ? `Source Page: ${form.sourcePage}` : ''}
${form.ipAddress ? `IP Address: ${form.ipAddress}` : ''}

Form Data:
${formDataText}

View details: ${adminUrl}/form-submissions/${form.id}
`,
    })

    console.log(`✅ Form submission notification sent successfully to: ${notificationEmails.join(', ')}`)

    // Send auto-reply to customer if enabled
    await sendFormSubmissionAutoReply(form, config, transporter, formConfig || undefined)

    return true
  } catch (error) {
    console.error('❌ Error sending form submission notification:', error)
    return false
  }
}

/**
 * Send Auto-Reply for Form Submission
 *
 * Supports override logic from FormConfig
 */
async function sendFormSubmissionAutoReply(
  form: FormSubmissionData,
  siteConfig: SiteConfig,
  transporter: Transporter,
  formConfig?: any
): Promise<boolean> {
  try {
    // Extract email from form data
    let customerEmail: string | null = null
    const emailFields = ['email', 'Email', 'EMAIL', 'userEmail', 'contactEmail']

    for (const field of emailFields) {
      if (form.data[field] && typeof form.data[field] === 'string') {
        customerEmail = form.data[field]
        break
      }
    }

    if (!customerEmail) {
      console.log('⚠️  No email field found in form data, skipping auto-reply')
      return false
    }

    // Determine if auto-reply is enabled (FormConfig overrides SiteConfig)
    let enableAutoReply = siteConfig.enableAutoReply || false
    if (formConfig?.enableAutoReply !== undefined && formConfig.enableAutoReply !== null) {
      enableAutoReply = formConfig.enableAutoReply
      console.log(`✓ Using FormConfig auto-reply setting: ${enableAutoReply}`)
    } else {
      console.log(`✓ Using SiteConfig auto-reply setting: ${enableAutoReply}`)
    }

    if (!enableAutoReply) {
      console.log('⚠️  Auto-reply is disabled, skipping')
      return false
    }

    // Determine language from form locale (default to English)
    const language = (form.locale === 'zh' || form.locale === 'zh-CN') ? 'zh' : 'en'

    // Get auto-reply subject (FormConfig overrides default)
    let subject = language === 'zh' ? '感谢您联系 Busrom' : 'Thank you for contacting Busrom'
    if (formConfig?.autoReplySubject) {
      const customSubject = getMultilingualText(formConfig.autoReplySubject, language)
      if (customSubject) {
        subject = customSubject
        console.log(`✓ Using FormConfig auto-reply subject`)
      }
    }

    // Get auto-reply template (FormConfig overrides SiteConfig)
    let template = ''
    if (formConfig?.autoReplyContent) {
      template = getMultilingualText(formConfig.autoReplyContent, language)
      if (template) {
        console.log(`✓ Using FormConfig auto-reply template`)
      }
    }

    if (!template) {
      template = getMultilingualText(siteConfig.autoReplyTemplate, language)
      if (template) {
        console.log(`✓ Using SiteConfig auto-reply template`)
      }
    }

    if (!template) {
      console.warn('⚠️  Auto-reply template is empty, skipping auto-reply')
      return false
    }

    // Replace placeholders in template
    let message = template
    // Extract name from form data
    const nameFields = ['name', 'Name', 'NAME', 'userName', 'fullName']
    let customerName = ''
    for (const field of nameFields) {
      if (form.data[field] && typeof form.data[field] === 'string') {
        customerName = form.data[field]
        break
      }
    }

    message = message
      .replace(/{name}/g, customerName || 'Customer')
      .replace(/{email}/g, customerEmail)
      .replace(/{formName}/g, form.formName)

    // Get sender info
    const fromName = getMultilingualText(siteConfig.emailFromName, language) || 'Busrom'
    const fromAddress = siteConfig.emailFromAddress || 'noreply@busrom.com'

    console.log(`📧 Sending auto-reply to: ${customerEmail} (language: ${language})`)

    // Send auto-reply
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: customerEmail,
      subject: subject,
      text: message,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .message {
      white-space: pre-wrap;
      background: white;
      padding: 20px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="message">${message.replace(/\n/g, '<br>')}</div>
  </div>
</body>
</html>
`,
    })

    console.log(`✅ Auto-reply sent successfully to: ${customerEmail}`)
    return true
  } catch (error) {
    console.error('❌ Error sending auto-reply:', error)
    return false
  }
}

/**
 * Test Email Configuration
 *
 * This function can be used to test if the SMTP configuration is working
 */
export async function testEmailConfiguration(context: any): Promise<boolean> {
  try {
    const config = await getSiteConfig(context)
    if (!config) {
      console.error('❌ Site config not found')
      return false
    }

    const transporter = createTransporter(config)
    if (!transporter) {
      console.error('❌ Failed to create transporter')
      return false
    }

    // Verify connection
    await transporter.verify()
    console.log('✅ SMTP configuration is valid and server is ready')
    return true
  } catch (error) {
    console.error('❌ SMTP configuration test failed:', error)
    return false
  }
}
