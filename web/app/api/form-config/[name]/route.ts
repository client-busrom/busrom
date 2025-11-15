import { NextRequest, NextResponse } from 'next/server'
import { keystoneClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'

// GraphQL query to get form configuration
const GET_FORM_CONFIG = gql`
  query GetFormConfig($name: String!) {
    formConfigs(where: { name: { equals: $name }, status: { equals: "PUBLISHED" } }) {
      id
      name
      displayName
      description
      location
      fields
      submitButtonText
      successMessage
      errorMessage
      enableCaptcha
      maxSubmissionsPerDay
    }
  }
`

/**
 * GET /api/form-config/[name]
 *
 * Fetch form configuration by name
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

    // Execute GraphQL query
    const { data, error } = await keystoneClient.query({
      query: GET_FORM_CONFIG,
      variables: {
        name: formName,
      },
    })

    if (error) {
      console.error('GraphQL Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch form configuration' },
        { status: 500 }
      )
    }

    const formConfigs = data?.formConfigs || []

    if (formConfigs.length === 0) {
      return NextResponse.json({ error: 'Form configuration not found' }, { status: 404 })
    }

    const formConfig = formConfigs[0]

    // Extract localized content
    const extractLocalizedText = (jsonField: any): string => {
      if (!jsonField) return ''
      if (typeof jsonField === 'string') {
        try {
          jsonField = JSON.parse(jsonField)
        } catch {
          return jsonField
        }
      }
      return jsonField[locale] || jsonField['en'] || ''
    }

    // Extract localized fields array
    const extractLocalizedFields = (fieldsJson: any): any[] => {
      if (!fieldsJson) return []
      if (typeof fieldsJson === 'string') {
        try {
          fieldsJson = JSON.parse(fieldsJson)
        } catch {
          return []
        }
      }
      return fieldsJson[locale] || fieldsJson['en'] || []
    }

    // Transform form configuration
    const transformedConfig = {
      id: formConfig.id,
      name: formConfig.name,
      displayName: extractLocalizedText(formConfig.displayName),
      description: extractLocalizedText(formConfig.description),
      location: formConfig.location,
      fields: extractLocalizedFields(formConfig.fields),
      submitButtonText: extractLocalizedText(formConfig.submitButtonText),
      successMessage: extractLocalizedText(formConfig.successMessage),
      errorMessage: extractLocalizedText(formConfig.errorMessage),
      enableCaptcha: formConfig.enableCaptcha,
      maxSubmissionsPerDay: formConfig.maxSubmissionsPerDay,
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
