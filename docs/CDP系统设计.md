# 05 - CDP 系统设计

> **阅读时间**: 20 分钟  
> **适用对象**: 后端开发工程师、数据分析师

---

## 🎯 CDP 系统目标

构建一个**客户数据平台 (Customer Data Platform)**，用于：

1. **追踪用户行为**: 页面浏览、表单提交、按钮点击等
2. **数据存储**: 原始埋点数据 + 汇总统计数据
3. **可视化分析**: 实时大屏展示关键指标
4. **智能优化**: AI 驱动的 SEO 和广告优化建议

---

## ✅ 开发任务清单

### Phase 1: 埋点基础设施 (优先级: P0)
- [ ] 前端埋点 SDK 集成
- [ ] 后端事件接收 API (`POST /api/v1/track/event`)
- [ ] 原始数据存储表 (`TrafficRaw`)
- [ ] Session 管理逻辑

### Phase 2: 数据汇总 (优先级: P1)
- [ ] ETL 定时任务 (每小时 + 每日)
- [ ] 汇总统计表 (`TrafficSummary`)
- [ ] 指标计算逻辑 (PV/UV/Sessions/转化率)

### Phase 3: 可视化大屏 (优先级: P1)
- [ ] Keystone CMS 后台 `/admin/cdp` 模块
- [ ] 实时指标卡片
- [ ] 图表组件 (Recharts / Chart.js)
- [ ] 数据导出功能

### Phase 4: AI 优化建议 (优先级: P2)
- [ ] AWS LightGBM 模型训练
- [ ] Gemini/ChatGPT API 集成
- [ ] 优化建议生成

---

## 📊 数据模型设计

### 1. TrafficRaw (原始埋点数据)

```sql
CREATE TABLE traffic_raw (
  id SERIAL PRIMARY KEY,
  
  -- 事件基础信息
  event_type VARCHAR(50) NOT NULL,  -- 'page_view', 'form_submit', 'cta_click', etc.
  event_name VARCHAR(100),
  
  -- 用户标识
  session_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100),  -- 如果用户已登录
  
  -- 页面信息
  page_url TEXT NOT NULL,
  page_title VARCHAR(255),
  referrer TEXT,
  locale VARCHAR(10),
  
  -- 设备信息
  user_agent TEXT,
  ip_address VARCHAR(45),
  device_type VARCHAR(20),  -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(50),
  os VARCHAR(50),
  
  -- 地理位置 (基于 IP)
  country VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- 渠道信息
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  
  -- 事件属性 (JSON)
  properties JSONB,
  
  -- 时间戳
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- 索引
  INDEX idx_session (session_id),
  INDEX idx_event_type (event_type),
  INDEX idx_timestamp (timestamp),
  INDEX idx_page_url (page_url(255))
);
```

---

### 2. TrafficSummary (汇总统计数据)

```sql
CREATE TABLE traffic_summary (
  id SERIAL PRIMARY KEY,
  
  -- 时间维度
  date DATE NOT NULL,
  hour INTEGER,  -- 0-23, NULL 表示全天汇总
  
  -- 页面维度
  page_url TEXT,  -- NULL 表示全站汇总
  
  -- 渠道维度
  source VARCHAR(50),  -- 'organic', 'ad', 'direct', 'referral', 'social'
  utm_source VARCHAR(100),
  
  -- 设备维度
  device_type VARCHAR(20),
  
  -- 地理维度
  country VARCHAR(2),
  
  -- 语言维度
  locale VARCHAR(10),
  
  -- 核心指标
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2),  -- 百分比
  avg_session_duration INTEGER,  -- 秒
  
  -- 转化指标
  form_submissions INTEGER DEFAULT 0,
  cta_clicks INTEGER DEFAULT 0,
  inquiry_clicks INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  
  -- 元数据
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- 唯一索引 (防止重复汇总)
  UNIQUE INDEX idx_unique_summary (
    date, 
    COALESCE(hour, -1), 
    COALESCE(page_url, ''), 
    COALESCE(source, ''),
    COALESCE(device_type, ''),
    COALESCE(country, ''),
    COALESCE(locale, '')
  )
);
```

