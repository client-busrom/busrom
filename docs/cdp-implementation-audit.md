# Busrom CDP 实现审计报告

**审计日期：** 2026-06-23  
**审计对象：** `cdp/` 目录下的 CDP Next.js 服务、Superset 初始化脚本、前端埋点 SDK  
**依据文档：** `docs/CDP开发文档.md`  
**排除范围：** 文档中 “AI SEO / 搜索引擎优化建议” 相关章节（按用户要求），相关能力仅在备注中说明，不计入统计。

---

## 执行摘要

| 维度 | 数量 |
|---|---|
| 审计功能点总数 | 31 |
| ✅ 已实现 | 12 |
| ⚠️ 部分实现 | 13 |
| ❌ 未实现 | 6 |

**主要结论：**

- 数据采集（埋点）、ETL 汇总、基础指标计算、渠道判定、关键词提取、SSO/CMS 集成等核心链路已落地。
- Superset 默认仪表盘目前仅配置了 5 个图表（PV 趋势、渠道分布、Top Pages、设备分布、跳出率趋势），大量指标（UV、平均访问时长、入口/退出页、浏览器/国家、表单与转化漏斗等）未在初始化脚本中提供专用图表。
- 转化与表单指标存在明显缺口：前端未自动将 WhatsApp/Email/在线聊天点击标记为 `conversion` / `lead` 事件，导致 ETL 中的“转化次数/转化率”和“线索数”无法按文档定义完整统计。
- 优化建议（广告、转化、趋势异常）完全未实现。
- 测试覆盖薄弱：仅有 3 个单元测试文件，缺少对 ETL、API 路由、权限中间件、Superset 初始化脚本的测试。

---

## 1. 基础指标

| 功能 | 后端 | Superset 仪表盘 | 埋点 SDK | 总体 | 证据 / 备注 |
|---|---|---|---|---|---|
| 页面浏览量（PV） | ✅ | ✅ | ✅ | ✅ | 后端：`traffic_summary.pv`、`cdp/src/jobs/etl.ts` 计算；仪表盘：`init_cdp_dashboards.py` 中 “PV 趋势”；SDK：`web/lib/analytics.ts` `trackPageView()`。 |
| 独立访客数（UV） | ✅ | ❌ | ✅ | ⚠️ | 后端：`traffic_summary.uv` 按 `visitor_id` 去重；SDK：生成 `visitorId`。但 `init_cdp_dashboards.py` 未创建 UV 专用图表。 |
| 访问次数（Sessions） | ✅ | ✅ | ✅ | ✅ | 后端：`traffic_summary.sessions`；仪表盘：渠道分布按 `sessions` 汇总；SDK：15 分钟无活动 / 跨天自动重置 `sessionId`（`web/lib/analytics.ts`）。 |
| 平均每次访问浏览页数（PV/Sessions） | ✅ | ❌ | N/A | ⚠️ | 后端：`/api/analytics/summary?type=overview` 返回 `pvPerSession`；Superset 未配置该指标图表。 |
| 跳出率（Bounce Rate） | ✅ | ✅ | N/A | ✅ | 后端：`traffic_summary.bounce_rate`，ETL 按单会话去重页面数 `<=1` 计算；仪表盘：`init_cdp_dashboards.py` 中 “跳出率趋势”。 |
| 平均访问时长（Avg. Duration） | ✅ | ❌ | N/A | ⚠️ | 后端：`traffic_summary.avg_duration`，ETL 按会话首尾时间差计算；Superset 未配置图表。 |
| 转化次数（Conversion Count） | ⚠️ | ❌ | ⚠️ | ⚠️ | 后端：ETL 统计 `eventType === 'conversion'` 的会话（`cdp/src/jobs/etl.ts`），但前端目前只发送 `form_submit` / `click`，未自动发送 `conversion` 事件；SDK 支持 `trackEvent('conversion')`，需业务侧手动调用。 |
| 转化率（Conversion Rate） | ⚠️ | ❌ | ⚠️ | ⚠️ | 后端：`traffic_summary.conversion_rate` 由 `conversions / sessions` 计算，因“转化次数”统计不完整，该指标也不完整。 |

