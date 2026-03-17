# 01 - Project Overview (Busrom)

## 🎯 Project Mission
Busrom is a premium international B2B platform for glass hardware. It focuses on:
- **Product Excellence**: High-quality hardware presentation.
- **Visual Performance**: 1:1 design fidelity with smooth animations (Framer Motion).
- **Global Reach**: 24+ languages with automated SEO and localization.

## 🏗️ Core Architecture
- **Root Directory Structure**:
  - `web/`: Next.js 15 Frontend.
  - `payload-cms/`: Payload Headless CMS.
  - `docs/`: Master documentation.
  - `scripts/`: Infrastructure and maintenance tools.

## 🚀 Key Technologies
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion, next-intl.
- **Backend**: Payload CMS (Headless), Node.js, TypeScript.
- **Database**: PostgreSQL (AWS RDS).
- **Storage**: AWS S3 (Media) + CloudFront (CDN).
- **Security**: AWS IAM OIDC (GitHub Actions), IAM Identity Center (Local SSO).

## 🧩 Foundational Modules
- **Dynamic Homepage**: 16+ interchangeable modules managed via Payload Globals.
- **Global Shop**: SKU-level product management with color/finish variants.
- **Portfolio & Applications**: Showcase of real-world hardware applications.
- **CDP Engine**: Internal behavioral tracking and traffic analysis.
