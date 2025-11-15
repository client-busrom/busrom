/**
 * Export Form Submissions API
 *
 * This endpoint exports form submissions to CSV or Excel format
 *
 * Endpoint: POST /api/export-form-submissions
 *
 * Request Body:
 * {
 *   "format": "csv" | "excel",
 *   "formConfigId": "optional-form-config-id",
 *   "status": "UNREAD" | "READ" | "ARCHIVED" (optional filter),
 *   "startDate": "2024-01-01" (optional),
 *   "endDate": "2024-12-31" (optional)
 * }
 *
 * Response:
 * - Returns file download with appropriate content type
 * - CSV: text/csv
 * - Excel: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 */

import { Request, Response } from 'express'
import * as XLSX from 'xlsx'

interface ExportRequest {
  format: 'csv' | 'excel'
  formConfigId?: string
  status?: 'UNREAD' | 'READ' | 'ARCHIVED'
  startDate?: string
  endDate?: string
}

/**
 * Export Form Submissions Handler
 */
export async function exportFormSubmissionsHandler(req: Request, res: Response) {
  try {
    const context = (req as any).context

    // Check authentication
    if (!context.session?.itemId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check permission
    const { hasPermission } = await import('../lib/permissions')
    const canExport = await hasPermission(
      context.session.itemId,
      'FormSubmission',
      'export',
      context
    )

    if (!canExport) {
      return res.status(403).json({ error: 'Permission denied' })
    }

    // Parse request
    const { format, formConfigId, status, startDate, endDate } = req.body as ExportRequest

    // Validate format
    if (!format || !['csv', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be "csv" or "excel"' })
    }

    console.log(`📊 Exporting form submissions (format: ${format})`)

    // Build query filter
    const where: any = {}

    if (formConfigId) {
      where.formConfig = { id: { equals: formConfigId } }
    }

    if (status) {
      where.status = { equals: status }
    }

    if (startDate || endDate) {
      where.submittedAt = {}
      if (startDate) {
        where.submittedAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.submittedAt.lte = new Date(endDate)
      }
    }

    // Fetch submissions
    const submissions = await context.sudo().query.FormSubmission.findMany({
      where,
      query: `
        id
        formName
        data
        status
        autoSubmitted
        locale
        sourcePage
        ipAddress
        userAgent
        adminNotes
        emailSent
        submittedAt
        readAt
        updatedAt
        formConfig {
          id
          name
        }
      `,
      orderBy: { submittedAt: 'desc' },
    })

    if (submissions.length === 0) {
      return res.status(404).json({ error: 'No submissions found' })
    }

    console.log(`✓ Found ${submissions.length} submissions`)

    // Transform data for export
    const exportData = submissions.map((submission: any) => {
      // Flatten the data object
      const flatData: any = {
        'Submission ID': submission.id,
        'Form Name': submission.formName || 'N/A',
        'Status': submission.status || 'N/A',
        'Submission Type': submission.autoSubmitted === 'AUTO' ? 'Auto' : 'Manual',
        'Email Sent': submission.emailSent ? 'Yes' : 'No',
        'Language': submission.locale || 'N/A',
        'Source Page': submission.sourcePage || 'N/A',
        'IP Address': submission.ipAddress || 'N/A',
        'Submitted At': submission.submittedAt
          ? new Date(submission.submittedAt).toLocaleString()
          : 'N/A',
        'Read At': submission.readAt ? new Date(submission.readAt).toLocaleString() : 'N/A',
        'Admin Notes': submission.adminNotes || '',
      }

      // Add form fields
      if (submission.data && typeof submission.data === 'object') {
        Object.entries(submission.data).forEach(([key, value]) => {
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
    const wscols = Object.keys(exportData[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...exportData.map((row: any) => String(row[key] || '').length)
      )
      return { wch: Math.min(maxLength + 2, maxWidth) }
    })
    worksheet['!cols'] = wscols

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const formNameSlug = formConfigId
      ? submissions[0]?.formName?.toLowerCase().replace(/\s+/g, '-') || 'form'
      : 'all-forms'
    const filename = `form-submissions-${formNameSlug}-${timestamp}`

    if (format === 'csv') {
      // Export as CSV
      const csv = XLSX.utils.sheet_to_csv(worksheet)

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`)
      res.send('\uFEFF' + csv) // Add BOM for UTF-8 Excel compatibility
    } else {
      // Export as Excel
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Submissions')

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`)
      res.send(excelBuffer)
    }

    console.log(`✅ Exported ${submissions.length} submissions as ${format.toUpperCase()}`)
  } catch (error) {
    console.error('❌ Error exporting form submissions:', error)
    res.status(500).json({
      error: 'Failed to export form submissions',
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
