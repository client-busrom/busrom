# 02 - Frontend Development Guide

## 🏗️ Next.js 15 (App Router)
- **Directory**: `web/`
- **Root**: `web/app/[locale]/`
- **Messages**: `web/messages/[en|zh|...].json`

## 🧱 Component Architecture
Components are organized by feature area:
- `web/components/ui/`: Atomic UI elements.
- `web/components/home/`: 16+ modules for the homepage (Hero, Features, etc.).
- `web/components/products/`: Category and list views.
- `web/components/shop/`: SKU details and variant support.
- `web/components/layout/`: Global Header, Footer, and Navigation.

## 🔄 Data Fetching Pattern
**CRITICAL**: Avoid direct GraphQL calls. Use the Next.js API layer.
- **Client Side**: `web/lib/api/` handles standardized fetch calls.
- **Server Side**: `web/lib/server/` or standard fetch in App Router.
- **Utilities**: `web/lib/localization.ts` handles multi-language string extraction.

## 🖼️ Image & Asset Strategy
- **Image Utils**: `web/lib/image-utils.ts` handles variant selection.
- **WebP Support**: Use `.webp` variants for better performance.
- **Next.js Image**: Always use `priority` for above-the-fold content (HeroBanner).

## 🚀 Key Libraries
- **Animations**: `framer-motion` for complex transitions.
- **Scroll**: `lenis` for smooth scrolling (via `web/components/lenis-provider.tsx`).
- **Icons**: `lucide-react`.
