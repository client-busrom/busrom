#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/cms
npx keystone prisma migrate deploy

echo "Starting Keystone CMS..."
npm start
