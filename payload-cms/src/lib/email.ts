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
export async function lexicalToHtml(content: any, baseUrl: string = ''): Promise<string> {
  if (!content || !content.root || !content.root.children) {
    return ''
  }

  async function processNode(node: any): Promise<string> {
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
    const childrenPromises = node.children?.map(processNode) || []
    const childrenHtml = (await Promise.all(childrenPromises)).join('')

    // Handle alignment
    const style: string[] = []
    if (node.format) {
      if (['left', 'center', 'right', 'justify'].includes(node.format)) {
        style.push(`text-align: ${node.format}`)
      }
    }
    const styleAttr = style.length > 0 ? ` style="${style.join('; ')}"` : ''

    // Handle different node types
    switch (node.type) {
      case 'paragraph':
        return `<p${styleAttr}>${childrenHtml}</p>`
      case 'heading':
        const hTag = node.tag || 'h2'
        return `<${hTag}${styleAttr}>${childrenHtml}</${hTag}>`
      case 'list':
        const listTag = node.listType === 'number' ? 'ol' : 'ul'
        return `<${listTag}${styleAttr}>${childrenHtml}</${listTag}>`
      case 'listitem':
        return `<li${styleAttr}>${childrenHtml}</li>`
      case 'link':
      case 'autolink':
        const href = node.fields?.url || node.url || '#'
        return `<a href="${href}" style="color: #2563eb; text-decoration: underline;">${childrenHtml}</a>`
      case 'quote':
        return `<blockquote style="border-left: 4px solid #eee; padding-left: 16px; margin: 16px 0; color: #666;">${childrenHtml}</blockquote>`
      case 'linebreak':
        return '<br>'
      case 'horizontalrule':
        return '<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">'
      case 'upload':
        // Payload Lexical upload node: value usually contains the media object
        const media = node.value
        if (!media || typeof media !== 'object') return ''
        
        // Handle both depth 0 (ID) and depth 1 (Object)
        // If it's just an ID, we can't easily fetch it here without an async lookup
        // But in most cases with Payload's findByID { depth: 1 }, it is an object
        const mediaUrl = media.url || ''
        const mediaAlt = media.alt || ''
        
        if (!mediaUrl) return ''
        
        const absoluteUrl = mediaUrl.startsWith('http') ? mediaUrl : `${baseUrl}${mediaUrl}`
        
        // Use a wrapper with some padding and responsive styles
        return `
          <div style="margin: 24px 0; text-align: center;">
            <img src="${absoluteUrl}" alt="${mediaAlt}" style="max-width: 100%; height: auto; display: inline-block; border-radius: 4px;">
            ${node.fields?.caption ? `<div style="margin-top: 8px; font-size: 13px; color: #666;">${node.fields.caption}</div>` : ''}
          </div>
        `
      default:
        return childrenHtml
    }
  }

  const childrenPromises = content.root.children.map(processNode)
  const results = await Promise.all(childrenPromises)
  return results.join('')
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
