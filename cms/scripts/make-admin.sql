-- Make User Super Admin
-- Replace 'admin@busrom.com' with your actual email

UPDATE "User"
SET
  "isAdmin" = true,
  "status" = 'ACTIVE'
WHERE
  email = 'admin@busrom.com';

-- Verify the change
SELECT
  id,
  name,
  email,
  "isAdmin",
  status
FROM "User"
WHERE email = 'admin@busrom.com';
