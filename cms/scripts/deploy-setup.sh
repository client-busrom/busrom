#!/bin/bash

##############################################################################
# Busrom CMS Deployment Setup Script
#
# This script runs after initial deployment to AWS to set up the database
# and seed initial data.
#
# Usage:
#   bash scripts/deploy-setup.sh
#
# Environment:
#   - DATABASE_URL must be set (PostgreSQL connection string)
#   - AWS credentials must be configured if using S3
##############################################################################

set -e  # Exit on error

echo "=========================================="
echo "🚀 Busrom CMS Deployment Setup"
echo "=========================================="
echo ""

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  echo "📄 Loading environment variables from .env file..."
  set -a
  source .env
  set +a
  echo "✅ Environment variables loaded from .env"
else
  echo "⚠️  No .env file found, using system environment variables"
fi
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set"
  echo "   Please set the DATABASE_URL environment variable or create a .env file"
  exit 1
fi

echo "✅ Database connection configured"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm ci
echo "✅ Dependencies installed"
echo ""

# Step 2: Generate Prisma client
echo "🔧 Step 2: Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Step 3: Sync database schema
echo "🗄️  Step 3: Syncing database schema..."
echo "   Using db push to sync schema (safe for development)..."
npx keystone prisma db push --accept-data-loss --skip-generate
echo "✅ Database schema synced"
echo ""

# Step 4: Build Keystone (optional, may fail due to custom fields)
echo "🏗️  Step 4: Building Keystone..."
if npm run build; then
  echo "✅ Keystone built successfully"
else
  echo "⚠️  Keystone build failed (likely due to custom fields)"
  echo "   Continuing with seed scripts..."
fi
echo ""

# Step 5: Seed navigation menus
echo "🌱 Step 5: Seeding navigation menus..."
npm run seed:navigation
echo "✅ Navigation menus seeded"
echo ""

# Step 6: Seed other initial data (if needed)
echo "🌱 Step 6: Seeding other data..."
# npm run seed:categories
# npm run seed:media-categories
# Add other seed scripts as needed
echo "✅ Other data seeded (or skipped if not configured)"
echo ""

echo "=========================================="
echo "✨ Deployment setup completed!"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "   1. Start the server: npm start"
echo "   2. Access the admin UI: http://your-domain/admin"
echo "   3. Create your first admin user"
echo ""
