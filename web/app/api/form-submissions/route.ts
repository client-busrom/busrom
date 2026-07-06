import { NextRequest, NextResponse } from 'next/server'

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.busromhouse.com'

/**
 * Parse User-Agent string to extract device type, browser, and OS.
 */
function parseUserAgent(ua: string): { deviceType: string; browser: string; os: string } {
  const lower = ua.toLowerCase()
  
  // Device type
  let deviceType = 'desktop'
  if (/mobile|android.*mobile|iphone|ipod/.test(lower)) deviceType = 'mobile'
  else if (/ipad|tablet|kindle|playbook|silk/.test(lower)) deviceType = 'tablet'

  // Browser
  let browser = 'Unknown'
  if (/edg\//.test(lower)) browser = 'Edge'
  else if (/opr\//.test(lower)) browser = 'Opera'
  else if (/chrome/.test(lower) && !/edg/.test(lower)) browser = 'Chrome'
  else if (/safari/.test(lower) && !/chrome/.test(lower)) browser = 'Safari'
  else if (/firefox/.test(lower)) browser = 'Firefox'
  else if (/msie|trident/.test(lower)) browser = 'IE'

  // OS
  let os = 'Unknown'
  if (/windows/.test(lower)) os = 'Windows'
  else if (/mac os|macintosh/.test(lower)) os = 'macOS'
  else if (/android/.test(lower)) os = 'Android'
  else if (/iphone|ipad|ipod/.test(lower)) os = 'iOS'
  else if (/linux/.test(lower)) os = 'Linux'

  return { deviceType, browser, os }
}

// In-memory rate limit store (for serverless, consider using Redis)
const rateLimitStore = new Map<string, { count: number; lastSubmit: number; hourStart: number }>()

// Clean up old entries lazily (on each request) instead of using setInterval
// This avoids memory leaks in serverless environments
function cleanupOldEntries() {
  const now = Date.now()
  const oneHourAgo = now - 60 * 60 * 1000
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.hourStart < oneHourAgo) {
      rateLimitStore.delete(key)
    }
  }
}

// Get Turnstile secret key from SiteConfig
async function getTurnstileSecretKey(): Promise<string | null> {
  try {
    const response = await fetch(`${CMS_URL}/api/globals/site-config`, {
      next: { revalidate: 300 },
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.turnstileSecretKey || null
  } catch {
    return null
  }
}

// Verify Turnstile token with Cloudflare
async function verifyTurnstile(token: string, secretKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        // remoteip would be good but not strictly required
      }),
    })
    const result = await response.json()
    return result.success === true
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}

// Rate limit configuration from form config
interface RateLimitConfig {
  enabled: boolean
  perIP: number      // max per IP per hour
  perDay: number     // max total per day
  minInterval: number // min seconds between submissions
}

// Check rate limits
async function checkRateLimit(
  formId: string | number,
  formName: string,
  ip: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; reason?: string }> {
  if (!config.enabled) {
    return { allowed: true }
  }

  const now = Date.now()
  const key = `${formName}:${ip}`
  const record = rateLimitStore.get(key)

  // Check minimum interval
  if (record && config.minInterval > 0) {
    const timeSinceLastSubmit = (now - record.lastSubmit) / 1000
    if (timeSinceLastSubmit < config.minInterval) {
      const waitTime = Math.ceil(config.minInterval - timeSinceLastSubmit)
      return {
        allowed: false,
        reason: `Please wait ${waitTime} seconds before submitting again`,
      }
    }
  }

  // Check per-IP hourly limit
  if (record && config.perIP > 0) {
    const hourAgo = now - 60 * 60 * 1000
    if (record.hourStart > hourAgo && record.count >= config.perIP) {
      return {
        allowed: false,
        reason: `Maximum ${config.perIP} submissions per hour exceeded`,
      }
    }
  }

  // Check daily total limit (query database)
  if (config.perDay > 0) {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      const countRes = await fetch(
        `${CMS_URL}/api/form-submissions?where[formName][equals]=${encodeURIComponent(formName)}&where[submittedAt][greater_than_equal]=${encodeURIComponent(todayISO)}&limit=0`,
        {
          headers: {
            'x-internal-token': process.env.REVALIDATE_SECRET || '',
          }
        }
      )

      if (countRes.ok) {
        const countData = await countRes.json()
        if (countData.totalDocs >= config.perDay) {
          return {
            allowed: false,
            reason: `This form has reached its daily submission limit`,
          }
        }
      }
    } catch (error) {
      console.error('Error checking daily limit:', error)
      // Allow submission if we can't check (fail open for UX)
    }
  }

  return { allowed: true }
}

// Update rate limit record after successful submission
function updateRateLimitRecord(formName: string, ip: string) {
  const now = Date.now()
  const key = `${formName}:${ip}`
  const record = rateLimitStore.get(key)
  const hourAgo = now - 60 * 60 * 1000

  if (record && record.hourStart > hourAgo) {
    // Update existing record
    rateLimitStore.set(key, {
      count: record.count + 1,
      lastSubmit: now,
      hourStart: record.hourStart,
    })
  } else {
    // Create new record
    rateLimitStore.set(key, {
      count: 1,
      lastSubmit: now,
      hourStart: now,
    })
  }
}

