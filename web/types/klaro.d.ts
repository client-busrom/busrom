/**
 * Klaro 类型声明
 *
 * Klaro 0.7.x 未自带 TypeScript 类型定义，
 * 这里提供最小够用的声明，供 lib/consent 与 components/consent 使用。
 */

declare module 'klaro' {
  export interface KlaroApp {
    name: string
    title?: string
    purposes: string[]
    description?: string
    default?: boolean
    required?: boolean
    optOut?: boolean
    onlyOnce?: boolean
    cookies?: (string | RegExp)[]
    callback?: (consent: boolean, app: KlaroApp) => void
  }

  export interface KlaroConfig {
    version?: number
    elementID?: string
    noAutoLoad?: boolean
    htmlTexts?: boolean
    embedded?: boolean
    groupByPurpose?: boolean
    storageMethod?: 'cookie' | 'localStorage'
    cookieName?: string
    cookieDomain?: string
    cookieExpiresAfterDays?: number
    default?: boolean
    mustConsent?: boolean
    acceptAll?: boolean
    hideDeclineAll?: boolean
    hideLearnMore?: boolean
    noticeAsModal?: boolean
    disablePoweredBy?: boolean
    lang?: string
    privacyPolicy?: string
    services?: KlaroApp[]
    purposes?: Record<string, { description?: string }>
    translations?: Record<string, unknown>
    callback?: (consent: Record<string, boolean>, app: KlaroApp) => void
    [key: string]: unknown
  }

  export interface KlaroManager {
    confirmed: boolean
    changed: boolean
    getConsent(name: string): boolean
    changeAll(states: Record<string, boolean>): void
    saveAndApplyConsents(): void
    watch(opts: { update: () => void }): void
  }

  export function setup(config: KlaroConfig): KlaroManager
  export function show(config?: KlaroConfig): void
  export function showDialogContent(): void
  export function manage(config?: KlaroConfig): void
  export function getManager(config?: KlaroConfig): KlaroManager
  export function reset(config?: KlaroConfig): void

  const Klaro: {
    setup: typeof setup
    show: typeof show
    manage: typeof manage
    getManager: typeof getManager
    reset: typeof reset
  }
  export default Klaro
}
