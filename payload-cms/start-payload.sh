#!/bin/sh
# Payload CMS Startup Script for AWS ECS
# This script handles database initialization and starts the Payload CMS server

set -e

echo "🚀 Starting Payload CMS..."
echo "Environment: ${NODE_ENV:-production}"
echo "Port: ${PORT:-3002}"

# Set NODE_OPTIONS to suppress deprecation warnings and increase memory limit for 4GB ECS container
export NODE_OPTIONS="--no-deprecation --max-old-space-size=3072"

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

# NOTE: Migrations are temporarily disabled
# The payload migrate command has issues with interactive prompts in production
# and the versions feature has been disabled for now.
# When re-enabling versions, uncomment the migration commands below:
#
# echo "🧹 Clearing dev mode migration records..."
# node --import ./css-loader.mjs ./clear-dev-migrations.mjs
#
# echo "📦 Running database migrations..."
# node --import ./css-loader.mjs ./node_modules/payload/bin.js migrate

# Start the Payload CMS server
echo "🎯 Starting Payload CMS server on port ${PORT:-3002}..."
exec ./node_modules/.bin/next start -p ${PORT:-3002}
