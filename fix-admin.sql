-- 修复初始用户的管理员状态
-- Fix initial user admin status

UPDATE "User" 
SET "isAdmin" = true, 
    status = 'ACTIVE' 
WHERE email = 'ljasperp@gmail.com';

-- 验证更新结果
-- Verify the update
SELECT id, name, email, "isAdmin", status, "createdAt"
FROM "User" 
WHERE email = 'ljasperp@gmail.com';
