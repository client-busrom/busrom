#!/bin/sh
set -e

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

npx keystone prisma migrate deploy

echo "Starting Keystone CMS..."
npm start
