#!/bin/bash
set -e

echo "🚀 Starting CMS application..."

# Check if we should clear users
if [ "$CLEAR_USERS" = "true" ]; then
  echo "⚠️  CLEAR_USERS=true detected. Clearing all users from database..."
  node /app/scripts/clear-users-direct.mjs
  echo "✅ Users cleared. Unsetting CLEAR_USERS flag..."
  unset CLEAR_USERS
fi

# Run the main application
echo "🎯 Starting main application..."
exec "$@"
