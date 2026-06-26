# Frontend Tracking SDK Gap Analysis

**Scope:** Audit `web/lib/analytics.ts` (the SDK loaded by `web/app/components/CDPProvider.tsx`) against the requirements in `docs/CDP开发文档.md` and the downstream ETL in `cdp/src/jobs/etl.ts`.

**References**
- Active SDK: `web/lib/analytics.ts`
- Provider: `web/app/components/CDPProvider.tsx`
- Legacy SDK: `web/lib/cdp/tracker.ts` (unused by the active provider)
- Backend track API: `cdp/src/app/api/analytics/track/route.ts`
- Backend schema: `cdp/src/db/schema.ts`
- Backend ETL: `cdp/src/jobs/etl.ts`

---

## 1. Current SDK capabilities

`web/lib/analytics.ts` exposes a single `CDPAnalytics` class. The active provider `CDPProvider.tsx` calls `getCDPAnalytics(...)` once per `pathname` change.

### 1.1 Event types currently emitted

| Event type | Trigger | Fields sent | Limitations |
|------------|---------|-------------|-------------|
| `pageview` | `init()` on first mount + `trackPageView()` on every Next.js route change | `sessionId`, `visitorId`, `pagePath` (`pathname + search`), `pageTitle`, `referrer`, `channel`, all UTM params, all device/geo fields, `timestamp` | No page sequence index, no page-load timing, no entry/exit flag. |
| `click` | Click on an element with `data-analytics-track` only | Same core IDs + `pagePath`, `pageTitle`, `deviceInfo`, `eventData.trackName`, `elementTag`, `elementId`, `elementClass`, `elementHref`, `elementText` | **Does not track normal links/buttons**. Uses `elementHref` while ETL looks for `href`. No automatic WhatsApp/Email/Chat classification. |
| `form_submit` | Any `<form>` submit | Same core IDs + `pagePath`, `pageTitle`, `deviceInfo`, `eventData.formId`, `formAction`, `formMethod`, `formData` (passwords stripped) | Captured correctly, but `channel`/`UTM` are not repeated on the event. |
| `scroll_depth` | Scroll > 50% on a page, once per page | Same core IDs + `pagePath`, `pageTitle`, `deviceInfo`, `eventData.depthPercent`, `pageHeight`, `viewportHeight` | Only a single 50% threshold; no 25/75/90/100 milestones. |
| custom | `trackEvent(name, data)` | Generic | No dedicated `conversion`/`lead` helpers. |

### 1.2 Data fields already collected

- **Identity:** `sessionId` (sessionStorage, 15 min / cross-day timeout), `visitorId` (localStorage).
- **Page context:** `pagePath`, `pageTitle`, `referrer`.
- **Attribution:** `channel` (direct / organic / ad / social / referral / unknown), `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent`.
- **Device:** `deviceType`, `browser`, `os`, `screenResolution`, `language`, `userAgent`.
- **Geo:** `country`, `city`, `ipAddress` (from `ipapi.co/json`, no cache).
- **Envelope:** `eventType`, `eventData`, `timestamp`.

### 1.3 Transport & lifecycle

- Uses `navigator.sendBeacon` with `fetch(keepalive)` fallback.
- Refreshes session on `visibilitychange === 'visible'`.
- Updates `lastActivity` on `click/scroll/keydown/mousemove/touchstart`.
- Does **not** currently detect bots, cache geo, or send any page-leave / heartbeat signal.

---

## 2. Required metrics from `docs/CDP开发文档.md`

| Metric category | Metric | Frontend data required |
|-----------------|--------|------------------------|
| **Basic** | PV | `pageview` events |
| | UV | `visitorId` |
| | Sessions | `sessionId` |
| | PV / Sessions | derived from above |
| | Bounce rate | `pageview` + a signal that the visitor left after one page (pageleave / heartbeat / dwell time) |
| | Avg. duration | timestamps of first and **last** activity in a session (pageleave / heartbeat strongly preferred) |
| | Conversion count | `form_submit` + chat/WhatsApp/Email conversion events |
| | Conversion rate | conversions ÷ sessions |
| **Channel** | Organic / Ad / Direct / Referral / Social visits | `channel` on pageview |
| | Channel bounce rate | same bounce requirements, broken down by first channel |
| **Pages & paths** | Top pages | `pageview` `pagePath` |
| | Entry pages | first `pagePath` of each session |
| | Exit pages | **last page before the session ends** |
| | Popular paths | ordered page sequence within a session |
| **Forms & leads** | Form submission count | `form_submit` events |
| | Form conversion rate | forms ÷ sessions |
| | Lead count | explicit WhatsApp / Email click events |
| **User profile** | Device / Browser / Country | device/geo fields |

