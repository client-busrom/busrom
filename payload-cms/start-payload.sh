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

# Note: We use push:true in payload.config.ts for automatic schema management
# The payload migrate command has CSS import issues in Node.js ESM mode
# (ERR_UNKNOWN_FILE_EXTENSION for react-image-crop CSS)
# Skip explicit migrate - Payload will handle schema sync on startup with push:true
echo "📦 Using push:true for automatic schema management..."

# Start the Payload CMS server
echo "🎯 Starting Payload CMS server on port ${PORT:-3002}..."
exec ./node_modules/.bin/next start -p ${PORT:-3002}
