# Frontend-Backend Integration Documentation

## Overview

This document outlines the integration between the Next.js frontend (web) and Payload CMS backend (payload-cms) for the Busrom website.

**Migration Status**: Migrating from Keystone CMS to Payload CMS
**API Strategy**: REST API (not GraphQL)
**Data Flow**: Backend (Payload CMS) → REST API → Frontend (Next.js)
**Principle**: Backend data structure is the source of truth. Frontend adapts to backend.

---

## API Endpoints

### Primary Home Page Endpoint

```
GET /api/home?locale={locale}
```

**Parameters:**
- `locale` (optional): Language code (en, zh, es, etc.). Default: `en`

**Returns:** Complete home page content including all sections

**File Locations:**
- Backend Implementation: `payload-cms/src/endpoints/home.ts`
- Backend Registration: `payload-cms/payload.config.ts`
- Frontend API Client: `web/lib/api/home.ts`
- Frontend Types: `web/lib/content-data.ts`

---

## Data Structure Reference

### 1. Hero Banner Items

**Backend Collection:** `hero-banner-items`
**Frontend Component:** `web/components/home/hero-banner.tsx`

**Backend Response:**
```typescript
{
  heroBanner: [
    {
      id: string
      title: string
      subtitle: string
      ctaText: string
      ctaUrl: string
      features: string[]  // Array of 5 features, nulls filtered out
      images: MediaObject[]  // Array of up to 4 images
    }
  ]
}
```

**Frontend Expected Type:**
```typescript
interface HeroBannerItem {
  id: string
  title: string
  subtitle?: string
  ctaText?: string
  ctaUrl?: string
  features: string[]
  images: ImageObject[]
}
```

**Field Mapping:**
- Backend: `feature1`, `feature2`, `feature3`, `feature4`, `feature5` → Frontend: `features[]`
- Backend: `image1`, `image2`, `image3`, `image4` → Frontend: `images[]`

---

### 2. Product Series Carousel

**Backend Global:** `product-series-carousel`
**Frontend Component:** `web/components/home/product-series-carousel.tsx`

**Backend Response:**
```typescript
{
  productSeriesCarousel: {
    title: string
    items: [
      {
        title: string
        buttonText: string
        linkUrl: string
        image: MediaObject
        sceneImage: MediaObject
      }
    ]
  }
}
```

**Field Mapping:**
- Backend: `productImage` → Frontend: `image`
- Backend: `sceneImage` → Frontend: `sceneImage`

---

### 3. Service Features

**Backend Global:** `service-features`
**Frontend Component:** `web/components/home/service-features.tsx`

**Backend Response:**
```typescript
{
  serviceFeatures: {
    status: 'draft' | 'published'
    title: string
    subtitle: string
    features: [
      {
        title: string
        shortTitle: string
        description: string
        images: MediaObject[]  // 2-6 images depending on feature
      }
    ]
  }
}
```

**Feature Image Counts:**
- Feature 1: 4 images
- Feature 2: 2 images
- Feature 3: 6 images
- Feature 4: 2 images
- Feature 5: 2 images

---

### 4. Simple CTA

**Backend Global:** `simple-cta`
**Frontend Component:** `web/components/home/simple-cta.tsx`

**Backend Response:**
```typescript
{
  simpleCta: {
    status: 'draft' | 'published'
    title: string
    subtitle: string
    ctaText: string
    ctaUrl: string
    images: MediaObject[]  // 3 images
  }
}
```

---

### 5. Series Intro Items

**Backend Collection:** `series-intro-items`
**Frontend Component:** `web/components/home/series-intro.tsx`

**Backend Response:**
```typescript
{
  seriesIntro: [
    {
      id: string
      title: string
      description: string
      productSeries: ProductSeries | string
      images: string[]  // URLs populated by TagBasedRandomImages
    }
  ]
}
```

**Note:** Images are auto-populated from Media library based on:
- Category: Scene (id: 2)
- Tags: Product series tags (ids: 1-9)

