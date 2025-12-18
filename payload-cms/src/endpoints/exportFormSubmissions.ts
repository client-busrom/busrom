/**
 * Export Form Submissions Endpoint
 *
 * POST /api/export-form-submissions
 *
 * Request Body:
 * {
 *   "format": "csv" | "excel",
 *   "formConfigId": "optional-form-config-id",
 *   "status": "UNREAD" | "READ" | "ARCHIVED" (optional),
 *   "startDate": "2024-01-01" (optional),
 *   "endDate": "2024-12-31" (optional)
 * }
 */

import type { PayloadHandler } from 'payload'
import * as XLSX from 'xlsx'

interface ExportRequest {
  format: 'csv' | 'excel'
  formConfigId?: string
  status?: 'UNREAD' | 'READ' | 'ARCHIVED'
  startDate?: string
  endDate?: string
}

export const exportFormSubmissionsHandler: PayloadHandler = async (req) => {
  const { payload, user } = req

  // Check authentication
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Check permission (admin only)
  if (!user.isAdmin) {
    return Response.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    // Parse request body
    const body = (await req.json?.()) as ExportRequest | undefined

    if (!body) {
      return Response.json({ error: 'Request body is required' }, { status: 400 })
    }

    const { format, formConfigId, status, startDate, endDate } = body

    // Validate format
    if (!format || !['csv', 'excel'].includes(format)) {
      return Response.json(
        { error: 'Invalid format. Must be "csv" or "excel"' },
        { status: 400 }
      )
    }

    payload.logger.info(`Exporting form submissions (format: ${format})`)

    // Build query filter
    const where: Record<string, unknown> = {}

    if (formConfigId) {
      where.formConfig = { equals: formConfigId }
    }

    if (status) {
      where.status = { equals: status }
    }

    if (startDate || endDate) {
      where.submittedAt = {}
      if (startDate) {
        ;(where.submittedAt as Record<string, unknown>).greater_than_equal = new Date(startDate)
      }
      if (endDate) {
        ;(where.submittedAt as Record<string, unknown>).less_than_equal = new Date(endDate)
      }
    }

    // Fetch submissions
    const submissions = await payload.find({
      collection: 'form-submissions',
      where: where as any,
      sort: '-submittedAt',
      limit: 10000, // Max export limit
      depth: 1,
    })

    if (submissions.docs.length === 0) {
      return Response.json({ error: 'No submissions found' }, { status: 404 })
    }

    payload.logger.info(`Found ${submissions.docs.length} submissions`)

    // Transform data for export
    const exportData = submissions.docs.map((submission) => {
      const flatData: Record<string, unknown> = {
        'Submission ID': submission.id,
        'Form Name': submission.formName || 'N/A',
        Status: submission.status || 'N/A',
        'Submission Type': submission.submissionType === 'AUTO' ? 'Auto' : 'Manual',
        'Email Sent': submission.emailSent ? 'Yes' : 'No',
        Language: submission.locale || 'N/A',
        'Source Page': submission.sourcePage || 'N/A',
        'IP Address': submission.ipAddress || 'N/A',
        'Submitted At': submission.submittedAt
          ? new Date(submission.submittedAt).toLocaleString()
          : 'N/A',
        'Read At': submission.readAt ? new Date(submission.readAt).toLocaleString() : 'N/A',
        'Admin Notes': submission.adminNotes || '',
      }

      // Add form fields from data JSON
      const formData = submission.data as Record<string, unknown> | null
      if (formData && typeof formData === 'object') {
        Object.entries(formData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            flatData[key] = value.join(', ')
          } else if (typeof value === 'object' && value !== null) {
            flatData[key] = JSON.stringify(value)
          } else {
            flatData[key] = value || ''
          }
        })
      }

      return flatData
    })

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Auto-size columns
    const maxWidth = 50
    const firstRow = exportData[0] || {}
    const wscols = Object.keys(firstRow).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...exportData.map((row) => String(row[key] || '').length)
      )
      return { wch: Math.min(maxLength + 2, maxWidth) }
    })
    worksheet['!cols'] = wscols

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const formNameSlug = formConfigId
      ? (submissions.docs[0]?.formName as string)?.toLowerCase().replace(/\s+/g, '-') || 'form'
      : 'all-forms'
    const filename = `form-submissions-${formNameSlug}-${timestamp}`

    if (format === 'csv') {
      // Export as CSV
      const csv = XLSX.utils.sheet_to_csv(worksheet)
      const csvWithBom = '\uFEFF' + csv // Add BOM for UTF-8 Excel compatibility

      return new Response(csvWithBom, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      })
    } else {
      // Export as Excel
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Submissions')

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new Response(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      })
    }
  } catch (error: any) {
    payload.logger.error('Error exporting form submissions:', error?.message || error)
    return Response.json(
      {
        error: 'Failed to export form submissions',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