---

### 3. Session 管理逻辑

**Session 定义规则**:
- 同一个 `session_id` 的事件属于同一个 Session
- Session 超时: **15 分钟无活动** 或 **跨越 00:00 UTC**

```typescript
// lib/cdp/session.ts
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 21)

export function generateSessionId(): string {
  return `sess_${nanoid()}`
}

export function isSessionExpired(lastActivityAt: Date): boolean {
  const now = new Date()
  const diff = now.getTime() - lastActivityAt.getTime()
  
  // 超过 15 分钟
  if (diff > 15 * 60 * 1000) return true
  
  // 跨越了 00:00 UTC
  if (lastActivityAt.getUTCDate() !== now.getUTCDate()) return true
  
  return false
}
```

---

## 🔌 前端埋点 SDK

### 1. 埋点 SDK 集成

```typescript
// lib/cdp/tracker.ts
class BusromTracker {
  private sessionId: string
  private apiEndpoint = '/api/v1/track/event'
  
  constructor() {
    this.sessionId = this.getOrCreateSessionId()
    this.initPageViewTracking()
  }
  
  private getOrCreateSessionId(): string {
    const key = 'busrom_session_id'
    let sessionId = sessionStorage.getItem(key)
    
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36)}`
      sessionStorage.setItem(key, sessionId)
    }
    
    return sessionId
  }
  
  private async sendEvent(event: TrackingEvent) {
    const payload = {
      ...event,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      context: {
        userAgent: navigator.userAgent,
        locale: document.documentElement.lang,
        referrer: document.referrer,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      }
    }
    
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true  // 确保页面关闭时也能发送
      })
    } catch (error) {
      console.error('Tracking error:', error)
    }
  }
  
  // 页面浏览
  trackPageView() {
    this.sendEvent({
      event: 'page_view',
      properties: {
        page: window.location.pathname,
        title: document.title,
      }
    })
  }
  
  // 表单提交
  trackFormSubmit(formName: string, formData: any) {
    this.sendEvent({
      event: 'form_submit',
      properties: {
        formName,
        ...formData
      }
    })
  }
  
  // CTA 点击
  trackCTAClick(buttonText: string, targetUrl: string) {
    this.sendEvent({
      event: 'cta_click',
      properties: {
        buttonText,
        targetUrl,
        page: window.location.pathname
      }
    })
  }
  
  // 产品浏览
  trackProductView(productSku: string, productName: string) {
    this.sendEvent({
      event: 'product_view',
      properties: {
        sku: productSku,
        name: productName
      }
    })
  }
  
  // 自动追踪页面浏览
  private initPageViewTracking() {
    // 首次加载
    this.trackPageView()
    
    // SPA 路由变化
    if (typeof window !== 'undefined') {
      const originalPushState = history.pushState
      history.pushState = function(...args) {
        originalPushState.apply(history, args)
        tracker.trackPageView()
      }
    }
  }
}

export const tracker = new BusromTracker()
```

---

### 2. 在 Next.js 中使用

```tsx
// app/[locale]/layout.tsx
'use client'

import { useEffect } from 'react'
import { tracker } from '@/lib/cdp/tracker'