---

### 6. Brand Advantages

**Backend Global:** `brand-advantages`
**Frontend Component:** `web/components/home/brand-advantages.tsx`

**Backend Response:**
```typescript
{
  brandAdvantages: {
    status: 'draft' | 'published'
    image: MediaObject
    advantages: [
      {
        text: string
        icon: string  // Lucide React icon name
      }
    ]
  }
}
```

**Field Mapping:**
- Backend: `advantage01Text`, `advantage01Icon` → Frontend: `advantages[0]`
- 9 advantages total (01-09)

**Icon Names:** Sparkles, Target, Component, Gauge, Waves, ShieldCheck, EyeOff, Factory, Cpu

---

### 7. OEM/ODM

**Backend Global:** `oem-odm`
**Frontend Component:** `web/components/home/oem-odm.tsx`

**Backend Response:**
```typescript
{
  oemOdm: {
    status: 'draft' | 'published'
    oem: {
      title: string
      description: string[]  // 2 lines
      bgImage: MediaObject
      image: MediaObject
    }
    odm: {
      title: string
      description: string[]  // 2 lines
      bgImage: MediaObject
      image: MediaObject
    }
  }
}
```

---

### 8. Quote Steps

**Backend Global:** `quote-steps`
**Frontend Component:** `web/components/home/quote-steps.tsx`

**Backend Response:**
```typescript
{
  quoteSteps: {
    status: 'draft' | 'published'
    headerTitle: string
    headerTitle2: string
    headerSubtitle: string
    headerDescription: string
    steps: [
      {
        title: string
        text: string
        image: MediaObject
      }
    ]
  }
}
```

**Field Mapping:**
- Backend: `step01Title`, `step01Text`, `step01Image` → Frontend: `steps[0]`
- 5 steps total (01-05)

---

### 9. Main Form

**Backend Global:** `main-form`
**Frontend Component:** `web/components/home/main-form.tsx`

**Backend Response:**
```typescript
{
  mainForm: {
    status: 'draft' | 'published'
    designTextLeft: string
    designTextRight: string
    images: MediaObject[]  // 2 images
  }
}
```

**Note:** Placeholders removed in Payload CMS (handled by frontend i18n)

---

### 10. Why Choose Busrom

**Backend Global:** `why-choose-busrom`
**Frontend Component:** `web/components/home/why-choose-busrom.tsx`

**Backend Response:**
```typescript
{
  whyChooseBusrom: {
    status: 'draft' | 'published'
    title: string
    reasons: [
      {
        title: string
        description: string
        icon: string  // Lucide React icon name
        image: MediaObject
      }
    ]
  }
}
```

**Field Mapping:**
- Backend: `reason01Title`, `reason01Description`, `reason01Icon`, `reason01Image` → Frontend: `reasons[0]`
- 5 reasons total (01-05)

**Icon Names:** Sparkles, ShieldCheck, Factory, Target, Cpu

---

### 11. Brand Analysis

**Backend Global:** `brand-analysis`
**Frontend Component:** `web/components/home/brand-analysis.tsx`

**Backend Response:**
```typescript
{
  brandAnalysis: {
    status: 'draft' | 'published'
    brandNameAnalysis: {
      titlePart1: string  // "Bus"
      titlePart2: string  // "rom"
      textPart1: string   // "Buffer & Bridge"
      textPart2: string   // "Room & Space"
    }
    centers: [
      {
        title: string
        description: string
        largeImage: MediaObject
        smallImage: MediaObject
      }
    ]
  }
}
```

**Centers Order:**
1. Brand Center
2. Project Center
3. Service Center

---

### 12. Brand Value

**Backend Global:** `brand-value`
**Frontend Component:** `web/components/home/brand-value.tsx`

**Backend Response:**
```typescript
{
  brandValue: {
    status: 'draft' | 'published'
    title: string
    subtitle: string
    items: [
      {
        title: string
        description: string
        image: MediaObject
      }
    ]
  }
}
```

