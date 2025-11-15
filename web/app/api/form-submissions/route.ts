import { NextRequest, NextResponse } from 'next/server'
import { keystoneClient } from '@/lib/keystone-client'
import { gql } from '@apollo/client'

// GraphQL Mutation - Create Form Submission (with formConfig)
const CREATE_FORM_SUBMISSION_WITH_CONFIG = gql`
  mutation CreateFormSubmissionWithConfig(
    $formId: ID!
    $formName: String
    $data: JSON!
    $locale: String
    $sourcePage: String
    $ipAddress: String
    $userAgent: String
    $autoSubmitted: FormSubmissionAutoSubmittedType
  ) {
    createFormSubmission(
      data: {
        formConfig: { connect: { id: $formId } }
        formName: $formName
        data: $data
        locale: $locale
        sourcePage: $sourcePage
        ipAddress: $ipAddress
        userAgent: $userAgent
        autoSubmitted: $autoSubmitted
        status: UNREAD
      }
    ) {
      id
      formName
      status
      submittedAt
    }
  }
`

// GraphQL Mutation - Create Form Submission (without formConfig)
const CREATE_FORM_SUBMISSION_WITHOUT_CONFIG = gql`
  mutation CreateFormSubmissionWithoutConfig(
    $formName: String!
    $data: JSON!
    $locale: String
    $sourcePage: String
    $ipAddress: String
    $userAgent: String
    $autoSubmitted: FormSubmissionAutoSubmittedType
  ) {
    createFormSubmission(
      data: {
        formName: $formName
        data: $data
        locale: $locale
        sourcePage: $sourcePage
        ipAddress: $ipAddress
        userAgent: $userAgent
        autoSubmitted: $autoSubmitted
        status: UNREAD
      }
    ) {
      id
      formName
      status
      submittedAt
    }
  }
`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      formId,
      formName,
      data,
      locale,
      autoSubmitted = false,
    } = body

    // 验证必需字段
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      )
    }

    // 获取请求元数据
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || 'unknown'

    // 执行 GraphQL Mutation - 根据是否有 formId 选择不同的 mutation
    const mutation = formId ? CREATE_FORM_SUBMISSION_WITH_CONFIG : CREATE_FORM_SUBMISSION_WITHOUT_CONFIG

    const variables: any = {
      formName: formName || 'Unknown Form',
      data,
      locale: locale || 'en',
      sourcePage: referer,
      ipAddress,
      userAgent,
      autoSubmitted: autoSubmitted ? 'AUTO' : 'MANUAL',
    }

    // 只有当 formId 存在时才添加
    if (formId) {
      variables.formId = formId
    }

    const { data: result, errors } = await keystoneClient.mutate({
      mutation,
      variables,
    })

    if (errors) {
      console.error('❌ GraphQL errors:', JSON.stringify(errors, null, 2))
      return NextResponse.json(
        { error: 'Failed to submit form', details: errors },
        { status: 500 }
      )
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      submission: result.createFormSubmission,
    })
  } catch (error) {
    console.error('💥 Form submission API error:', error)

    // 如果是 ApolloError,提取更详细的信息
    if (error && typeof error === 'object' && 'networkError' in error) {
      const networkError = (error as any).networkError
      if (networkError && networkError.result && networkError.result.errors) {
        console.error('📝 Detailed GraphQL errors:', JSON.stringify(networkError.result.errors, null, 2))
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
