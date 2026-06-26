'use client'

/**
 * CDP Analytics SDK
 *
 * 在 Busrom Web 客户端采集用户行为数据并上报到 CDP 服务。
 * 包含：visitor/session 管理、页面浏览、点击、表单提交、滚动深度、
 * UTM 参数、设备信息、IP 地理位置、渠道判断。
 */

export type CDPChannel = 'direct' | 'organic' | 'ad' | 'social' | 'referral' | 'unknown'

export type CDPEventType =
  | 'pageview'
  | 'click'
  | 'form_submit'
  | 'scroll_depth'
  | string

export interface CDPConfig {
  endpoint: string
  apiKey?: string
  debug?: boolean
  sessionTimeout?: number // 毫秒
}

export interface CDPTrackingEvent {
  sessionId: string
  visitorId: string
  pagePath: string
  pageTitle?: string
  referrer?: string
  channel?: CDPChannel
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  deviceType?: string
  browser?: string
  os?: string
  country?: string
  city?: string
  ipAddress?: string
  userAgent?: string
  screenResolution?: string
  language?: string
  eventType: CDPEventType
  eventData?: Record<string, unknown>
  timestamp: string
}

const DEFAULT_CONFIG: Required<Omit<CDPConfig, 'apiKey'>> & Pick<CDPConfig, 'apiKey'> = {
  endpoint: 'http://localhost:3003/api/analytics/track',
  apiKey: '',
  debug: false,
  sessionTimeout: 15 * 60 * 1000, // 15 分钟
}

const SEARCH_ENGINES = [
  'google',
  'bing',
  'yahoo',
  'baidu',
  'yandex',
  'duckduckgo',
  'ecosia',
  'startpage',
  'qwant',
]

const SOCIAL_DOMAINS = [
  'facebook',
  'twitter',
  'x.com',
  'instagram',
  'linkedin',
  'pinterest',
  'tiktok',
  'youtube',
  'reddit',
  'weibo',
  'wechat',
  'whatsapp',
  'telegram',
]

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function isClient(): boolean {
  return typeof window !== 'undefined'
}

function getStorageKey(prefix: string): string {
  return `busrom_cdp_${prefix}`
}

class CDPAnalytics {
  private config: Required<Omit<CDPConfig, 'apiKey'>> & Pick<CDPConfig, 'apiKey'>
  private visitorId: string
  private sessionId: string
  private lastActivity: number
  private initialized = false
  private scrollTriggered = false
  private geoInfo: { country?: string; city?: string; ipAddress?: string } = {}
  private unbinders: Array<() => void> = []

  constructor(config?: Partial<CDPConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.visitorId = this.getOrCreateVisitorId()
    this.sessionId = this.getOrCreateSessionId()
    this.lastActivity = Date.now()
  }

  /**
   * 初始化 SDK：补全地理位置、绑定事件监听、发送初始 pageview。
   */
  async init(): Promise<void> {
    if (!isClient() || this.initialized) return

    this.initialized = true

    await this.fetchGeoInfo()
    this.bindEventListeners()
    this.trackPageView()

    this.log('CDP Analytics initialized', {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
    })
  }

  /**
   * 销毁 SDK，移除已绑定的事件监听。
   */
  destroy(): void {
    this.unbinders.forEach((unbind) => unbind())
    this.unbinders = []
    this.initialized = false
  }

  /**
   * 追踪页面浏览事件。
   */
  trackPageView(): void {
    if (!isClient()) return

    this.checkSessionValidity()
    this.scrollTriggered = false

    this.send({
      eventType: 'pageview',
      pagePath: window.location.pathname + window.location.search,
      pageTitle: document.title,
      referrer: document.referrer || undefined,
      ...this.getUTMParams(),
      ...this.getDeviceInfo(),
      ...this.geoInfo,
      channel: this.detectChannel(),
    })
  }

  /**
   * 追踪自定义事件。
   */
  trackEvent(eventName: string, eventData?: Record<string, unknown>): void {
    if (!isClient()) return

    this.checkSessionValidity()

    this.send({
      eventType: eventName,
      pagePath: window.location.pathname + window.location.search,
      pageTitle: document.title,
      ...this.getDeviceInfo(),
      ...this.geoInfo,
      eventData,
    })
  }

  private send(event: Omit<CDPTrackingEvent, 'sessionId' | 'visitorId' | 'timestamp'>): void {
    this.updateActivity()

    const payload: CDPTrackingEvent = {
      ...event,
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      timestamp: new Date().toISOString(),
    }

    this.log('Sending event', payload)

    // 使用 sendBeacon 优先保证页面卸载时也能上报，失败回退到 fetch
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    const beaconSent =
      typeof navigator !== 'undefined' &&
      'sendBeacon' in navigator &&
      navigator.sendBeacon(this.config.endpoint, blob)

    if (!beaconSent) {
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((error) => {
        this.log('Failed to send event', error)
      })
    }
  }

