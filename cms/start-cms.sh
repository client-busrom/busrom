#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/cms
npx prisma migrate deploy --schema=./schema.prisma

echo "Starting Keystone CMS..."
npm start