---

## 3. Gap matrix

| Metric | Frontend coverage | Notes |
|--------|-------------------|-------|
| PV | ✅ Fully tracked | `pageview` emitted on every route change and first load. |
| UV | ✅ Fully tracked | `visitorId` persisted in `localStorage`. |
| Sessions | ✅ Fully tracked | `sessionId` with 15 min / cross-day reset. |
| PV / Sessions | ✅ Derived by ETL | No frontend gap. |
| **Bounce rate** | ⚠️ Partially tracked | ETL marks a session as bounce when `pagePaths.length <= 1`. Without `pageleave`/`heartbeat`, single-page sessions always appear as bounces with `duration = 0`, even if the user read the page for minutes. |
| **Avg. duration** | ⚠️ Partially tracked | Duration is `lastTimestamp - firstTimestamp`. For a single `pageview` session this is `0`. Needs active dwell-time events. |
| Conversion count | ⚠️ Partially tracked | `form_submit` is captured. Chat / WhatsApp / Email are **not** explicitly tracked as conversions. |
| Conversion rate | ⚠️ Depends on conversions | Will be under-counted until conversion events are sent. |
| Channel visits | ✅ Fully tracked | `detectChannel()` handles UTM + referrer logic. |
| Channel bounce rate | ⚠️ Depends on bounce fix | Same gap as bounce rate. |
| Top pages | ✅ Fully tracked | `pagePath` on every `pageview`. |
| Entry pages | ✅ Fully tracked | First `pageview` of each session. |
| **Exit pages** | ❌ Not tracked | No `pageleave` event; backend cannot know the final page of a session. |
| Popular paths | ⚠️ Partially tracked | Path sequence exists from `pageview`s, but without exit tracking the "end" of the path is uncertain. |
| Form submission count | ✅ Fully tracked | `form_submit` listener on `document`. |
| Form conversion rate | ✅ Derived by ETL | No frontend gap. |
| **Lead count** | ❌ Not tracked | WhatsApp / Email clicks are not tagged or sent as `lead`/`conversion` events. ETL fallback regex currently cannot match them because (a) normal links are not tracked and (b) the SDK sends `elementHref` while ETL checks `eventData.href`. |
| Device / Browser / Country | ✅ Fully tracked | Device info + geo lookup present. |
| 7/30-day trends | ✅ ETL responsibility | No frontend gap. |

---

## 4. Implementation plan

### 4.1 Add missing event types and session-level state

Extend the type union and add runtime state to the `CDPAnalytics` class in `web/lib/analytics.ts`.

```ts
export type CDPEventType =
  | 'pageview'
  | 'pageleave'
  | 'heartbeat'
  | 'click'
  | 'scroll_depth'
  | 'conversion'
  | 'lead'
  | 'form_submit'
  | string

// add to CDPConfig
export interface CDPConfig {
  endpoint: string
  apiKey?: string
  debug?: boolean
  sessionTimeout?: number          // default 15 min
  heartbeatInterval?: number       // default 10_000 ms
}

// add to class fields
private currentPagePath = ''
private pageEnterAt = 0
private heartbeatTimer: ReturnType<typeof setInterval> | null = null
private heartbeatCount = 0
private scrollMilestones = new Set<number>()
```

### 4.2 Page dwell time & heartbeat

Record page entry time on every `pageview` and emit periodic `heartbeat` events while the tab is visible.

