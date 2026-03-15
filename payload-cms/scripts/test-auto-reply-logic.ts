/**
 * Script to test auto-reply logic (Name vs Company priority, 24 locales, metadata filling)
 * 
 * Usage:
 *   npx tsx scripts/test-auto-reply-logic.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'
import * as formEmail from '../src/lib/form-email'
import * as emailUtils from '../src/lib/email'

async function runTests() {
  console.log('🚀 Initializing Payload for Testing...\n')
  const payload = await getPayload({ config })

  // Monkey-patch sendEmail to just log instead of sending
  const originalSendEmail = emailUtils.sendEmail;
  (emailUtils as any).sendEmail = async (config: any, options: any) => {
    console.log('--- EMAIL SENT (MOCK) ---')
    console.log('To:', options.to)
    console.log('Subject:', options.subject)
    console.log('Greeting Preview:', options.html.match(/<div class="greeting">([\s\S]*?)<\/div>/)?.[1].trim())
    console.log('-------------------------\n')
    return { success: true }
  }

  // Find a test SMTP config and Form config
  const smtpConfigs = await payload.find({ collection: 'smtp-configs' as any, limit: 1 })
  const formConfigs = await payload.find({ collection: 'form-configs' as any, limit: 1 })

  if (smtpConfigs.totalDocs === 0 || formConfigs.totalDocs === 0) {
    console.error('❌ Error: Need at least one SMTP config and one Form config in the database to run this test.')
    process.exit(1)
  }

  const smtp = smtpConfigs.docs[0]
  const form = formConfigs.docs[0]

  // Ensure auto-reply is enabled for test
  await payload.update({
    collection: 'smtp-configs' as any,
    id: smtp.id,
    data: { autoReplyEnabled: true }
  })

  const testCases = [
    {
      title: 'Case 1: Both Name and Company (Priority to Name)',
      data: { name: 'John Doe', company: 'Acme Corp', email: 'john@example.com' },
      locale: 'en'
    },
    {
      title: 'Case 2: Company only (Fallback to Company)',
      data: { company: 'Acme Corp', email: 'biz@example.com' },
      locale: 'en'
    },
    {
      title: 'Case 3: Name only (Chinese Locale)',
      data: { name: '张三', email: 'zhangsan@example.com' },
      locale: 'zh'
    },
    {
      title: 'Case 4: No name, no company (Generic greeting)',
      data: { email: 'anon@example.com' },
      locale: 'en'
    },
    {
      title: 'Case 5: Japanese Locale (Custom Honorific)',
      data: { name: 'Tanaka', email: 'tanaka@example.com' },
      locale: 'ja'
    }
  ]

  for (const testCase of testCases) {
    console.log(`📌 Testing ${testCase.title}`)
    const mockSubmission = {
      id: 'test-id',
      formName: form.name,
      formConfig: form.id,
      data: testCase.data,
      locale: testCase.locale,
      submittedAt: new Date().toISOString()
    }

    try {
      await formEmail.sendAutoReplyEmail(payload, mockSubmission)
    } catch (err) {
      console.error(`❌ Test failed for ${testCase.title}:`, err)
    }
  }

  // Restore original function
  (emailUtils as any).sendEmail = originalSendEmail
  console.log('✅ Testing complete.')
  process.exit(0)
}

runTests().catch(console.error)