export default function RootLayout({ children }) {
  useEffect(() => {
    // 自动初始化追踪
    tracker.trackPageView()
  }, [])
  
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

```tsx
// components/ContactForm.tsx
'use client'

import { tracker } from '@/lib/cdp/tracker'

export function ContactForm() {
  const handleSubmit = async (data) => {
    // 提交表单
    await submitForm(data)
    
    // 追踪事件
    tracker.trackFormSubmit('contact', {
      name: data.name,
      email: data.email,
      source: window.location.pathname
    })
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## 🔧 后端事件接收 API

```typescript
// app/api/v1/track/event/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/db'
import { lookup } from 'geoip-lite'
import UAParser from 'ua-parser-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 解析 User-Agent
    const ua = UAParser(body.context.userAgent)
    
    // 解析 IP 地理位置
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const geo = ip !== 'unknown' ? lookup(ip) : null
    
    // 解析 UTM 参数
    const url = new URL(body.properties.page, 'https://busrom.com')
    const utmSource = url.searchParams.get('utm_source')
    const utmMedium = url.searchParams.get('utm_medium')
    const utmCampaign = url.searchParams.get('utm_campaign')
    
    // 插入数据库
    const db = await createClient()
    await db.trafficRaw.create({
      data: {
        eventType: body.event,
        eventName: body.properties.formName || body.properties.buttonText,
        sessionId: body.sessionId,
        pageUrl: body.properties.page,
        pageTitle: body.properties.title,
        referrer: body.context.referrer,
        locale: body.context.locale,
        userAgent: body.context.userAgent,
        ipAddress: ip,
        deviceType: ua.device.type || 'desktop',
        browser: ua.browser.name,
        os: ua.os.name,
        country: geo?.country,
        region: geo?.region,
        city: geo?.city,
        utmSource,
        utmMedium,
        utmCampaign,
        properties: body.properties,
        timestamp: new Date(body.timestamp),
      }
    })
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Track event error:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

---

## ⚙️ ETL 定时任务

### 1. 每小时汇总任务

```typescript
// keystone/tasks/hourly-summary.ts
import { PrismaClient } from '@prisma/client'

export async function runHourlySummary() {
  const prisma = new PrismaClient()
  const now = new Date()
  const hour = now.getUTCHours()
  const date = now.toISOString().split('T')[0]
  
  console.log(`📊 Running hourly summary for ${date} hour ${hour}`)
  
  // 汇总全站数据
  await summarizeTraffic(prisma, date, hour, null)
  
  // 汇总每个页面的数据
  const pages = await prisma.trafficRaw.findMany({
    where: {
      timestamp: {
        gte: new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00Z`),
        lt: new Date(`${date}T${(hour + 1).toString().padStart(2, '0')}:00:00Z`)
      }
    },
    distinct: ['pageUrl'],
    select: { pageUrl: true }
  })
  
  for (const { pageUrl } of pages) {
    await summarizeTraffic(prisma, date, hour, pageUrl)
  }
  
  console.log(`✅ Hourly summary completed`)
}

