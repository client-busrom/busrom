-- AddColumn: User.backupCodes
-- Add backupCodes column for two-factor authentication backup codes
ALTER TABLE "User" ADD COLUMN "backupCodes" JSONB DEFAULT '[]';
