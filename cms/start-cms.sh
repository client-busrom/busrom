#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/cms

# Create prisma directory and link migrations if they exist
if [ -d "migrations" ] && [ ! -d "prisma/migrations" ]; then
  mkdir -p prisma
  ln -s ../migrations prisma/migrations
  echo "Created symlink: prisma/migrations -> ../migrations"
fi

npx keystone prisma migrate deploy

echo "Starting Keystone CMS..."
npm start