```ts
trackPageView(): void {
  if (!isClient()) return

  this.checkSessionValidity()

  // leave previous SPA page before counting the new one
  if (this.currentPagePath) {
    this.trackPageLeave('route_change')
  }

  this.scrollMilestones.clear()
  this.pageEnterAt = Date.now()
  this.currentPagePath = window.location.pathname + window.location.search
  this.heartbeatCount = 0

  this.stopHeartbeat()
  this.startHeartbeat()

  this.send({
    eventType: 'pageview',
    pagePath: this.currentPagePath,
    pageTitle: document.title,
    referrer: document.referrer || undefined,
    channel: this.detectChannel(),
    ...this.getUTMParams(),
    ...this.getDeviceInfo(),
    ...this.geoInfo,
  })
}

private startHeartbeat(): void {
  if (!isClient() || this.heartbeatTimer) return
  this.heartbeatTimer = setInterval(() => {
    if (document.visibilityState !== 'visible') return
    this.trackHeartbeat()
  }, this.config.heartbeatInterval)
}

private stopHeartbeat(): void {
  if (this.heartbeatTimer) {
    clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = null
  }
}

private trackHeartbeat(): void {
  if (!this.currentPagePath) return
  this.send({
    eventType: 'heartbeat',
    pagePath: this.currentPagePath,
    pageTitle: document.title,
    channel: this.detectChannel(),
    ...this.getDeviceInfo(),
    ...this.geoInfo,
    eventData: {
      durationSeconds: Math.round((Date.now() - this.pageEnterAt) / 1000),
      heartbeatNumber: ++this.heartbeatCount,
    },
  })
}
```

### 4.3 Page leave / visibilitychange / route change

Send a `pageleave` event with the time spent on the page whenever the tab is hidden, the page unloads, or the SPA route changes.

```ts
trackPageLeave(reason: 'beforeunload' | 'visibilitychange' | 'route_change' = 'beforeunload'): void {
  if (!this.currentPagePath || !this.pageEnterAt) return

  this.send({
    eventType: 'pageleave',
    pagePath: this.currentPagePath,
    pageTitle: document.title,
    channel: this.detectChannel(),
    ...this.getDeviceInfo(),
    ...this.geoInfo,
    eventData: {
      durationSeconds: Math.round((Date.now() - this.pageEnterAt) / 1000),
      reason,
    },
  })

  this.stopHeartbeat()
}
```

Bind in `bindEventListeners()`:

```ts
// page visibility -> session check on visible, pageleave on hidden
const visibilityHandler = () => {
  if (document.visibilityState === 'visible') {
    this.checkSessionValidity()
  } else {
    this.trackPageLeave('visibilitychange')
  }
}
document.addEventListener('visibilitychange', visibilityHandler)
this.unbinders.push(() => document.removeEventListener('visibilitychange', visibilityHandler))

// unload
const unloadHandler = () => this.trackPageLeave('beforeunload')
window.addEventListener('beforeunload', unloadHandler)
this.unbinders.push(() => window.removeEventListener('beforeunload', unloadHandler))
```

Update `CDPProvider.tsx` to call `trackPageLeave('route_change')` before each route-driven `pageview`:

```tsx
useEffect(() => {
  if (typeof window === 'undefined') return

  const analytics = getCDPAnalytics({ endpoint: CDP_ENDPOINT, debug: CDP_DEBUG })

  if (!initializedRef.current) {
    analytics.init()
    initializedRef.current = true
  } else {
    analytics.trackPageLeave('route_change')
    analytics.trackPageView()
  }
}, [pathname])
```

### 4.4 Automatic click tracking on links and buttons

Replace the opt-in `data-analytics-track` only handler with a handler that also captures all `<a>`, `<button>`, and `[role="button"]` elements. Keep `data-analytics-track` as an explicit label.