**Items Order:**
1. Param 1
2. Param 2
3. Slogan
4. Value
5. Vision

---

### 13. Footer

**Backend Global:** `footer`
**Frontend Component:** `web/components/layout/footer.tsx`

**Backend Response:**
```typescript
{
  footer: {
    status: 'draft' | 'published'
    form: {
      title: string
      placeholders: {
        name: string
        email: string
        message: string
      }
      buttonText: string
    }
    contact: {
      title: string
      address: string
      workingHours: string
      email: string
      phone: string
      whatsapp: string
    }
    notice: {
      title: string
      text: string
    }
    copyright: string
    socialLinks: SocialLink[]
  }
}
```

---

## Media Object Structure

All media objects returned from the API follow this structure:

```typescript
interface MediaObject {
  id: string | number
  url: string
  filename: string
  mimeType: string
  width: number
  height: number
  variants: {
    thumbnail?: { url: string; width: number; height: number }
    small?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
    xlarge?: { url: string; width: number; height: number }
    webp?: { url: string; width: number; height: number }
  }
  altText: string
  cropFocalPoint?: {
    x: number
    y: number
  }
}
```

---

## Implementation Checklist

### Backend (Payload CMS)

- [x] Create home endpoint: `src/endpoints/home.ts`
- [x] Register endpoint in `payload.config.ts`
- [x] Test endpoint with Postman/curl
- [x] Verify all globals are seeded with data
- [x] Verify media URLs are correct

### Frontend (Next.js)

- [x] Update `lib/api/home.ts` to match new API response
- [x] Fix field mappings:
  - [x] `whyChoose` → `whyChooseBusrom`
  - [x] Brand Analysis: `brandNameAnalysis` structure
  - [x] Main Form: Remove CMS placeholders (use i18n)
  - [x] Footer: Map to correct structure
  - [x] Product Series Carousel: Items already filtered by locale
- [ ] Update `lib/content-data.ts` types to match backend (if needed)
- [ ] Test all components render correctly
- [ ] Test with different locales (en, zh)
- [ ] Remove old GraphQL code and dependencies

---

## Testing

### Backend API Testing

```bash
# Test home endpoint (English)
curl http://localhost:3000/api/home?locale=en

# Test home endpoint (Chinese)
curl http://localhost:3000/api/home?locale=zh

# Test home endpoint (default)
curl http://localhost:3000/api/home
```

### Frontend Testing

```bash
# Run Next.js dev server
cd web
npm run dev

# Visit homepage
open http://localhost:3001
```

---

## Migration Notes

### Removed Fields (from Keystone)
- **Main Form**: `placeholderName`, `placeholderEmail`, etc. (moved to frontend i18n)
- **Main Form**: `buttonText` (moved to frontend i18n)

### Changed Field Names
- **Product Series Carousel**: `productImage` (Payload) vs `image` (Keystone)
- **Brand Advantages**: Array of objects vs individual fields

### New Features in Payload
- **Media Variants**: Automatic image resizing (thumbnail, small, medium, large, xlarge, webp)
- **Crop Focal Point**: Supports smart cropping with focal point data
- **Translation Center**: Built-in UI for managing translations across 24 languages

---

## Troubleshooting

### Issue: API returns 404
**Solution:** Check that endpoint is registered in `payload.config.ts`

### Issue: Media URLs are null
**Solution:** Check that media files are uploaded and `depth: 2` is set in query

### Issue: Locale data missing
**Solution:** Check that globals are seeded with translations for the requested locale

### Issue: Frontend types don't match
**Solution:** Backend is source of truth - update frontend types to match backend response

---

## Related Documentation

- Payload CMS Docs: https://payloadcms.com/docs
- Next.js Docs: https://nextjs.org/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs/

---

**Last Updated:** 2025-12-16
**Version:** 1.0
