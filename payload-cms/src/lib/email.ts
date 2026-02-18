/**
 * Email Utility
 *
 * Handles email sending using nodemailer
 * Supports direct SMTP configuration via EmailConfig
 */

import nodemailer from 'nodemailer'

export interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string
  smtpPassword: string
  emailFromAddress: string
  emailFromName: string
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

/**
 * Create nodemailer transporter from config
 */
export function createTransporter(config: EmailConfig) {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  })
}

/**
 * Send email using provided SMTP config
 */
export async function sendEmail(
  config: EmailConfig,
  options: SendEmailOptions,
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter(config)

    const fromAddress = options.from || `"${config.emailFromName}" <${config.emailFromAddress}>`

    await transporter.sendMail({
      from: fromAddress,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Convert Lexical rich text content to HTML
 * This is a simplified converter - for production, use @payloadcms/richtext-lexical serializers
 */
export function lexicalToHtml(content: any): string {
  if (!content || !content.root || !content.root.children) {
    return ''
  }

  function processNode(node: any): string {
    if (!node) return ''

    // Text node
    if (node.type === 'text') {
      let text = node.text || ''
      // Apply formatting
      if (node.format) {
        if (node.format & 1) text = `<strong>${text}</strong>` // bold
        if (node.format & 2) text = `<em>${text}</em>` // italic
        if (node.format & 4) text = `<s>${text}</s>` // strikethrough
        if (node.format & 8) text = `<u>${text}</u>` // underline
        if (node.format & 16) text = `<code>${text}</code>` // code
      }
      return text
    }

    // Process children
    const childrenHtml = node.children?.map(processNode).join('') || ''

    // Handle different node types
    switch (node.type) {
      case 'paragraph':
        return `<p>${childrenHtml}</p>`
      case 'heading':
        const tag = node.tag || 'h2'
        return `<${tag}>${childrenHtml}</${tag}>`
      case 'list':
        const listTag = node.listType === 'number' ? 'ol' : 'ul'
        return `<${listTag}>${childrenHtml}</${listTag}>`
      case 'listitem':
        return `<li>${childrenHtml}</li>`
      case 'link':
        const href = node.fields?.url || node.url || '#'
        return `<a href="${href}">${childrenHtml}</a>`
      case 'quote':
        return `<blockquote>${childrenHtml}</blockquote>`
      case 'linebreak':
        return '<br>'
      default:
        return childrenHtml
    }
  }

  return content.root.children.map(processNode).join('')
}

/**
 * Replace placeholders in template
 */
export function replacePlaceholders(
  template: string,
  data: Record<string, string>
): string {
  let result = template
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '')
  }
  return result
}

/**
 * Generate form data HTML table for notification emails
 */
export function generateFormDataHtml(formData: Record<string, any>): string {
  const fieldLabels: Record<string, string> = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    company: 'Company',
    message: 'Message',
    subject: 'Subject',
    country: 'Country',
    city: 'City',
    address: 'Address',
    product: 'Product',
    quantity: 'Quantity',
    budget: 'Budget',
    timeline: 'Timeline',
  }

  const rows = Object.entries(formData)
    .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    .map(([key, value]) => {
      const label = fieldLabels[key] || key
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
      return `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${label}</td><td style="padding: 8px; border: 1px solid #ddd;">${displayValue}</td></tr>`
    })
    .join('')

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      ${rows}
    </table>
  `
}
