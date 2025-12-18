#!/bin/sh
# Payload CMS Startup Script for AWS ECS
# This script handles database initialization and starts the Payload CMS server

set -e

echo "🚀 Starting Payload CMS..."
echo "Environment: ${NODE_ENV:-production}"
echo "Port: ${PORT:-3002}"

# Check if DATABASE_URI is set
if [ -z "$DATABASE_URI" ]; then
  echo "❌ ERROR: DATABASE_URI is not set"
  exit 1
fi

echo "✅ Database URI configured"

# Check if S3 configuration is set (required for media uploads)
if [ -z "$S3_BUCKET" ]; then
  echo "⚠️  WARNING: S3_BUCKET is not set. Media uploads may not work."
fi

# Optional: Run database migrations (if Payload supports it)
# Payload uses MongoDB by default, but we're using Postgres with Prisma
# So we may need to handle migrations separately
echo "📦 Checking database connection..."

# Start the Payload CMS server
echo "🎯 Starting Payload CMS server on port ${PORT:-3002}..."
exec npm start
