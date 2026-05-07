# Busrom Project - CMS Form Integration Mapping

This document provides a comprehensive inventory of all form instances across the Busrom web platform. It maps frontend routes to their respective Payload CMS collections, `form-configs` identifiers, and GTM tracking status.

## 1. Global & System Forms
These forms are managed via CMS Globals or are hardcoded into specific site-wide components.

| Frontend Context | Route | CMS Source | Form Config Name | Frontend Component | GTM Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Homepage Main** | `/` | `MainForm` (Global) | `main-form` | `web/components/home/main-form.tsx` | ✅ Standardized |
| **Global Footer** | All Pages | `Footer` (Global) | `footer-form` | `web/components/layout/footer/FooterForm.tsx` | ✅ Standardized |

## 2. Collection-Specific Forms (Dynamic Routes)
These forms are associated with dynamic collections like Products and Product Series.

| Frontend Context | Route | CMS Source | Form Config Name | Frontend Component | GTM Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Product Detail** | `/shop/[slug]` | `Products` | `product-inquiry-form` | `web/components/shop/FormBlock.tsx` | ✅ Standardized |
| **Product Inquiry** | `/shop/[slug]` | `Products` | `full-inquiry-form` | `web/components/shop/FullInquiryModal.tsx` | ✅ Standardized |
| **Product Series** | `/products/[slug]` | `ProductSeries`| `product-series-inquiry-form` | `web/components/product-series/ContactForm.tsx` | ✅ Standardized |

## 3. Subpage Forms (Pages Collection)
The `Pages` collection uses a unified template system. Forms are injected dynamically into the layout via Lexical blocks or specific template fields.

| Page Name | Route | Form Config Name | Frontend Component | GTM Status |
| :--- | :--- | :--- | :--- | :--- |
| **Fraud Notice** | `/pages/fraud-notice` | `fraud-notice-form` | `web/components/fraud/FraudFormWrapper.tsx` | ✅ Standardized |
| **FAQ** | `/pages/faq` | `faq-form` | `web/components/faq/sections/FaqContactSection.tsx` | ✅ Standardized |
| **Support** | `/pages/support` | `support-contact-form` | `web/components/support/SupportContactFormSection.tsx` | ✅ Standardized |
| **Our Story** | `/pages/our-story` | `our-story-form` | `web/components/story/StoryContactFormSection.tsx` | ✅ Standardized |
| **Application** | `/pages/application` | `application-form` | `web/components/application/sections/ApplicationContactFormSection.tsx` | ✅ Standardized |
| **One-Stop Solution**| `/pages/one-stop-solution`| `one-stop-shop-form` | `web/components/one-stop/sections/CtaSection.tsx` | ✅ Standardized |
| **OEM/ODM** | `/pages/oem-odm` | `oem-odm-form` | `web/components/oem-odm/OemOdmContactForm.tsx` | ✅ Standardized |
| **Contact Us** | `/pages/contact-us` | `contact-us-form` | `web/components/contact/ContactFormSection.tsx` | ✅ Standardized |
| **Service Overview** | `/pages/service-overview` | `service-overview-form` | `web/components/service/ContactFormSection.tsx` | ✅ Standardized |

## 4. GTM Tracking Implementation Details

All 13 forms have been updated to use a standardized GTM `dataLayer.push` protocol triggered exclusively upon successful API response (`res.ok`).

### Standard Event Structure
```javascript
window.dataLayer.push({
  event: 'form_submit_success',
  form_id: configData.name || "fallback-id",
  form_name: configData.name || "fallback-id"
});
```

### Key Rules
1. **Source of Truth**: The `form_id` and `form_name` properties are dynamically sourced from Payload CMS `formConfig.name`.
2. **DOM Alignment**: All `<form>` elements have their `id` attribute set to match the `form_id` passed to GTM.
3. **Decoupled Logic**: Tracking events are decoupled from front-end "Submit" button clicks; they only fire when the server validates the submission.

## 5. Technical Implementation Notes

### useContactForm Hook
The `service-overview` form utilizes a shared hook located at `web/components/service/ContactForm/useContactForm.ts`, which now contains the centralized GTM logic for that section.

### Multi-Step Validation
Forms with file uploads (e.g., Support, OEM/ODM) validate data before triggering GTM events to ensure only complete, successful submissions are counted.

---
*Last Updated: 2026-05-07*