```ts
const clickHandler = (e: MouseEvent) => {
  const target = e.target as HTMLElement | null
  if (!target) return

  const explicit = target.closest<HTMLElement>('[data-analytics-track]')
  const interactive = target.closest<HTMLElement>('a, button, [role="button"]')
  const el = explicit || interactive
  if (!el) return

  const href = (el as HTMLAnchorElement).href || undefined
  const text = el.textContent?.trim().slice(0, 200) || undefined

  const eventData = {
    trackName: el.getAttribute('data-analytics-track') || 'auto',
    elementTag: el.tagName.toLowerCase(),
    elementId: el.id || undefined,
    elementClass: el.className || undefined,
    href,
    elementText: text,
    isExternal: href
      ? new URL(href, window.location.href).hostname !== window.location.hostname
      : undefined,
  }

  this.send({
    eventType: 'click',
    pagePath: window.location.pathname + window.location.search,
    pageTitle: document.title,
    channel: this.detectChannel(),
    ...this.getDeviceInfo(),
    ...this.geoInfo,
    eventData,
  })

  // ---- automatic lead / conversion classification ----
  const lowerHref = (href || '').toLowerCase()
  const lowerText = (text || '').toLowerCase()
  const lowerClass = (eventData.elementClass || '').toLowerCase()
  const lowerId = (eventData.elementId || '').toLowerCase()

  if (
    lowerHref.includes('wa.me') ||
    lowerHref.includes('whatsapp') ||
    el.getAttribute('data-analytics-lead') === 'whatsapp'
  ) {
    this.trackLead('whatsapp', { href, text })
  } else if (
    lowerHref.startsWith('mailto:') ||
    el.getAttribute('data-analytics-lead') === 'email'
  ) {
    this.trackLead('email', { href, text })
  } else if (
    lowerHref.startsWith('tel:') ||
    el.getAttribute('data-analytics-lead') === 'phone'
  ) {
    this.trackLead('phone', { href, text })
  } else if (
    el.getAttribute('data-analytics-conversion') === 'chat' ||
    /chat|在线客服|在线聊天|客服|contact us|send inquiry|get quote/.test(
      `${lowerText} ${lowerClass} ${lowerId}`
    )
  ) {
    this.trackConversion('chat', { href, text })
  } else if (el.getAttribute('data-analytics-conversion')) {
    this.trackConversion(el.getAttribute('data-analytics-conversion') || 'generic', { href, text })
  }
}
```

### 4.5 Scroll depth milestones

Change the single 50% threshold to multiple milestones and reset them on every `pageview`.

```ts
// in trackPageView()
this.scrollMilestones.clear()

const scrollHandler = () => {
  if (!isClient()) return
  const docHeight = document.documentElement.scrollHeight
  const viewportHeight = window.innerHeight
  const scrollTop = window.scrollY || document.documentElement.scrollTop

  if (docHeight <= viewportHeight) return

  const depthPercent = Math.min(
    100,
    Math.round(((scrollTop + viewportHeight) / docHeight) * 100)
  )

  for (const milestone of [25, 50, 75, 90, 100]) {
    if (depthPercent >= milestone && !this.scrollMilestones.has(milestone)) {
      this.scrollMilestones.add(milestone)
      this.send({
        eventType: 'scroll_depth',
        pagePath: window.location.pathname + window.location.search,
        pageTitle: document.title,
        channel: this.detectChannel(),
        ...this.getDeviceInfo(),
        ...this.geoInfo,
        eventData: {
          depthPercent,
          milestone,
          pageHeight: docHeight,
          viewportHeight,
        },
      })
    }
  }
}
```

### 4.6 Lead & conversion helper API

Add explicit tracking methods so components can call them directly and so the automatic click classifier can emit the right events.

```ts
trackConversion(conversionType: string, data?: Record<string, unknown>): void {
  if (!isClient()) return
  this.checkSessionValidity()
  this.send({
    eventType: 'conversion',
    pagePath: window.location.pathname + window.location.search,
    pageTitle: document.title,
    channel: this.detectChannel(),
    ...this.getDeviceInfo(),
    ...this.geoInfo,
    eventData: { conversionType, ...data },
  })
}

trackLead(leadType: 'whatsapp' | 'email' | 'phone' | string, data?: Record<string, unknown>): void {
  if (!isClient()) return
  this.checkSessionValidity()
  this.send({
    eventType: 'lead',
    pagePath: window.location.pathname + window.location.search,
    pageTitle: document.title,
    channel: this.detectChannel(),
    ...this.getDeviceInfo(),
    ...this.geoInfo,
    eventData: { leadType, ...data },
  })
}
```

