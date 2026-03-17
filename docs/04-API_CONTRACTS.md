# 04 - API Contract & Data Patterns

## 🎯 Architecture Goal
Consolidated API abstraction to simplify frontend logic while leveraging backend flexibility.

## 🔄 REST Abstraction Pattern
Next.js API Routes (`web/app/api/...`) act as a **transformer**:
- **Source**: Payload CMS REST/GraphQL (complex i18n JSON).
- **Target**: Flat, single-locale JSON for straightforward component consumption.

## 🏠 Homepage API (`/api/home?locale=[xy]`)
Fetches 16+ modules from the `Home` global.
- **Modules**: `HeroBanner`, `ProductCarousel`, `BrandAdvantages`, `ServiceFeatures`, etc.
- **Logic**: Automatically selects the correct string from the i18n JSON based on `locale`.

## 📦 Shop API (`/api/shop?locale=[xy]`)
- **SKUs**: Retrieves individual product variants.
- **Filters**: Category-based and custom attribute filtering.
- **Variants**: Returns correct image URLs based on color/finish.

## 🖼️ Media API Utilities
- **`web/lib/image-utils.ts`**: Frontend helper to select the optimized variant.
- **`web/lib/cdn-url.ts`**: Maps S3 keys to CloudFront domains.

## 🔍 SEO & Metadata
- **`web/lib/seo-utils.ts`**: Dynamically generates meta tags for each route based on SiteConfig and page content.
- **`web/app/[locale]/sitemap.xml`**: Dynamically generates localized sitemaps.
