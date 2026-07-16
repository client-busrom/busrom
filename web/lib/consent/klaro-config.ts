/**
 * Klaro Cookie 同意配置（GDPR / Consent Mode v2 兼容）
 *
 * 设计要点：
 * 1. 存储用 cookie（cookieName=busrom_consent），服务端可通过 `next/headers` 读取，
 *    便于 SSR 阶段判断地域和已同意状态。
 * 2. 默认全部 opt-in（default:false），符合 GDPR"默认拒绝非必要"要求。
 * 3. 多语言文案在 translations 里维护；未覆盖的 locale 自动 fallback 到 en。
 * 4. callback 里同步 Google Consent Mode v2（gtag('consent','update',...)），
 *    保证 GA4/Ads 在 EEA 能拿到正确信号。
 *
 * 与各 App 的对应关系（name 必须与 useConsent(name) 一致）：
 *   - cdp            → lib/analytics.ts（自建 CDP）
 *   - gtm            → Google Tag Manager（GTM Container）
 *   - tawk           → Tawk.to 在线客服
 *   - cms-scripts    → Payload CMS 后台注入的 GlobalScripts/PageScripts（营销/统计类）
 */

import type { Locale } from '@/i18n.config'

/** Klaro 里使用的服务名（与 useConsent 入参保持一致） */
export type ConsentServiceName = 'cdp' | 'gtm' | 'tawk' | 'cms-scripts'

/** Klaro 里使用的目的分组 */
export type ConsentPurpose = 'necessary' | 'functional' | 'analytics' | 'marketing'

/** ConsentMode v2 对应的 4 个信号，映射到 gtag consent */
export interface ConsentSignals {
  ad_storage: 'granted' | 'denied'
  ad_user_data: 'granted' | 'denied'
  ad_personalization: 'granted' | 'denied'
  analytics_storage: 'granted' | 'denied'
  functionality_storage: 'granted' | 'denied'
  security_storage: 'granted' | 'denied'
}

/** Cookie 域名：可由环境变量覆盖，默认 .busromhouse.com 覆盖所有子域 */
export const CONSENT_COOKIE_DOMAIN =
  process.env.NEXT_PUBLIC_CONSENT_COOKIE_DOMAIN || '.busromhouse.com'

/** Consent cookie 名（服务端也可读取） */
export const CONSENT_COOKIE_NAME = 'busrom_consent'

/** Klaro service 列表（order 即 UI 顺序） */
const SERVICES = [
  {
    name: 'cdp' as const,
    title: 'CDP Analytics',
    purposes: ['analytics'] as ConsentPurpose[],
    description: 'First-party behavioral analytics (pageviews, clicks, form submissions) collected by Busrom to measure product performance.',
    cookies: [/^busrom_cdp_/],
  },
  {
    name: 'gtm' as const,
    title: 'Google Tag Manager',
    purposes: ['analytics', 'marketing'] as ConsentPurpose[],
    description: 'Central container for analytics and marketing tags (e.g. GA4, Ads). Loads only after you opt in.',
    cookies: [/^_ga/, /^_gid/, /^_gcl/, /^IDE$/, /^_fbp$/],
  },
  {
    name: 'tawk' as const,
    title: 'Tawk.to Live Chat',
    purposes: ['functional'] as ConsentPurpose[],
    description: 'Third-party live-chat widget used to answer your questions in real time.',
    cookies: [/^TawkAPI/, /^__tawku/],
  },
  {
    name: 'cms-scripts' as const,
    title: 'Marketing & Tracking Scripts',
    purposes: ['marketing'] as ConsentPurpose[],
    description:
      'Additional tracking and marketing scripts managed by our team, including ' +
      'Microsoft Bing UET (conversion tracking), Meta Pixel, TikTok, and retargeting pixels.',
    cookies: [/.*/],
  },
]

/**
 * 构造 Klaro 配置。
 * 每次 locale 变化时调用一次（由 CookieConsentProvider 处理）。
 */
export function buildKlaroConfig(locale: Locale) {
  return {
    version: 1,
    elementID: 'klaro',
    noAutoLoad: false,
    htmlTexts: true,
    embedded: false,
    groupByPurpose: true,
    storageMethod: 'cookie' as const,
    cookieName: CONSENT_COOKIE_NAME,
    cookieDomain: CONSENT_COOKIE_DOMAIN,
    cookieExpiresAfterDays: 365,
    /** GDPR：默认全部拒绝，必须显式同意 */
    default: false,
    /** 是否必须点同意才能关掉弹窗。false=可在拒绝状态下继续浏览 */
    mustConsent: false,
    /** 是否在拒绝状态下仍显示"接受全部"按钮 */
    acceptAll: true,
    hideDeclineAll: false,
    hideLearnMore: false,
    noticeAsModal: false,
    disablePoweredBy: true,
    /** Klaro 默认 lang，传当前 locale（找不到会 fallback 到 en） */
    lang: locale,
    /** 关闭 UI 动效（避免 Lighthouse/CLS 抖动） */
    privacyPolicy: '/privacy-policy',
    services: SERVICES,
    purposes: {
      necessary: { description: '' },
      functional: { description: '' },
      analytics: { description: '' },
      marketing: { description: '' },
    },
    translations: {
      en: enTranslations,
      zh: zhTranslations,
      // 其余 22 种语言统一 fallback 到英文（Klaro 自动处理）
    },
  }
}

/* ------------------------------------------------------------------ */
/* 多语言文案（en / zh 完整，其余 locale 自动 fallback 到 en）         */
/* ------------------------------------------------------------------ */

const enTranslations = {
  consentNotice: {
    title: 'We value your privacy',
    description:
      'We and our partners use cookies and similar technologies to store and access information on your device. ' +
      'Necessary cookies are always active. For non-essential cookies, please choose your preference below.',
    learnMore: 'Customize',
  },
  consentModal: {
    title: 'Privacy preferences',
    description:
      'Here you can adjust the privacy categories you would like to enable. See our {privacyPolicy} for details.',
    privacyPolicyCaption: 'Privacy Policy',
  },
  purposes: {
    necessary: 'Strictly necessary',
    functional: 'Functionality',
    analytics: 'Analytics',
    marketing: 'Marketing',
  },
  service: {
    purpose: 'Purpose',
    required: 'Required',
  },
  ok: 'Accept all',
  decline: 'Decline all',
  acceptSelected: 'Save selection',
  close: 'Close',
  poweredBy: '',
}

const zhTranslations = {
  consentNotice: {
    title: '我们尊重您的隐私',
    description:
      '我们及合作伙伴使用 Cookie 和类似技术来存储和访问您设备上的信息。必要 Cookie 始终处于开启状态，其余类别请按需选择。',
    learnMore: '自定义',
  },
  consentModal: {
    title: '隐私偏好设置',
    description: '您可以在此调整要启用的隐私类别。详情请参阅我们的{privacyPolicy}。',
    privacyPolicyCaption: '隐私政策',
  },
  purposes: {
    necessary: '绝对必要',
    functional: '功能性',
    analytics: '统计分析',
    marketing: '营销',
  },
  service: {
    purpose: '用途',
    required: '必需',
  },
  ok: '全部接受',
  decline: '全部拒绝',
  acceptSelected: '保存选择',
  close: '关闭',
  poweredBy: '',
}