Use the helpers (or attributes) in the components that own the lead CTAs:
- `web/components/layout/floating-contact-buttons.tsx` — add `data-analytics-lead="whatsapp"` to the WhatsApp anchor and `data-analytics-lead="email"` to the Email anchor.
- `web/components/layout/contact-popup.tsx` — add `data-analytics-conversion="chat"` to the chat `<button>` and `data-analytics-lead="whatsapp|email"` to the other options.

Example markup change:

```tsx
<a
  href={`https://wa.me/${whatsapp.linkUrl.replace(/\D/g, '')}`}
  data-analytics-lead="whatsapp"
  ...
>
  ...
</a>
```

### 4.7 Bot filtering & geo caching (recommended)

Skip tracking for known bots and avoid calling `ipapi.co` on every route change.

```ts
async init(): Promise<void> {
  if (!isClient() || this.initialized) return

  // Skip bots
  if (document.documentElement.classList.contains('is-bot')) return

  this.initialized = true

  await this.fetchGeoInfo()   // internally cache in sessionStorage
  this.bindEventListeners()
  this.trackPageView()
}
```

Cache implementation inside `fetchGeoInfo()`:

```ts
private async fetchGeoInfo(): Promise<void> {
  if (!isClient()) return

  const cached = sessionStorage.getItem(getStorageKey('geo_info'))
  if (cached) {
    try { this.geoInfo = JSON.parse(cached); return } catch {}
  }

  // existing fetch logic ...
  this.geoInfo = { country, city, ipAddress }
  sessionStorage.setItem(getStorageKey('geo_info'), JSON.stringify(this.geoInfo))
}
```

---

## 5. Files to change

| File | Change |
|------|--------|
| `web/lib/analytics.ts` | Add event types, heartbeat/pageleave logic, enhanced click tracking, scroll milestones, lead/conversion helpers, bot filter, geo cache. |
| `web/app/components/CDPProvider.tsx` | Call `trackPageLeave('route_change')` before each subsequent `trackPageView()`. |
| `web/components/layout/floating-contact-buttons.tsx` | Add `data-analytics-lead` attributes to WhatsApp/Email anchors. |
| `web/components/layout/contact-popup.tsx` | Add `data-analytics-lead` / `data-analytics-conversion` attributes to popup options. |
| `cdp/src/jobs/etl.ts` | Recognize `eventType === 'lead'` for `leadPages`; use `heartbeat`/`pageleave` timestamps to compute accurate session duration and bounce threshold. |

No schema change is required because `traffic_raw.eventType` is a `varchar(50)`.

---

## 6. Backend ETL alignment required

The frontend changes above unlock the missing metrics, but the ETL must also be updated to consume the new events:

1. **Lead events:** `calculateSessionMetrics()` currently only populates `leadPages` via `isLeadEvent(record)`, which returns `true` for `eventType === 'conversion'` or click-pattern heuristics. Add `eventType === 'lead'` so explicit lead events are counted.

2. **Dwell time:** Update duration calculation from `lastRawTimestamp - firstRawTimestamp` to `lastPageleaveOrHeartbeatTimestamp - firstPageviewTimestamp`.

3. **Bounce rule:** Define a minimum dwell-time threshold (e.g., 5 seconds) so that a single `pageview` with a subsequent `heartbeat` or `pageleave` duration below the threshold is counted as a bounce, while longer single-page reads are not.

---

## 7. Summary of gaps

The current SDK is solid for **PV, UV, Sessions, channel attribution, device/geo breakdown, top pages, entry pages, and form submissions**. It is **missing or incomplete** for:

1. **Bounce rate & avg. duration** — no `heartbeat` / `pageleave` events.
2. **Exit pages** — no `pageleave` event on tab close or SPA route change.
3. **Popular paths** — works from `pageview`s, but exit/last page is uncertain without page-leave tracking.
4. **Lead count** — WhatsApp / Email clicks are not tracked as leads.
5. **Conversion count** — chat / WhatsApp / Email are not tracked as conversions.
6. **Click coverage** — only opt-in `data-analytics-track` elements are tracked.
7. **Scroll depth** — only one 50% milestone.

Implementing Sections 4.1–4.7 in `web/lib/analytics.ts` and the small ETL updates in Section 6 will close all identified gaps.
