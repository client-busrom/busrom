#!/bin/bash
#
# Cache Warmup Script for Busrom Production
#
# This script pre-warms CloudFront and application caches by:
# 1. Hitting key CMS API endpoints to populate CloudFront cache
# 2. Visiting key pages to trigger SSR caching
#
# Usage:
#   ./scripts/cache-warmup.sh [--cms-only] [--web-only]
#
# Run after:
#   - New deployment
#   - CloudFront cache invalidation
#   - CMS content updates
#

set -e

# Configuration
WEB_DOMAIN="https://www.busromhouse.com"
CMS_DOMAIN="https://cms.busromhouse.com"
LOCALES=("en" "zh" "es" "fr" "de")

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse arguments
WARM_CMS=true
WARM_WEB=true

for arg in "$@"; do
    case $arg in
        --cms-only)
            WARM_WEB=false
            ;;
        --web-only)
            WARM_CMS=false
            ;;
    esac
done

echo "================================================"
echo "  Busrom Cache Warmup Script"
echo "================================================"
echo ""

# Function to warm a URL
warm_url() {
    local url=$1
    local description=$2

    start_time=$(date +%s.%N)
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 120 "$url" 2>/dev/null || echo "000")
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "?")

    if [ "$status" = "200" ] || [ "$status" = "304" ]; then
        echo -e "${GREEN}✓${NC} [${status}] ${duration}s - ${description}"
    elif [ "$status" = "307" ] || [ "$status" = "308" ]; then
        echo -e "${YELLOW}→${NC} [${status}] ${duration}s - ${description} (redirect)"
    else
        echo -e "${RED}✗${NC} [${status}] ${duration}s - ${description}"
    fi
}

# Warm CMS API endpoints
if [ "$WARM_CMS" = true ]; then
    echo ""
    echo "📡 Warming CMS API endpoints..."
    echo "-------------------------------------------"

    for locale in "${LOCALES[@]}"; do
        echo ""
        echo "  Locale: $locale"

        # Homepage API (aggregated endpoint)
        warm_url "${CMS_DOMAIN}/api/home?locale=${locale}" "Homepage API (${locale})"

        # Global configs
        warm_url "${CMS_DOMAIN}/api/globals/header?locale=${locale}&depth=2" "Header Global (${locale})"
        warm_url "${CMS_DOMAIN}/api/globals/footer?locale=${locale}&depth=2" "Footer Global (${locale})"
        warm_url "${CMS_DOMAIN}/api/globals/homepage?locale=${locale}&depth=2" "Homepage Global (${locale})"
        warm_url "${CMS_DOMAIN}/api/globals/preloader-config?depth=2" "Preloader Config"

        # Collections
        warm_url "${CMS_DOMAIN}/api/products?locale=${locale}&depth=1&limit=20" "Products (${locale})"
        warm_url "${CMS_DOMAIN}/api/navigation-menus?locale=${locale}&depth=2" "Navigation (${locale})"
    done
fi

# Warm Web pages
if [ "$WARM_WEB" = true ]; then
    echo ""
    echo ""
    echo "🌐 Warming Web pages..."
    echo "-------------------------------------------"

    for locale in "${LOCALES[@]}"; do
        echo ""
        echo "  Locale: $locale"

        # Homepage
        warm_url "${WEB_DOMAIN}/${locale}" "Homepage (${locale})"

        # Key pages
        warm_url "${WEB_DOMAIN}/${locale}/products" "Products Page (${locale})"
        warm_url "${WEB_DOMAIN}/${locale}/contact-us" "Contact Page (${locale})"
        warm_url "${WEB_DOMAIN}/${locale}/about/story" "About Page (${locale})"
    done

    echo ""
    echo "  Static assets..."

    # Warm static assets (JS/CSS) - these will be cached by CloudFront
    warm_url "${WEB_DOMAIN}/_next/static/chunks/webpack-f921e84ec3bc787d.js" "Webpack bundle"
    warm_url "${WEB_DOMAIN}/_next/static/css/5381b1b395a088e1.css" "Main CSS"
fi

echo ""
echo ""
echo "================================================"
echo "  Cache Warmup Complete!"
echo "================================================"
echo ""
echo "CloudFront distributions:"
echo "  Web: d2jkvnz294w3dx.cloudfront.net"
echo "  CMS: d3n8qjjwt9btd7.cloudfront.net"
echo ""
echo "Next steps:"
echo "  1. Update DNS records in Cloudflare:"
echo "     www.busromhouse.com -> CNAME -> d2jkvnz294w3dx.cloudfront.net"
echo "     cms.busromhouse.com -> CNAME -> d3n8qjjwt9btd7.cloudfront.net"
echo ""
echo "  2. Wait for DNS propagation (5-30 minutes)"
echo ""
echo "  3. Test the site performance"
echo ""
