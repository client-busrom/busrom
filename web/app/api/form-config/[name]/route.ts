import { NextRequest, NextResponse } from 'next/server'

const CMS_URL = process.env.CMS_URL ||
  (process.env.CMS_GRAPHQL_URL ? process.env.CMS_GRAPHQL_URL.replace('/api/graphql', '') : 'http://localhost:3002')

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

    // Fetch from Payload CMS REST API
    const response = await fetch(
      `${CMS_URL}/api/form-configs?where[name][equals]=${encodeURIComponent(formName)}&where[status][equals]=published&locale=${locale}&depth=1`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      console.error('Payload CMS Error:', response.status)
      return NextResponse.json(
        { error: 'Failed to fetch form configuration' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const formConfigs = data?.docs || []

    if (formConfigs.length === 0) {
      return NextResponse.json({ error: 'Form configuration not found' }, { status: 404 })
    }

    const formConfig = formConfigs[0]

    // Transform form configuration (Payload CMS returns localized fields directly)
    const transformedConfig = {
      id: formConfig.id,
      name: formConfig.name,
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