async function summarizeTraffic(
  prisma: PrismaClient,
  date: string,
  hour: number,
  pageUrl: string | null
) {
  const whereClause: any = {
    timestamp: {
      gte: new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00Z`),
      lt: new Date(`${date}T${(hour + 1).toString().padStart(2, '0')}:00:00Z`)
    }
  }
  
  if (pageUrl) {
    whereClause.pageUrl = pageUrl
  }
  
  // 计算指标
  const pageViews = await prisma.trafficRaw.count({ where: whereClause })
  
  const uniqueVisitors = await prisma.trafficRaw.groupBy({
    by: ['ipAddress'],
    where: whereClause,
    _count: true
  }).then(result => result.length)
  
  const sessions = await prisma.trafficRaw.groupBy({
    by: ['sessionId'],
    where: whereClause,
    _count: true
  }).then(result => result.length)
  
  const formSubmissions = await prisma.trafficRaw.count({
    where: { ...whereClause, eventType: 'form_submit' }
  })
  
  // 插入或更新汇总数据
  await prisma.trafficSummary.upsert({
    where: {
      unique_summary: {
        date,
        hour,
        pageUrl: pageUrl || '',
        source: '',
        deviceType: '',
        country: '',
        locale: ''
      }
    },
    create: {
      date,
      hour,
      pageUrl,
      pageViews,
      uniqueVisitors,
      sessions,
      formSubmissions,
      conversionRate: sessions > 0 ? (formSubmissions / sessions * 100) : 0
    },
    update: {
      pageViews,
      uniqueVisitors,
      sessions,
      formSubmissions,
      conversionRate: sessions > 0 ? (formSubmissions / sessions * 100) : 0,
      updatedAt: new Date()
    }
  })
}
```

---

### 2. 定时任务调度 (Cron Job)

```typescript
// keystone/cron.ts
import cron from 'node-cron'
import { runHourlySummary } from './tasks/hourly-summary'
import { runDailySummary } from './tasks/daily-summary'

export function startCronJobs() {
  // 每小时的第 5 分钟运行
  cron.schedule('5 * * * *', async () => {
    await runHourlySummary()
  })
  
  // 每天凌晨 1 点运行
  cron.schedule('0 1 * * *', async () => {
    await runDailySummary()
  })
  
  console.log('✅ Cron jobs started')
}
```

---

## 📈 可视化大屏

### CMS 后台 `/admin/cdp` 模块

```tsx
// keystone/admin/pages/cdp.tsx
import { PageContainer } from '@keystone-6/core/admin-ui/components'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'

const GET_REALTIME_METRICS = gql`
  query GetRealtimeMetrics {
    trafficSummaryToday {
      pageViews
      uniqueVisitors
      sessions
      conversionRate
    }
  }
`

export default function CDPDashboard() {
  const { data, loading } = useQuery(GET_REALTIME_METRICS, {
    pollInterval: 30000  // 每 30 秒刷新
  })
  
  if (loading) return <PageContainer>Loading...</PageContainer>
  
  const metrics = data.trafficSummaryToday
  
  return (
    <PageContainer header="CDP Dashboard">
      <div className="grid grid-cols-4 gap-4">
        {/* 实时指标卡片 */}
        <MetricCard
          title="Page Views"
          value={metrics.pageViews}
          trend="+12%"
          trendColor="green"
        />
        <MetricCard
          title="Unique Visitors"
          value={metrics.uniqueVisitors}
          trend="+8%"
          trendColor="green"
        />
        <MetricCard
          title="Sessions"
          value={metrics.sessions}
          trend="-5%"
          trendColor="red"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate.toFixed(2)}%`}
          trend="+2.3%"
          trendColor="green"
        />
      </div>
      
      {/* 图表 */}
      <div className="mt-8">
        <TrafficChart />
      </div>
    </PageContainer>
  )
}
```

---

## 🤖 AI 优化建议

### 1. 使用 Gemini 生成 SEO 建议

```typescript
// lib/ai/seo-optimizer.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function generateSEOInsights() {
  // 获取最近 30 天的数据
  const data = await getTrafficData(30)
  
  const prompt = `
作为一个 SEO 专家，请分析以下网站流量数据并提供优化建议：

数据摘要：
- 总访问量：${data.totalPageViews}
- 平均跳出率：${data.avgBounceRate}%
- 热门页面：${data.topPages.join(', ')}
- 主要流量来源：${data.topSources.join(', ')}
- 转化率：${data.conversionRate}%

请提供：
1. 3 个关键问题
2. 5 个可执行的优化建议
3. 预期的改进效果

格式：JSON
  `
  
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  const result = await model.generateContent(prompt)
  const response = await result.response
  
  return JSON.parse(response.text())
}
```

---

## 🤖 Claude Code Prompt 模板

```markdown
你好，我需要你帮我开发 CDP 数据分析系统。

**项目背景**:
- 数据库: PostgreSQL + Prisma
- 前端埋点: 自定义 SDK
- 需求文档: 请仔细阅读 `/docs/05-CDP系统设计.md`

**你的任务**:
1. 创建数据库表 (`TrafficRaw`, `TrafficSummary`)
2. 实现前端埋点 SDK
3. 实现后端事件接收 API
4. 实现 ETL 定时任务
5. 在 Keystone CMS 中创建可视化大屏

**具体要求**:
- 必须支持 Session 管理逻辑
- 必须实现每小时和每日汇总
- 必须提供实时指标展示
- 代码必须有详细注释

**验收标准**:
- [ ] 埋点SDK 正常工作
- [ ] 事件数据正确存储
- [ ] ETL 任务自动运行
- [ ] CMS 大屏可访问

请开始工作。
```

---

**文档版本**: v1.0  
**最后更新**: 2025-10-31