---

## 2. 趋势与对比指标

| 功能 | 后端 | Superset 仪表盘 | 埋点 SDK | 总体 | 证据 / 备注 |
|---|---|---|---|---|---|
| 日环比 / 周环比 / 月环比 | ✅ | ❌ | N/A | ⚠️ | 后端：`cdp/src/jobs/etl.ts` `calculateTrends()` 写入 `*_change_day/week/month`；`/api/analytics/summary?type=overview` 也计算周期对比值。Superset 未配置带红绿 +/- 标识的环比展示。 |
| 7 日趋势 / 30 日趋势 | ✅ | ⚠️ | N/A | ⚠️ | 后端：`summary` 接口支持 `startDate`/`endDate`；`overview` 默认最近 7 天。Superset 图表支持按日期过滤，但 `init_cdp_dashboards.py` 未预置 7/30 天快捷视图或筛选器。 |

---

## 3. 渠道指标

| 功能 | 后端 | Superset 仪表盘 | 埋点 SDK | 总体 | 证据 / 备注 |
|---|---|---|---|---|---|
| 自然/广告/直接/引荐/社交流量访问量 | ✅ | ✅ | ✅ | ✅ | 后端：`traffic_summary.channel`；仪表盘：`init_cdp_dashboards.py` 中 “渠道分布” 饼图；SDK：`web/lib/analytics.ts` `detectChannel()` 区分 `organic/ad/direct/referral/social`（注：有 `utm_source` 即判定为 `ad`）。 |
| 渠道占比（Channel Share） | ✅ | ✅ | N/A | ✅ | 后端：按 `channel` 汇总 `sessions`；仪表盘：饼图可直接展示占比。 |
| 渠道跳出率（Channel Bounce Rate） | ✅ | ❌ | N/A | ⚠️ | 后端：`/api/analytics/summary?type=channel-bounce` 已提供；Superset 未创建对应图表。 |

---

## 4. 热门页面 & 路径指标

| 功能 | 后端 | Superset 仪表盘 | 埋点 SDK | 总体 | 证据 / 备注 |
|---|---|---|---|---|---|
| 热门页面（Top Pages） | ✅ | ✅ | N/A | ✅ | 后端：`/api/analytics/summary?type=top-pages`；ETL 按 `page_path` 汇总 PV；仪表盘：`init_cdp_dashboards.py` 中 “Top Pages”。 |
| 入口页（Top Entry Pages） | ✅ | ❌ | N/A | ⚠️ | 后端：`path_insights` 表 `insight_type = 'entry_pages'`（`cdp/src/jobs/etl.ts` `buildPathInsights`）；Superset 未配置入口页占比图表。 |
| 退出页（Top Exit Pages） | ✅ | ❌ | N/A | ⚠️ | 后端：`path_insights` 表 `insight_type = 'exit_pages'`；Superset 未配置退出页占比图表。 |
| 热门访问路径（Popular Paths） | ✅ | ❌ | N/A | ⚠️ | 后端：`visitor_paths` 表及 `path_insights` 的 `top_paths`/`conversion_paths`；Superset 未创建行为流向图/漏斗图（`docker/superset/dashboards/README.md` 建议创建转化漏斗，但 `init_cdp_dashboards.py` 未实现）。 |

---

## 5. 转化与表单指标

| 功能 | 后端 | Superset 仪表盘 | 埋点 SDK | 总体 | 证据 / 备注 |
|---|---|---|---|---|---|
| 表单提交次数（Form Submission Count） | ✅ | ❌ | ✅ | ⚠️ | 后端：`traffic_summary.form_submissions`，ETL 统计 `eventType === 'form_submit'`；SDK：自动监听 `submit` 事件。Superset 缺少表单提交专用图表。 |
| 表单转化率（Form Conversion Rate） | ❌ | ❌ | ❌ | ❌ | 后端未按“表单提交次数 ÷ 访问量”计算独立字段；现有 `conversion_rate` 基于 `conversions` 而非 `form_submissions`。 |
| 线索数（Lead Count：WhatsApp / Email 点击） | ❌ | ❌ | ❌ | ❌ | 前端未自动将 WhatsApp / Email / 在线聊天点击标记为 `conversion` 或 `lead`；ETL 未统计该类线索。 |

