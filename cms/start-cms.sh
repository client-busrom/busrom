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

echo "=== ABOUT TO RUN MIGRATIONS ==="
npx keystone prisma migrate deploy
echo "=== MIGRATIONS COMPLETED ==="

echo "=== CHECKING ENVIRONMENT ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Checking node_modules: $(ls node_modules | wc -l) packages"
echo "Checking .keystone: $(ls -la .keystone 2>/dev/null | head -3 || echo 'not found')"

echo "=== STARTING KEYSTONE CMS ==="
exec npm start
