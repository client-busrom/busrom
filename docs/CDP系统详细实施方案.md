# CDP 系统详细实施方案

> **项目周期**: 6-8 周
> **团队规模**: 2-3 名开发工程师 + 1 名数据分析师
> **技术栈**: Next.js 14, Keystone 6, PostgreSQL, Prisma, TypeScript

---

## 📋 目录

1. [项目概述](#项目概述)
2. [技术架构](#技术架构)
3. [实施阶段](#实施阶段)
4. [数据库设计与迁移](#数据库设计与迁移)
5. [前端埋点实施](#前端埋点实施)
6. [后端API实施](#后端api实施)
7. [ETL数据处理](#etl数据处理)
8. [可视化大屏实施](#可视化大屏实施)
9. [AI优化模块](#ai优化模块)
10. [测试方案](#测试方案)
11. [部署方案](#部署方案)
12. [监控与维护](#监控与维护)

---

## 🎯 项目概述

### 业务目标

构建一套完整的客户数据平台(CDP)，实现以下核心能力：

1. **数据采集**: 全面追踪用户在网站上的行为轨迹
2. **数据存储**: 原始数据 + 多维度汇总数据的分层存储
3. **数据分析**: 实时计算关键业务指标(PV、UV、转化率等)
4. **可视化**: 提供直观的数据大屏和报表系统
5. **智能优化**: AI驱动的SEO和营销优化建议

### 技术目标

- **性能**: 支持每秒1000+事件写入，查询响应时间<500ms
- **可扩展**: 模块化设计，易于添加新的事件类型和指标
- **可靠性**: 99.9%数据采集成功率，无数据丢失
- **实时性**: 关键指标5分钟内更新

---

## 🏗️ 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                      前端应用层                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Next.js App  │  │   Keystone   │  │  CDP SDK     │ │
│  │   (客户端)    │  │  Admin UI    │  │  (tracker.ts)│ │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘ │
└─────────┼────────────────────────────────────┼─────────┘
          │                                    │
          │ HTTP POST                          │ Event Data
          ▼                                    ▼
┌─────────────────────────────────────────────────────────┐
│                      API 层                              │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ /api/v1/track/event  │  │ /api/v1/cdp/metrics  │    │
│  │  (事件接收)           │  │  (数据查询)           │    │
│  └──────────┬───────────┘  └──────────┬───────────┘    │
└─────────────┼──────────────────────────┼────────────────┘
              │                          │
              │ Write                    │ Read
              ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│                   数据处理层                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Session     │  │  IP Geo      │  │  UA Parser   │ │
│  │  Manager     │  │  Lookup      │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
              │                          │
              │ Write                    │ Read/Write
              ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│                   数据存储层                             │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │   TrafficRaw         │  │  TrafficSummary      │    │
│  │   (原始数据表)        │  │  (汇总数据表)         │    │
│  │   - 高写入量          │  │  - 高读取量           │    │
│  │   - 索引优化          │  │  - 分区表            │    │
│  └──────────────────────┘  └──────────────────────┘    │
│                PostgreSQL Database                      │
└─────────────────────────────────────────────────────────┘
              ▲
              │ ETL Process
              │
┌─────────────────────────────────────────────────────────┐
│                   ETL 调度层                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Hourly Job  │  │  Daily Job   │  │  Weekly Job  │ │
│  │  (每小时)     │  │  (每天)       │  │  (每周)       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│               Node Cron Scheduler                       │
└─────────────────────────────────────────────────────────┘
              │
              │ Training Data
              ▼
┌─────────────────────────────────────────────────────────┐
│                   AI 分析层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Gemini API  │  │  LightGBM    │  │  Insight     │ │
│  │  (SEO建议)    │  │  (预测模型)   │  │  Generator   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 技术选型说明

| 组件 | 技术选型 | 原因 |
|-----|---------|------|
| 前端框架 | Next.js 14 (App Router) | SSR支持、性能优化、SEO友好 |
| 数据库 | PostgreSQL 15+ | JSONB支持、强大的聚合查询、分区表 |
| ORM | Prisma | 类型安全、迁移管理、性能优秀 |
| 任务调度 | node-cron | 轻量级、易于集成 |
| 图表库 | Recharts | React原生、灵活、文档完善 |
| AI引擎 | Google Gemini + LightGBM | 成本优化、准确度高 |
| IP解析 | geoip-lite | 离线数据库、快速查询 |
| UA解析 | ua-parser-js | 准确度高、维护活跃 |

---

## 📅 实施阶段

### Phase 1: 基础设施搭建 (第1-2周)

**目标**: 建立数据采集和存储的基础设施

#### 1.1 数据库设计与创建

**任务清单**:
- [ ] 设计 Prisma Schema
- [ ] 创建 TrafficRaw 表结构
- [ ] 创建 TrafficSummary 表结构
- [ ] 创建索引和约束
- [ ] 执行数据库迁移
- [ ] 验证表结构和索引性能

**交付物**:
- `prisma/schema.prisma` 更新
- 数据库迁移文件
- 索引性能测试报告

#### 1.2 前端埋点SDK开发

**任务清单**:
- [ ] 创建 Tracker 类基础结构
- [ ] 实现 Session ID 生成和管理
- [ ] 实现事件发送机制
- [ ] 实现页面浏览自动追踪
- [ ] 添加错误处理和重试机制
- [ ] 编写 SDK 使用文档

**交付物**:
- `lib/cdp/tracker.ts`
- `lib/cdp/session.ts`
- SDK 使用文档

#### 1.3 后端事件接收API

**任务清单**:
- [ ] 创建 `/api/v1/track/event` 端点
- [ ] 实现请求验证和清洗
- [ ] 集成 IP 地理位置解析
- [ ] 集成 User-Agent 解析
- [ ] 实现数据库写入
- [ ] 添加请求速率限制
- [ ] 添加监控和日志

**交付物**:
- `app/api/v1/track/event/route.ts`
- API 文档
- 性能测试报告

**验收标准**:
- 能够成功接收和存储事件数据
- API响应时间 < 200ms (P95)
- 支持每秒500+请求
- 错误率 < 0.1%

---

### Phase 2: 数据汇总与处理 (第3-4周)

**目标**: 实现自动化的数据汇总和指标计算

#### 2.1 ETL 任务开发

**任务清单**:
- [ ] 实现每小时汇总逻辑
- [ ] 实现每日汇总逻辑
- [ ] 实现多维度分组计算
- [ ] 实现指标计算公式
- [ ] 添加任务执行日志
- [ ] 实现任务失败重试机制

**交付物**:
- `keystone/tasks/hourly-summary.ts`
- `keystone/tasks/daily-summary.ts`
- `lib/cdp/metrics-calculator.ts`
- ETL 运行日志

#### 2.2 任务调度系统

**任务清单**:
- [ ] 配置 node-cron
- [ ] 创建任务调度器
- [ ] 实现任务监控
- [ ] 添加手动触发接口
- [ ] 实现任务执行通知

**交付物**:
- `keystone/cron.ts`
- `app/api/v1/cdp/trigger-etl/route.ts`
- 调度系统监控面板

#### 2.3 核心指标计算

**需要计算的指标**:

| 指标名称 | 计算公式 | 说明 |
|---------|---------|------|
| PV (Page Views) | COUNT(event_type='page_view') | 页面浏览量 |
| UV (Unique Visitors) | COUNT(DISTINCT ip_address) | 独立访客数 |
| Sessions | COUNT(DISTINCT session_id) | 会话数 |
| Bounce Rate | 单页会话数 / 总会话数 * 100% | 跳出率 |
| Avg Session Duration | SUM(session_duration) / COUNT(sessions) | 平均会话时长 |
| Conversion Rate | 转化事件数 / 总会话数 * 100% | 转化率 |
| Form Submissions | COUNT(event_type='form_submit') | 表单提交数 |
| CTA Clicks | COUNT(event_type='cta_click') | CTA点击数 |

**验收标准**:
- ETL任务准时执行，无遗漏
- 计算结果准确度 99.9%+
- 任务执行时间 < 5分钟
- 自动处理任务失败和重试

---

### Phase 3: 可视化大屏开发 (第4-5周)

**目标**: 在 Keystone CMS 中创建数据可视化界面

#### 3.1 Keystone Admin UI 扩展

**任务清单**:
- [ ] 创建 CDP 自定义页面
- [ ] 设计页面布局
- [ ] 实现导航菜单集成
- [ ] 配置权限控制

**交付物**:
- `keystone/admin/pages/cdp.tsx`
- `keystone.ts` 配置更新

#### 3.2 实时指标卡片

**需要展示的指标**:

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  Today PV       │  Today UV       │  Today Sessions │  Conversion     │
│  12,345         │  8,234          │  9,456          │  3.2%           │
│  ↑ +12.3%       │  ↑ +8.5%        │  ↓ -2.1%        │  ↑ +0.5%        │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**任务清单**:
- [ ] 创建 MetricCard 组件
- [ ] 实现实时数据查询 (30秒刷新)
- [ ] 添加趋势指示器
- [ ] 实现同比/环比计算
- [ ] 添加数据加载动画

**交付物**:
- `components/cdp/MetricCard.tsx`
- GraphQL 查询定义

#### 3.3 交互式图表

**需要的图表类型**:

1. **流量趋势图** (折线图)
   - X轴: 时间 (小时/天/周/月)
   - Y轴: PV/UV/Sessions
   - 支持多指标对比

2. **流量来源饼图**
   - Organic Search
   - Direct
   - Referral
   - Social
   - Paid Ads

3. **设备类型分布** (柱状图)
   - Desktop
   - Mobile
   - Tablet

4. **地理位置热力图**
   - 基于国家/地区
   - 访问量梯度着色

5. **页面性能表**
   - URL
   - PV
   - Bounce Rate
   - Avg Duration

**任务清单**:
- [ ] 集成 Recharts 图表库
- [ ] 创建 TrafficChart 组件
- [ ] 创建 SourcePieChart 组件
- [ ] 创建 DeviceBarChart 组件
- [ ] 创建 GeoHeatmap 组件
- [ ] 创建 PageTable 组件
- [ ] 实现日期范围选择器
- [ ] 实现数据筛选功能

**交付物**:
- `components/cdp/TrafficChart.tsx`
- `components/cdp/SourcePieChart.tsx`
- `components/cdp/DeviceBarChart.tsx`
- `components/cdp/GeoHeatmap.tsx`
- `components/cdp/PageTable.tsx`
- `components/cdp/DateRangePicker.tsx`

#### 3.4 数据导出功能

**任务清单**:
- [ ] 实现 CSV 导出
- [ ] 实现 Excel 导出
- [ ] 实现 PDF 报告生成
- [ ] 添加自定义日期范围导出
- [ ] 添加导出进度提示

**交付物**:
- `app/api/v1/cdp/export/route.ts`
- `lib/cdp/export-generator.ts`

**验收标准**:
- 大屏加载时间 < 3秒
- 图表交互流畅，无卡顿
- 数据刷新准确及时
- 导出功能正常工作
- 移动端响应式适配

---

### Phase 4: AI 优化建议 (第5-6周)

**目标**: 集成AI分析，提供智能优化建议

#### 4.1 数据分析引擎

**任务清单**:
- [ ] 实现数据聚合查询
- [ ] 计算统计指标
- [ ] 识别异常数据
- [ ] 生成数据摘要

**交付物**:
- `lib/ai/data-analyzer.ts`

#### 4.2 Gemini API 集成

**任务清单**:
- [ ] 配置 Gemini API 密钥
- [ ] 创建 Prompt 模板
- [ ] 实现 SEO 建议生成
- [ ] 实现内容优化建议
- [ ] 实现广告优化建议
- [ ] 添加结果缓存机制

**建议类型**:

1. **SEO 优化建议**
   - 低跳出率页面优化
   - 高流量关键词挖掘
   - 内链结构优化
   - Meta 标签优化

2. **内容优化建议**
   - 高转化内容分析
   - 内容更新优先级
   - 用户兴趣热点

3. **广告优化建议**
   - 高ROI渠道识别
   - 受众人群分析
   - 广告投放时段优化
   - 落地页优化建议

**交付物**:
- `lib/ai/seo-optimizer.ts`
- `lib/ai/content-optimizer.ts`
- `lib/ai/ad-optimizer.ts`
- `lib/ai/prompt-templates.ts`

#### 4.3 预测模型 (可选)

**任务清单**:
- [ ] 收集历史数据
- [ ] 特征工程
- [ ] 训练 LightGBM 模型
- [ ] 部署预测服务
- [ ] 集成到 UI

**预测目标**:
- 未来7天流量预测
- 转化率趋势预测
- 季节性流量波动

**交付物**:
- `ml/models/traffic-predictor.py`
- `app/api/v1/cdp/predict/route.ts`

#### 4.4 建议展示界面

**任务清单**:
- [ ] 创建建议卡片组件
- [ ] 实现建议生成按钮
- [ ] 添加加载状态
- [ ] 实现建议历史记录
- [ ] 添加建议评分功能

**交付物**:
- `components/cdp/AIInsights.tsx`
- `components/cdp/InsightCard.tsx`

**验收标准**:
- AI建议生成时间 < 30秒
- 建议内容相关性高
- 建议具有可操作性
- 用户反馈机制正常

---

### Phase 5: 测试与优化 (第6-7周)

**目标**: 全面测试系统功能和性能

#### 5.1 单元测试

**测试覆盖**:
- Session 管理逻辑
- 指标计算函数
- 数据聚合查询
- API 端点验证

**任务清单**:
- [ ] 编写 Tracker 单元测试
- [ ] 编写 API 单元测试
- [ ] 编写 ETL 任务测试
- [ ] 编写指标计算测试
- [ ] 达到 80% 代码覆盖率

**交付物**:
- `__tests__/cdp/tracker.test.ts`
- `__tests__/cdp/api.test.ts`
- `__tests__/cdp/etl.test.ts`
- `__tests__/cdp/metrics.test.ts`

#### 5.2 集成测试

**测试场景**:
1. 完整的事件流: 前端埋点 → API接收 → 数据库存储
2. ETL流程: 原始数据 → 汇总处理 → 指标计算
3. 查询流程: API请求 → 数据查询 → 结果返回

**任务清单**:
- [ ] 编写端到端测试
- [ ] 模拟真实用户行为
- [ ] 测试并发场景
- [ ] 测试数据一致性

**交付物**:
- `__tests__/integration/cdp-flow.test.ts`

#### 5.3 性能测试

**测试指标**:
| 指标 | 目标值 | 测试工具 |
|-----|--------|---------|
| API响应时间 | P95 < 200ms | Apache Bench |
| 并发处理能力 | 1000 req/s | k6 |
| 数据库查询时间 | < 100ms | Prisma metrics |
| ETL任务执行时间 | < 5分钟 | 自定义监控 |
| 前端加载时间 | < 3秒 | Lighthouse |

**任务清单**:
- [ ] 进行压力测试
- [ ] 优化慢查询
- [ ] 优化数据库索引
- [ ] 实现查询结果缓存
- [ ] 优化前端资源加载

**交付物**:
- 性能测试报告
- 优化方案文档
- 基准测试数据

#### 5.4 安全测试

**测试项目**:
- SQL 注入防护
- XSS 防护
- CSRF 防护
- 请求速率限制
- 数据权限控制

**任务清单**:
- [ ] 进行安全扫描
- [ ] 修复安全漏洞
- [ ] 添加安全头部
- [ ] 实现请求签名验证
- [ ] 加强数据脱敏

**交付物**:
- 安全测试报告
- 漏洞修复记录

**验收标准**:
- 单元测试通过率 100%
- 代码覆盖率 > 80%
- 性能指标达标
- 无高危安全漏洞

---

### Phase 6: 部署与上线 (第7-8周)

**目标**: 将系统部署到生产环境

#### 6.1 生产环境准备

**任务清单**:
- [ ] 配置生产数据库
- [ ] 设置环境变量
- [ ] 配置 CDN 和负载均衡
- [ ] 配置备份策略
- [ ] 配置监控告警

**交付物**:
- 部署配置文档
- 环境变量清单
- 备份恢复流程

#### 6.2 数据迁移

**任务清单**:
- [ ] 备份现有数据
- [ ] 执行数据库迁移
- [ ] 验证数据完整性
- [ ] 回滚方案测试

**交付物**:
- 迁移脚本
- 数据验证报告

#### 6.3 灰度发布

**发布计划**:
1. **第1天**: 5% 流量
2. **第3天**: 25% 流量
3. **第5天**: 50% 流量
4. **第7天**: 100% 流量

**监控指标**:
- 错误率
- 响应时间
- CPU/内存使用率
- 数据采集成功率

**任务清单**:
- [ ] 配置灰度发布规则
- [ ] 实施分阶段发布
- [ ] 监控关键指标
- [ ] 处理异常情况
- [ ] 全量发布

**交付物**:
- 灰度发布报告
- 线上监控数据

#### 6.4 文档交付

**文档列表**:
1. **系统架构文档**
2. **API 接口文档**
3. **SDK 使用指南**
4. **运维手册**
5. **故障排查手册**
6. **用户使用手册**

**任务清单**:
- [ ] 编写技术文档
- [ ] 录制操作视频
- [ ] 组织培训会议
- [ ] 交付给运维团队

**交付物**:
- 完整文档集
- 培训材料

**验收标准**:
- 系统稳定运行
- 数据采集准确
- 无重大bug
- 文档齐全

---

## 💾 数据库设计与迁移

### Prisma Schema 完整定义

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 原始埋点数据表
model TrafficRaw {
  id        Int      @id @default(autoincrement())

  // 事件信息
  eventType String   @db.VarChar(50)  // 'page_view', 'form_submit', 'cta_click'
  eventName String?  @db.VarChar(100)

  // 用户标识
  sessionId String   @db.VarChar(100)
  userId    String?  @db.VarChar(100)

  // 页面信息
  pageUrl   String   @db.Text
  pageTitle String?  @db.VarChar(255)
  referrer  String?  @db.Text
  locale    String?  @db.VarChar(10)

  // 设备信息
  userAgent  String? @db.Text
  ipAddress  String? @db.VarChar(45)
  deviceType String? @db.VarChar(20)  // 'desktop', 'mobile', 'tablet'
  browser    String? @db.VarChar(50)
  os         String? @db.VarChar(50)

  // 地理位置
  country String?   @db.VarChar(2)
  region  String?   @db.VarChar(100)
  city    String?   @db.VarChar(100)

  // 渠道信息
  utmSource   String? @db.VarChar(100)
  utmMedium   String? @db.VarChar(100)
  utmCampaign String? @db.VarChar(100)
  utmTerm     String? @db.VarChar(100)
  utmContent  String? @db.VarChar(100)

  // 事件属性
  properties Json?

  // 时间戳
  timestamp DateTime  @default(now())
  createdAt DateTime  @default(now())

  @@index([sessionId], name: "idx_session")
  @@index([eventType], name: "idx_event_type")
  @@index([timestamp], name: "idx_timestamp")
  @@index([pageUrl(length: 255)], name: "idx_page_url")
  @@index([utmSource], name: "idx_utm_source")
  @@index([country], name: "idx_country")
  @@map("traffic_raw")
}

// 汇总统计数据表
model TrafficSummary {
  id       Int      @id @default(autoincrement())

  // 时间维度
  date     DateTime @db.Date
  hour     Int?     // 0-23, NULL 表示全天

  // 页面维度
  pageUrl  String?  @db.Text

  // 渠道维度
  source    String?  @db.VarChar(50)  // 'organic', 'ad', 'direct', 'referral', 'social'
  utmSource String?  @db.VarChar(100)

  // 设备维度
  deviceType String? @db.VarChar(20)

  // 地理维度
  country String?   @db.VarChar(2)

  // 语言维度
  locale String?   @db.VarChar(10)

  // 核心指标
  pageViews        Int      @default(0)
  uniqueVisitors   Int      @default(0)
  sessions         Int      @default(0)
  bounceRate       Decimal? @db.Decimal(5, 2)
  avgSessionDuration Int?   // 秒

  // 转化指标
  formSubmissions Int     @default(0)
  ctaClicks       Int     @default(0)
  inquiryClicks   Int     @default(0)
  conversionRate  Decimal? @db.Decimal(5, 2)

  // 元数据
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([date, hour, pageUrl, source, deviceType, country, locale], name: "unique_summary")
  @@index([date, hour], name: "idx_date_hour")
  @@index([pageUrl(length: 255)], name: "idx_summary_page_url")
  @@map("traffic_summary")
}

// AI 优化建议表
model AIInsight {
  id          Int      @id @default(autoincrement())

  // 建议类型
  type        String   @db.VarChar(50)  // 'seo', 'content', 'ad'
  category    String   @db.VarChar(50)

  // 建议内容
  title       String   @db.VarChar(255)
  description String   @db.Text
  priority    String   @db.VarChar(20)  // 'high', 'medium', 'low'

  // 预期效果
  expectedImpact String? @db.Text

  // 数据依据
  dataSnapshot Json?

  // 状态
  status      String   @db.VarChar(20)  // 'pending', 'in_progress', 'completed', 'dismissed'

  // 用户反馈
  rating      Int?     // 1-5 stars
  feedback    String?  @db.Text

  // 时间戳
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  completedAt DateTime?

  @@index([type, status], name: "idx_type_status")
  @@index([createdAt], name: "idx_created_at")
  @@map("ai_insights")
}

// ETL 任务执行日志
model ETLLog {
  id           Int      @id @default(autoincrement())

  // 任务信息
  taskName     String   @db.VarChar(100)
  taskType     String   @db.VarChar(50)  // 'hourly', 'daily', 'weekly'

  // 执行时间范围
  startTime    DateTime
  endTime      DateTime?

  // 执行结果
  status       String   @db.VarChar(20)  // 'running', 'success', 'failed'
  recordsProcessed Int  @default(0)
  errorMessage String?  @db.Text

  // 元数据
  createdAt    DateTime @default(now())

  @@index([taskName, status], name: "idx_task_status")
  @@index([createdAt], name: "idx_etl_created_at")
  @@map("etl_logs")
}
```

### 数据库迁移步骤

```bash
# 1. 创建迁移文件
npx prisma migrate dev --name init_cdp_tables

# 2. 应用迁移到生产环境
npx prisma migrate deploy

# 3. 生成 Prisma Client
npx prisma generate

# 4. 验证表结构
npx prisma db pull

# 5. 查看迁移历史
npx prisma migrate status
```

### 索引优化策略

```sql
-- 为高频查询创建复合索引
CREATE INDEX idx_traffic_raw_session_time
ON traffic_raw(session_id, timestamp DESC);

-- 为汇总查询创建部分索引
CREATE INDEX idx_traffic_raw_recent
ON traffic_raw(timestamp DESC)
WHERE timestamp > NOW() - INTERVAL '7 days';

-- 为地理位置查询创建索引
CREATE INDEX idx_traffic_raw_geo
ON traffic_raw(country, region, city)
WHERE country IS NOT NULL;
```

### 表分区策略 (可选)

```sql
-- 按月分区 TrafficRaw 表 (仅当数据量非常大时使用)
CREATE TABLE traffic_raw_2024_01 PARTITION OF traffic_raw
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE traffic_raw_2024_02 PARTITION OF traffic_raw
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- 自动创建下个月的分区
CREATE OR REPLACE FUNCTION create_next_month_partition()
RETURNS void AS $$
DECLARE
  next_month_start DATE := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
  next_month_end DATE := DATE_TRUNC('month', NOW() + INTERVAL '2 months');
  partition_name TEXT := 'traffic_raw_' || TO_CHAR(next_month_start, 'YYYY_MM');
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I PARTITION OF traffic_raw
    FOR VALUES FROM (%L) TO (%L)
  ', partition_name, next_month_start, next_month_end);
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 前端埋点实施

### 完整的 Tracker 实现

```typescript
// lib/cdp/tracker.ts

interface TrackingEvent {
  event: string
  properties: Record<string, any>
}

interface TrackerConfig {
  apiEndpoint?: string
  debug?: boolean
  autoTrack?: boolean
  sampleRate?: number  // 0-1, 用于采样
}

class BusromTracker {
  private sessionId: string
  private config: TrackerConfig
  private queue: TrackingEvent[] = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor(config: TrackerConfig = {}) {
    this.config = {
      apiEndpoint: '/api/v1/track/event',
      debug: false,
      autoTrack: true,
      sampleRate: 1.0,
      ...config
    }

    this.sessionId = this.getOrCreateSessionId()

    if (this.config.autoTrack) {
      this.initAutoTracking()
    }

    // 页面卸载前发送队列中的事件
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush(true)
      })
    }
  }

  /**
   * Session ID 管理
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return ''

    const key = 'busrom_session_id'
    const timestampKey = 'busrom_session_timestamp'

    let sessionId = sessionStorage.getItem(key)
    const lastTimestamp = sessionStorage.getItem(timestampKey)

    // 检查 Session 是否过期
    if (sessionId && lastTimestamp) {
      const lastActivity = new Date(parseInt(lastTimestamp))
      if (this.isSessionExpired(lastActivity)) {
        sessionId = null
      }
    }

    // 创建新 Session
    if (!sessionId) {
      sessionId = this.generateSessionId()
      sessionStorage.setItem(key, sessionId)
    }

    // 更新时间戳
    sessionStorage.setItem(timestampKey, Date.now().toString())

    return sessionId
  }

  private generateSessionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `sess_${timestamp}_${random}`
  }

  private isSessionExpired(lastActivity: Date): boolean {
    const now = new Date()
    const diff = now.getTime() - lastActivity.getTime()

    // 超过 15 分钟
    if (diff > 15 * 60 * 1000) return true

    // 跨越了 00:00 UTC
    if (lastActivity.getUTCDate() !== now.getUTCDate()) return true

    return false
  }

  /**
   * 事件发送
   */
  private async sendEvent(event: TrackingEvent, immediate = false) {
    // 采样控制
    if (Math.random() > this.config.sampleRate!) {
      return
    }

    const payload = {
      ...event,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      context: this.getContext()
    }

    if (this.config.debug) {
      console.log('[Tracker] Event:', payload)
    }

    if (immediate) {
      // 立即发送 (使用 sendBeacon 确保可靠性)
      await this.sendImmediate(payload)
    } else {
      // 加入队列，批量发送
      this.queue.push(payload as any)
      this.scheduleBatchSend()
    }
  }

  private async sendImmediate(payload: any) {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      navigator.sendBeacon(this.config.apiEndpoint!, blob)
    } else {
      await this.sendViaFetch([payload])
    }
  }

  private scheduleBatchSend() {
    if (this.flushTimer) return

    this.flushTimer = setTimeout(() => {
      this.flush()
    }, 2000)  // 2秒后批量发送
  }

  private async flush(immediate = false) {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }

    if (immediate) {
      // 使用 sendBeacon
      events.forEach(event => this.sendImmediate(event))
    } else {
      await this.sendViaFetch(events)
    }
  }

  private async sendViaFetch(events: any[]) {
    try {
      const response = await fetch(this.config.apiEndpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true
      })

      if (!response.ok) {
        console.error('[Tracker] Failed to send events:', response.status)
      }
    } catch (error) {
      console.error('[Tracker] Network error:', error)
      // 可以考虑重试或持久化到 localStorage
    }
  }

  /**
   * 获取上下文信息
   */
  private getContext() {
    if (typeof window === 'undefined') return {}

    return {
      userAgent: navigator.userAgent,
      locale: document.documentElement.lang || navigator.language,
      referrer: document.referrer,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }

  /**
   * 公开的追踪方法
   */

  // 页面浏览
  trackPageView(customProperties: Record<string, any> = {}) {
    this.sendEvent({
      event: 'page_view',
      properties: {
        page: window.location.pathname,
        title: document.title,
        url: window.location.href,
        query: window.location.search,
        hash: window.location.hash,
        ...customProperties
      }
    })
  }

  // 表单提交
  trackFormSubmit(formName: string, formData: Record<string, any> = {}) {
    this.sendEvent({
      event: 'form_submit',
      properties: {
        formName,
        page: window.location.pathname,
        ...formData
      }
    }, true)  // 立即发送
  }

  // CTA 点击
  trackCTAClick(buttonText: string, targetUrl?: string) {
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
        name: productName,
        page: window.location.pathname
      }
    })
  }

  // 产品询价
  trackProductInquiry(productSku: string) {
    this.sendEvent({
      event: 'product_inquiry',
      properties: {
        sku: productSku,
        page: window.location.pathname
      }
    }, true)  // 立即发送
  }

  // 搜索
  trackSearch(query: string, resultCount?: number) {
    this.sendEvent({
      event: 'search',
      properties: {
        query,
        resultCount,
        page: window.location.pathname
      }
    })
  }

  // 自定义事件
  track(eventName: string, properties: Record<string, any> = {}) {
    this.sendEvent({
      event: eventName,
      properties: {
        ...properties,
        page: window.location.pathname
      }
    })
  }

  /**
   * 自动追踪
   */
  private initAutoTracking() {
    if (typeof window === 'undefined') return

    // 1. 页面浏览
    this.trackPageView()

    // 2. SPA 路由变化
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = (...args) => {
      originalPushState.apply(history, args)
      this.trackPageView()
    }

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args)
      this.trackPageView()
    }

    window.addEventListener('popstate', () => {
      this.trackPageView()
    })

    // 3. 外链点击
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // 判断是否是外链
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        this.track('outbound_link_click', {
          url: href,
          text: target.textContent
        })
      }
    })

    // 4. 表单提交 (自动检测)
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement
      const formName = form.getAttribute('name') || form.getAttribute('id') || 'unnamed'

      this.trackFormSubmit(formName, {
        action: form.action,
        method: form.method
      })
    })

    // 5. 页面停留时间
    let pageStartTime = Date.now()

    window.addEventListener('beforeunload', () => {
      const duration = Math.floor((Date.now() - pageStartTime) / 1000)
      this.track('page_exit', {
        duration,
        page: window.location.pathname
      })
    })

    // 6. 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const duration = Math.floor((Date.now() - pageStartTime) / 1000)
        this.track('page_hidden', { duration })
      } else {
        pageStartTime = Date.now()
        this.track('page_visible', {})
      }
    })
  }
}

// 导出单例
export const tracker = new BusromTracker({
  debug: process.env.NODE_ENV === 'development',
  sampleRate: parseFloat(process.env.NEXT_PUBLIC_TRACKER_SAMPLE_RATE || '1.0')
})

// 在生产环境中挂载到 window 对象，方便调试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  ;(window as any).__tracker = tracker
}
```

### React 组件集成示例

```tsx
// components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { tracker } from '@/lib/cdp/tracker'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 提交表单
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // 追踪成功提交
        tracker.trackFormSubmit('contact', {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          source: window.location.pathname,
          status: 'success'
        })

        alert('提交成功!')
      } else {
        // 追踪失败
        tracker.trackFormSubmit('contact', {
          status: 'error',
          errorCode: response.status
        })
      }
    } catch (error) {
      // 追踪网络错误
      tracker.trackFormSubmit('contact', {
        status: 'network_error'
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="姓名"
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="邮箱"
      />
      <input
        type="text"
        value={formData.company}
        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        placeholder="公司"
      />
      <textarea
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="留言"
      />
      <button type="submit">提交</button>
    </form>
  )
}
```

```tsx
// components/ProductCard.tsx
'use client'

import { tracker } from '@/lib/cdp/tracker'
import { useEffect } from 'react'

interface ProductCardProps {
  sku: string
  name: string
  image: string
  description: string
}

export function ProductCard({ sku, name, image, description }: ProductCardProps) {
  // 追踪产品浏览
  useEffect(() => {
    tracker.trackProductView(sku, name)
  }, [sku, name])

  const handleInquiry = () => {
    // 追踪询价点击
    tracker.trackProductInquiry(sku)

    // 打开询价表单...
  }

  return (
    <div className="product-card">
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p>{description}</p>
      <button
        onClick={handleInquiry}
        onMouseEnter={() => {
          // 追踪按钮悬停
          tracker.track('inquiry_button_hover', { sku, name })
        }}
      >
        立即询价
      </button>
    </div>
  )
}
```

### 服务端追踪 (可选)

```typescript
// lib/cdp/server-tracker.ts

import { PrismaClient } from '@prisma/client'

/**
 * 服务端追踪 - 用于 SSR、API 路由等场景
 */
export class ServerTracker {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async trackServerEvent(data: {
    eventType: string
    eventName?: string
    sessionId?: string
    userId?: string
    pageUrl: string
    userAgent?: string
    ipAddress?: string
    properties?: any
  }) {
    try {
      // 解析 User-Agent
      const ua = data.userAgent ? this.parseUserAgent(data.userAgent) : {}

      // 解析 IP 地理位置
      const geo = data.ipAddress ? await this.lookupGeo(data.ipAddress) : {}

      await this.prisma.trafficRaw.create({
        data: {
          eventType: data.eventType,
          eventName: data.eventName,
          sessionId: data.sessionId || 'server',
          userId: data.userId,
          pageUrl: data.pageUrl,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          ...ua,
          ...geo,
          properties: data.properties,
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('[ServerTracker] Error:', error)
    }
  }

  private parseUserAgent(ua: string) {
    // 使用 ua-parser-js 或类似库
    // 返回 { deviceType, browser, os }
    return {}
  }

  private async lookupGeo(ip: string) {
    // 使用 geoip-lite 或类似库
    // 返回 { country, region, city }
    return {}
  }
}

export const serverTracker = new ServerTracker()
```

---

## 🔧 后端API实施

### 事件接收 API (支持批量)

```typescript
// app/api/v1/track/event/route.ts

import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { lookup } from 'geoip-lite'
import UAParser from 'ua-parser-js'
import { z } from 'zod'

const prisma = new PrismaClient()

// 事件验证 Schema
const EventSchema = z.object({
  event: z.string().min(1).max(50),
  sessionId: z.string().min(1).max(100),
  timestamp: z.string().datetime(),
  properties: z.record(z.any()).optional(),
  context: z.object({
    userAgent: z.string().optional(),
    locale: z.string().optional(),
    referrer: z.string().optional(),
    screenWidth: z.number().optional(),
    screenHeight: z.number().optional(),
  }).optional()
})

const BatchEventSchema = z.object({
  events: z.array(EventSchema).min(1).max(100)  // 最多 100 个事件
})

// 速率限制 (简单实现,生产环境建议使用 Redis)
const rateLimiter = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string, limit = 1000, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimiter.get(ip)

  if (!record || now > record.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // 1. 获取 IP 地址
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // 2. 速率限制
    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // 3. 解析请求体
    const body = await request.json()

    // 判断是单个事件还是批量事件
    const events = body.events ? body.events : [body]

    // 4. 验证数据
    const validation = z.array(EventSchema).safeParse(events)
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid event data', details: validation.error },
        { status: 400 }
      )
    }

    // 5. 处理每个事件
    const processedEvents = events.map((event: any) => {
      // 解析 User-Agent
      const ua = UAParser(event.context?.userAgent)

      // 解析 IP 地理位置
      const geo = ip !== 'unknown' ? lookup(ip) : null

      // 提取 UTM 参数
      let utmParams = {}
      if (event.properties?.url) {
        try {
          const url = new URL(event.properties.url)
          utmParams = {
            utmSource: url.searchParams.get('utm_source'),
            utmMedium: url.searchParams.get('utm_medium'),
            utmCampaign: url.searchParams.get('utm_campaign'),
            utmTerm: url.searchParams.get('utm_term'),
            utmContent: url.searchParams.get('utm_content'),
          }
        } catch (e) {
          // 忽略无效 URL
        }
      }

      return {
        eventType: event.event,
        eventName: event.properties?.formName || event.properties?.buttonText,
        sessionId: event.sessionId,
        pageUrl: event.properties?.page || event.properties?.url || '/',
        pageTitle: event.properties?.title,
        referrer: event.context?.referrer,
        locale: event.context?.locale,
        userAgent: event.context?.userAgent,
        ipAddress: ip,
        deviceType: ua.device.type || 'desktop',
        browser: ua.browser.name,
        os: ua.os.name,
        country: geo?.country,
        region: geo?.region,
        city: geo?.city,
        ...utmParams,
        properties: event.properties,
        timestamp: new Date(event.timestamp),
        createdAt: new Date()
      }
    })

    // 6. 批量写入数据库
    await prisma.trafficRaw.createMany({
      data: processedEvents,
      skipDuplicates: true
    })

    // 7. 返回成功
    return Response.json({
      success: true,
      count: processedEvents.length
    })

  } catch (error) {
    console.error('[Track API] Error:', error)
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// 健康检查端点
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}
```

### 数据查询 API

```typescript
// app/api/v1/cdp/metrics/route.ts

import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// 查询参数验证
const QuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pageUrl: z.string().optional(),
  source: z.string().optional(),
  deviceType: z.string().optional(),
  country: z.string().optional(),
  granularity: z.enum(['hour', 'day']).default('day')
})

export async function GET(request: NextRequest) {
  try {
    // 1. 解析查询参数
    const { searchParams } = new URL(request.url)
    const params = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      pageUrl: searchParams.get('pageUrl'),
      source: searchParams.get('source'),
      deviceType: searchParams.get('deviceType'),
      country: searchParams.get('country'),
      granularity: searchParams.get('granularity') || 'day'
    }

    const validation = QuerySchema.safeParse(params)
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid query parameters', details: validation.error },
        { status: 400 }
      )
    }

    const query = validation.data

    // 2. 构建查询条件
    const whereClause: any = {
      date: {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate)
      }
    }

    if (query.pageUrl) whereClause.pageUrl = query.pageUrl
    if (query.source) whereClause.source = query.source
    if (query.deviceType) whereClause.deviceType = query.deviceType
    if (query.country) whereClause.country = query.country

    // 按粒度过滤
    if (query.granularity === 'day') {
      whereClause.hour = null  // 全天汇总
    }

    // 3. 查询数据
    const data = await prisma.trafficSummary.findMany({
      where: whereClause,
      orderBy: [
        { date: 'asc' },
        { hour: 'asc' }
      ]
    })

    // 4. 计算总计
    const totals = data.reduce((acc, row) => ({
      pageViews: acc.pageViews + row.pageViews,
      uniqueVisitors: acc.uniqueVisitors + row.uniqueVisitors,
      sessions: acc.sessions + row.sessions,
      formSubmissions: acc.formSubmissions + row.formSubmissions,
      ctaClicks: acc.ctaClicks + row.ctaClicks,
    }), {
      pageViews: 0,
      uniqueVisitors: 0,
      sessions: 0,
      formSubmissions: 0,
      ctaClicks: 0
    })

    // 计算平均值
    const avgBounceRate = data.length > 0
      ? data.reduce((sum, row) => sum + Number(row.bounceRate || 0), 0) / data.length
      : 0

    const avgConversionRate = totals.sessions > 0
      ? (totals.formSubmissions / totals.sessions * 100)
      : 0

    // 5. 返回结果
    return Response.json({
      data,
      totals: {
        ...totals,
        bounceRate: avgBounceRate.toFixed(2),
        conversionRate: avgConversionRate.toFixed(2)
      },
      meta: {
        startDate: query.startDate,
        endDate: query.endDate,
        granularity: query.granularity,
        count: data.length
      }
    })

  } catch (error) {
    console.error('[Metrics API] Error:', error)
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### 实时指标 API

```typescript
// app/api/v1/cdp/realtime/route.ts

import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 获取最近 5 分钟的数据
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    // 当前在线用户数 (最近 5 分钟活跃的 session)
    const activeUsers = await prisma.trafficRaw.groupBy({
      by: ['sessionId'],
      where: {
        timestamp: { gte: fiveMinutesAgo }
      },
      _count: true
    })

    // 最近 5 分钟的页面浏览
    const recentPageViews = await prisma.trafficRaw.count({
      where: {
        eventType: 'page_view',
        timestamp: { gte: fiveMinutesAgo }
      }
    })

    // 最近 5 分钟的热门页面
    const topPages = await prisma.trafficRaw.groupBy({
      by: ['pageUrl'],
      where: {
        eventType: 'page_view',
        timestamp: { gte: fiveMinutesAgo }
      },
      _count: true,
      orderBy: {
        _count: {
          pageUrl: 'desc'
        }
      },
      take: 10
    })

    // 最近 5 分钟的流量来源
    const topSources = await prisma.trafficRaw.groupBy({
      by: ['utmSource'],
      where: {
        timestamp: { gte: fiveMinutesAgo },
        utmSource: { not: null }
      },
      _count: true,
      orderBy: {
        _count: {
          utmSource: 'desc'
        }
      },
      take: 5
    })

    return Response.json({
      activeUsers: activeUsers.length,
      recentPageViews,
      topPages: topPages.map(p => ({
        url: p.pageUrl,
        views: p._count
      })),
      topSources: topSources.map(s => ({
        source: s.utmSource,
        count: s._count
      })),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Realtime API] Error:', error)
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// 配置不缓存实时数据
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

---

## ⚙️ ETL数据处理

### 完整的ETL任务实现

```typescript
// keystone/tasks/hourly-summary.ts

import { PrismaClient } from '@prisma/client'
import type { Prisma } from '@prisma/client'

const prisma = new PrismaClient()

interface SummaryDimensions {
  date: string
  hour: number | null
  pageUrl: string | null
  source: string | null
  utmSource: string | null
  deviceType: string | null
  country: string | null
  locale: string | null
}

/**
 * 每小时汇总任务
 */
export async function runHourlySummary(targetHour?: Date) {
  const startTime = Date.now()
  const target = targetHour || new Date()
  const hour = target.getUTCHours()
  const date = target.toISOString().split('T')[0]

  console.log(`📊 [ETL] Starting hourly summary for ${date} hour ${hour}`)

  try {
    // 记录任务开始
    const log = await prisma.eTLLog.create({
      data: {
        taskName: 'hourly_summary',
        taskType: 'hourly',
        startTime: new Date(),
        status: 'running'
      }
    })

    let totalRecords = 0

    // 1. 汇总全站数据
    await summarizeTraffic(prisma, { date, hour, pageUrl: null, source: null, utmSource: null, deviceType: null, country: null, locale: null })
    totalRecords++

    // 2. 按页面维度汇总
    const pages = await getDistinctDimensions(date, hour, 'pageUrl')
    for (const pageUrl of pages) {
      await summarizeTraffic(prisma, { date, hour, pageUrl, source: null, utmSource: null, deviceType: null, country: null, locale: null })
      totalRecords++
    }

    // 3. 按流量来源汇总
    const sources = await getDistinctDimensions(date, hour, 'utmSource')
    for (const utmSource of sources) {
      const source = classifySource(utmSource)
      await summarizeTraffic(prisma, { date, hour, pageUrl: null, source, utmSource, deviceType: null, country: null, locale: null })
      totalRecords++
    }

    // 4. 按设备类型汇总
    const devices = await getDistinctDimensions(date, hour, 'deviceType')
    for (const deviceType of devices) {
      await summarizeTraffic(prisma, { date, hour, pageUrl: null, source: null, utmSource: null, deviceType, country: null, locale: null })
      totalRecords++
    }

    // 5. 按国家汇总
    const countries = await getDistinctDimensions(date, hour, 'country')
    for (const country of countries) {
      await summarizeTraffic(prisma, { date, hour, pageUrl: null, source: null, utmSource: null, deviceType: null, country, locale: null })
      totalRecords++
    }

    // 6. 按语言汇总
    const locales = await getDistinctDimensions(date, hour, 'locale')
    for (const locale of locales) {
      await summarizeTraffic(prisma, { date, hour, pageUrl: null, source: null, utmSource: null, deviceType: null, country: null, locale })
      totalRecords++
    }

    // 7. 更新任务状态
    const duration = Date.now() - startTime
    await prisma.eTLLog.update({
      where: { id: log.id },
      data: {
        endTime: new Date(),
        status: 'success',
        recordsProcessed: totalRecords
      }
    })

    console.log(`✅ [ETL] Hourly summary completed in ${duration}ms, processed ${totalRecords} records`)

  } catch (error) {
    console.error(`❌ [ETL] Hourly summary failed:`, error)
    throw error
  }
}

/**
 * 获取指定维度的去重值
 */
async function getDistinctDimensions(
  date: string,
  hour: number,
  dimension: 'pageUrl' | 'utmSource' | 'deviceType' | 'country' | 'locale'
): Promise<string[]> {
  const startHour = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00Z`)
  const endHour = new Date(`${date}T${(hour + 1).toString().padStart(2, '0')}:00:00Z`)

  const results = await prisma.trafficRaw.findMany({
    where: {
      timestamp: { gte: startHour, lt: endHour },
      [dimension]: { not: null }
    },
    distinct: [dimension],
    select: { [dimension]: true }
  })

  return results.map(r => r[dimension]).filter(Boolean) as string[]
}

/**
 * 分类流量来源
 */
function classifySource(utmSource: string | null): string | null {
  if (!utmSource) return null

  const lower = utmSource.toLowerCase()

  if (lower.includes('google') || lower.includes('bing') || lower.includes('baidu')) {
    return 'organic'
  }
  if (lower.includes('facebook') || lower.includes('twitter') || lower.includes('linkedin')) {
    return 'social'
  }
  if (lower.includes('ad') || lower.includes('cpc') || lower.includes('ppc')) {
    return 'ad'
  }
  if (lower === 'direct') {
    return 'direct'
  }

  return 'referral'
}

/**
 * 汇总统计数据
 */
async function summarizeTraffic(
  prisma: PrismaClient,
  dimensions: SummaryDimensions
) {
  const { date, hour, pageUrl, source, utmSource, deviceType, country, locale } = dimensions

  // 构建查询条件
  const startTime = hour !== null
    ? new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00Z`)
    : new Date(`${date}T00:00:00Z`)

  const endTime = hour !== null
    ? new Date(`${date}T${(hour + 1).toString().padStart(2, '0')}:00:00Z`)
    : new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)

  const whereClause: Prisma.TrafficRawWhereInput = {
    timestamp: { gte: startTime, lt: endTime }
  }

  if (pageUrl) whereClause.pageUrl = pageUrl
  if (utmSource) whereClause.utmSource = utmSource
  if (deviceType) whereClause.deviceType = deviceType
  if (country) whereClause.country = country
  if (locale) whereClause.locale = locale

  // 1. 计算基础指标
  const pageViews = await prisma.trafficRaw.count({
    where: { ...whereClause, eventType: 'page_view' }
  })

  const uniqueVisitors = (await prisma.trafficRaw.groupBy({
    by: ['ipAddress'],
    where: whereClause,
    _count: true
  })).length

  const sessions = (await prisma.trafficRaw.groupBy({
    by: ['sessionId'],
    where: whereClause,
    _count: true
  })).length

  // 2. 计算跳出率 (单页 session 的比例)
  const sessionPageCounts = await prisma.$queryRaw<Array<{ session_id: string; page_count: number }>>`
    SELECT session_id, COUNT(*) as page_count
    FROM traffic_raw
    WHERE timestamp >= ${startTime}
      AND timestamp < ${endTime}
      AND event_type = 'page_view'
      ${pageUrl ? Prisma.sql`AND page_url = ${pageUrl}` : Prisma.empty}
      ${deviceType ? Prisma.sql`AND device_type = ${deviceType}` : Prisma.empty}
      ${country ? Prisma.sql`AND country = ${country}` : Prisma.empty}
    GROUP BY session_id
  `

  const bouncedSessions = sessionPageCounts.filter(s => Number(s.page_count) === 1).length
  const bounceRate = sessions > 0 ? (bouncedSessions / sessions * 100) : 0

  // 3. 计算平均 Session 时长
  const sessionDurations = await prisma.$queryRaw<Array<{ duration: number }>>`
    SELECT
      EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) as duration
    FROM traffic_raw
    WHERE timestamp >= ${startTime}
      AND timestamp < ${endTime}
      ${pageUrl ? Prisma.sql`AND page_url = ${pageUrl}` : Prisma.empty}
      ${deviceType ? Prisma.sql`AND device_type = ${deviceType}` : Prisma.empty}
      ${country ? Prisma.sql`AND country = ${country}` : Prisma.empty}
    GROUP BY session_id
    HAVING COUNT(*) > 1
  `

  const avgSessionDuration = sessionDurations.length > 0
    ? Math.floor(sessionDurations.reduce((sum, s) => sum + Number(s.duration), 0) / sessionDurations.length)
    : 0

  // 4. 计算转化指标
  const formSubmissions = await prisma.trafficRaw.count({
    where: { ...whereClause, eventType: 'form_submit' }
  })

  const ctaClicks = await prisma.trafficRaw.count({
    where: { ...whereClause, eventType: 'cta_click' }
  })

  const inquiryClicks = await prisma.trafficRaw.count({
    where: { ...whereClause, eventType: 'product_inquiry' }
  })

  const conversionRate = sessions > 0 ? (formSubmissions / sessions * 100) : 0

  // 5. 插入或更新汇总数据
  await prisma.trafficSummary.upsert({
    where: {
      unique_summary: {
        date: new Date(date),
        hour: hour ?? -1,
        pageUrl: pageUrl ?? '',
        source: source ?? '',
        deviceType: deviceType ?? '',
        country: country ?? '',
        locale: locale ?? ''
      }
    },
    create: {
      date: new Date(date),
      hour,
      pageUrl,
      source,
      utmSource,
      deviceType,
      country,
      locale,
      pageViews,
      uniqueVisitors,
      sessions,
      bounceRate,
      avgSessionDuration,
      formSubmissions,
      ctaClicks,
      inquiryClicks,
      conversionRate
    },
    update: {
      pageViews,
      uniqueVisitors,
      sessions,
      bounceRate,
      avgSessionDuration,
      formSubmissions,
      ctaClicks,
      inquiryClicks,
      conversionRate,
      updatedAt: new Date()
    }
  })
}

/**
 * 每日汇总任务
 */
export async function runDailySummary(targetDate?: Date) {
  const target = targetDate || new Date(Date.now() - 24 * 60 * 60 * 1000)  // 默认前一天
  const date = target.toISOString().split('T')[0]

  console.log(`📊 [ETL] Starting daily summary for ${date}`)

  try {
    // 汇总全天数据 (hour = null)
    await summarizeTraffic(prisma, {
      date,
      hour: null,
      pageUrl: null,
      source: null,
      utmSource: null,
      deviceType: null,
      country: null,
      locale: null
    })

    // 按各维度汇总...
    // (与 hourly 类似,省略)

    console.log(`✅ [ETL] Daily summary completed for ${date}`)

  } catch (error) {
    console.error(`❌ [ETL] Daily summary failed:`, error)
    throw error
  }
}
```

### Cron 调度器

```typescript
// keystone/cron.ts

import cron from 'node-cron'
import { runHourlySummary, runDailySummary } from './tasks/hourly-summary'

export function startCronJobs() {
  console.log('⏰ [Cron] Starting scheduled jobs...')

  // 每小时的第 5 分钟运行 (汇总上一小时的数据)
  cron.schedule('5 * * * *', async () => {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000)
    console.log(`⏰ [Cron] Triggering hourly summary for ${lastHour.toISOString()}`)

    try {
      await runHourlySummary(lastHour)
    } catch (error) {
      console.error('❌ [Cron] Hourly summary failed:', error)
      // 发送告警通知...
    }
  })

  // 每天凌晨 1 点运行 (汇总前一天的数据)
  cron.schedule('0 1 * * *', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    console.log(`⏰ [Cron] Triggering daily summary for ${yesterday.toISOString()}`)

    try {
      await runDailySummary(yesterday)
    } catch (error) {
      console.error('❌ [Cron] Daily summary failed:', error)
      // 发送告警通知...
    }
  })

  // 每周一凌晨 2 点运行数据清理 (删除 90 天前的原始数据)
  cron.schedule('0 2 * * 1', async () => {
    console.log('⏰ [Cron] Triggering data cleanup...')

    try {
      await cleanupOldData()
    } catch (error) {
      console.error('❌ [Cron] Data cleanup failed:', error)
    }
  })

  console.log('✅ [Cron] All jobs scheduled')
}

/**
 * 数据清理任务
 */
async function cleanupOldData() {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const result = await prisma.trafficRaw.deleteMany({
    where: {
      timestamp: {
        lt: ninetyDaysAgo
      }
    }
  })

  console.log(`🗑️ [Cleanup] Deleted ${result.count} old records`)
}
```

### 手动触发 ETL API

```typescript
// app/api/v1/cdp/trigger-etl/route.ts

import { NextRequest } from 'next/server'
import { runHourlySummary, runDailySummary } from '@/keystone/tasks/hourly-summary'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, date, hour } = body

    // 简单的认证 (生产环境应该使用更强的认证机制)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ETL_API_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (type === 'hourly') {
      const targetHour = date && hour !== undefined
        ? new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00Z`)
        : undefined

      await runHourlySummary(targetHour)

      return Response.json({
        success: true,
        message: 'Hourly summary completed',
        date,
        hour
      })
    }

    if (type === 'daily') {
      const targetDate = date ? new Date(date) : undefined

      await runDailySummary(targetDate)

      return Response.json({
        success: true,
        message: 'Daily summary completed',
        date
      })
    }

    return Response.json({ error: 'Invalid type' }, { status: 400 })

  } catch (error) {
    console.error('[Trigger ETL] Error:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

---

## 📈 可视化大屏实施

### Keystone Admin UI 集成

```typescript
// keystone.ts

import { config } from '@keystone-6/core'
import { lists } from './keystone/schema'

export default config({
  db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL!,
  },
  lists,
  ui: {
    // 添加自定义页面
    pages: [
      {
        label: 'CDP Dashboard',
        path: '/cdp',
        component: () => import('./keystone/admin/pages/cdp')
      }
    ],
    // 自定义导航
    navigation: {
      'Analytics': [
        { label: 'CDP Dashboard', href: '/cdp' },
        { label: 'Traffic Raw', listKey: 'TrafficRaw' },
        { label: 'Traffic Summary', listKey: 'TrafficSummary' },
        { label: 'AI Insights', listKey: 'AIInsight' },
      ]
    }
  },
})
```

### CDP Dashboard 页面

```tsx
// keystone/admin/pages/cdp.tsx

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@keystone-ui/core'
import { PageContainer } from '@keystone-6/core/admin-ui/components'
import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'

interface Metrics {
  pageViews: number
  uniqueVisitors: number
  sessions: number
  conversionRate: number
  bounceRate: number
}

interface RealtimeData {
  activeUsers: number
  recentPageViews: number
  topPages: Array<{ url: string; views: number }>
  topSources: Array<{ source: string; count: number }>
}

export default function CDPDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [realtime, setRealtime] = useState<RealtimeData | null>(null)
  const [timeRange, setTimeRange] = useState('7d')  // '24h', '7d', '30d'
  const [loading, setLoading] = useState(true)

  // 获取指标数据
  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)  // 每 30 秒刷新
    return () => clearInterval(interval)
  }, [timeRange])

  // 获取实时数据
  useEffect(() => {
    fetchRealtime()
    const interval = setInterval(fetchRealtime, 5000)  // 每 5 秒刷新
    return () => clearInterval(interval)
  }, [])

  async function fetchMetrics() {
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - getDaysFromRange(timeRange) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

      const response = await fetch(
        `/api/v1/cdp/metrics?startDate=${startDate}&endDate=${endDate}&granularity=day`
      )
      const data = await response.json()

      setMetrics(data.totals)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    }
  }

  async function fetchRealtime() {
    try {
      const response = await fetch('/api/v1/cdp/realtime')
      const data = await response.json()
      setRealtime(data)
    } catch (error) {
      console.error('Failed to fetch realtime data:', error)
    }
  }

  function getDaysFromRange(range: string): number {
    switch (range) {
      case '24h': return 1
      case '7d': return 7
      case '30d': return 30
      default: return 7
    }
  }

  if (loading) {
    return (
      <PageContainer header="CDP Dashboard">
        <div css={{ padding: 24 }}>Loading...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer header="CDP Dashboard">
      {/* 时间范围选择器 */}
      <div css={{ padding: '16px 24px', borderBottom: '1px solid #e1e5e9' }}>
        <div css={{ display: 'flex', gap: 8 }}>
          {['24h', '7d', '30d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              css={{
                padding: '8px 16px',
                border: '1px solid #e1e5e9',
                borderRadius: 4,
                background: timeRange === range ? '#2563eb' : 'white',
                color: timeRange === range ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {range === '24h' ? 'Last 24 Hours' :
               range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      <div css={{ padding: 24 }}>
        {/* 实时指标卡片 */}
        <div css={{ marginBottom: 32 }}>
          <h2 css={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Real-time Metrics
          </h2>
          <div css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16
          }}>
            <MetricCard
              title="Active Users"
              value={realtime?.activeUsers || 0}
              subtitle="Last 5 minutes"
              color="#10b981"
            />
            <MetricCard
              title="Recent Page Views"
              value={realtime?.recentPageViews || 0}
              subtitle="Last 5 minutes"
              color="#3b82f6"
            />
          </div>
        </div>

        {/* 主要指标卡片 */}
        <div css={{ marginBottom: 32 }}>
          <h2 css={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Key Metrics
          </h2>
          <div css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16
          }}>
            <MetricCard
              title="Page Views"
              value={metrics?.pageViews || 0}
              trend="+12.3%"
              trendUp={true}
              color="#3b82f6"
            />
            <MetricCard
              title="Unique Visitors"
              value={metrics?.uniqueVisitors || 0}
              trend="+8.5%"
              trendUp={true}
              color="#8b5cf6"
            />
            <MetricCard
              title="Sessions"
              value={metrics?.sessions || 0}
              trend="-2.1%"
              trendUp={false}
              color="#f59e0b"
            />
            <MetricCard
              title="Conversion Rate"
              value={`${metrics?.conversionRate || 0}%`}
              trend="+0.5%"
              trendUp={true}
              color="#10b981"
            />
            <MetricCard
              title="Bounce Rate"
              value={`${metrics?.bounceRate || 0}%`}
              trend="-3.2%"
              trendUp={true}
              color="#ef4444"
            />
          </div>
        </div>

        {/* 热门页面 */}
        <div css={{ marginBottom: 32 }}>
          <h2 css={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Top Pages (Last 5 min)
          </h2>
          <div css={{
            background: 'white',
            border: '1px solid #e1e5e9',
            borderRadius: 8,
            overflow: 'hidden'
          }}>
            <table css={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr css={{ background: '#f9fafb' }}>
                  <th css={{ padding: 12, textAlign: 'left', fontSize: 14 }}>Page</th>
                  <th css={{ padding: 12, textAlign: 'right', fontSize: 14 }}>Views</th>
                </tr>
              </thead>
              <tbody>
                {realtime?.topPages.map((page, i) => (
                  <tr key={i} css={{ borderTop: '1px solid #e1e5e9' }}>
                    <td css={{ padding: 12, fontSize: 14 }}>{page.url}</td>
                    <td css={{ padding: 12, textAlign: 'right', fontSize: 14, fontWeight: 600 }}>
                      {page.views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

// 指标卡片组件
interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: string
  trendUp?: boolean
  color: string
}

function MetricCard({ title, value, subtitle, trend, trendUp, color }: MetricCardProps) {
  return (
    <div css={{
      background: 'white',
      border: '1px solid #e1e5e9',
      borderRadius: 8,
      padding: 20,
    }}>
      <div css={{
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
        fontWeight: 500
      }}>
        {title}
      </div>
      <div css={{
        fontSize: 32,
        fontWeight: 700,
        color: color,
        marginBottom: 4
      }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div css={{ fontSize: 12, color: '#9ca3af' }}>
          {subtitle}
        </div>
      )}
      {trend && (
        <div css={{
          fontSize: 14,
          fontWeight: 500,
          color: trendUp ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <span>{trendUp ? '↑' : '↓'}</span>
          <span>{trend}</span>
        </div>
      )}
    </div>
  )
}
```

---

## 🤖 AI优化模块

### SEO 优化建议生成

```typescript
// lib/ai/seo-optimizer.ts

import { GoogleGenerativeAI } from '@google/generative-ai'
import { PrismaClient } from '@prisma/client'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const prisma = new PrismaClient()

interface SEOInsight {
  type: 'seo'
  category: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  expectedImpact: string
  dataSnapshot: any
}

/**
 * 生成 SEO 优化建议
 */
export async function generateSEOInsights(days = 30): Promise<SEOInsight[]> {
  console.log('🤖 [AI] Generating SEO insights...')

  // 1. 收集数据
  const data = await collectSEOData(days)

  // 2. 构建 Prompt
  const prompt = buildSEOPrompt(data)

  // 3. 调用 Gemini API
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  // 4. 解析结果
  const insights = parseInsightsJSON(text)

  // 5. 保存到数据库
  for (const insight of insights) {
    await prisma.aIInsight.create({
      data: {
        type: 'seo',
        category: insight.category,
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
        expectedImpact: insight.expectedImpact,
        dataSnapshot: data,
        status: 'pending'
      }
    })
  }

  console.log(`✅ [AI] Generated ${insights.length} SEO insights`)

  return insights
}

/**
 * 收集 SEO 相关数据
 */
async function collectSEOData(days: number) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const endDate = new Date()

  // 1. 总体流量数据
  const totalMetrics = await prisma.trafficSummary.aggregate({
    where: {
      date: { gte: startDate, lte: endDate },
      hour: null,
      pageUrl: null
    },
    _sum: {
      pageViews: true,
      uniqueVisitors: true,
      sessions: true,
      formSubmissions: true
    },
    _avg: {
      bounceRate: true,
      conversionRate: true,
      avgSessionDuration: true
    }
  })

  // 2. 热门页面
  const topPages = await prisma.trafficSummary.groupBy({
    by: ['pageUrl'],
    where: {
      date: { gte: startDate, lte: endDate },
      pageUrl: { not: null }
    },
    _sum: {
      pageViews: true,
      uniqueVisitors: true
    },
    _avg: {
      bounceRate: true,
      avgSessionDuration: true
    },
    orderBy: {
      _sum: {
        pageViews: 'desc'
      }
    },
    take: 10
  })

  // 3. 流量来源分布
  const trafficSources = await prisma.trafficSummary.groupBy({
    by: ['source'],
    where: {
      date: { gte: startDate, lte: endDate },
      source: { not: null }
    },
    _sum: {
      pageViews: true,
      sessions: true
    },
    orderBy: {
      _sum: {
        sessions: 'desc'
      }
    }
  })

  // 4. 高跳出率页面
  const highBouncePages = await prisma.trafficSummary.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      pageUrl: { not: null },
      bounceRate: { gt: 70 }
    },
    orderBy: {
      bounceRate: 'desc'
    },
    take: 5
  })

  // 5. 低转化页面
  const lowConversionPages = await prisma.trafficSummary.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      pageUrl: { not: null },
      sessions: { gt: 10 },
      conversionRate: { lt: 2 }
    },
    orderBy: {
      sessions: 'desc'
    },
    take: 5
  })

  return {
    period: { days, startDate, endDate },
    totalMetrics,
    topPages,
    trafficSources,
    highBouncePages,
    lowConversionPages
  }
}

/**
 * 构建 SEO Prompt
 */
function buildSEOPrompt(data: any): string {
  return `
你是一位资深的 SEO 专家和数据分析师。请基于以下网站流量数据,生成专业的 SEO 优化建议。

## 数据概览 (最近 ${data.period.days} 天)

### 总体指标:
- 总页面浏览量: ${data.totalMetrics._sum.pageViews?.toLocaleString()}
- 独立访客: ${data.totalMetrics._sum.uniqueVisitors?.toLocaleString()}
- 会话数: ${data.totalMetrics._sum.sessions?.toLocaleString()}
- 平均跳出率: ${data.totalMetrics._avg.bounceRate?.toFixed(2)}%
- 平均会话时长: ${Math.floor(data.totalMetrics._avg.avgSessionDuration || 0)} 秒
- 平均转化率: ${data.totalMetrics._avg.conversionRate?.toFixed(2)}%

### 热门页面 (Top 10):
${data.topPages.map((p: any, i: number) =>
  `${i+1}. ${p.pageUrl} - ${p._sum.pageViews} PV, ${p._avg.bounceRate?.toFixed(1)}% 跳出率`
).join('\n')}

### 流量来源分布:
${data.trafficSources.map((s: any) =>
  `- ${s.source}: ${s._sum.sessions} sessions (${((s._sum.sessions / data.totalMetrics._sum.sessions) * 100).toFixed(1)}%)`
).join('\n')}

### 问题页面:
**高跳出率页面:**
${data.highBouncePages.map((p: any) =>
  `- ${p.pageUrl}: ${p.bounceRate}% 跳出率`
).join('\n')}

**低转化率页面:**
${data.lowConversionPages.map((p: any) =>
  `- ${p.pageUrl}: ${p.conversionRate?.toFixed(2)}% 转化率 (${p.sessions} sessions)`
).join('\n')}

## 任务要求:

请生成 5-8 条具体的 SEO 优化建议,每条建议需包含:

1. **category**: 类别 (技术SEO / 内容优化 / 用户体验 / 链接建设 / 转化优化)
2. **title**: 简洁标题 (15字以内)
3. **description**: 详细说明,包括:
   - 问题描述
   - 具体优化建议
   - 实施步骤
4. **priority**: 优先级 (high / medium / low)
5. **expectedImpact**: 预期效果 (具体数值或百分比)

## 输出格式:

请严格按照以下 JSON 格式输出 (不要包含任何其他文本):

\`\`\`json
[
  {
    "category": "内容优化",
    "title": "优化高跳出率页面内容",
    "description": "页面 /products/abc 的跳出率高达 85%,明显高于平均水平...",
    "priority": "high",
    "expectedImpact": "预计可降低跳出率 15-20%,提升停留时间 30%"
  },
  ...
]
\`\`\`

开始分析:
`.trim()
}

/**
 * 解析 Gemini 返回的 JSON
 */
function parseInsightsJSON(text: string): SEOInsight[] {
  try {
    // 提取 JSON 代码块
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                     text.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0]
    const insights = JSON.parse(jsonStr)

    // 添加 type 字段
    return insights.map((insight: any) => ({
      type: 'seo',
      ...insight
    }))

  } catch (error) {
    console.error('[AI] Failed to parse insights:', error)
    console.error('Raw text:', text)
    return []
  }
}
```

### AI 建议展示组件

```tsx
// components/cdp/AIInsights.tsx

'use client'

import { useState, useEffect } from 'react'

interface Insight {
  id: number
  type: string
  category: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  expectedImpact: string
  status: string
  createdAt: string
}

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchInsights()
  }, [])

  async function fetchInsights() {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/cdp/insights')
      const data = await response.json()
      setInsights(data.insights)
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateInsights() {
    setGenerating(true)
    try {
      const response = await fetch('/api/v1/cdp/insights/generate', {
        method: 'POST'
      })
      const data = await response.json()
      setInsights(data.insights)
    } catch (error) {
      console.error('Failed to generate insights:', error)
    } finally {
      setGenerating(false)
    }
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Optimization Insights</h2>
        <button
          onClick={generateInsights}
          disabled={generating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate New Insights'}
        </button>
      </div>

      {/* Insights List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {insights.map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  )
}

function InsightCard({ insight }: { insight: Insight }) {
  const [expanded, setExpanded] = useState(false)

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  }

  return (
    <div className={`border-l-4 rounded-lg p-6 bg-white shadow-sm ${priorityColors[insight.priority]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[insight.priority]}`}>
              {insight.priority.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">{insight.category}</span>
          </div>

          <h3 className="text-lg font-semibold mb-2">{insight.title}</h3>

          {expanded ? (
            <div className="space-y-3">
              <p className="text-gray-700 whitespace-pre-line">{insight.description}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-blue-900 mb-1">Expected Impact:</div>
                <div className="text-blue-700">{insight.expectedImpact}</div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 line-clamp-2">{insight.description}</p>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Generated {new Date(insight.createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}
```

---

## 🧪 测试方案

### 单元测试示例

```typescript
// __tests__/cdp/metrics-calculator.test.ts

import { describe, expect, test } from '@jest/globals'
import { calculateBounceRate, calculateConversionRate, classifyTrafficSource } from '@/lib/cdp/metrics'

describe('Metrics Calculator', () => {
  describe('calculateBounceRate', () => {
    test('should calculate bounce rate correctly', () => {
      expect(calculateBounceRate(50, 100)).toBe(50)
      expect(calculateBounceRate(0, 100)).toBe(0)
      expect(calculateBounceRate(100, 100)).toBe(100)
    })

    test('should return 0 for zero sessions', () => {
      expect(calculateBounceRate(0, 0)).toBe(0)
    })
  })

  describe('calculateConversionRate', () => {
    test('should calculate conversion rate correctly', () => {
      expect(calculateConversionRate(10, 100)).toBe(10)
      expect(calculateConversionRate(5, 50)).toBe(10)
    })

    test('should return 0 for zero sessions', () => {
      expect(calculateConversionRate(5, 0)).toBe(0)
    })
  })

  describe('classifyTrafficSource', () => {
    test('should classify organic search correctly', () => {
      expect(classifyTrafficSource('google')).toBe('organic')
      expect(classifyTrafficSource('bing')).toBe('organic')
    })

    test('should classify social media correctly', () => {
      expect(classifyTrafficSource('facebook')).toBe('social')
      expect(classifyTrafficSource('twitter')).toBe('social')
    })

    test('should classify ads correctly', () => {
      expect(classifyTrafficSource('google-ads')).toBe('ad')
      expect(classifyTrafficSource('facebook-cpc')).toBe('ad')
    })
  })
})
```

### 集成测试示例

```typescript
// __tests__/integration/tracking-flow.test.ts

import { describe, expect, test, beforeAll, afterAll } from '@jest/globals'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Tracking Flow Integration', () => {
  beforeAll(async () => {
    // 清理测试数据
    await prisma.trafficRaw.deleteMany({
      where: { sessionId: { startsWith: 'test_' } }
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('should track event end-to-end', async () => {
    // 1. 模拟前端发送事件
    const event = {
      event: 'page_view',
      sessionId: 'test_session_123',
      timestamp: new Date().toISOString(),
      properties: {
        page: '/test-page',
        title: 'Test Page'
      },
      context: {
        userAgent: 'Mozilla/5.0 (Test)',
        locale: 'en-US'
      }
    }

    const response = await fetch('http://localhost:3000/api/v1/track/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })

    expect(response.status).toBe(200)

    // 2. 验证数据已存储
    const stored = await prisma.trafficRaw.findFirst({
      where: {
        sessionId: 'test_session_123',
        eventType: 'page_view'
      }
    })

    expect(stored).toBeTruthy()
    expect(stored?.pageUrl).toBe('/test-page')

    // 3. 触发 ETL 汇总
    await runHourlySummary()

    // 4. 验证汇总数据
    const summary = await prisma.trafficSummary.findFirst({
      where: {
        date: new Date().toISOString().split('T')[0],
        hour: new Date().getUTCHours()
      }
    })

    expect(summary).toBeTruthy()
    expect(summary?.pageViews).toBeGreaterThan(0)
  })
})
```

---

## 🚀 部署方案

### 环境变量配置

```bash
# .env.production

# Database
DATABASE_URL="postgresql://user:password@host:5432/busrom_cdp"

# API Keys
GEMINI_API_KEY="your-gemini-api-key"
ETL_API_SECRET="your-etl-secret"

# Tracking
NEXT_PUBLIC_TRACKER_SAMPLE_RATE=1.0  # 100% 采样

# Redis (可选,用于缓存和速率限制)
REDIS_URL="redis://host:6379"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

### Docker 部署

```dockerfile
# Dockerfile

FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: busrom
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: busrom_cdp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://busrom:${DB_PASSWORD}@postgres:5432/busrom_cdp
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## 📊 监控与维护

### 关键监控指标

1. **系统性能**
   - API 响应时间 (P50, P95, P99)
   - 数据库查询时间
   - ETL 任务执行时间
   - 内存和 CPU 使用率

2. **数据质量**
   - 事件接收成功率
   - 数据完整性
   - ETL 任务成功率

3. **业务指标**
   - 每日活跃用户
   - 页面浏览量趋势
   - 转化率变化

### 告警规则

```typescript
// lib/monitoring/alerts.ts

export const alertRules = [
  {
    name: 'High API Error Rate',
    condition: 'error_rate > 5%',
    severity: 'critical',
    action: 'Send email to dev team'
  },
  {
    name: 'ETL Task Failed',
    condition: 'etl_status = failed',
    severity: 'high',
    action: 'Send Slack notification'
  },
  {
    name: 'Low Data Collection Rate',
    condition: 'events_per_hour < 100',
    severity: 'medium',
    action: 'Log warning'
  }
]
```

---

## 📚 附录

### A. 术语表

| 术语 | 定义 |
|-----|------|
| PV | Page View, 页面浏览量 |
| UV | Unique Visitor, 独立访客数 |
| Session | 用户会话, 15分钟无活动或跨天则结束 |
| Bounce Rate | 跳出率, 只浏览一个页面就离开的会话比例 |
| Conversion Rate | 转化率, 完成目标行为的会话比例 |
| UTM Parameters | 用于追踪营销活动的URL参数 |
| ETL | Extract, Transform, Load, 数据提取转换加载 |

### B. API 文档链接

- [事件追踪 API](/api/v1/track/event)
- [指标查询 API](/api/v1/cdp/metrics)
- [实时数据 API](/api/v1/cdp/realtime)
- [AI 建议 API](/api/v1/cdp/insights)

### C. 相关资源

- [Prisma 文档](https://www.prisma.io/docs)
- [Recharts 文档](https://recharts.org)
- [Gemini API 文档](https://ai.google.dev/docs)
- [PostgreSQL 性能优化](https://www.postgresql.org/docs/current/performance-tips.html)

---

**文档版本**: v2.0
**最后更新**: 2025-11-12
**维护者**: Busrom 开发团队
