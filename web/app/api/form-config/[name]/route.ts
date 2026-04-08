import { NextRequest, NextResponse } from 'next/server'

const CMS_URL = process.env.CMS_URL || 
                (process.env.NEXT_PUBLIC_CMS_URL) || 
                'https://cms.busromhouse.com'

/**
 * GET /api/form-config/[name]
 *
 * Fetch form configuration by name from Payload CMS
 *
 * Query parameters:
 * - locale: string (default: 'en')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'en'
    const { name: formName } = await params

    // Try exact match first, then fallback to contains match
    // This allows compatibility between environments where form names may differ slightly
    // e.g. "main-form" (local) vs "home-page-main-inquiry-form" (production)
    let formConfig: any = null

    // Pass 1: Exact match
    const exactRes = await fetch(
      `${CMS_URL}/api/form-configs?where[name][equals]=${encodeURIComponent(formName)}&where[status][equals]=published&locale=${locale}&depth=1`,
      { next: { revalidate: 60 } }
    )
    if (exactRes.ok) {
      const exactData = await exactRes.json()
      if (exactData?.docs?.length > 0) {
        formConfig = exactData.docs[0]
      }
    }

    // Pass 2: Contains fallback (if exact match fails)
    if (!formConfig) {
      const containsRes = await fetch(
        `${CMS_URL}/api/form-configs?where[name][contains]=${encodeURIComponent(formName)}&where[status][equals]=published&locale=${locale}&depth=1&limit=1`,
        { next: { revalidate: 60 } }
      )
      if (containsRes.ok) {
        const containsData = await containsRes.json()
        if (containsData?.docs?.length > 0) {
          formConfig = containsData.docs[0]
          console.log(`[Form Config API] Fuzzy match: "${formName}" → "${formConfig.name}"`)
        }
      }
    }

    if (!formConfig) {
      return NextResponse.json({ error: 'Form configuration not found' }, { status: 404 })
    }

    // Transform form configuration (Payload CMS returns localized fields directly)
    const transformedConfig = {
      id: formConfig.id,
      name: formConfig.name,  // Always return the REAL name from CMS
      displayName: formConfig.displayName || '',
      description: formConfig.description || '',
      location: formConfig.location,
      fields: formConfig.fields || [],
      submitButtonText: formConfig.submitButtonText || 'Submit',
      submittingText: formConfig.submittingText || 'Submitting...',
      successMessage: formConfig.successMessage || 'Submitted successfully!',
      errorRequiredFields: formConfig.errorRequiredFields || 'Please fill in required fields',
      errorNetworkMessage: formConfig.errorNetworkMessage || 'Network error, please try again',
      errorCaptchaMessage: formConfig.errorCaptchaMessage || 'Please complete the captcha verification',
      // Turnstile captcha settings (per-form overrides)
      captchaEnabled: formConfig.captchaEnabled || false,
      captchaTheme: formConfig.captchaTheme || 'auto',
      captchaSize: formConfig.captchaSize || 'normal',
      // Privacy consent
      privacyConsentText: formConfig.privacyConsentText || '',
    }

    return NextResponse.json(transformedConfig)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
