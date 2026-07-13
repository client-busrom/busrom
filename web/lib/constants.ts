/**
 * Global Page Template Identifiers
 * Matches the template slugs defined in Payload CMS
 */
export const PAGE_TEMPLATES = {
  APPLICATION: "APPLICATION",
  CONTACT_US: "CONTACT_US",
  FAQ: "FAQ",
  FRAUD_NOTICE: "FRAUD_NOTICE",
  OEM_ODM: "OEM_ODM",
  ONE_STOP_SOLUTION: "ONE_STOP_SOLUTION",
  OUR_STORY: "OUR_STORY",
  PRIVACY_POLICY: "PRIVACY_POLICY",
  PRODUCT_OVERVIEW: "PRODUCT_OVERVIEW",
  SERVICE_OVERVIEW: "SERVICE_OVERVIEW",
  SUPPORT: "SUPPORT",
} as const;

export type PageTemplate = typeof PAGE_TEMPLATES[keyof typeof PAGE_TEMPLATES];

/**
 * Global Page Slugs
 * Used for fetching specific page data and conditional logic
 */
export const PAGE_SLUGS = {
  HOME: "home",
  APPLICATION: "application",
  CONTACT_US: "contact-us",
  FAQ: "faq-frequently-asked-questions",
  FRAUD_NOTICE: "fraud-notice",
  OEM_ODM: "oem-odm",
  ONE_STOP_SOLUTION: "one-stop-solution",
  OUR_STORY: "our-story",
  PRIVACY_POLICY: "privacy-policy",
  PRODUCT_OVERVIEW: "product-overview",
  SERVICE_OVERVIEW: "service-overview",
  SUPPORT: "support",
} as const;

export type PageSlug = typeof PAGE_SLUGS[keyof typeof PAGE_SLUGS];

