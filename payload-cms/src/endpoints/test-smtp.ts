/**
 * Test SMTP Endpoint
 *
 * POST /api/test-smtp
 * Sends a test email to verify SMTP configuration
 */

import type { PayloadHandler } from 'payload'
import nodemailer from 'nodemailer'

export const testSmtpHandler: PayloadHandler = async (req) => {
  // Only authenticated users can test SMTP
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json?.()

    if (!body) {
      return Response.json({ error: 'Request body is required' }, { status: 400 })
    }

    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpSecure,
      emailFromAddress,
    } = body

    if (!smtpHost || !smtpUser || !smtpPassword) {
      return Response.json({ error: 'SMTP host, user, and password are required' }, { status: 400 })
    }

    const port = smtpPort || 587
    // Auto-detect SSL based on port: 465 = SSL, others = STARTTLS
    const secure = port === 465

    console.log('SMTP Test Config:', {
      host: smtpHost,
      port,
      secure,
      user: smtpUser,
      passLength: smtpPassword?.length,
    })

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      // QQ邮箱可能需要这些设置
      tls: {
        rejectUnauthorized: false,
      },
    })

    // Verify connection
    await transporter.verify()

    // Send test email to the SMTP user
    // Note: Some providers (like QQ Mail) require from address to match auth user
    await transporter.sendMail({
      from: smtpUser,
      to: smtpUser,
      subject: 'SMTP Test - Busrom CMS',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>SMTP Configuration Test</h2>
          <p>This is a test email from Busrom CMS.</p>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toISOString()}<br>
            SMTP Host: ${smtpHost}<br>
            SMTP Port: ${smtpPort || 587}
          </p>
        </div>
      `,
      text: `SMTP Configuration Test\n\nThis is a test email from Busrom CMS.\n\nIf you received this email, your SMTP configuration is working correctly!\n\nSent at: ${new Date().toISOString()}`,
    })

    return Response.json({
      success: true,
      message: `Test email sent successfully to ${smtpUser}`,
    })
  } catch (error) {
    console.error('SMTP test failed:', error)

    let errorMessage = 'Failed to send test email'

    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. Check SMTP host and port.'
      } else if (error.message.includes('EAUTH') || error.message.includes('auth')) {
        errorMessage = 'Authentication failed. Check SMTP username and password.'
      } else if (error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Connection timed out. Check SMTP host and firewall settings.'
      } else {
        errorMessage = error.message
      }
    }

    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