---

## 6. 用户画像 & 设备指标

| 功能 | 后端 | Superset 仪表盘 | 埋点 SDK | 总体 | 证据 / 备注 |
|---|---|---|---|---|---|
| 设备类型（Visits by Device） | ✅ | ✅ | ✅ | ✅ | 后端：`traffic_summary.device_breakdown`；仪表盘：`init_cdp_dashboards.py` 中 “设备分布”（数据源 `traffic_raw.device_type`）；SDK：`web/lib/analytics.ts` `getDeviceType()`。 |
| 浏览器类型（Visits by Browser） | ✅ | ❌ | ✅ | ⚠️ | 后端：`traffic_summary.browser_breakdown`；`/api/analytics/summary?type=browser-breakdown` 已提供；Superset 未创建浏览器分布图表。 |
| 国家地区（Visits by Country） | ✅ | ❌ | ✅ | ⚠️ | 后端：`traffic_summary.country_breakdown`；`cdp/src/lib/ip.ts` 通过 GeoIP 解析；Superset 未创建国家分布图表。 |

---

## 7. 优化建议（已排除 SEO 相关）

按用户要求，**SEO 优化建议** 与 **内容更新建议** 不计入本次审计；下方仅列出文档中其它建议项。

| 功能 | 后端 | Superset 仪表盘 | 埋点 SDK | 总体 | 证据 / 备注 |
|---|---|---|---|---|---|
| 广告优化建议（付费流量下降等） | ❌ | ❌ | ❌ | ❌ | 未找到任何广告优化建议生成逻辑或表。 |
| 转化优化建议（转化率低于 2% 等） | ❌ | ❌ | ❌ | ❌ | 未找到转化优化建议生成逻辑。 |
| 趋势异常提醒 | ❌ | ❌ | ❌ | ❌ | 未找到异常检测/告警逻辑。 |

---

## 8. 权限、集成、日志、性能等

| 功能 | 后端/部署 | 总体 | 证据 / 备注 |
|---|---|---|---|
| 单点登录（SSO：Payload JWT → Superset） | ✅ | ✅ | `docker/superset/custom_security.py` 读取 `payload-token` Cookie、校验 JWT、查询 Payload 用户角色并同步到 Superset；`docker/superset/superset_config.py` 注册 `PayloadCMSSecurityManager` 与 `FLASK_APP_MUTATOR`。 |
| CMS 导航入口“数据分析” | ✅ | ✅ | `payload-cms/src/components/admin/CustomNav.tsx` 通过 `ExternalNavItem` 链接到 `NEXT_PUBLIC_CDP_DASHBOARD_URL`；翻译 key `cdpDashboard` 在 `payload-cms/src/i18n/admin-labels.ts` / `custom-translations.ts` 中定义。 |
| 权限控制（CDP API + Superset 角色映射） | ✅ | ✅ | CDP API：`cdp/src/middleware.ts` / `cdp/src/lib/auth.ts` 校验 `payload-token` 并限制 `admin/editor/analytics` 角色；Superset：`custom_security.py` 中 `PAYLOAD_SSO_ALLOWED_ROLES`、`role_mapping`。 |
| 日志与审计 | ⚠️ | ⚠️ | ETL 运行日志表 `etl_logs` 已实现；IP 匿名化（GDPR）已在 `cdp/src/app/api/analytics/track/route.ts` 实现。但缺少数据导出、Superset 登录映射等关键操作的独立审计日志。 |
| 部署配置（本地 Docker / 生产） | ⚠️ | ⚠️ | 本地：`docker-compose.yml` 已包含 `superset`/`cdp`/`cdp-scheduler`；`cdp/vercel.json` 配置了每日 03:00 ETL cron；`cdp/.env.example` 提供环境变量模板。生产基础设施（ECS/K8s/ALB）未在 CDP 目录内提交可运行配置。 |
| 扩展与性能 | ⚠️ | ⚠️ | ETL 作为独立任务运行，Superset 可独立扩展，已在文档中描述；但代码层未提供自动扩缩容、查询缓存、限流等具体实现。 |

