-- AlterTable: Add direct upload fields to Media
-- These fields are used for files uploaded via presigned URL (direct S3 upload)
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "fileUrl" TEXT;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "fileKey" TEXT;

-- Comments for documentation
COMMENT ON COLUMN "Media"."fileUrl" IS 'CDN URL for files uploaded via presigned URL (direct S3 upload)';
COMMENT ON COLUMN "Media"."fileKey" IS 'S3 object key for files uploaded via presigned URL';
