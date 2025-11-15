#!/bin/bash

# Reset Navigation to Initial State
# This script deletes all navigation data and recreates it from seed

echo "⚠️  WARNING: This will delete ALL navigation menus and recreate initial data!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted."
    exit 0
fi

echo ""
echo "🔄 Resetting navigation to initial state..."
echo ""

cd /Users/cerfbaleine/workspace/busrom-work/cms
npx tsx scripts/reset-navigation-to-initial.ts

echo ""
echo "✅ Done! Please refresh your CMS browser."