---

## 9. 测试覆盖情况

### 已存在的测试文件

| 文件 | 覆盖范围 |
|---|---|
| `cdp/src/jobs/__tests__/keywords.test.ts` | 搜索引擎识别、referrer 关键词提取、`buildSearchKeywords` 聚合 |
| `cdp/src/lib/__tests__/csv.test.ts` | `toCsv` 序列化与转义 |
| `cdp/src/lib/__tests__/ip.test.ts` | `getClientIp`、`anonymizeIp`、`isPrivateIp` |

### 主要测试缺口

- **ETL 逻辑**：`calculateSummary`、`calculateTrends`、`buildVisitorPaths`、`buildPathInsights` 等核心计算无单元测试。
- **API 路由**：`/api/analytics/track`、`/api/analytics/summary`、`/api/analytics/export`、`/api/health` 无集成测试。
- **权限与认证**：`cdp/src/lib/auth.ts`、`cdp/src/middleware.ts` 未测试 JWT 校验、角色拒绝、ETL_API_KEY 分支。
- **查询层**：`cdp/src/lib/analytics-queries.ts` 中的 `getTrafficSummary`、`getVisitorPaths`、`getPathInsights` 等未测试。
- **Superset 初始化**：`docker/superset/scripts/init_cdp_dashboards.py` 未测试数据库/数据集/图表/仪表盘创建逻辑。
- **埋点 SDK**：`web/lib/analytics.ts` 未测试会话管理、渠道判定、事件上报。

---

## 10. 代码质量与实现细节备注

1. **埋点 SDK 双份实现**：`web/lib/analytics.ts` 是当前实际使用的 SDK，`web/lib/cdp/tracker.ts` + `web/lib/cdp/types.ts` 与前者高度重复且未见被引用，属于潜在死代码/维护负担。
2. **转化事件定义不一致**：文档将“表单提交、聊天点击、WhatsApp 点击、Email 点击”均视为转化；但 SDK 仅自动发送 `form_submit`，聊天/WhatsApp/Email 点击只会发送通用 `click` 事件，ETL 的 `conversions` 字段要求 `eventType === 'conversion'`。需要前端显式调用 `trackEvent('conversion')` 或扩展 SDK 自动识别这些元素。
3. **跳出率算法简化**：ETL 以“会话中访问的不同页面数 `<=1`”作为跳出，未体现文档中“短时间内离开”和“未加载完整网页”的语义。
4. **Superset 仪表盘覆盖不足**：`init_cdp_dashboards.py` 仅创建了 5 个图表，距离文档要求的“流量总览、渠道分析、页面路径、转化漏斗、设备分布”等仪表盘仍有差距。
5. **关键词能力**：`cdp/src/jobs/keywords.ts` 已能从 `utm_term` 和 organic referrer 提取关键词并写入 `search_keywords` 表，但因属于 SEO 优化建议章节，本次未计入功能统计。

---

## 11. 结论与建议

1. **补齐转化与线索追踪**：在 SDK 中自动识别 WhatsApp/Email/聊天按钮并发送 `conversion` / `lead` 事件，或在业务组件中显式调用 `trackEvent`；同时新增 `form_submissions / sessions` 的表单转化率指标。
2. **扩展 Superset 默认仪表盘**：补充 UV、平均访问时长、入口页/退出页、浏览器/国家分布、渠道跳出率、转化漏斗等图表，使运营人员无需手写 SQL 即可查看文档定义的全部指标。
3. **增加自动化测试**：优先为 ETL 计算逻辑、API 路由权限与响应、Superset 初始化脚本添加单元/集成测试。
4. **清理重复 SDK**：评估是否移除 `web/lib/cdp/tracker.ts`，统一使用 `web/lib/analytics.ts`。
5. **优化建议模块**：广告、转化、趋势异常建议目前为空，若后续需要，应设计规则引擎或调用 LLM 生成并落地到 `optimization_suggestions` 表。
