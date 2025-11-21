/**
 * TempFileUpload Model - Temporary File Upload Tracking
 *
 * 用途: 跟踪所有上传的文件，用于清理未使用的孤儿文件
 *
 * Features:
 * - Track all file uploads (before form submission)
 * - Identify orphan files (uploaded but never submitted)
 * - Automatic cleanup of old orphan files
 */

import { list } from '@keystone-6/core'
import { text, timestamp, integer, select } from '@keystone-6/core/fields'

export const TempFileUpload = list({
  fields: {
    /**
     * File URL in S3
     */
    fileUrl: text({
      label: 'File URL',
      validation: { isRequired: true },
      isIndexed: true,
    }),

    /**
     * File name
     */
    fileName: text({
      label: 'File Name',
      validation: { isRequired: true },
    }),

    /**
     * File size in bytes
     */
    fileSize: integer({
      label: 'File Size (bytes)',
      validation: { isRequired: true },
    }),

    /**
     * File type (MIME type)
     */
    fileType: text({
      label: 'File Type',
    }),

    /**
     * Form Config ID (if known)
     */
    formConfigId: text({
      label: 'Form Config ID',
    }),

    /**
     * Field name
     */
    fieldName: text({
      label: 'Field Name',
    }),

    /**
     * Uploader IP address
     */
    ipAddress: text({
      label: 'IP Address',
      isIndexed: true,
    }),

    /**
     * Status
     * - PENDING: File uploaded, waiting for form submission
     * - USED: File used in a form submission
     * - ORPHAN: File uploaded but form never submitted (marked for deletion)
     */
    status: select({
      type: 'string',
      options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Used', value: 'USED' },
        { label: 'Orphan', value: 'ORPHAN' },
      ],
      defaultValue: 'PENDING',
      validation: { isRequired: true },
      ui: {
        displayMode: 'segmented-control',
      },
    }),

    /**
     * Upload timestamp
     */
    uploadedAt: timestamp({
      label: 'Uploaded At',
      defaultValue: { kind: 'now' },
    }),

    /**
     * When marked as used (form submitted)
     */
    usedAt: timestamp({
      label: 'Used At',
    }),

    /**
     * When marked as orphan
     */
    orphanedAt: timestamp({
      label: 'Orphaned At',
    }),
  },

  /**
   * Access Control
   */
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: () => true, // Allow public creation (when uploading)
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session,
    },
  },

  /**
   * UI Configuration
   */
  ui: {
    labelField: 'fileName',
    listView: {
      initialColumns: ['fileName', 'status', 'fileSize', 'ipAddress', 'uploadedAt'],
      initialSort: { field: 'uploadedAt', direction: 'DESC' },
    },
    label: 'Temp File Uploads',
    singular: 'Temp File Upload',
    plural: 'Temp File Uploads',
    description: '临时文件上传记录 - 用于跟踪和清理未使用的文件',
  },

  /**
   * Hooks
   */
  hooks: {
    // Automatic cleanup of old orphan files
    resolveInput: async ({ operation, resolvedData, context }) => {
      if (operation === 'create') {
        // Check for old orphan files (older than 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const orphanFiles = await context.query.TempFileUpload.findMany({
          where: {
            status: { equals: 'PENDING' },
            uploadedAt: { lt: oneDayAgo },
          },
          query: 'id fileUrl fileName',
        })

        if (orphanFiles.length > 0) {
          console.log(`🧹 Found ${orphanFiles.length} orphan files older than 24 hours`)

          // Mark as orphan (will be cleaned up by cron job)
          for (const file of orphanFiles) {
            await context.query.TempFileUpload.updateOne({
              where: { id: file.id },
              data: {
                status: 'ORPHAN',
                orphanedAt: new Date(),
              },
            })
          }
        }
      }

      return resolvedData
    },
  },
})
