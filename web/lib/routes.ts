/**
 * Core Application Routes Constants
 * Used to avoid hardcoding routes everywhere
 */

export const APP_ROUTES = {
  HOME: '/',
  BLOG_INDEX: '/knowledge-base-blog',
  BLOG_DETAIL: (slug: string) => `/knowledge-base-blog/${slug}`,
  SHOP_INDEX: '/shop',
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  APPLICATION_INDEX: '/applications',
  APPLICATION_DETAIL: (slug: string) => `/applications/${slug}`,
}
