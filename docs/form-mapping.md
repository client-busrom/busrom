# Busrom Project - CMS Form Integration Mapping

This document provides a comprehensive inventory of all form instances across the Busrom web platform. It maps frontend routes to their respective Payload CMS collections and `form-configs` identifiers.

## 1. Global & System Forms
These forms are managed via CMS Globals or are hardcoded into specific site-wide components.

| Frontend Context | Route | CMS Source | Form Config ID | Form Config Name | Frontend Component |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Homepage** | `/` | `MainForm` (Global) | `1` | `main-form` | `web/components/home/main-form.tsx` |
| **Global Footer** | All Pages | `Footer` (Global) | `3` | `footer-form` | `web/components/layout/footer.tsx` |

## 2. Collection-Specific Forms (Dynamic Routes)
These forms are associated with dynamic collections like Products and Product Series.

| Frontend Context | Route | CMS Source | Form Config ID | Form Config Name | Integration Logic |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Product Detail** | `/shop/[slug]` | `Products` (Collection) | `2` | `product-inquiry-form` | Linked via `linkedForm` field or `formBlock` in Lexical content. |
| **Product Series** | `/products/[slug]` | `ProductSeries` (Collection) | `4` | `product-series-inquiry-form` | Integrated via `ContactForm` block in `contentTranslation`. |

## 3. Subpage Forms (Pages Collection)
The `Pages` collection uses a unified template system. Forms are injected dynamically into the layout via Lexical blocks or specific template fields.

| Page Slug | Route | Form Config ID | Form Config Name | Integration Method |
| :--- | :--- | :--- | :--- | :--- |
| `fraud-notice` | `/pages/fraud-notice` | `14` | `fraud-notice-form` | `formBlock` in `contentTranslation` |
| `faq` | `/pages/faq` | `13` | `faq-form` | `formBlock` in `contentTranslation` |
| `support` | `/pages/support` | `12` | `support-contact-form` | `formBlock` in `contentTranslation` |
| `our-story` | `/pages/our-story` | `11` | `our-story-form` | `formBlock` in `contentTranslation` |
| `application` | `/pages/application` | `10` | `application-form` | `formBlock` in `contentTranslation` |
| `one-stop-solution`| `/pages/one-stop-solution`| `9` | `one-stop-shop-form` | `formBlock` in `contentTranslation` |
| `oem-odm` | `/pages/oem-odm` | `8` | `oem-odm-form` | `formBlock` in `contentTranslation` |
| `contact-us` | `/pages/contact-us` | `6` | `contact-us-form` | `formBlock` inside `sidebarContent` |
| `service-overview` | `/pages/service-overview` | `5` | `service-overview-form` | `formBlock` in `contentTranslation` |
| `product-overview` | `/pages/product-overview` | `4` | `product-series-inquiry-form` | Custom injection (Reuses ID 4) |

*Note: The `privacy-policy` page is the only page in the collection without an integrated form.*

## 4. Technical Implementation Details

### Lexical Form Block
Most subpages use a custom Lexical block type: `formBlock`.
- **Payload Schema**: `payload-cms/src/blocks/FormBlock.ts` (if applicable) or defined inline in `Pages.ts`.
- **Data Resolution**: Handled in `web/lib/api/pages.ts` by the `fetchPageData` function, which detects `formBlock` markers and fetches the corresponding `formConfig`.

### Form Submission API
All forms submit to a unified endpoint in the frontend:
- **Endpoint**: `/api/form-submissions`
- **Logic**: Forwards the data to Payload CMS's Custom API or built-in Form Submission collection.

### Components Used
- `web/components/form/FormRenderer.tsx`: Generic renderer for dynamic `formConfigs`.
- `web/components/shop/SimplifiedInquiryForm.tsx`: Specialized form for product pages.
- `web/components/product-series/ContactForm.tsx`: Specialized form for product series pages.

---
*Last Updated: 2026-05-02*
