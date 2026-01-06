-- Pre-deployment cleanup script
-- Run this before deploying the version that removes ActivityLogs
-- 在部署删除 ActivityLogs 的版本之前运行此脚本

-- 1. Drop activity_logs_id column from payload_locked_documents_rels (if exists)
ALTER TABLE payload_locked_documents_rels DROP COLUMN IF EXISTS activity_logs_id;

-- 2. Drop activity_logs table and related tables (if exists)
DROP TABLE IF EXISTS activity_logs CASCADE;

-- 3. Drop any activity_logs related indexes (if exists)
DROP INDEX IF EXISTS activity_logs_created_at_idx;
DROP INDEX IF EXISTS activity_logs_updated_at_idx;

-- Done!
-- 完成！
