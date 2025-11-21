-- CreateTable
CREATE TABLE IF NOT EXISTS "TempFileUpload" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT,
    "formConfigId" TEXT,
    "fieldName" TEXT,
    "ipAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "orphanedAt" TIMESTAMP(3),

    CONSTRAINT "TempFileUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TempFileUpload_fileUrl_idx" ON "TempFileUpload"("fileUrl");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TempFileUpload_ipAddress_idx" ON "TempFileUpload"("ipAddress");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TempFileUpload_status_idx" ON "TempFileUpload"("status");
