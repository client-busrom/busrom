/**
 * Export Form Submissions Page
 *
 * 表单提交导出页面
 *
 * A custom admin page for exporting form submissions to CSV or Excel.
 */

/** @jsxRuntime classic */
/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { jsx, Heading, Box } from '@keystone-ui/core'
import { PageContainer } from '@keystone-6/core/admin-ui/components'
import React, { useState } from 'react'
import { Button } from '@keystone-ui/button'
import { Select, FieldContainer, FieldLabel } from '@keystone-ui/fields'
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'

// GraphQL query to fetch FormConfig list
const GET_FORM_CONFIGS = gql`
  query GetFormConfigs {
    formConfigs {
      id
      name
      displayName
    }
  }
`

// GraphQL query to get submission count
const GET_SUBMISSION_COUNT = gql`
  query GetSubmissionCount(
    $formConfigId: ID
    $status: String
    $startDate: DateTime
    $endDate: DateTime
  ) {
    formSubmissionsCount(
      where: {
        formConfig: { id: { equals: $formConfigId } }
        status: { equals: $status }
        submittedAt: { gte: $startDate, lte: $endDate }
      }
    )
  }
`

export default function ExportFormSubmissionsPage() {
  const [format, setFormat] = useState<'csv' | 'excel'>('excel')
  const [formConfigId, setFormConfigId] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  // Fetch form configs
  const { data: formConfigsData, loading: formConfigsLoading } = useQuery(GET_FORM_CONFIGS)

  /**
   * Handle export button click
   */
  const handleExport = async () => {
    setIsExporting(true)
    setExportMessage(null)

    try {
      // Build request body
      const requestBody: any = {
        format,
      }

      if (formConfigId) {
        requestBody.formConfigId = formConfigId
      }

      if (status) {
        requestBody.status = status
      }

      if (startDate) {
        requestBody.startDate = startDate
      }

      if (endDate) {
        requestBody.endDate = endDate
      }

      // Call export API
      const response = await fetch('/api/export-form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Export failed')
      }

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.${
        format === 'csv' ? 'csv' : 'xlsx'
      }`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setExportMessage({
        type: 'success',
        text: `✅ Successfully exported form submissions as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Export error:', error)
      setExportMessage({
        type: 'error',
        text: `❌ Export failed: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <PageContainer header={<Heading type="h3">📊 Export Form Submissions</Heading>}>
      <Box
        css={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '24px',
        }}
      >
        {/* Export Format */}
        <FieldContainer>
          <FieldLabel>Export Format</FieldLabel>
          <Select
            value={{ label: format.toUpperCase(), value: format }}
            onChange={(newValue) => setFormat(newValue?.value as 'csv' | 'excel')}
            options={[
              { label: 'CSV', value: 'csv' },
              { label: 'Excel (XLSX)', value: 'excel' },
            ]}
          />
        </FieldContainer>

        {/* Form Config Filter */}
        <FieldContainer>
          <FieldLabel>Form (Optional)</FieldLabel>
          <Select
            value={
              formConfigId
                ? formConfigsData?.formConfigs.find((fc: any) => fc.id === formConfigId)
                : null
            }
            onChange={(newValue) => setFormConfigId(newValue?.id || '')}
            options={[
              { label: 'All Forms', value: '', id: '' },
              ...(formConfigsData?.formConfigs || []).map((fc: any) => ({
                label: fc.displayName?.en || fc.name,
                value: fc.id,
                id: fc.id,
              })),
            ]}
            isLoading={formConfigsLoading}
          />
        </FieldContainer>

        {/* Status Filter */}
        <FieldContainer>
          <FieldLabel>Status (Optional)</FieldLabel>
          <Select
            value={status ? { label: status, value: status } : null}
            onChange={(newValue) => setStatus(newValue?.value || '')}
            options={[
              { label: 'All Status', value: '' },
              { label: '📬 Unread', value: 'UNREAD' },
              { label: '✅ Read', value: 'READ' },
              { label: '📁 Archived', value: 'ARCHIVED' },
            ]}
          />
        </FieldContainer>

        {/* Date Range */}
        <Box
          css={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginTop: '16px',
          }}
        >
          <FieldContainer>
            <FieldLabel>Start Date (Optional)</FieldLabel>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              css={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '100%',
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>End Date (Optional)</FieldLabel>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              css={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '100%',
              }}
            />
          </FieldContainer>
        </Box>

        {/* Export Message */}
        {exportMessage && (
          <Box
            css={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '4px',
              backgroundColor:
                exportMessage.type === 'success'
                  ? '#d4edda'
                  : exportMessage.type === 'error'
                  ? '#f8d7da'
                  : '#d1ecf1',
              color:
                exportMessage.type === 'success'
                  ? '#155724'
                  : exportMessage.type === 'error'
                  ? '#721c24'
                  : '#0c5460',
              border: `1px solid ${
                exportMessage.type === 'success'
                  ? '#c3e6cb'
                  : exportMessage.type === 'error'
                  ? '#f5c6cb'
                  : '#bee5eb'
              }`,
            }}
          >
            {exportMessage.text}
          </Box>
        )}

        {/* Export Button */}
        <Box css={{ marginTop: '24px' }}>
          <Button
            size="large"
            tone="active"
            weight="bold"
            onClick={handleExport}
            isLoading={isExporting}
          >
            {isExporting ? 'Exporting...' : `📥 Export as ${format.toUpperCase()}`}
          </Button>
        </Box>

        {/* Instructions */}
        <Box
          css={{
            marginTop: '32px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        >
          <strong>📖 Instructions:</strong>
          <ul css={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Select the export format (CSV or Excel)</li>
            <li>Optionally filter by form, status, or date range</li>
            <li>Click "Export" to download the file</li>
            <li>The exported file will include all form fields and metadata</li>
          </ul>

          <Box css={{ marginTop: '12px' }}>
            <strong>📋 Exported Fields:</strong>
            <ul css={{ marginTop: '4px', paddingLeft: '20px' }}>
              <li>Submission ID, Form Name, Status</li>
              <li>All custom form fields (dynamic based on FormConfig)</li>
              <li>Email Sent, Language, Source Page, IP Address</li>
              <li>Submitted At, Read At, Admin Notes</li>
            </ul>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  )
}
