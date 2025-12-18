import { NextRequest, NextResponse } from 'next/server'

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3002'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      formId,
      formName,
      data,
      attachments = [],
      locale,
      autoSubmitted = false,
    } = body

    console.log('[Form Submission API] Received submission:', {
      formId,
      formName,
      locale,
      dataKeys: Object.keys(data || {}),
    })

    // Validate required fields
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      )
    }

    // Calculate total attachment size
    const totalAttachmentSize = Array.isArray(attachments)
      ? attachments.reduce((sum: number, file: any) => sum + (file.fileSize || 0), 0)
      : 0

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || 'unknown'

    // Prepare submission data for Payload CMS
    const submissionData: any = {
      formName: formName || 'Unknown Form',
      data,
      locale: locale || 'en',
      sourcePage: referer,
      ipAddress,
      userAgent,
      submissionType: autoSubmitted ? 'AUTO' : 'MANUAL',
      status: 'UNREAD',
    }

    // Add formConfig relationship if formId exists
    if (formId) {
      // Convert to number if it's a string
      submissionData.formConfig = typeof formId === 'string' ? parseInt(formId, 10) : formId
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
