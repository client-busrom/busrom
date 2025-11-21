#!/bin/sh
set -e

# Unbuffer stdout/stderr for immediate logging
exec 2>&1

echo "=== START SCRIPT EXECUTION ==="
echo "Running database migrations..."
cd /app/cms

# Debug: Check what exists
echo "=== DEBUG: Checking directories ==="
ls -la | grep -E "migrations|prisma" || echo "No migrations or prisma directories found"
if [ -d "migrations" ]; then
  echo "✓ migrations directory exists"
  ls migrations/ | head -5
else
  echo "✗ migrations directory NOT found!"
fi

# Create prisma directory and link migrations if they exist
if [ -d "migrations" ] && [ ! -d "prisma/migrations" ]; then
  mkdir -p prisma
  ln -s ../migrations prisma/migrations
  echo "✓ Created symlink: prisma/migrations -> ../migrations"
fi

echo "=== FIXING FAILED MIGRATIONS (IF ANY) ==="
# Mark the known failed migration as resolved (the schema changes were already applied)
npx prisma migrate resolve --applied 20251121220000_add_footer_navigation_menus --schema=./schema.prisma 2>&1 | grep -v "P3009\|migration issues" || echo "⚠️ No failed migrations to resolve"

echo "=== ABOUT TO RUN DATABASE MIGRATIONS ==="
# Run migrations in production (safe, no data loss)
# This applies all pending migrations from the migrations/ directory
npx prisma migrate deploy --schema=./schema.prisma
echo "=== DATABASE MIGRATIONS COMPLETED ==="

echo "=== CHECKING ENVIRONMENT ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Checking node_modules: $(ls node_modules | wc -l) packages"
echo "Checking .keystone: $(ls -la .keystone 2>/dev/null | head -3 || echo 'not found')"

echo "=== STARTING KEYSTONE CMS ==="
exec npm start
