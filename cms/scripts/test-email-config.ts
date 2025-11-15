/**
 * Test Email Configuration
 *
 * This script tests if the SMTP configuration is working correctly
 * Run with: npx tsx scripts/test-email-config.ts
 */

import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

async function testEmailConfig() {
  try {
    console.log('🔍 Fetching SMTP configuration from database...\n')

    // Fetch site config
    const siteConfig = await prisma.siteConfig.findFirst()

    if (!siteConfig) {
      console.error('❌ No site configuration found')
      process.exit(1)
    }

    console.log('✅ Site configuration found:')
    console.log(`   SMTP Host: ${siteConfig.smtpHost}`)
    console.log(`   SMTP Port: ${siteConfig.smtpPort}`)
    console.log(`   SMTP User: ${siteConfig.smtpUser}`)
    console.log(`   SMTP Password: ${siteConfig.smtpPassword ? '***' + siteConfig.smtpPassword.slice(-4) : 'NOT SET'}`)
    console.log(`   From Address: ${siteConfig.emailFromAddress}`)
    console.log(`   Notification Emails: ${siteConfig.formNotificationEmails}`)
    console.log('')

    // Check if SMTP is configured
    if (!siteConfig.smtpHost || !siteConfig.smtpUser || !siteConfig.smtpPassword) {
      console.error('❌ SMTP configuration incomplete!')
      console.error('   Please configure SMTP settings in Site Config')
      process.exit(1)
    }

    // Create transporter
    console.log('🔧 Creating SMTP transporter...\n')
    const port = siteConfig.smtpPort ? parseInt(siteConfig.smtpPort) : 587

    const transporter = nodemailer.createTransport({
      host: siteConfig.smtpHost,
      port: port,
      secure: port === 465,
      auth: {
        user: siteConfig.smtpUser,
        pass: siteConfig.smtpPassword,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    })

    // Verify connection
    console.log('🔌 Testing SMTP connection...\n')
    await transporter.verify()
    console.log('✅ SMTP connection successful!\n')

    // Send test email
    const notificationEmails = siteConfig.formNotificationEmails?.split(',').map(e => e.trim()) || []

    if (notificationEmails.length === 0) {
      console.warn('⚠️  No notification emails configured')
      console.log('✅ SMTP configuration is valid, but no recipients configured')
      process.exit(0)
    }

    console.log(`📧 Sending test email to: ${notificationEmails.join(', ')}...\n`)

    const info = await transporter.sendMail({
      from: `"${siteConfig.emailFromName || 'Busrom'}" <${siteConfig.emailFromAddress}>`,
      to: notificationEmails.join(', '),
      subject: '🧪 Test Email - SMTP Configuration Verification',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
      color: #10b981;
      margin-bottom: 20px;
    }
    .info {
      background: white;
      padding: 15px;
      border-radius: 4px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✅ SMTP Configuration Test Successful!</h1>
    <p>This is a test email to verify that your SMTP configuration is working correctly.</p>

    <div class="info">
      <strong>SMTP Server:</strong> ${siteConfig.smtpHost}:${port}<br>
      <strong>From Address:</strong> ${siteConfig.emailFromAddress}<br>
      <strong>Test Time:</strong> ${new Date().toLocaleString()}
    </div>

    <p>If you received this email, your contact form notifications will work correctly!</p>

    <p style="color: #666; font-size: 12px; margin-top: 30px;">
      This is an automated test email from Busrom CMS.
    </p>
  </div>
</body>
</html>
      `,
      text: `
SMTP Configuration Test Successful!

This is a test email to verify that your SMTP configuration is working correctly.

SMTP Server: ${siteConfig.smtpHost}:${port}
From Address: ${siteConfig.emailFromAddress}
Test Time: ${new Date().toLocaleString()}

If you received this email, your contact form notifications will work correctly!
      `,
    })

    console.log('✅ Test email sent successfully!')
    console.log(`   Message ID: ${info.messageId}`)
    console.log(`   Response: ${info.response}`)
    console.log('')
    console.log('🎉 Email configuration is working perfectly!')
    console.log('   Check your inbox to confirm receipt.')

  } catch (error) {
    console.error('\n❌ Email configuration test failed:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testEmailConfig()
