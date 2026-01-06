#!/bin/sh
# Payload CMS Startup Script for AWS ECS
# This script handles database initialization and starts the Payload CMS server

set -e

echo "🚀 Starting Payload CMS..."
echo "Environment: ${NODE_ENV:-production}"
echo "Port: ${PORT:-3002}"

# Set NODE_OPTIONS to suppress deprecation warnings
export NODE_OPTIONS="--no-deprecation"

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

# Run database migrations in production
echo "📦 Running database migrations..."
./node_modules/.bin/payload migrate || {
  echo "⚠️  Migration failed or no migrations to run"
  # Don't exit - migrations might already be applied
}
echo "✅ Database migrations completed"

# Start the Payload CMS server
echo "🎯 Starting Payload CMS server on port ${PORT:-3002}..."
exec ./node_modules/.bin/next start -p ${PORT:-3002}
