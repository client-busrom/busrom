# 03 - Backend Payload CMS Guide

## 🛠️ Payload CMS 3.x (Headless)
- **Directory**: `payload-cms/`
- **Core Strategy**: Define collections and globals for modular content.

## 📦 Data Collections
- **`payload-cms/src/collections/`**:
  - `Media`: Centralized image/file management with S3 variants.
  - `Products`: Detailed hardware specs.
  - `Applications`: Portfolio/Case studies.
  - `ApplicationsCategories`: Grouping for case studies.

## 🛠️ Global Settings
- **`payload-cms/src/globals/`**:
  - `Header` & `Footer`: Navigation and branding.
  - `SiteConfig`: Turnstile keys, social links, SEO.
  - `ShopConfig`: Specialized settings for SKU views.
  - `Home`: 16+ modules for the homepage.

## ⚙️ Logic Layer
- **Hooks**: `payload-cms/src/hooks/` for automated media processing and validation.
- **Migrations**: `payload-cms/src/migrations/` for schema versioning.
- **Seed Scripts**: `payload-cms/scripts/` for populating fresh environments.

## 🖼️ Media & S3 Strategy
- **S3 Upload**: Integration via `payload-cms/src/hooks/` for direct-to-S3 storage.
- **Variants**: Automates resizing (xlarge, large, medium, small, webp, thumbnail).
- **CDN**: CloudFront delivery configured via `CDN_DOMAIN`.

## 🔒 Security
- **RBAC**: Identity-based permissions.
- **Activity Logs**: Auditing of all administrative changes.
- **SSO**: IAM Identity Center integration for all administrative access.
