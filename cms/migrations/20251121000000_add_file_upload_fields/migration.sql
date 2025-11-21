-- AlterTable: Add file upload limit fields to FormConfig
ALTER TABLE "FormConfig" ADD COLUMN IF NOT EXISTS "maxTotalFileSize" INTEGER DEFAULT 10;
ALTER TABLE "FormConfig" ADD COLUMN IF NOT EXISTS "maxFilesPerSubmission" INTEGER DEFAULT 3;
ALTER TABLE "FormConfig" ADD COLUMN IF NOT EXISTS "maxFileUploadsPerDay" INTEGER DEFAULT 10;

-- AlterTable: Add attachment fields to FormSubmission
ALTER TABLE "FormSubmission" ADD COLUMN IF NOT EXISTS "attachments" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "FormSubmission" ADD COLUMN IF NOT EXISTS "totalAttachmentSize" INTEGER DEFAULT 0;

-- Comments for documentation
COMMENT ON COLUMN "FormConfig"."maxTotalFileSize" IS 'Maximum total file size per submission (MB), 0 = unlimited';
COMMENT ON COLUMN "FormConfig"."maxFilesPerSubmission" IS 'Maximum number of files per submission, 0 = unlimited';
COMMENT ON COLUMN "FormConfig"."maxFileUploadsPerDay" IS 'Maximum file uploads per day per IP, 0 = unlimited';
COMMENT ON COLUMN "FormSubmission"."attachments" IS 'JSON array of uploaded file metadata';
COMMENT ON COLUMN "FormSubmission"."totalAttachmentSize" IS 'Total size of all attachments in bytes';