export async function POST(request: NextRequest) {
  // Clean up old rate limit entries on each request (lazy cleanup)
  cleanupOldEntries()

  try {
    const body = await request.json()
    const {
      formId,
      formName,
      data,
      attachments = [],
      locale,
      autoSubmitted = false,
      turnstileToken,
      userLocalTime,
      sourcePage: bodySourcePage,
    } = body

    console.log('[Form Submission API] Received submission:', {
      formId,
      formName,
      locale,
      dataKeys: Object.keys(data || {}),
      hasTurnstileToken: !!turnstileToken,
      userLocalTime,
    })

    // Validate required fields
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      )
    }

    // Verify Turnstile captcha if token is provided
    if (turnstileToken) {
      const secretKey = await getTurnstileSecretKey()
      if (secretKey) {
        const isValid = await verifyTurnstile(turnstileToken, secretKey)
        if (!isValid) {
          return NextResponse.json(
            { error: 'Captcha verification failed' },
            { status: 400 }
          )
        }
        console.log('[Form Submission API] Turnstile verification passed')
      } else {
        console.warn('[Form Submission API] Turnstile secret key not configured in SiteConfig')
      }
    }

    // Get IP address for rate limiting
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Get form config for rate limit settings
    let rateLimitConfig: RateLimitConfig = {
      enabled: true,
      perIP: 5,
      perDay: 100,
      minInterval: 30,
    }

    // Try to get form config with rate limit settings
    let formConfigId: number | null = null
    if (formId) {
      formConfigId = typeof formId === 'string' ? parseInt(formId, 10) : formId
    } else if (formName) {
      try {
        const formConfigRes = await fetch(
          `${CMS_URL}/api/form-configs?where[name][equals]=${encodeURIComponent(formName)}&limit=1`
        )
        if (formConfigRes.ok) {
          const formConfigData = await formConfigRes.json()
          if (formConfigData.docs && formConfigData.docs.length > 0) {
            const config = formConfigData.docs[0]
            formConfigId = config.id

            // Extract rate limit settings from form config
            rateLimitConfig = {
              enabled: config.rateLimitEnabled !== false, // default true
              perIP: config.rateLimitPerIP ?? 5,
              perDay: config.rateLimitPerDay ?? 100,
              minInterval: config.minSubmitInterval ?? 30,
            }
            console.log('[Form Submission API] Rate limit config:', rateLimitConfig)
          }
        }
      } catch (err) {
        console.warn('[Form Submission API] Could not fetch form config:', err)
      }
    }

    // Check rate limits
    const rateLimitCheck = await checkRateLimit(
      formConfigId || formName || 'unknown',
      formName || 'unknown',
      ipAddress,
      rateLimitConfig
    )

    if (!rateLimitCheck.allowed) {
      console.log('[Form Submission API] Rate limit exceeded:', rateLimitCheck.reason)
      return NextResponse.json(
        { error: rateLimitCheck.reason || 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Calculate total attachment size
    const totalAttachmentSize = Array.isArray(attachments)
      ? attachments.reduce((sum: number, file: any) => sum + (file.fileSize || 0), 0)
      : 0

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || 'unknown'
    const deviceInfo = parseUserAgent(userAgent)

    // Prepare submission data for Payload CMS
    const submissionData: any = {
      formName: formName || 'Unknown Form',
      data,
      locale: locale || 'en',
      sourcePage: bodySourcePage || referer,
      userLocalTime: userLocalTime || '',
      ipAddress,
      userAgent,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      submissionType: autoSubmitted ? 'AUTO' : 'MANUAL',
      status: 'UNREAD',
    }

    // Add formConfig relationship (already looked up during rate limit check)
    if (formConfigId) {
      submissionData.formConfig = formConfigId
      console.log('[Form Submission API] Using formConfig:', formConfigId)
    }

    // Add attachments if present
    if (Array.isArray(attachments) && attachments.length > 0) {
      submissionData.attachments = attachments
      submissionData.totalAttachmentSize = totalAttachmentSize
    }

    console.log('[Form Submission API] Submitting to Payload:', CMS_URL + '/api/form-submissions')

    // Submit to Payload CMS REST API
    const response = await fetch(`${CMS_URL}/api/form-submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Form Submission API] Payload CMS error:', response.status, errorData)
      return NextResponse.json(
        { error: 'Failed to submit form to CMS', details: errorData },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('[Form Submission API] Submission successful:', result.id)

    // Update rate limit record after successful submission
    updateRateLimitRecord(formName || 'unknown', ipAddress)

    // Mark uploaded files as used if present
    if (Array.isArray(attachments) && attachments.length > 0) {
      try {
        for (const attachment of attachments) {
          // Find and update temp file upload record
          const findResponse = await fetch(`${CMS_URL}/api/temp-file-uploads?where[fileUrl][equals]=${encodeURIComponent(attachment.fileUrl)}`)
          const findData = await findResponse.json()

          if (findData.docs && findData.docs.length > 0) {
            const tempFileId = findData.docs[0].id
            // Mark as USED
            await fetch(`${CMS_URL}/api/temp-file-uploads/${tempFileId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'used',
                usedAt: new Date().toISOString(),
              }),
            })
            console.log(`✅ Marked file as USED: ${attachment.fileName}`)
          }
        }
      } catch (error) {
        console.error('⚠️ Failed to mark files as used:', error)
        // Don't fail the submission if marking fails
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      submission: result,
    })
  } catch (error) {
    console.error('💥 Form submission API error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