  private bindEventListeners(): void {
    if (!isClient()) return

    // 页面可见性变化时检查会话是否过期
    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.checkSessionValidity()
      }
    }
    document.addEventListener('visibilitychange', visibilityHandler)
    this.unbinders.push(() => document.removeEventListener('visibilitychange', visibilityHandler))

    // 点击事件：采集带有 data-analytics-track 属性的元素
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      const trackable = target.closest<HTMLElement>('[data-analytics-track]')
      if (!trackable) return

      const trackName = trackable.getAttribute('data-analytics-track') || 'unknown'

      this.send({
        eventType: 'click',
        pagePath: window.location.pathname + window.location.search,
        pageTitle: document.title,
        ...this.getDeviceInfo(),
        eventData: {
          trackName,
          elementTag: trackable.tagName.toLowerCase(),
          elementId: trackable.id || undefined,
          elementClass: trackable.className || undefined,
          elementHref: (trackable as HTMLAnchorElement).href || undefined,
          elementText: trackable.textContent?.trim().slice(0, 200) || undefined,
        },
      })
    }
    document.addEventListener('click', clickHandler)
    this.unbinders.push(() => document.removeEventListener('click', clickHandler))

    // 表单提交事件
    const formSubmitHandler = (e: Event) => {
      const form = e.target as HTMLFormElement | null
      if (!form) return

      const formData = new FormData(form)
      const sanitizedData: Record<string, string> = {}

      formData.forEach((value, key) => {
        // 不采集密码类敏感字段
        const input = Array.from(form.querySelectorAll<HTMLInputElement>('input')).find(
          (el) => el.name === key
        )
        if (input && input.type === 'password') return
        sanitizedData[key] = String(value).slice(0, 500)
      })

      this.send({
        eventType: 'form_submit',
        pagePath: window.location.pathname + window.location.search,
        pageTitle: document.title,
        ...this.getDeviceInfo(),
        eventData: {
          formId: form.id || undefined,
          formAction: form.action || undefined,
          formMethod: form.method || undefined,
          formData: sanitizedData,
        },
      })
    }
    document.addEventListener('submit', formSubmitHandler)
    this.unbinders.push(() => document.removeEventListener('submit', formSubmitHandler))

    // 滚动深度：超过 50% 触发一次
    const scrollHandler = () => {
      if (this.scrollTriggered) return

      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const depth = scrollTop / docHeight
      if (depth > 0.5) {
        this.scrollTriggered = true

        this.send({
          eventType: 'scroll_depth',
          pagePath: window.location.pathname + window.location.search,
          pageTitle: document.title,
          ...this.getDeviceInfo(),
          eventData: {
            depthPercent: Math.round(depth * 100),
            pageHeight: document.documentElement.scrollHeight,
            viewportHeight: window.innerHeight,
          },
        })
      }
    }
    window.addEventListener('scroll', scrollHandler, { passive: true })
    this.unbinders.push(() => window.removeEventListener('scroll', scrollHandler))

    // 用户活动监听：用于刷新 lastActivity 与会话有效期
    const activityEvents = ['click', 'scroll', 'keydown', 'mousemove', 'touchstart']
    const activityHandler = () => this.updateActivity()
    activityEvents.forEach((eventName) => {
      document.addEventListener(eventName, activityHandler, { passive: true })
      this.unbinders.push(() => document.removeEventListener(eventName, activityHandler))
    })
  }

  private getOrCreateVisitorId(): string {
    if (!isClient()) return generateId()

    const stored = localStorage.getItem(getStorageKey('visitor_id'))
    if (stored) return stored

    const id = generateId()
    localStorage.setItem(getStorageKey('visitor_id'), id)
    return id
  }

  private getOrCreateSessionId(): string {
    if (!isClient()) return generateId()

    const storedId = sessionStorage.getItem(getStorageKey('session_id'))
    const storedDate = sessionStorage.getItem(getStorageKey('session_date'))
    const storedActivity = sessionStorage.getItem(getStorageKey('session_last_activity'))

    const today = new Date().toDateString()
    const now = Date.now()

    if (storedId && storedDate && storedActivity) {
      const lastActivityTime = parseInt(storedActivity, 10)
      const isSameDay = storedDate === today
      const isWithinTimeout = now - lastActivityTime < this.config.sessionTimeout

      if (isSameDay && isWithinTimeout) {
        this.lastActivity = lastActivityTime
        return storedId
      }
    }

    const id = generateId()
    sessionStorage.setItem(getStorageKey('session_id'), id)
    sessionStorage.setItem(getStorageKey('session_date'), today)
    sessionStorage.setItem(getStorageKey('session_last_activity'), now.toString())
    this.lastActivity = now
    return id
  }

  private checkSessionValidity(): void {
    if (!isClient()) return

    const today = new Date().toDateString()
    const storedDate = sessionStorage.getItem(getStorageKey('session_date'))
    const storedActivity = sessionStorage.getItem(getStorageKey('session_last_activity'))
    const now = Date.now()

    const isSameDay = storedDate === today
    const isWithinTimeout =
      storedActivity !== null && now - parseInt(storedActivity, 10) < this.config.sessionTimeout

    if (!isSameDay || !isWithinTimeout) {
      this.sessionId = generateId()
      sessionStorage.setItem(getStorageKey('session_id'), this.sessionId)
      sessionStorage.setItem(getStorageKey('session_date'), today)
      sessionStorage.setItem(getStorageKey('session_last_activity'), now.toString())
      this.lastActivity = now
      this.log('Session reset due to timeout or day change', { sessionId: this.sessionId })
    }
  }

  private updateActivity(): void {
    if (!isClient()) return

    this.lastActivity = Date.now()
    sessionStorage.setItem(getStorageKey('session_last_activity'), this.lastActivity.toString())
  }

  private getUTMParams(): {
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmTerm?: string
    utmContent?: string
  } {
    if (!isClient()) return {}

    const params = new URLSearchParams(window.location.search)
    return {
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      utmTerm: params.get('utm_term') || undefined,
      utmContent: params.get('utm_content') || undefined,
    }
  }

  private getDeviceInfo(): {
    deviceType?: string
    browser?: string
    os?: string
    screenResolution?: string
    language?: string
    userAgent?: string
  } {
    if (!isClient()) return {}

    const ua = navigator.userAgent
    return {
      deviceType: this.getDeviceType(ua),
      browser: this.getBrowser(ua),
      os: this.getOS(ua),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      userAgent: ua,
    }
  }

  private getDeviceType(ua: string): string {
    if (/tablet|ipad/i.test(ua)) return 'tablet'
    if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile'
    return 'desktop'
  }

  private getBrowser(ua: string): string {
    if (/edg/i.test(ua)) return 'Edge'
    if (/opr|opera|opt/i.test(ua)) return 'Opera'
    if (/chrome|chromium|crios/i.test(ua)) return 'Chrome'
    if (/safari/i.test(ua)) return 'Safari'
    if (/firefox|fxios/i.test(ua)) return 'Firefox'
    return 'Unknown'
  }

  private getOS(ua: string): string {
    if (/windows nt/i.test(ua)) return 'Windows'
    if (/macintosh|mac os/i.test(ua)) return 'macOS'
    if (/android/i.test(ua)) return 'Android'
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
    if (/linux/i.test(ua)) return 'Linux'
    return 'Unknown'
  }

  private async fetchGeoInfo(): Promise<void> {
    if (!isClient()) return

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      clearTimeout(timeoutId)

      if (!response.ok) return

      const data = await response.json()
      this.geoInfo = {
        country: typeof data.country_name === 'string' ? data.country_name : undefined,
        city: typeof data.city === 'string' ? data.city : undefined,
        ipAddress: typeof data.ip === 'string' ? data.ip : undefined,
      }
      this.log('Geo info fetched', this.geoInfo)
    } catch (error) {
      this.log('Failed to fetch geo info', error)
    }
  }

  private detectChannel(): CDPChannel {
    if (!isClient()) return 'unknown'

    const utmSource = this.getUTMParams().utmSource
    if (utmSource) return 'ad'

    const referrer = document.referrer
    if (!referrer) return 'direct'

    try {
      const referrerHost = new URL(referrer).hostname.toLowerCase()
      const currentHost = window.location.hostname.toLowerCase()

      if (referrerHost === currentHost || referrerHost.endsWith(`.${currentHost}`)) {
        return 'direct'
      }

      if (SEARCH_ENGINES.some((engine) => referrerHost.includes(engine))) {
        return 'organic'
      }

      if (SOCIAL_DOMAINS.some((domain) => referrerHost.includes(domain))) {
        return 'social'
      }

      return 'referral'
    } catch {
      return 'unknown'
    }
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log('[Busrom CDP]', ...args)
    }
  }
}

let globalInstance: CDPAnalytics | null = null

export function createCDPAnalytics(config?: Partial<CDPConfig>): CDPAnalytics {
  return new CDPAnalytics(config)
}

export function getCDPAnalytics(config?: Partial<CDPConfig>): CDPAnalytics {
  if (!globalInstance) {
    globalInstance = new CDPAnalytics(config)
  }
  return globalInstance
}

export function resetCDPAnalytics(): void {
  globalInstance?.destroy()
  globalInstance = null
}

export default CDPAnalytics
